"use client";

import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export function ProductMobileBackButton() {
	const router = useRouter();

	return (
		<button
			type="button"
			onClick={() => router.back()}
			className="sm:hidden fixed top-24 left-4 z-40 flex items-center justify-center w-10 h-10 rounded-full bg-background/90 backdrop-blur-sm border border-border text-muted-foreground hover:text-foreground hover:bg-background transition-all shadow-sm"
			aria-label="Retour"
		>
			<ArrowLeft className="h-4 w-4" />
		</button>
	);
}
