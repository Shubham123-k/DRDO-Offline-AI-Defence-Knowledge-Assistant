import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.db import get_db
from auth.dependencies import get_current_user

from models.conversation import Conversation
from models.message import Message

from schemas.message import MessageCreate
from schemas.conversation import ConversationCreate, ConversationRename


router = APIRouter(
    prefix="/chat",
    tags=["Chat"],
)


def _parse_attachments(value):
    if not value:
        return []

    try:
        parsed = json.loads(value)
        return parsed if isinstance(parsed, list) else []
    except (TypeError, ValueError):
        return []


@router.post("/new")
def new_chat(
    request: ConversationCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    conversation = Conversation(
        user_id=current_user.id,
        title=request.title,
    )

    db.add(conversation)
    db.commit()
    db.refresh(conversation)

    return {
        "id": conversation.id,
        "title": conversation.title,
        "pinned": conversation.pinned,
        "created_at": conversation.created_at,
    }


@router.get("/")
def get_chats(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    chats = (
        db.query(Conversation)
        .filter(Conversation.user_id == current_user.id)
        .order_by(
            Conversation.pinned.desc(),
            Conversation.updated_at.desc(),
        )
        .all()
    )

    return chats


@router.post("/{conversation_id}/message")
def add_message(
    conversation_id: int,
    request: MessageCreate,
    role: str,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    role = role.strip().lower()

    if role not in {"user", "assistant", "system"}:
        raise HTTPException(
            status_code=400,
            detail="Invalid message role.",
        )

    conversation = (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id,
        )
        .first()
    )

    if conversation is None:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found.",
        )

    attachments = request.attachments or []

    # Keep attachment records small and predictable. The document_id is the
    # authoritative link used by the AI/RAG layer; the remaining fields are
    # presentation metadata only.
    normalized_attachments = []
    for attachment in attachments:
        if not isinstance(attachment, dict):
            continue

        document_id = attachment.get("document_id")
        try:
            document_id = int(document_id)
        except (TypeError, ValueError):
            continue

        normalized_attachments.append(
            {
                "document_id": document_id,
                "filename": str(attachment.get("filename") or "Attachment"),
                "file_type": str(attachment.get("file_type") or ""),
                "classification": str(
                    attachment.get("classification") or "Public"
                ),
                "size": int(attachment.get("size") or 0),
            }
        )

    message = Message(
        conversation_id=conversation_id,
        role=role,
        content=request.content or "",
        attachments=(
            json.dumps(normalized_attachments)
            if normalized_attachments
            else None
        ),
    )

    db.add(message)
    db.flush()

    if role == "user":
        existing_user_message = (
            db.query(Message)
            .filter(
                Message.conversation_id == conversation_id,
                Message.role == "user",
            )
            .first()
        )

        if existing_user_message is None:
            first_question = (request.content or "").strip()
            if first_question:
                conversation.title = first_question[:80]
            elif normalized_attachments:
                conversation.title = normalized_attachments[0]["filename"][:80]

    conversation.updated_at = message.created_at

    db.commit()
    db.refresh(message)
    db.refresh(conversation)

    return {
        "id": message.id,
        "conversation_id": message.conversation_id,
        "role": message.role,
        "content": message.content,
        "attachments": normalized_attachments,
        "created_at": message.created_at,
        "conversation": {
            "id": conversation.id,
            "title": conversation.title,
            "pinned": conversation.pinned,
            "created_at": conversation.created_at,
            "updated_at": conversation.updated_at,
        },
    }


@router.get("/{conversation_id}/messages")
def get_messages(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    conversation = (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id,
        )
        .first()
    )

    if conversation is None:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found.",
        )

    messages = (
        db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
        .all()
    )

    return [
        {
            "id": message.id,
            "conversation_id": message.conversation_id,
            "role": message.role,
            "content": message.content,
            "attachments": _parse_attachments(message.attachments),
            "created_at": message.created_at,
        }
        for message in messages
    ]


@router.put("/{conversation_id}/rename")
def rename_chat(
    conversation_id: int,
    request: ConversationRename,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    conversation = (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id,
        )
        .first()
    )

    if conversation is None:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found.",
        )

    conversation.title = request.title
    db.commit()

    return {"message": "Conversation renamed successfully."}


@router.put("/{conversation_id}/pin")
def toggle_pin(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    conversation = (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id,
        )
        .first()
    )

    if conversation is None:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found.",
        )

    conversation.pinned = not conversation.pinned
    db.commit()

    return {"pinned": conversation.pinned}


@router.get("/{conversation_id}")
def get_chat(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    conversation = (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id,
        )
        .first()
    )

    if conversation is None:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found.",
        )

    messages = (
        db.query(Message)
        .filter(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.asc())
        .all()
    )

    return {
        "conversation": conversation,
        "messages": [
            {
                "id": message.id,
                "conversation_id": message.conversation_id,
                "role": message.role,
                "content": message.content,
                "attachments": _parse_attachments(message.attachments),
                "created_at": message.created_at,
            }
            for message in messages
        ],
    }


@router.delete("/{conversation_id}")
def delete_chat(
    conversation_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    conversation = (
        db.query(Conversation)
        .filter(
            Conversation.id == conversation_id,
            Conversation.user_id == current_user.id,
        )
        .first()
    )

    if conversation is None:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found.",
        )

    db.query(Message).filter(
        Message.conversation_id == conversation_id
    ).delete()

    db.delete(conversation)
    db.commit()

    return {"message": "Conversation deleted successfully."}
