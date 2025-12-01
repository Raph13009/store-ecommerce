import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ReturnsPage() {
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
						Politique d'échange et de retour
					</h1>
				</div>

				<div className="space-y-6 text-muted-foreground leading-relaxed">
					<p>Chez Lola, nous tenons à ce que chaque cliente se sente pleinement satisfaite de son bijou.</p>
					<p>
						Parce que l'achat d'une pièce est avant tout un choix personnel, nous mettons en place une
						politique simple et transparente pour vous accompagner.
					</p>
				</div>

				<div className="space-y-6 pt-8">
					<div>
						<h2 className="text-2xl font-medium tracking-tight text-foreground mb-4">Échanges</h2>
						<p className="text-muted-foreground leading-relaxed">
							Si le bijou reçu ne vous convient pas (taille, style ou préférence personnelle), vous pouvez
							demander un échange dans un délai de 14 jours après réception.
						</p>
						<p className="text-muted-foreground leading-relaxed mt-4">
							Nous vous proposerons une alternative disponible dans la collection actuelle.
						</p>
					</div>

					<div>
						<h2 className="text-2xl font-medium tracking-tight text-foreground mb-4">Retours</h2>
						<p className="text-muted-foreground leading-relaxed">
							Si aucun échange ne vous correspond, vous pouvez demander un retour.
						</p>
						<p className="text-muted-foreground leading-relaxed mt-4">
							Les bijoux doivent être renvoyés dans leur état d'origine, non portés et dans leur emballage.
						</p>
						<p className="text-muted-foreground leading-relaxed mt-4">
							Une fois le retour validé, le remboursement sera effectué sur votre mode de paiement initial.
						</p>
					</div>

					<div>
						<h2 className="text-2xl font-medium tracking-tight text-foreground mb-4">
							Pourquoi cette politique ?
						</h2>
						<p className="text-muted-foreground leading-relaxed">
							Chaque bijou est sélectionné en petites quantités et fait partie d'une collection limitée.
						</p>
						<p className="text-muted-foreground leading-relaxed mt-4">
							Nous mettons donc tout en œuvre pour trouver une solution adaptée, tout en préservant la qualité
							et l'intégrité de notre stock.
						</p>
					</div>

					<div>
						<h2 className="text-2xl font-medium tracking-tight text-foreground mb-4">Nous contacter</h2>
						<p className="text-muted-foreground leading-relaxed">
							Pour toute demande d'échange ou de retour, écrivez-nous à :
						</p>
						<p className="text-foreground font-medium mt-4">
							📧{" "}
							<a href="mailto:lolatalbon@gmail.com" className="hover:underline text-foreground">
								lolatalbon@gmail.com
							</a>
						</p>
						<p className="text-muted-foreground leading-relaxed mt-4">
							Nous vous répondrons rapidement et vous accompagnerons étape par étape.
						</p>
					</div>
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

