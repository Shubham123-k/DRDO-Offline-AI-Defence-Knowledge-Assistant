# Project Tasks

This task board is intentionally practical. Use it to guide incremental AI-assisted development rather than asking an AI coding tool to rewrite the entire project at once.

## Phase 1 — Repository and environment

- [x] React/Vite frontend exists.
- [x] FastAPI backend exists.
- [x] SQLite/SQLAlchemy setup exists.
- [x] Environment-variable configuration exists.
- [ ] Clean runtime files from the Git repository.
- [ ] Add final root README and documentation.

## Phase 2 — Authentication and users

- [x] Signup flow.
- [x] Pending approval state.
- [x] Admin approval/rejection.
- [x] JWT login.
- [x] Password hashing.
- [x] Protected routes.
- [x] Profile management.
- [x] Security-question recovery flow.
- [x] Recovery failed-attempt tracking/blocking.
- [ ] Execute final authentication regression suite.

## Phase 3 — Clearance and security

- [x] Public clearance.
- [x] Confidential clearance.
- [x] Secret clearance.
- [x] Backend clearance checks.
- [x] Admin role checks.
- [x] Audit log service.
- [x] Secure user creation.
- [x] Secure details admin re-authentication.
- [x] Secure user password reset.
- [x] Client-side security deterrence.
- [ ] Complete security regression testing.

## Phase 4 — Document ingestion

- [x] PDF ingestion.
- [x] DOCX ingestion.
- [x] TXT/XLS/XLSX ingestion.
- [x] Image ingestion.
- [x] Tesseract OCR integration.
- [x] Moondream visual analysis.
- [x] Chunking.
- [x] Local embeddings.
- [x] ChromaDB storage.
- [ ] Test every supported file type on the final machine.

## Phase 5 — RAG

- [x] Query embeddings.
- [x] Clearance-aware retrieval.
- [x] Local LLM answer generation.
- [x] Grounded prompt.
- [x] Source filenames.
- [x] Attachment-specific retrieval.
- [x] Missing-attachment guard.
- [x] Attachment ownership validation.
- [ ] Run final RAG regression dataset.

## Phase 6 — Chat

- [x] New chat.
- [x] Chat history.
- [x] Rename chat.
- [x] Pin/unpin.
- [x] Delete chat.
- [x] Message persistence.
- [x] Attachment metadata persistence.
- [x] Attachment preview/display.
- [ ] Final UI regression on desktop and mobile widths.

## Phase 7 — Voice

- [x] Voice endpoint.
- [x] faster-whisper integration.
- [x] Frontend voice recorder.
- [ ] Verify CUDA configuration on target system.
- [ ] Verify CPU fallback.
- [ ] Run final voice quality/smoke test.

## Phase 8 — Final offline deployment

- [ ] Stage Python wheels if air-gapped deployment is required.
- [ ] Stage Node dependencies.
- [ ] Stage Ollama models.
- [ ] Stage Tesseract installer/runtime.
- [ ] Stage Whisper model.
- [ ] Configure `.env` on target machine.
- [ ] Verify application without internet access.
- [ ] Verify firewall/network settings.
- [ ] Back up SQLite and ChromaDB securely.

## Phase 9 — GitHub release preparation

- [ ] Remove database files from repository.
- [ ] Remove ChromaDB data from repository.
- [ ] Remove uploaded documents from repository.
- [ ] Remove `.env` and local secrets.
- [ ] Review `.gitignore`.
- [ ] Review README.
- [ ] Review security documentation.
- [ ] Review dependency files.
- [ ] Run frontend build/lint.
- [ ] Run backend smoke tests.
- [ ] Create initial release commit.

## Working method

```text
TASK-001
   ↓
Inspect
   ↓
Plan
   ↓
Implement
   ↓
Test
   ↓
Review security impact
   ↓
Commit
   ↓
Next task
```
