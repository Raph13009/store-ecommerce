"use server";

import { revalidatePath } from "next/cache";
import {
	addToCart as addToCartLib,
	getCart,
	removeFromCart as removeFromCartLib,
	setCartQuantity as setCartQuantityLib,
} from "@/lib/cart";

async function addToCartAction(variantId: string, quantity = 1) {
	const result = await addToCartLib(variantId, quantity);
	revalidatePath("/", "layout");
	return result;
}

async function removeFromCartAction(variantId: string) {
	const result = await removeFromCartLib(variantId);
	revalidatePath("/", "layout");
	return result;
}

async function setCartQuantityAction(variantId: string, quantity: number) {
	const result = await setCartQuantityLib(variantId, quantity);
	revalidatePath("/", "layout");
	return result;
}

export {
	getCart,
	addToCartAction as addToCart,
	removeFromCartAction as removeFromCart,
	setCartQuantityAction as setCartQuantity,
};
