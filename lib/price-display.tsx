import { formatMoney as formatMoneyBase } from "@/lib/money";

const currency = "EUR";
const locale = "fr-FR";

// Re-export formatMoney for convenience
export const formatMoney = formatMoneyBase;

/**
 * Calculate original price (300% higher than current price)
 */
export function calculateOriginalPrice(currentPrice: bigint | number): bigint {
	const current = typeof currentPrice === "bigint" ? currentPrice : BigInt(currentPrice);
	// Original price = current price * 4.00
	return (current * BigInt(400)) / BigInt(100);
}

/**
 * Format price with original price display
 */
export function formatPriceWithOriginal(amount: bigint | number) {
	const current = typeof amount === "bigint" ? amount : BigInt(amount);
	const original = calculateOriginalPrice(current);
	const currentFormatted = formatMoney({ amount: current, currency, locale });
	const originalFormatted = formatMoney({ amount: original, currency, locale });

	return (
		<span className="inline-flex items-baseline gap-2">
			<span className="font-semibold">{currentFormatted}</span>
			<small className="text-muted-foreground line-through text-sm font-normal">{originalFormatted}</small>
		</span>
	);
}

/**
 * Format price range with original prices
 */
export function formatPriceRangeWithOriginal(minPrice: bigint, maxPrice: bigint) {
	const minOriginal = calculateOriginalPrice(minPrice);
	const maxOriginal = calculateOriginalPrice(maxPrice);
	const minFormatted = formatMoney({ amount: minPrice, currency, locale });
	const maxFormatted = formatMoney({ amount: maxPrice, currency, locale });
	const minOriginalFormatted = formatMoney({ amount: minOriginal, currency, locale });
	const maxOriginalFormatted = formatMoney({ amount: maxOriginal, currency, locale });

	if (minPrice === maxPrice) {
		return formatPriceWithOriginal(minPrice);
	}

	return (
		<span className="inline-flex items-baseline gap-2">
			<span className="font-semibold">
				{minFormatted} - {maxFormatted}
			</span>
			<small className="text-muted-foreground line-through text-sm font-normal">
				{minOriginalFormatted} - {maxOriginalFormatted}
			</small>
		</span>
	);
}

export { currency, locale };
