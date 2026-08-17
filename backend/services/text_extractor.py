import os

import fitz  # PyMuPDF
from docx import Document
import pandas as pd


def extract_pdf_pages(path: str):
    """
    Extract PDF text while preserving page numbers.

    Returns:
        [
            {
                "page": 1,
                "text": "..."
            },
            {
                "page": 2,
                "text": "..."
            }
        ]
    """

    pages = []

    pdf = fitz.open(path)

    try:
        for page_number, page in enumerate(pdf, start=1):
            text = page.get_text("text").strip()

            if text:
                pages.append(
                    {
                        "page": page_number,
                        "text": text,
                    }
                )
    finally:
        pdf.close()

    return pages


def extract_docx_pages(path: str):
    """
    DOCX files do not have reliable PDF-style page boundaries
    without rendering the document.

    Therefore the document is treated as page 1.
    """

    doc = Document(path)

    text_parts = []

    for paragraph in doc.paragraphs:
        if paragraph.text.strip():
            text_parts.append(paragraph.text.strip())

    text = "\n".join(text_parts).strip()

    if not text:
        return []

    return [
        {
            "page": 1,
            "text": text,
        }
    ]


def extract_txt_pages(path: str):
    """
    TXT files are treated as page 1.
    """

    with open(
        path,
        "r",
        encoding="utf-8",
        errors="ignore",
    ) as file:
        text = file.read().strip()

    if not text:
        return []

    return [
        {
            "page": 1,
            "text": text,
        }
    ]


def extract_excel_pages(path: str):
    """
    Excel sheets are represented as separate logical pages.

    Sheet 1 -> page 1
    Sheet 2 -> page 2
    etc.
    """

    excel = pd.read_excel(
        path,
        sheet_name=None,
    )

    pages = []

    for page_number, (sheet_name, dataframe) in enumerate(
        excel.items(),
        start=1,
    ):
        text = dataframe.to_string(
            index=False
        ).strip()

        if text:
            pages.append(
                {
                    "page": page_number,
                    "text": (
                        f"Sheet: {sheet_name}\n\n"
                        f"{text}"
                    ),
                }
            )

    return pages


def extract_pages(path: str):
    """
    Main page-aware extraction function.
    """

    extension = os.path.splitext(
        path
    )[1].lower()

    if extension == ".pdf":
        return extract_pdf_pages(path)

    if extension == ".docx":
        return extract_docx_pages(path)

    if extension == ".txt":
        return extract_txt_pages(path)

    if extension in [".xls", ".xlsx"]:
        return extract_excel_pages(path)

    return []