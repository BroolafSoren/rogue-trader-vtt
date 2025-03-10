import sys
import os
import json

import fitz  # PyMuPDF
import PyPDF2
import easyocr


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

    # List the files in the “.in” directory
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