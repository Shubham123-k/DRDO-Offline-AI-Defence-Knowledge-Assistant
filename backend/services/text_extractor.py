import os

import fitz  # PyMuPDF
from docx import Document
import pandas as pd


def extract_pdf(path: str):
    text = ""

    pdf = fitz.open(path)

    for page in pdf:
        text += page.get_text()

    pdf.close()

    return text


def extract_docx(path: str):
    doc = Document(path)

    text = ""

    for paragraph in doc.paragraphs:
        text += paragraph.text + "\n"

    return text


def extract_txt(path: str):
    with open(
        path,
        "r",
        encoding="utf-8",
        errors="ignore",
    ) as file:
        return file.read()


def extract_excel(path: str):
    excel = pd.read_excel(
        path,
        sheet_name=None,
    )

    text = ""

    for sheet in excel.values():
        text += sheet.to_string(index=False)

    return text


def extract_text(path: str):

    extension = os.path.splitext(path)[1].lower()

    if extension == ".pdf":
        return extract_pdf(path)

    elif extension == ".docx":
        return extract_docx(path)

    elif extension == ".txt":
        return extract_txt(path)

    elif extension in [".xls", ".xlsx"]:
        return extract_excel(path)

    return ""