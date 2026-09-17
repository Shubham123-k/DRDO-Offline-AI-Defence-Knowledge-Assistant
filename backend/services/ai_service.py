from sqlalchemy.orm import Session

from models.conversation import Conversation
from models.message import Message
from services.rag_service import ask_question


def process_question(
    db: Session,
    conversation_id: int,
    question: str,
    clearance: str,
    attachment_document_ids=None,
):
    conversation = (
        db.query(Conversation)
        .filter(Conversation.id == conversation_id)
        .first()
    )

    if conversation is None:
        raise ValueError("Conversation not found.")

    messages = (
        db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.desc())
        .limit(6)
        .all()
    )

    messages.reverse()
    history_parts = []

    for message in messages:
        role = message.role
        role_name = "User" if role == "user" else "Assistant" if role == "assistant" else role.capitalize()
        history_parts.append(f"{role_name}: {message.content}")

    conversation_history = "\n".join(history_parts)

    print(f"AI: Loaded {len(messages)} previous messages.")

    result = ask_question(
        question=question,
        clearance=clearance,
        conversation_history=conversation_history,
        document_ids=attachment_document_ids,
    )

    return {
        "answer": result["answer"],
        "sources": result["sources"],
    }
