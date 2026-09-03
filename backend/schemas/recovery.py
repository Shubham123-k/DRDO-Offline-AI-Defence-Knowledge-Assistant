from typing import Dict
from pydantic import BaseModel, EmailStr


# FORGOT PASSWORD
class ForgotPasswordRequest(BaseModel):
    email: EmailStr

# VERIFY SECURITY QUESTIONS
class VerifySecurityAnswersRequest(BaseModel):
    email: EmailStr
    answers: Dict[str, str]

# RESET PASSWORD
class ResetPasswordRequest(BaseModel):
    reset_token: str
    new_password: str

# PROFILE UPDATE
class ProfileUpdateRequest(BaseModel):
    reset_token: str
    username: str | None = None
    email: EmailStr | None = None
    new_password: str | None = None
    confirm_password: str | None = None