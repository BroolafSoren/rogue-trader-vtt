# --- START OF FILE pdf_preprocessor.py ---

import os
import fitz  # PyMuPDF
import numpy as np
import cv2
import time
# import math # No longer needed for V8

def preprocess_pdf(pdf_path, output_dir=None):
    """
    Preprocess PDF pages V8 - DISABLING Skew Correction, Mildest Noise Cleaning.
    Prioritizes avoiding rotation errors and preserving detail (like V5 cleaning).
    Accepts original scan skew and potentially higher background noise.
    """
    if output_dir is None:
        pdf_name = os.path.splitext(os.path.basename(pdf_path))[0]
        script_dir = os.path.dirname(os.path.abspath(__file__))
        # Use provided path structure
        base_output_dir = os.path.join(script_dir, '.processed')
        output_dir = os.path.join(base_output_dir, pdf_name)

    os.makedirs(output_dir, exist_ok=True)

    # Use USER-PROVIDED skip indices directly (0-based assumed)
    skip_pages_set = set(range(6)) # Indices 0-5 (Pages 1-6)
    specific_skips_indices = [
        10, 14, 19, 38, 76, 92, 112, 156, 176,
        190, 232, 288, 304, 307, 308, 322, 338,
        341, 342, 366, 382,
        397
    ]
    skip_pages_set.update(specific_skips_indices)


    # --- Parameters (V8 Strategy) ---
    RENDER_DPI = 300
    # Fixed Crop (Horizontal only - OK)
    FIXED_CROP_HORIZONTAL_PIXELS = 175
    FIXED_CROP_VERTICAL_PIXELS = 0
    # CLAHE (Keep standard values)
    CLAHE_CLIP_LIMIT = 2.0
    CLAHE_GRID_SIZE = (8, 8)
    # Median Blur (Keep light)
    MEDIAN_BLUR_KSIZE = 3
    # Adaptive Thresholding (Mildest C setting from V5)
    ADAPTIVE_THRESH_BLOCK_SIZE = 51
    ADAPTIVE_THRESH_C = 7       # Back to C=7
    # Morphological Operations (Mildest setting from V5: Open=1, Close=0)
    MORPH_KERNEL_SIZE = (3, 3)
    MORPH_OPEN_ITERATIONS = 1 # Back to 1
    MORPH_CLOSE_ITERATIONS = 0# ** Keep CLOSE REMOVED **
    # Skew Correction (** DISABLED **)
    # MIN_SKEW_ANGLE_DETECT = 0.0 # No longer used
    # MAX_SKEW_ANGLE_DETECT = 0.0 # No longer used
    # Content Cropping (Keep V4/V5/V6/V7 logic)
    MIN_CONTOUR_AREA = 500
    HEADER_FOOTER_MARGIN_PERCENT = 0.0
    CROP_MARGIN = 40
    # Page Limits
    MAX_PAGE_INDEX_TO_PROCESS = 400 # Allow processing pages up to index 399 if needed
    # --- End Parameters ---

    doc = fitz.open(pdf_path)
    processed_paths = []
    total_pages_in_pdf = len(doc)

    print(f"Processing PDF: {os.path.basename(pdf_path)} (V8 Strategy - No Skew Correction, Mild Cleaning)")
    print(f"Total pages in PDF: {total_pages_in_pdf}")
    print(f"Saving processed images to: {output_dir}")
    print(f"Skipping pages (0-based index): {sorted(list(skip_pages_set))}")
    print(f"Parameters: ThreshC:{ADAPTIVE_THRESH_C}, MorphOpenIter:{MORPH_OPEN_ITERATIONS}, CloseIter:{MORPH_CLOSE_ITERATIONS}, Skew: DISABLED, CropMargin:{CROP_MARGIN}")

    for page_idx in range(total_pages_in_pdf):
        page_num_for_log = page_idx + 1
        start_time = time.time()

        if page_idx > MAX_PAGE_INDEX_TO_PROCESS:
            break
        if page_idx in skip_pages_set:
            continue

        print(f"-> Processing page {page_num_for_log} (index {page_idx})... ", end='', flush=True)

        # 1. Render page to image & Decode using PPM
        try:
            page = doc[page_idx]
            pix = page.get_pixmap(alpha=False, dpi=RENDER_DPI)
            img_bytes = pix.tobytes("ppm")
            nparr = np.frombuffer(img_bytes, np.uint8)
            img_color_original = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            if img_color_original is None: raise ValueError("Failed to decode PPM image")
        except Exception as e:
            print(f"\n   Error rendering/decoding page {page_num_for_log}: {e}")
            continue

        # 2. Initial Fixed HORIZONTAL Crop
        h_orig, w_orig = img_color_original.shape[:2]
        x1_fixed = FIXED_CROP_HORIZONTAL_PIXELS
        x2_fixed = w_orig - FIXED_CROP_HORIZONTAL_PIXELS
        x1_fixed, x2_fixed = max(0, x1_fixed), min(w_orig, x2_fixed)

        if x1_fixed >= x2_fixed:
             print(f"\n   Warn: Fixed horizontal crop invalid page {page_num_for_log}.")
             horizontally_cropped_image = img_color_original
        else:
            horizontally_cropped_image = img_color_original[:, x1_fixed:x2_fixed]


        # 3. Skew Correction (** DISABLED **)
        # No skew calculation or rotation applied.
        # The image proceeding to content crop is just the horizontally cropped one.
        image_after_skew_handling = horizontally_cropped_image # Pass H-cropped image directly

        # 4. Content-Aware Cropping (Keep V4/V5/V6/V7 logic)
        if image_after_skew_handling.size == 0:
             print(f"\n   Warn: Empty before content crop page {page_num_for_log}.")
             continue

        # --- Prepare image for Content Detection ---
        img_gray_for_crop = cv2.cvtColor(image_after_skew_handling, cv2.COLOR_BGR2GRAY)
        clahe = cv2.createCLAHE(clipLimit=CLAHE_CLIP_LIMIT, tileGridSize=CLAHE_GRID_SIZE)
        img_enhanced_for_crop = clahe.apply(img_gray_for_crop)
        img_blurred_for_crop = cv2.medianBlur(img_enhanced_for_crop, MEDIAN_BLUR_KSIZE) # Mild blur
        # Use mild threshold C
        thresh_for_crop = cv2.adaptiveThreshold(
            img_blurred_for_crop, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY_INV, ADAPTIVE_THRESH_BLOCK_SIZE, ADAPTIVE_THRESH_C
        )
        contours_crop, _ = cv2.findContours(thresh_for_crop, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        final_image_to_process = image_after_skew_handling # Default if no contours found
        h_skew_handled, w_skew_handled = image_after_skew_handling.shape[:2]

        if contours_crop:
            valid_contours = [cnt for cnt in contours_crop if cv2.contourArea(cnt) > MIN_CONTOUR_AREA]
            if valid_contours:
                all_points_crop = np.vstack(valid_contours)
                if all_points_crop.size > 0:
                    try:
                        x, y, w, h = cv2.boundingRect(all_points_crop)
                        x1_content = max(0, x - CROP_MARGIN)
                        y1_content = max(0, y - CROP_MARGIN)
                        x2_content = min(w_skew_handled, x + w + CROP_MARGIN)
                        y2_content = min(h_skew_handled, y + h + CROP_MARGIN)
                        final_image_to_process = image_after_skew_handling[y1_content:y2_content, x1_content:x2_content]
                    except Exception as e:
                         final_image_to_process = image_after_skew_handling

        # 5. Final Processing Pipeline (Mildest Cleaning - like V5)
        if final_image_to_process.size == 0:
             print(f"\n   Warn: Empty before final proc page {page_num_for_log}.")
             continue

        final_gray = cv2.cvtColor(final_image_to_process, cv2.COLOR_BGR2GRAY)
        final_enhanced = final_gray
        # Mild blur
        final_blurred = cv2.medianBlur(final_enhanced, MEDIAN_BLUR_KSIZE)
        # Mild threshold C
        final_thresh = cv2.adaptiveThreshold(
            final_blurred, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY,
            ADAPTIVE_THRESH_BLOCK_SIZE, ADAPTIVE_THRESH_C
        )
        # Mild morphology: Open=1, Close=0
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, MORPH_KERNEL_SIZE)
        final_cleaned = cv2.morphologyEx(final_thresh, cv2.MORPH_OPEN, kernel, iterations=MORPH_OPEN_ITERATIONS)
        # ** MORPH_CLOSE REMOVED **

        # 6. Save Final Image
        output_path = os.path.join(output_dir, f"page_{page_idx:03d}.png")
        try:
            if final_cleaned.shape[0] > 0 and final_cleaned.shape[1] > 0:
                 cv2.imwrite(output_path, final_cleaned)
                 processed_paths.append(output_path)
                 processing_time = time.time() - start_time
                 print(f"Done ({processing_time:.2f}s). Saved: {os.path.basename(output_path)}")
            else:
                 print(f"\n   Error: Final image invalid dimensions page {page_num_for_log}.")
        except Exception as e:
            print(f"\n   Error saving image {output_path}: {e}")


    doc.close()
    print("-" * 30)
    print(f"Finished processing. {len(processed_paths)} pages saved in '{output_dir}'")
    print("-" * 30)
    return processed_paths

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    in_dir = os.path.join(script_dir, '.in')

    if not os.path.isdir(in_dir):
         print(f"Error: Input directory not found: {in_dir}")
         print(f"Please create a '.in' directory in '{script_dir}' and place your PDF(s) there.")
         return

    pdf_files = [f for f in os.listdir(in_dir) if f.lower().endswith('.pdf')]
    if not pdf_files:
        print(f"No PDF files found in {in_dir}")
        return

    for pdf_file in pdf_files:
        input_path = os.path.join(in_dir, pdf_file)
        preprocess_pdf(input_path, output_dir=None)

if __name__ == "__main__":
    main()

# --- END OF FILE pdf_preprocessor.py ---