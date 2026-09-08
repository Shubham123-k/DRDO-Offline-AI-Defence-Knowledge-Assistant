import os
from pathlib import Path

from ollama import Client


VISION_MODEL = os.getenv("OLLAMA_VISION_MODEL") or os.getenv("OLLAMA_MODEL", "gemma4:e4b")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
VISION_TIMEOUT = float(os.getenv("OLLAMA_VISION_TIMEOUT", "120"))
VISION_ENABLED = os.getenv("OLLAMA_VISION_ENABLED", "true").strip().lower() in {
    "1", "true", "yes", "on"
}

client = Client(
    host=OLLAMA_BASE_URL,
    timeout=VISION_TIMEOUT,
)


def analyze_image(image_path: str | Path, page_number: int, ocr_text: str = "") -> str:
    """Analyze one PDF page with the local Ollama multimodal model.

    A hard client timeout prevents one slow Vision request from keeping the
    entire document upload open indefinitely. OCR text remains available even
    when Vision times out.
    """
    if not VISION_ENABLED:
        print(f"VISION: disabled; skipping page {page_number}")
        return ""

    image_path = Path(image_path).resolve()
    ocr_hint = ocr_text[:4000] if ocr_text else "No reliable OCR text was extracted."

    prompt = f"""
You are analyzing page {page_number} of a technical/defence document.

Describe only information visibly supported by the image. Focus on:
- diagrams, figures, equipment, components, labels and relationships;
- tables, charts, symbols, arrows and flow directions;
- visible text OCR may have missed;
- technical structure and spatial relationships.

Do not guess hidden values, specifications, identities, locations, or meanings.
If something is unreadable, say so. Return a concise, information-dense
description suitable for a private retrieval knowledge base.

OCR text from this page:
{ocr_hint}
""".strip()

    print(f"VISION: page {page_number} started")

    response = client.chat(
        model=VISION_MODEL,
        messages=[
            {
                "role": "user",
                "content": prompt,
                "images": [str(image_path)],
            }
        ],
        stream=False,
        options={
            "temperature": 0.1,
            "num_ctx": 4096,
            "num_predict": 350,
        },
    )

    content = getattr(response, "message", None)
    if content is not None:
        content = getattr(content, "content", "")
    else:
        content = response.get("message", {}).get("content", "")

    result = str(content or "").strip()
    print(f"VISION: page {page_number} completed ({len(result)} chars)")
    return result
