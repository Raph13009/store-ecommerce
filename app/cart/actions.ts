"use server";

import {
	addToCart as addToCartLib,
	getCart,
	removeFromCart as removeFromCartLib,
	setCartQuantity as setCartQuantityLib,
} from "@/lib/cart";

export {
	getCart,
	addToCartLib as addToCart,
	removeFromCartLib as removeFromCart,
	setCartQuantityLib as setCartQuantity,
};
