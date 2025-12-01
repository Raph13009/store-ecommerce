# Migration Summary: YNS → Supabase + Stripe

This document summarizes all changes made to remove YNS and replace it with Supabase and Stripe.

## What Was Removed

### Files Deleted
- `lib/commerce.ts` - YNS Commerce Kit client
- `app/collection/[slug]/page.tsx` - Collection pages (YNS-specific)

### Dependencies Removed
- `commerce-kit` - YNS Commerce Kit SDK

### Environment Variables Removed
- `YNS_API_KEY`
- `YNS_API_TENANT`
- `NEXT_PUBLIC_YNS_API_TENANT`
- `ENABLE_EXPERIMENTAL_COREPACK`

## What Was Added

### New Dependencies
- `@supabase/supabase-js` - Supabase client library
- `stripe` - Stripe SDK for payments

### New Files Created

#### Supabase Integration
- `lib/supabase/client.ts` - Client-side Supabase client
- `lib/supabase/server.ts` - Server-side Supabase client with cookie handling
- `lib/supabase/types.ts` - TypeScript types for database entities

#### Stripe Integration
- `lib/stripe/client.ts` - Stripe client initialization

#### Product & Cart Logic
- `lib/products.ts` - Product queries (replaces YNS product browsing)
- `lib/cart.ts` - Cart operations using Supabase (replaces YNS cart API)

#### API Routes
- `app/api/stripe/checkout/route.ts` - Creates Stripe Checkout sessions
- `app/api/stripe/webhook/route.ts` - Handles Stripe webhooks for order processing

#### Pages
- `app/products/page.tsx` - Products listing page (replaces collections)
- `app/checkout/success/page.tsx` - Checkout success page

#### Database
- `supabase/migrations.sql` - Complete database schema with:
  - `products` table
  - `product_variants` table
  - `carts` table
  - `cart_items` table
  - `orders` table
  - `order_items` table
  - Indexes, RLS policies, and triggers

## Files Modified

### Core Application Files

1. **`app/layout.tsx`**
   - Removed `commerce` import
   - Updated `getInitialCart()` to use new `getCart()` from `lib/cart.ts`
   - Added cart transformation to match context type

2. **`app/cart/actions.ts`**
   - Completely rewritten to re-export functions from `lib/cart.ts`
   - Now uses Supabase instead of YNS API

3. **`app/cart/cart-sidebar.tsx`**
   - Removed YNS checkout URL
   - Added Stripe checkout handler that calls `/api/stripe/checkout`

4. **`app/cart/cart-context.tsx`**
   - Updated `CartLineItem` type to match new structure
   - Price changed from `string` to `number` (in cents)

5. **`app/navbar.tsx`**
   - Removed collection fetching
   - Simplified to static navigation links

6. **`app/footer.tsx`**
   - Removed collection fetching
   - Simplified to static links

7. **`app/product/[slug]/page.tsx`**
   - Replaced `commerce.productGet()` with `getProductBySlug()`
   - Updated variant mapping to new structure

8. **`app/product/[slug]/add-to-cart-button.tsx`**
   - Updated variant type structure
   - Simplified variant selection (removed complex combination logic)
   - Updated to work with new cart structure

9. **`components/sections/product-grid.tsx`**
   - Replaced `commerce.productBrowse()` with `getProducts()`
   - Updated types to use Supabase types
   - Removed `APIProductsBrowseResult` type dependency

10. **`package.json`**
    - Removed `commerce-kit`
    - Added `@supabase/supabase-js` and `stripe`

11. **`.env`**
    - Removed all YNS variables
    - Added Supabase and Stripe configuration

## Architecture Changes

### Before (YNS)
```
Next.js → YNS API → Products, Carts, Orders
```

### After (Supabase + Stripe)
```
Next.js → Supabase → Products, Carts, Orders
Next.js → Stripe → Checkout & Payment Processing
```

## Key Differences

### Product Data
- **Before**: Fetched from YNS API via Commerce Kit
- **After**: Stored in Supabase PostgreSQL, fetched via Supabase client

### Cart Management
- **Before**: Managed by YNS API, cart ID stored in cookie
- **After**: Managed in Supabase `carts` and `cart_items` tables, cart ID stored in cookie

### Checkout
- **Before**: Redirected to YNS-hosted checkout page
- **After**: Uses Stripe Checkout Sessions, redirects to Stripe-hosted checkout

### Order Processing
- **Before**: Handled by YNS
- **After**: Handled by Stripe webhooks, orders stored in Supabase

## Database Schema

The migration includes a complete database schema with:

- **Products**: Name, slug, description, images, active status
- **Product Variants**: Price (in cents), stock, SKU, attributes (JSONB)
- **Carts**: User association (optional for guest carts)
- **Cart Items**: Quantity, variant reference
- **Orders**: Total, status, Stripe payment intent ID, addresses
- **Order Items**: Snapshot of product/variant at purchase time

All tables include:
- Proper indexes for performance
- Row Level Security (RLS) policies
- Auto-updating `updated_at` timestamps

## Environment Variables

### Required
```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Application
NEXT_PUBLIC_ROOT_URL=http://localhost:3000
```

## Next Steps

1. **Set up Supabase**:
   - Create project at supabase.com
   - Run `supabase/migrations.sql` in SQL Editor
   - Copy URL and anon key

2. **Set up Stripe**:
   - Create account at stripe.com
   - Get API keys from dashboard
   - Set up webhook endpoint

3. **Install dependencies**:
   ```bash
   bun install
   ```

4. **Configure environment**:
   - Copy `.env` and fill in values

5. **Add products**:
   - Insert products via Supabase dashboard or SQL

6. **Test checkout**:
   - Use Stripe test mode for development
   - Set up webhook forwarding with Stripe CLI

## Notes

- All prices are stored in **cents** (integer) in the database
- The `formatMoney` utility handles conversion to display format
- Cart persistence uses HTTP-only cookies (30-day expiration)
- Orders are created when Stripe webhook confirms payment
- Product images should be hosted externally or in `/public` folder

