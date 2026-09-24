# Design System

## 1. Product style

The interface should feel:

- professional
- clean
- technical
- controlled
- modern
- easy to use
- suitable for a defence/research environment

The visual language should not become unnecessarily decorative. Clarity and information hierarchy are more important than visual effects.

## 2. Theme

### Default

**Light mode** is the default theme.

### Alternate

**Dark mode** is supported as an alternate theme.

Theme selection is persisted locally so the user's preference remains available between sessions.

## 3. Typography

Primary font:

```text
Inter
```

Typography should prioritize readability in long chat responses, document names, tables, forms and administrative screens.

## 4. Layout

### Chat application

```text
┌───────────────┬───────────────────────────────────────┐
│ Sidebar       │ Chat Header                           │
│               ├───────────────────────────────────────┤
│ Logo          │                                       │
│ New Chat      │ Conversation                          │
│ History       │                                       │
│               │                                       │
│               │ User message                          │
│ Profile       │ Assistant response                    │
│ Theme         │                                       │
│               ├───────────────────────────────────────┤
│               │ Attachment / Voice / Message input   │
└───────────────┴───────────────────────────────────────┘
```

The sidebar should be collapsible and should not dominate the conversation area.

## 5. Components

### Buttons

Use three semantic variants:

- Primary: main action
- Secondary: supporting action
- Destructive: deletion/rejection/security-sensitive destructive action

Buttons should have clear hover, focus, disabled and loading states.

### Cards

Cards are used for:

- dashboard statistics
- help sections
- document entries
- user management sections
- settings blocks

Use consistent border, spacing and radius rules. Avoid introducing a new visual style for every page.

### Forms

Every important input should provide:

- label or clear accessible name
- validation feedback
- disabled/loading state when submitting
- readable error message

### Chat messages

User and assistant messages must be visually distinguishable without relying only on color.

Assistant answers should support Markdown and code formatting.

### Attachments

Attachment previews should display:

- filename
- file type or relevant icon
- processing/upload state where applicable
- clear association with the user message

## 6. Classification UI

Clearance must be visible and understandable without exposing unnecessary sensitive information.

Supported labels:

```text
Public
Confidential
Secret
```

The UI may use distinct visual treatment for the three levels, but the security decision must always be made by the backend.

## 7. States

Every data-driven feature should consider:

### Loading

Show a clear progress/processing state while waiting for the backend or local AI model.

### Empty

Explain what the user can do next instead of showing an unexplained blank area.

### Error

Use concise messages and preserve the user's input where possible.

### Success

Give clear confirmation after actions such as upload, approval, rename, pinning or password reset.

## 8. Responsive behavior

Primary breakpoints should be tested at least at:

- 375px
- 768px
- 1024px
- 1440px

The chat input, sidebar, document cards and admin tables should remain usable on smaller screens.

## 9. Accessibility

- Use semantic buttons and form controls.
- Maintain keyboard focus visibility.
- Do not rely only on color to communicate errors or clearance.
- Provide useful labels for icon-only controls.
- Ensure adequate contrast in both themes.
- Keep text readable during long conversations.

## 10. Motion

Motion should support understanding rather than distract from the task.

Use animation for:

- sidebar transitions
- message appearance
- loading indicators
- small state changes

Avoid excessive animation in security/admin screens.
