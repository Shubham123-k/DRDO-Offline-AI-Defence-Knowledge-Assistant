from pydantic import BaseModel, EmailStr
from typing import List


class SecurityQuestionAnswer(BaseModel):
    question: str
    answer: str 

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

    security_questions: List[
        SecurityQuestionAnswer
    ]

class UserLogin(BaseModel):
    identifier: str
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: EmailStr
    role: str
    clearance: str
    status: str

    class Config:
        from_attributes = True


class UpdateProfile(BaseModel):
    username: str
    email: EmailStr
    password: str | None = None


class SecureUserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    clearance: str