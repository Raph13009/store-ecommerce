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
	const { openCart, dispatch, cart } = useCart();

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
			console.log("🛒 [ADD_TO_CART] Starting add to cart process");
			console.log("🛒 [ADD_TO_CART] Current cart before:", cart);
			console.log("🛒 [ADD_TO_CART] Variant ID:", selectedVariant.id);
			console.log("🛒 [ADD_TO_CART] Quantity:", quantity);

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

			console.log("🛒 [ADD_TO_CART] Optimistic update dispatched");

			try {
				const result = await addToCart(selectedVariant.id, quantity);
				console.log("🛒 [ADD_TO_CART] Server response:", result);

				if (result.success) {
					console.log("🛒 [ADD_TO_CART] Success! Cart from server:", result.cart);
					if (result.cart) {
						console.log("🛒 [ADD_TO_CART] Cart has", result.cart.lineItems.length, "items");
						// Sync cart with server response
						dispatch({ type: "SYNC", cart: result.cart });
						console.log("🛒 [ADD_TO_CART] Cart synced with server data");
					} else {
						console.warn("⚠️ [ADD_TO_CART] Success but cart is null!");
					}
				} else {
					console.error("❌ [ADD_TO_CART] Server action failed:", result);
				}

				// Refresh to sync cart from server
				console.log("🛒 [ADD_TO_CART] Refreshing router...");
				router.refresh();
				console.log("🛒 [ADD_TO_CART] Router refreshed");
			} catch (error) {
				console.error("❌ [ADD_TO_CART] Error:", error);
			}

			// Reset quantity after add
			setQuantity(1);
		});
	};

	// Check if product is a ring (bague) or has size variants
	const isRing = product.name.toLowerCase().includes("bague") || product.name.toLowerCase().includes("ring");
	const hasSizeVariants = variants.some((v) => v.attributes?.Size || v.attributes?.Taille);
	const shouldShowSizeGuide = isRing || hasSizeVariants;

	return (
		<div className="space-y-6">
			{/* Urgency Block */}
			<div className="rounded-[10px] px-3 py-2" style={{ background: "#FFF7E8", color: "#8C6B3B" }}>
				<p className="text-sm font-medium">Stock limité : quelques pièces restantes</p>
			</div>

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

			{/* Trust Section */}
			<div className="pt-2">
				<h3 className="text-base font-medium text-foreground mb-3">Pourquoi vous allez l'adorer</h3>
				<ul className="space-y-2">
					<li className="flex items-start gap-2 text-sm text-muted-foreground">
						<span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
						<span>Ne noircit pas, résiste à l'eau</span>
					</li>
					<li className="flex items-start gap-2 text-sm text-muted-foreground">
						<span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
						<span>Dorure 18K durable</span>
					</li>
					<li className="flex items-start gap-2 text-sm text-muted-foreground">
						<span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
						<span>Confortable pour un port quotidien</span>
					</li>
					<li className="flex items-start gap-2 text-sm text-muted-foreground">
						<span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-muted-foreground/40 shrink-0" />
						<span>Design minimal et élégant</span>
					</li>
				</ul>
			</div>

			{/* CTA Block */}
			<div className="pt-6 space-y-2">
				<form onSubmit={handleSubmit}>
					<button
						type="submit"
						disabled={isPending || !selectedVariant}
						className="w-full h-14 bg-foreground text-primary-foreground py-4 px-8 rounded-full text-base font-medium tracking-wide hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{buttonText}
					</button>
				</form>

				{/* Delivery reassurance */}
				{(() => {
					const deliveryDate = new Date();
					deliveryDate.setDate(deliveryDate.getDate() + 9);
					const formattedDate = deliveryDate.toLocaleDateString("fr-FR", {
						day: "numeric",
						month: "long",
					});
					return (
						<div className="flex items-center justify-center gap-2 rounded-lg border border-[#d4af37]/30 bg-[#f5e6d3]/10 px-4 py-2.5 text-sm backdrop-blur-sm">
							<span className="text-muted-foreground">Livraison prévue avant le </span>
							<span className="font-semibold text-[#d4af37]">{formattedDate}</span>
						</div>
					);
				})()}
			</div>
		</div>
	);
}
