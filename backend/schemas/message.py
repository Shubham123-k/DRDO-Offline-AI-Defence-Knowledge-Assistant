from typing import Any, Optional

from pydantic import BaseModel, Field


class MessageCreate(BaseModel):
    content: str = ""
    attachments: Optional[list[dict[str, Any]]] = Field(default_factory=list)
