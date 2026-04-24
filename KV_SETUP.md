# Vercel KV Setup Guide

## What You Have

You were given a Redis URL - this means you already have a Vercel KV database! 🎉

```
redis://default:R49EvepMK4Eot532Xgckhgozd1XvrcBO@redis-12282.c90.us-east-1-3.ec2.cloud.redislabs.com:12282
```

## What You Need to Do

### Option 1: Simple Setup (Recommended)

1. Go to **Vercel Dashboard** → **Settings** → **Environment Variables**

2. Add these variables (copy exactly):

```
KV_URL=redis://default:R49EvepMK4Eot532Xgckhgozd1XvrcBO@redis-12282.c90.us-east-1-3.ec2.cloud.redislabs.com:12282
KV_REST_API_URL=https://redis-12282.c90.us-east-1-3.ec2.cloud.redislabs.com
KV_REST_API_TOKEN=R49EvepMK4Eot532Xgckhgozd1XvrcBO
```

**Where to find these from your URL:**

- `KV_URL` = Use the full URL you were given
- `KV_REST_API_URL` = `https://` + the host part (redis-12282.c90.us-east-1-3.ec2.cloud.redislabs.com)
- `KV_REST_API_TOKEN` = The password part (R49EvepMK4Eot532Xgckhgozd1XvrcBO)

3. Click **Save** and redeploy

---

### Option 2: Get Official Credentials from Vercel

If you want to be extra sure, you can get the credentials directly from Vercel:

1. Go to **Vercel Dashboard**
2. Click **Storage** at the top
3. Find your KV database and click it
4. Click **View** or the database name
5. Scroll down to **Connection String** or **Token**
6. Copy all the credentials shown

---

## Local Development (.env.local)

Create a `.env.local` file in your project root:

```bash
# Copy the same values
KV_URL=redis://default:R49EvepMK4Eot532Xgckhgozd1XvrcBO@redis-12282.c90.us-east-1-3.ec2.cloud.redislabs.com:12282
KV_REST_API_URL=https://redis-12282.c90.us-east-1-3.ec2.cloud.redislabs.com
KV_REST_API_TOKEN=R49EvepMK4Eot532Xgckhgozd1XvrcBO
KV_REST_API_READ_ONLY_TOKEN=R49EvepMK4Eot532Xgckhgozd1XvrcBO
```

Then start your dev server:

```bash
npm run dev
```

---

## Verify It's Working

### Test 1: Local Test

Run this in your terminal:

```bash
node -e "
const { kv } = require('@vercel/kv');
(async () => {
  try {
    await kv.set('test_key', 'test_value', { ex: 60 });
    const value = await kv.get('test_key');
    console.log('✅ Success! KV is working. Value:', value);
  } catch (e) {
    console.error('❌ Error:', e.message);
  }
})();
"
```

### Test 2: In Your API

Add this temporary test endpoint in `src/app/api/test/route.ts`:

```typescript
import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Write test data
    await kv.set("test", "works", { ex: 60 });

    // Read test data
    const value = await kv.get("test");

    return NextResponse.json({
      ok: true,
      message: "KV is working!",
      value: value,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
```

Then visit: `http://localhost:3000/api/test`

Should see:

```json
{
  "ok": true,
  "message": "KV is working!",
  "value": "works"
}
```

---

## Complete Environment Variables

Once KV is set up, add all these to **Vercel → Settings → Environment Variables**:

```bash
# Telegram (already have these?)
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
TELEGRAM_ADMIN_IDS=your_admin_id

# Vercel KV (from your URL)
KV_URL=redis://default:R49EvepMK4Eot532Xgckhgozd1XvrcBO@redis-12282.c90.us-east-1-3.ec2.cloud.redislabs.com:12282
KV_REST_API_URL=https://redis-12282.c90.us-east-1-3.ec2.cloud.redislabs.com
KV_REST_API_TOKEN=R49EvepMK4Eot532Xgckhgozd1XvrcBO
KV_REST_API_READ_ONLY_TOKEN=R49EvepMK4Eot532Xgckhgozd1XvrcBO

# Site config
SITE_NAME=Your Flex Benefit
NEXT_PUBLIC_SITE_NAME=Your Flex Benefit
```

---

## Troubleshooting

### Error: "ENOTFOUND redis-12282..."

- ✅ This means `.env.local` is not loaded
- **Fix**: Restart your dev server after creating `.env.local`
- Command: `npm run dev` (stop and restart)

### Error: "Unauthorized" or "invalid credentials"

- ✅ Check the token is correct
- **Fix**: Copy it again from Vercel dashboard, watch for spaces

### Error in production (Vercel)

- ✅ Vercel env vars not set
- **Fix**: Go to Vercel Dashboard → Settings → Environment Variables → add all KV vars

### "Cannot find module @vercel/kv"

- ✅ Package not installed
- **Fix**: Run `npm install @vercel/kv`

---

## Summary

1. ✅ **You already have KV** (you have the Redis URL)
2. ✅ **No Redis install needed** (it's hosted in cloud)
3. ✅ **Just add env vars** to `.env.local` (local) and Vercel (production)
4. ✅ **That's it!** The code already uses it via `@vercel/kv` package

No additional installation or setup required! 🚀
