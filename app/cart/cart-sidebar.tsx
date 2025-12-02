"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "@/app/cart/cart-context";
import { CartItem } from "@/app/cart/cart-item";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { currency, formatMoney, locale } from "@/lib/price-display";

export function CartSidebar() {
	const { isOpen, closeCart, items, itemCount, subtotal, cartId } = useCart();

	const handleCheckout = async () => {
		console.log("🛒 [FRONTEND] Checkout button clicked");
		console.log("🛒 [FRONTEND] Cart ID:", cartId);
		console.log("🛒 [FRONTEND] Items count:", items.length);
		console.log("🛒 [FRONTEND] Subtotal:", subtotal);

		try {
			console.log("📡 [FRONTEND] Calling /api/stripe/checkout...");
			const response = await fetch("/api/stripe/checkout", {
				method: "POST",
			});

			console.log("📡 [FRONTEND] Response status:", response.status);
			console.log("📡 [FRONTEND] Response ok:", response.ok);

			if (!response.ok) {
				const errorText = await response.text();
				console.error("❌ [FRONTEND] Checkout failed:", errorText);
				throw new Error(`Failed to create checkout session: ${errorText}`);
			}

			const data = await response.json();
			console.log("✅ [FRONTEND] Checkout response:", data);

			const { url } = data;
			if (url) {
				console.log("🔗 [FRONTEND] Redirecting to Stripe:", url);
				window.location.href = url;
			} else {
				console.error("❌ [FRONTEND] No URL in response:", data);
			}
		} catch (error) {
			console.error("❌ [FRONTEND] Checkout error:", error);
			if (error instanceof Error) {
				console.error("❌ [FRONTEND] Error message:", error.message);
				console.error("❌ [FRONTEND] Error stack:", error.stack);
			}
			alert("Erreur lors de la création de la session de paiement. Veuillez réessayer.");
		}
	};

	return (
		<Sheet open={isOpen} onOpenChange={(open) => !open && closeCart()}>
			<SheetContent className="flex flex-col w-full sm:max-w-lg">
				<SheetHeader className="border-b border-border pb-4">
					<SheetTitle className="flex items-center gap-2">
						Votre panier
						{itemCount > 0 && (
							<span className="text-sm font-normal text-muted-foreground">
								({itemCount} {itemCount === 1 ? "article" : "articles"})
							</span>
						)}
					</SheetTitle>
				</SheetHeader>

				{items.length === 0 ? (
					<div className="flex-1 flex flex-col items-center justify-center gap-4 py-12">
						<div className="flex h-20 w-20 items-center justify-center rounded-full bg-secondary">
							<ShoppingBag className="h-10 w-10 text-muted-foreground" />
						</div>
						<div className="text-center">
							<p className="text-lg font-medium">Votre panier est vide</p>
							<p className="text-sm text-muted-foreground mt-1">Ajoutez des produits pour commencer</p>
						</div>
						<Button variant="outline" onClick={closeCart}>
							Continuer les achats
						</Button>
					</div>
				) : (
					<>
						<ScrollArea className="flex-1 px-4">
							<div className="divide-y divide-border">
								{items.map((item) => (
									<CartItem key={item.productVariant.id} item={item} />
								))}
							</div>
						</ScrollArea>

						<SheetFooter className="border-t border-border pt-4 mt-auto">
							<div className="w-full space-y-4">
								{/* Détails du prix section */}
								<div className="space-y-3">
									<h3 className="text-base font-medium" style={{ color: "#2A2A2A" }}>
										Détails du prix
									</h3>
									<div className="space-y-2.5">
										{/* Prix initial et promotionnel */}
										<div className="flex items-center justify-between text-sm">
											<span style={{ color: "#2A2A2A" }}>Prix initial du bijou</span>
											<span className="line-through" style={{ color: "#A7A7A7" }}>
												{formatMoney({ amount: (subtotal * BigInt(160)) / BigInt(100), currency, locale })}
											</span>
										</div>
										<div className="flex items-center justify-between text-sm">
											<span style={{ color: "#2A2A2A" }}>Prix promotionnel</span>
											<span className="font-semibold" style={{ color: "#2A2A2A" }}>
												{formatMoney({ amount: subtotal, currency, locale })}
											</span>
										</div>
										{/* Frais de livraison */}
										<div className="flex items-center justify-between text-sm">
											<span style={{ color: "#2A2A2A" }}>Frais de livraison</span>
											<span className="line-through" style={{ color: "#A7A7A7" }}>
												6,99 €
											</span>
										</div>
										<div className="flex items-center justify-between text-sm">
											<span style={{ color: "#2A2A2A" }}>Livraison offerte</span>
											<span className="font-semibold" style={{ color: "#2A2A2A" }}>
												0,00 €
											</span>
										</div>
										<p className="text-xs mt-1.5" style={{ color: "#A6A6A6" }}>
											Livraison offerte exceptionnellement dans le cadre de notre liquidation totale.
										</p>
									</div>
									{/* Separator before total */}
									<div className="border-t border-border pt-2.5 mt-2.5">
										<div className="flex items-center justify-between">
											<span className="font-semibold text-base" style={{ color: "#000000" }}>
												Total
											</span>
											<span className="font-bold text-lg" style={{ color: "#000000" }}>
												{formatMoney({ amount: subtotal, currency, locale })}
											</span>
										</div>
									</div>
								</div>
								{/* Reassurance block */}
								<div className="flex items-center gap-2 text-xs" style={{ color: "#7A7A7A" }}>
									<svg
										width="14"
										height="14"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										strokeLinecap="round"
										strokeLinejoin="round"
									>
										<rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
										<path d="M7 11V7a5 5 0 0 1 10 0v4" />
									</svg>
									<span>Paiement 100% sécurisé via Stripe</span>
								</div>
								<Button onClick={handleCheckout} className="w-full h-12 text-base font-medium">
									Commander
								</Button>
								<button
									type="button"
									onClick={closeCart}
									className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
								>
									Continuer les achats
								</button>
							</div>
						</SheetFooter>
					</>
				)}
			</SheetContent>
		</Sheet>
	);
}
