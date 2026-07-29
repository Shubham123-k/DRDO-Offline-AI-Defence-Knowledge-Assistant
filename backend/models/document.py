from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.sql import func

from database.base import Base


class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)

    filename = Column(String, nullable=False)

    original_filename = Column(String, nullable=False)

    file_type = Column(String, nullable=False)

    classification = Column(String, nullable=False)

    uploaded_by = Column(
        Integer,
        ForeignKey("users.id"),
        nullable=False,
    )

    upload_time = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )