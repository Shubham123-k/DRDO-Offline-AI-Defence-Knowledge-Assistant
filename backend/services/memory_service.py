from sqlalchemy.orm import Session
from models.message import Message


def get_recent_messages(
    db: Session,
    conversation_id: int,
    limit: int = 10,
):
    messages = (
        db.query(Message)
        .filter(
            Message.conversation_id == conversation_id
        )
        .order_by(
            Message.created_at.desc()
        )
        .limit(limit)
        .all()
    )

    messages.reverse()
    return messages


def build_history(
    messages,
):
    history = []
    for message in messages:
        role = (
            "User"
            if message.role == "user"
            else "Assistant"
        )
        history.append(
            f"{role}: {message.content}"
        )
    return "\n".join(history)