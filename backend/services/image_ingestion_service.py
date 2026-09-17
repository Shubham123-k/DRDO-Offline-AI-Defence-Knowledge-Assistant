import tempfile
from pathlib import Path

from PIL import Image, ImageOps

from services.ocr_service import extract_ocr
from services.vision_service import analyze_image
from services.text_splitter import split_text
from services.embedding_service import embed_documents
from services.chroma_service import add_chunks


SUPPORTED_IMAGE_EXTENSIONS = {
    ".jpg", ".jpeg", ".png", ".webp", ".avif", ".bmp",
    ".gif", ".tif", ".tiff",
}


def _prepare_image(source_path: str | Path, output_path: Path) -> Path:
    """Normalize common raster formats to RGB PNG for OCR and Moondream."""
    source_path = Path(source_path)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    with Image.open(source_path) as image:
        # Respect EXIF orientation and make animated images deterministic.
        image = ImageOps.exif_transpose(image)
        if getattr(image, "is_animated", False):
            image.seek(0)

        if image.mode not in ("RGB", "L"):
            image = image.convert("RGB")
        elif image.mode == "L":
            image = image.convert("RGB")

        image.save(output_path, format="PNG", optimize=True)

    return output_path


def ingest_image(
    file_path: str,
    document_id: int,
    filename: str,
    classification: str,
    uploaded_by: int,
):
    """Index one standalone image using Tesseract + Moondream + RAG."""
    extension = Path(file_path).suffix.lower()
    if extension not in SUPPORTED_IMAGE_EXTENSIONS:
        raise ValueError(f"Unsupported image type: {extension}")

    print(f"IMAGE: preparing {filename}")

    with tempfile.TemporaryDirectory(prefix="drdo_image_") as temp_dir:
        normalized_path = _prepare_image(
            file_path,
            Path(temp_dir) / "normalized.png",
        )

        ocr_text = extract_ocr(normalized_path)

        try:
            visual_text = analyze_image(
                image_path=normalized_path,
                page_number="image",
                ocr_text=ocr_text,
            )
        except Exception as exc:
            print(f"MOONDREAM: image skipped after error: {exc}")
            visual_text = ""

    parts = [
        f"Image file: {filename}",
        "Source type: standalone image",
    ]

    if ocr_text:
        parts.append("OCR text from image:\n" + ocr_text)

    if visual_text:
        parts.append("Visual analysis by Moondream:\n" + visual_text)

    combined = "\n\n".join(parts).strip()

    if not ocr_text and not visual_text:
        raise ValueError("No readable text or visual information was produced from the image.")

    chunks = split_text(combined)
    if not chunks:
        raise ValueError("Image knowledge could not be split into RAG chunks.")

    chunk_records = [
        {"page": 1, "text": chunk}
        for chunk in chunks
    ]

    embeddings = embed_documents([item["text"] for item in chunk_records])
    if not embeddings:
        raise ValueError("Failed to generate image embeddings.")

    metadata = {
        "document_id": document_id,
        "filename": filename,
        "classification": classification,
        "uploaded_by": uploaded_by,
        "content_type": "image",
        "source": "tesseract+moondream",
    }

    add_chunks(
        chunks=chunk_records,
        embeddings=embeddings,
        metadata=metadata,
    )

    print(f"IMAGE: indexing complete for {filename} ({len(chunk_records)} chunks)")

    return {
        "pages": 1,
        "visual_items": 1,
        "chunks": len(chunk_records),
        "multimodal": True,
    }
