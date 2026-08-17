from pydantic import BaseModel
class ConversationCreate(BaseModel):
    title: str = "New Chat"
class ConversationRename(BaseModel):
    title: str