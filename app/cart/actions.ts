"use server";

import {
	addToCart as addToCartLib,
	getCart,
	removeFromCart as removeFromCartLib,
	setCartQuantity as setCartQuantityLib,
} from "@/lib/cart";
import type { CartWithItems } from "@/lib/cart";
import type { Cart, CartLineItem } from "@/app/cart/cart-context";

function transformCart(cart: CartWithItems | null): Cart | null {
	if (!cart) return null;

	return {
		id: cart.id,
		lineItems: cart.items.map((item): CartLineItem => {
			const variant = item.variant as {
				id: string;
				price: number;
				images: string[];
				name: string;
				product: {
					id: string;
					name: string;
					slug: string;
					images: string[];
				};
			};

			return {
				quantity: item.quantity,
				productVariant: {
					id: variant.id,
					price: variant.price,
					images: variant.images,
					name: variant.name,
					product: variant.product,
				},
			};
		}),
	};
}

async function addToCartAction(variantId: string, quantity = 1) {
	console.log("🔧 [SERVER_ACTION] addToCart called with variantId:", variantId, "quantity:", quantity);
	const result = await addToCartLib(variantId, quantity);
	console.log("🔧 [SERVER_ACTION] addToCartLib result:", {
		success: result.success,
		cartExists: !!result.cart,
		cartId: result.cart?.id,
		itemsCount: result.cart?.items?.length ?? 0,
	});

	if (result.success && result.cart) {
		const transformed = transformCart(result.cart);
		console.log("🔧 [SERVER_ACTION] Transformed cart:", {
			id: transformed?.id,
			lineItemsCount: transformed?.lineItems.length ?? 0,
		});
		return { success: true, cart: transformed };
	}
	console.warn("⚠️ [SERVER_ACTION] addToCart failed or cart is null");
	return { success: false, cart: null };
}

async function removeFromCartAction(variantId: string) {
	const result = await removeFromCartLib(variantId);
	if (result.success && result.cart) {
		return { success: true, cart: transformCart(result.cart) };
	}
	return { success: false, cart: null };
}

async function setCartQuantityAction(variantId: string, quantity: number) {
	const result = await setCartQuantityLib(variantId, quantity);
	if (result.success && result.cart) {
		return { success: true, cart: transformCart(result.cart) };
	}
	return { success: false, cart: null };
}

export {
	getCart,
	addToCartAction as addToCart,
	removeFromCartAction as removeFromCart,
	setCartQuantityAction as setCartQuantity,
};
