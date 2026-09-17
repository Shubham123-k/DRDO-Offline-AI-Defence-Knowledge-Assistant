import os
from pathlib import Path

from ollama import Client


MOONDREAM_MODEL = os.getenv("MOONDREAM_MODEL", "moondream")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://127.0.0.1:11434")
MOONDREAM_TIMEOUT = float(os.getenv("MOONDREAM_TIMEOUT", "120"))
MOONDREAM_ENABLED = os.getenv("MOONDREAM_ENABLED", "true").strip().lower() in {
    "1", "true", "yes", "on"
}

client = Client(
    host=OLLAMA_BASE_URL,
    timeout=MOONDREAM_TIMEOUT,
)


def analyze_image(
    image_path: str | Path,
    page_number: int | str,
    ocr_text: str = "",
) -> str:
    """Analyze an image with the local Moondream vision-language model.

    Moondream is used for visual understanding even when the image contains
    no readable text. OCR is supplied only as an additional hint; it is not
    required for visual analysis.
    """
    if not MOONDREAM_ENABLED:
        print(f"MOONDREAM: disabled; skipping {page_number}")
        return ""

    image_path = Path(image_path).resolve()
    if not image_path.exists():
        raise FileNotFoundError(f"Image not found: {image_path}")

    ocr_hint = ocr_text[:4000] if ocr_text else "No reliable OCR text was extracted."

    prompt = f"""
You are analyzing visual content from a defence/technical knowledge base.
This is image/page {page_number}.

Analyze the image itself. Do NOT require text to be present.
Describe only information that is visibly supported by the image. Focus on:
- objects, equipment, vehicles, people, structures and scene context;
- diagrams, figures, components, labels, arrows and spatial relationships;
- tables, charts and symbols when clearly visible;
- visible text that may help identify or describe the content.

Do not invent specifications, identities, model numbers, locations, capabilities,
measurements or relationships that cannot be clearly observed. If a detail is
unclear or too small to verify, explicitly say it is unclear.

Return a concise, information-dense description suitable for indexing in a
private retrieval-augmented generation knowledge base. Do not discuss this
instruction or the OCR process.

Additional OCR hint, which may be incomplete or empty:
{ocr_hint}
""".strip()

    print(f"MOONDREAM: {page_number} started using {MOONDREAM_MODEL}")

    response = client.chat(
        model=MOONDREAM_MODEL,
        messages=[
            {
                "role": "user",
                "content": prompt,
                "images": [str(image_path)],
            }
        ],
        stream=False,
        options={
            "temperature": 0.0,
            "num_predict": 350,
        },
    )

    content = getattr(response, "message", None)
    if content is not None:
        content = getattr(content, "content", "")
    else:
        content = response.get("message", {}).get("content", "")

    result = str(content or "").strip()
    print(f"MOONDREAM: {page_number} completed ({len(result)} chars)")
    return result
