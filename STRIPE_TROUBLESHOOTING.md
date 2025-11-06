# Stripe Connection Troubleshooting

## Test Mode vs Live Mode

**✅ Keep using TEST MODE for now!**

- **Test Mode** (current): Use for development and testing
  - Keys start with `sk_test_` and `pk_test_`
  - No real charges are made
  - Perfect for development

- **Live Mode**: Only use when ready for production with real customers
  - Keys start with `sk_live_` and `pk_live_`
  - Real charges are made
  - Requires completed Stripe account setup

**The connection error is NOT because you're in test mode.**

## Common Causes of "Connection to Stripe Failed"

### 1. Invalid or Expired API Key
- Check that your `STRIPE_SECRET_KEY` in Vercel matches your Stripe Dashboard
- Go to: https://dashboard.stripe.com/test/apikeys
- Verify the secret key starts with `sk_test_`
- Make sure it's the **Secret key**, not the Publishable key

### 2. Account Restrictions
- Check your Stripe Dashboard for any account restrictions
- Go to: https://dashboard.stripe.com/test/settings/account
- Ensure your account is active and not restricted

### 3. Network/Firewall Issues
- Vercel serverless functions should have internet access
- The error might be temporary - try again

### 4. API Key Not Set in Vercel
- Verify the environment variable is set for **Production** environment
- Go to: Vercel Dashboard → Your Project → Settings → Environment Variables
- Make sure `STRIPE_SECRET_KEY` exists and is correct

## How to Verify Your Stripe Setup

1. **Check API Keys in Stripe Dashboard:**
   - Go to: https://dashboard.stripe.com/test/apikeys
   - Copy your **Secret key** (starts with `sk_test_`)
   - Verify it matches what's in Vercel

2. **Test the API Key:**
   - You can test if the key works by checking Stripe Dashboard → Developers → Logs
   - Any API calls should appear there

3. **Check Vercel Environment Variables:**
   ```bash
   vercel env ls
   ```
   - Verify `STRIPE_SECRET_KEY` is set for Production
   - The value should be encrypted (you won't see it)

## Next Steps

1. **Verify the API key in Vercel matches Stripe Dashboard**
2. **Check Stripe Dashboard → Developers → Logs** for any error messages
3. **Try the checkout again** - sometimes it's a temporary network issue
4. **Check browser console** (F12) for any client-side errors

## When to Switch to Live Mode

Only switch to Live Mode when:
- ✅ Your app is fully tested and working
- ✅ You're ready to accept real payments
- ✅ You've completed Stripe account verification
- ✅ You've set up webhooks with live keys
- ✅ You understand the difference and implications

**For now, stay in Test Mode and fix the connection issue first.**
