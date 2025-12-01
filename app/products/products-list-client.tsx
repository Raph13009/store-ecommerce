"use client";

import { useEffect, useState } from "react";
import { ProductCategoryFilters } from "@/components/product-category-filters";
import { ProductGridClient } from "@/components/sections/product-grid-client";
import type { Product, ProductVariant } from "@/lib/supabase/types";

type ProductWithVariants = Product & { variants: ProductVariant[] };

export function ProductsListClient() {
	const [allProducts, setAllProducts] = useState<ProductWithVariants[]>([]);
	const [filteredProducts, setFilteredProducts] = useState<ProductWithVariants[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	// Load products from server component
	useEffect(() => {
		async function loadProducts() {
			try {
				const response = await fetch("/api/products");
				if (response.ok) {
					const data = (await response.json()) as ProductWithVariants[];
					setAllProducts(data);
					setFilteredProducts(data);
				}
			} catch (error) {
				console.error("Failed to load products:", error);
			} finally {
				setIsLoading(false);
			}
		}
		loadProducts();
	}, []);

	if (isLoading) {
		return null; // Suspense will handle loading state
	}

	return (
		<>
			<ProductCategoryFilters products={allProducts} onFilterChange={setFilteredProducts} />
			<ProductGridClient products={filteredProducts.length > 0 ? filteredProducts : allProducts} />
		</>
	);
}
