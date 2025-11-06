# How to View Vercel Function Logs

## To See Stripe Checkout Errors

### Option 1: Vercel Dashboard (Easiest)

1. Go to **Vercel Dashboard**: https://vercel.com/dashboard
2. Click on your **`shopaholic`** project
3. Go to the **"Deployments"** tab (NOT "Functions" - that's just settings)
4. Click on the **latest deployment** (the most recent one)
5. Click on the **"Functions"** tab in that deployment
6. Click on **`/api/checkout`** function
7. You'll see the **runtime logs** there

### Option 2: Using Vercel CLI

```bash
# List recent deployments
vercel ls

# View logs for a specific deployment
vercel logs <deployment-url>

# Or view logs in real-time
vercel logs <deployment-url> --follow
```

### Option 3: Real-time Logs

1. Vercel Dashboard → Your Project
2. Click **"Logs"** tab (at the top)
3. This shows real-time logs from all functions
4. Filter by function: `/api/checkout`

## What to Look For

When you try to checkout, look for:
- `Stripe key prefix: sk_test_` - Confirms key is loaded
- `Creating Stripe checkout session...` - Shows the function is running
- Any error messages from Stripe
- Network connection errors

## Quick Test

After viewing logs, try the checkout again and watch the logs in real-time to see what error appears.

