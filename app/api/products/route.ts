import { NextResponse } from "next/server";
import { getProducts } from "@/lib/products";

export async function GET() {
	try {
		const products = await getProducts({ active: true, limit: 100 });
		return NextResponse.json(products, {
			headers: {
				"Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
			},
		});
	} catch (error) {
		console.error("Error fetching products:", error);
		return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 });
	}
}
