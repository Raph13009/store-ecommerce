/**
 * Extract product category from product name
 * Categories: Bracelet, Collier, Bague
 */
export type ProductCategory = "Bracelet" | "Collier" | "Bague" | null;

export function getProductCategory(productName: string): ProductCategory {
	const name = productName.toLowerCase();

	if (name.includes("bracelet")) {
		return "Bracelet";
	}
	if (name.includes("collier")) {
		return "Collier";
	}
	if (name.includes("bague")) {
		return "Bague";
	}

	return null;
}

export const CATEGORIES: ProductCategory[] = ["Bracelet", "Collier", "Bague"];



