# Architecture

## 1. Architecture style

The project uses a local full-stack architecture with a React frontend, FastAPI backend, SQLite relational storage, ChromaDB vector storage and locally hosted AI models.

```text
┌──────────────────────────────┐
│        React Frontend        │
│ React + Vite + Tailwind CSS  │
└──────────────┬───────────────┘
               │ HTTP + JWT
               ▼
┌──────────────────────────────┐
│        FastAPI Backend       │
│ Routes + Auth + Services     │
└───────┬──────────┬───────────┘
        │          │
        │          ├──────────────────────┐
        ▼          ▼                      ▼
┌────────────┐ ┌──────────────┐   ┌────────────────┐
│   SQLite   │ │   ChromaDB   │   │ Local AI       │
│ SQLAlchemy │ │ Vector Store │   │ Ollama/Whisper │
└────────────┘ └──────────────┘   └────────────────┘
                                      │
                         ┌────────────┼────────────┐
                         ▼            ▼            ▼
                      Gemma      Moondream   faster-whisper
                         │            │            │
                         ▼            ▼            ▼
                      Answers     Vision       Speech
```

## 2. Frontend architecture

### Main technologies

- React 19
- Vite
- Tailwind CSS v4
- React Router
- Axios
- Context API for shared theme/chat state

### Frontend layers

```text
pages/
  Page-level screens and route targets

components/
  Reusable UI and feature components

api/
  HTTP client and API modules

context/
  Shared application state

hooks/
  Reusable React hooks

routes/
  Route protection and route configuration
```

### Important frontend areas

```text
src/
├── api/
├── assets/
├── components/
│   ├── admin/
│   ├── auth/
│   ├── chat/
│   ├── common/
│   ├── help/
│   ├── layout/
│   └── particles/
├── context/
├── hooks/
├── pages/
└── routes/
```

## 3. Backend architecture

```text
backend/
├── app/
│   └── main.py
├── auth/
│   ├── dependencies.py
│   ├── hashing.py
│   └── jwt_handler.py
├── database/
│   ├── base.py
│   └── db.py
├── models/
├── routes/
├── schemas/
├── services/
└── utils/
```

### Responsibilities

**Routes**
- Receive HTTP requests.
- Validate request data.
- Resolve the current user.
- Enforce endpoint-level authorization.
- Call services.
- Return API responses.

**Services**
- Contain AI, RAG, ingestion, audit, chat and account logic.
- Keep complex operations out of route handlers where practical.

**Models**
- Define SQLite/SQLAlchemy persistence structures.

**Schemas**
- Define request/response validation models.

**Auth**
- JWT token creation/validation.
- Password hashing and verification.
- Current-user dependency.

## 4. Authentication flow

```text
Signup
  ↓
User stored as Pending
  ↓
Administrator reviews account
  ├── Reject → access denied
  └── Approve
        ↓
     Login
        ↓
   JWT access token
        ↓
Protected API request
        ↓
Backend validates token + user status + active state
```

## 5. Clearance model

```text
Public        → Public
Confidential  → Public + Confidential
Secret        → Public + Confidential + Secret
```

The backend maps each clearance to a numeric level:

```text
Public = 1
Confidential = 2
Secret = 3
```

A document can be used only when its classification level is less than or equal to the user's clearance level.

## 6. Document ingestion architecture

```text
Upload
  ↓
Validate extension + classification + clearance
  ↓
Store original file in classified upload directory
  ↓
Create Document record
  ↓
Detect file type
  ├── PDF ──────────────┐
  ├── DOCX              │
  ├── TXT/XLS/XLSX      ├── Text extraction
  └── Image ────────────┘
                         │
PDF/DOCX/Image ──► Tesseract OCR
                         │
PDF/DOCX/Image ──► Moondream visual analysis
                         │
                         ▼
                   Combined content
                         ↓
                      Chunking
                         ↓
              Local embedding model
                         ↓
                      ChromaDB
```

## 7. RAG architecture

```text
User question
     ↓
Create query embedding
     ↓
Determine allowed classifications
     ↓
ChromaDB similarity search
     ↓
Filter by clearance
     │
     ├── Normal question → authorized corpus
     │
     └── Attachment question → exact document ID(s)
     ↓
Build authorized context
     ↓
Local Ollama LLM
     ↓
Grounded answer + source filenames
```

The current RAG implementation deliberately uses conversation history only as conversational context. It is not treated as factual evidence.

## 8. Attachment-aware RAG

Attachment mode adds an additional server-side restriction:

1. The document ID must exist.
2. The document must be within the user's clearance.
3. The document must have been uploaded by the current user for chat attachment use.
4. The document ID must be linked to the user's message.
5. ChromaDB retrieval is filtered to the exact document ID(s).
6. Conversation history is not supplied as factual context for attachment-scoped answering.

This prevents a question about one attachment from silently retrieving unrelated indexed documents.

## 9. Multimodal processing

### Standalone image

```text
Image
 ↓
Pillow normalization
 ↓
Tesseract OCR ─────┐
                   ├── Combined visual knowledge
Moondream ─────────┘
                   ↓
                Chunking
                   ↓
               Embeddings
                   ↓
                ChromaDB
```

### PDF/DOCX

Text extraction is combined with OCR and visual analysis where images are available.

## 10. Voice architecture

```text
Browser microphone
       ↓
Audio upload
       ↓
FastAPI /voice/transcribe
       ↓
faster-whisper
       ↓
Transcribed text
       ↓
Chat composer
```

## 11. Persistence

### SQLite tables/models

- `users`
- `documents`
- `conversations`
- `messages`
- `audit_logs`
- `security_answers`
- `password_recovery`

### ChromaDB

Stores embedded document chunks and metadata such as:

- document ID
- filename
- classification
- uploader
- chunk index
- page where available
- content type/source metadata

## 12. Architectural rules

- Authentication and authorization are backend responsibilities.
- UI components should not directly implement database operations.
- AI and retrieval logic belongs in backend services.
- Document classification must be enforced before retrieval.
- Attachment IDs must be validated server-side.
- Passwords must never be stored or returned in plaintext.
- Real secrets and sensitive documents must remain outside Git.
- Cloud AI services are not required for core inference.
