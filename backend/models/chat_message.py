from datetime import datetime
from sqlalchemy import ( Column, Integer, String, DateTime, ForeignKey )
from database.base import Base

class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(
        Integer,
        primary_key=True,
        index=True,
    )

    user_id = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    role = Column(
        String,
        nullable=False,
    )

    content = Column(
        String,
        nullable=False,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )