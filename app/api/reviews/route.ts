import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import type { Review } from "@/lib/supabase/types";

// GET /api/reviews?product_id=xxx
export async function GET(request: NextRequest) {
	try {
		const searchParams = request.nextUrl.searchParams;
		const productId = searchParams.get("product_id");

		if (!productId) {
			return NextResponse.json({ error: "product_id is required" }, { status: 400 });
		}

		const supabase = await createServerClient();

		const { data, error } = await supabase
			.from("reviews")
			.select("*")
			.eq("product_id", productId)
			.order("created_at", { ascending: false });

		if (error) {
			console.error("Error fetching reviews:", error);
			return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
		}

		return NextResponse.json(data as Review[], {
			headers: {
				"Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
			},
		});
	} catch (error) {
		console.error("Error in GET /api/reviews:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

// POST /api/reviews
export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { product_id, author_name, content, author_image, stars } = body;

		// Validation
		if (!product_id || !author_name || !content || stars === undefined) {
			return NextResponse.json(
				{ error: "Missing required fields: product_id, author_name, content, stars" },
				{ status: 400 },
			);
		}

		if (typeof stars !== "number" || stars < 0 || stars > 5) {
			return NextResponse.json({ error: "stars must be a number between 0 and 5" }, { status: 400 });
		}

		const supabase = await createServerClient();

		const { data, error } = await supabase
			.from("reviews")
			.insert({
				product_id,
				author_name,
				content,
				author_image: author_image || null,
				stars,
			})
			.select()
			.single();

		if (error) {
			console.error("Error creating review:", error);
			return NextResponse.json({ error: "Failed to create review" }, { status: 500 });
		}

		return NextResponse.json(data as Review, { status: 201 });
	} catch (error) {
		console.error("Error in POST /api/reviews:", error);
		return NextResponse.json({ error: "Internal server error" }, { status: 500 });
	}
}

