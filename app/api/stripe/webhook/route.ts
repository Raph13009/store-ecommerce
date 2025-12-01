import { type NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/client";
import { createServerClient } from "@/lib/supabase/server";

// GET endpoint to test if webhook is accessible
export async function GET() {
	return NextResponse.json({
		message: "Webhook endpoint is accessible",
		timestamp: new Date().toISOString(),
		url: process.env.NEXT_PUBLIC_ROOT_URL || "unknown",
	});
}

export async function POST(request: NextRequest) {
	console.log("🔔 Webhook received");

	const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

	if (!webhookSecret) {
		console.error("❌ STRIPE_WEBHOOK_SECRET not configured");
		return NextResponse.json({ error: "Stripe webhook not configured" }, { status: 500 });
	}

	const body = await request.text();
	const signature = request.headers.get("stripe-signature");

	if (!signature) {
		console.error("❌ Missing stripe-signature header");
		return NextResponse.json({ error: "Missing signature" }, { status: 400 });
	}

	let event: Stripe.Event;

	try {
		const stripe = getStripe();
		// webhookSecret is guaranteed to be string here due to check above
		event = stripe.webhooks.constructEvent(body, signature, webhookSecret as string) as Stripe.Event;
		console.log(`✅ Webhook verified: ${event.type}`);
	} catch (error) {
		console.error("❌ Webhook signature verification failed:", error);
		return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
	}

	const supabase = await createServerClient();

	// Handle checkout.session.completed event
	if (event.type === "checkout.session.completed") {
		console.log("🛒 Processing checkout.session.completed");
		const session = event.data.object;

		console.log("📋 [WEBHOOK] Session details:");
		console.log("  - Session ID:", session.id);
		console.log("  - Payment Intent:", session.payment_intent);
		console.log("  - Customer Email:", session.customer_email);
		console.log("  - Customer Details:", session.customer_details);
		console.log("  - Shipping Details:", session.shipping_details);
		console.log("  - Metadata:", session.metadata);

		// Get cart from metadata
		const cartId = session.metadata?.cart_id;
		if (!cartId) {
			console.error("❌ No cart_id in session metadata");
			console.error("❌ Available metadata keys:", Object.keys(session.metadata || {}));
			return NextResponse.json({ error: "Missing cart_id" }, { status: 400 });
		}
		console.log(`📦 Cart ID from metadata: ${cartId}`);

		// Get cart with items directly from Supabase
		const { data: cart, error: cartError } = await supabase
			.from("carts")
			.select("*")
			.eq("id", cartId)
			.single();

		if (cartError || !cart) {
			console.error("❌ Cart not found:", cartError);
			return NextResponse.json({ error: "Cart not found" }, { status: 404 });
		}
		console.log("✅ Cart found");

		// Get cart items
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
			console.error("❌ Error fetching cart items:");
			console.error("  - Error object:", JSON.stringify(itemsError, null, 2));
			console.error("  - Error code:", itemsError?.code);
			console.error("  - Error message:", itemsError?.message);
			return NextResponse.json({ error: "Failed to fetch cart items", details: itemsError }, { status: 500 });
		}
		console.log(`✅ Found ${items?.length ?? 0} cart items`);
		if (items && items.length > 0) {
			console.log(
				"📦 Cart items details:",
				JSON.stringify(
					items.map((item) => ({
						id: item.id,
						variant_id: item.variant_id,
						quantity: item.quantity,
						variant: item.variant
							? {
									id: (item.variant as any).id,
									price: (item.variant as any).price,
									name: (item.variant as any).name,
								}
							: null,
					})),
					null,
					2,
				),
			);
		}

		// Calculate total
		const total = (items ?? []).reduce((sum, item) => {
			const variant = item.variant as { price: number };
			return sum + variant.price * item.quantity;
		}, 0);
		console.log(`💰 Total: ${total}`);

		// Create order
		console.log("📝 Creating order...");
		const { data: order, error: orderError } = await supabase
			.from("orders")
			.insert({
				email: session.customer_email || session.customer_details?.email || "guest@example.com",
				total,
				status: "processing",
				stripe_payment_intent_id: session.payment_intent as string,
				shipping_address: session.shipping_details
					? {
							name: session.shipping_details.name,
							address: session.shipping_details.address,
						}
					: null,
				billing_address: session.customer_details
					? {
							name: session.customer_details.name,
							email: session.customer_details.email,
							address: session.customer_details.address,
						}
					: null,
			})
			.select()
			.single();

		if (orderError || !order) {
			console.error("❌ Error creating order:");
			console.error("  - Error object:", JSON.stringify(orderError, null, 2));
			console.error("  - Error code:", orderError?.code);
			console.error("  - Error message:", orderError?.message);
			console.error("  - Error details:", orderError?.details);
			console.error("  - Error hint:", orderError?.hint);
			return NextResponse.json({ error: "Failed to create order", details: orderError }, { status: 500 });
		}
		console.log(`✅ Order created: ${order.id}`);
		console.log("📋 Order details:", JSON.stringify(order, null, 2));

		// Create order items
		const orderItems = (items ?? []).map((item) => {
			const variant = item.variant as {
				id: string;
				price: number;
				name: string;
				product: { name: string };
			};
			return {
				order_id: order.id,
				variant_id: variant.id,
				quantity: item.quantity,
				price: variant.price,
				product_name: variant.product.name,
				variant_name: variant.name,
			};
		});

		console.log("📦 Creating order items...");
		const { error: orderItemsError } = await supabase.from("order_items").insert(orderItems);

		if (orderItemsError) {
			console.error("❌ Error creating order items:", orderItemsError);
			return NextResponse.json({ error: "Failed to create order items" }, { status: 500 });
		}
		console.log(`✅ Created ${orderItems.length} order items`);

		// Clear cart (delete cart items)
		await supabase.from("cart_items").delete().eq("cart_id", cartId);
		console.log("🛒 Cart cleared");

		console.log(`✅ Order ${order.id} created successfully`);
	}

	// Handle payment_intent.succeeded
	if (event.type === "payment_intent.succeeded") {
		console.log("💳 Processing payment_intent.succeeded");
		const paymentIntent = event.data.object;

		// Update order status to completed
		const { error: updateError } = await supabase
			.from("orders")
			.update({ status: "completed" })
			.eq("stripe_payment_intent_id", paymentIntent.id);

		if (updateError) {
			console.error("❌ Error updating order status:", updateError);
		} else {
			console.log("✅ Order status updated to completed");
		}
	}

	console.log("✅ Webhook processed successfully");
	return NextResponse.json({ received: true });
}
