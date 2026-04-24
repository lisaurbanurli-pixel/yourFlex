# Telegram Webhook Setup - Your Values

## Your Setup Values

```
Bot Token:    8241580139:AAGoafeGFnc18kLkS8oIS_KDwIz0H-Twmo4
Your Domain:  your-flex.vercel.app (or check your actual Vercel URL)
Webhook URL:  https://your-flex.vercel.app/api/telegram/webhook
```

---

## Option 1: Set Webhook (Quick & Easy)

**Just visit this URL in your browser:**

```
https://api.telegram.org/bot8241580139:AAGoafeGFnc18kLkS8oIS_KDwIz0H-Twmo4/setWebhook?url=https://your-flex.vercel.app/api/telegram/webhook
```

You should see:
```json
{"ok":true,"result":true,"description":"Webhook was set"}
```

✅ **Done!**

---

## Option 2: Set Webhook (Via Terminal)

**Copy and paste this into PowerShell:**

```powershell
$token = "8241580139:AAGoafeGFnc18kLkS8oIS_KDwIz0H-Twmo4"
$webhook = "https://your-flex.vercel.app/api/telegram/webhook"
$url = "https://api.telegram.org/bot$token/setWebhook?url=$webhook"

Invoke-WebRequest -Uri $url
```

Or using curl:

```bash
curl "https://api.telegram.org/bot8241580139:AAGoafeGFnc18kLkS8oIS_KDwIz0H-Twmo4/setWebhook?url=https://your-flex.vercel.app/api/telegram/webhook"
```

---

## Verify It's Working

**Visit this URL to check the webhook info:**

```
https://api.telegram.org/bot8241580139:AAGoafeGFnc18kLkS8oIS_KDwIz0H-Twmo4/getWebhookInfo
```

You should see:
```json
{
  "ok": true,
  "result": {
    "url": "https://your-flex.vercel.app/api/telegram/webhook",
    "has_custom_certificate": false,
    "pending_update_count": 0
  }
}
```

✅ If `"pending_update_count": 0`, webhook is set and ready!

---

## Test It

1. **Start a verification on your site**
   - Go to: https://your-flex.vercel.app/two-factor/verify
   - Enter code

2. **Check Telegram**
   - You should receive message with:
     - Code value
     - Approve button ✅
     - Decline button ❌

3. **Click Approve or Decline**
   - Message should update showing status
   - Frontend should show "approved" or "declined"

---

## Troubleshooting

### Error: "Invalid bot token"
- Check the token is correct (should start with numbers)
- Copy from `.env.local` file

### Error: "Invalid webhook URL"
- Make sure your Vercel domain is correct
- Check it's HTTPS (not HTTP)
- Verify the path ends with `/api/telegram/webhook`

### Can't verify webhook was set
- Wait 5 seconds and try again
- Check `/getWebhookInfo` to see current status
- Check Vercel logs: `vercel logs`

---

## Your Actual Domain

Is your Vercel domain `your-flex.vercel.app`?

If different, update these URLs:
```
https://YOUR_ACTUAL_DOMAIN/api/telegram/webhook
```

Then set webhook again with correct domain.

---

**That's it! Webhook is now live and ready for Telegram messages.** 🚀
