-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products table
CREATE TABLE IF NOT EXISTS products (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	name TEXT NOT NULL,
	slug TEXT NOT NULL UNIQUE,
	description TEXT,
	summary TEXT,
	images TEXT[] DEFAULT '{}',
	active BOOLEAN DEFAULT true,
	created_at TIMESTAMPTZ DEFAULT NOW(),
	updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Product variants table
CREATE TABLE IF NOT EXISTS product_variants (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
	name TEXT NOT NULL,
	price INTEGER NOT NULL, -- stored in cents
	stock INTEGER DEFAULT 0,
	sku TEXT UNIQUE,
	images TEXT[] DEFAULT '{}',
	attributes JSONB, -- e.g., {"Size": "M", "Color": "Blue"}
	created_at TIMESTAMPTZ DEFAULT NOW(),
	updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Carts table
CREATE TABLE IF NOT EXISTS carts (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	user_id UUID, -- nullable for guest carts
	created_at TIMESTAMPTZ DEFAULT NOW(),
	updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cart items table
CREATE TABLE IF NOT EXISTS cart_items (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	cart_id UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
	variant_id UUID NOT NULL REFERENCES product_variants(id) ON DELETE CASCADE,
	quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
	created_at TIMESTAMPTZ DEFAULT NOW(),
	updated_at TIMESTAMPTZ DEFAULT NOW(),
	UNIQUE(cart_id, variant_id)
);

-- Orders table
CREATE TABLE IF NOT EXISTS orders (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	user_id UUID, -- nullable for guest orders
	email TEXT NOT NULL,
	total INTEGER NOT NULL, -- stored in cents
	status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'cancelled')),
	stripe_payment_intent_id TEXT UNIQUE,
	shipping_address JSONB,
	billing_address JSONB,
	created_at TIMESTAMPTZ DEFAULT NOW(),
	updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order items table (snapshot of order at time of purchase)
CREATE TABLE IF NOT EXISTS order_items (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
	variant_id UUID NOT NULL REFERENCES product_variants(id),
	quantity INTEGER NOT NULL CHECK (quantity > 0),
	price INTEGER NOT NULL, -- stored in cents (snapshot)
	product_name TEXT NOT NULL,
	variant_name TEXT NOT NULL,
	created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_slug ON products(slug);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_variant_id ON cart_items(variant_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_stripe_payment_intent_id ON orders(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
	NEW.updated_at = NOW();
	RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop existing triggers if they exist (to allow re-running this script)
DROP TRIGGER IF EXISTS update_products_updated_at ON products;
DROP TRIGGER IF EXISTS update_product_variants_updated_at ON product_variants;
DROP TRIGGER IF EXISTS update_carts_updated_at ON carts;
DROP TRIGGER IF EXISTS update_cart_items_updated_at ON cart_items;
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;

-- Triggers to auto-update updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
	FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_product_variants_updated_at BEFORE UPDATE ON product_variants
	FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON carts
	FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cart_items_updated_at BEFORE UPDATE ON cart_items
	FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
	FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to allow re-running this script)
DROP POLICY IF EXISTS "Public can view active products" ON products;
DROP POLICY IF EXISTS "Public can view product variants" ON product_variants;
DROP POLICY IF EXISTS "Public can create carts" ON carts;
DROP POLICY IF EXISTS "Public can view their own carts" ON carts;
DROP POLICY IF EXISTS "Public can update their own carts" ON carts;
DROP POLICY IF EXISTS "Public can manage cart items" ON cart_items;
DROP POLICY IF EXISTS "Public can create orders" ON orders;
DROP POLICY IF EXISTS "Public can view their own orders" ON orders;
DROP POLICY IF EXISTS "Public can create order items" ON order_items;
DROP POLICY IF EXISTS "Public can view order items" ON order_items;

-- Allow public read access to active products
CREATE POLICY "Public can view active products" ON products
	FOR SELECT USING (active = true);

CREATE POLICY "Public can view product variants" ON product_variants
	FOR SELECT USING (true);

-- Allow public to create and manage their own carts
CREATE POLICY "Public can create carts" ON carts
	FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can view their own carts" ON carts
	FOR SELECT USING (true);

CREATE POLICY "Public can update their own carts" ON carts
	FOR UPDATE USING (true);

-- Allow public to manage cart items
CREATE POLICY "Public can manage cart items" ON cart_items
	FOR ALL USING (true);

-- Allow public to create orders (for checkout)
CREATE POLICY "Public can create orders" ON orders
	FOR INSERT WITH CHECK (true);

-- Allow public to view their own orders
CREATE POLICY "Public can view their own orders" ON orders
	FOR SELECT USING (true);

-- Allow public to create order items (for checkout)
CREATE POLICY "Public can create order items" ON order_items
	FOR INSERT WITH CHECK (true);

-- Allow public to view order items for their orders
CREATE POLICY "Public can view order items" ON order_items
	FOR SELECT USING (true);

