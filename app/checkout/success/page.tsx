import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function CheckoutSuccessPage({
	searchParams,
}: {
	searchParams: Promise<{ session_id?: string }>;
}) {
	const params = await searchParams;
	const sessionId = params.session_id;

	return (
		<main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
			<div className="text-center space-y-6">
				<div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900">
					<svg
						className="w-8 h-8 text-green-600 dark:text-green-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
					</svg>
				</div>

				<div className="space-y-2">
					<h1 className="text-3xl font-medium tracking-tight">Commande confirmée !</h1>
					<p className="text-muted-foreground">
						Merci pour votre achat. Nous avons bien reçu votre commande et vous enverrons un email de
						confirmation sous peu.
					</p>
					{sessionId && <p className="text-sm text-muted-foreground">ID de session : {sessionId}</p>}
				</div>

				<div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
					<Button asChild>
						<Link href="/products">Continuer les achats</Link>
					</Button>
					<Button asChild variant="outline">
						<Link href="/">Retour à l'accueil</Link>
					</Button>
				</div>
			</div>
		</main>
	);
}
