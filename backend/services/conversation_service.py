from sqlalchemy.orm import Session
from models.conversation import Conversation


def create_conversation(
    db: Session,
    user_id: int,
    title: str = "New Chat",
):
    conversation = Conversation(
        user_id=user_id,
        title=title,
    )

    db.add(conversation)
    db.commit()
    db.refresh(conversation)

    return conversation


def get_conversations(
    db: Session,
    user_id: int,
):
    return (
        db.query(Conversation)
        .filter(
            Conversation.user_id == user_id
        )
        .order_by(
            Conversation.pinned.desc(),
            Conversation.updated_at.desc(),
        )
        .all()
    )


def rename_conversation(
    db: Session,
    conversation_id: int,
    title: str,
):
    conversation = (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id
        )
        .first()
    )

    if conversation is None:
        return None

    conversation.title = title

    db.commit()
    db.refresh(conversation)

    return conversation


def delete_conversation(
    db: Session,
    conversation_id: int,
):
    conversation = (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id
        )
        .first()
    )

    if conversation is None:
        return False

    db.delete(conversation)

    db.commit()

    return True


def toggle_pin(
    db: Session,
    conversation_id: int,
):
    conversation = (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id
        )
        .first()
    )

    if conversation is None:
        return None

    conversation.pinned = (
        not conversation.pinned
    )

    db.commit()
    db.refresh(conversation)

    return conversation