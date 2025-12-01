"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { addToCart } from "@/app/cart/actions";
import { useCart } from "@/app/cart/cart-context";
import { QuantitySelector } from "@/app/product/[slug]/quantity-selector";
import { SimpleVariantSelector } from "@/app/product/[slug]/simple-variant-selector";
import { SizeGuide } from "@/app/product/[slug]/size-guide";
import { TrustBadges } from "@/app/product/[slug]/trust-badges";
import { currency, formatMoney, locale } from "@/lib/price-display";

type Variant = {
	id: string;
	price: string;
	images: string[];
	name: string;
	stock: number;
	attributes?: Record<string, string> | null;
};

type AddToCartButtonProps = {
	variants: Variant[];
	product: {
		id: string;
		name: string;
		slug: string;
		images: string[];
	};
};

export function AddToCartButton({ variants, product }: AddToCartButtonProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [quantity, setQuantity] = useState(1);
	const [isPending, startTransition] = useTransition();
	const { openCart, dispatch } = useCart();

	// State for selected variant ID
	const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(
		variants.length > 0 ? variants[0].id : undefined,
	);

	const selectedVariant = useMemo(() => {
		if (variants.length === 0) return undefined;
		if (variants.length === 1) return variants[0];
		// Find variant by selected ID, or fallback to first variant
		return variants.find((v) => v.id === selectedVariantId) ?? variants[0];
	}, [variants, selectedVariantId]);

	const totalPrice = selectedVariant ? BigInt(selectedVariant.price) * BigInt(quantity) : null;

	const buttonText = useMemo(() => {
		if (isPending) return "Ajout en cours...";
		if (!selectedVariant) return "Sélectionner les options";
		if (totalPrice) {
			return `Ajouter au panier — ${formatMoney({ amount: totalPrice, currency, locale })}`;
		}
		return "Ajouter au panier";
	}, [isPending, selectedVariant, totalPrice]);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		if (!selectedVariant) return;

		// Open cart sidebar
		openCart();

		// Execute server action with optimistic update
		startTransition(async () => {
			// Dispatch inside transition for optimistic update
			dispatch({
				type: "ADD_ITEM",
				item: {
					quantity,
					productVariant: {
						id: selectedVariant.id,
						price:
							typeof selectedVariant.price === "number"
								? selectedVariant.price
								: Number.parseInt(String(selectedVariant.price), 10),
						images: selectedVariant.images,
						name: selectedVariant.name,
						product,
					},
				},
			});

			await addToCart(selectedVariant.id, quantity);

			// Refresh to sync cart from server
			router.refresh();

			// Reset quantity after add
			setQuantity(1);
		});
	};

	// Check if product is a ring (bague) or has size variants
	const isRing = product.name.toLowerCase().includes("bague") || product.name.toLowerCase().includes("ring");
	const hasSizeVariants = variants.some((v) => v.attributes?.Size || v.attributes?.Taille);
	const shouldShowSizeGuide = isRing || hasSizeVariants;

	return (
		<div className="space-y-8">
			{/* Variant Selector - only shows if multiple variants exist */}
			{variants.length > 1 && (
				<div className="space-y-3">
					<div className="flex items-start justify-between gap-4">
						<div className="flex-1">
							<SimpleVariantSelector
								variants={variants}
								selectedVariantId={selectedVariantId}
								onVariantSelect={setSelectedVariantId}
							/>
						</div>
						{/* Size Guide - show for rings or products with size variants */}
						{shouldShowSizeGuide && (
							<div className="shrink-0 pt-1">
								<SizeGuide />
							</div>
						)}
					</div>
				</div>
			)}

			<QuantitySelector quantity={quantity} onQuantityChange={setQuantity} disabled={isPending} />

			<form onSubmit={handleSubmit}>
				<button
					type="submit"
					disabled={isPending || !selectedVariant}
					className="w-full h-14 bg-foreground text-primary-foreground py-4 px-8 rounded-full text-base font-medium tracking-wide hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{buttonText}
				</button>
			</form>

			<TrustBadges />
		</div>
	);
}
