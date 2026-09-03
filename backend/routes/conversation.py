from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user
from database.db import get_db

from schemas.conversation import ( ConversationCreate, ConversationRename )
from services.conversation_service import ( create_conversation, get_conversations, rename_conversation, delete_conversation, toggle_pin)

router = APIRouter(
    prefix="/conversations",
    tags=["Conversations"],
)


@router.post("/")
def new_conversation(
    request: ConversationCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return create_conversation(
        db,
        current_user.id,
        request.title,
    )


@router.get("/")
def list_conversations(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return get_conversations(
        db,
        current_user.id,
    )


@router.put("/{conversation_id}")
def rename(
    conversation_id: int,
    request: ConversationRename,
    db: Session = Depends(get_db),
):
    conversation = rename_conversation(
        db,
        conversation_id,
        request.title,
    )

    if conversation is None:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found",
        )

    return conversation


@router.put("/{conversation_id}/pin")
def pin(
    conversation_id: int,
    db: Session = Depends(get_db),
):
    conversation = toggle_pin(
        db,
        conversation_id,
    )

    if conversation is None:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found",
        )

    return conversation


@router.delete("/{conversation_id}")
def delete(
    conversation_id: int,
    db: Session = Depends(get_db),
):
    success = delete_conversation(
        db,
        conversation_id,
    )

    if not success:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found",
        )

    return {
        "message": "Conversation deleted successfully."
    }