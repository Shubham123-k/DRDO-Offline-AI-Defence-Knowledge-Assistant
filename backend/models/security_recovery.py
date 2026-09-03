from sqlalchemy import ( Column, Integer, String, Boolean, ForeignKey, DateTime )
from database.base import Base


class SecurityAnswer(Base):
    __tablename__ = "security_answers"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    question = Column(
        String,
        nullable=False,
    )

    answer_hash = Column(
        String,
        nullable=False,
    )


class PasswordRecovery(Base):
    __tablename__ = "password_recovery"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
        unique=True,
        index=True,
    )

    failed_attempts = Column(
        Integer,
        default=0,
        nullable=False,
    )

    is_banned = Column(
        Boolean,
        default=False,
        nullable=False,
    )

    reset_token_hash = Column(
        String,
        nullable=True,
    )

    reset_token_expires = Column(
        DateTime,
        nullable=True,
    )