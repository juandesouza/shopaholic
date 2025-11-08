# Stripe Keys: Test vs Production

## Current Setup (Test Mode)

You're currently using **Test Mode** keys, which is correct for development and testing:

- **Test Secret Key**: Starts with `sk_test_...`
- **Test Publishable Key**: Starts with `pk_test_...`

### ✅ Test Keys Work for ALL Environments

**Important**: Test keys work in **all Vercel environments** (Development, Preview, and Production). You don't need different keys for different environments when using test mode.

- Test keys are safe to use in production URLs
- No real charges are made
- Perfect for testing your payment flow
- You can test with Stripe's test card numbers

## When to Use Live Keys (Production)

You only need **Live Mode** keys when you're ready to accept **real payments** from actual customers:

- **Live Secret Key**: Starts with `sk_live_...`
- **Live Publishable Key**: Starts with `pk_live_...`

### ⚠️ Important Notes About Live Keys

1. **Real Money**: Live keys process real payments and charge real credit cards
2. **Account Setup Required**: Your Stripe account must be fully set up (business details, bank account, etc.)
3. **Compliance**: You must comply with Stripe's terms and regulations
4. **Testing**: Always test thoroughly with test keys before switching to live keys

## How to Get Live Keys (When Ready)

1. Go to: https://dashboard.stripe.com/apikeys
2. Make sure you're in **Live Mode** (toggle in the top right)
3. Click **"Reveal live key token"** for your Secret key
4. Copy the **Secret key** (starts with `sk_live_...`)
5. Copy the **Publishable key** (starts with `pk_live_...`)
6. Update in Vercel:
   - Replace `STRIPE_SECRET_KEY` with the live secret key
   - Replace `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` with the live publishable key
7. **Redeploy** your project

## Current Recommendation

**Keep using Test Mode keys for now!** 

- Test keys work perfectly for development and testing
- No risk of accidental charges
- You can test the full payment flow safely
- Switch to live keys only when you're ready to go live with real customers

## Test Card Numbers

When using test keys, you can use these test card numbers:

- **Success**: `4242 4242 4242 4242`
- **Decline**: `4000 0000 0000 0002`
- **3D Secure**: `4000 0025 0000 3155`

Any future expiry date and any 3-digit CVC will work.

