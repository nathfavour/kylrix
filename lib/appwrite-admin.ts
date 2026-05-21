import { Client, Account, Databases, Messaging, Storage, Users, TablesDB } from 'node-appwrite';
import { PROJECT_ID, ENDPOINT } from '../generated/appwrite/constants';

/**
 * Creates a system client with full server-side permissions.
 * This represents the "System Executor" level to power standard, safe application features.
 * ALWAYS use this on the server only.
 */
export function createSystemClient() {
  const client = new Client();
  const apiKey = process.env.APPWRITE_API;
  
  if (!apiKey) {
    console.error('[System Client] APPWRITE_API environment variable is missing.');
  }

  client
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(apiKey || '');

  return {
    client,
    account: new Account(client),
    databases: new Databases(client),
    messaging: new Messaging(client),
    storage: new Storage(client),
    users: new Users(client),
  };
}

/**
 * Creates a server-side TablesDB instance with system executor privileges.
 * Used for chat and shared system data access.
 */
export function createSystemTablesDB() {
  const apiKey = process.env.APPWRITE_API;

  if (!apiKey) {
    console.error('[System TablesDB] APPWRITE_API environment variable is missing.');
  }

  const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(apiKey || '');

  return new TablesDB(client);
}

/**
 * Checks if a given email is listed in the ADMINS environment variable.
 */
export function isEmailInAdminList(email?: string | null): boolean {
  const normalized = String(email || '').trim().toLowerCase();
  if (!normalized) return false;

  const adminList = String(process.env.ADMINS || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return adminList.includes(normalized);
}

/**
 * Highly gated Admin Client for strict administrative actions (manual billing, admin panel).
 * Mathematically guaranteed to fail if APPWRITE_API is invalid.
 * If actorEmail is provided, it is strictly validated against the ADMINS env variable.
 */
export function createAdminClient(actorEmail?: string | null) {
  const apiKey = process.env.APPWRITE_API;
  
  if (!apiKey) {
    throw new Error('System API key is missing. Unauthorized action.');
  }

  if (actorEmail !== undefined) {
    if (!isEmailInAdminList(actorEmail)) {
      console.warn(`[Admin Client] Gated action blocked. ${actorEmail} is not authorized.`);
      throw new Error('Forbidden: Unauthorized admin operation.');
    }
  }

  const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(apiKey);

  return {
    client,
    account: new Account(client),
    databases: new Databases(client),
    messaging: new Messaging(client),
    storage: new Storage(client),
    users: new Users(client),
  };
}

/**
 * Highly gated Admin TablesDB instance.
 * Validates the actor email against the ADMINS env variable.
 */
export function createAdminTablesDB(actorEmail?: string | null) {
  const apiKey = process.env.APPWRITE_API;

  if (!apiKey) {
    throw new Error('System API key is missing. Unauthorized action.');
  }

  if (actorEmail !== undefined) {
    if (!isEmailInAdminList(actorEmail)) {
      console.warn(`[Admin TablesDB] Gated action blocked. ${actorEmail} is not authorized.`);
      throw new Error('Forbidden: Unauthorized admin operation.');
    }
  }

  const client = new Client()
    .setEndpoint(ENDPOINT)
    .setProject(PROJECT_ID)
    .setKey(apiKey);

  return new TablesDB(client);
}
