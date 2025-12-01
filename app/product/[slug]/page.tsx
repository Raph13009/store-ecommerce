import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AddToCartButton } from "@/app/product/[slug]/add-to-cart-button";
import { ImageGallery } from "@/app/product/[slug]/image-gallery";
import { ProductFeatures } from "@/app/product/[slug]/product-features";
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
			{/* Back button - more visible on mobile */}
			<Link
				href="/products"
				className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 sm:mb-8 group"
			>
				<ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
				<span className="font-medium">Retour aux produits</span>
			</Link>

			<div className="lg:grid lg:grid-cols-2 lg:gap-16">
				{/* Left: Image Gallery (sticky on desktop) */}
				<ImageGallery images={allImages} productName={product.name} />

				{/* Right: Product Details */}
				<div className="mt-8 lg:mt-0 space-y-8">
					{/* Title, Price, Description */}
					<div className="space-y-4">
						<h1 className="text-4xl font-medium tracking-tight text-foreground lg:text-5xl text-balance">
							{product.name}
						</h1>
						<div className="text-2xl tracking-tight">{priceDisplay}</div>
						{product.summary && <p className="text-muted-foreground leading-relaxed">{product.summary}</p>}
					</div>

					{/* Variant Selector, Quantity, Add to Cart, Trust Badges */}
					<AddToCartButton
						variants={product.variants.map((v) => ({
							id: v.id,
							price: v.price.toString(),
							images: v.images,
							name: v.name,
							stock: v.stock,
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

			{/* Features Section (full width below) */}
			<ProductFeatures />
		</div>
	);
};
