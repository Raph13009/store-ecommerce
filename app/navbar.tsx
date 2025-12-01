import Link from "next/link";

export function Navbar() {
	return (
		<nav className="hidden sm:flex items-center gap-6">
			<Link
				href="/"
				className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
			>
				Accueil
			</Link>
			<Link
				href="/products"
				className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
			>
				Produits
			</Link>
		</nav>
	);
}
