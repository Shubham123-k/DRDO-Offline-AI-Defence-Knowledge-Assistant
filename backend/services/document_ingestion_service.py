import tempfile
from pathlib import Path

from services.text_extractor import extract_pages, extract_text
from services.text_splitter import split_pages, split_text
from services.embedding_service import embed_documents
from services.chroma_service import add_chunks
from services.image_extractor import extract_pdf_images, write_temp_image
from services.ocr_service import extract_ocr
from services.vision_service import analyze_image
from services.image_ingestion_service import ingest_image, SUPPORTED_IMAGE_EXTENSIONS


def _ingest_text_chunks(chunks, document_id, filename, classification, uploaded_by, extra_metadata=None):
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
    if extra_metadata:
        metadata.update(extra_metadata)

    add_chunks(chunks=chunks, embeddings=embeddings, metadata=metadata)
    return len(chunks)


def _analyze_visual_items(image_items, temp_path):
    page_visuals = {}

    for index, item in enumerate(image_items):
        page = item["page"]
        print(
            f"VISUAL: processing page {page} "
            f"({index + 1}/{len(image_items)})"
        )

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
            print(f"MOONDREAM: page {page} skipped after timeout/error: {exc}")
            vision_text = ""

        if ocr_text or vision_text:
            page_visuals.setdefault(page, []).append(
                {
                    "source": item["source"],
                    "ocr": ocr_text,
                    "vision": vision_text,
                }
            )

    return page_visuals


def ingest_pdf_multimodal(
    file_path: str,
    document_id: int,
    filename: str,
    classification: str,
    uploaded_by: int,
):
    """Ingest a PDF as original text + Tesseract OCR + Moondream visual knowledge."""
    print(f"PDF: extracting text from {filename}")
    pages = extract_pages(file_path)
    image_items = extract_pdf_images(file_path)
    print(f"PDF: {len(pages)} pages, {len(image_items)} visual pages queued")

    with tempfile.TemporaryDirectory(prefix="drdo_vision_") as temp_dir:
        page_visuals = _analyze_visual_items(image_items, Path(temp_dir))

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
                parts.append("Visual analysis by Moondream:\n" + visual["vision"])

        combined = "\n\n".join(parts).strip()
        if combined:
            combined_pages.append({"page": page_number, "text": combined})

    if not combined_pages and page_visuals:
        combined_pages = [
            {
                "page": page,
                "text": "\n\n".join(
                    filter(
                        None,
                        [v.get("ocr", "") for v in visuals]
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
        extra_metadata={
            "content_type": "pdf_multimodal",
            "source": "text+tesseract+moondream",
        },
    )

    print(f"PDF: indexing complete for {filename}")

    return {
        "pages": len(pages),
        "visual_items": len(image_items),
        "chunks": chunk_count,
        "multimodal": True,
    }


def _extract_docx_images(file_path: str):
    """Extract embedded DOCX raster images from word/media."""
    import zipfile

    items = []
    with zipfile.ZipFile(file_path, "r") as archive:
        for name in archive.namelist():
            if not name.startswith("word/media/"):
                continue
            extension = Path(name).suffix.lower()
            if extension not in SUPPORTED_IMAGE_EXTENSIONS:
                continue
            items.append(
                {
                    "name": Path(name).name,
                    "extension": extension,
                    "image_bytes": archive.read(name),
                    "source": name,
                }
            )
    return items


def ingest_docx_multimodal(
    file_path: str,
    document_id: int,
    filename: str,
    classification: str,
    uploaded_by: int,
):
    """Ingest DOCX text plus embedded images."""
    print(f"DOCX: extracting text from {filename}")
    text = extract_text(file_path)
    image_items = _extract_docx_images(file_path)
    print(f"DOCX: found {len(image_items)} embedded images")

    visual_parts = []
    with tempfile.TemporaryDirectory(prefix="drdo_docx_vision_") as temp_dir:
        temp_path = Path(temp_dir)
        for index, item in enumerate(image_items):
            source_path = temp_path / f"image_{index}{item['extension']}"
            source_path.write_bytes(item["image_bytes"])

            # Reuse the same normalization/analysis path by importing locally
            # to avoid a second copy of the image processing implementation.
            from services.image_ingestion_service import _prepare_image
            normalized = _prepare_image(source_path, temp_path / f"normalized_{index}.png")

            ocr_text = extract_ocr(normalized)
            try:
                visual_text = analyze_image(
                    image_path=normalized,
                    page_number=f"embedded image {index + 1}",
                    ocr_text=ocr_text,
                )
            except Exception as exc:
                print(f"MOONDREAM: DOCX image {index + 1} skipped: {exc}")
                visual_text = ""

            visual_parts.append(
                {
                    "name": item["name"],
                    "ocr": ocr_text,
                    "vision": visual_text,
                }
            )

    parts = []
    if text.strip():
        parts.append("Extracted DOCX text:\n" + text.strip())

    for index, visual in enumerate(visual_parts, start=1):
        parts.append(f"Embedded image {index}: {visual['name']}")
        if visual["ocr"]:
            parts.append("OCR text from embedded image:\n" + visual["ocr"])
        if visual["vision"]:
            parts.append("Visual analysis by Moondream:\n" + visual["vision"])

    combined = "\n\n".join(parts).strip()
    if not combined:
        raise ValueError("No readable text or visual information was found in the DOCX.")

    chunks = split_text(combined)
    chunk_records = [{"page": 1, "text": chunk} for chunk in chunks]
    chunk_count = _ingest_text_chunks(
        chunk_records,
        document_id,
        filename,
        classification,
        uploaded_by,
        extra_metadata={
            "content_type": "docx_multimodal",
            "source": "text+tesseract+moondream",
        },
    )

    return {
        "pages": 1,
        "visual_items": len(image_items),
        "chunks": chunk_count,
        "multimodal": bool(image_items),
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

    if extension == ".docx":
        return ingest_docx_multimodal(
            file_path,
            document_id,
            filename,
            classification,
            uploaded_by,
        )

    if extension in SUPPORTED_IMAGE_EXTENSIONS:
        return ingest_image(
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
