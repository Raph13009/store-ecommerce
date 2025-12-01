"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { formatPriceRangeWithOriginal, formatPriceWithOriginal } from "@/lib/price-display";
import { isProductSoldOut } from "@/lib/products";
import type { Product, ProductVariant } from "@/lib/supabase/types";

type ProductWithVariants = Product & { variants: ProductVariant[] };

type ProductGridClientProps = {
	products: ProductWithVariants[];
};

export function ProductGridClient({ products: initialProducts }: ProductGridClientProps) {
	const [products, setProducts] = useState(initialProducts);

	useEffect(() => {
		// Listen for filter changes
		const handleFilter = (event: CustomEvent<ProductWithVariants[]>) => {
			setProducts(event.detail);
		};

		window.addEventListener("productsFiltered", handleFilter as EventListener);

		return () => {
			window.removeEventListener("productsFiltered", handleFilter as EventListener);
		};
	}, []);

	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
			{products.map((product) => {
				const variants = product.variants ?? [];
				const prices = variants.map((v) => BigInt(v.price));
				const minPrice = prices.length > 0 ? prices.reduce((a, b) => (a < b ? a : b)) : BigInt(0);
				const maxPrice = prices.length > 0 ? prices.reduce((a, b) => (a > b ? a : b)) : BigInt(0);

				const priceDisplay =
					prices.length > 1 && minPrice !== maxPrice
						? formatPriceRangeWithOriginal(minPrice, maxPrice)
						: formatPriceWithOriginal(minPrice);

				const allImages = [
					...(product.images ?? []),
					...variants.flatMap((v) => v.images ?? []).filter((img) => !(product.images ?? []).includes(img)),
				];
				const primaryImage = allImages[0];
				const secondaryImage = allImages[1];
				const isSoldOut = isProductSoldOut(variants);

				const productCard = (
					<div className={isSoldOut ? "opacity-60" : "group"}>
						<div className="relative aspect-square bg-secondary rounded-2xl overflow-hidden mb-4">
							{primaryImage && (
								<Image
									src={primaryImage}
									alt={product.name}
									fill
									sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
									className={`object-cover transition-all duration-500 ${
										isSoldOut ? "" : "group-hover:brightness-110"
									}`}
									loading="lazy"
								/>
							)}
							{secondaryImage && !isSoldOut && (
								<Image
									src={secondaryImage}
									alt={`${product.name} - vue alternative`}
									fill
									sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
									className="object-cover opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:brightness-110 absolute inset-0"
									loading="lazy"
								/>
							)}
							{isSoldOut && (
								<div className="absolute inset-0 bg-background/40 flex items-center justify-center">
									<span className="bg-background/90 text-foreground px-4 py-2 rounded-full text-xs font-medium tracking-wide">
										Stock épuisé
									</span>
								</div>
							)}
						</div>
						<div className="space-y-1">
							<h3
								className={`text-base font-medium ${isSoldOut ? "text-muted-foreground" : "text-foreground"}`}
							>
								{product.name}
							</h3>
							<div className={`text-base ${isSoldOut ? "text-muted-foreground" : "text-foreground"}`}>
								{priceDisplay}
							</div>
						</div>
					</div>
				);

				if (isSoldOut) {
					return (
						<div key={product.id} className="cursor-not-allowed">
							{productCard}
						</div>
					);
				}

				return (
					<Link key={product.id} href={`/product/${product.slug}`}>
						{productCard}
					</Link>
				);
			})}
		</div>
	);
}
