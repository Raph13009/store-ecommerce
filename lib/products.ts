import { supabase } from "@/lib/supabase/client";
import type { Product, ProductVariant } from "@/lib/supabase/types";

export async function getProducts(options?: {
	limit?: number;
	offset?: number;
	active?: boolean;
	search?: string;
}) {
	// Use client-side Supabase for public product queries (no cookies needed)
	const supabaseClient = supabase;

	let query = supabaseClient.from("products").select(`
		*,
		variants:product_variants(*)
	`);

	if (options?.active !== undefined) {
		query = query.eq("active", options.active);
	}

	if (options?.search) {
		query = query.ilike("name", `%${options.search}%`);
	}

	if (options?.limit) {
		query = query.limit(options.limit);
	}

	if (options?.offset) {
		query = query.range(options.offset, options.offset + (options.limit ?? 10) - 1);
	}

	query = query.order("created_at", { ascending: false });

	const { data, error } = await query;

	if (error) {
		console.error("Error fetching products:", error);
		return [];
	}

	return (data ?? []) as Array<Product & { variants: ProductVariant[] }>;
}

export async function getProductBySlug(slug: string) {
	// Use client-side Supabase for public product queries (no cookies needed)
	const supabaseClient = supabase;

	const { data, error } = await supabaseClient
		.from("products")
		.select(
			`
		*,
		variants:product_variants(*)
	`,
		)
		.eq("slug", slug)
		.single();

	if (error || !data) {
		return null;
	}

	// Block access to inactive products
	if (!data.active) {
		return null;
	}

	return data as Product & { variants: ProductVariant[] };
}

export async function getProductById(id: string) {
	// Use client-side Supabase for public product queries (no cookies needed)
	const supabaseClient = supabase;

	const { data, error } = await supabaseClient
		.from("products")
		.select(
			`
		*,
		variants:product_variants(*)
	`,
		)
		.eq("id", id)
		.single();

	if (error || !data) {
		return null;
	}

	return data as Product & { variants: ProductVariant[] };
}
