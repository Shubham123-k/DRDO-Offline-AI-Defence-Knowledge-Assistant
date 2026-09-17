import json
import os
import re
import time

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user
from database.db import get_db

from models.conversation import Conversation
from models.document import Document
from models.message import Message

from services.ai_service import process_question
from services.retrieval_service import retrieve_documents
from services.audit_service import create_audit_log


router = APIRouter(prefix="/ai", tags=["AI"])


class QuestionRequest(BaseModel):
    conversation_id: int
    question: str
    attachment_document_ids: list[int] = Field(default_factory=list)


def _needs_attachment(question: str) -> bool:
    normalized = re.sub(r"\s+", " ", question.lower()).strip()

    patterns = [
        r"\bwhat is this (image|picture|photo|pic)\b",
        r"\bwhat does this (image|picture|photo|pic) show\b",
        r"\bdescribe this (image|picture|photo|pic)\b",
        r"\bexplain this (image|picture|photo|pic)\b",
        r"\bwhat is this (pdf|document|doc|word|file|report)\b",
        r"\bexplain this (pdf|document|doc|word|file|report)\b",
        r"\bdescribe this (pdf|document|doc|word|file|report)\b",
        r"\bsummarize this (pdf|document|doc|word|file|report)\b",
        r"\banalyze this (image|picture|photo|pdf|document|file|report)\b",
        r"\bthe (attached|uploaded) (image|picture|photo|pdf|document|file|report)\b",
        r"\bthis attachment\b",
    ]

    return any(re.search(pattern, normalized) for pattern in patterns)


def _validate_attachment_ids(
    db: Session,
    current_user,
    conversation_id: int,
    question: str,
    attachment_ids: list[int],
):
    normalized_ids = []
    for value in attachment_ids:
        try:
            value = int(value)
        except (TypeError, ValueError):
            raise HTTPException(status_code=400, detail="Invalid attachment document ID.")
        if value not in normalized_ids:
            normalized_ids.append(value)

    if not normalized_ids:
        return []

    documents = (
        db.query(Document)
        .filter(Document.id.in_(normalized_ids))
        .all()
    )

    if len(documents) != len(normalized_ids):
        raise HTTPException(
            status_code=404,
            detail="One or more attached documents were not found.",
        )

    clearance_levels = {"Public": 1, "Confidential": 2, "Secret": 3}
    user_level = clearance_levels.get(
        (current_user.clearance or "Public").strip().title(),
        1,
    )

    for document in documents:
        document_level = clearance_levels.get(
            (document.classification or "Public").strip().title(),
            1,
        )

        if document_level > user_level:
            raise HTTPException(
                status_code=403,
                detail="You do not have sufficient clearance to use this attachment.",
            )

        # The chat composer creates these attachments through the current
        # user's upload action. Requiring ownership prevents a caller from
        # injecting an unrelated document ID into an attachment question.
        if document.uploaded_by != current_user.id:
            raise HTTPException(
                status_code=403,
                detail="This attachment does not belong to the current user.",
            )

    # Verify that the exact IDs are actually attached to the user's message
    # for this question. This is the final link between the UI attachment and
    # attachment-scoped RAG.
    candidate_messages = (
        db.query(Message)
        .filter(
            Message.conversation_id == conversation_id,
            Message.role == "user",
            Message.content == question,
        )
        .order_by(Message.id.desc())
        .all()
    )

    requested = set(normalized_ids)
    linked = False

    for message in candidate_messages:
        try:
            attachments = json.loads(message.attachments or "[]")
        except (TypeError, ValueError):
            attachments = []

        attached_ids = set()
        for attachment in attachments:
            try:
                attached_ids.add(int(attachment.get("document_id")))
            except (TypeError, ValueError, AttributeError):
                continue

        if requested.issubset(attached_ids):
            linked = True
            break

    if not linked:
        raise HTTPException(
            status_code=400,
            detail="The requested attachment is not linked to this question.",
        )

    return normalized_ids


@router.post("/ask")
def ask(
    request: QuestionRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    start_time = time.time()
    question = request.question.strip()

    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    conversation = (
        db.query(Conversation)
        .filter(
            Conversation.id == request.conversation_id,
            Conversation.user_id == current_user.id,
        )
        .first()
    )

    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found.")

    attachment_ids = _validate_attachment_ids(
        db=db,
        current_user=current_user,
        conversation_id=request.conversation_id,
        question=question,
        attachment_ids=request.attachment_document_ids,
    )

    if _needs_attachment(question) and not attachment_ids:
        return {
            "question": question,
            "answer": "Please attach the image or document you are referring to. I do not see an attachment with this question.",
            "sources": [],
            "model": os.getenv("OLLAMA_MODEL"),
            "processing_time": round(time.time() - start_time, 2),
        }

    try:
        result = process_question(
            db=db,
            conversation_id=request.conversation_id,
            question=question,
            clearance=current_user.clearance,
            attachment_document_ids=attachment_ids,
        )
    except Exception as error:
        print(f"AI processing error: {error}")
        raise HTTPException(
            status_code=500,
            detail=f"AI processing error: {str(error)}",
        )

    create_audit_log(
        db=db,
        user=current_user,
        action="AI_QUERY",
        details=question,
    )

    return {
        "question": question,
        "answer": result["answer"],
        "sources": result.get("sources", []),
        "model": os.getenv("OLLAMA_MODEL"),
        "processing_time": round(time.time() - start_time, 2),
    }


@router.post("/retrieve")
def retrieve(
    request: QuestionRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    question = request.question.strip()
    if not question:
        raise HTTPException(status_code=400, detail="Question cannot be empty.")

    conversation = (
        db.query(Conversation)
        .filter(
            Conversation.id == request.conversation_id,
            Conversation.user_id == current_user.id,
        )
        .first()
    )

    if conversation is None:
        raise HTTPException(status_code=404, detail="Conversation not found.")

    attachment_ids = _validate_attachment_ids(
        db=db,
        current_user=current_user,
        conversation_id=request.conversation_id,
        question=question,
        attachment_ids=request.attachment_document_ids,
    )

    return retrieve_documents(
        question=question,
        clearance=current_user.clearance,
        document_ids=attachment_ids or None,
    )
