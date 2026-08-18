import os
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database.db import engine
from database.base import Base
import models

from routes.auth import router as auth_router
from routes.protected import router as protected_router
from routes.document import router as document_router
from routes.ai import router as ai_router
from routes.audit import router as audit_router
from routes.chat import router as chat_router

from models.conversation import Conversation
from database.db import SessionLocal
from services.admin_initializer import create_default_admin
from routes import admin
from routes import document
from routes.conversation import (
    router as conversation_router,
)

Base.metadata.create_all(bind=engine)


def get_allowed_origins():
    configured_origins = os.getenv("CORS_ORIGINS", "")
    origins = [origin.strip() for origin in configured_origins.split(",") if origin.strip()]

    frontend_url = os.getenv("FRONTEND_URL")
    if frontend_url:
        origins.append(frontend_url.strip())

    defaults = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://drdoai-three.vercel.app",
    ]

    return list(dict.fromkeys(origins + defaults))


app = FastAPI(
    title="DRDO AI Assistant API",
    version="1.0.0",
)

db = SessionLocal()

try:
    create_default_admin(db)
finally:
    db.close()

allowed_origins = get_allowed_origins()

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https://.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(protected_router)
app.include_router(document_router)
app.include_router(ai_router)
app.include_router(audit_router)
app.include_router(chat_router)
app.include_router(admin.router)
app.include_router(document.router)
app.include_router(conversation_router)


@app.get("/")
def root():
    return {
        "message": "DRDO AI Assistant Backend is Running"
    }