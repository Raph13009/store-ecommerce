export type Product = {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	summary: string | null;
	images: string[];
	active: boolean;
	created_at: string;
	updated_at: string;
};

export type ProductVariant = {
	id: string;
	product_id: string;
	name: string;
	price: number; // stored in cents
	stock: number;
	sku: string | null;
	images: string[];
	attributes: Record<string, string> | null;
	created_at: string;
	updated_at: string;
};

export type Cart = {
	id: string;
	user_id: string | null;
	created_at: string;
	updated_at: string;
};

export type CartItem = {
	id: string;
	cart_id: string;
	variant_id: string;
	quantity: number;
	created_at: string;
	updated_at: string;
};

export type Order = {
	id: string;
	user_id: string | null;
	email: string;
	total: number; // in cents
	status: "pending" | "processing" | "completed" | "cancelled";
	stripe_payment_intent_id: string | null;
	shipping_address: Record<string, unknown> | null;
	billing_address: Record<string, unknown> | null;
	created_at: string;
	updated_at: string;
};

export type OrderItem = {
	id: string;
	order_id: string;
	variant_id: string;
	quantity: number;
	price: number; // in cents (snapshot at time of order)
	product_name: string;
	variant_name: string;
	created_at: string;
};

export type Review = {
	id: string;
	product_id: string;
	author_name: string;
	content: string;
	author_image: string | null;
	stars: number; // 0 to 5
	created_at: string;
	updated_at: string;
};
