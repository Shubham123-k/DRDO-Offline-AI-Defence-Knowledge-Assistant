from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
import time

from auth.dependencies import get_current_user
from database.db import get_db

from services.audit_service import create_audit_log
from services.retrieval_service import retrieve_documents
from services.ai_service import process_question

from models.message import Message
from models.conversation import Conversation


router = APIRouter(
    prefix="/ai",
    tags=["AI"],
)

class QuestionRequest(BaseModel):
    conversation_id: int
    question: str


# ASK AI
@router.post("/ask")
def ask(
    request: QuestionRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    start_time = time.time()

    question = request.question.strip()

    if not question:
        raise HTTPException(
            status_code=400,
            detail="Question cannot be empty.",
        )

    conversation = (
        db.query(Conversation)
        .filter(
            Conversation.id == request.conversation_id,
            Conversation.user_id == current_user.id,
        )
        .first()
    )

    if conversation is None:
        raise HTTPException(
            status_code=404,
            detail="Conversation not found.",
        )

    user_message = Message(
        conversation_id=request.conversation_id,
        role="user",
        content=question,
    )

    db.add(user_message)
    db.commit()
    db.refresh(user_message)

    try:

        result = process_question(
            db=db,
            conversation_id=request.conversation_id,
            question=question,
            clearance=current_user.clearance,
        )

    except ValueError as exc:

        raise HTTPException(
            status_code=404,
            detail=str(exc),
        )

    except Exception as exc:

        # Roll back any unfinished database transaction
        db.rollback()

        print(
            "AI processing error:",
            repr(exc),
        )

        raise HTTPException(
            status_code=500,
            detail="Unable to process the AI request.",
        )

    create_audit_log(
        db=db,
        user=current_user,
        action="AI_QUERY",
        details=question,
    )

    elapsed_time = round(
        time.time() - start_time,
        2,
    )

    return {
        "question": question,
        "answer": result["answer"],
        "sources": result["sources"],
        "model": "gemma4:26b",
        "processing_time": elapsed_time,
    }

@router.post("/retrieve")
def retrieve(
    request: QuestionRequest,
    current_user=Depends(get_current_user),
):
    docs = retrieve_documents(
        question=request.question,
        clearance=current_user.clearance,
    )

    return docs