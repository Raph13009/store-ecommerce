import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase/server";
import type { Cart, CartItem, ProductVariant } from "@/lib/supabase/types";

export type CartWithItems = Cart & {
	items: Array<
		CartItem & {
			variant: ProductVariant & {
				product: {
					id: string;
					name: string;
					slug: string;
					images: string[];
				};
			};
		}
	>;
};

async function getOrCreateCartId(): Promise<string | null> {
	const cookieStore = await cookies();
	const existingCartId = cookieStore.get("cartId")?.value;

	if (existingCartId) {
		return existingCartId;
	}

	const supabase = await createServerClient();
	const { data, error } = await supabase.from("carts").insert({}).select().single();

	if (error || !data) {
		console.error("Error creating cart:", error);
		return null;
	}

	cookieStore.set("cartId", data.id, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: 60 * 60 * 24 * 30, // 30 days
	});

	return data.id;
}

export async function getCart(): Promise<CartWithItems | null> {
	const cartId = await getOrCreateCartId();
	if (!cartId) {
		return null;
	}

	const supabase = await createServerClient();

	const { data: cart, error: cartError } = await supabase.from("carts").select("*").eq("id", cartId).single();

	if (cartError || !cart) {
		return null;
	}

	const { data: items, error: itemsError } = await supabase
		.from("cart_items")
		.select(
			`
			*,
			variant:product_variants(
				*,
				product:products(id, name, slug, images)
			)
		`,
		)
		.eq("cart_id", cartId);

	if (itemsError) {
		console.error("Error fetching cart items:", itemsError);
		return { ...cart, items: [] };
	}

	return {
		...cart,
		items: (items ?? []).map((item) => {
			const variant = item.variant as ProductVariant & {
				product: {
					id: string;
					name: string;
					slug: string;
					images: string[];
				};
			};
			return {
				...item,
				variant,
			};
		}),
	};
}

export async function addToCart(variantId: string, quantity = 1) {
	const cartId = await getOrCreateCartId();
	if (!cartId) {
		return { success: false, cart: null };
	}

	const supabase = await createServerClient();

	// Check if item already exists in cart
	const { data: existingItem } = await supabase
		.from("cart_items")
		.select("*")
		.eq("cart_id", cartId)
		.eq("variant_id", variantId)
		.single();

	if (existingItem) {
		// Update quantity
		const { error } = await supabase
			.from("cart_items")
			.update({ quantity: existingItem.quantity + quantity })
			.eq("id", existingItem.id);

		if (error) {
			console.error("Error updating cart item:", error);
			return { success: false, cart: null };
		}
	} else {
		// Insert new item
		const { error } = await supabase.from("cart_items").insert({
			cart_id: cartId,
			variant_id: variantId,
			quantity,
		});

		if (error) {
			console.error("Error adding cart item:", error);
			return { success: false, cart: null };
		}
	}

	const cart = await getCart();
	return { success: true, cart };
}

export async function removeFromCart(variantId: string) {
	const cartId = await getOrCreateCartId();
	if (!cartId) {
		return { success: false, cart: null };
	}

	const supabase = await createServerClient();

	const { error } = await supabase
		.from("cart_items")
		.delete()
		.eq("cart_id", cartId)
		.eq("variant_id", variantId);

	if (error) {
		console.error("Error removing cart item:", error);
		return { success: false, cart: null };
	}

	const cart = await getCart();
	return { success: true, cart };
}

export async function setCartQuantity(variantId: string, quantity: number) {
	const cartId = await getOrCreateCartId();
	if (!cartId) {
		return { success: false, cart: null };
	}

	const supabase = await createServerClient();

	if (quantity <= 0) {
		return removeFromCart(variantId);
	}

	// Check if item exists
	const { data: existingItem } = await supabase
		.from("cart_items")
		.select("*")
		.eq("cart_id", cartId)
		.eq("variant_id", variantId)
		.single();

	if (existingItem) {
		const { error } = await supabase.from("cart_items").update({ quantity }).eq("id", existingItem.id);

		if (error) {
			console.error("Error updating cart item quantity:", error);
			return { success: false, cart: null };
		}
	} else {
		const { error } = await supabase.from("cart_items").insert({
			cart_id: cartId,
			variant_id: variantId,
			quantity,
		});

		if (error) {
			console.error("Error adding cart item:", error);
			return { success: false, cart: null };
		}
	}

	const cart = await getCart();
	return { success: true, cart };
}
