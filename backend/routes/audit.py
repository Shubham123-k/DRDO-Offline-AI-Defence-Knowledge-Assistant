from fastapi import ( APIRouter, Depends, HTTPException )
from sqlalchemy.orm import Session

from auth.dependencies import get_current_user
from database.db import get_db
from models.audit_log import AuditLog

router = APIRouter(
    prefix="/audit",
    tags=["Audit"],
)


@router.get("/logs")
def get_logs(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    if current_user.role.lower() != "admin":
        raise HTTPException(
            status_code=403,
            detail="Only admins can view audit logs.",
        )

    logs = (
        db.query(AuditLog)
        .order_by(AuditLog.timestamp.desc())
        .all()
    )

    return logs