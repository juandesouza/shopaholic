# Shopaholic

A modern shopping list application built with Next.js, Supabase, and Stripe integration.

## Features

- 🛒 **Shopping Lists**: Create and manage multiple shopping lists
- 🛍️ **Shopping Cart**: Add items to cart with dynamic pricing ($1 per letter, converted to BRL)
- 💳 **Payment Integration**: Stripe checkout with Cards and Boleto payment methods
- 🔐 **Authentication**: User authentication with Supabase
- 🎨 **Modern UI**: Beautiful, responsive design with Tailwind CSS and Framer Motion
- 🌙 **Theme Support**: Dark/light theme toggle

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Stripe
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A Supabase project
- A Stripe account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd shopaholic
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:

Create a `.env.local` file in the root directory:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key

# Production: Stripe Webhook Secret
# STRIPE_WEBHOOK_SECRET=your_webhook_secret
```

4. Set up the database:

Run the migration in your Supabase project:
```bash
# Apply the migration from supabase/migrations/001_create_shopping_lists_table.sql
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
shopaholic/
├── app/
│   ├── api/              # API routes (checkout, webhooks)
│   ├── components/        # React components
│   ├── contexts/          # React contexts (Auth, Theme)
│   ├── hooks/             # Custom React hooks
│   ├── lib/               # Utility libraries (Supabase, Stripe)
│   └── page.tsx           # Home page
├── supabase/
│   └── migrations/        # Database migrations
└── public/                # Static assets
```

## Payment Integration

This project uses Stripe with support for:
- **Cards**: Credit and debit cards (immediate payment)
- **Boleto**: Brazilian bank slip payment (delayed payment)

See [STRIPE_SETUP.md](./STRIPE_SETUP.md) for detailed Stripe setup instructions.

## Environment Variables

### Required for Development

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key
- `STRIPE_SECRET_KEY`: Your Stripe secret key

### Required for Production

- `STRIPE_WEBHOOK_SECRET`: Stripe webhook signing secret (for webhook verification)

## Deployment

### Vercel

1. Push your code to GitHub
2. Import your repository in [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy!

The app will automatically deploy on every push to the main branch.

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## License

Private project

