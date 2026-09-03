from faster_whisper import WhisperModel
import os


MODEL_SIZE = os.getenv(
    "WHISPER_MODEL",
    "large-v3-turbo"
)

DEVICE = os.getenv(
    "WHISPER_DEVICE",
    "cuda"
)

COMPUTE_TYPE = os.getenv(
    "WHISPER_COMPUTE_TYPE",
    "float16"
)


print(
    f"Loading Whisper model: "
    f"{MODEL_SIZE} | "
    f"device={DEVICE} | "
    f"compute_type={COMPUTE_TYPE}"
)


model = WhisperModel(
    MODEL_SIZE,
    device=DEVICE,
    compute_type=COMPUTE_TYPE,
)


def transcribe_audio(
    audio_path: str,
    language: str | None = None,
):
    """
    Transcribe an audio file using the
    locally running Whisper model.
    """

    segments, info = model.transcribe(
        audio_path,
        language=language,
        beam_size=5,
        vad_filter=True,
    )

    text_parts = []

    for segment in segments:
        text = segment.text.strip()

        if text:
            text_parts.append(text)

    text = " ".join(text_parts).strip()

    return {
        "text": text,
        "language": info.language,
        "language_probability": info.language_probability,
    }