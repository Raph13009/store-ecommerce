"use client";

import { useEffect, useState } from "react";

type PromotionalBannerProps = {
	discountPercentage?: number;
};

/**
 * Calculate discount percentage based on the pricing logic
 * If original price is 60% higher than current price:
 * - Original = Current * 1.60
 * - The discount displayed is up to 60% off the original price
 */
function calculateDiscountPercentage(): number {
	// The promotion goes up to 60% discount
	return 60;
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
			className={`relative w-full bg-gradient-to-r from-[#2c2c2c] to-[#1a1a1a] border-b border-[#3a3a3a] transition-all duration-700 ease-out ${
				isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
			}`}
			style={{ height: "48px" }}
		>
			<div className="max-w-7xl mx-auto h-full px-4 sm:px-6 lg:px-8 flex items-center justify-center">
				<p className="text-sm sm:text-base text-white font-medium tracking-wide text-center leading-relaxed">
					<span className="font-semibold">LIQUIDATION TOTALE</span> – jusqu'à{" "}
					<span className="font-bold text-[#f5e6d3]">{Math.round(percentage)}%</span> de réduction
				</p>
			</div>
		</div>
	);
}
