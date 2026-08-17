from datetime import datetime, timezone
from sqlalchemy.orm import Session

from models.conversation import Conversation
from models.message import Message

from services.rag_service import ask_question


def process_question(
    db: Session,
    conversation_id: int,
    question: str,
    clearance: str,
):
    conversation = (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id,
        )
        .first()
    )

    if conversation is None:
        raise ValueError(
            "Conversation not found."
        )

    result = ask_question(
        question=question,
        clearance=clearance,
    )

    assistant_message = Message(
        conversation_id=conversation_id,
        role="assistant",
        content=result["answer"],
    )

    db.add(assistant_message)

    conversation.updated_at = datetime.now(
        timezone.utc
    )

    db.commit()
    db.refresh(assistant_message)

    return {
        "answer": result["answer"],
        "sources": result["sources"],
    }