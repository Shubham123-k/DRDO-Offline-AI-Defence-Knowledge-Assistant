from pathlib import Path
from typing import Dict, List

import fitz

IMAGE_DPI = 110

def extract_pdf_images(pdf_path: str) -> List[Dict]:
    """Return at most ONE rendered image per visually relevant PDF page.

    We intentionally do not send every embedded raster image separately to
    the vision model. A full-page render captures raster images, vector
    diagrams, labels and surrounding context in a single Vision request.
    This avoids dozens of expensive Ollama calls for a single PDF.
    """
    results: List[Dict] = []
    pdf = fitz.open(pdf_path)

    try:
        for page_index, page in enumerate(pdf):
            page_number = page_index + 1
            image_infos = page.get_images(full=True)
            page_text = page.get_text("text").strip()

            # Render only pages that are likely to contain visual information.
            # This includes pages with embedded images and scanned/image-only pages.
            if image_infos or len(page_text) < 40:
                pix = page.get_pixmap(dpi=IMAGE_DPI, alpha=False)
                results.append(
                    {
                        "page": page_number,
                        "kind": "page_render",
                        "image_bytes": pix.tobytes("png"),
                        "source": f"page-{page_number}",
                    }
                )
    finally:
        pdf.close()

    return results

def write_temp_image(image_bytes: bytes, directory: Path, name: str) -> Path:
    directory.mkdir(parents=True, exist_ok=True)
    path = directory / name
    path.write_bytes(image_bytes)
    return path
