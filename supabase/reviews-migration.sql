-- Reviews table
CREATE TABLE IF NOT EXISTS reviews (
	id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
	product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
	author_name TEXT NOT NULL,
	content TEXT NOT NULL,
	author_image TEXT,
	stars INTEGER NOT NULL CHECK (stars >= 0 AND stars <= 5),
	created_at TIMESTAMPTZ DEFAULT NOW(),
	updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for performance
CREATE INDEX IF NOT EXISTS idx_reviews_product_id ON reviews(product_id);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- Trigger to auto-update updated_at
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
	FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to allow re-running this script)
DROP POLICY IF EXISTS "Public can view reviews" ON reviews;
DROP POLICY IF EXISTS "Public can create reviews" ON reviews;

-- Allow public read access to reviews
CREATE POLICY "Public can view reviews" ON reviews
	FOR SELECT USING (true);

-- Allow public to create reviews
CREATE POLICY "Public can create reviews" ON reviews
	FOR INSERT WITH CHECK (true);

