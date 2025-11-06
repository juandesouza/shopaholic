# Deployment Guide

## Step 1: Push to GitHub

### Option A: Using GitHub CLI (Recommended)

1. **Authenticate with GitHub** (one-time setup):
```bash
gh auth login
```
Follow the prompts to authenticate via browser or token.

2. **Create repository and push**:
```bash
gh repo create shopaholic --public --source=. --remote=origin --push
```

### Option B: Manual GitHub Setup

1. Go to [GitHub](https://github.com/new) and create a new repository named `shopaholic`
2. **Don't** initialize it with a README, .gitignore, or license
3. Run these commands:
```bash
git remote add origin https://github.com/YOUR_USERNAME/shopaholic.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Vercel

### Option A: Using Vercel CLI

1. **Install Vercel CLI** (if not already installed):
```bash
npm i -g vercel
```

2. **Login to Vercel**:
```bash
vercel login
```

3. **Deploy**:
```bash
vercel
```
Follow the prompts. For production deployment:
```bash
vercel --prod
```

### Option B: Using Vercel Dashboard

1. Go to [Vercel](https://vercel.com) and sign in
2. Click "Add New Project"
3. Import your GitHub repository
4. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET` (for production)
5. Click "Deploy"

### Environment Variables for Vercel

Add these in your Vercel project settings:

**Required:**
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key
- `STRIPE_SECRET_KEY` - Your Stripe secret key

**For Production:**
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret

**Stripe Webhook Setup:**
1. In Stripe Dashboard → Developers → Webhooks
2. Add endpoint: `https://your-vercel-domain.vercel.app/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
   - `checkout.session.async_payment_failed`
4. Copy the webhook secret and add to Vercel environment variables

## Post-Deployment

After deployment, your app will be available at:
- Preview deployments: `https://shopaholic-*.vercel.app`
- Production: `https://your-custom-domain.vercel.app` (if configured)

The app will automatically redeploy on every push to the main branch.

