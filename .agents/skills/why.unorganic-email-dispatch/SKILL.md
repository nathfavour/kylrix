---
name: why.unorganic-email-dispatch
description: Deep dive into the Unorganic Email Dispatch engine in Kylrix. Explains the prioritized event queue, theme mappings, anti-spam frequency caps, and ledger logging.
---

# Why: Unorganic Email Dispatch & Prioritization Engine

Sending standard automated notification emails can easily lead to inbox fatigue, high spam scores, or wasted SMTP fees. We need a system that intelligently prioritizes notifications, caps email frequency, and styles emails dynamically based on the originating service.

This is solved by the **Unorganic Email Engine** in `lib/unorganic-email-api.ts`.

## 1. Multi-Dimensional Priority Indexing

Instead of dispatching notifications in a simple first-in, first-out sequence, the email dispatch engine maps every incoming event to a priority scale based on its source application and event importance:

```typescript
const SOURCE_PRIORITY: Record<UnorganicEmailSource, number> = {
  flow: 50,
  connect: 40,
  note: 30,
  vault: 20,
  accounts: 10,
};

const EVENT_PRIORITY: Record<UnorganicEmailEventType, number> = {
  task_assigned: 50,
  call_started: 45,
  token_transfer_received: 44,
  form_response_submitted: 42,
  password_shared: 38,
  note_collaborator_added: 32,
  event_registered: 28,
  group_member_added: 20,
  message_streak: 16,
};
```

This lets the dispatcher prioritize high-signal notifications (like `task_assigned` or `call_started`) over low-signal ones (like a `message_streak`), keeping communication highly relevant.

## 2. Branded Source Themes

To make notification emails instantly recognizable, the engine maps each originating application to a distinct brand palette and geometric design:

```typescript
const SOURCE_THEMES: Record<UnorganicEmailSource, SourceTheme> = {
  accounts: { color: '#6366F1', shape: 'Diamond', label: 'Accounts' },
  flow: { color: '#A855F7', shape: 'Slanted Square', label: 'Flow' },
  connect: { color: '#F59E0B', shape: 'Slanted Square', label: 'Connect' },
  note: { color: '#EC4899', shape: 'Slanted Square', label: 'Note' },
  vault: { color: '#10B981', shape: 'Slanted Square', label: 'Vault' },
};
```

This dynamic theme is injected directly into the HTML mail templates on generation.

## 3. Strict Anti-Spam Frequency Gates

To protect users and maintain high domain reputation scores, the engine enforces strict limits on email frequency:
- **`MAX_UNORGANIC_EMAILS`**: A maximum of **5** unorganic notifications can be sent to a user in a given period.
- **`UNORGANIC_EMAIL_WINDOW_MS`**: A rolling 14-day window.

Before queuing or sending a notification, the database logs in the `UNORGANIC_EMAILS` table are queried to ensure the user's limit hasn't been exceeded. If the limit is reached, the message is gracefully downgraded to a `suppressed` status.
