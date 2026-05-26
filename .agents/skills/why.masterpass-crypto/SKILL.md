---
name: why.masterpass-crypto
description: Deep dive into the cryptographic architecture powering the Kylrix secure state vault. Explains Argon2id key stretching, PBKDF2 legacy migrations, and AES-GCM credential sealing.
---

# Why: MasterPass Cryptography & Key Derivation

Kylrix's Password Vault requires near-military-grade cryptographic isolation to secure user credentials, passkey credentials, and secrets. We achieve this by deriving keys entirely client-side, ensuring that plaintext passwords or Master Keys never touch database rows.

## 1. Argon2id Key Derivation (Primary)

For modern key derivation, we employ **Argon2id** (via `hash-wasm` WASM-accelerated binary processing) instead of basic hashing functions:
- **Memory-Hard Bound**: Set to 64 MB (`65536` memorySize) to prevent hardware GPU/ASIC acceleration brute-force attacks.
- **Iterations & Parallelism**: Set to 3 iterations and 4 threads to strike the optimal balance between high-latency defense and swift mobile client execution.

```typescript
private async deriveKeyWithArgon2id(password: string, salt: Uint8Array): Promise<CryptoKey> {
  const { argon2id } = await import('hash-wasm');
  const hash = await argon2id({
    password,
    salt,
    parallelism: 4,
    iterations: 3,
    memorySize: 65536,
    hashLength: 32, // 256 bits
    outputType: 'binary',
  });

  return crypto.subtle.importKey(
    "raw",
    hash,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt", "wrapKey", "unwrapKey"],
  );
}
```

## 2. PBKDF2 Legacy Compatibility

To preserve backward compatibility for users created in earlier cycles, we maintain a secure fallback using **PBKDF2**:
- **OWASP 2023 Recommendation**: Configured with 600,000 iterations using a high-density `SHA-256` hashing algorithm.
- **On-Demand Migration**: When a legacy user unlocks their vault with PBKDF2, we derive their key, decrypt their database secrets, re-encrypt them using the new Argon2id key, and silently update their records.

## 3. High-Security AES-GCM Sealing

For data encryption, we utilize the standard **AES-GCM** (Advanced Encryption Standard with Galois/Counter Mode):
- **Integrated Integrity**: Delivers authenticated encryption, making it mathematically impossible for an attacker to tamper with encrypted credentials or vault settings without invalidating the decryption cycle.
- **Random 96-Bit Initialization Vector (IV)**: Ensures that encrypting the same credential multiple times yields completely distinct ciphertexts, hiding repeat patterns.
