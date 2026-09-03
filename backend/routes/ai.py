import os

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
import time

from auth.dependencies import get_current_user
from database.db import get_db

from services.ai_service import process_question
from services.retrieval_service import retrieve_documents
from services.audit_service import create_audit_log

from models.conversation import Conversation


router = APIRouter(
    prefix="/ai",
    tags=["AI"],
)


class QuestionRequest(BaseModel):
    conversation_id: int
    question: str


@router.post("/ask")
def ask(
    request: QuestionRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    start_time = time.time()

    if not request.question.strip():
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

    try:
        result = process_question(
            db=db,
            conversation_id=request.conversation_id,
            question=request.question,
            clearance=current_user.clearance,
        )

    except Exception as error:
        print(
            f"AI processing error: {error}"
        )

        raise HTTPException(
            status_code=500,
            detail=f"AI processing error: {str(error)}",
        )

    create_audit_log(
        db=db,
        user=current_user,
        action="AI_QUERY",
        details=request.question,
    )

    elapsed_time = round(
        time.time() - start_time,
        2,
    )

    return {
        "question": request.question,
        "answer": result["answer"],
        "sources": result.get("sources", []),
        "model": os.getenv("OLLAMA_MODEL"),
        "processing_time": elapsed_time,
    }


@router.post("/retrieve")
def retrieve(
    request: QuestionRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if not request.question.strip():
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

    docs = retrieve_documents(
        question=request.question,
        clearance=current_user.clearance,
    )

    return docs