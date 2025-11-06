# Stripe Connection - Quick Fix Guide

## ✅ Stay in TEST MODE

**Do NOT switch to Live Mode yet!** Test mode is correct for development.

## How to View Logs and Debug

### Step 1: View Logs in Vercel Dashboard

1. Go to: https://vercel.com/dashboard
2. Click **`shopaholic`** project
3. Click **"Deployments"** tab (top navigation)
4. Click on the **latest deployment** (most recent)
5. Click **"Functions"** tab in that deployment
6. Click on **`/api/checkout`**
7. You'll see runtime logs there

### Step 2: Test Checkout and Watch Logs

1. Open your app: https://shopaholic-one.vercel.app
2. Try to checkout
3. Immediately check the logs (from Step 1)
4. Look for:
   - `Stripe key prefix: sk_test_` - Confirms key is loaded
   - Any error messages
   - Connection errors

### Step 3: Verify Environment Variable

1. Vercel Dashboard → `shopaholic` → **Settings**
2. Click **"Environment Variables"**
3. Verify `STRIPE_SECRET_KEY` exists for **Production**
4. The value should be encrypted (you can't see it, but it should be there)

## Common Issues

### Issue: "Connection to Stripe failed"
**Possible causes:**
- Environment variable not set correctly in Vercel
- Network timeout from Vercel to Stripe
- Stripe API key expired or invalid

### Solution Steps:
1. **Re-verify the API key in Stripe Dashboard:**
   - Go to: https://dashboard.stripe.com/test/apikeys
   - Copy the **Secret key** (starts with `sk_test_`)
   - Make sure it matches what you set in Vercel

2. **Re-add the environment variable in Vercel:**
   - Vercel Dashboard → Settings → Environment Variables
   - Delete `STRIPE_SECRET_KEY` for Production
   - Add it again with the correct value
   - Redeploy

3. **Check Stripe account status:**
   - Ensure your Stripe account is active
   - Check for any restrictions: https://dashboard.stripe.com/test/settings/account

## Test Mode is Correct!

- ✅ **Test Mode** = Development/Testing (what you should use now)
- ❌ **Live Mode** = Production with real money (only use when ready)

The connection error is NOT because you're in test mode. It's a configuration or network issue.

## Next Steps

1. View the logs as described above
2. Share the error message you see in the logs
3. We can then fix the specific issue

