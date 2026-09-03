import os
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database.db import engine, SessionLocal
from database.base import Base
import models

from routes.auth import router as auth_router
from routes.protected import router as protected_router
from routes.document import router as document_router
from routes.ai import router as ai_router
from routes.audit import router as audit_router
from routes.chat import router as chat_router
from routes.admin import router as admin_router
from routes.conversation import router as conversation_router
from routes.voice import router as voice_router

from services.admin_initializer import create_default_admin


Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="DRDO AI Assistant API",
    version="1.0.0",
)

db = SessionLocal()

try:
    create_default_admin(db)
finally:
    db.close()

frontend_url = os.getenv("FRONTEND_URL")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[frontend_url],
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
app.include_router(admin_router)
app.include_router(conversation_router)
app.include_router(voice_router)
@app.get("/")
def root():
    return {
        "message": "DRDO AI Assistant Backend is Running"
    }