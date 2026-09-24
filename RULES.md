# Development Rules

## 1. General

- Preserve the existing React + FastAPI + SQLite + ChromaDB architecture unless a documented architecture decision changes it.
- Read `README.md`, `docs/ARCHITECTURE.md`, `docs/SECURITY.md` and relevant task/documentation files before making major changes.
- Reuse existing components and services before creating duplicates.
- Keep functions focused and avoid unnecessary rewrites.
- Do not modify unrelated files while implementing a task.
- Prefer small, reviewable changes.

## 2. Before coding

1. Inspect the existing implementation.
2. Read the relevant documentation.
3. Identify the exact files that need changing.
4. Consider security and authorization impact.
5. Make a short implementation plan for large changes.
6. After coding, run the relevant build/lint/tests.

## 3. Frontend

- Use React components and existing project conventions.
- Use Tailwind CSS for styling unless an existing component requires another approach.
- Keep light mode as the default.
- Preserve dark mode support.
- Keep the interface responsive.
- Add loading, empty and error states to data-driven screens.
- Do not put backend/database logic in UI components.
- Use the existing Axios API layer.
- Do not hard-code backend URLs; use `VITE_BASE_URL`.
- Preserve attachment metadata when rendering/sending chat messages.

## 4. Backend

- Use FastAPI routes for HTTP boundaries.
- Put complex business logic in services.
- Validate request input with Pydantic where appropriate.
- Use the authenticated user dependency for protected resources.
- Check authorization on the backend even when the frontend already hides an action.
- Keep clearance enforcement close to the resource/retrieval boundary.
- Do not trust client-supplied document IDs.

## 5. AI/RAG

- Core AI inference must remain local.
- Use the configured Ollama models through environment variables.
- Do not add a cloud AI provider as a silent fallback.
- Retrieval must respect clearance.
- Attachment-scoped questions must respect exact attachment document IDs.
- Conversation history may provide conversational context but must not become factual evidence.
- Do not instruct the LLM to invent missing information.
- Preserve source filenames returned by the retrieval pipeline.

## 6. Security

- Never commit secrets.
- Never log plaintext passwords or recovery answers.
- Never expose password hashes.
- Use password reset instead of attempting password recovery from bcrypt hashes.
- Treat all client input as untrusted.
- Do not rely on disabled right-click, keyboard shortcuts or similar browser controls for security.
- Do not bypass clearance checks to make a UI feature work.

## 7. Files and documents

- Validate file types before processing.
- Do not commit real defence/confidential/secret documents.
- Do not commit local SQLite or ChromaDB runtime state.
- Keep upload directories out of version control except for safe placeholder files if needed.

## 8. Testing

After a meaningful change:

- run frontend lint/build as applicable;
- run the affected backend flow;
- test authentication/authorization if security-related;
- test RAG if retrieval-related;
- test attachment handling if chat/upload-related;
- test both light and dark themes for UI changes.

Never mark a task complete only because the code was written.

## 9. Git

Use small commits with clear messages, for example:

```text
feat: add attachment-scoped RAG validation
fix: enforce confidential document clearance
feat: add admin secure password reset
refactor: separate document ingestion service
```

Do not commit:

- `.env`
- secrets
- passwords
- database files
- ChromaDB data
- uploaded documents
- virtual environments
- `node_modules`
- build output

## 10. AI coding assistant rule

AI coding tools must not:

- replace the architecture without a documented decision;
- remove security checks to fix an error quickly;
- invent API endpoints that do not match the backend;
- change model providers without approval;
- silently change clearance semantics;
- overwrite unrelated functionality;
- claim a feature is implemented without verifying the current files.
