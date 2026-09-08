import shutil
import tempfile
from pathlib import Path

from services.text_extractor import extract_pages, extract_text
from services.text_splitter import split_pages, split_text
from services.embedding_service import embed_documents
from services.chroma_service import add_chunks
from services.image_extractor import extract_pdf_images, write_temp_image
from services.ocr_service import extract_ocr
from services.vision_service import analyze_image


def _ingest_text_chunks(chunks, document_id, filename, classification, uploaded_by):
    if not chunks:
        return 0

    texts = [chunk["text"] for chunk in chunks]
    embeddings = embed_documents(texts)
    if not embeddings:
        raise ValueError("Failed to generate document embeddings.")

    metadata = {
        "document_id": document_id,
        "filename": filename,
        "classification": classification,
        "uploaded_by": uploaded_by,
    }
    add_chunks(chunks=chunks, embeddings=embeddings, metadata=metadata)
    return len(chunks)


def ingest_pdf_multimodal(
    file_path: str,
    document_id: int,
    filename: str,
    classification: str,
    uploaded_by: int,
):
    """Ingest a PDF as text + OCR + visual knowledge."""
    print(f"PDF: extracting text from {filename}")
    pages = extract_pages(file_path)
    image_items = extract_pdf_images(file_path)
    print(f"PDF: {len(pages)} pages, {len(image_items)} visual pages queued")

    page_visuals = {}
    with tempfile.TemporaryDirectory(prefix="drdo_vision_") as temp_dir:
        temp_path = Path(temp_dir)
        for index, item in enumerate(image_items):
            page = item["page"]
            print(f"PDF: processing visual page {page} ({index + 1}/{len(image_items)})")
            image_path = write_temp_image(
                item["image_bytes"],
                temp_path,
                f"p{page}.png",
            )

            ocr_text = extract_ocr(image_path)
            try:
                vision_text = analyze_image(
                    image_path=image_path,
                    page_number=page,
                    ocr_text=ocr_text,
                )
            except Exception as exc:
                print(f"VISION: page {page} skipped after timeout/error: {exc}")
                vision_text = ""

            if ocr_text or vision_text:
                page_visuals.setdefault(page, []).append(
                    {
                        "source": item["source"],
                        "ocr": ocr_text,
                        "vision": vision_text,
                    }
                )

    combined_pages = []
    for page_data in pages:
        page_number = page_data["page"]
        parts = []
        text = page_data.get("text", "").strip()
        if text:
            parts.append("Extracted page text:\n" + text)

        visuals = page_visuals.get(page_number, [])
        for visual in visuals:
            if visual["ocr"]:
                parts.append("OCR text from page image:\n" + visual["ocr"])
            if visual["vision"]:
                parts.append("Visual analysis of page/figure:\n" + visual["vision"])

        combined = "\n\n".join(parts).strip()
        if combined:
            combined_pages.append({"page": page_number, "text": combined})

    # A PDF may be image-only, so create pages from visual content if PyMuPDF's
    # text extractor returned no page entries with useful content.
    if not combined_pages and page_visuals:
        combined_pages = [
            {
                "page": page,
                "text": "\n\n".join(
                    filter(
                        None,
                        [
                            v.get("ocr", "")
                            for v in visuals
                        ]
                        + [v.get("vision", "") for v in visuals],
                    )
                ),
            }
            for page, visuals in sorted(page_visuals.items())
        ]
        combined_pages = [p for p in combined_pages if p["text"].strip()]

    if not combined_pages:
        raise ValueError("No readable text, OCR text, or visual information was found in the PDF.")

    print(f"PDF: creating chunks from {len(combined_pages)} pages")
    chunks = split_pages(combined_pages)
    print(f"PDF: generating embeddings for {len(chunks)} chunks")
    chunk_count = _ingest_text_chunks(
        chunks,
        document_id,
        filename,
        classification,
        uploaded_by,
    )

    print(f"PDF: indexing complete for {filename}")

    return {
        "pages": len(pages),
        "visual_items": len(image_items),
        "chunks": chunk_count,
        "multimodal": True,
    }


def ingest_document(
    file_path: str,
    document_id: int,
    filename: str,
    classification: str,
    uploaded_by: int,
):
    extension = Path(file_path).suffix.lower()

    if extension == ".pdf":
        return ingest_pdf_multimodal(
            file_path,
            document_id,
            filename,
            classification,
            uploaded_by,
        )

    text = extract_text(file_path)
    if not text or not text.strip():
        raise ValueError("No readable text was found in the document.")

    chunks = split_text(text)
    chunk_count = _ingest_text_chunks(
        [{"page": 1, "text": chunk} for chunk in chunks],
        document_id,
        filename,
        classification,
        uploaded_by,
    )

    return {
        "pages": 1,
        "visual_items": 0,
        "chunks": chunk_count,
        "multimodal": False,
    }
