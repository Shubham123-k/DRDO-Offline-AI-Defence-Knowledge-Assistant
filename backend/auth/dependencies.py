from fastapi import ( Depends, HTTPException )

from fastapi.security import ( OAuth2PasswordBearer )

from sqlalchemy.orm import Session

from auth.jwt_handler import verify_access_token
from database.db import get_db
from models.user import User

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/token"
)

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    payload = verify_access_token(
        token
    )

    if payload is None:

        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
        )

    email = payload.get(
        "sub"
    )

    if email is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid token",
        )

    user = (
        db.query(User)
        .filter(
            User.email == email
        )
        .first()
    )

    if user is None:
        raise HTTPException(
            status_code=401,
            detail="User not found",
        )

    if user.status != "Approved":
        raise HTTPException(
            status_code=403,
            detail=(
                "Your account is not approved."
            ),
        )
    return user

def require_clearance(
    required_clearance: str,
):

    levels = {
        "Public": 1,
        "Confidential": 2,
        "Secret": 3,
    }

    def checker(
        user: User = Depends(
            get_current_user
        ),
    ):

        user_level = levels.get(
            user.clearance,
            1,
        )

        required_level = levels.get(
            required_clearance,
            1,
        )

        if user_level < required_level:

            raise HTTPException(
                status_code=403,
                detail="Insufficient clearance",
            )
        return user

    return checker