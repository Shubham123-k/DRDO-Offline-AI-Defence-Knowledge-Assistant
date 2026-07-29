from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user
from database.db import get_db
from services.rag_service import ask_question
from services.audit_service import create_audit_log

router = APIRouter(
    prefix="/ai",
    tags=["AI"],
)


class QuestionRequest(BaseModel):
    question: str


@router.post("/ask")
def ask(
    request: QuestionRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # Generate AI answer
    answer = ask_question(
        request.question,
        current_user.clearance,
    )

    # Save audit log
    create_audit_log(
        db=db,
        user=current_user,
        action="AI_QUERY",
        details=request.question,
    )

    return {
    "question": request.question,
    "answer": answer,
    "model": "gemma4:26b",
    "sources": [],
    "processing_time": elapsed_time,
}