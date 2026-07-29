from pydantic import BaseModel


class ConversationCreate(BaseModel):
    title: str


class ConversationRename(BaseModel):
    title: str