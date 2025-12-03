import { ArrowRight } from "lucide-react";
import { cacheLife } from "next/cache";
import Image from "next/image";
import Link from "next/link";
import { formatPriceRangeWithOriginal, formatPriceWithOriginal } from "@/lib/price-display";
import { getProducts, isProductSoldOut } from "@/lib/products";
import type { Product, ProductVariant } from "@/lib/supabase/types";

type ProductWithVariants = Product & { variants: ProductVariant[] };

type ProductGridProps = {
	title?: string;
	description?: string;
	products?: ProductWithVariants[];
	limit?: number;
	showViewAll?: boolean;
	viewAllHref?: string;
};

export async function ProductGrid({
	title = "Produits vedettes",
	description = "Sélection de nos favoris",
	products,
	limit = 6,
	showViewAll = true,
	viewAllHref = "/products",
}: ProductGridProps) {
	"use cache";
	cacheLife("seconds");

	const displayProducts = products ?? (await getProducts({ active: true, limit }));

	return (
		<section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
			<div className="flex items-end justify-between mb-12">
				<div>
					<h2 className="text-2xl sm:text-3xl font-medium text-foreground">{title}</h2>
					<p className="mt-2 text-muted-foreground">{description}</p>
				</div>
				{showViewAll && (
					<Link
						href={viewAllHref}
						className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
					>
						Tout voir
						<ArrowRight className="h-4 w-4" />
					</Link>
				)}
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
				{displayProducts.map((product) => {
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
									/>
								)}
								{secondaryImage && !isSoldOut && (
									<Image
										src={secondaryImage}
										alt={`${product.name} - vue alternative`}
										fill
										sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
										className="object-cover opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:brightness-110 absolute inset-0"
									/>
								)}
								{!isSoldOut && (
									<div className="absolute top-3 left-3 z-10">
										<div className="bg-gradient-to-r from-[#2c2c2c]/95 to-[#1a1a1a]/95 backdrop-blur-sm border border-[#3a3a3a]/50 rounded-full px-3 py-1.5 shadow-lg">
											<span className="text-[10px] sm:text-xs font-semibold text-white tracking-wider uppercase">
												Liquidation
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

			{showViewAll && (
				<div className="mt-12 text-center sm:hidden">
					<Link
						href={viewAllHref}
						className="inline-flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
					>
						Voir tous les produits
						<ArrowRight className="h-4 w-4" />
					</Link>
				</div>
			)}
		</section>
	);
}
