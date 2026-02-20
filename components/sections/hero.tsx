import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function Hero() {
	return (
		<section className="relative overflow-hidden bg-secondary/30">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="py-10 sm:py-12 lg:py-16">
					<div className="max-w-2xl">
						<h1 className="text-3xl sm:text-4xl lg:text-5xl font-medium tracking-tight text-foreground">
							Derniers bijoux de ma collection personnelle
						</h1>
						<p className="mt-4 text-base sm:text-lg text-muted-foreground leading-relaxed">
							Des pièces fines en inox doré, sélectionnées avec soin et proposées à prix doux jusqu'à
							écoulement des stocks.
						</p>
						<div className="mt-6 flex flex-col sm:flex-row gap-3">
							<Link
								href="/products"
								className="inline-flex items-center justify-center gap-2 h-11 px-7 bg-foreground text-primary-foreground rounded-full text-base font-medium hover:bg-foreground/90 transition-colors"
							>
								Découvrir les bijoux
								<ArrowRight className="h-4 w-4" />
							</Link>
							<Link
								href="/about"
								className="inline-flex items-center justify-center gap-2 h-11 px-7 border border-border rounded-full text-base font-medium hover:bg-secondary transition-colors"
							>
								À propos de Lola
							</Link>
						</div>
					</div>
				</div>
			</div>
			{/* Subtle decorative element */}
			<div className="absolute top-1/2 right-0 -translate-y-1/2 w-1/3 h-full bg-gradient-to-l from-secondary/50 to-transparent pointer-events-none hidden lg:block" />
		</section>
	);
}
