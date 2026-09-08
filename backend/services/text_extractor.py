import os
import fitz
from docx import Document
import pandas as pd


def extract_pdf(path: str) -> str:
    text = ""

    pdf = fitz.open(path)

    try:
        for page in pdf:
            text += page.get_text()
            text += "\n"
    finally:
        pdf.close()

    return text


def extract_docx(path: str) -> str:
    document = Document(path)

    text_parts = []

    for paragraph in document.paragraphs:
        if paragraph.text.strip():
            text_parts.append(paragraph.text)

    return "\n".join(text_parts)


def extract_txt(path: str) -> str:
    with open(
        path,
        "r",
        encoding="utf-8",
        errors="ignore",
    ) as file:
        return file.read()


def extract_excel(path: str) -> str:
    excel = pd.read_excel(
        path,
        sheet_name=None,
    )

    text_parts = []

    for sheet_name, dataframe in excel.items():

        text_parts.append(
            f"Sheet: {sheet_name}"
        )

        text_parts.append(
            dataframe.to_string(index=False)
        )

    return "\n\n".join(text_parts)


def extract_text(path: str) -> str:

    extension = os.path.splitext(
        path
    )[1].lower()

    if extension == ".pdf":
        return extract_pdf(path)

    if extension == ".docx":
        return extract_docx(path)

    if extension == ".txt":
        return extract_txt(path)

    if extension in [".xls", ".xlsx"]:
        return extract_excel(path)

    raise ValueError(
        f"Unsupported file type: {extension}"
    )

def extract_pages(path: str):
    """Extract PDF text while preserving page numbers."""
    extension = os.path.splitext(path)[1].lower()
    if extension != ".pdf":
        text = extract_text(path)
        return [{"page": 1, "text": text}] if text.strip() else []

    pages = []
    pdf = fitz.open(path)
    try:
        for index, page in enumerate(pdf):
            pages.append({
                "page": index + 1,
                "text": page.get_text("text") or "",
            })
    finally:
        pdf.close()
    return pages

