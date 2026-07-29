import os
from fastapi.responses import FileResponse

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from services.audit_service import create_audit_log
from database.db import get_db
from auth.dependencies import get_current_user
from models.user import User

from models.document import Document
from models.audit_log import AuditLog
from pydantic import BaseModel

class UpdateUserRequest(BaseModel):
    role: str
    clearance: str
    status: str

router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)


def require_admin(current_user):
    if current_user.role.lower() != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required.",
        )
        
@router.get("/pending")
def get_pending_users(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    require_admin(current_user)

    users = (
        db.query(User)
        .filter(User.status == "Pending")
        .all()
    )

    return users

@router.put("/approve/{user_id}")
def approve_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    require_admin(current_user)

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    user.status = "Approved"

    db.commit()

    return {
        "message": "User approved successfully."
    }
    
@router.put("/reject/{user_id}")
def reject_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    require_admin(current_user)

    user = db.query(User).filter(
        User.id == user_id
    ).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    user.status = "Rejected"

    db.commit()

    return {
        "message": "User rejected successfully."
    }
    
@router.get("/dashboard")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    require_admin(current_user)

    total_users = db.query(User).count()

    pending_users = (
        db.query(User)
        .filter(User.status == "Pending")
        .count()
    )

    approved_users = (
        db.query(User)
        .filter(User.status == "Approved")
        .count()
    )

    rejected_users = (
        db.query(User)
        .filter(User.status == "Rejected")
        .count()
    )

    total_documents = db.query(Document).count()

    audit_logs = db.query(AuditLog).count()

    return {
        "total_users": total_users,
        "pending_users": pending_users,
        "approved_users": approved_users,
        "rejected_users": rejected_users,
        "total_documents": total_documents,
        "audit_logs": audit_logs,
    }
    
@router.get("/users")
def get_all_users(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    require_admin(current_user)

    users = (
        db.query(User)
        .order_by(User.id.asc())
        .all()
    )

    return users

@router.put("/users/{user_id}")
def update_user(
    user_id: int,
    request: UpdateUserRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    require_admin(current_user)

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found."
        )

    user.role = request.role
    user.clearance = request.clearance
    user.status = request.status

    db.commit()

    create_audit_log(
        db,
        current_user,
        "UPDATE_USER",
        f"Updated {user.username}",
    )

    return {
        "message": "User updated successfully."
    }
    
@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    require_admin(current_user)

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found."
        )

    if user.role == "Admin":
        raise HTTPException(
            status_code=400,
            detail="Cannot delete Administrator."
        )

    username = user.username

    db.delete(user)
    db.commit()

    create_audit_log(
        db,
        current_user,
        "DELETE_USER",
        f"Deleted {username}",
    )

    return {
        "message": "User deleted successfully."
    }
    
@router.get("/documents")
def get_documents(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    require_admin(current_user)

    documents = (
        db.query(Document)
        .order_by(Document.upload_time.desc())
        .all()
    )

    return documents

@router.get("/documents/download/{document_id}")
def download_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    require_admin(current_user)

    document = (
        db.query(Document)
        .filter(Document.id == document_id)
        .first()
    )

    if document is None:
        raise HTTPException(
            status_code=404,
            detail="Document not found."
        )

    path = os.path.join(
        "uploads",
        document.classification.lower(),
        document.filename,
    )

    if not os.path.exists(path):
        raise HTTPException(
            status_code=404,
            detail="File not found."
        )

    return FileResponse(
        path,
        filename=document.original_filename,
    )
    
@router.delete("/documents/{document_id}")
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    require_admin(current_user)

    document = (
        db.query(Document)
        .filter(Document.id == document_id)
        .first()
    )

    if document is None:
        raise HTTPException(
            status_code=404,
            detail="Document not found."
        )

    path = os.path.join(
        "uploads",
        document.classification.lower(),
        document.filename,
    )

    if os.path.exists(path):
        os.remove(path)

    create_audit_log(
        db,
        current_user,
        "DELETE_DOCUMENT",
        document.original_filename,
    )

    db.delete(document)
    db.commit()

    return {
        "message": "Document deleted successfully."
    }
    
