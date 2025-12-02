# Product Reviews System

This document describes the product reviews system that has been added to the e-commerce application.

## Overview

The reviews system allows customers to view and submit reviews for products. Reviews are displayed on each product page above the "Pensé pour durer" section.

## Database Schema

### Reviews Table

The `reviews` table has been created with the following structure:

- `id` (UUID, primary key) - Unique identifier for each review
- `product_id` (UUID, foreign key) - References the `products` table
- `author_name` (TEXT) - Name of the review author
- `content` (TEXT) - The review text content
- `author_image` (TEXT, optional) - URL to author's avatar image
- `stars` (INTEGER) - Rating from 0 to 5
- `created_at` (TIMESTAMPTZ) - Timestamp when review was created
- `updated_at` (TIMESTAMPTZ) - Timestamp when review was last updated

### Migration

To apply the database migration:

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Run the SQL from `supabase/reviews-migration.sql`

The migration includes:
- Table creation with proper constraints
- Indexes for performance (`product_id`, `created_at`)
- Row Level Security (RLS) policies for public read/write access
- Auto-updating `updated_at` trigger

## API Endpoints

### GET /api/reviews?product_id={productId}

Fetches all reviews for a specific product.

**Query Parameters:**
- `product_id` (required) - UUID of the product

**Response:**
```json
[
  {
    "id": "uuid",
    "product_id": "uuid",
    "author_name": "John Doe",
    "content": "Great product!",
    "author_image": "https://example.com/avatar.jpg",
    "stars": 5,
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-01T00:00:00Z"
  }
]
```

### POST /api/reviews

Creates a new review.

**Request Body:**
```json
{
  "product_id": "uuid",
  "author_name": "John Doe",
  "content": "Great product!",
  "author_image": "https://example.com/avatar.jpg", // optional
  "stars": 5 // 0-5
}
```

**Response:**
```json
{
  "id": "uuid",
  "product_id": "uuid",
  "author_name": "John Doe",
  "content": "Great product!",
  "author_image": "https://example.com/avatar.jpg",
  "stars": 5,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-01T00:00:00Z"
}
```

## Frontend Components

### ProductReviews Component

Location: `app/product/[slug]/product-reviews.tsx`

This server component:
- Fetches reviews for a product using Supabase
- Displays reviews in a clean, minimalist UI matching the LOLA brand style
- Shows author avatar (or initial if no image), name, star rating, date, and review content
- Only renders if there are reviews to display

**Features:**
- Responsive design
- Subtle shadows and borders
- Hover effects
- Star rating visualization
- Date formatting in French locale

### Integration

The `ProductReviews` component has been integrated into the product page (`app/product/[slug]/page.tsx`) and appears above the "Pensé pour durer" section.

## Usage Examples

### Adding a Review via API

```typescript
const response = await fetch('/api/reviews', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    product_id: 'product-uuid',
    author_name: 'Jane Doe',
    content: 'Beautiful jewelry, very satisfied!',
    stars: 5,
  }),
});

const review = await response.json();
```

### Fetching Reviews

Reviews are automatically fetched and displayed on product pages. To fetch programmatically:

```typescript
const response = await fetch(`/api/reviews?product_id=${productId}`);
const reviews = await response.json();
```

## Styling

The reviews component uses:
- Tailwind CSS classes matching the existing design system
- Card component styling with subtle borders and shadows
- Muted colors for secondary text
- Responsive spacing and typography
- Consistent with the minimalist LOLA brand aesthetic

## Security

- Row Level Security (RLS) is enabled on the `reviews` table
- Public read access is allowed (anyone can view reviews)
- Public write access is allowed (anyone can create reviews)
- For production, consider adding:
  - Rate limiting on review creation
  - Spam detection
  - Moderation workflow
  - User authentication requirements

## Future Enhancements

Potential improvements:
- Review moderation/admin panel
- Review helpfulness voting
- Photo attachments
- Review replies/threading
- Average rating calculation and display
- Review filtering and sorting

