# Architecture Decisions

This document records decisions that should not be changed casually during future AI-assisted development.

## ADR-001 — Offline-first AI architecture

**Decision:** Use local inference and local data services instead of cloud AI APIs for the core system.

**Reason:** The project is intended for controlled environments where documents should remain local and internet dependency should be minimized.

**Result:** Ollama, ChromaDB, SQLite, Tesseract and faster-whisper are part of the local stack.

## ADR-002 — React + Vite frontend

**Decision:** Use React with Vite rather than replacing the frontend with a different full-stack framework.

**Reason:** The current project has a clear client/server separation and the frontend is already organized around React components, routes, contexts and API modules.

## ADR-003 — FastAPI backend

**Decision:** Use Python FastAPI as the backend API layer.

**Reason:** The AI, document processing, OCR and speech ecosystem used by the project is Python-friendly, while FastAPI provides a lightweight API boundary for the React client.

## ADR-004 — SQLite + SQLAlchemy

**Decision:** Use SQLite with SQLAlchemy for application metadata and local persistence.

**Reason:** The project is designed for local/offline deployment and does not require a network database for the current scope.

## ADR-005 — ChromaDB for local vector retrieval

**Decision:** Use persistent local ChromaDB for document embeddings and semantic retrieval.

**Reason:** It provides local vector storage without introducing a cloud vector database dependency.

## ADR-006 — Ollama for local model serving

**Decision:** Use Ollama as the local model runtime.

**Reason:** It provides a simple local HTTP interface for the LLM and embedding models and fits the offline architecture.

## ADR-007 — Clearance levels

**Decision:** Use three document/user clearance levels: Public, Confidential and Secret.

**Reason:** This matches the project's required classification model and keeps authorization rules explicit.

## ADR-008 — Backend-enforced authorization

**Decision:** Treat frontend controls as presentation only; all sensitive authorization decisions must be made by the backend.

**Reason:** Browser-side checks can be bypassed and therefore cannot protect classified resources.

## ADR-009 — Attachment-scoped retrieval

**Decision:** Attachment questions must pass exact document IDs into the retrieval layer.

**Reason:** A user asking about an uploaded file should not accidentally receive context from unrelated indexed documents.

## ADR-010 — Password reset instead of password disclosure

**Decision:** Never expose or attempt to recover an existing password from its bcrypt hash. Administrator secure-details functionality performs a controlled password reset instead.

**Reason:** bcrypt hashes are one-way and password disclosure would create a serious security weakness.

## ADR-011 — Multimodal ingestion

**Decision:** Process supported images and image-containing PDF/DOCX content using Tesseract OCR plus Moondream where enabled.

**Reason:** Text extraction alone is insufficient for diagrams, photographs, tables and other visual content.

## ADR-012 — Light mode as default

**Decision:** Use light mode as the default visual theme and dark mode as an alternative.

**Reason:** This is the established project UI preference and provides a clear default for general users.

## ADR-013 — No silent architecture changes by AI tools

**Decision:** AI coding tools must read this document and the project rules before changing architecture, dependencies, authentication, retrieval or security behavior.

**Reason:** Repeated architectural changes make the project difficult to maintain and can introduce security regressions.
