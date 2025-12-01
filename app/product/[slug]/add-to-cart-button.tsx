"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { addToCart } from "@/app/cart/actions";
import { useCart } from "@/app/cart/cart-context";
import { QuantitySelector } from "@/app/product/[slug]/quantity-selector";
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

	const selectedVariant = useMemo(() => {
		if (variants.length === 1) {
			return variants[0];
		}

		// For now, if multiple variants, select first one
		// You can enhance this with variant selection UI later
		return variants[0];
	}, [variants]);

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

	return (
		<div className="space-y-8">
			{variants.length > 1 && (
				<div className="text-sm text-muted-foreground">
					Plusieurs variantes disponibles. Affichage de la première variante.
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
