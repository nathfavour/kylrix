---
name: why.storage-upload-gating
description: Deep dive into the server-side file upload security engine in Kylrix. Explains the subscription plan gates, bucket-level byte ceilings, and Next.js Server Action serialization bypasses.
---

# Why: Secure Storage Upload Gating & Tier Checks

Exposing file upload APIs to clients without strict server-side validation is highly dangerous. Attackers can upload extremely large files, exhausting server space or storage bandwidth, or bypass subscription paywalls.

We prevent these exploits using the secure gateway in `lib/actions/secure-upload.ts`.

## 1. Strict Server-Side Size Ceilings

While we perform client-side file size checks for a smooth user experience, client checks are easily bypassed. We enforce mandatory server-side limits matching each storage bucket's purpose:

```typescript
const SERVER_BUCKET_LIMITS: Record<string, number> = {
  profile_pictures: 1 * 1024 * 1024,   // 1 MB
  messages: 1 * 1024 * 1024,           // 1 MB
  notes_attachments: 5 * 1024 * 1024,   // 5 MB
  vault_attachments: 5 * 1024 * 1024,   // 5 MB
  form_media: 10 * 1024 * 1024,        // 10 MB
  chat_uploads: 10 * 1024 * 1024,      // 10 MB
  default: 10 * 1024 * 1024,           // 10 MB Guideline ceiling
};
```

If a file exceeds these limits, we reject the upload immediately before allocating cloud storage space or incurring network fees.

## 2. Subscription Plan Gatekeeping

To support a sustainable SaaS model, we restrict advanced storage uploads (like attaching files to encrypted Vault entries or uploading heavy media) to paid tiers. We authorize uploads for free users only in core buckets:

```typescript
const allowedFreeBuckets = [
  APPWRITE_CONFIG.BUCKETS.PROFILE_PICTURES,
  'voice', 
];

if (!allowedFreeBuckets.includes(bucketId)) {
  if (!hasPaidKylrixPlan(actor)) {
    throw new Error('Forbidden: Pro subscription required for this upload operation.');
  }
}
```

## 3. Hexagonal Routing & Safe Next.js Serialization

This action is fully decoupled from proprietary database drivers by routing file buffers through the hexagonal storage port:

```typescript
const arrayBuffer = await file.arrayBuffer();
const buffer = Buffer.from(arrayBuffer);

const uploadedFile = await Registry.getStorage().uploadFile(bucketId, fileId, {
  name: file.name,
  type: file.type,
  size: file.size,
  buffer,
});
```

Because Next.js Server Actions enforce strict serialization boundaries, any custom class instances returned by cloud SDKs will throw runtime errors. We solve this elegantly by serializing the response to a plain JSON object:

```typescript
return JSON.parse(JSON.stringify(uploadedFile));
```
