from services.audit_service import create_audit_log
from sqlalchemy.orm import Session
from database.db import get_db
from auth.dependencies import get_current_user
from models.user import User

@router.delete("/delete")
def delete_account(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    username = current_user.username

    db.delete(current_user)
    db.commit()

    create_audit_log(
        db,
        current_user,
        "DELETE_ACCOUNT",
        f"{username} permanently deleted the account.",
    )

    return {
        "message": "Account deleted successfully."
    }
    
    
if current_user.role == "Admin":
    raise HTTPException(
        status_code=403,
        detail="Administrator account cannot be deleted."
    )
    
@router.delete("/delete")
def delete_account(...):

    if current_user.role == "Admin":
        raise HTTPException(
            status_code=403,
            detail="Administrator account cannot be deleted."
        )

    username = current_user.username

    db.delete(current_user)
    db.commit()

    create_audit_log(
        db,
        current_user,
        "DELETE_ACCOUNT",
        f"{username} permanently deleted the account.",
    )

    return {
        "message": "Account deleted successfully."
    }