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
		<div className="inline-flex flex-col gap-1">
			<span className="text-3xl font-bold text-foreground">{currentFormatted}</span>
			<span className="text-lg line-through font-normal" style={{ color: "#A0A0A0" }}>{originalFormatted}</span>
		</div>
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
		<div className="inline-flex flex-col gap-1">
			<span className="text-3xl font-bold text-foreground">
				{minFormatted} - {maxFormatted}
			</span>
			<span className="text-lg line-through font-normal" style={{ color: "#A0A0A0" }}>
				{minOriginalFormatted} - {maxOriginalFormatted}
			</span>
		</div>
	);
}

export { currency, locale };
