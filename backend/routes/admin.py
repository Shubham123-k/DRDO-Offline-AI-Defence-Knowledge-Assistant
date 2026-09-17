import os
from pathlib import Path

from fastapi import ( APIRouter, Depends, HTTPException )

from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database.db import get_db
from auth.dependencies import get_current_user
from auth.hashing import hash_password, verify_password

from models.user import User
from models.document import Document
from models.audit_log import AuditLog

from schemas.user import SecureUserCreate
from services.audit_service import create_audit_log
from services.chroma_service import ( delete_document_chunks )


router = APIRouter(
    prefix="/admin",
    tags=["Admin"],
)

class UpdateUserRequest(BaseModel):
    role: str
    clearance: str
    status: str


class AdminPasswordRequest(BaseModel):
    admin_password: str


class SecurePasswordResetRequest(BaseModel):
    admin_password: str
    new_password: str
    confirm_password: str


def verify_admin_password(current_user, admin_password: str):
    if not admin_password:
        raise HTTPException(
            status_code=400,
            detail="Administrator password is required.",
        )

    if not verify_password(admin_password, current_user.password):
        raise HTTPException(
            status_code=401,
            detail="Administrator password is incorrect.",
        )


CLEARANCES = {
    "Public",
    "Confidential",
    "Secret",
}

VALID_ROLES = {
    "User",
    "Admin",
}


def require_admin(current_user):
    if current_user.role.lower() != "admin":
        raise HTTPException(
            status_code=403,
            detail="Admin access required.",
        )


@router.post("/secure-users")
def create_secure_user(
    request: SecureUserCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    require_admin(current_user)

    username = request.username.strip()
    email = str(request.email).strip().lower()
    clearance = request.clearance.strip().title()

    if not username:
        raise HTTPException(
            status_code=400,
            detail="Username cannot be empty.",
        )

    if not request.password:
        raise HTTPException(
            status_code=400,
            detail="Password cannot be empty.",
        )

    if clearance not in [
        "Confidential",
        "Secret",
    ]:
        raise HTTPException(
            status_code=400,
            detail=(
                "Secure users can only have "
                "Confidential or Secret clearance."
            ),
        )

    existing_username = (
        db.query(User)
        .filter(
            User.username.ilike(username)
        )
        .first()
    )

    if existing_username:
        raise HTTPException(
            status_code=400,
            detail="Username already exists.",
        )

    existing_email = (
        db.query(User)
        .filter(
            User.email.ilike(email)
        )
        .first()
    )

    if existing_email:
        raise HTTPException(
            status_code=400,
            detail="Email already registered.",
        )

    secure_user = User(
        username=username,
        email=email,
        password=hash_password(
            request.password
        ),
        role="User",
        clearance=clearance,
        status="Approved",
        is_active=True,
    )

    db.add(secure_user)
    db.commit()
    db.refresh(secure_user)

    create_audit_log(
        db=db,
        user=current_user,
        action="CREATE_SECURE_USER",
        details=(
            f"Created {clearance} user "
            f"{username}."
        ),
    )

    return {
        "message": (
            f"{clearance} user created successfully."
        ),
        "user": {
            "id": secure_user.id,
            "username": secure_user.username,
            "email": secure_user.email,
            "role": secure_user.role,
            "clearance": secure_user.clearance,
            "status": secure_user.status,
        },
    }

@router.post("/secure-details/verify")
def get_secure_details(
    request: AdminPasswordRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Re-authenticate the administrator before exposing the
    usernames/emails of Confidential and Secret accounts.

    Password hashes are never returned. Passwords are deliberately
    not reversible in this application; recovery is handled through
    an administrator-authorized password reset endpoint below.
    """
    require_admin(current_user)
    verify_admin_password(current_user, request.admin_password)

    users = (
        db.query(User)
        .filter(
            User.clearance.in_(["Confidential", "Secret"]),
            User.role != "Admin",
        )
        .order_by(User.clearance.desc(), User.username.asc())
        .all()
    )

    create_audit_log(
        db=db,
        user=current_user,
        action="VIEW_SECURE_DETAILS",
        details="Administrator re-authenticated and viewed secure account details.",
    )

    return {
        "users": [
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "clearance": user.clearance,
                "status": user.status,
                "is_active": user.is_active,
            }
            for user in users
        ]
    }


@router.post("/secure-details/{user_id}/reset-password")
def reset_secure_user_password(
    user_id: int,
    request: SecurePasswordResetRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    Secure recovery for Confidential/Secret users.

    Existing passwords are stored as one-way bcrypt hashes and cannot
    be displayed or recovered. After a second administrator
    re-authentication, the administrator can set a new password.
    """
    require_admin(current_user)
    verify_admin_password(current_user, request.admin_password)

    if len(request.new_password) < 8:
        raise HTTPException(
            status_code=400,
            detail="New password must contain at least 8 characters.",
        )

    if request.new_password != request.confirm_password:
        raise HTTPException(
            status_code=400,
            detail="New password and confirm password do not match.",
        )

    user = (
        db.query(User)
        .filter(User.id == user_id)
        .first()
    )

    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    if user.role.lower() == "admin" or user.clearance not in {"Confidential", "Secret"}:
        raise HTTPException(
            status_code=403,
            detail="Password reset is available only for Confidential and Secret user accounts.",
        )

    user.password = hash_password(request.new_password)
    db.commit()

    create_audit_log(
        db=db,
        user=current_user,
        action="ADMIN_RESET_SECURE_USER_PASSWORD",
        details=(
            f"Administrator reset the password for secure user "
            f"{user.username} ({user.clearance})."
        ),
    )

    return {
        "message": f"Password reset successfully for {user.username}.",
    }


@router.get("/pending")
def get_pending_users(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    require_admin(current_user)

    users = (
        db.query(User)
        .filter(
            User.status == "Pending"
        )
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

    user = (
        db.query(User)
        .filter(
            User.id == user_id
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    user.status = "Approved"

    db.commit()

    create_audit_log(
        db=db,
        user=current_user,
        action="APPROVE_USER",
        details=(
            f"Approved user "
            f"{user.username}."
        ),
    )

    return {
        "message": (
            "User approved successfully."
        )
    }


@router.put("/reject/{user_id}")
def reject_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    require_admin(current_user)

    user = (
        db.query(User)
        .filter(
            User.id == user_id
        )
        .first()
    )

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    user.status = "Rejected"

    db.commit()

    create_audit_log(
        db=db,
        user=current_user,
        action="REJECT_USER",
        details=(
            f"Rejected user "
            f"{user.username}."
        ),
    )

    return {
        "message": (
            "User rejected successfully."
        )
    }


@router.get("/dashboard")
def get_dashboard_stats(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    require_admin(current_user)

    total_users = (
        db.query(User).count()
    )

    pending_users = (
        db.query(User)
        .filter(
            User.status == "Pending"
        )
        .count()
    )

    approved_users = (
        db.query(User)
        .filter(
            User.status == "Approved"
        )
        .count()
    )

    rejected_users = (
        db.query(User)
        .filter(
            User.status == "Rejected"
        )
        .count()
    )

    total_documents = (
        db.query(Document).count()
    )

    audit_logs = (
        db.query(AuditLog).count()
    )

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
        .order_by(
            User.id.asc()
        )
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
        .filter(
            User.id == user_id
        )
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    role = request.role.strip()
    
    if role not in VALID_ROLES:
        raise HTTPException(
        status_code=400,
        detail="Invalid role. Use User or Admin.",
        )

    clearance = (
        request.clearance
        .strip()
        .title()
    )

    status = (
        request.status
        .strip()
        .title()
    )

    if clearance not in CLEARANCES:
        raise HTTPException(
            status_code=400,
            detail=(
                "Invalid clearance. "
                "Use Public, Confidential "
                "or Secret."
            ),
        )

    if status not in {
        "Pending",
        "Approved",
        "Rejected",
    }:
        raise HTTPException(
            status_code=400,
            detail="Invalid user status.",
        )

    user.role = role
    user.clearance = clearance
    user.status = status

    db.commit()
    db.refresh(user)

    create_audit_log(
        db=db,
        user=current_user,
        action="UPDATE_USER",
        details=(
            f"Updated user "
            f"{user.username}."
        ),
    )

    return {
        "message": (
            "User updated successfully."
        )
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
        .filter(
            User.id == user_id
        )
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    if user.role.lower() == "admin":
        raise HTTPException(
            status_code=400,
            detail=(
                "Cannot delete Administrator."
            ),
        )

    username = user.username

    db.delete(user)
    db.commit()

    create_audit_log(
        db=db,
        user=current_user,
        action="DELETE_USER",
        details=(
            f"Deleted {username}."
        ),
    )

    return {
        "message": (
            "User deleted successfully."
        )
    }


@router.get("/documents")
def get_documents(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    require_admin(current_user)

    documents = (
        db.query(Document)
        .order_by(
            Document.upload_time.desc()
        )
        .all()
    )

    return documents


@router.get(
    "/documents/download/{document_id}"
)
def download_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    require_admin(current_user)

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

    path = (
        Path(
            __file__
        ).resolve().parent.parent
        / "uploads"
        / document.filename
    )

    if not path.exists():
        raise HTTPException(
            status_code=404,
            detail="File not found.",
        )

    create_audit_log(
        db=db,
        user=current_user,
        action="ADMIN_DOWNLOAD_DOCUMENT",
        details=(
            f"Downloaded "
            f"{document.original_filename}."
        ),
    )

    return FileResponse(
        str(path),
        filename=document.original_filename,
    )


@router.delete(
    "/documents/{document_id}"
)
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    require_admin(current_user)

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

    path = (
        Path(
            __file__
        ).resolve().parent.parent
        / "uploads"
        / document.filename
    )

    original_filename = (
        document.original_filename
    )

    if path.exists():
        path.unlink()

    from services.chroma_service import (
        delete_document_chunks,
    )

    delete_document_chunks(
        document.id
    )

    db.delete(document)
    db.commit()

    create_audit_log(
        db=db,
        user=current_user,
        action="DELETE_DOCUMENT",
        details=(
            f"Deleted "
            f"{original_filename}."
        ),
    )

    return {
        "message": (
            "Document deleted successfully."
        )
    }