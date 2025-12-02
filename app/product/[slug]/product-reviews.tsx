import { Star } from "lucide-react";
import { getReviews } from "@/lib/reviews";
import type { Review } from "@/lib/supabase/types";

type ProductReviewsProps = {
	productId: string;
};

function formatDate(dateString: string): string {
	const date = new Date(dateString);
	return new Intl.DateTimeFormat("fr-FR", {
		year: "numeric",
		month: "long",
		day: "numeric",
	}).format(date);
}

function StarRating({ stars }: { stars: number }) {
	return (
		<div className="flex items-center gap-0.5">
			{Array.from({ length: 5 }).map((_, i) => (
				<Star
					key={i}
					className={`h-3.5 w-3.5 ${
						i < stars
							? "fill-foreground text-foreground"
							: "fill-transparent text-muted-foreground"
					}`}
				/>
			))}
		</div>
	);
}

export async function ProductReviews({ productId }: ProductReviewsProps) {
	// Temporarily disable cache to ensure fresh data
	// "use cache";
	const reviews = await getReviews(productId);

	// Debug: log reviews to help troubleshoot
	console.log(`[ProductReviews] Product ID: ${productId}, Reviews count: ${reviews.length}`, reviews);

	if (reviews.length === 0) {
		return null;
	}

	console.log(`[ProductReviews] Rendering ${reviews.length} reviews`);

	return (
		<section className="mt-20 border-t border-border pt-16">
			<h2 className="mb-12 text-center text-3xl font-medium tracking-tight">Avis clients</h2>
			<div className="space-y-8">
				{reviews.map((review, index) => {
					console.log(`[ProductReviews] Rendering review ${index + 1}/${reviews.length}:`, review.id);
					return (
						<div
							key={review.id}
							className="rounded-lg border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
						>
						<div className="mb-4 flex items-start justify-between gap-4">
							<div className="flex items-center gap-3">
								{review.author_image ? (
									<img
										src={review.author_image}
										alt={review.author_name}
										className="h-10 w-10 rounded-full object-cover"
									/>
								) : (
									<div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary text-sm font-medium text-secondary-foreground">
										{review.author_name.charAt(0).toUpperCase()}
									</div>
								)}
								<div>
									<div className="mb-1 font-medium text-foreground">{review.author_name}</div>
									<StarRating stars={review.stars} />
								</div>
							</div>
							{review.created_at && (
								<span className="text-xs text-muted-foreground whitespace-nowrap">
									{formatDate(review.created_at)}
								</span>
							)}
						</div>
						<p className="text-sm leading-relaxed text-muted-foreground">{review.content}</p>
						</div>
					);
				})}
			</div>
		</section>
	);
}

