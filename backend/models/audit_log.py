from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
)

from database.base import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id = Column(
        Integer,
        nullable=False,
    )

    username = Column(
        String,
        nullable=False,
    )

    action = Column(
        String,
        nullable=False,
    )

    details = Column(
        String,
        nullable=False,
    )

    timestamp = Column(
        DateTime,
        default=datetime.utcnow,
    )