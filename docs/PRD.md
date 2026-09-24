# Product Requirements Document

## 1. Product

**DRDO AI – Offline Defence Assistant**

## 2. Problem

Technical and defence-related documents can be large, distributed across files, difficult to search manually, and unsuitable for sending to external cloud AI services when information must remain inside a controlled environment.

The project provides a local AI assistant that can ingest authorized documents, retrieve relevant information, and answer questions without depending on a cloud AI provider.

## 3. Goal

Build an offline-first knowledge assistant that:

1. keeps document data on the local system;
2. provides natural-language question answering over authorized documents;
3. respects Public, Confidential and Secret clearance levels;
4. supports text and visual document content;
5. provides an administrator-controlled user lifecycle;
6. records important security and administrative actions;
7. supports local voice input.

## 4. Target users

### Ordinary user

A normal approved user whose access is determined by the clearance assigned by an administrator.

### Confidential user

An approved user with Confidential clearance and access to Public + Confidential material.

### Secret user

An approved user with Secret clearance and access to Public + Confidential + Secret material.

### Administrator

Manages users, clearances, approvals, documents, secure accounts and audit logs.

## 5. Core features

### Authentication and account management

- Sign up
- Login
- JWT authentication
- Remembered local session
- Admin approval for normal registrations
- Pending approval state
- Profile management
- Secure password recovery using security questions
- Recovery attempt limit and account blocking

### Clearance and authorization

- Public clearance
- Confidential clearance
- Secret clearance
- Server-side clearance enforcement
- Clearance-aware document listing and retrieval
- Admin-controlled user clearance

### Document management

Supported document types include:

- PDF
- DOCX
- TXT
- XLS
- XLSX
- JPG/JPEG
- PNG
- WEBP
- AVIF
- BMP
- GIF
- TIF/TIFF

The ingestion pipeline can use:

- text extraction
- Tesseract OCR
- Moondream visual analysis
- text chunking
- local embeddings
- ChromaDB storage

### RAG question answering

- Natural-language questions
- Clearance-aware retrieval
- Local embedding generation
- Local LLM answer generation
- Source filenames in responses
- Grounded-answer prompt rules
- No-answer behavior when authorized context is insufficient

### Attachment-aware chat

- Upload an attachment from the chat composer
- Store attachment metadata with the user message
- Ask a question about the exact attachment
- Restrict retrieval to the selected document ID(s)
- Verify ownership and clearance server-side
- Prevent unrelated indexed documents from being used for an attachment-scoped answer

### Chat management

- New chat
- Chat history
- Rename chat
- Pin/unpin chat
- Delete chat
- Message persistence
- Attachment display

### Voice

- Local audio upload from the voice recorder
- faster-whisper transcription
- Local transcription result returned to the frontend

### Administration

- Admin dashboard
- Pending user approval/rejection
- User management
- Secure user creation
- Document management
- Audit logs
- Secure details with administrator re-authentication
- Administrator-authorized password reset for Confidential/Secret accounts

## 6. UI/UX requirements

- Professional technical interface
- Light mode as default
- Dark mode as alternate theme
- Responsive layout
- ChatGPT-style conversation layout
- Collapsible sidebar
- Clear classification display
- Clear attachment previews
- Loading, error and empty states
- Readable Markdown answers and code blocks
- Accessible forms and clear validation messages

## 7. Non-functional requirements

### Offline-first

Core AI, retrieval, OCR and voice features should work with local services after the required packages, models and system dependencies have been staged.

### Security

Authorization must be enforced on the backend. Client-side controls are not considered a security boundary.

### Grounding

The LLM should answer from authorized retrieved context and should not intentionally supplement missing facts with general model knowledge.

### Maintainability

Frontend presentation, backend routes, services, database models and AI/RAG logic should remain separated.

### Auditability

Security-sensitive actions should be represented in audit logs where implemented by the backend.

## 8. MVP scope

The current MVP consists of:

- Authentication
- Admin approval
- Clearance management
- Document upload and ingestion
- RAG retrieval
- Local LLM answering
- Multimodal document/image processing
- Chat history
- Attachment-aware questions
- Voice transcription
- Admin dashboard
- Audit logging
- Secure account password reset
- Light/dark theme

## 9. Out of scope

The current project does not require:

- Cloud AI APIs
- Cloud-hosted vector databases
- Online payment systems
- Social networking features
- Public sharing of documents
- Autonomous operational decision-making
- Mobile-native application
- Internet-dependent AI inference

## 10. Success criteria

A successful local deployment should allow an authorized user to:

1. create an account and wait for administrator approval;
2. log in after approval;
3. receive the correct clearance-based access;
4. upload an authorized document;
5. see the document processed into the local knowledge base;
6. ask a question and receive a grounded answer;
7. be prevented from retrieving higher-clearance information;
8. ask a question about a specific uploaded attachment and receive an answer scoped to that attachment;
9. use voice input through the local Whisper model;
10. maintain and revisit previous conversations.
