from sqlalchemy.orm import Session
from models.chat_message import ChatMessage


def save_message(
    db: Session,
    user_id: int,
    role: str,
    content: str,
):
    message = ChatMessage(
        user_id=user_id,
        role=role,
        content=content,
    )

    db.add(message)
    db.commit()


def get_recent_messages(
    db: Session,
    user_id: int,
    limit: int = 6,
):
    return (
        db.query(ChatMessage)
        .filter(
            ChatMessage.user_id == user_id
        )
        .order_by(
            ChatMessage.created_at.desc()
        )
        .limit(limit)
        .all()
    )