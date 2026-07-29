from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database.db import get_db
from models.user import User
from schemas.user import UserCreate
from auth.hashing import hash_password

from auth.hashing import verify_password
from auth.jwt_handler import create_access_token
from schemas.user import UserLogin

from services.audit_service import create_audit_log

router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


@router.post("/signup")
def signup(user: UserCreate, db: Session = Depends(get_db)):

    # Check if email already exists
    existing_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered"
        )

    # Create new user
    new_user = User(
        username=user.username,
        email=user.email,
        password=hash_password(user.password),

        role="User",
        clearance="Public",
        status="Pending",
        is_active=True,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": "Registration successful. Awaiting admin approval."
    }
    
@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):

    # Find user by email
    db_user = db.query(User).filter(
        User.email == user.email
    ).first()

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # Verify password
    if not verify_password(user.password, db_user.password):
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    # Check account status
    if db_user.status != "Approved":
        raise HTTPException(
            status_code=403,
            detail="Your account is pending admin approval."
        )

    # Generate JWT
    access_token = create_access_token(
        {
            "sub": db_user.email,
            "role": db_user.role,
            "clearance": db_user.clearance,
        }
    )
    
    create_audit_log(
    db,
    db_user,
    "LOGIN",
    "User logged in successfully",
)

    return {
    "access_token": access_token,
    "token_type": "bearer",
    "user": {
        "id": db_user.id,
        "username": db_user.username,
        "email": db_user.email,
        "role": db_user.role,
        "clearance": db_user.clearance,
        "status": db_user.status,
    },
}