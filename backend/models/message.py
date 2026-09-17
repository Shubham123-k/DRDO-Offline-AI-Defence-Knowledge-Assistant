from datetime import datetime

from sqlalchemy import Column, Integer, Text, String, DateTime
from database.base import Base


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)

    conversation_id = Column(
        Integer,
        nullable=False,
    )

    role = Column(
        String,
        nullable=False,
    )

    content = Column(
        Text,
        nullable=False,
        default="",
    )

    # JSON string containing attachment metadata. The actual file remains
    # in the classified uploads directory and is referenced by document_id.
    attachments = Column(
        Text,
        nullable=True,
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow,
    )
