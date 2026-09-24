# API Reference

The backend exposes REST-style endpoints through FastAPI.

Base URL during local development:

```text
http://127.0.0.1:8000
```

Authentication uses a Bearer JWT token for protected routes.

## Authentication

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/auth/signup` | Register a normal user; account starts Pending |
| POST | `/auth/login` | Login and receive access token |
| POST | `/auth/token` | OAuth2-compatible login endpoint |
| POST | `/auth/forgot-password/questions` | Get recovery questions |
| POST | `/auth/forgot-password/verify` | Verify recovery answers |
| POST | `/auth/forgot-password/reset` | Reset password using valid recovery flow |
| POST | `/auth/profile/update` | Secure profile update flow |

## Protected profile

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/protected/profile` | Get current profile |
| PUT | `/protected/profile` | Update profile |
| GET | `/protected/secret` | Example clearance-protected resource |

## Documents

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/documents/upload` | Upload and ingest a document |
| GET | `/documents/` | List documents available to the current clearance |
| GET | `/documents/{document_id}/download` | Download an authorized document |
| DELETE | `/documents/{document_id}` | Delete an authorized document |

Supported upload types in the current implementation:

```text
.pdf
.docx
.txt
.xls
.xlsx
.jpg
.jpeg
.png
.webp
.avif
.bmp
.gif
.tif
.tiff
```

## AI / RAG

### POST `/ai/ask`

Ask a question.

Request shape:

```json
{
  "conversation_id": 1,
  "question": "What does the document say about ...?",
  "attachment_document_ids": []
}
```

For attachment-scoped questions, `attachment_document_ids` contains the exact document IDs linked to the current user message.

The backend validates:

- conversation ownership
- document existence
- clearance
- attachment ownership
- message attachment linkage

### POST `/ai/retrieve`

Retrieve authorized chunks without generating an LLM answer.

Uses the same clearance and attachment restrictions as the question path.

## Chat

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/chat/new` | Create a new chat |
| GET | `/chat/` | List chats |
| POST | `/chat/{conversation_id}/message` | Add a message |
| GET | `/chat/{conversation_id}/messages` | Get messages |
| PUT | `/chat/{conversation_id}/rename` | Rename chat |
| PUT | `/chat/{conversation_id}/pin` | Pin/unpin chat |
| GET | `/chat/{conversation_id}` | Get a chat |
| DELETE | `/chat/{conversation_id}` | Delete chat |

The project also contains a conversation service/router for equivalent conversation management operations.

## Voice

### POST `/voice/transcribe`

Accepts an audio upload and returns locally generated speech-to-text output using faster-whisper.

## Admin

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/admin/secure-users` | Create Confidential/Secret user |
| POST | `/admin/secure-details/verify` | Re-authenticate admin and view secure account details |
| POST | `/admin/secure-details/{user_id}/reset-password` | Administrator-authorized password reset |
| GET | `/admin/pending` | List pending registrations |
| PUT | `/admin/approve/{user_id}` | Approve a user |
| PUT | `/admin/reject/{user_id}` | Reject a user |
| GET | `/admin/dashboard` | Dashboard statistics |
| GET | `/admin/users` | List users |
| PUT | `/admin/users/{user_id}` | Update user role/clearance/status |
| DELETE | `/admin/users/{user_id}` | Delete user |
| GET | `/admin/documents` | Admin document listing |
| GET | `/admin/documents/{document_id}/download` | Admin document download |
| DELETE | `/admin/documents/{document_id}` | Admin document deletion |

## Audit logs

### GET `/audit/logs`

Returns audit information available to the authorized administrator path.

## Security notes

Do not treat endpoint names as security controls. Every sensitive operation must validate the authenticated user and authorization on the backend.
