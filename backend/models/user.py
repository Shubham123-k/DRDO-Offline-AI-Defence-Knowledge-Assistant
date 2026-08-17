from sqlalchemy import Column, Integer, String, Boolean
from database.base import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)

    role = Column(
        String,
        default="user"
    )

    clearance = Column(
        String,
        default="Public"
    )

    status = Column(
        String,
        default="Pending"
    )

    is_active = Column(
        Boolean,
        default=True
    )