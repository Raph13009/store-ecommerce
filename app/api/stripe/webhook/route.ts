import { type NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe/client";
import { createServerClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
	const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

	if (!webhookSecret) {
		return NextResponse.json({ error: "Stripe webhook not configured" }, { status: 500 });
	}

	const body = await request.text();
	const signature = request.headers.get("stripe-signature");

	if (!signature) {
		return NextResponse.json({ error: "Missing signature" }, { status: 400 });
	}

	let event: Stripe.Event;

	try {
		const stripe = getStripe();
		// webhookSecret is guaranteed to be string here due to check above
		event = stripe.webhooks.constructEvent(body, signature, webhookSecret as string) as Stripe.Event;
	} catch (error) {
		console.error("Webhook signature verification failed:", error);
		return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
	}

	const supabase = await createServerClient();

	// Handle checkout.session.completed event
	if (event.type === "checkout.session.completed") {
		const session = event.data.object;

		// Get cart from metadata
		const cartId = session.metadata?.cart_id;
		if (!cartId) {
			console.error("No cart_id in session metadata");
			return NextResponse.json({ error: "Missing cart_id" }, { status: 400 });
		}

		// Get cart with items directly from Supabase
		const { data: cart, error: cartError } = await supabase
			.from("carts")
			.select("*")
			.eq("id", cartId)
			.single();

		if (cartError || !cart) {
			console.error("Cart not found:", cartError);
			return NextResponse.json({ error: "Cart not found" }, { status: 404 });
		}

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
			console.error("Error fetching cart items:", itemsError);
			return NextResponse.json({ error: "Failed to fetch cart items" }, { status: 500 });
		}

		// Calculate total
		const total = (items ?? []).reduce((sum, item) => {
			const variant = item.variant as { price: number };
			return sum + variant.price * item.quantity;
		}, 0);

		// Create order
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
			console.error("Error creating order:", orderError);
			return NextResponse.json({ error: "Failed to create order" }, { status: 500 });
		}

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

		const { error: orderItemsError } = await supabase.from("order_items").insert(orderItems);

		if (orderItemsError) {
			console.error("Error creating order items:", orderItemsError);
			return NextResponse.json({ error: "Failed to create order items" }, { status: 500 });
		}

		// Clear cart (delete cart items)
		await supabase.from("cart_items").delete().eq("cart_id", cartId);

		console.log(`Order ${order.id} created successfully`);
	}

	// Handle payment_intent.succeeded
	if (event.type === "payment_intent.succeeded") {
		const paymentIntent = event.data.object;

		// Update order status to completed
		await supabase
			.from("orders")
			.update({ status: "completed" })
			.eq("stripe_payment_intent_id", paymentIntent.id);
	}

	return NextResponse.json({ received: true });
}
