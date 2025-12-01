# Adding Products to Your Store

## Image Storage Options

### Option 1: Supabase Storage (Recommended for Production)

**Pros:**
- Scalable and fast CDN
- Automatic image optimization
- No need to commit large files to git
- Works great with Next.js Image component

**Setup:**
1. Go to your Supabase project → Storage
2. Create a bucket named `products` (make it public)
3. Upload images to the bucket
4. Use the public URL in your product data

**Image URL format:**
```
https://[your-project].supabase.co/storage/v1/object/public/products/image-name.jpg
```

### Option 2: `/public` Folder (Good for Development)

**Pros:**
- Simple and fast for local development
- No additional setup needed
- Images are bundled with your app

**Cons:**
- Increases bundle size
- Not ideal for many/large images
- Images are committed to git

**Setup:**
1. Place images in `/public/products/` folder
2. Use relative paths: `/products/image-name.jpg`

## Adding Products

### Method 1: Via Supabase Dashboard (Easiest)

1. Go to your Supabase project → Table Editor
2. Click on `products` table
3. Click "Insert row"
4. Fill in the fields:
   - `name`: Product name
   - `slug`: URL-friendly name (e.g., "cotton-t-shirt")
   - `description`: Full description (optional)
   - `summary`: Short description for listings
   - `images`: Array of image URLs (click "Add item" for each)
   - `active`: `true` to show the product
5. Save the product
6. Then add variants in `product_variants` table:
   - `product_id`: The ID of the product you just created
   - `name`: Variant name (e.g., "Small", "Blue", "Default")
   - `price`: Price in cents (e.g., 1999 = $19.99)
   - `stock`: Available quantity
   - `sku`: Stock keeping unit (optional)
   - `images`: Array of variant-specific images (optional)
   - `attributes`: JSON object (e.g., `{"Size": "M", "Color": "Blue"}`)

### Method 2: Via SQL (Bulk Import)

Run this in Supabase SQL Editor:

```sql
-- Insert a product
INSERT INTO products (name, slug, description, summary, images, active)
VALUES (
  'Cotton T-Shirt',
  'cotton-t-shirt',
  'A comfortable and stylish cotton t-shirt perfect for everyday wear.',
  'Premium cotton blend, comfortable fit',
  ARRAY[
    'https://your-project.supabase.co/storage/v1/object/public/products/tshirt-1.jpg',
    'https://your-project.supabase.co/storage/v1/object/public/products/tshirt-2.jpg'
  ],
  true
)
RETURNING id;

-- Then insert variants (use the product ID from above)
INSERT INTO product_variants (product_id, name, price, stock, sku, images, attributes)
VALUES
  (
    'product-uuid-here', -- Replace with actual product ID
    'Small',
    1999, -- $19.99
    50,
    'TSHIRT-S',
    ARRAY['https://your-project.supabase.co/storage/v1/object/public/products/tshirt-small.jpg'],
    '{"Size": "S"}'::jsonb
  ),
  (
    'product-uuid-here',
    'Medium',
    1999,
    50,
    'TSHIRT-M',
    ARRAY['https://your-project.supabase.co/storage/v1/object/public/products/tshirt-medium.jpg'],
    '{"Size": "M"}'::jsonb
  ),
  (
    'product-uuid-here',
    'Large',
    1999,
    50,
    'TSHIRT-L',
    ARRAY['https://your-project.supabase.co/storage/v1/object/public/products/tshirt-large.jpg'],
    '{"Size": "L"}'::jsonb
  );
```

### Method 3: Using a Script (Coming Soon)

We can create a Node.js/Bun script to add products programmatically.

## Image Requirements

- **Format**: JPG, PNG, or WebP
- **Recommended size**: 1200x1200px for product images
- **File size**: Keep under 2MB per image
- **Naming**: Use descriptive names (e.g., `product-name-variant.jpg`)

## Example Product Structure

```json
{
  "name": "Premium Coffee Beans",
  "slug": "premium-coffee-beans",
  "description": "Single-origin coffee beans from Ethiopia, roasted to perfection.",
  "summary": "Ethiopian single-origin, medium roast",
  "images": [
    "https://your-project.supabase.co/storage/v1/object/public/products/coffee-1.jpg",
    "https://your-project.supabase.co/storage/v1/object/public/products/coffee-2.jpg"
  ],
  "variants": [
    {
      "name": "250g Bag",
      "price": 2499, // $24.99
      "stock": 100,
      "sku": "COFFEE-250G",
      "images": [],
      "attributes": {"Weight": "250g"}
    },
    {
      "name": "500g Bag",
      "price": 4499, // $44.99
      "stock": 50,
      "sku": "COFFEE-500G",
      "images": [],
      "attributes": {"Weight": "500g"}
    }
  ]
}
```

## Tips

1. **Slugs**: Must be unique and URL-friendly (lowercase, hyphens, no spaces)
2. **Prices**: Always in cents (1999 = $19.99)
3. **Images**: First image in array is the primary/featured image
4. **Active**: Set to `false` to hide products without deleting them
5. **Stock**: Set to 0 to mark as out of stock

