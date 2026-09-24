# DRDO AI – Offline Defence Assistant

An offline-first, locally hosted AI knowledge assistant for controlled defence/technical documents. The system combines local LLM inference, Retrieval-Augmented Generation (RAG), document ingestion, OCR, visual understanding, offline speech-to-text, role-based access, clearance-based document authorization, audit logging, and an administrator dashboard.

> **Important:** This repository is intended for authorized development and demonstration. Do not commit classified, confidential, restricted, personal, or otherwise sensitive defence material to a public repository.

## What the system does

- Authenticates users with JWT-based sessions.
- Uses administrator approval for normal account registration.
- Supports `Public`, `Confidential`, and `Secret` clearance levels.
- Restricts document retrieval according to user clearance.
- Uploads and indexes PDF, DOCX, TXT, XLS, XLSX and supported image files.
- Uses Tesseract OCR for text extraction from images and image-heavy documents.
- Uses local Moondream through Ollama for visual understanding.
- Uses local Ollama LLM inference for grounded answers.
- Uses a local embedding model and ChromaDB for semantic retrieval.
- Supports attachment-scoped questions so an answer can be restricted to the exact uploaded document/image.
- Stores conversations, messages, attachments, pin state and chat history.
- Supports offline voice transcription through faster-whisper.
- Provides administrator user management, secure-user management, document management and audit logs.
- Provides administrator-authorized password reset for Confidential/Secret accounts without exposing stored password hashes.
- Includes a light/dark UI with light mode as the default.

## High-level flow

```text
User
  │
  ▼
React + Vite Frontend
  │
  ▼
FastAPI Backend
  │
  ├── JWT Authentication / Authorization
  ├── SQLite + SQLAlchemy
  ├── Document Ingestion
  │     ├── Text Extraction
  │     ├── Tesseract OCR
  │     └── Moondream Vision
  │
  ├── Embeddings → ChromaDB
  │
  ├── Clearance-aware Retrieval
  │
  ├── Ollama + Local LLM
  │
  └── faster-whisper Voice Transcription
  │
  ▼
Grounded Answer + Sources
```

## Technology stack

### Frontend

- React 19
- Vite
- Tailwind CSS v4
- React Router
- Axios
- React Hook Form
- React Markdown + GFM
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
- JWT (`python-jose`)
- bcrypt / Passlib
- ChromaDB
- LangChain integrations
- Ollama
- PyMuPDF / pypdf
- python-docx
- pandas / openpyxl
- Pillow
- Tesseract OCR
- Moondream
- faster-whisper

## Local AI models

The project is designed to run without cloud AI APIs.

Recommended local model configuration:

```env
OLLAMA_MODEL=gemma4:26b
OLLAMA_MODEL_1=nomic-embed-text:latest
MOONDREAM_MODEL=moondream
```

The exact model can be changed through environment variables without changing application code.

## Repository structure

```text
DRDO-AI-Offline-Assistant/
│
├── backend/
│   ├── app/
│   ├── auth/
│   ├── database/
│   ├── models/
│   ├── routes/
│   ├── schemas/
│   ├── services/
│   ├── utils/
│   ├── uploads/              # runtime data; do not commit sensitive files
│   ├── chroma_db/            # runtime vector store; do not commit
│   ├── drdo_ai.db            # local database; do not commit
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── api/
│       ├── components/
│       ├── context/
│       ├── hooks/
│       ├── pages/
│       └── routes/
│
├── docs/
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── DESIGN.md
│   ├── API.md
│   ├── TEST_PLAN.md
│   ├── SECURITY.md
│   ├── DECISIONS.md
│   └── MEMORY.md
│
├── .cursor/
│   └── rules/
├── .env.example
├── .gitignore
├── RULES.md
├── TASKS.md
└── README.md
```

## Local setup

### 1. Clone the repository

```bash
git clone <your-repository-url>
cd DRDO-AI-Offline-Assistant
```

### 2. Backend

```bash
cd backend
python -m venv .venv
```

Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a `.env` file from the root `.env.example` and fill in local values.

Start the API:

```bash
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### 3. Ollama

Install Ollama locally and make the required models available on the same machine.

Example:

```bash
ollama pull gemma4:26b
ollama pull nomic-embed-text:latest
ollama pull moondream
```

Verify:

```bash
ollama list
```

The backend uses the local Ollama API configured by `OLLAMA_BASE_URL`.

### 4. Tesseract OCR

Install Tesseract locally. If it is not discoverable from PATH, set `TESSERACT_CMD` in `.env` to the local executable path.

### 5. Frontend

```bash
cd frontend
npm ci
npm run dev
```

Set the frontend API URL in the frontend environment file, for example:

```env
VITE_BASE_URL=http://127.0.0.1:8000
```

## Offline operation

The application is designed around local services:

- local FastAPI backend
- local SQLite database
- local ChromaDB vector store
- local Ollama inference
- local Tesseract OCR
- local faster-whisper model

A fully air-gapped deployment requires all Python packages, Node packages, model files and system installers to be staged on the target machine before disconnecting it from the internet.

## Security model

The application uses three clearance levels:

```text
Public
  ↓
Confidential
  ↓
Secret
```

A higher clearance can access lower-level documents, but a lower clearance cannot access higher-level documents.

Security controls include:

- JWT authentication
- administrator approval
- bcrypt password hashing
- clearance checks on the backend
- document ownership checks for attachment-scoped questions
- server-side authorization
- audit logs
- administrator re-authentication for secure account actions
- password reset instead of password disclosure
- input validation
- restricted file types
- attachment-scoped RAG
- client-side security deterrence (not treated as the primary security boundary)

## Development documentation

- [Product Requirements](docs/PRD.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Design System](docs/DESIGN.md)
- [API Reference](docs/API.md)
- [Security Requirements](docs/SECURITY.md)
- [Test Plan](docs/TEST_PLAN.md)
- [Architecture Decisions](docs/DECISIONS.md)
- [Project Memory](docs/MEMORY.md)
- [Development Rules](RULES.md)
- [Task Board](TASKS.md)

## Disclaimer

This project is a software engineering and research implementation. It must only be used with information and systems for which the operator has appropriate authorization. The assistant is designed to answer from authorized local document context and should not be treated as an autonomous authority for operational decisions.
