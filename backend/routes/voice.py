import os
import tempfile

from fastapi import APIRouter, File, HTTPException, UploadFile
from services.voice_service import transcribe_audio


router = APIRouter(
    prefix="/voice",
    tags=["Voice"],
)


@router.post("/transcribe")
async def transcribe_voice(
    audio: UploadFile = File(...),
):
    """
    Receive recorded audio and transcribe it
    using the local Whisper model.
    """

    if not audio:
        raise HTTPException(
            status_code=400,
            detail="No audio file provided.",
        )

    content_type = (
        audio.content_type or ""
    ).lower().split(";")[0].strip()

    allowed_types = {
        "audio/webm",
        "audio/wav",
        "audio/wave",
        "audio/x-wav",
        "audio/mpeg",
        "audio/mp3",
        "audio/ogg",
        "audio/mp4",
        "audio/x-m4a",
    }

    if content_type not in allowed_types:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Unsupported audio format: "
                f"{audio.content_type}"
            ),
        )

    suffix = ".webm"

    if content_type in {
        "audio/wav",
        "audio/wave",
        "audio/x-wav",
    }:
        suffix = ".wav"

    elif content_type in {
        "audio/mpeg",
        "audio/mp3",
    }:
        suffix = ".mp3"

    elif content_type == "audio/ogg":
        suffix = ".ogg"

    elif content_type in {
        "audio/mp4",
        "audio/x-m4a",
    }:
        suffix = ".m4a"

    temporary_path = None

    try:
        audio_data = await audio.read()
        if not audio_data:
            raise HTTPException(
                status_code=400,
                detail="The recorded audio is empty.",
            )

        with tempfile.NamedTemporaryFile(
            delete=False,
            suffix=suffix,
        ) as temp_file:

            temp_file.write(audio_data)

            temporary_path = temp_file.name

        print(
            f"Voice audio received: "
            f"type={audio.content_type}, "
            f"normalized={content_type}, "
            f"size={len(audio_data)} bytes, "
            f"file={temporary_path}"
        )

        result = transcribe_audio(
            temporary_path
        )

        return {
            "text": result["text"],
            "language": result["language"],
            "language_probability": result[
                "language_probability"
            ],
        }

    except HTTPException:
        raise

    except Exception as error:
        print(
            f"Voice transcription error: {error}"
        )

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to transcribe the audio."
            ),
        )

    finally:
        if (
            temporary_path
            and os.path.exists( temporary_path )
        ):
            try:
                os.remove( temporary_path )
            except OSError:
                pass