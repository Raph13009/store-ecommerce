import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { createServerClient } from "@/lib/supabase/server";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	await connection();
	const baseUrl = process.env.NEXT_PUBLIC_ROOT_URL || "https://atelierlola.fr";

	// Pages statiques
	const staticPages: MetadataRoute.Sitemap = [
		{
			url: baseUrl,
			lastModified: new Date(),
			changeFrequency: "daily",
			priority: 1,
		},
		{
			url: `${baseUrl}/products`,
			lastModified: new Date(),
			changeFrequency: "daily",
			priority: 0.9,
		},
		{
			url: `${baseUrl}/returns`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.5,
		},
		{
			url: `${baseUrl}/about`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.5,
		},
	];

	// Récupérer tous les produits actifs pour les pages dynamiques
	// Utiliser le client serveur pour éviter les problèmes de prerendering
	const supabaseClient = await createServerClient();
	const { data: products, error } = await supabaseClient
		.from("products")
		.select("slug, updated_at")
		.eq("active", true)
		.order("created_at", { ascending: false });

	if (error) {
		console.error("Error fetching products for sitemap:", error);
		return staticPages;
	}

	const productPages: MetadataRoute.Sitemap = (products ?? []).map((product) => ({
		url: `${baseUrl}/product/${product.slug}`,
		lastModified: product.updated_at ? new Date(product.updated_at) : new Date(),
		changeFrequency: "weekly",
		priority: 0.8,
	}));

	return [...staticPages, ...productPages];
}
