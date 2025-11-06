# Redirect URL Fixes Applied

## Changes Made

### 1. Checkout Route (`app/api/checkout/route.ts`)
- **Before**: Used `http://localhost:3000` as fallback for success/cancel URLs
- **After**: Uses request origin, environment variables, or production URL as fallback
- Now dynamically determines the correct URL based on:
  1. Request origin header (primary)
  2. Request host header (secondary)
  3. `NEXT_PUBLIC_APP_URL` environment variable
  4. `VERCEL_URL` environment variable
  5. Production URL as final fallback

### 2. Google OAuth (`app/contexts/AuthContext.tsx`)
- **Before**: Used `window.location.origin` only
- **After**: Enhanced to use current origin with pathname, with fallbacks to environment variables and production URL
- Now works correctly in both development and production environments

## Important: Supabase Configuration

For Google OAuth to work correctly, you need to configure both the **Site URL** and **Redirect URLs** in your Supabase dashboard:

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Authentication** → **URL Configuration**

### Step 1: Update Site URL
4. In the **Site URL** field (at the top), change from `http://localhost:3000` to your production URL (NO wildcards here, just the base URL):
   ```
   https://shopaholic-mbcjdvn09-juan-de-souzas-projects-51f7e08a.vercel.app
   ```
   **This is the base URL of your application and is critical for OAuth redirects!**
   
   **Note:** The Site URL should NOT have wildcards, just the base domain.

### Step 2: Add Redirect URLs
5. In the **Redirect URLs** section below, add your production URL with wildcard (recommended for Vercel since deployment URLs can change):
   ```
   https://shopaholic-mbcjdvn09-juan-de-souzas-projects-51f7e08a.vercel.app/**
   ```
   
   **Notes:**
   - The `/**` wildcard allows all paths under this domain (recommended for flexibility)
   - You can also use the exact URL without wildcard if preferred
   - If you have multiple production deployments, you can add each one with wildcards
   - This is especially useful since Vercel deployment URLs can change with each deployment
   
5. Also add your localhost for development (if needed):
   ```
   http://localhost:3000
   ```
   
   **Note:** Vercel deployment URLs change with each deployment. For a permanent solution, consider:
   - Setting up a custom domain in Vercel
   - Or updating the redirect URL in Supabase whenever you deploy

## Testing

After deployment, test:
1. ✅ Google OAuth sign-in redirects to production URL
2. ✅ Stripe checkout success/cancel URLs use production URL
3. ✅ All redirects work correctly in production

## Deployment Status

- ✅ Code updated and committed to GitHub
- ✅ Deployed to Vercel production
- ⚠️ **Action Required**: Configure Supabase redirect URLs in dashboard

