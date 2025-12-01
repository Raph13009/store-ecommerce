import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
	return (
		<main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
			<Link
				href="/"
				className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-12"
			>
				<ArrowLeft className="h-4 w-4" />
				Retour à l'accueil
			</Link>

			<div className="space-y-8">
				<div className="space-y-4">
					<h1 className="text-4xl sm:text-5xl font-medium tracking-tight text-foreground">
						🌸 À propos de Lola
					</h1>
				</div>

				<div className="space-y-6 text-muted-foreground leading-relaxed max-w-3xl">
					<p>
						Cela fait maintenant huit ans que je travaille dans l'univers du bijou. J'ai commencé comme
						passionnée, puis je me suis lancée seule il y a quatre ans pour créer ma propre petite marque.
						J'ai sillonné les salons artisanaux dans toute la France, du Salon du DIY à Paris aux marchés
						créateurs de région, toujours avec la même envie : proposer des bijoux fins et durables que l'on
						porte tous les jours avec plaisir.
					</p>

					<p>
						Chaque pièce que je choisis ou assemble respecte mes valeurs : de l'inox doré de qualité, une
						finition soignée, un style simple et lumineux. Pas de surproduction, pas de tendance éphémère.
						Juste de beaux bijoux pensés pour durer.
					</p>

					<p>
						Aujourd'hui, après des années d'activité et beaucoup d'aventures, je tourne une nouvelle page.
						J'ai décidé d'écouler le reste de ma collection en ligne, à prix doux, afin de fermer proprement
						mon stock et de laisser partir mes dernières pièces. Cela ne change rien à la qualité : ce sont
						les mêmes bijoux que je vendais en salon, les mêmes matériaux, le même soin.
					</p>

					<p>
						Merci d'être là, et merci de soutenir le travail d'une petite créatrice indépendante. Chaque
						commande compte vraiment pour moi.
					</p>

					<p className="pt-4 text-foreground font-medium">— Lola</p>
				</div>

				<div className="pt-8">
					<Link
						href="/products"
						className="inline-flex items-center justify-center gap-2 h-12 px-8 bg-foreground text-primary-foreground rounded-full text-base font-medium hover:bg-foreground/90 transition-colors"
					>
						Découvrir les bijoux
					</Link>
				</div>
			</div>
		</main>
	);
}
