import { supabase } from "@/lib/supabase/client";
import type { Review } from "@/lib/supabase/types";

export async function getReviews(productId: string): Promise<Review[]> {
	// Use client-side Supabase for public review queries (no cookies needed)
	const supabaseClient = supabase;

	console.log("[getReviews] Fetching reviews for productId:", productId);

	// Explicitly set a high limit to ensure we get all reviews
	// Supabase default limit is 1000, but we'll set it explicitly
	const { data, error } = await supabaseClient
		.from("reviews")
		.select("*")
		.eq("product_id", productId)
		.order("created_at", { ascending: false })
		.limit(1000); // Explicit limit to get all reviews

	if (error) {
		console.error("[getReviews] Error fetching reviews:", error);
		console.error("[getReviews] Error details:", JSON.stringify(error, null, 2));
		return [];
	}

	console.log("[getReviews] Successfully fetched reviews:", data?.length ?? 0, "reviews");
	if (data && data.length > 0) {
		console.log("[getReviews] All reviews:", JSON.stringify(data, null, 2));
		console.log("[getReviews] First review sample:", data[0]);
		console.log("[getReviews] Last review sample:", data[data.length - 1]);
	}

	return (data ?? []) as Review[];
}

