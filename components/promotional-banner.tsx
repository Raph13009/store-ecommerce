"use client";

import { useEffect, useState } from "react";

type PromotionalBannerProps = {
	discountPercentage?: number;
};

/**
 * Calculate discount percentage based on the pricing logic
 * If original price is 60% higher than current price:
 * - Original = Current * 1.60
 * - Discount = Original - Current = Current * 0.60
 * - Discount % = (0.60 / 1.60) * 100 = 37.5%
 */
function calculateDiscountPercentage(): number {
	// Based on calculateOriginalPrice: original = current * 1.60
	// Discount = (original - current) / original * 100
	// = (current * 1.60 - current) / (current * 1.60) * 100
	// = (current * 0.60) / (current * 1.60) * 100
	// = 0.60 / 1.60 * 100
	// = 37.5%
	return 37.5;
}

export function PromotionalBanner({ discountPercentage }: PromotionalBannerProps) {
	const [isVisible, setIsVisible] = useState(false);
	const percentage = discountPercentage ?? calculateDiscountPercentage();

	useEffect(() => {
		// Trigger animation after component mounts
		const timer = setTimeout(() => {
			setIsVisible(true);
		}, 100);
		return () => clearTimeout(timer);
	}, []);

	return (
		<div
			className={`relative w-full bg-[#faf9f7] border-b border-border/30 transition-all duration-700 ease-out ${
				isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
			}`}
			style={{ height: "44px" }}
		>
			<div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-center">
				<p className="text-xs sm:text-sm text-[#111] font-light tracking-[0.02em] text-center leading-relaxed">
					Liquidation totale – jusqu'à{" "}
					<span className="font-medium">{Math.round(percentage)}%</span> de réduction
				</p>
			</div>
		</div>
	);
}

