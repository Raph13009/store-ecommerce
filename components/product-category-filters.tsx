"use client";

import { useEffect, useMemo, useState } from "react";
import { CATEGORIES, getProductCategory, type ProductCategory } from "@/lib/product-categories";
import type { Product, ProductVariant } from "@/lib/supabase/types";

type ProductWithVariants = Product & { variants: ProductVariant[] };

type ProductCategoryFiltersProps = {
	products: ProductWithVariants[];
	onFilterChange: (filteredProducts: ProductWithVariants[]) => void;
};

export function ProductCategoryFilters({ products, onFilterChange }: ProductCategoryFiltersProps) {
	const [selectedCategory, setSelectedCategory] = useState<ProductCategory>(null);

	const filteredProducts = useMemo(() => {
		if (!selectedCategory) {
			return products;
		}

		return products.filter((product) => {
			const category = getProductCategory(product.name);
			return category === selectedCategory;
		});
	}, [products, selectedCategory]);

	// Update parent when filtered products change
	useEffect(() => {
		onFilterChange(filteredProducts);
	}, [filteredProducts, onFilterChange]);

	const handleCategoryClick = (category: ProductCategory) => {
		setSelectedCategory(category === selectedCategory ? null : category);
	};

	// Get available categories from products
	const availableCategories = useMemo(() => {
		const categories = new Set<ProductCategory>();
		products.forEach((product) => {
			const category = getProductCategory(product.name);
			if (category) {
				categories.add(category);
			}
		});
		return Array.from(categories).sort();
	}, [products]);

	if (availableCategories.length === 0) {
		return null;
	}

	return (
		<div className="mb-8">
			<div className="flex items-center gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible sm:flex-wrap">
				<button
					onClick={() => handleCategoryClick(null)}
					className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
						selectedCategory === null
							? "bg-foreground text-primary-foreground"
							: "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
					}`}
				>
					Tous
				</button>
				{availableCategories.map((category) => (
					<button
						key={category}
						onClick={() => handleCategoryClick(category)}
						className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
							selectedCategory === category
								? "bg-foreground text-primary-foreground"
								: "bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80"
						}`}
					>
						{category}
					</button>
				))}
			</div>
		</div>
	);
}
