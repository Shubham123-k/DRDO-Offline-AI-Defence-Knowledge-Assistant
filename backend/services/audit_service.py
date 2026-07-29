from sqlalchemy.orm import Session

from models.audit_log import AuditLog


def create_audit_log(
    db: Session,
    user,
    action: str,
    details: str,
):
    log = AuditLog(
        user_id=user.id,
        username=user.username,
        action=action,
        details=details,
    )

    db.add(log)
    db.commit()