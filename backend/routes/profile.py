from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user
from database.db import get_db
from models.user import User
from services.audit_service import create_audit_log


router = APIRouter(prefix="/profile", tags=["Profile"])


@router.delete("/delete")
def delete_account(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role.lower() == "admin":
        raise HTTPException(
            status_code=403,
            detail="Administrator account cannot be deleted.",
        )

    username = current_user.username
    user_id = current_user.id

    db.delete(current_user)
    db.commit()

    # The user row is gone after commit; audit logging may depend on a
    # foreign key to the user, so keep this endpoint deliberately simple.
    print(f"ACCOUNT: deleted user {user_id} ({username})")

    return {"message": "Account deleted successfully."}
