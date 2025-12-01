import Image from "next/image";
import Link from "next/link";

export function Footer() {
	return (
		<footer className="border-t border-border bg-background">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="py-12 sm:py-16 flex flex-col sm:flex-row gap-8 sm:gap-16">
					{/* Brand */}
					<div className="sm:max-w-xs">
						<Link href="/" className="inline-block">
							<Image
								src="/logo.png"
								alt="La Maison de Lola"
								width={200}
								height={80}
								className="h-16 w-auto object-contain"
								unoptimized
								style={{ objectFit: "contain" }}
							/>
						</Link>
						<p className="mt-4 text-sm text-muted-foreground leading-relaxed">
							Essentiels sélectionnés pour une vie moderne. Produits de qualité, pensés avec soin.
						</p>
					</div>

					{/* Links */}
					<div>
						<h3 className="text-sm font-semibold text-foreground">Boutique</h3>
						<ul className="mt-4 space-y-3">
							<li>
								<Link
									href="/products"
									className="text-sm text-muted-foreground hover:text-foreground transition-colors"
								>
									Tous les produits
								</Link>
							</li>
						</ul>
					</div>
				</div>

				{/* Bottom bar */}
				<div className="py-6 border-t border-border">
					<p className="text-sm text-muted-foreground">
						&copy; {new Date().getFullYear()} Votre Boutique. Tous droits réservés.
					</p>
				</div>
			</div>
		</footer>
	);
}
