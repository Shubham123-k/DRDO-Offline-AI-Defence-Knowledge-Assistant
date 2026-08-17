from fastapi import ( APIRouter, Depends )

from sqlalchemy.orm import Session

from database.db import get_db
from auth.dependencies import get_current_user

from models.conversation import Conversation
from schemas.conversation import ConversationCreate

from models.message import Message
from schemas.message import MessageCreate
from fastapi import HTTPException
from schemas.conversation import ConversationRename

router = APIRouter(
    prefix="/chat",
    tags=["Chat"],
)

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
        .filter(
            Conversation.user_id == current_user.id
        )
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

    message = Message(
        conversation_id=conversation_id,
        role=role,
        content=request.content,
    )

    db.add(message)
    conversation.updated_at = message.created_at
    db.commit()
    db.refresh(message)

    return message

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
        .filter(
            Message.conversation_id == conversation_id
        )
        .order_by(Message.created_at.asc())
        .all()
    )

    return messages

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

    return {
        "message": "Conversation renamed successfully."
    }
    
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

    return {
        "pinned": conversation.pinned
    }
    
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
            detail="Conversation not found."
        )

    messages = (
        db.query(Message)
        .filter(
            Message.conversation_id == conversation_id
        )
        .order_by(Message.created_at.asc())
        .all()
    )

    return {
        "conversation": conversation,
        "messages": messages,
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

    # Delete all messages first
    db.query(Message).filter(
        Message.conversation_id == conversation_id
    ).delete()

    db.delete(conversation)

    db.commit()

    return {
        "message": "Conversation deleted successfully."
    }