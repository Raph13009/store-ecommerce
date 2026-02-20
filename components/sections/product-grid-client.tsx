"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { formatPriceRangeWithOriginal, formatPriceWithOriginal } from "@/lib/price-display";
import { isProductSoldOut } from "@/lib/products";
import type { Product, ProductVariant } from "@/lib/supabase/types";

type ProductWithVariants = Product & { variants: ProductVariant[] };

type ProductGridClientProps = {
	products: ProductWithVariants[];
};

export function ProductGridClient({ products: initialProducts }: ProductGridClientProps) {
	const router = useRouter();
	const [products, setProducts] = useState(initialProducts);

	useEffect(() => {
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
			{products.map((product, index) => {
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
				const productHref = `/product/${product.slug}`;

				const productCard = (
					<div
						className={`transition-transform duration-300 ${isSoldOut ? "opacity-60" : "group hover:scale-[1.01]"}`}
					>
						<div className="relative aspect-square bg-secondary rounded-2xl overflow-hidden mb-4">
							{primaryImage && (
								<Image
									src={primaryImage}
									alt={product.name}
									fill
									sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
									quality={60}
									className={`object-cover transition-all duration-500 ${
										isSoldOut ? "" : "group-hover:brightness-110"
									}`}
									loading={index < 2 ? undefined : "lazy"}
									priority={index < 2}
								/>
							)}
							{secondaryImage && !isSoldOut && (
								<Image
									src={secondaryImage}
									alt={`${product.name} - vue alternative`}
									fill
									sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
									quality={45}
									className="object-cover opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:brightness-110 absolute inset-0"
									loading="lazy"
								/>
							)}
							{!isSoldOut && (
								<div className="absolute top-3 left-3 z-10">
									<div className="bg-[#dc2626]/90 backdrop-blur-sm rounded-sm px-2.5 py-1 border border-[#dc2626]/30">
										<span className="text-[10px] sm:text-xs font-medium text-white tracking-wide">
											Prix réduit
										</span>
									</div>
								</div>
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
							<p className="text-xs text-muted-foreground font-light">Dorure 18K sur acier 316L</p>
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
					<Link
						key={product.id}
						href={productHref}
						onMouseEnter={() => {
							router.prefetch(productHref);
						}}
					>
						{productCard}
					</Link>
				);
			})}
		</div>
	);
}
