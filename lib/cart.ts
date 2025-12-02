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
	console.log("🍪 [COOKIE] Getting or creating cart ID...");
	const cookieStore = await cookies();
	const existingCartId = cookieStore.get("cartId")?.value;
	console.log("🍪 [COOKIE] Existing cart ID from cookie:", existingCartId);

	if (existingCartId) {
		console.log("✅ [COOKIE] Using existing cart ID:", existingCartId);
		return existingCartId;
	}

	console.log("🍪 [COOKIE] No existing cart ID, creating new cart...");
	const supabase = await createServerClient();
	const { data, error } = await supabase.from("carts").insert({}).select().single();

	if (error || !data) {
		console.error("❌ [COOKIE] Error creating cart:", error);
		return null;
	}

	console.log("✅ [COOKIE] New cart created:", data.id);
	cookieStore.set("cartId", data.id, {
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		path: "/",
		maxAge: 60 * 60 * 24 * 30, // 30 days
	});
	console.log("✅ [COOKIE] Cookie set with ID:", data.id);

	return data.id;
}

export async function getCart(): Promise<CartWithItems | null> {
	console.log("🛍️ [GET_CART] Fetching cart...");
	const cookieStore = await cookies();
	const existingCartId = cookieStore.get("cartId")?.value;
	console.log("🛍️ [GET_CART] Cart ID from cookie:", existingCartId);
	
	if (!existingCartId) {
		console.warn("⚠️ [GET_CART] No cart ID in cookie, returning null");
		return null;
	}

	const supabase = await createServerClient();

	const { data: cart, error: cartError } = await supabase.from("carts").select("*").eq("id", existingCartId).single();

	// If cart doesn't exist (PGRST116 = 0 rows), create a new one and update cookie
	if (cartError && (cartError.code === "PGRST116" || cartError.message?.includes("0 rows"))) {
		console.warn("⚠️ [GET_CART] Cart not found in database (cookie ID:", existingCartId, "), creating new cart...");
		const { data: newCart, error: createError } = await supabase.from("carts").insert({}).select().single();
		
		if (createError || !newCart) {
			console.error("❌ [GET_CART] Error creating new cart:", createError);
			return null;
		}
		
		console.log("✅ [GET_CART] New cart created:", newCart.id);
		cookieStore.set("cartId", newCart.id, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			path: "/",
			maxAge: 60 * 60 * 24 * 30, // 30 days
		});
		
		// Return empty cart
		console.log("🛍️ [GET_CART] Returning empty new cart");
		return {
			...newCart,
			items: [],
		};
	}

	if (cartError || !cart) {
		console.error("❌ [GET_CART] Error fetching cart:", cartError);
		return null;
	}

	console.log("🛍️ [GET_CART] Cart found:", cart.id);

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
		.eq("cart_id", existingCartId);

	if (itemsError) {
		console.error("❌ [GET_CART] Error fetching cart items:", itemsError);
		return { ...cart, items: [] };
	}

	console.log("🛍️ [GET_CART] Found", items?.length ?? 0, "items in cart");

	const result = {
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
			// Ensure price is number (Supabase may return as string from JSON)
			const price = typeof variant.price === "number" ? variant.price : Number(variant.price);
			return {
				...item,
				variant: {
					...variant,
					price,
				},
			};
		}),
	};

	console.log("🛍️ [GET_CART] Returning cart with", result.items.length, "items");
	return result;
}

export async function addToCart(variantId: string, quantity = 1) {
	console.log("📦 [LIB_CART] addToCart - variantId:", variantId, "quantity:", quantity);
	
	// Use getOrCreateCartId but also verify cart exists
	const cookieStore = await cookies();
	let cartId = cookieStore.get("cartId")?.value;
	
	if (!cartId) {
		console.log("📦 [LIB_CART] No cart ID in cookie, creating new cart...");
		const supabase = await createServerClient();
		const { data, error } = await supabase.from("carts").insert({}).select().single();
		
		if (error || !data) {
			console.error("❌ [LIB_CART] Error creating cart:", error);
			return { success: false, cart: null };
		}
		
		cartId = data.id;
		cookieStore.set("cartId", cartId, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			path: "/",
			maxAge: 60 * 60 * 24 * 30, // 30 days
		});
		console.log("✅ [LIB_CART] New cart created:", cartId);
	} else {
		// Verify cart exists
		const supabase = await createServerClient();
		const { data: cart, error: cartError } = await supabase.from("carts").select("*").eq("id", cartId).single();
		
		if (cartError && (cartError.code === "PGRST116" || cartError.message?.includes("0 rows"))) {
			console.warn("⚠️ [LIB_CART] Cart ID in cookie doesn't exist, creating new cart...");
			const { data: newCart, error: createError } = await supabase.from("carts").insert({}).select().single();
			
			if (createError || !newCart) {
				console.error("❌ [LIB_CART] Error creating new cart:", createError);
				return { success: false, cart: null };
			}
			
			cartId = newCart.id;
			cookieStore.set("cartId", cartId, {
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax",
				path: "/",
				maxAge: 60 * 60 * 24 * 30, // 30 days
			});
			console.log("✅ [LIB_CART] New cart created:", cartId);
		}
	}
	
	console.log("📦 [LIB_CART] Using cart ID:", cartId);
	const supabase = await createServerClient();

	// Check if item already exists in cart
	const { data: existingItem, error: checkError } = await supabase
		.from("cart_items")
		.select("*")
		.eq("cart_id", cartId)
		.eq("variant_id", variantId)
		.single();

	console.log("📦 [LIB_CART] Existing item check:", { exists: !!existingItem, error: checkError });

	if (existingItem) {
		console.log("📦 [LIB_CART] Updating existing item quantity from", existingItem.quantity, "to", existingItem.quantity + quantity);
		// Update quantity
		const { error } = await supabase
			.from("cart_items")
			.update({ quantity: existingItem.quantity + quantity })
			.eq("id", existingItem.id);

		if (error) {
			console.error("❌ [LIB_CART] Error updating cart item:", error);
			return { success: false, cart: null };
		}
		console.log("✅ [LIB_CART] Item quantity updated successfully");
	} else {
		console.log("📦 [LIB_CART] Inserting new cart item");
		// Insert new item
		const { error } = await supabase.from("cart_items").insert({
			cart_id: cartId,
			variant_id: variantId,
			quantity,
		});

		if (error) {
			console.error("❌ [LIB_CART] Error adding cart item:", error);
			return { success: false, cart: null };
		}
		console.log("✅ [LIB_CART] New item inserted successfully");
	}

	console.log("📦 [LIB_CART] Fetching updated cart...");
	const cart = await getCart();
	console.log("📦 [LIB_CART] Cart fetched:", {
		id: cart?.id,
		itemsCount: cart?.items?.length ?? 0,
		items: cart?.items?.map(i => ({ variantId: i.variant_id, quantity: i.quantity })) ?? [],
	});
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
