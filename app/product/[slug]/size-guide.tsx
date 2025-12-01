"use client";

import { HelpCircle, X } from "lucide-react";
import { useEffect, useState } from "react";

export function SizeGuide() {
	const [isOpen, setIsOpen] = useState(false);

	// Prevent body scroll when modal is open
	useEffect(() => {
		if (isOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
		return () => {
			document.body.style.overflow = "";
		};
	}, [isOpen]);

	return (
		<>
			{/* Trigger Button - Visible on all screen sizes */}
			<button
				type="button"
				onClick={() => setIsOpen(true)}
				className="group flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
				aria-label="Guide des tailles"
			>
				<HelpCircle className="h-3.5 w-3.5" />
				<span>Guide des tailles</span>
			</button>

			{/* Popup Modal */}
			{isOpen && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm p-4 overflow-y-auto"
					role="button"
					tabIndex={-1}
					onClick={() => setIsOpen(false)}
					onKeyDown={(e) => {
						if (e.key === "Escape") {
							setIsOpen(false);
						}
					}}
				>
					<div
						className="relative w-full max-w-md rounded-2xl border border-border bg-background p-6 shadow-lg my-auto"
						role="dialog"
						aria-modal="true"
						aria-labelledby="size-guide-title"
						onClick={(e) => e.stopPropagation()}
					>
						{/* Close Button */}
						<button
							type="button"
							onClick={() => setIsOpen(false)}
							className="absolute right-4 top-4 rounded-full p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
							aria-label="Fermer"
						>
							<X className="h-4 w-4" />
						</button>

						{/* Content */}
						<div className="space-y-4 pr-8">
							<h3 id="size-guide-title" className="text-lg font-medium text-foreground">
								Guide des tailles - Bagues
							</h3>
							<p className="text-sm text-muted-foreground leading-relaxed">
								Pour trouver votre taille de bague, mesurez la circonférence de votre doigt en centimètres.
							</p>

							{/* Size Table */}
							<div className="space-y-3">
								<div className="grid grid-cols-3 gap-2 text-xs">
									<div className="font-medium text-foreground">Taille</div>
									<div className="font-medium text-foreground">Circonférence</div>
									<div className="font-medium text-foreground">Diamètre</div>
								</div>
								<div className="space-y-2">
									{[
										{ size: "48", circumference: "4.8 cm", diameter: "15.3 mm" },
										{ size: "50", circumference: "5.0 cm", diameter: "15.9 mm" },
										{ size: "52", circumference: "5.2 cm", diameter: "16.5 mm" },
										{ size: "54", circumference: "5.4 cm", diameter: "17.2 mm" },
										{ size: "56", circumference: "5.6 cm", diameter: "17.8 mm" },
										{ size: "58", circumference: "5.8 cm", diameter: "18.4 mm" },
										{ size: "60", circumference: "6.0 cm", diameter: "19.1 mm" },
									].map((row) => (
										<div
											key={row.size}
											className="grid grid-cols-3 gap-2 text-xs border-b border-border/50 pb-2"
										>
											<div className="font-medium text-foreground">{row.size}</div>
											<div className="text-muted-foreground">{row.circumference}</div>
											<div className="text-muted-foreground">{row.diameter}</div>
										</div>
									))}
								</div>
							</div>

							{/* Tips */}
							<div className="rounded-lg bg-muted/50 p-3 space-y-2">
								<p className="text-xs font-medium text-foreground">💡 Conseils :</p>
								<ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
									<li>Mesurez votre doigt en fin de journée (les doigts sont plus épais)</li>
									<li>Utilisez un ruban à mesurer ou une ficelle</li>
									<li>Si vous êtes entre deux tailles, choisissez la plus grande</li>
								</ul>
							</div>

							{/* CTA Button */}
							<button
								type="button"
								onClick={() => setIsOpen(false)}
								className="mt-6 w-full h-12 bg-foreground text-primary-foreground rounded-full text-sm font-medium tracking-wide hover:bg-foreground/90 transition-colors"
							>
								J'ai compris
							</button>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
