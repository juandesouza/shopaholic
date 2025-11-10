# Deployment Checklist for Vercel

## ✅ Pre-Deployment Checklist

### 1. Environment Variables in Vercel

Make sure these are set in **Vercel Dashboard → Your Project → Settings → Environment Variables**:

**Required:**
- ✅ `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key  
- ✅ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key
- ✅ `STRIPE_SECRET_KEY` - Your Stripe secret key

**For Production Webhooks:**
- ⚠️ `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret (set this up after first deployment)

### 2. Code Changes Made for Production

✅ **Checkout Route** - Already handles production URLs correctly:
- Detects localhost vs production automatically
- Uses `https://` for production, `http://` for localhost
- Falls back to Vercel URL or production URL

✅ **Direct Fetch Requests** - All database operations now use direct HTTP requests:
- `use-save-shopping-list.ts` - Uses direct fetch (works in production)
- `use-shopping-lists.ts` - Uses direct fetch (works in production)
- `ShoppingCart.tsx` - Uses direct fetch for clearing cart (works in production)

✅ **Supabase Client** - Uses singleton pattern to avoid multiple instances

### 3. Supabase Configuration

**Important:** Update Supabase redirect URLs for production:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Authentication** → **URL Configuration**
4. Add your Vercel production URL to **Redirect URLs**:
   ```
   https://your-vercel-app.vercel.app/**
   ```
   (Use `/**` wildcard to allow all paths)

5. Also update **Site URL** to your production URL (no wildcard):
   ```
   https://your-vercel-app.vercel.app
   ```

### 4. Stripe Configuration

**After first deployment, set up webhooks:**

1. Get your Vercel deployment URL (e.g., `https://shopaholic-xyz.vercel.app`)
2. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
3. Click "Add endpoint"
4. Enter webhook URL:
   ```
   https://your-vercel-app.vercel.app/api/webhooks/stripe
   ```
5. Select events:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded` (critical for Boleto)
   - `checkout.session.async_payment_failed`
6. Copy the webhook signing secret
7. Add it to Vercel as `STRIPE_WEBHOOK_SECRET`

### 5. Database RLS Policies

**Important:** Make sure RLS policies allow operations. If you haven't run the fix script:

1. Go to Supabase Dashboard → SQL Editor
2. Run the SQL from `fix-rls-policies.sql` to ensure inserts work

## 🚀 Deployment Steps

1. **Commit and push to GitHub:**
   ```bash
   git add .
   git commit -m "Fix database operations and cart clearing"
   git push origin main
   ```

2. **Vercel will automatically deploy** (if connected to GitHub)

3. **Verify deployment:**
   - Check Vercel dashboard for build status
   - Visit your production URL
   - Test: Add items, save list, checkout

## 🔍 Post-Deployment Verification

After deployment, test:

1. ✅ **Authentication** - Sign in with Google/Email
2. ✅ **Save List** - Add items and save (should appear in cart)
3. ✅ **Shopping Cart** - Items should appear correctly
4. ✅ **Checkout** - Complete a test payment
5. ✅ **Cart Clearing** - After payment, cart should clear and disappear

## ⚠️ Common Issues

### Issue: Environment variables not working
**Solution:** Make sure all `NEXT_PUBLIC_` variables are set in Vercel and redeploy

### Issue: Database operations fail
**Solution:** 
- Check RLS policies in Supabase
- Verify environment variables are correct
- Check Vercel function logs for errors

### Issue: Stripe checkout redirects to wrong URL
**Solution:** The code automatically detects production vs localhost, but verify `VERCEL_URL` is set in Vercel

### Issue: OAuth redirects fail
**Solution:** Update Supabase redirect URLs to include your Vercel domain

## 📝 Notes

- All database operations now use direct `fetch` requests (bypasses Supabase client issues)
- The app automatically detects localhost vs production URLs
- Environment variables are injected at build time by Next.js
- No code changes needed for production - everything should work automatically!

