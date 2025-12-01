import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import { type Cart, type CartLineItem, CartProvider } from "@/app/cart/cart-context";
import { CartSidebar } from "@/app/cart/cart-sidebar";
import { CartButton } from "@/app/cart-button";
import { Footer } from "@/app/footer";
import { Navbar } from "@/app/navbar";
import { getCart } from "@/lib/cart";
import { PromotionalBanner } from "@/components/promotional-banner";
import "@/app/globals.css";
import { ShoppingCartIcon } from "lucide-react";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

const rootUrl = process.env.NEXT_PUBLIC_ROOT_URL || "http://localhost:3000";

export const metadata: Metadata = {
	title: "La Maison de Lola ✨",
	description:
		"Derniers bijoux de ma collection personnelle ✨ Des pièces fines en inox doré, sélectionnées avec soin et proposées à prix doux jusqu'à écoulement des stocks.",
	icons: {
		icon: "/favicon.ico",
		shortcut: "/favicon.ico",
		apple: "/favicon.ico",
	},
	openGraph: {
		title: "La Maison de Lola ✨ Bijoux en inox doré",
		description:
			"Derniers bijoux de ma collection personnelle. Des pièces fines en inox doré, sélectionnées avec soin et proposées à prix doux jusqu'à écoulement des stocks.",
		images: [
			{
				url: `${rootUrl}/logo.png`,
				width: 1200,
				height: 630,
				alt: "La Maison de Lola",
			},
		],
		type: "website",
		locale: "fr_FR",
		siteName: "La Maison de Lola",
	},
	twitter: {
		card: "summary_large_image",
		title: "La Maison de Lola ✨ Bijoux en inox doré",
		description:
			"Derniers bijoux de ma collection personnelle. Des pièces fines en inox doré, sélectionnées avec soin et proposées à prix doux jusqu'à écoulement des stocks.",
		images: [`${rootUrl}/logo.png`],
	},
};

function CartButtonFallback() {
	return (
		<div className="p-2 rounded-full w-10 h-10" aria-description="Loading cart">
			<ShoppingCartIcon className="w-6 h-6 opacity-20" />
		</div>
	);
}

async function getInitialCart() {
	try {
		const cart = await getCart();
		if (!cart) {
			return { cart: null, cartId: null };
		}

		// Transform Supabase cart to Cart type expected by context
		const transformedCart: Cart = {
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

		return { cart: transformedCart, cartId: cart.id };
	} catch {
		return { cart: null, cartId: null };
	}
}

async function CartProviderWrapper({ children }: { children: React.ReactNode }) {
	const { cart, cartId } = await getInitialCart();

	return (
		<CartProvider initialCart={cart} initialCartId={cartId}>
			<div className="flex min-h-screen flex-col">
				<PromotionalBanner />
				<header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
					<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
						<div className="flex items-center justify-between h-20 py-2">
							<div className="flex items-center gap-8">
								<Link href="/" className="flex items-center">
									<Image
										src="/logo.png"
										alt="La Maison de Lola"
										width={250}
										height={100}
										className="h-20 w-auto object-contain"
										priority
										unoptimized
										style={{ objectFit: "contain" }}
									/>
								</Link>
								<Suspense>
									<Navbar />
								</Suspense>
							</div>
							<Suspense fallback={<CartButtonFallback />}>
								<CartButton />
							</Suspense>
						</div>
					</div>
				</header>
				<div className="flex-1">
					<Suspense>{children}</Suspense>
				</div>
				<Footer />
			</div>
			<CartSidebar />
		</CartProvider>
	);
}

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="fr">
			<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
				<Suspense>
					<CartProviderWrapper>{children}</CartProviderWrapper>
				</Suspense>
			</body>
		</html>
	);
}
