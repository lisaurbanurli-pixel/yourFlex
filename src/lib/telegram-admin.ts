/**
 * Telegram Admin Management System
 *
 * Manage which Telegram users can approve/decline codes
 * Add your Telegram user ID(s) to the ADMIN_USER_IDS list
 */

// ⚠️ UPDATE THIS WITH YOUR TELEGRAM USER ID(S)
// Find your user ID: Forward a message from your bot to @userinfobot
// Or use: https://telegram.me/username_to_id_bot
export const ADMIN_USER_IDS = process.env.TELEGRAM_ADMIN_IDS
  ? process.env.TELEGRAM_ADMIN_IDS.split(",").map((id) => id.trim())
  : ["1535273256"]; // Default: your personal chat ID from telegram.ts

export interface AdminAction {
  userId: string | number;
  username?: string;
  action: "approve" | "decline";
  code: string;
  timestamp: string;
  flowType: "new_user" | "forgot_password";
}

// Store admin actions for audit trail
const adminActionLog: AdminAction[] = [];

/**
 * Check if a Telegram user has admin privileges
 */
export function isAdmin(userId: string | number): boolean {
  return ADMIN_USER_IDS.includes(String(userId));
}

/**
 * Log an admin action for audit purposes
 */
export function logAdminAction(action: AdminAction): void {
  adminActionLog.push(action);
  console.log(
    `[Admin Audit] ${action.username || action.userId} ${action.action}ed code ${action.code} (${action.flowType})`,
  );
  // Keep only last 500 actions
  if (adminActionLog.length > 500) {
    adminActionLog.shift();
  }
}

/**
 * Get admin action history
 */
export function getAdminActionHistory(limit: number = 50): AdminAction[] {
  return adminActionLog.slice(-limit);
}

/**
 * Get admin statistics
 */
export function getAdminStats() {
  return {
    totalAdmins: ADMIN_USER_IDS.length,
    adminIds: ADMIN_USER_IDS,
    totalActionsLogged: adminActionLog.length,
    recentActions: adminActionLog.slice(-10),
  };
}

/**
 * Manual approval endpoint (for testing on localhost)
 * Use this when you can't set up a public HTTPS webhook
 */
export function manualApproveCode(
  code: string,
  action: "approve" | "decline",
  flowType: "new_user" | "forgot_password" = "new_user",
): void {
  logAdminAction({
    userId: "manual-admin",
    action,
    code,
    timestamp: new Date().toISOString(),
    flowType,
  });
}
