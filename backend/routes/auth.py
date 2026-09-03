import hashlib
import secrets

from datetime import datetime, timedelta
from fastapi.security import OAuth2PasswordRequestForm
from fastapi import ( APIRouter, Depends, HTTPException )

from sqlalchemy.orm import Session
from database.db import get_db

from models.user import User
from models.security_recovery import ( SecurityAnswer, PasswordRecovery )
from schemas.user import ( UserCreate, UserLogin )
from schemas.recovery import ( ForgotPasswordRequest, VerifySecurityAnswersRequest, ResetPasswordRequest, ProfileUpdateRequest )

from auth.dependencies import get_current_user
from auth.hashing import ( hash_password, verify_password )
from auth.jwt_handler import ( create_access_token )

from services.audit_service import ( create_audit_log )


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


MAX_SECURITY_ATTEMPTS = 3
RESET_TOKEN_MINUTES = 10


def normalize_answer(answer: str) -> str:
    return " ".join(
        answer.strip().lower().split()
    )


def hash_reset_token(token: str) -> str:
    return hashlib.sha256(
        token.encode("utf-8")
    ).hexdigest()


# SIGNUP
@router.post("/signup")
def signup(
    user: UserCreate,
    db: Session = Depends(get_db),
):
    username = user.username.strip()
    email = str(user.email).strip().lower()

    if not username:
        raise HTTPException(
            status_code=400,
            detail="Username cannot be empty.",
        )

    if not user.password:
        raise HTTPException(
            status_code=400,
            detail="Password cannot be empty.",
        )

    if len(user.security_questions) != 3:
        raise HTTPException(
            status_code=400,
            detail=(
                "Exactly 3 security questions "
                "are required."
            ),
        )

    questions = [
        item.question.strip()
        for item in user.security_questions
    ]

    if len(set(questions)) != 3:
        raise HTTPException(
            status_code=400,
            detail=(
                "Please select 3 different "
                "security questions."
            ),
        )

    for item in user.security_questions:
        if not item.question.strip():
            raise HTTPException(
                status_code=400,
                detail="Security question cannot be empty.",
            )

        if not item.answer.strip():
            raise HTTPException(
                status_code=400,
                detail="Security answer cannot be empty.",
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

    new_user = User(
        username=username,
        email=email,
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

    # Store security answers securely
    for item in user.security_questions:

        normalized_answer = normalize_answer(
            item.answer
        )

        security_answer = SecurityAnswer(
            user_id=new_user.id,
            question=item.question.strip(),
            answer_hash=hash_password(
                normalized_answer
            ),
        )

        db.add(security_answer)

    # Create recovery status
    recovery = PasswordRecovery(
        user_id=new_user.id,
        failed_attempts=0,
        is_banned=False,
    )

    db.add(recovery)
    db.commit()

    create_audit_log(
        db=db,
        user=new_user,
        action="SIGNUP",
        details=(
            "New public user registration."
        ),
    )

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
    identifier = user.identifier.strip()

    if not identifier:
        raise HTTPException(
            status_code=400,
            detail=(
                "Username or email is required."
            ),
        )

    db_user = (
        db.query(User)
        .filter(
            User.username.ilike(identifier)
            | User.email.ilike(
                identifier.lower()
            )
        )
        .first()
    )

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail=(
                "Invalid username/email "
                "or password."
            ),
        )

    recovery = (
        db.query(PasswordRecovery)
        .filter(
            PasswordRecovery.user_id
            == db_user.id
        )
        .first()
    )

    if recovery and recovery.is_banned:
        raise HTTPException(
            status_code=403,
            detail=(
                "This account has been permanently "
                "banned after 3 failed password "
                "recovery attempts."
            ),
        )

    if not verify_password(
        user.password,
        db_user.password,
    ):
        raise HTTPException(
            status_code=401,
            detail=(
                "Invalid username/email "
                "or password."
            ),
        )

    if not db_user.is_active:
        raise HTTPException(
            status_code=403,
            detail="Your account is inactive.",
        )

    if db_user.status != "Approved":
        raise HTTPException(
            status_code=403,
            detail=(
                "Your account is pending "
                "admin approval."
            ),
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
        details=(
            "User logged in successfully."
        ),
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
def login_for_swagger(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db),
):
    """
    OAuth2-compatible login endpoint.

    This endpoint is used by Swagger UI's
    Authorize button.

    It does NOT replace /auth/login.
    """

    identifier = form_data.username.strip()

    if not identifier:
        raise HTTPException(
            status_code=400,
            detail="Username or email is required.",
        )

    db_user = (
        db.query(User)
        .filter(
            User.username.ilike(identifier)
            | User.email.ilike(identifier.lower())
        )
        .first()
    )

    if not db_user:
        raise HTTPException(
            status_code=401,
            detail="Invalid username/email or password.",
        )

    recovery = (
        db.query(PasswordRecovery)
        .filter(
            PasswordRecovery.user_id == db_user.id
        )
        .first()
    )

    if recovery and recovery.is_banned:
        raise HTTPException(
            status_code=403,
            detail=(
                "This account has been permanently "
                "banned after 3 failed password "
                "recovery attempts."
            ),
        )

    if not verify_password(
        form_data.password,
        db_user.password,
    ):
        raise HTTPException(
            status_code=401,
            detail="Invalid username/email or password.",
        )

    if not db_user.is_active:
        raise HTTPException(
            status_code=403,
            detail="Your account is inactive.",
        )

    if db_user.status != "Approved":
        raise HTTPException(
            status_code=403,
            detail=(
                "Your account is pending "
                "admin approval."
            ),
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
        details=(
            "User authenticated through "
            "OAuth2/Swagger interface."
        ),
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
    }


# FORGOT PASSWORD - GET QUESTIONS
@router.post("/forgot-password/questions")
def get_security_questions(
    request: ForgotPasswordRequest,
    db: Session = Depends(get_db),
):
    email = str(request.email).strip().lower()

    db_user = (
        db.query(User)
        .filter(
            User.email.ilike(email)
        )
        .first()
    )

    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="No account found with this email.",
        )

    recovery = (
        db.query(PasswordRecovery)
        .filter(
            PasswordRecovery.user_id
            == db_user.id
        )
        .first()
    )

    if recovery and recovery.is_banned:
        raise HTTPException(
            status_code=403,
            detail=(
                "This account has been permanently "
                "banned after 3 failed recovery attempts."
            ),
        )

    security_answers = (
        db.query(SecurityAnswer)
        .filter(
            SecurityAnswer.user_id
            == db_user.id
        )
        .all()
    )

    if len(security_answers) != 3:
        raise HTTPException(
            status_code=400,
            detail=(
                "Password recovery is not configured "
                "for this account."
            ),
        )

    return {
        "questions": [
            {
                "id": answer.id,
                "question": answer.question,
            }
            for answer in security_answers
        ]
    }


# VERIFY SECURITY QUESTIONS
@router.post("/forgot-password/verify")
def verify_security_answers(
    request: VerifySecurityAnswersRequest,
    db: Session = Depends(get_db),
):
    email = str(request.email).strip().lower()

    db_user = (
        db.query(User)
        .filter(
            User.email.ilike(email)
        )
        .first()
    )

    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="Account not found.",
        )

    recovery = (
        db.query(PasswordRecovery)
        .filter(
            PasswordRecovery.user_id
            == db_user.id
        )
        .first()
    )

    if not recovery:
        raise HTTPException(
            status_code=400,
            detail=(
                "Password recovery is not configured."
            ),
        )

    if recovery.is_banned:
        raise HTTPException(
            status_code=403,
            detail=(
                "This account has been permanently "
                "banned."
            ),
        )

    security_answers = (
        db.query(SecurityAnswer)
        .filter(
            SecurityAnswer.user_id
            == db_user.id
        )
        .all()
    )

    submitted_answers = request.answers

    all_correct = True

    for security_answer in security_answers:

        answer = submitted_answers.get(
            str(security_answer.id),
            "",
        )

        normalized_answer = normalize_answer(
            answer
        )

        if not verify_password(
            normalized_answer,
            security_answer.answer_hash,
        ):
            all_correct = False
            break

    # Wrong attempt
    if not all_correct:

        recovery.failed_attempts += 1

        if (
            recovery.failed_attempts
            >= MAX_SECURITY_ATTEMPTS
        ):
            recovery.is_banned = True

            db.commit()

            create_audit_log(
                db=db,
                user=db_user,
                action="ACCOUNT_BANNED",
                details=(
                    "Account permanently banned after "
                    "3 failed password recovery attempts."
                ),
            )

            raise HTTPException(
                status_code=403,
                detail=(
                    "You have exceeded the maximum "
                    "number of password recovery attempts. "
                    "This account has been permanently banned."
                ),
            )

        db.commit()

        remaining = (
            MAX_SECURITY_ATTEMPTS
            - recovery.failed_attempts
        )

        raise HTTPException(
            status_code=401,
            detail=(
                f"Incorrect security answers. "
                f"{remaining} attempt(s) remaining."
            ),
        )

    # Correct answers
    reset_token = secrets.token_urlsafe(48)

    recovery.reset_token_hash = hash_reset_token(
        reset_token
    )

    recovery.reset_token_expires = (
        datetime.utcnow()
        + timedelta(
            minutes=RESET_TOKEN_MINUTES
        )
    )

    db.commit()

    return {
        "message": (
            "Security verification successful."
        ),
        "reset_token": reset_token,
        "expires_in_minutes": RESET_TOKEN_MINUTES,
    }


# RESET PASSWORD
@router.post("/forgot-password/reset")
def reset_password(
    request: ResetPasswordRequest,
    db: Session = Depends(get_db),
):
    if not request.new_password:
        raise HTTPException(
            status_code=400,
            detail="New password cannot be empty.",
        )

    if len(request.new_password) < 8:
        raise HTTPException(
            status_code=400,
            detail=(
                "Password must contain at least "
                "8 characters."
            ),
        )

    token_hash = hash_reset_token(
        request.reset_token
    )

    recovery = (
        db.query(PasswordRecovery)
        .filter(
            PasswordRecovery.reset_token_hash
            == token_hash
        )
        .first()
    )

    if not recovery:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired reset token.",
        )

    if recovery.is_banned:
        raise HTTPException(
            status_code=403,
            detail="This account has been permanently banned.",
        )

    if not recovery.reset_token_expires:
        raise HTTPException(
            status_code=401,
            detail="Invalid reset token.",
        )

    if (
        datetime.utcnow()
        > recovery.reset_token_expires
    ):
        recovery.reset_token_hash = None
        recovery.reset_token_expires = None

        db.commit()

        raise HTTPException(
            status_code=401,
            detail=(
                "Reset token has expired. "
                "Please start the recovery process again."
            ),
        )

    db_user = (
        db.query(User)
        .filter(
            User.id == recovery.user_id
        )
        .first()
    )

    if not db_user:
        raise HTTPException(
            status_code=404,
            detail="User not found.",
        )

    db_user.password = hash_password(
        request.new_password
    )

    # Reset recovery state
    recovery.failed_attempts = 0
    recovery.reset_token_hash = None
    recovery.reset_token_expires = None

    db.commit()

    create_audit_log(
        db=db,
        user=db_user,
        action="PASSWORD_RESET",
        details=(
            "Password successfully reset using "
            "security questions."
        ),
    )

    return {
        "message": (
            "Password reset successfully. "
            "You can now sign in."
        )
    }

# SECURE PROFILE UPDATE
@router.post("/profile/update")
def update_profile_securely(
    request: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Securely update username, email and/or password.

    Requirements:
    1. User must have a valid JWT.
    2. User must have successfully answered
       all security questions.
    3. Security reset token must belong to
       the currently authenticated user.
    4. Reset token must not be expired.
    5. Password confirmation must match.
    """

    recovery = (
        db.query(PasswordRecovery)
        .filter(
            PasswordRecovery.user_id
            == current_user.id
        )
        .first()
    )

    if not recovery:
        raise HTTPException(
            status_code=400,
            detail=(
                "Password recovery is not configured "
                "for this account."
            ),
        )

    if recovery.is_banned:
        raise HTTPException(
            status_code=403,
            detail=(
                "This account has been permanently "
                "banned."
            ),
        )

    if not request.reset_token:
        raise HTTPException(
            status_code=401,
            detail=(
                "Security verification is required "
                "before editing your account."
            ),
        )

    token_hash = hash_reset_token(
        request.reset_token
    )

    if (
        not recovery.reset_token_hash
        or recovery.reset_token_hash
        != token_hash
    ):
        raise HTTPException(
            status_code=401,
            detail=(
                "Invalid security verification token. "
                "Please verify your security questions again."
            ),
        )

    if not recovery.reset_token_expires:
        raise HTTPException(
            status_code=401,
            detail=(
                "Security verification has expired. "
                "Please verify your security questions again."
            ),
        )

    if (
        datetime.utcnow()
        > recovery.reset_token_expires
    ):
        recovery.reset_token_hash = None
        recovery.reset_token_expires = None

        db.commit()

        raise HTTPException(
            status_code=401,
            detail=(
                "Security verification has expired. "
                "Please start the verification process again."
            ),
        )

    # Validate username
    if request.username is not None:

        username = request.username.strip()

        if not username:
            raise HTTPException(
                status_code=400,
                detail="Username cannot be empty.",
            )

        existing_username = (
            db.query(User)
            .filter(
                User.username.ilike(username),
                User.id != current_user.id,
            )
            .first()
        )

        if existing_username:
            raise HTTPException(
                status_code=400,
                detail="Username already exists.",
            )

    # Validate email
    if request.email is not None:

        email = str(
            request.email
        ).strip().lower()

        if not email:
            raise HTTPException(
                status_code=400,
                detail="Email cannot be empty.",
            )

        existing_email = (
            db.query(User)
            .filter(
                User.email.ilike(email),
                User.id != current_user.id,
            )
            .first()
        )

        if existing_email:
            raise HTTPException(
                status_code=400,
                detail="Email is already registered.",
            )

    # Validate password
    password_change_requested = (
        request.new_password is not None
        or request.confirm_password is not None
    )

    if password_change_requested:

        if not request.new_password:
            raise HTTPException(
                status_code=400,
                detail=(
                    "New password cannot be empty."
                ),
            )

        if not request.confirm_password:
            raise HTTPException(
                status_code=400,
                detail=(
                    "Confirm password is required."
                ),
            )

        if (
            len(request.new_password)
            < 8
        ):
            raise HTTPException(
                status_code=400,
                detail=(
                    "Password must contain at least "
                    "8 characters."
                ),
            )

        if (
            request.new_password
            != request.confirm_password
        ):
            raise HTTPException(
                status_code=400,
                detail=(
                    "New password and confirm password "
                    "do not match."
                ),
            )

    # Track what changed
    changes = []

    # Update username
    if request.username is not None:

        username = request.username.strip()

        if (
            username
            != current_user.username
        ):
            current_user.username = username
            changes.append("username")

    # Update email
    if request.email is not None:

        email = str(
            request.email
        ).strip().lower()

        if email != current_user.email:
            current_user.email = email
            changes.append("email")

    # Update password
    if password_change_requested:

        current_user.password = (
            hash_password(
                request.new_password
            )
        )

        changes.append("password")

    if not changes:
        raise HTTPException(
            status_code=400,
            detail=(
                "No changes were made."
            ),
        )


    recovery.failed_attempts = 0

    db.commit()
    db.refresh(current_user)


    access_token = create_access_token(
        {
            "sub": current_user.email,
            "role": current_user.role,
            "clearance": current_user.clearance,
        }
    )

    create_audit_log(
        db=db,
        user=current_user,
        action="PROFILE_UPDATED",
        details=(
            "User securely updated: "
            + ", ".join(changes)
            + ". Security questions verified."
        ),
    )

    return {
        "message": (
            "Profile updated successfully."
        ),
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": current_user.id,
            "username": current_user.username,
            "email": current_user.email,
            "role": current_user.role,
            "clearance": current_user.clearance,
            "status": current_user.status,
        },
        "updated_fields": changes,
    }