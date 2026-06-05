import { Client, Databases, Query } from 'node-appwrite';

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT || 'https://api.kylrix.space/v1')
  .setProject(process.env.APPWRITE_PROJECT || '67fe9627001d97e37ef3')
  .setKey(process.env.APPWRITE_API || '');

const db = new Databases(client);

async function run() {
  try {
    const res = await db.listDocuments('chat', 'accountEvents', [
      Query.equal('type', 'coupon')
    ]);
    console.log(`Found ${res.documents.length} experimental coupons to delete.`);
    for (const doc of res.documents) {
      await db.deleteDocument('chat', 'accountEvents', doc.$id);
      console.log(`Deleted ${doc.$id}`);
    }
  } catch (err) {
    console.error('Failed to delete old coupons:', err);
  }
}

run();