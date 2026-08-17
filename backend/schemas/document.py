from pydantic import BaseModel

class DocumentResponse(BaseModel):
    id: int
    filename: str
    original_filename: str
    file_type: str
    classification: str
    class Config:
        from_attributes = True