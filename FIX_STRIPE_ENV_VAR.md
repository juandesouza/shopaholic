# Fix Stripe Environment Variable in Vercel

## The Problem

The error `Invalid character in header content ["Authorization"]` means your `STRIPE_SECRET_KEY` in Vercel has invalid characters (newlines, quotes, or special characters) that can't be used in HTTP headers.

## Solution: Re-set the Environment Variable

### Step 1: Get Your Clean Stripe Key

1. Go to: https://dashboard.stripe.com/test/apikeys
2. Find your **Secret key** (starts with `sk_test_`)
3. **Copy it carefully** - make sure you get the ENTIRE key
4. The key should look like: `sk_test_51...` (a long string starting with `sk_test_`)

### Step 2: Update in Vercel

1. Go to: https://vercel.com/dashboard
2. Click on **`shopaholic`** project
3. Go to **Settings** → **Environment Variables**
4. Find `STRIPE_SECRET_KEY` for **Production**
5. **Delete it** (click the trash icon)
6. **Add it again** with these steps:
   - Click **"Add New"**
   - Key: `STRIPE_SECRET_KEY`
   - Value: Paste your key from Stripe (make sure NO extra spaces or characters)
   - Environment: Select **Production** (and Preview/Development if needed)
   - Click **Save**

### Step 3: Important - When Adding the Key

- **Paste directly** - don't type it
- **No spaces** before or after
- **No quotes** around it
- **No newlines** - it should be one continuous line
- **Copy the ENTIRE key** from Stripe dashboard

### Step 4: Redeploy

After updating the environment variable:
1. Go to **Deployments** tab
2. Click the **three dots** (⋯) on the latest deployment
3. Click **"Redeploy"**
4. Wait for it to complete

## Verify It's Fixed

After redeploying, check the logs:
1. Try checkout again
2. Check function logs for `/api/checkout`
3. You should see: `Cleaned Stripe key prefix: sk_test_51` (or similar)
4. No more "Invalid character" errors

## Why This Happens

Sometimes when copying/pasting API keys:
- Extra spaces get added
- Newlines get included
- Quotes get added automatically
- Special characters get inserted

The code now cleans these automatically, but it's best to have a clean key in Vercel from the start.

