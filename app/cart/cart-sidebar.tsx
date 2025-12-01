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
		try {
			const response = await fetch("/api/stripe/checkout", {
				method: "POST",
			});

			if (!response.ok) {
				throw new Error("Failed to create checkout session");
			}

			const { url } = await response.json();
			if (url) {
				window.location.href = url;
			}
		} catch (error) {
			console.error("Checkout error:", error);
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
								<div className="flex items-center justify-between text-base">
									<span className="font-medium">Sous-total</span>
									<span className="font-semibold">{formatMoney({ amount: subtotal, currency, locale })}</span>
								</div>
								<p className="text-xs text-muted-foreground">Livraison et taxes calculées à la commande</p>
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
