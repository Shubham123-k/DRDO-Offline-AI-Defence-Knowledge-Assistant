import os
import shutil
from pathlib import Path

from PIL import Image
import pytesseract


def _configure_tesseract():
    """
    Locate Tesseract automatically.

    Priority:
    1. TESSERACT_CMD from .env/environment
    2. tesseract available in PATH
    3. Common Windows installation locations
    """

    configured = os.getenv("TESSERACT_CMD", "").strip()

    if configured:
        configured_path = Path(configured.strip('"')).expanduser()

        if configured_path.exists():
            pytesseract.pytesseract.tesseract_cmd = str(configured_path)
            print(f"OCR: using configured Tesseract: {configured_path}")
            return str(configured_path)

        print(
            f"OCR: TESSERACT_CMD was configured but does not exist: "
            f"{configured_path}"
        )

    # Check PATH
    path_tesseract = shutil.which("tesseract")

    if path_tesseract:
        pytesseract.pytesseract.tesseract_cmd = path_tesseract
        print(f"OCR: found Tesseract in PATH: {path_tesseract}")
        return path_tesseract

    # Common Windows installation locations
    possible_paths = [
        Path(r"C:\Program Files\Tesseract-OCR\tesseract.exe"),
        Path(r"C:\Program Files (x86)\Tesseract-OCR\tesseract.exe"),
        Path(os.getenv("LOCALAPPDATA", "")) / "Programs" / "Tesseract-OCR" / "tesseract.exe",
    ]

    for path in possible_paths:
        if path.exists():
            pytesseract.pytesseract.tesseract_cmd = str(path)
            print(f"OCR: found Tesseract: {path}")
            return str(path)

    print(
        "OCR: Tesseract was not found. "
        "Install Tesseract or set TESSERACT_CMD."
    )

    return None

TESSERACT_PATH = _configure_tesseract()


def extract_ocr(image_path: str | Path) -> str:
    """Run local Tesseract OCR. OCR failure is non-fatal."""

    if not TESSERACT_PATH:
        return ""

    try:
        with Image.open(image_path) as image:
            if image.mode not in ("RGB", "L"):
                image = image.convert("RGB")

            text = pytesseract.image_to_string(image)

        result = text.strip()
        print(f"OCR: completed ({len(result)} chars)")

        return result

    except Exception as exc:
        print(f"OCR: failed: {exc}")
        return ""