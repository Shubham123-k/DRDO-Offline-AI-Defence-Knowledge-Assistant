import shutil
from pathlib import Path

from fastapi import ( APIRouter, UploadFile, File, Form, Depends, HTTPException )
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from database.db import get_db
from auth.dependencies import get_current_user

from models.document import Document
from models.user import User

from services.audit_service import create_audit_log
from services.text_extractor import extract_text
from services.text_splitter import split_text
from services.embedding_service import embed_documents
from services.chroma_service import ( add_chunks, delete_document_chunks )


router = APIRouter(
    prefix="/documents",
    tags=["Documents"],
)


CLEARANCE_LEVELS = {
    "Public": 1,
    "Confidential": 2,
    "Secret": 3,
}

def can_access_classification(
    user_clearance: str,
    document_classification: str,
):
    user_level = CLEARANCE_LEVELS.get(
        user_clearance,
        1,
    )

    document_level = CLEARANCE_LEVELS.get(
        document_classification,
        1,
    )

    return document_level <= user_level

BASE_DIR = Path(__file__).resolve().parent.parent

UPLOAD_FOLDER = BASE_DIR / "uploads"

PUBLIC_FOLDER = UPLOAD_FOLDER / "Public"
CONFIDENTIAL_FOLDER = UPLOAD_FOLDER / "Confidential"
SECRET_FOLDER = UPLOAD_FOLDER / "Secret"


PUBLIC_FOLDER.mkdir(
    parents=True,
    exist_ok=True,
)

CONFIDENTIAL_FOLDER.mkdir(
    parents=True,
    exist_ok=True,
)

SECRET_FOLDER.mkdir(
    parents=True,
    exist_ok=True,
)


CLASSIFICATION_FOLDERS = {
    "Public": PUBLIC_FOLDER,
    "Confidential": CONFIDENTIAL_FOLDER,
    "Secret": SECRET_FOLDER,
}


ALLOWED_EXTENSIONS = {
    ".pdf",
    ".docx",
    ".txt",
    ".xls",
    ".xlsx",
}


def get_allowed_classifications(
    clearance: str,
):
    user_level = CLEARANCE_LEVELS.get(
        clearance,
        1,
    )

    return [
        classification
        for classification, level
        in CLEARANCE_LEVELS.items()
        if level <= user_level
    ]


def has_upload_clearance(
    user_clearance: str,
    document_classification: str,
):
    user_level = CLEARANCE_LEVELS.get(
        user_clearance,
        1,
    )

    document_level = CLEARANCE_LEVELS.get(
        document_classification,
        1,
    )

    return user_level >= document_level


def get_upload_folder(
    classification: str,
):
    folder = CLASSIFICATION_FOLDERS.get(
        classification
    )

    if folder is None:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid classification. "
                "Use Public, Confidential or Secret."
            ),
        )

    return folder


@router.post("/upload")
def upload_document(
    classification: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    classification = classification.strip().title()

    if classification not in CLASSIFICATION_FOLDERS:
        raise HTTPException(
        status_code=400,
        detail=(
            "Invalid classification. "
            "Use Public, Confidential or Secret."
        ),
        )

    if current_user.role.lower() != "admin":
        if not can_access_classification(
        current_user.clearance,
        classification,
        ):
            raise HTTPException(
            status_code=403,
            detail=(
                f"You do not have sufficient clearance "
                f"to upload a {classification} document."
            ),
        )

    if not has_upload_clearance(
        current_user.clearance,
        classification,
    ):
        raise HTTPException(
            status_code=403,
            detail=(
                "You do not have sufficient "
                f"clearance to upload a "
                f"{classification} document."
            ),
        )

    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="No file selected.",
        )

    original_filename = Path(
        file.filename
    ).name

    extension = Path(
        original_filename
    ).suffix.lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=(
                "Unsupported file type. "
                "Allowed files: PDF, DOCX, TXT, "
                "XLS and XLSX."
            ),
        )

    upload_folder = get_upload_folder(
        classification
    )

    document = Document(
        filename="",
        original_filename=original_filename,
        file_type=extension,
        classification=classification,
        uploaded_by=current_user.id,
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    saved_filename = (
        f"{document.id}_{original_filename}"
    )

    save_path = (
        upload_folder / saved_filename
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

        document.filename = str(
            Path(classification)
            / saved_filename
        )

        db.commit()
        db.refresh(document)

        text = extract_text(
            str(save_path)
        )

        if not text or not text.strip():
            raise ValueError(
                "No readable text could be "
                "extracted from the document."
            )

        chunks = split_text(
            text
        )

        if not chunks:
            raise ValueError(
                "The document could not be "
                "split into chunks."
            )

        embeddings = embed_documents(
            chunks
        )

        if not embeddings:
            raise ValueError(
                "Failed to generate "
                "document embeddings."
            )

        metadata = {
            "document_id": document.id,
            "filename": original_filename,
            "classification": classification,
            "uploaded_by": current_user.id,
        }

        add_chunks(
            chunks=chunks,
            embeddings=embeddings,
            metadata=metadata,
        )

        create_audit_log(
            db=db,
            user=current_user,
            action="UPLOAD_DOCUMENT",
            details=(
                f"Uploaded {original_filename} "
                f"as {classification} document."
            ),
        )

        return {
            "message": (
                "Document uploaded and "
                "indexed successfully."
            ),
            "document_id": document.id,
            "filename": original_filename,
            "classification": classification,
            "chunks": len(chunks),
            "storage": str(
                Path("uploads")
                / classification
                / saved_filename
            ),
        }

    except Exception as error:
        if save_path.exists():
            save_path.unlink()

        db.delete(document)
        db.commit()

        raise HTTPException(
            status_code=500,
            detail=(
                "Document processing failed: "
                f"{str(error)}"
            ),
        )


@router.get("/")
def get_documents(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    allowed_classifications = (
        get_allowed_classifications(
            current_user.clearance
        )
    )

    documents = (
        db.query(Document)
        .filter(
            Document.classification.in_(
                allowed_classifications
            )
        )
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


@router.get(
    "/download/{document_id}"
)
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

    allowed_classifications = (
        get_allowed_classifications(
            current_user.clearance
        )
    )

    if (
        document.classification
        not in allowed_classifications
    ):
        raise HTTPException(
            status_code=403,
            detail=(
                "You do not have sufficient "
                "clearance to access this "
                "document."
            ),
        )

    path = (
        BASE_DIR
        / "uploads"
        / document.filename
    )

    if not path.exists():
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
        str(path),
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

    allowed_classifications = (
        get_allowed_classifications(
            current_user.clearance
        )
    )

    if (
        current_user.role.lower() != "admin"
        and document.classification
        not in allowed_classifications
    ):
        raise HTTPException(
            status_code=403,
            detail=(
                "You do not have sufficient "
                "clearance to delete this document."
            ),
        )

    original_filename = (
        document.original_filename
    )

    document_id_value = document.id

    path = (
        BASE_DIR
        / "uploads"
        / document.filename
    )

    try:
        delete_document_chunks(
            document_id_value
        )

        if path.exists():
            path.unlink()

        db.delete(document)
        db.commit()

        create_audit_log(
            db=db,
            user=current_user,
            action="DELETE_DOCUMENT",
            details=(
                f"Deleted "
                f"{original_filename}"
            ),
        )

        return {
            "message": (
                "Document and its AI index "
                "data deleted successfully."
            )
        }

    except Exception as error:
        db.rollback()

        raise HTTPException(
            status_code=500,
            detail=(
                "Document deletion failed: "
                f"{str(error)}"
            ),
        )