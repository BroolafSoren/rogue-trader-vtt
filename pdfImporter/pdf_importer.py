import sys
import os

import fitz
import PyPDF2
import easyocr


def extract_text_from_pdf(pdf_path: str) -> str:
    """
    Tries to extract text from the PDF as-is (for text-based PDFs).
    If that fails or doesn't return anything, falls back to scanning each page with EasyOCR.
    Returns the combined text of all pages.
    """
    text_content = ""

    # 1. Attempt to extract text (handles simple PDF text).
    with open(pdf_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        for page in pdf_reader.pages:
            page_text = page.extract_text()
            if page_text:
                text_content += page_text + "\n"

    # 2. If little or no text was extracted, try OCR each page (for scanned pages).
    if len(text_content.strip()) < 20:
        ocr_text = perform_ocr_on_pdf(pdf_path)
        if ocr_text:
            text_content += ocr_text

    return text_content


def perform_ocr_on_pdf(pdf_path: str) -> str:
    """
    Converts each page of the PDF to an image, then uses EasyOCR to scan it.
    Returns the combined recognized text.
    """
    reader = easyocr.Reader(['en'])  # Add languages as needed
    doc = fitz.open(pdf_path)
    all_text = ""

    for page_index in range(len(doc)):
        page = doc[page_index]
        pix = page.get_pixmap()
        # Convert the page to an image (PNG).
        img_bytearray = pix.tobytes("png")
        # Perform OCR on the image data.
        ocr_result = reader.readtext(img_bytearray, detail=0)
        # Join recognized text lines with newlines.
        all_text += "\n".join(ocr_result) + "\n"

    return all_text


def write_text_to_file(output_path: str, text: str):
    """Writes the given text to a .txt file."""
    with open(output_path, 'w', encoding='utf-8') as out_file:
        out_file.write(text)


def main():
    # Directories to scan for input PDFs and place output text files
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
        # Construct full paths
        input_path = os.path.join(in_dir, pdf_file)
        # Replace ".pdf" with ".txt" for the output filename
        output_file = os.path.splitext(pdf_file)[0] + ".txt"
        output_path = os.path.join(out_dir, output_file)

        # Extract text and write to file
        print(f"Processing: {pdf_file}")
        extracted_text = extract_text_from_pdf(input_path)
        write_text_to_file(output_path, extracted_text)

        print(f"Finished. Output written to '{output_path}'.")


if __name__ == "__main__":
    main()