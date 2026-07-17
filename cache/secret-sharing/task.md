# Secret and TOTP Sharing Challenges

## Overview
This document outlines the core architectural and implementation challenges faced while implementing secure sharing for secrets and TOTP items within the Kylrix ecosystem.

---

## 1. Decryption Failures (`OperationError` during `SubtleCrypto.decrypt`)
Decryption errors in `SharedVaultClient` and `SharedTotpClient` root from a misalignment in key usage and base64 parsing:
*   **Double-Decoding Loop**: The URL-safe Base64 DEK (utilizing `-` and `_` instead of `+` and `/` without padding) was parsed through multiple layers of `decodeURIComponent`, corrupting the raw binary structure before `crypto.subtle.importKey`.
*   **IV Size Mismatches**: 
    *   Legacy master-key-based encryption (`MasterPassCrypto`) utilizes a **16-byte IV**.
    *   Data Encryption Keys (DEKs) and other standard AES-GCM formats utilize a **12-byte IV**.
    *   Parsing ciphertexts incorrectly slice raw binary buffers when falling back or reading mixed encryption schemas.
*   **Decrypted DEK Wrapping**: The master pass utility stringifies the DEK payload before storage. On retrieval, `JSON.parse` is implicitly called, necessitating exact string type checks.

---

## 2. Secrets Disappearing from List
When sharing a secret, it would immediately become invisible to the owner:
*   **RLS Permission Stripping**: Database updates during DEK migration (within Server Actions) called `appwriteDatabases.updateRow` without passing `$permissions`. This wiped custom RLS permissions from the row, making it unreadable to the regular user session.
*   **Nexus Cache Invalidation & Stale Client State**: Invoking `clearCredentialCache` cleared the server-side caches, but the client-side `allCredentials` React state remained stale without a targeted update.

---

## 3. Key Sharing Mechanics (TOTP vs Secrets)
*   **Interactive Toggles**: Unlike TOTPs, Secrets require complex DEK migrations during the sharing lifecycle (re-encrypting the payload with a newly generated DEK to avoid leaking the Master Key).
*   **State Propagation**: Mutating individual properties of objects inside React state arrays bypassed standard reconciliation rendering, leading to visual states where the share icon color stayed dull.
