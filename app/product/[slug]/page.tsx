import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AddToCartButton } from "@/app/product/[slug]/add-to-cart-button";
import { ImageGallery } from "@/app/product/[slug]/image-gallery";
import { ProductFeatures } from "@/app/product/[slug]/product-features";
import { ProductReviews } from "@/app/product/[slug]/product-reviews";
import { formatPriceRangeWithOriginal, formatPriceWithOriginal } from "@/lib/price-display";
import { getProductBySlug } from "@/lib/products";

export default async function ProductPage(props: { params: Promise<{ slug: string }> }) {
	return (
		<Suspense>
			<ProductDetails params={props.params} />
		</Suspense>
	);
}

const ProductDetails = async ({ params }: { params: Promise<{ slug: string }> }) => {
	"use cache";
	const { slug } = await params;
	const product = await getProductBySlug(slug);

	if (!product) {
		notFound();
	}

	const prices = product.variants.map((v) => BigInt(v.price));
	const minPrice = prices.length > 0 ? prices.reduce((a, b) => (a < b ? a : b)) : BigInt(0);
	const maxPrice = prices.length > 0 ? prices.reduce((a, b) => (a > b ? a : b)) : BigInt(0);

	const priceDisplay =
		prices.length > 1 && minPrice !== maxPrice
			? formatPriceRangeWithOriginal(minPrice, maxPrice)
			: formatPriceWithOriginal(minPrice);

	const allImages = [
		...(product.images ?? []),
		...product.variants.flatMap((v) => v.images ?? []).filter((img) => !(product.images ?? []).includes(img)),
	];

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
			<div className="lg:grid lg:grid-cols-2 lg:gap-16">
				{/* Left: Image Gallery (sticky on desktop) */}
				<ImageGallery images={allImages} productName={product.name} />

				{/* Right: Product Details */}
				<div className="mt-8 lg:mt-0">
					{/* Title */}
					<h1 className="text-4xl font-medium tracking-tight text-foreground lg:text-5xl text-balance mb-3">
						{product.name}
					</h1>

					{/* Premium Trust Line */}
					<p className="text-sm font-medium mb-4" style={{ color: "#6B6B6B" }}>
						Acier 316L doré à l'or fin 18K • Waterproof • Hypoallergénique
					</p>

					{/* Price */}
					<div className="mb-6">{priceDisplay}</div>

					{/* Description */}
					{product.summary && <p className="text-muted-foreground leading-relaxed mb-6">{product.summary}</p>}

					{/* Variant Selector, Quantity, Add to Cart, Trust Badges */}
					<div className="mt-8">
						<AddToCartButton
							variants={product.variants.map((v) => ({
								id: v.id,
								price: v.price.toString(),
								images: v.images,
								name: v.name,
								stock: v.stock,
								attributes: v.attributes,
							}))}
							product={{
								id: product.id,
								name: product.name,
								slug: product.slug,
								images: product.images ?? [],
							}}
						/>
					</div>
				</div>
			</div>

			{/* Reviews Section (full width below) */}
			<ProductReviews productId={product.id} />

			{/* Features Section (full width below) */}
			<ProductFeatures />
		</div>
	);
};
