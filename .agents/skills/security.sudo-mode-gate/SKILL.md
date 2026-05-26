---
name: security.sudo-mode-gate
description: Deep dive into the temporal Sudo Mode validation in Kylrix. Explains the RAM-only timestamp window, non-persistence policies, and multi-factor authorization boundaries.
---

# Why: Sudo Mode Temporal Memory Gate & High-Risk Security

Certain actions inside an application—such as deleting a user account, exporting the Password Vault, or generating MasterPass recovery codes—are extremely high-risk. If a user leaves their computer unlocked or a session token is hijacked, an attacker could wipe or steal their data in seconds.

We solve this using a temporal **Sudo Mode Gate** in `lib/sudo-mode.ts`.

## 1. RAM-Only Temporal Validation

Instead of saving the user's high-privilege authorization state to cookies, `localStorage`, or `sessionStorage` (which can be scraped by XSS or local filesystem access), Sudo Mode is tracked **purely in memory** as an active runtime variable:

```typescript
export const SUDO_WINDOW_MS = 5 * 60 * 1000; // 5 minute window
let lastSudoTimestamp = 0;

export const markSudoActive = () => {
    lastSudoTimestamp = Date.now();
};

export const resetSudo = () => {
    lastSudoTimestamp = 0;
};

export const isSudoActive = () => {
    return Date.now() - lastSudoTimestamp < SUDO_WINDOW_MS;
};
```

Because it lives in active JS execution memory:
- Reloading the page or closing the tab instantly resets the sudo authorization state.
- After 5 minutes, the authorization expires automatically.

## 2. Zero-Persistence Security

By avoiding local storage or cookies, we ensure that:
- Attackers cannot extract a persistent "Sudo Token" from the browser's storage database.
- An attacker who obtains physical access to a machine cannot perform high-risk actions if the 5-minute window has closed. The user will be prompted to re-enter their MasterPass.

## 3. High-Risk Action Flow

When a user initiates a sensitive action (e.g. exporting a Vault), the front-end checks `isSudoActive()`. If `false`, the UI displays a secure MasterPass input modal. Once validated, `markSudoActive()` is triggered, granting a 5-minute window during which the action can be completed safely.
