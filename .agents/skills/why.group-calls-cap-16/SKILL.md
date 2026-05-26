---
name: why.group-calls-cap-16
description: Explain the strict 16-member limit on Hangouts (groups) and Calls to prevent Appwrite read-permission bloat, WebSocket lag, and typing indicator overhead, alongside the P2P-to-SFU fallback model.
---

# Why: Hangouts and Calls 16-Member Capacity Ceiling & P2P Fallbacks

To maintain instant, real-time sync across video, audio, chat typing indicators, and reactions without network lag or database bottlenecks, Kylrix enforces a strict **16-member limit on group huddles and call participants**.

We enforce these capacity bounds in `lib/services/call.ts` and `lib/webrtc/WebRTCManager.ts`.

---

## 1. The Bottleneck of Permission Bloat (Database ACLs)

For every user in a group chat or active call, the database must map individual read permissions so they can sync messages and events securely. 

If we allowed large group memberships (e.g. 100+ users), updating a group call's status would require updating massive ACL lists, causing database updates to slow down:

```typescript
// Gating member joins to avoid ACL bloat
export async function joinGroupHuddleSecure(conversationId: string, jwt: string) {
  const actor = await getActor(jwt);
  const adminTables = createSystemTablesDB();
  
  const conversation = await adminTables.getRow(CHAT_DB, CONVERSATIONS_TABLE, conversationId);
  const currentMembers = await resolveConversationParticipants(adminTables, conversation);
  
  // Strict 16 member ceiling
  if (currentMembers.length >= 16) {
    throw new Error('Forbidden: Group capacity ceiling reached (max 16 members).');
  }
  
  // Proceed with safe join...
}
```

This limit keeps our database read-permissions lightweight and ensures WebSocket message broadcasts remain fast.

---

## 2. Real-Time Typing Indicators & WebSocket Overhead

In a group chat, every keystroke triggers typing updates sent over the WebSocket presence mesh:

```typescript
// Typing event broadcast
PresenceService.broadcastState(`chat.conversations.${conversationId}`, {
  userId: actor.$id,
  state: 'online',
  activity: 'typing...'
});
```

If a conversation had 100 users typing simultaneously, the WebSocket server would be flooded with events, causing network lag and high CPU usage on client devices. Limiting groups to 16 members keeps the active presence mesh highly responsive.

---

## 3. WebRTC Fallbacks: SFU to P2P direct routing

Our calls use a hybrid architecture to ensure reliability:
- **SFU Mode** (Selective Forwarding Unit via Cloudflare Calls) is used for group calls to optimize bandwidth.
- **P2P Mode** (Direct Peer-to-Peer) acts as an automatic fallback for smaller, personal calls or if Cloudflare SFU servers experience service dropouts:

```typescript
// WebRTC Manager dual-mode check
private get peerConnection(): RTCPeerConnection | null {
  // If SFU is offline or call is small (e.g., 2 participants), fall back to direct P2P
  if (this.isSfuMode && this.cloudflareSessionToken) {
    return this.sfuPeerConnection;
  }
  return this.p2pPeerConnection; // Sovereign P2P fallback
}
```

This guarantees that personal calls remain active even during cloud outages.
