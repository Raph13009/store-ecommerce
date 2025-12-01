"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

type Variant = {
	id: string;
	price: string;
	images: string[];
	name: string;
	stock: number;
	attributes?: Record<string, string> | null;
};

type SimpleVariantSelectorProps = {
	variants: Variant[];
	selectedVariantId: string | undefined;
	onVariantSelect: (variantId: string) => void;
};

/**
 * Find the best variant ID for a given attribute value
 * Prefers variants with stock > 0, otherwise returns the first matching variant
 */
function findBestVariantId(
	variants: Variant[],
	attributeKey: string,
	attributeValue: string,
): string | undefined {
	// First, try to find a variant with stock using the given key
	let inStockVariant = variants.find((v) => v.attributes?.[attributeKey] === attributeValue && v.stock > 0);
	if (inStockVariant) return inStockVariant.id;

	// If key is "Taille", also try "Size" or "size" (and vice versa) for compatibility
	const isSizeKey = attributeKey.toLowerCase() === "size" || attributeKey === "Taille";
	if (isSizeKey) {
		// Try all possible size key variations
		for (const key of ["Size", "size", "Taille"]) {
			if (key !== attributeKey) {
				inStockVariant = variants.find((v) => v.attributes?.[key] === attributeValue && v.stock > 0);
				if (inStockVariant) return inStockVariant.id;
			}
		}
	}

	// Fallback to any variant with this attribute value (even if out of stock)
	let fallbackVariant: Variant | undefined = variants.find(
		(v) => v.attributes?.[attributeKey] === attributeValue,
	);
	if (fallbackVariant) return fallbackVariant.id;

	// Try alternative keys for size
	if (isSizeKey) {
		for (const key of ["Size", "size", "Taille"]) {
			if (key !== attributeKey) {
				fallbackVariant = variants.find((v) => v.attributes?.[key] === attributeValue);
				if (fallbackVariant) return fallbackVariant.id;
			}
		}
	}

	return undefined;
}

/**
 * Extract unique attribute values from variants
 * For example, if variants have {"Taille": "S"}, {"Taille": "M"}, {"Taille": "L"}
 * Returns: { "Taille": [{ value: "S", variantIds: [...], maxStock: 10 }, ...] }
 */
function extractAttributeGroups(
	variants: Variant[],
): Record<string, Array<{ value: string; variantIds: string[]; maxStock: number }>> {
	const groups: Record<string, Array<{ value: string; variantIds: string[]; maxStock: number }>> = {};

	for (const variant of variants) {
		if (!variant.attributes || Object.keys(variant.attributes).length === 0) {
			continue;
		}

		// Take the first attribute (most common case: one attribute like "Taille" or "Size")
		let [attributeKey, attributeValue] = Object.entries(variant.attributes)[0];

		// Translate "Size" or "size" to "Taille" for French display
		if (attributeKey.toLowerCase() === "size") {
			attributeKey = "Taille";
		}

		if (!groups[attributeKey]) {
			groups[attributeKey] = [];
		}

		// Find or create the option for this attribute value
		let option = groups[attributeKey].find((item) => item.value === attributeValue);

		if (!option) {
			option = {
				value: attributeValue,
				variantIds: [],
				maxStock: 0,
			};
			groups[attributeKey].push(option);
		}

		// Add this variant ID to the list
		option.variantIds.push(variant.id);
		// Track the maximum stock for this attribute value
		if (variant.stock > option.maxStock) {
			option.maxStock = variant.stock;
		}
	}

	// Sort values naturally (S, M, L or 1, 2, 3, etc.)
	for (const key in groups) {
		groups[key].sort((a, b) => {
			// Try to sort as numbers first
			const numA = Number.parseInt(a.value, 10);
			const numB = Number.parseInt(b.value, 10);
			if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
				return numA - numB;
			}
			// Otherwise sort alphabetically
			return a.value.localeCompare(b.value);
		});
	}

	return groups;
}

export function SimpleVariantSelector({
	variants,
	selectedVariantId,
	onVariantSelect,
}: SimpleVariantSelectorProps) {
	const attributeGroups = useMemo(() => extractAttributeGroups(variants), [variants]);

	// Only show if we have more than one variant
	if (variants.length <= 1) {
		return null;
	}

	// If we have attributes, use them
	if (Object.keys(attributeGroups).length > 0) {
		// Get the first attribute group (most common: one attribute like "Taille")
		const rawKey = Object.keys(attributeGroups)[0];
		// Always display as "Taille" for French (handle "Size", "size", or any case variation)
		const isSizeAttribute = rawKey.toLowerCase() === "size" || rawKey === "Taille";
		const displayKey = isSizeAttribute ? "Taille" : rawKey;
		// Get options from the group (extractAttributeGroups already translates "Size" to "Taille")
		const options = attributeGroups[rawKey];

		if (options && options.length > 0) {
			// Find which option is currently selected
			const selectedOption = options.find((opt) => opt.variantIds.includes(selectedVariantId ?? ""));
			const selectedValue = selectedOption?.value;

			const handleOptionClick = (value: string) => {
				// Use original attribute key for lookup (might be "Size" in DB, but we display as "Taille")
				// Try both "Size" and "Taille" to find the variant
				const variantWithAttributes = variants.find(
					(v) => v.attributes && Object.keys(v.attributes).length > 0,
				);
				const originalKey = variantWithAttributes
					? Object.keys(variantWithAttributes.attributes ?? {})[0]
					: rawKey;
				const bestVariantId = findBestVariantId(variants, originalKey, value);
				if (bestVariantId) {
					onVariantSelect(bestVariantId);
				}
			};

			return (
				<div className="space-y-3">
					<div className="flex items-center">
						<span className="text-sm font-medium text-foreground">{displayKey}</span>
					</div>
					<div className="flex flex-wrap gap-2">
						{options.map((option) => {
							const isSelected = option.variantIds.includes(selectedVariantId ?? "");
							const isOutOfStock = option.maxStock === 0;

							return (
								<button
									key={option.value}
									type="button"
									onClick={() => !isOutOfStock && handleOptionClick(option.value)}
									disabled={isOutOfStock}
									className={cn(
										"min-w-[48px] h-12 px-4 rounded-lg border-2 text-sm font-medium transition-all duration-200",
										isSelected
											? "border-foreground bg-foreground text-primary-foreground"
											: "border-border bg-background text-foreground hover:border-foreground/50",
										isOutOfStock &&
											"opacity-50 cursor-not-allowed border-muted bg-muted text-muted-foreground",
									)}
									aria-label={`${displayKey}: ${option.value}`}
									title={isOutOfStock ? "Stock épuisé" : option.value}
								>
									<span className={cn(isOutOfStock && "line-through")}>{option.value}</span>
								</button>
							);
						})}
					</div>
				</div>
			);
		}
	}

	// Fallback: if no attributes, show variants by name
	// This is useful when variants don't have attributes but we still want to show a selector
	const selectedVariant = variants.find((v) => v.id === selectedVariantId);
	const selectedVariantName = selectedVariant?.name;

	return (
		<div className="space-y-3">
			<div className="flex items-center">
				<span className="text-sm font-medium text-foreground">Variante</span>
			</div>
			<div className="flex flex-wrap gap-2">
				{variants.map((variant) => {
					const isSelected = variant.id === selectedVariantId;
					const isOutOfStock = variant.stock === 0;

					return (
						<button
							key={variant.id}
							type="button"
							onClick={() => !isOutOfStock && onVariantSelect(variant.id)}
							disabled={isOutOfStock}
							className={cn(
								"min-w-[48px] h-12 px-4 rounded-lg border-2 text-sm font-medium transition-all duration-200",
								isSelected
									? "border-foreground bg-foreground text-primary-foreground"
									: "border-border bg-background text-foreground hover:border-foreground/50",
								isOutOfStock && "opacity-50 cursor-not-allowed border-muted bg-muted text-muted-foreground",
							)}
							aria-label={`Variante: ${variant.name}`}
							title={isOutOfStock ? "Stock épuisé" : variant.name}
						>
							<span className={cn(isOutOfStock && "line-through")}>{variant.name}</span>
						</button>
					);
				})}
			</div>
		</div>
	);
}
