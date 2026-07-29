from fastapi import APIRouter, Depends
from fastapi import HTTPException

from auth.dependencies import (
    get_current_user,
    require_clearance,
)

from sqlalchemy.orm import Session
from database.db import get_db
from auth.hashing import hash_password

from schemas.user import UpdateProfile
from services.audit_service import create_audit_log

router = APIRouter(
    prefix="/protected",
    tags=["Protected"],
)


@router.get("/profile")
def profile(user=Depends(get_current_user)):
    return {
        "username": user.username,
        "email": user.email,
        "role": user.role,
        "clearance": user.clearance,
        "status": user.status,
    }
    

@router.put("/profile")
def update_profile(
    request: UpdateProfile,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):

    existing = (
        db.query(type(current_user))
        .filter(
            type(current_user).email == request.email,
            type(current_user).id != current_user.id,
        )
        .first()
    )

    if existing:
        raise HTTPException(
            status_code=400,
            detail="Email already exists."
        )

    current_user.username = request.username
    current_user.email = request.email

    if request.password:
        current_user.password = hash_password(
            request.password
        )

    db.commit()

    create_audit_log(
        db,
        current_user,
        "UPDATE_PROFILE",
        "Updated own profile",
    )

    return {
        "message": "Profile updated successfully."
    }


@router.get("/secret")
def secret_data(
    user=Depends(require_clearance("Secret"))
):
    return {
        "message": "Welcome to the Secret section.",
        "user": user.username,
    }
    