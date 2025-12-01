import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getCart } from "@/lib/cart";
import { getStripe } from "@/lib/stripe/client";

export async function POST(request: NextRequest) {
	try {
		if (!process.env.STRIPE_SECRET_KEY) {
			return NextResponse.json({ error: "Stripe not configured" }, { status: 500 });
		}

		const cart = await getCart();

		if (!cart || cart.items.length === 0) {
			return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
		}

		// Calculate total
		const total = cart.items.reduce((sum, item) => sum + Number(item.variant.price) * item.quantity, 0);

		if (total <= 0) {
			return NextResponse.json({ error: "Invalid cart total" }, { status: 400 });
		}

		const stripe = getStripe();

		// Create Stripe checkout session
		const session = await stripe.checkout.sessions.create({
			payment_method_types: ["card"],
			line_items: cart.items.map((item) => ({
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
			})),
			mode: "payment",
			success_url: `${request.headers.get("origin")}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${request.headers.get("origin")}/cart`,
			metadata: {
				cart_id: cart.id,
			},
		});

		return NextResponse.json({ url: session.url });
	} catch (error) {
		console.error("Error creating checkout session:", error);
		return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
	}
}
