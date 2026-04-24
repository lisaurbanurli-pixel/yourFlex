# Quick Setup Checklist

## ✅ Local Development - Done!

Your `.env.local` is now configured with:

- Telegram bot credentials
- Vercel KV (Redis) credentials

**To start local dev:**

```bash
npm run dev
```

Visit: http://localhost:3000

---

## 🚀 Production Setup (Vercel)

### Step 1: Go to Vercel Dashboard

1. Navigate to: https://vercel.com/dashboard
2. Select your project: `your flex Benefit`
3. Click **Settings** at the top
4. Go to **Environment Variables** in the left sidebar

### Step 2: Add Environment Variables

Click **Add New** and add these one by one:

**Telegram Configuration:**

```
Name: TELEGRAM_BOT_TOKEN
Value: 8241580139:AAGoafeGFnc18kLkS8oIS_KDwIz0H-Twmo4
```

```
Name: TELEGRAM_CHAT_ID
Value: 607474524
```

```
Name: TELEGRAM_ADMIN_IDS
Value: 607474524
```

```
Name: SITE_NAME
Value: Your Flex Benefit
```

```
Name: NEXT_PUBLIC_SITE_NAME
Value: Your Flex Benefit
```

**Vercel KV (Redis) Configuration:**

```
Name: KV_URL
Value: redis://default:R49EvepMK4Eot532Xgckhgozd1XvrcBO@redis-12282.c90.us-east-1-3.ec2.cloud.redislabs.com:12282
```

```
Name: KV_REST_API_URL
Value: https://redis-12282.c90.us-east-1-3.ec2.cloud.redislabs.com
```

```
Name: KV_REST_API_TOKEN
Value: R49EvepMK4Eot532Xgckhgozd1XvrcBO
```

```
Name: KV_REST_API_READ_ONLY_TOKEN
Value: R49EvepMK4Eot532Xgckhgozd1XvrcBO
```

### Step 3: Save & Redeploy

1. Click **Save** after adding each variable
2. Go to **Deployments** tab
3. Find your latest deployment → click the **...** menu
4. Click **Redeploy** (this applies the new env vars)

Or deploy via terminal:

```bash
git add .
git commit -m "Configure Vercel KV and Telegram"
git push origin main
```

---

## 🧪 Test It Works

### Test 1: Check Local (Optional)

```bash
npm run dev
```

Visit: http://localhost:3000/api/telegram/code-status?codeId=test

Should return: `{"ok": false, "error": "code_not_found"}`

✅ This means KV is working!

### Test 2: Check Production

After redeploying:

1. Go to your site: https://your-flex.vercel.app
2. Start a verification flow
3. Should receive Telegram message with code
4. Click Approve/Decline button
5. Should work smoothly

---

## 🔍 Verify Variables Are Set

In Vercel Dashboard:

1. **Settings** → **Environment Variables**
2. Confirm you see all 10 variables listed:
   - TELEGRAM_BOT_TOKEN ✓
   - TELEGRAM_CHAT_ID ✓
   - TELEGRAM_ADMIN_IDS ✓
   - SITE_NAME ✓
   - NEXT_PUBLIC_SITE_NAME ✓
   - KV_URL ✓
   - KV_REST_API_URL ✓
   - KV_REST_API_TOKEN ✓
   - KV_REST_API_READ_ONLY_TOKEN ✓

---

## 🆘 Troubleshooting

### Error: "Failed to connect to Redis"

- Check that KV_URL is set in Vercel env vars
- Verify no extra spaces in the URL
- Try redeploying

### Error: "Code not found" on first try

- Wait 1-2 seconds for KV to save
- Check Vercel logs: `vercel logs`

### Telegram doesn't send message

- Verify TELEGRAM_BOT_TOKEN is correct
- Verify TELEGRAM_CHAT_ID is correct (should be numeric)
- Check logs: `vercel logs --grep TELEGRAM`

---

## 📊 Monitor Your System

### View Logs

```bash
vercel logs --follow
```

### Search for Errors

```bash
vercel logs --grep "ERROR"
```

### Check KV Data

In Vercel Dashboard:

1. Click **Storage** at the top
2. Find your KV database
3. View stored codes (keys starting with `pending:`)

---

That's it! You now have:
✅ Local development with KV
✅ Production deployment with KV
✅ Telegram bot integration
✅ Admin approval system
✅ SMS verification codes

**Next: Start a verification on your site and test the full flow!**
