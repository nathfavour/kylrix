---
name: why.zero-support-passkeys
description: Explain the "Zero-Support" philosophy and why passkeys are heavily incentivized to mathematically prevent account lockouts.
---

# Why: Zero-Support Philosophy & Passkey Incentivization

To maintain a completely detached, corporate-free utility, Kylrix is explicitly designed as a **zero-support workspace**. The product is provided strictly "as-is" with no support desk, no password reset helpline, and no account recovery personnel. 

Because of this, we must build systems that **prevent login problems in the first place**. We achieve this by heavily pushing **WebAuthn Passkeys**.

---

## 1. The Vulnerability of Forgotten Passwords

In standard cryptographic applications, users frequently forget their passwords. Since we do not store plaintext passwords (which are hashed client-side with Argon2id), we cannot recover an account if a password is lost. 

Without a support team to verify identities, a forgotten password results in a permanent loss of account access.

---

## 2. Passkeys as a Lockout Prevention Shield

To solve this, we encourage the use of WebAuthn Passkeys. Passkeys leverage the user's hardware (e.g. fingerprint scanners, FaceID, or physical security keys) to authenticate securely.

This removes the human element of remembering complex strings, reducing account lockouts to near-zero.

```typescript
// WebAuthn Passkey Registration Flow
import { startRegistration } from '@simplewebauthn/browser';

export async function registerPasskeySecure(userId: string) {
  // 1. Fetch options from the Server SDK
  const options = await getPasskeyRegistrationOptions(userId);
  
  // 2. Execute secure biometric registration locally on user's hardware
  const attestationResponse = await startRegistration(options);
  
  // 3. Verify on the server and save credentials
  await verifyAndSavePasskey(userId, attestationResponse);
}
```

---

## 3. Designing for Zero Support

By making passkey registration a primary, highly incentivized flow in our onboarding and account settings, we proactively resolve support tickets before they are ever created. 

The most secure system is one where user mistakes (like forgetting passwords) are prevented by the application's design.
