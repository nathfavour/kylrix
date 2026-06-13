# Kylrix Development Roadmap & TODO

## 1. WebRTC & Media Infrastructure
- [ ] Optimize signaling server performance during concurrent peer handshakes.
- [ ] Implement robust health checking and automatic fallback to Turn/Stun relays.
- [ ] Benchmark SFU media transport capacities with >10 participant groups.
- [ ] Add graceful recovery logic when WebRTC connections drop abruptly on mobile networks.

## 2. Sync Engine & Data Integrity (RxDB / Appwrite)
- [ ] Implement CRDT or structured merge resolution for offline note edits.
- [ ] Add client-side conflict notification when auto-resolution fails.
- [ ] Optimize delta-sync payload size to reduce database reads on startup.
- [ ] Ensure atomic updates to project membership tables to prevent race conditions.

## 3. Cryptography & Client-Side Execution
- [ ] Offload PBKDF2/Argon2 key derivation to Web Workers to keep main UI thread responsive.
- [ ] Optimize AES-GCM decryption routines for large local databases.
- [ ] Implement temporal identity rotation test suites for private groups.
- [ ] Refine fallback prompts for user Masterpass entering when E2EE identity verification fails.

## 4. Platform Limits & Rate-Limiting
- [ ] Configure Upstash Redis rate-limiter fallback logic if the endpoint becomes unreachable.
- [ ] Benchmark Appwrite database query usage near maximum connection counts.
- [ ] Set up automated monitoring alerts for subscription and ledger database traffic.
- [ ] Optimize user preference cache TTLs to minimize redundant billing tier fetches.
