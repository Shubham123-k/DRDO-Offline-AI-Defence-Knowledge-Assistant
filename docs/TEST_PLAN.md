# Test Plan

## 1. Purpose

This document defines what must be verified before treating the application as ready for demonstration or final submission.

The checklist describes expected behavior. A checked item should only be marked complete after it has actually been tested on the current build.

## 2. Environment matrix

Test at minimum:

- Windows development machine
- local Ollama running
- SQLite initialized
- ChromaDB initialized
- Tesseract installed
- Whisper model available

Frontend viewport checks:

- 375px
- 768px
- 1024px
- 1440px

## 3. Authentication tests

### AUTH-001 Signup

- [ ] Valid signup creates a Pending account.
- [ ] Duplicate username is rejected.
- [ ] Duplicate email is rejected.
- [ ] Invalid email is rejected.
- [ ] Empty required fields are rejected.

### AUTH-002 Approval

- [ ] Pending account cannot use protected APIs.
- [ ] Admin can approve account.
- [ ] Approved account can log in.
- [ ] Rejected account cannot use protected APIs.

### AUTH-003 Login

- [ ] Correct credentials return a token.
- [ ] Wrong password is rejected.
- [ ] Unknown account is rejected.
- [ ] Inactive account is rejected.
- [ ] Invalid/expired token is rejected.

## 4. Clearance tests

### CLR-001 Public user

- [ ] Public documents are accessible.
- [ ] Confidential documents are denied.
- [ ] Secret documents are denied.

### CLR-002 Confidential user

- [ ] Public documents are accessible.
- [ ] Confidential documents are accessible.
- [ ] Secret documents are denied.

### CLR-003 Secret user

- [ ] Public documents are accessible.
- [ ] Confidential documents are accessible.
- [ ] Secret documents are accessible.

## 5. Document ingestion tests

- [ ] PDF upload works.
- [ ] DOCX upload works.
- [ ] TXT upload works.
- [ ] XLS/XLSX upload works.
- [ ] JPG/JPEG upload works.
- [ ] PNG upload works.
- [ ] WEBP upload works.
- [ ] Unsupported extension is rejected.
- [ ] Classification is stored correctly.
- [ ] File is stored under the correct classification directory.
- [ ] Document metadata is saved in SQLite.
- [ ] ChromaDB receives chunks.

## 6. OCR and multimodal tests

- [ ] Image containing readable text produces OCR content.
- [ ] Image without readable text can still produce visual description when Moondream is enabled.
- [ ] Image with both text and visual content combines both sources.
- [ ] PDF pages containing images are processed where applicable.
- [ ] DOCX embedded raster images are processed.
- [ ] Moondream failure does not silently destroy available OCR/text content.

## 7. RAG tests

- [ ] Query embedding is created locally.
- [ ] Retrieval respects clearance.
- [ ] Retrieval returns relevant chunks for an indexed document.
- [ ] Source filenames correspond to retrieved context.
- [ ] Empty retrieval produces the configured no-information response.
- [ ] Conversation history does not become factual evidence.

## 8. Attachment-aware RAG tests

### ATT-001 Correct attachment

- [ ] Upload an image/document in the chat.
- [ ] Ask a question referring to that attachment.
- [ ] The message stores attachment metadata.
- [ ] The request contains the correct document ID.
- [ ] Retrieval is filtered to that document ID.
- [ ] Answer does not use unrelated indexed documents.

### ATT-002 Missing attachment

- [ ] Ask “What is this image about?” without an attachment.
- [ ] System asks the user to attach the referenced image/document.
- [ ] No unrelated old document is silently retrieved.

### ATT-003 Unauthorized attachment

- [ ] Invalid document ID is rejected.
- [ ] Higher-clearance attachment is rejected.
- [ ] Another user's attachment is rejected.
- [ ] An ID not linked to the current message is rejected.

## 9. Chat tests

- [ ] New chat can be created.
- [ ] User messages persist.
- [ ] Assistant messages persist.
- [ ] Attachments remain visible in history.
- [ ] Chat can be renamed.
- [ ] Chat can be pinned/unpinned.
- [ ] Chat can be deleted.
- [ ] History is isolated by user.

## 10. Voice tests

- [ ] Voice recorder can capture audio.
- [ ] Audio reaches `/voice/transcribe`.
- [ ] faster-whisper returns transcription.
- [ ] Transcription is inserted into the chat composer.
- [ ] Invalid/empty audio is handled cleanly.
- [ ] CPU fallback configuration works when CUDA is unavailable.

## 11. Admin tests

- [ ] Non-admin cannot access admin endpoints.
- [ ] Admin can view dashboard.
- [ ] Admin can approve/reject pending users.
- [ ] Admin can update user role/clearance/status.
- [ ] Admin can create Confidential/Secret users.
- [ ] Admin can manage documents.
- [ ] Admin can inspect audit logs.
- [ ] Secure-details endpoint requires admin password re-authentication.
- [ ] Existing passwords are never returned.
- [ ] Secure user password reset creates a new bcrypt hash.

## 12. Recovery tests

- [ ] Security questions can be requested for a valid account.
- [ ] Correct answers pass verification.
- [ ] Wrong answers increment failed attempts.
- [ ] Maximum failed attempts cause the configured block/ban behavior.
- [ ] A valid reset flow can set a new password.
- [ ] Reset token expiry is enforced.

## 13. UI/UX tests

- [ ] Light mode is the default on first use.
- [ ] Dark mode works.
- [ ] Theme persists after refresh.
- [ ] Sidebar can open/close.
- [ ] Chat layout works on mobile width.
- [ ] Loading states are visible.
- [ ] Errors are readable.
- [ ] Empty states are understandable.
- [ ] Attachment previews are readable.
- [ ] Admin screens remain usable at smaller widths.

## 14. Offline tests

Disconnect the machine from the internet after staging dependencies and models.

- [ ] Login works locally.
- [ ] Existing local database works.
- [ ] Ollama inference works locally.
- [ ] Embeddings work locally.
- [ ] ChromaDB retrieval works locally.
- [ ] Tesseract works locally.
- [ ] Whisper works locally.
- [ ] No cloud AI API is required for the core flow.

## 15. Regression rule

Before a release/demo build:

```text
Change
  ↓
Run affected tests
  ↓
Run authentication/authorization regression
  ↓
Run RAG regression
  ↓
Run UI smoke test
  ↓
Run production/offline checklist
```

Do not mark a test as passed only because the code appears correct; execute the scenario on the current build.
