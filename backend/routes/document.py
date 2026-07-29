import os
import shutil

from fastapi import (
    APIRouter,
    UploadFile,
    File,
    Form,
    Depends,
    HTTPException,
)

from sqlalchemy.orm import Session

from database.db import get_db
from auth.dependencies import get_current_user
from models.document import Document

from fastapi.responses import FileResponse
from services.audit_service import create_audit_log
from sqlalchemy.orm import joinedload
from models.user import User

router = APIRouter(
    prefix="/documents",
    tags=["Documents"],
)

UPLOAD_FOLDER = "uploads"

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@router.post("/upload")
def upload_document(
    classification: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    allowed_extensions = [
        ".pdf",
        ".docx",
        ".txt",
    ]

    extension = os.path.splitext(file.filename)[1].lower()

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type.",
        )

    saved_filename = (
        f"{current_user.id}_{file.filename}"
    )

    save_path = os.path.join(
        UPLOAD_FOLDER,
        saved_filename,
    )

    with open(save_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    document = Document(
        filename=saved_filename,
        original_filename=file.filename,
        file_type=extension,
        classification=classification,
        uploaded_by=current_user.id,
    )
    
    create_audit_log(
    db,
    current_user,
    "UPLOAD_DOCUMENT",
    f"Uploaded {file.filename}",
)

    db.add(document)
    db.commit()
    db.refresh(document)

    return {
        "message": "Document uploaded successfully."
    } 
    

@router.get("/")
def get_documents(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    documents = (
        db.query(Document)
        .order_by(Document.upload_time.desc())
        .all()
    )

    return documents


@router.get("/download/{document_id}")
def download_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    document = (
        db.query(Document)
        .filter(Document.id == document_id)
        .first()
    )

    if document is None:
        raise HTTPException(
            status_code=404,
            detail="Document not found.",
        )

    path = os.path.join(
        UPLOAD_FOLDER,
        document.filename,
    )

    if not os.path.exists(path):
        raise HTTPException(
            status_code=404,
            detail="File missing.",
        )

    return FileResponse(
        path,
        filename=document.original_filename,
    )
    
    
@router.delete("/{document_id}")
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    document = (
        db.query(Document)
        .filter(Document.id == document_id)
        .first()
    )

    if document is None:
        raise HTTPException(
            status_code=404,
            detail="Document not found.",
        )

    path = os.path.join(
        UPLOAD_FOLDER,
        document.filename,
    )

    if os.path.exists(path):
        os.remove(path)
        
    create_audit_log(
    db,
    current_user,
    "DELETE_DOCUMENT",
    f"Deleted {document.original_filename}",
)

    db.delete(document)
    db.commit()
    
    create_audit_log(
    db,
    current_user,
    "DELETE_DOCUMENT",
    f"Deleted {document.original_filename}",
)

    return {
        "message": "Document deleted successfully."
    }
    
    
@router.get("/")
def get_documents(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    documents = (
        db.query(Document)
        .order_by(Document.upload_time.desc())
        .all()
    )

    result = []

    for doc in documents:

        user = (
            db.query(User)
            .filter(User.id == doc.uploaded_by)
            .first()
        )

        result.append({
            "id": doc.id,
            "original_filename": doc.original_filename,
            "classification": doc.classification,
            "upload_time": doc.upload_time,
            "uploaded_by": user.username if user else "Unknown",
        })

    return result