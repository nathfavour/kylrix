---
name: why.telegram-notification-bridge
description: Explain using Telegram as a push notification outlet to remain completely detached from Apple/Google developer platform constraints and fee structures.
---

# Why: Telegram Notification Bridge & Store Detachment

Traditional mobile push notification architectures (like APNs for iOS and FCM for Android) require developers to register for official developer programs, pay annual membership fees, and submit to platform compliance audits. 

To maintain our philosophy of **uncompromised utility** and remain free from corporate store constraints, Kylrix uses **Telegram as its primary push notification channel**.

We implement this in `lib/services/internal/telegram-dispatch.ts` and `lib/actions/telegram.ts`.

---

## 1. Bypassing Platform Gates

By routing notification alerts through a dedicated Telegram Bot, we:
- Avoid paying annual fee taxes to Apple or Google.
- Avoid store compliance audits that could force us to restrict features or censorship bounds.
- Deliver push notifications to mobile devices, tablets, and desktop systems using Telegram's high-speed global network.

---

## 2. Secure Telegram Bot Dispatching

When a user links their Telegram account, they receive a unique verification code. The server associates this code with their `userId`. 

When an event occurs (e.g. task assigned, call started, password shared), the server dispatches a secure alert message directly to their Telegram chat:

```typescript
// Notification routing in telegram-dispatch.ts
export async function sendTelegramNotification(userId: string, message: string) {
  const { databases } = createSystemClient();
  
  // 1. Fetch the user's secure Telegram Chat ID
  const linkRow = await databases.listRows(USER_DB, TELEGRAM_LINKS_TABLE, [
    Query.equal('userId', userId),
    Query.limit(1)
  ]);
  
  const chatRow = linkRow.rows[0];
  if (!chatRow || !chatRow.chatId) return; // Telegram not linked
  
  // 2. Dispatch secure message via Telegram Bot API
  const token = process.env.TELEGRAM_BOT_TOKEN;
  await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatRow.chatId,
      text: message,
      parse_mode: 'Markdown'
    })
  });
}
```

---

## 3. High Velocity and Reliability

Telegram's Bot API is extremely fast and reliable. Using this bridge allows us to ship updates instantly to all platforms (web, mobile, desktop) while preserving complete autonomy.
