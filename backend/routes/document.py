import os
import shutil

from fastapi import ( APIRouter, UploadFile, File, Form, Depends, HTTPException )
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from database.db import get_db
from auth.dependencies import get_current_user

from models.document import Document
from models.user import User

from services.audit_service import create_audit_log
from services.document_ingestion_service import ingest_document
from services.chroma_service import delete_document_chunks


router = APIRouter(
    prefix="/documents",
    tags=["Documents"],
)


UPLOAD_FOLDER = "uploads"

os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True,
)


# UPLOAD DOCUMENT

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
        ".xls",
        ".xlsx",
    ]

    extension = os.path.splitext(
        file.filename
    )[1].lower()

    if extension not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported file type. "
                "Supported formats: PDF, DOCX, TXT, XLS, XLSX."
            ),
        )

    allowed_classifications = [
        "Public",
        "Confidential",
        "Secret",
    ]

    if classification not in allowed_classifications:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid classification. "
                "Allowed values are Public, Confidential and Secret."
            ),
        )

    original_filename = file.filename

    saved_filename = (
        f"{current_user.id}_{original_filename}"
    )

    save_path = os.path.join(
        UPLOAD_FOLDER,
        saved_filename,
    )

    try:
        with open(
            save_path,
            "wb",
        ) as buffer:

            shutil.copyfileobj(
                file.file,
                buffer,
            )

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=(
                f"Unable to save document: {str(exc)}"
            ),
        )

    document = Document(
        filename=saved_filename,
        original_filename=original_filename,
        file_type=extension,
        classification=classification,
        uploaded_by=current_user.id,
    )

    try:
        db.add(document)
        db.commit()
        db.refresh(document)

    except Exception as exc:
        db.rollback()
        if os.path.exists(save_path):
            os.remove(save_path)

        raise HTTPException(
            status_code=500,
            detail=(
                f"Unable to save document information: {str(exc)}"
            ),
        )

    try:

        ingestion_result = ingest_document(
            file_path=save_path,
            document_id=document.id,
            filename=document.original_filename,
            classification=document.classification,
            uploaded_by=current_user.id,
        )

    except Exception as exc:

        try:
            db.delete(document)
            db.commit()

        except Exception:
            db.rollback()

        if os.path.exists(save_path):
            os.remove(save_path)

        raise HTTPException(
            status_code=500,
            detail=(
                "Document upload succeeded, but "
                f"document processing failed: {str(exc)}"
            ),
        )

    create_audit_log(
        db=db,
        user=current_user,
        action="UPLOAD_DOCUMENT",
        details=(
            f"Uploaded {original_filename} "
            f"({classification}) - "
            f"{ingestion_result['pages']} pages, "
            f"{ingestion_result['chunks']} chunks"
        ),
    )

    return {
        "message": (
            "Document uploaded and indexed successfully."
        ),
        "document_id": document.id,
        "filename": document.original_filename,
        "classification": document.classification,
        "pages": ingestion_result["pages"],
        "chunks": ingestion_result["chunks"],
    }


# GET ALL DOCUMENTS
@router.get("/")
def get_documents(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    documents = (
        db.query(Document)
        .order_by(
            Document.upload_time.desc()
        )
        .all()
    )

    result = []

    for document in documents:

        user = (
            db.query(User)
            .filter(
                User.id == document.uploaded_by
            )
            .first()
        )

        result.append(
            {
                "id": document.id,
                "original_filename": (
                    document.original_filename
                ),
                "classification": (
                    document.classification
                ),
                "file_type": (
                    document.file_type
                ),
                "upload_time": (
                    document.upload_time
                ),
                "uploaded_by": (
                    user.username
                    if user
                    else "Unknown"
                ),
            }
        )

    return result


# DOWNLOAD DOCUMENT
@router.get("/download/{document_id}")
def download_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    document = (
        db.query(Document)
        .filter(
            Document.id == document_id
        )
        .first()
    )

    if document is None:

        raise HTTPException(
            status_code=404,
            detail="Document not found.",
        )

    clearance_levels = {
        "Public": 1,
        "Confidential": 2,
        "Secret": 3,
    }

    user_level = clearance_levels.get(
        current_user.clearance,
        1,
    )

    document_level = clearance_levels.get(
        document.classification,
        1,
    )

    if document_level > user_level:

        raise HTTPException(
            status_code=403,
            detail=(
                "You are not authorized to download "
                "this document."
            ),
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

    create_audit_log(
        db=db,
        user=current_user,
        action="DOWNLOAD_DOCUMENT",
        details=(
            f"Downloaded "
            f"{document.original_filename}"
        ),
    )

    return FileResponse(
        path,
        filename=document.original_filename,
    )

# DELETE DOCUMENT
@router.delete("/{document_id}")
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    document = (
        db.query(Document)
        .filter(
            Document.id == document_id
        )
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

    original_filename = (
        document.original_filename
    )

    try:

        delete_document_chunks(
            document.id
        )

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=(
                "Unable to remove document "
                f"from the vector database: {str(exc)}"
            ),
        )

    if os.path.exists(path):

        try:
            os.remove(path)

        except Exception as exc:

            raise HTTPException(
                status_code=500,
                detail=(
                    "Unable to delete document file: "
                    f"{str(exc)}"
                ),
            )

    try:
        db.delete(document)
        db.commit()

    except Exception as exc:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=(
                f"Unable to delete document: {str(exc)}"
            ),
        )

    create_audit_log(
        db=db,
        user=current_user,
        action="DELETE_DOCUMENT",
        details=(
            f"Deleted {original_filename}"
        ),
    )

    return {
        "message": (
            "Document deleted successfully."
        )
    }