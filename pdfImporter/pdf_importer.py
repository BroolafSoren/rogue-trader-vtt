import sys
import os
import json
import glob

import fitz  # PyMuPDF
import PyPDF2
import easyocr
import cv2


def extract_text_from_image(image_path, reader):
    """Extract text from a preprocessed image using OCR."""
    img = cv2.imread(image_path)
    ocr_result = reader.readtext(img, detail=0)
    return "\n".join(ocr_result).strip()


def extract_text_from_preprocessed(preprocessed_dir, use_original_pdf=False, pdf_path=None):
    """
    Extract text from preprocessed images instead of directly from PDF.
    
    Args:
        preprocessed_dir: Directory containing preprocessed page images
        use_original_pdf: Whether to attempt extracting from original PDF first
        pdf_path: Path to the original PDF if use_original_pdf is True
    """
    reader = easyocr.Reader(['en'])  # Adjust languages as needed
    
    # Get the base filename
    dirname = os.path.basename(preprocessed_dir)
    
    # Prepare the output data structure
    extracted_data = {
        "filename": f"{dirname}.pdf",
        "pages": []
    }
    
    # Get all preprocessed images in numerical order
    image_paths = sorted(glob.glob(os.path.join(preprocessed_dir, "page_*.png")))
    
    if not image_paths:
        print(f"No preprocessed images found in {preprocessed_dir}")
        return extracted_data
    
    # Create page number mapping
    # First, get all page numbers from filenames
    page_numbers = []
    for img_path in image_paths:
        filename = os.path.basename(img_path)
        try:
            page_num = int(filename.split('_')[1].split('.')[0])
            page_numbers.append(page_num)
        except (ValueError, IndexError):
            # If parsing fails, use sequential numbering
            page_num = len(page_numbers)
            page_numbers.append(page_num)
    
    # Process each image
    for i, img_path in enumerate(image_paths):
        page_index = page_numbers[i]
        print(f"OCR processing image {i+1}/{len(image_paths)}: {os.path.basename(img_path)}")
        
        page_text = ""
        
        # Try to extract from original PDF if requested
        if use_original_pdf and pdf_path:
            try:
                pdf_file = open(pdf_path, 'rb')
                pdf_reader = PyPDF2.PdfReader(pdf_file)
                
                if page_index < len(pdf_reader.pages):
                    page_text = pdf_reader.pages[page_index].extract_text() or ""
                    page_text = page_text.strip()
                    pdf_file.close()
                    
                    if len(page_text) >= 20:
                        print(f"  Using text from original PDF for page {page_index}")
            except Exception as e:
                print(f"  Error extracting from PDF: {str(e)}")
                if 'pdf_file' in locals():
                    pdf_file.close()
        
        # If no text from PDF or it's too short, use OCR
        if len(page_text) < 20:
            print(f"  Performing OCR on page {page_index}")
            page_text = extract_text_from_image(img_path, reader)
        
        extracted_data["pages"].append({
            "pageIndex": page_index,
            "text": page_text
        })
    
    return extracted_data


def extract_text_as_json(pdf_path: str) -> dict:
    """
    Reads the PDF page-by-page. For each page:
      1) Attempt to extract text with PyPDF2 (for digital text).
      2) If minimal text is found, use EasyOCR to perform OCR on that page.
    Returns a dict with structure:
      {
        "filename": <PDF filename>,
        "pages": [
          {"pageIndex": 0, "text": <extracted text>},
          {"pageIndex": 1, "text": <extracted text>},
          ...
        ]
      }
    """
    # Check if preprocessed images exist
    pdf_name = os.path.splitext(os.path.basename(pdf_path))[0]
    processed_dir = os.path.join(os.path.dirname(os.path.dirname(pdf_path)), '.processed', pdf_name)
    
    if os.path.exists(processed_dir):
        print(f"Found preprocessed images for {pdf_name}. Using these instead of raw PDF.")
        return extract_text_from_preprocessed(processed_dir, use_original_pdf=True, pdf_path=pdf_path)
    
    # If no preprocessed images, use the original method
    print(f"No preprocessed images found for {pdf_name}. Processing raw PDF.")
    
    # Initialize PDF reading
    pdf_file = open(pdf_path, 'rb')
    pdf_reader = PyPDF2.PdfReader(pdf_file)
    doc = fitz.open(pdf_path)
    reader = easyocr.Reader(['en'])  # Adjust languages as needed

    # Prepare the output data structure
    extracted_data = {
        "filename": os.path.basename(pdf_path),
        "pages": []
    }

    num_pages = len(pdf_reader.pages)
    for page_index in range(num_pages):
        # Skip unwanted pages
        if page_index < 6 or page_index >= 397:
            continue
            
        # Skip specific pages (adjusted for already skipping 6)
        specific_skips = [11, 15, 20, 39, 77, 93, 113, 157, 177, 
                          191, 233, 289, 305, 308, 309, 323, 339, 
                          342, 343, 367, 383]
        if (page_index - 6) in specific_skips:
            continue
        
        print(f"Processing page {page_index}")
        
        # Attempt direct text extraction
        page_text = pdf_reader.pages[page_index].extract_text() or ""
        page_text = page_text.strip()

        # If little or no text, do OCR on this page
        if len(page_text) < 20:
            # Convert page to an image
            pix = doc[page_index].get_pixmap()
            img_bytearray = pix.tobytes("png")
            # Perform OCR
            ocr_result = reader.readtext(img_bytearray, detail=0)
            page_text = "\n".join(ocr_result).strip()

        extracted_data["pages"].append({
            "pageIndex": page_index,
            "text": page_text
        })

    pdf_file.close()
    doc.close()

    return extracted_data


def write_json_to_file(output_path: str, data: dict):
    """Writes the given dictionary to a JSON file."""
    with open(output_path, 'w', encoding='utf-8') as out_file:
        json.dump(data, out_file, indent=2, ensure_ascii=False)


def main():
    # Directories to scan for input PDFs and place output JSON files
    in_dir = os.path.join(os.getcwd(), '.in')
    out_dir = os.path.join(os.getcwd(), '.out')

    # Ensure the output directory exists
    os.makedirs(out_dir, exist_ok=True)

    # List the files in the ".in" directory
    files_in_dir = os.listdir(in_dir)

    # Filter for PDFs
    pdf_files = [f for f in files_in_dir if f.lower().endswith('.pdf')]

    if not pdf_files:
        print(f"No PDF files found in {in_dir}")
        sys.exit(0)

    for pdf_file in pdf_files:
        input_path = os.path.join(in_dir, pdf_file)
        # Replace ".pdf" with ".json" for the output filename
        output_file = os.path.splitext(pdf_file)[0] + ".json"
        output_path = os.path.join(out_dir, output_file)

        print(f"Processing: {pdf_file}")
        extracted_data = extract_text_as_json(input_path)
        write_json_to_file(output_path, extracted_data)
        print(f"Finished. Output written to '{output_path}'.")


if __name__ == "__main__":
    main()