# Kylrix Ecosystem Features Manifest & Architectural Blueprint 🏴

This document provides a highly exhaustive, technically rigorous engineering blueprint of every feature, cryptographic protocol, and data flow within the Kylrix suite. It serves as an active conceptual ingest for engineers and agentic AI systems to understand the codebase's mechanics, synergies, and future expansion paths.

---

## 🏗️ Core Architectural Mandates & Design Patterns

Before diving into the feature catalog, all operations in the Kylrix ecosystem must adhere to three foundational architectural paradigms:
1.  **Web Ecosystem Security Protocol (WESP)**: We mathematically isolate active keys and decryption contexts in ephemeral, tab-scoped RAM. We enforce a zero-leak policy; no key material ever touches the database in plaintext, and all product chrome avoids opaque or solid gradients to maintain visual velocity.
2.  **Cascading-on-Demand (CoD) CRUD & Data Nexus**: A hybrid offline-first design. We aggressively minimize remote database reads using a high-performance in-memory and `localStorage` caching layer (Data Nexus). Any write operations asynchronously escalate privileges server-side while keeping the client snappier than traditional SPAs.
3.  **Global Unmount & Portal Containment**: To prevent hidden DOM trees from capturing mouse clicks or causing layout thrashing, all modals, drawers, and sidebars are physically unmounted from the DOM when closed (`{isOpen && <Component />}`). We disable standard portal extraction (`disablePortal: true`) to keep components contextually native.

---

## I. CORE PLATFORM & SECURITY (WESP & CRYPTO SUBSTRATE)

### 1. Master Encryption Key (MEK)
*   **Mechanism & Substrate**: Local-first key generation. When a user creates their security vault, the client generates a cryptographically secure 256-bit symmetric key (`MEK`) using the browser's Web Crypto API (`window.crypto.subtle.generateKey` with `AES-GCM`). 
*   **Zero-Knowledge Boundary**: Plaintext key material never traverses the network. The MEK lives exclusively in tab-scoped, volatile JS memory and is lost instantly upon page close or tab termination.
*   **Next-Gen Integration Flow**: Hardware-backed MEK protection utilizing WebAuthn PRF (Pseudo-Random Function) extension, allowing the browser to derive the key directly from physical security keys or biometric hardware without typing a password.

### 2. PBKDF2 Key Stretching
*   **Mechanism & Substrate**: Master password key derivation. The user's master password undergoes key stretching via PBKDF2 (Password-Based Key Derivation Function 2) with **600,000 iterations** of SHA-256. This derives the Master Key Encryption Key (`KEK`) used to encrypt and wrap the MEK before sending it (in wrapped form) to Appwrite user preferences.
*   **Anti-Bruteforce Defense**: High iteration count makes hardware-accelerated GPU/ASIC offline dictionary attacks mathematically prohibitive.
*   **Next-Gen Integration Flow**: Dynamic iteration scaling based on client-side benchmark tests on signup, automatically adjusting the workload to optimize derivation time on high-performance devices.

### 3. Double-Lock Argon2id Upgrade
*   **Mechanism & Substrate**: Key stretching migration. Modernizes legacy PBKDF2 vaults by shifting key derivation to client-side Argon2id (WebAssembly). It establishes a hybrid "Double-Lock" wrapping mechanism where the PBKDF2-derived key is subsequently stretched through Argon2id parameters (Memory: 64MB, Iterations: 3, Parallelism: 4) before unlocking the MEK.
*   **Synergy**: Integrates with [Onboarding Health Drawers](file:///home/nathfavour/code/kylrix/kylrix/components/onboarding/AccountHealthDrawers.tsx) to execute migration in the background without UI freeze.
*   **Next-Gen Integration Flow**: Autonomous background credential rotation where keys are safely re-wrapped with updated WASM Argon2id profiles upon successful temporal Sudo validations.

### 4. Web Ecosystem Security Protocol (WESP)
*   **Mechanism & Substrate**: Memory-space isolation. WESP utilizes tab-specific, RAM-only variable allocations and strict broadcast channel locks (`BroadcastChannel` API) to detect unauthorized tab clones or cross-site scripting (XSS) injection attempts. It implements a global lock broadcast system that wipes decrypted cache elements if any tab is breached.
*   **Visual Velocity**: Product chrome is strictly transparent/glassmorphic. Any solid, opaque layouts on navigation frames are prohibited to allow users to visually inspect and track overlay stacking contexts easily.
*   **Next-Gen Integration Flow**: Tab isolation using Web Workers for cryptographic computations, separating the main UI rendering thread entirely from raw cryptographic memory space.

### 5. Zero-Knowledge Data-at-Rest
*   **Mechanism & Substrate**: Field-level E2EE (End-to-End Encryption). All Vault objects (passwords, usernames, TOTP secrets, file payloads) are encrypted client-side using `AES-GCM` with a 96-bit random IV before being written to Appwrite. 
*   **Polymorphic DB Storage**: Column mappings use `dek` (Document Encryption Key) envelopes. A distinct DEK is generated per item, encrypted with the MEK, and stored alongside the encrypted payload.
*   **Next-Gen Integration Flow**: Multi-recipient sharing via E2EE key wrapping, where an item's DEK is duplicated and wrapped separately with other users' public X25519 keys.

### 6. X25519 Identity Nodes
*   **Mechanism & Substrate**: Cryptographic key pairs for P2P operations. Every user profile generates an ephemeral X25519 key pair via SubtleCrypto. The public key is published to the Connect Directory, while the private key is encrypted with the MEK and cached locally.
*   **Ecosystem Synergy**: Functions as the core handshake mechanism for P2P secret exchange and WebRTC session key negotiations.
*   **Next-Gen Integration Flow**: Fully decentralized, offline-first WebRTC huddle handshakes using local QR code scans containing raw public X25519 identity keys.

### 7. Ephemeral PIN Piggybacking
*   **Mechanism & Substrate**: Volatile session management. To avoid entering long master passwords on high-frequency vault mutations, the client allows the user to pin a volatile 4-digit or 6-digit numeric PIN. WESP stores a temporary salt in the tab context and encrypts the MEK in memory with a key derived from this PIN.
*   **Security Gating**: The PIN-derived key is wiped automatically after 15 minutes of idle time or upon tab blur.
*   **Next-Gen Integration Flow**: Biometric integration via WebAuthn credentials, allowing biometrics to securely unlock the ephemeral PIN wrapper.

### 8. Ed25519 Node Key Diffing
*   **Mechanism & Substrate**: Deterministic P2P data synchronization. Kylrix uses Ed25519 signatures to sign state deltas (database rows). When peer databases sync, they exchange root state hashes. If a hash mismatch is detected, they exchange delta diffs signed by their respective Ed25519 keys.
*   **Integrity Verification**: Allows offline clients to safely merge records without server mediation, preventing spoofed row mutations.
*   **Next-Gen Integration Flow**: Merkle-tree diffing engine operating in an in-memory WASM library, syncing thousands of encrypted vault records over P2P WebRTC in milliseconds.

### 9. Sudo Mode Gate
*   **Mechanism & Substrate**: Temporal authorization barrier. Highly critical actions (e.g. master password change, database wipe, full JSON export) require the user to re-enter their master password or passkey. Upon validation, the client enters a Sudo Mode window lasting exactly **5 minutes** (stored as an in-memory timestamp).
*   **Strict Security Boundary**: The sudo token is non-persistent and cannot be cached in `localStorage`.
*   **Next-Gen Integration Flow**: Dynamic, activity-based security scoring where Sudo Mode is triggered automatically if an agentic script attempts to fetch more than 10 credentials in quick succession.

### 10. Non-Custodial Wallet Layer
*   **Mechanism & Substrate**: Embedded crypto keypair derivation. The MEK is used as entropy to deterministically derive a BIP-39 mnemonic seed phrase. From this seed, the client derives BIP-44 keypairs for Solana/EVM blockchains.
*   **Synergy**: Enables zero-dependency Web3 funding, allowing autonomous agents in the workspace to stream micropayments to one another.
*   **Next-Gen Integration Flow**: Zero-Knowledge proof generation for on-chain identity verification, allowing users to prove they own a secure credential without revealing the secret on-chain.

### 11. Collaborative X25519 DH Sharing
*   **Mechanism & Substrate**: Zero-knowledge key exchange. When a credential or note is shared with a collaborator, the sender performs a Diffie-Hellman (DH) key exchange. Using their own private X25519 key and the recipient's public X25519 key, they derive a shared secret. The item's encryption key (DEK) is encrypted with this shared secret and written to the `KeyMapping` database.
*   **Zero-Knowledge Isolation**: The server acts as a simple mailbox, unable to read the derived shared secret or decrypt the mapping.
*   **Next-Gen Integration Flow**: Group DH key exchanges (e.g., using double ratchet algorithms) to support zero-knowledge multi-user workspace access controls.

### 12. Universal JSON Export
*   **Mechanism & Substrate**: Ultimate portability. A single-button operation under Sudo Mode compiles every decrypted credential, TOTP seed, note, and flow milestone into a unified, standard JSON schema. 
*   **Anti-Lock-In**: The exported file is standard, clean JSON, allowing import into rival managers or full database restoration.
*   **Next-Gen Integration Flow**: Fully encrypted offline HTML vault exports containing a mini WASM decryption engine, allowing users to unlock and read their backup directly in any offline browser.

### 13. Progressive Rate Limiting
*   **Mechanism & Substrate**: Server and client progressive gating. Tracks login and unlock attempts in memory (client-side) and via database logs (server-side). Upon successive failed attempts, it implements an exponential backoff cooling window (e.g., 2s, 4s, 8s... up to 1 hour).
*   **Bypasses**: Rate limits are temporarily bypassed only if the user verifies a temporal link sent to their registered, verified email address.
*   **Next-Gen Integration Flow**: Network-wide coordinate-based heuristics that detect distributed bruteforce attempts targeting an account from multiple distinct IP addresses.

### 14. Row-Level Security (RLS) Hardening
*   **Mechanism & Substrate**: Least-privileged access. The Appwrite database collections are locked to strict read-only default policies. Standard clients cannot perform direct remote write requests. Instead, all database modifications are routed through verified Server Actions (`lib/actions/secure-ops.ts`) which escalate privileges safely after performing server-side validation.
*   **Colosseum Integrity**: Prevents database scraping and direct client-side collection manipulation.
*   **Next-Gen Integration Flow**: Cryptographically signed write transactions, where the server only executes database mutations accompanied by a valid user Ed25519 signature.

### 15. Cross-App Linking Service
*   **Mechanism & Substrate**: Polymorphic data relations. We map relationships between resources using uniform cross-link patterns in markdown (e.g., `source:kylrixnote:id`, `source:kylrixvault:id`). This completely eliminates heavy database relational join tables.
*   **Synergy**: Links together tasks, notes, vault items, and calls, enabling the UI to resolve and display micro-interactions contextually.
*   **Next-Gen Integration Flow**: Graphical node visualizer inside the workspace, rendering all cross-linked tags as interactive, draggable 3D networks.

### 16. Data Nexus Caching
*   **Mechanism & Substrate**: High-performance local-first caching. Implemented in [DataNexusContext.tsx](file:///home/nathfavour/code/kylrix/kylrix/context/DataNexusContext.tsx). It uses a hybrid in-memory `Map` ref and an encrypted `localStorage` persistence layer to store frequently read database records (with customizable TTLs). 
*   **Deduplication**: Merges concurrent identical in-flight promises into a single request, eliminating the "thundering herd" network problem on page load.
*   **Next-Gen Integration Flow**: Offline mutation queueing with background reconciliation, allowing the app to queue writes during network drops and sync seamlessly when online.

---

## II. KYLRIX NOTE (KNOWLEDGE MANAGEMENT)

### 17. Rich Markdown Editor
*   **Mechanism & Substrate**: Standard GFM (GitHub Flavored Markdown) editor styled with our Pitch Black design tokens. It parses typography, bold/italic markup, nested lists, blockquotes, and code blocks using professional typographic rules.
*   **Synergy**: Integrates [LinkComponent](file:///home/nathfavour/code/kylrix/kylrix/components/LinkRenderer.tsx) to dynamically render inline components (like voice waveforms or vault peeks) inside standard text flows.
*   **Next-Gen Integration Flow**: Inline LaTeX formatting and Mermaid diagrams parsed on the fly with GPU-accelerated transition animations.

### 18. Doodle Canvas
*   **Mechanism & Substrate**: Vector-based sketching. Implemented in [DoodleCanvas.tsx](file:///home/nathfavour/code/kylrix/kylrix/components/DoodleCanvas.tsx) utilizing HTML5 Canvas APIs. It supports pressure sensitivity, high-fidelity undo/redo stacks, zoom states, and visual layering.
*   **Polymorphic Storage**: Serializes vector strokes to standard, lightweight JSON stored directly in the note content block, eliminating external binary storage dependency.
*   **Next-Gen Integration Flow**: Real-time collaborative canvas syncing, allowing multiple users in a WebRTC call to sketch on the same vector whiteboard simultaneously.

### 19. Ghost Notes
*   **Mechanism & Substrate**: Ephemeral zero-knowledge items. Knowledge blocks marked with `isGhost: true` in the database.
*   **The 7-Day Purge**: Subject to a recursive, automated server sweep that purges expired records. The deletion cascades to storage binaries, reactions, comments, and voice files.
*   **Next-Gen Integration Flow**: Multi-tier ghost notes with custom self-destruct countdowns (e.g. read-once, 1 hour, or 24 hours).

### 20. Polymorphic Relay (Send)
*   **Mechanism & Substrate**: Universal zero-knowledge sharing engine. Located under `/send` (implemented in [SendReceiveClient.tsx](file:///home/nathfavour/code/kylrix/kylrix/components/send/SendReceiveClient.tsx)). It allows users to drop a file, note, password, or discussion thread, which is encrypted locally and shared via a single link containing the key in the URL hash fragment.
*   **Zero-Idle Redirect**: App-wide middleware redirects unauthenticated traffic to the high-value `/send` page, maximizing onboarding speed.
*   **Next-Gen Integration Flow**: One-time-download ghost files that immediately delete themselves from Appwrite storage buckets the microsecond the download stream completes.

### 21. Recursive Cascade Deletion
*   **Mechanism & Substrate**: Atomic cleanup. Pursuing pure data hygiene, any delete operation on a note or task recursively purges all linked entities.
*   **Cleanup Extent**:purges linked comments, reactions, storage files, and voice audio files.
*   **Next-Gen Integration Flow**: Offload cleanup triggers to server-side database hooks, ensuring recursive deletion executes even if the user closes their browser instantly.

### 22. Note Revisions
*   **Mechanism & Substrate**: Version history for encrypted documents. Whenever an encrypted note is saved, the client saves a delta diff of the document. The revision histories are encrypted with the same MEK and kept as sub-documents.
*   **Data Sovereignty**: Only the user can read the revision logs; the server sees only generic binary updates.
*   **Next-Gen Integration Flow**: Local branch-merging for notes, allowing users to fork version branches and merge them using Ed25519 delta diffing.

### 23. Cross-Link Tagging
*   **Mechanism & Substrate**: Relational mapping inside content fields. We parse links referencing other sub-app resources using a discrete schema like `[Link Name](source:kylrixvault:credentialId)`.
*   **Synergy**: Intercepted in [LinkRenderer.tsx](file:///home/nathfavour/code/kylrix/kylrix/components/LinkRenderer.tsx) to dynamically render high-value inline components (like live 2FA generators) contextually inside notes.
*   **Next-Gen Integration Flow**: Automatic cross-link recommendation, using local content hashes to suggest related credentials or tasks while typing.

### 24. Note-to-Huddle Promotion
*   **Mechanism & Substrate**: Discussion thread conversion. With one click, any note can be promoted into a live, collaborative group chat. The note content forms the header, and an active huddle is spawned inside the note's comments section.
*   **Synergy**: Links Knowledge Management with Connect, making static notes highly dynamic collaboration channels.
*   **Next-Gen Integration Flow**: Automatic huddle recording archiving, where audio/video calls in a promoted note are transcribed and attached directly as a note revision.

---

## III. KYLRIX VAULT (PASSWORD & SECRET MANAGER)

### 25. Login Credential Management
*   **Mechanism & Substrate**: High-security vault entries. Encrypts and stores website logins (usernames, passwords, URLs, custom fields).
*   **Favicon Isolation**: Favicon URLs are fetched client-side through a secure proxy or loaded from cache to prevent DNS leakage of user accounts to third parties.
*   **Next-Gen Integration Flow**: Browser extension auto-fill adapter, securely passing credentials from the vault to input fields using the local WESP context.

### 26. TOTP Authenticator Seeds
*   **Mechanism & Substrate**: 2FA token generation. Seeds are decrypted in memory and passed to `otplib` or `speakeasy` client-side, generating live-decaying 6-digit tokens.
*   **Synergy**: Pairs with custom tooltips to render live codes anywhere in the workspace without opening the Vault app.
*   **Next-Gen Integration Flow**: Support for Steam Guard and custom 8-digit or SHA-256 TOTP profiles.

### 27. Password-to-TOTP Linking
*   **Mechanism & Substrate**: Composite vault mapping. Under the hood, a standard credential record carries an optional `totpId` column.
*   **The Synergy**: Allows the credentials manager to fetch the associated TOTP record in a single transaction, showing the website password and active 2FA token side-by-side.
*   **Next-Gen Integration Flow**: Automated 2FA setup parsing, extracting the seed and issuer parameters from uploaded screenshots or QR codes locally in the browser.

### 28. Keychain Item Sharing
*   **Mechanism & Substrate**: Zero-knowledge credential delegation. When shared, the secret is re-wrapped with the recipient's public X25519 key.
*   **RLS Gating**: The shared secret is stored in a secure key mapping table, enabling the recipient to read the credential under read-only RLS restrictions.
*   **Next-Gen Integration Flow**: Temporal keys that automatically expire and invalidate the mapping after a preset duration (e.g. 1 hour).

### 29. Secure Folders
*   **Mechanism & Substrate**: Folder organization for vault records. Folder maps are stored as encrypted rows in Appwrite, assigning folders parent-child relations.
*   **Anti-Metadata Leakage**: Folder names are encrypted client-side, hiding the user's category names from the server.
*   **Next-Gen Integration Flow**: Nested folder systems with inherited group permissions, allowing workspaces to share entire secret categories at once.

### 30. Security Audit Log
*   **Mechanism & Substrate**: Immutable event tracking. Captures mutations and read access to credentials, storing them in the `SecurityLogs` collection.
*   **Anonymization**: IP addresses and User-Agents are securely hashed using SHA-256 with a daily salt to audit breaches without tracking user location.
*   **Next-Gen Integration Flow**: Real-time push notifications via the Telegram bridge if a critical credential is read from an unfamiliar device signature.

---

## IV. KYLRIX FLOW (PRODUCTIVITY & ORCHESTRATION)

### 31. Collaborative Goal Engine
*   **Mechanism & Substrate**: Multi-role task tracking (assignees, organizers, viewers). Implemented with cascading permissions.
*   **Merit Synergy**: Tasks are treated as flagship workspace value drivers. Workspaces are kept free and unlimited up to **8 collaborators**, preventing payment walls from blocking utility.
*   **Next-Gen Integration Flow**: Automated subtask distribution where the system assigns nested tasks to appropriate agents based on capacity.

### 32. Autonomous Ingestion Forms
*   **Mechanism & Substrate**: Real-time form submissions. Located under `/flow/forms` (implemented in [UnifiedFormContent.tsx](file:///home/nathfavour/code/kylrix/kylrix/components/forms/UnifiedFormContent.tsx)). Submissions are automatically converted into actionable tasks or milestones inside a linked project.
*   **Local Caching**: Form drafts are saved locally in the background using `localStorage`, preventing data loss on page refreshes.
*   **Next-Gen Integration Flow**: Fully encrypted form responses, allowing users to submit feedback that only the project owner can decrypt with their MEK.

### 33. Nested Subtask Arrays
*   **Mechanism & Substrate**: Deep task recursion. Subtasks are structured as recursive JSON trees inside tasks.
*   **Inherited Permissions**: Subtasks automatically inherit permissions from the parent milestone, ensuring robust access gating.
*   **Next-Gen Integration Flow**: Inter-subtask dependency mapping, blocking a subtask from starting until its parent task is marked completed.

### 34. Form-to-Article Pipeline
*   **Mechanism & Substrate**: Text compilation. Gathers form submissions or task results and compiles them into a structured, publication-ready markdown article.
*   **Zero-Knowledge Publishing**: Promotes raw data into public documents, allowing documentation creation without manual copy-pasting.
*   **Next-Gen Integration Flow**: Static site generator API export, publishing compiled articles directly to platforms like Vercel or Netlify.

### 35. Ecosystem Calendar Sync
*   **Mechanism & Substrate**: Event coordination. Located in `components/events` (e.g. [EventDialog.tsx](file:///home/nathfavour/code/kylrix/kylrix/components/events/EventDialog.tsx)). Dynamically visualizes task due dates and project milestones on a calendar canvas.
*   **Synergy**: Integrates with [HuddleChatWindow](file:///home/nathfavour/code/kylrix/kylrix/components/chat/HuddleChatWindow.tsx) to launch instant video huddles for active calendar events.
*   **Next-Gen Integration Flow**: Bi-directional external sync (iCal/Google Calendar) using zero-knowledge sync channels.

### 36. Project Gravity Wells
*   **Mechanism & Substrate**: The旗舰 unified workspace. Links notes, tasks, credentials, and huddle threads into a single dashboard.
*   **Synergy**: Project owners inherit full read/write CRUD over child resources, eliminating complex permission structures.
*   **Next-Gen Integration Flow**: Drag-and-drop file organization, instantly generating a `/send` ghost link when dropping an external file into the workspace.

---

## V. KYLRIX CONNECT (COMMUNICATION & SOCIAL)

### 37. Secure Matrix Messaging
*   **Mechanism & Substrate**: End-to-end encrypted chat between cryptographic user identities. It uses P2P-derived X25519 shared secrets to encrypt message payloads.
*   **Decoupled Architecture**: Messages are stored in the database in fully encrypted form, rendering them completely opaque to Appwrite database administrators.
*   **Next-Gen Integration Flow**: Decentralized chat backups distributed across peer devices using Ed25519 node key diffing.

### 38. Project Discussion Threads
*   **Mechanism & Substrate**: Contextual huddle threads embedded directly inside workspace resources (tasks, notes, forms).
*   **Ecosystem Synergy**: Comment blocks inherit the parent object's encryption properties, enabling E2EE chat threads contextually.
*   **Next-Gen Integration Flow**: Thread grouping using cryptographic thread-specific keys, allowing users to invite guests to a specific thread without exposing the parent note.

### 39. Hangouts (Group Groups)
*   **Mechanism & Substrate**: Capped high-efficiency group communications. Capped at exactly **16 concurrent members** to prevent database read-permission overhead and WebSocket lag.
*   **Presence Mapping**: Real-time typing indicators are routed through ephemeral WebSocket channels to minimize state updates.
*   **Next-Gen Integration Flow**: Dynamic group key rotations, regenerating group encryption keys whenever a member leaves or is removed.

### 40. WebRTC Live Huddles
*   **Mechanism & Substrate**: Peer-to-peer real-time video/audio mesh. Supports direct P2P connection or Cloudflare SFU (Selective Forwarding Unit) transport fallbacks.
*   **Synergy**: Embeds [MediaRecording archives](file:///home/nathfavour/code/kylrix/kylrix/.agents/skills/call.webrtc-huddles/SKILL.md) to record and save calls directly as audio binaries in Appwrite storage.
*   **Next-Gen Integration Flow**: Ephemeral screen-sharing channels utilizing the tab-scoped WESP keys to prevent video frame capturing outside the active viewport.

### 41. Voice Note Mesh
*   **Mechanism & Substrate**: High-fidelity inline audio payloads. Encodes audio recordings into lightweight file structures limited to **2 minutes**.
*   **Visual Display**: Renders a dynamic pseudo-waveform matching playback progress, and handles recursive cleanup when the host note is deleted.
*   **Next-Gen Integration Flow**: Real-time, browser-based voice pitch visualization and offline voice note speed controllers.

### 42. Unorganic Email Dispatch
*   **Mechanism & Substrate**: Queue-based notification engine. Features an offline queue mapped to email categories.
*   **Frequency Caps**: Enforces strict anti-spam limits (e.g. max 1 alert per 30 minutes) to keep communications organic and prevent mailbox flooding.
*   **Next-Gen Integration Flow**: Zero-Knowledge notifications, sending encrypted emails that the user can decrypt locally inside their email client using their MEK.

### 43. Moment Feed
*   **Mechanism & Substrate**: Real-time social stream. Combines user activity events, huddle updates, and online presence signals.
*   **Unread Indicators**: Keeps track of unread message offsets in local memory cache to keep rendering Snappy.
*   **Next-Gen Integration Flow**: Dynamic action links inside Moment Feed cards, enabling users to accept project invites or join active voice huddles in one click.

### 44. Telegram Notification Bridge
*   **Mechanism & Substrate**: Platform-agnostic push bridge. Transmits real-time alerts through a dedicated Telegram bot.
*   **Freedom Gating**: Completely bypasses Apple APNs and Google FCM developer fee structures and platform restrictions, remaining sovereign.
*   **Next-Gen Integration Flow**: Bi-directional command executions, enabling users to query vault lock statuses or trigger database wipes by replying to Telegram messages.

### 45. Group Join Request Gating
*   **Mechanism & Substrate**: Secure composite invite verification. Generates invite hashes using SHA-256 derived from `inviterId +projectId + timestamp`.
*   **Invite Lifecycles**: Enforces temporal expiration checks, immediately rejecting join requests if the invite link is altered.
*   **Next-Gen Integration Flow**: Blind signature join requests, allowing users to invite guests without revealing the host project's ID to unauthorized users.

---

## VI. COMPOSITE INTEGRATIONS & SHIPPED SYNERGIES

### 46. Contextual TOTP Peek for Cross-Linked Vault Items
*   **shipped Mechanism & Substrate**: Intercepts `source:kylrixvault:credentialId` markdown links inside notes and tasks using the [VaultTotpLink](file:///home/nathfavour/code/kylrix/kylrix/components/LinkRenderer.tsx) component.
*   **Data Nexus Memory Optimization**: Checks the local `v_totp_total_${userId}` and `v_creds_total_${userId}` cache maps first to resolve the secret, preventing secondary database fetches.
*   **Inline Security Promotion**: If the security vault is locked, the link triggers the standard `MasterPassDrawer` inline. Once unlocked, the component swaps the lock placeholder for a premium glassmorphic tooltip containing the active 6-digit TOTP code and an interactive, decaying circular timer wheel with a copy button.
*   **Next-Gen Integration Flow**: Auto-focus copying, allowing the user to press a hotkey when hovering over the vault link to copy the code immediately without even showing the tooltip.

### 47. Connect-to-Ghost Input Upgrader
*   **shipped Mechanism & Substrate**: Adds the **`Ctrl + G`** keyboard hotkey inside Connect chat composers, huddle inputs, and discussion textareas.
*   **Zero-Knowledge Upgrading**: Grabs the input buffer, encrypts it in-place using SubtleCrypto `encryptGhostData`, and registers an ephemeral Ghost Note object via `AppwriteService.createSendGhostObject` expiring in **7 days**.
*   **Relay Swapping**: Replaces the textarea buffer with the secure `/send/${noteId}/${noteKey}` link. The created note is cached inside `localStorage('kylrix_send_sparks')` so the user can easily manage and claim it on the `/send` dashboard.
*   **Next-Gen Integration Flow**: Upgrader templates, allowing users to select preset formatting structures (e.g. code snippet, API credentials) when upgrading their input box.

### 48. Autonomous Local Injection & Flap-Over Previews for Secure Relays
*   **shipped Mechanism & Substrate**: Intercepts any URL matching the `/send/[id]/[key]` secure relay pattern inside standard markdown content.
*   **Inline Preview Injection**: Resolves the note metadata locally through `/note/api/shared/${id}` (caching results inside Data Nexus `send_relay_${id}`) and extracts the secure object kind to inject a custom, highly styled glassmorphic micro-card into the text.
*   **dedicated Flap-Over Drawer**: Bypasses traditional page redirection. Clicking the preview card slides out a dedicated right-hand panel (`SendFlapOver`) that decrypts and visualizes the secure object contextually (Username/Password fields, live TOTP circular counts, or inline file decryption and binary downloads) without breaking active viewport flow.
*   **Next-Gen Integration Flow**: Multi-link stacks, displaying a unified sidebar with aggregated secure relay panels if multiple `/send` links are present inside the same document.

### 49. Project -> Credential Delegation
*   **Mechanism & Substrate**: E2EE secret delegation. Enables project owners to assign secure credentials to team members using shared keychain entries.
*   **Security Gating**: The system prevents credential cloning; members can read and use the credential but cannot view the raw master key envelope.
*   **Next-Gen Integration Flow**: Automated key rotation, where the database dynamically re-encrypts the credential DEK whenever a workspace member is removed.

### 50. Task -> Call Interface
*   **Mechanism & Substrate**: Interactive WebRTC triggers. Spawns an active WebRTC huddle directly inside a task milestone view.
*   **Synergy**: Ties project execution milestones directly with communication channels, enabling instant feedback loops.
*   **Next-Gen Integration Flow**: Action item extraction, using local WebRTC voice transcripts to automatically generate and link subtasks during the call.

### 51. Wallet -> Agent Streaming
*   **Mechanism & Substrate**: Non-custodial payment channels. Derives on-chain keypairs to stream micro-tokens (e.g., SOL, USDC) to autonomous workspace agents.
*   **Ecosystem Synergy**: Provides agents with operational funds to execute automated code sweeps or storage backups independently.
*   **Next-Gen Integration Flow**: Programmable payment contracts, allowing users to set daily funding limits or performance milestones for active workspace agents.

### 52. Zero-Idle Redirect
*   **Mechanism & Substrate**: Onboarding path optimization. The app layout captures anonymous route requests and routes them directly to `/send` instead of blocking landing.
*   **Synergy**: Keeps users engaged immediately upon landing, converting passive traffic into active users before prompting account setup.
*   **Next-Gen Integration Flow**: Single-keystroke onboarding, instantly generating a temporary guest account when a visitor types their first note on `/send`.

### 53. Recursive Ghost Cleanup
*   **Mechanism & Substrate**: Multi-table automated pruning of ephemeral relays and storage binaries. Operates server-side to clean up expired ghost records.
*   **Hygiene Boundaries**: Removes comments, files, and voice recordings attached to the purged note, keeping the database clear of orphan records.
*   **Next-Gen Integration Flow**: Fully decentralized garbage collection, where client instances coordinate to check and sweep expired records collaboratively.

### 54. Connect Directory Profile Sync
*   **Mechanism & Substrate**: Global identity lookup and caching across all sub-apps. Resolves user names and avatars using profile caches.
*   **Local Caching**: Stores retrieved identities in the Data Nexus layer to eliminate redundant database reads during scrolling list views.
*   **Next-Gen Integration Flow**: Cryptographically signed user profiles, preventing profile spoofing or unauthorized identity changes across the network.

---

**Build freely. Work while you sleep.** 🌙
