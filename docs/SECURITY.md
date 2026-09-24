# Security Requirements

## 1. Security objective

The project is designed for controlled local use where document access must be restricted by user clearance and sensitive data should remain on the local infrastructure.

Security is enforced primarily by the backend, database access rules, document authorization and local deployment controls.

## 2. Authentication

- Use JWT access tokens for protected API calls.
- Reject invalid or expired tokens.
- Require approved account status for normal protected access.
- Reject inactive accounts.
- Hash passwords with bcrypt.
- Never store plaintext passwords.

## 3. Authorization

The backend must verify:

1. authenticated identity;
2. account status;
3. active account state;
4. role where administrator access is required;
5. clearance for classified resources;
6. ownership for attachment-scoped document use.

## 4. Clearance model

```text
Public        = level 1
Confidential  = level 2
Secret        = level 3
```

Allowed access:

| User clearance | Allowed document classifications |
|---|---|
| Public | Public |
| Confidential | Public, Confidential |
| Secret | Public, Confidential, Secret |

A request for a higher classification must return an authorization error rather than exposing the content.

## 5. Attachment security

Attachment IDs are untrusted client input.

For every attachment-scoped AI request, the backend must:

- parse and normalize document IDs;
- confirm that every document exists;
- verify clearance;
- verify uploader ownership where required;
- verify that the document ID is linked to the current user message;
- pass only the validated IDs to ChromaDB retrieval.

## 6. RAG security

The retrieval layer must always include clearance filtering.

Normal question:

```text
Question → clearance filter → semantic retrieval → LLM
```

Attachment question:

```text
Question + exact attachment IDs
        ↓
ownership + clearance + linkage validation
        ↓
exact-document retrieval
        ↓
LLM
```

Conversation history must not become an alternative factual source.

## 7. Prompt grounding

The local LLM prompt instructs the model to:

- use only authorized document context;
- avoid outside knowledge;
- avoid invented facts;
- respect classification restrictions;
- return a standard no-information response when context is insufficient;
- list only sources that actually contributed to the answer.

Prompt rules are not a replacement for backend authorization. The retrieval layer must enforce the boundary before context reaches the model.

## 8. Password security

Existing password hashes must never be displayed.

Administrator secure-details functionality therefore uses:

```text
Admin re-authentication
        ↓
Select secure user
        ↓
Set new password
        ↓
Hash with bcrypt
        ↓
Audit log
```

The system must not attempt to reverse bcrypt hashes.

## 9. Password recovery

Security questions are stored using hashed answers.

Recovery protection includes:

- normalized answer handling;
- hashed recovery answers;
- failed-attempt tracking;
- ban/block state after the configured maximum failed attempts;
- expiring reset token handling where applicable.

## 10. File upload security

Validate at minimum:

- extension/type;
- classification;
- user clearance;
- file storage path;
- ownership for later attachment use.

Do not trust an original filename as an authorization mechanism.

Sensitive uploaded documents must not be committed to Git.

## 11. Secrets

Never commit:

- `.env`
- JWT secret keys
- admin passwords
- API keys
- private model credentials
- recovery secrets
- production database files
- sensitive documents

Use `.env.example` for documentation only.

## 12. Client-side protection

The current frontend includes a client-side security guard that can deter common browser shortcuts such as context menu, developer-tool shortcuts and view-source shortcuts.

This is **not a real security boundary**. A determined user can bypass browser-side JavaScript. The actual security boundary is backend authentication, authorization, clearance filtering and controlled deployment.

## 13. Audit logging

Security-sensitive actions should be recorded where implemented, including actions such as:

- login-related events where logged;
- document upload/delete;
- AI queries;
- user approval/rejection;
- secure user creation;
- secure-details access;
- administrator password reset.

## 14. Local deployment security

For controlled/offline environments:

- restrict access to the host machine/network;
- use a firewall;
- avoid exposing the API to the public internet;
- protect the SQLite database and ChromaDB directory;
- protect uploaded files and model directories;
- keep backups under appropriate access control;
- use only authorized source documents.

## 15. Security checklist

- [ ] `.env` excluded from Git
- [ ] database excluded from Git
- [ ] ChromaDB excluded from Git
- [ ] uploads excluded from Git
- [ ] passwords hashed
- [ ] JWT secret configured locally
- [ ] admin password configured locally
- [ ] clearance checks tested
- [ ] attachment ownership tested
- [ ] attachment exact-document retrieval tested
- [ ] unauthorized downloads tested
- [ ] admin-only endpoints tested
- [ ] recovery lockout tested
- [ ] audit logs reviewed
