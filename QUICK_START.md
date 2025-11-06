# Quick Start - Deploy to GitHub & Vercel

## 🚀 Complete Deployment in 3 Steps

### Step 1: Authenticate with GitHub (One-time)

Run this command and follow the prompts:
```bash
gh auth login
```

Choose:
- **GitHub.com** → **HTTPS** → **Login with a web browser** (easiest)

### Step 2: Push to GitHub

Run the automated script:
```bash
./deploy-to-github.sh
```

Or manually:
```bash
gh repo create shopaholic --public --source=. --remote=origin --push
```

### Step 3: Deploy to Vercel

**Option A: Using Vercel CLI**
```bash
# Install Vercel CLI (if needed)
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

**Option B: Using Vercel Dashboard (Recommended)**
1. Go to https://vercel.com and sign in
2. Click "Add New Project"
3. Import your `shopaholic` repository
4. Add these environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_webhook_secret
   ```
5. Click "Deploy"

**Don't forget to set up Stripe webhooks after deployment!**
See [DEPLOYMENT.md](./DEPLOYMENT.md) for details.

