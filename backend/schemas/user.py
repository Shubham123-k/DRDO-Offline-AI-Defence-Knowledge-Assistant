from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
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