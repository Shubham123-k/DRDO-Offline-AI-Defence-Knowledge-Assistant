# Project Memory

## Project

**DRDO AI – Offline Defence Assistant**

## Current status

The project has a working full-stack architecture covering authentication, clearance-based authorization, document ingestion, RAG, multimodal processing, chat, voice transcription and administration. Final regression testing, documentation cleanup and repository preparation should be treated as the current development focus.

## Core stack

### Frontend

- React 19
- Vite
- Tailwind CSS v4
- Axios
- React Router
- React Hook Form
- React Markdown
- Highlight.js
- Lucide React / React Icons
- Framer Motion
- tsparticles

### Backend

- Python
- FastAPI
- Uvicorn
- SQLAlchemy
- SQLite
- JWT
- bcrypt
- ChromaDB
- LangChain Ollama integration
- Tesseract
- Pillow
- faster-whisper

### Local AI

- Primary LLM: `gemma4:26b` (configured through `OLLAMA_MODEL`)
- Embedding model: `nomic-embed-text:latest` (configured through `OLLAMA_MODEL_1`)
- Vision model: `moondream` (configured through `MOONDREAM_MODEL`)
- Speech model: `large-v3-turbo` by default through `WHISPER_MODEL`

## Security model

Clearance levels:

```text
Public < Confidential < Secret
```

Normal registration is Pending until administrator approval.

Secure Confidential/Secret users can be created by the administrator.

Passwords are bcrypt-hashed. Existing passwords are never displayed. Secure account recovery uses an administrator-authorized password reset.

## RAG behavior

Normal questions use authorized document retrieval according to clearance.

Attachment questions use exact validated document IDs and are restricted to the attachment context.

If a question clearly refers to an image/document but no attachment is supplied, the API asks the user to attach the referenced item rather than searching unrelated old documents.

## Multimodal behavior

- Images: Pillow → Tesseract + Moondream → chunks → embeddings → ChromaDB.
- PDF: extracted page text plus relevant visual/OCR content → chunks → embeddings → ChromaDB.
- DOCX: document text plus embedded raster images → OCR/vision → chunks → embeddings.

## Important project rules

- Do not introduce cloud AI as a requirement for the core system.
- Do not weaken backend clearance checks to simplify UI behavior.
- Do not expose password hashes or plaintext passwords.
- Do not make attachment retrieval global when the user explicitly asks about an attachment.
- Do not treat browser-side protection as real authorization.
- Do not commit the local database, ChromaDB, uploaded defence documents or `.env` files.
- Preserve the current React/FastAPI/SQLite/ChromaDB architecture unless a deliberate architecture decision is recorded in `DECISIONS.md`.

## Current priorities

1. Complete regression testing.
2. Verify offline operation.
3. Verify Public/Confidential/Secret authorization.
4. Verify attachment-aware RAG.
5. Verify voice transcription on the target machine.
6. Clean the repository before GitHub push.
7. Keep documentation synchronized with the implementation.
