import os
import fitz  # PyMuPDF
import numpy as np
import cv2
from PIL import Image
import io

def preprocess_pdf(pdf_path, output_dir=None, crop_margin=100, threshold_value=200):
    """
    Preprocess PDF pages to improve OCR accuracy:
    1. Skip unwanted pages
    2. Crop margins (left on even pages, right on odd pages)
    3. Apply threshold to remove light elements
    4. Attempt auto-alignment based on content
    
    Args:
        pdf_path: Path to the PDF file
        output_dir: Directory to save processed images (if None, uses temp files)
        crop_margin: Width in pixels to crop from sides
        threshold_value: Brightness threshold (0-255, higher means more aggressive)
    
    Returns:
        List of paths to processed page images
    """
    if output_dir is None:
        output_dir = os.path.join(os.path.dirname(pdf_path), '.processed')
    
    os.makedirs(output_dir, exist_ok=True)
    
    # Pages to skip (first 6 plus specific pages after accounting for the 6)
    skip_pages = list(range(6))  # First 6 pages
    specific_skips = [11, 15, 20, 39, 77, 93, 113, 157, 177, 
                      191, 233, 289, 305, 308, 309, 323, 339, 
                      342, 343, 367, 383]
    skip_pages.extend([p + 6 for p in specific_skips])  # Adjust for first 6 pages
    
    # Open the PDF
    doc = fitz.open(pdf_path)
    processed_paths = []
    
    print(f"Processing PDF: {pdf_path}")
    print(f"Total pages: {len(doc)}")
    
    # Process each page
    for page_idx in range(len(doc)):
        if page_idx >= 397:  # Skip pages after 397
            continue
            
        if page_idx in skip_pages:
            print(f"Skipping page {page_idx}")
            continue
            
        print(f"Processing page {page_idx}")
        
        # Get the page and render as image
        page = doc[page_idx]
        pix = page.get_pixmap(alpha=False)
        
        # Convert to numpy array for OpenCV processing
        img_bytes = pix.tobytes("png")
        nparr = np.frombuffer(img_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Determine crop side based on even/odd page
        height, width = img.shape[:2]
        if page_idx % 2 == 0:  # Even page - crop from left
            img = img[:, crop_margin:width]
        else:  # Odd page - crop from right
            img = img[:, 0:width-crop_margin]
        
        # Apply threshold to remove light elements
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        _, thresh = cv2.threshold(gray, threshold_value, 255, cv2.THRESH_BINARY_INV)
        
        # Find contours for alignment
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Try to detect page skew and correct it
        if contours:
            # Find the largest contour (likely the main content)
            largest_contour = max(contours, key=cv2.contourArea)
            
            # Find minimum area rectangle around the contour
            rect = cv2.minAreaRect(largest_contour)
            angle = rect[2]
            
            # Adjust angle (OpenCV can return angles in different ways)
            if angle < -45:
                angle = 90 + angle
                
            # Only rotate if the skew is significant but not extreme
            if 0.5 < abs(angle) < 10:
                print(f"  Rotating page by {angle:.2f} degrees")
                (h, w) = img.shape[:2]
                center = (w // 2, h // 2)
                M = cv2.getRotationMatrix2D(center, angle, 1.0)
                img = cv2.warpAffine(img, M, (w, h), 
                                     flags=cv2.INTER_CUBIC, 
                                     borderMode=cv2.BORDER_CONSTANT,
                                     borderValue=(255, 255, 255))
        
        # Save the processed page
        output_path = os.path.join(output_dir, f"page_{page_idx:03d}.png")
        cv2.imwrite(output_path, img)
        processed_paths.append(output_path)
    
    doc.close()
    print(f"Processed {len(processed_paths)} pages")
    return processed_paths

def main():
    # Directories
    in_dir = os.path.join(os.getcwd(), '.in')
    processed_dir = os.path.join(os.getcwd(), '.processed')
    
    # Ensure the output directory exists
    os.makedirs(processed_dir, exist_ok=True)
    
    # List PDF files
    pdf_files = [f for f in os.listdir(in_dir) if f.lower().endswith('.pdf')]
    
    if not pdf_files:
        print(f"No PDF files found in {in_dir}")
        return
    
    for pdf_file in pdf_files:
        input_path = os.path.join(in_dir, pdf_file)
        pdf_name = os.path.splitext(pdf_file)[0]
        pdf_output_dir = os.path.join(processed_dir, pdf_name)
        
        # Process the PDF
        print(f"Preprocessing: {pdf_file}")
        processed_paths = preprocess_pdf(
            input_path, 
            output_dir=pdf_output_dir, 
            crop_margin=100,  # Adjust based on your PDF margins
            threshold_value=200  # Adjust based on your PDF brightness
        )
        
        print(f"Finished preprocessing. {len(processed_paths)} pages saved to '{pdf_output_dir}'")

if __name__ == "__main__":
    main()