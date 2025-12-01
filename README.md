# E-Commerce Store

A modern, lightweight e-commerce application built with Next.js, Supabase, and Stripe.

## Tech Stack

- **Next.js 16** – App Router, React Server Components, React Compiler
- **Supabase** – PostgreSQL database for products, carts, and orders
- **Stripe** – Payment processing and checkout
- **Bun** – Fast JavaScript runtime and package manager
- **Tailwind CSS v4** – Modern utility-first styling
- **Shadcn UI** – Accessible component library
- **TypeScript** – Type-safe development

## Architecture

```
Next.js (Frontend)
    ↓
Supabase (Database: products, carts, orders)
    ↓
Stripe (Checkout & Webhooks)
```

- **Supabase** handles all data: products, cart items, and order history
- **Stripe** handles payment processing via Checkout Sessions
- **Next.js** serves as the frontend with server components for data fetching

## Prerequisites

- **Node.js 20+** or **Bun 1.0+**
- **Supabase account** – [Create one here](https://supabase.com)
- **Stripe account** – [Create one here](https://stripe.com)

## Setup Instructions

### 1. Install Dependencies

```bash
bun install
```

### 2. Set Up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** in your Supabase dashboard
3. Run the SQL migration from `supabase/migrations.sql`
4. Copy your project URL and anon key from **Settings → API**

### 3. Set Up Stripe

1. Create a Stripe account at [stripe.com](https://stripe.com)
2. Get your **Secret Key** from **Developers → API keys**
3. Set up a webhook endpoint:
   - Go to **Developers → Webhooks**
   - Add endpoint: `https://your-domain.com/api/stripe/webhook`
   - Select events: `checkout.session.completed`, `payment_intent.succeeded`
   - Copy the **Webhook Signing Secret**

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Stripe
STRIPE_SECRET_KEY=sk_test_your-secret-key-here
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret-here

# Application
NEXT_PUBLIC_ROOT_URL=http://localhost:3000
```

### 5. Run the Development Server

```bash
bun dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/
│   ├── api/stripe/          # Stripe checkout & webhook handlers
│   ├── cart/                # Cart components & actions
│   ├── checkout/            # Checkout success page
│   ├── product/[slug]/     # Product detail pages
│   └── products/            # Products listing page
├── lib/
│   ├── supabase/           # Supabase client & types
│   ├── stripe/             # Stripe client
│   ├── cart.ts             # Cart operations
│   └── products.ts         # Product queries
└── supabase/
    └── migrations.sql      # Database schema
```

## Database Schema

The SQL migration creates the following tables:

- **products** – Product catalog
- **product_variants** – Product variants (size, color, etc.)
- **carts** – Shopping carts
- **cart_items** – Items in carts
- **orders** – Completed orders
- **order_items** – Order line items (snapshot at purchase time)

All tables include proper indexes, RLS policies, and auto-updating timestamps.

## Adding Products

Insert products directly into Supabase:

```sql
-- Insert a product
INSERT INTO products (name, slug, description, images, active)
VALUES (
  'Example Product',
  'example-product',
  'Product description',
  ARRAY['https://example.com/image.jpg'],
  true
);

-- Insert a variant
INSERT INTO product_variants (product_id, name, price, stock, images)
VALUES (
  'product-uuid',
  'Default',
  1999, -- price in cents ($19.99)
  100,
  ARRAY['https://example.com/variant-image.jpg']
);
```

Or use the Supabase dashboard to insert products via the UI.

## Stripe Webhook Setup

For local development, use Stripe CLI to forward webhooks:

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

This will give you a webhook signing secret to use in your `.env` file.

## Production Deployment

1. Deploy to Vercel, Netlify, or your preferred platform
2. Set environment variables in your hosting dashboard
3. Update `NEXT_PUBLIC_ROOT_URL` to your production URL
4. Update Stripe webhook endpoint to your production URL
5. Run the Supabase migration in production (if using a separate database)

## Features

- ✅ Product browsing and search
- ✅ Shopping cart with persistent storage
- ✅ Stripe Checkout integration
- ✅ Order processing via webhooks
- ✅ Responsive design
- ✅ Server-side rendering
- ✅ Type-safe with TypeScript

## License

MIT
