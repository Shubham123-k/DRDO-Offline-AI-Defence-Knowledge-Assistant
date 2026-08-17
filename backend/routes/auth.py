from fastapi import ( APIRouter, Depends, HTTPException )

from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from database.db import get_db
from models.user import User

from schemas.user import ( UserCreate, UserLogin )
from auth.hashing import ( hash_password, verify_password )

from auth.jwt_handler import create_access_token
from services.audit_service import create_audit_log


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)

def authenticate_user(
    email: str,
    password: str,
    db: Session,
):
    """
    Authenticate a user using email and password.

    Returns:
        User object

    Raises:
        HTTPException when authentication fails.
    """

    db_user = (
        db.query(User)
        .filter(
            User.email == email
        )
        .first()
    )

    if not db_user:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    if not verify_password(
        password,
        db_user.password,
    ):

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password",
        )

    if db_user.status != "Approved":

        raise HTTPException(
            status_code=403,
            detail=(
                "Your account is pending "
                "admin approval."
            ),
        )

    return db_user


# SIGNUP
@router.post("/signup")
def signup(
    user: UserCreate,
    db: Session = Depends(get_db),
):

    existing_user = (
        db.query(User)
        .filter(
            User.email == user.email
        )
        .first()
    )

    if existing_user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )

    # Create user
    new_user = User(
        username=user.username,
        email=user.email,
        password=hash_password(
            user.password
        ),
        role="User",
        clearance="Public",
        status="Pending",
        is_active=True,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": (
            "Registration successful. "
            "Awaiting admin approval."
        )
    }

# LOGIN
@router.post("/login")
def login(
    user: UserLogin,
    db: Session = Depends(get_db),
):

    db_user = authenticate_user(
        email=user.email,
        password=user.password,
        db=db,
    )

    access_token = create_access_token(
        {
            "sub": db_user.email,
            "role": db_user.role,
            "clearance": db_user.clearance,
        }
    )

    create_audit_log(
        db=db,
        user=db_user,
        action="LOGIN",
        details="User logged in successfully",
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

@router.post("/token")
def token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):

    db_user = authenticate_user(
        email=form_data.username,
        password=form_data.password,
        db=db,
    )

    access_token = create_access_token(
        {
            "sub": db_user.email,
            "role": db_user.role,
            "clearance": db_user.clearance,
        }
    )

    create_audit_log(
        db=db,
        user=db_user,
        action="LOGIN",
        details="User authenticated through OAuth2",
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }