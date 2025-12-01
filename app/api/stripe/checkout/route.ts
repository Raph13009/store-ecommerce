import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getCart } from "@/lib/cart";
import { getStripe } from "@/lib/stripe/client";

export async function POST(request: NextRequest) {
	console.log("🛒 [CHECKOUT] Request received");

	try {
		if (!process.env.STRIPE_SECRET_KEY) {
			console.error("❌ [CHECKOUT] STRIPE_SECRET_KEY not configured");
			return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
		}

		console.log("✅ [CHECKOUT] Stripe configured, fetching cart...");
		const cart = await getCart();

		if (!cart || cart.items.length === 0) {
			console.error("❌ [CHECKOUT] Cart is empty");
			return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
		}

		console.log(`✅ [CHECKOUT] Cart found: ${cart.id} with ${cart.items.length} items`);

		// Calculate total
		const total = cart.items.reduce((sum, item) => sum + Number(item.variant.price) * item.quantity, 0);

		if (total <= 0) {
			console.error("❌ [CHECKOUT] Invalid cart total:", total);
			return NextResponse.json({ error: "Invalid cart total" }, { status: 400 });
		}

		console.log(`💰 [CHECKOUT] Total: ${total / 100} EUR`);

		const stripe = getStripe();

		const lineItems = cart.items.map((item) => ({
			price_data: {
				currency: "eur",
				product_data: {
					name: item.variant.product.name,
					description: item.variant.name,
					images: item.variant.images.length > 0 ? item.variant.images : item.variant.product.images,
				},
				unit_amount: Number(item.variant.price),
			},
			quantity: item.quantity,
		}));

		console.log(`📦 [CHECKOUT] Creating session with ${lineItems.length} line items`);
		console.log(`📦 [CHECKOUT] Cart ID for metadata: ${cart.id}`);

		const origin = request.headers.get("origin") || "http://localhost:3000";
		const successUrl = `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`;
		const cancelUrl = `${origin}/cart`;

		console.log(`🔗 [CHECKOUT] Success URL: ${successUrl}`);
		console.log(`🔗 [CHECKOUT] Cancel URL: ${cancelUrl}`);

		// Create Stripe checkout session
		const session = await stripe.checkout.sessions.create({
			payment_method_types: ["card"],
			line_items: lineItems,
			mode: "payment",
			shipping_address_collection: {
				allowed_countries: ["FR"],
			},
			success_url: successUrl,
			cancel_url: cancelUrl,
			metadata: {
				cart_id: cart.id,
			},
		});

		console.log(`✅ [CHECKOUT] Session created: ${session.id}`);
		console.log(`🔗 [CHECKOUT] Session URL: ${session.url}`);
		console.log(`📝 [CHECKOUT] Session metadata:`, session.metadata);

		return NextResponse.json({ url: session.url });
	} catch (error) {
		console.error("❌ [CHECKOUT] Error creating checkout session:", error);
		if (error instanceof Error) {
			console.error("❌ [CHECKOUT] Error message:", error.message);
			console.error("❌ [CHECKOUT] Error stack:", error.stack);
		}
		return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
	}
}
