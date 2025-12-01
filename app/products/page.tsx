import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { ProductsListClient } from "./products-list-client";

function ProductGridSkeleton() {
	return (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
			{Array.from({ length: 6 }).map((_, i) => (
				<div key={`skeleton-${i}`}>
					<div className="aspect-square bg-secondary rounded-2xl mb-4 animate-pulse" />
					<div className="space-y-2">
						<div className="h-5 w-3/4 bg-secondary rounded animate-pulse" />
						<div className="h-5 w-1/4 bg-secondary rounded animate-pulse" />
					</div>
				</div>
			))}
		</div>
	);
}

export default function ProductsPage() {
	return (
		<main>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<Link
					href="/"
					className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6 group"
				>
					<ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
					<span>Retour à l'accueil</span>
				</Link>
				<h1 className="text-3xl font-medium tracking-tight mb-8">Tous les produits</h1>
				<Suspense fallback={<ProductGridSkeleton />}>
					<ProductsListClient />
				</Suspense>
			</div>
		</main>
	);
}
