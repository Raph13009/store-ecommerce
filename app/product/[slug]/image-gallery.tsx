"use client";

import { ArrowLeft, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ImageGalleryProps = {
	images: string[];
	productName: string;
};

export function ImageGallery({ images, productName }: ImageGalleryProps) {
	const router = useRouter();
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [isZoomed, setIsZoomed] = useState(false);
	const [isMainImageLoaded, setIsMainImageLoaded] = useState(false);

	const selectedImage = images[selectedIndex];

	const handlePrevious = () => {
		setIsMainImageLoaded(false);
		setSelectedIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
	};

	const handleNext = () => {
		setIsMainImageLoaded(false);
		setSelectedIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
	};

	if (images.length === 0) {
		return (
			<div className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
				<button
					type="button"
					onClick={() => router.back()}
					className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2 group"
					aria-label="Retour"
				>
					<ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
					<span className="font-medium">Retour</span>
				</button>
				<div className="aspect-square bg-secondary rounded-2xl flex items-center justify-center">
					<p className="text-muted-foreground">Aucune image disponible</p>
				</div>
			</div>
		);
	}

	return (
		<div className="flex flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
			{/* Back Button - Modern arrow above image */}
			<button
				type="button"
				onClick={() => router.back()}
				className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2 group"
				aria-label="Retour"
			>
				<ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
				<span className="font-medium">Retour</span>
			</button>

			{/* Main Image */}
			<div className="group relative aspect-square overflow-hidden rounded-2xl bg-secondary">
				{!isMainImageLoaded && (
					<div className="absolute inset-0 z-10 animate-pulse bg-muted/60" aria-hidden />
				)}
				<Image
					src={selectedImage}
					alt={`${productName} - Vue ${selectedIndex + 1}`}
					fill
					sizes="(max-width: 1024px) 100vw, 50vw"
					quality={60}
					className={cn(
						"object-cover transition-all duration-500 group-hover:brightness-110",
						!isMainImageLoaded && "opacity-0",
						isZoomed && "scale-150 cursor-zoom-out",
					)}
					onLoad={() => setIsMainImageLoaded(true)}
					onClick={() => setIsZoomed(!isZoomed)}
					priority
				/>

				{/* Navigation Arrows */}
				{images.length > 1 && (
					<div className="absolute inset-x-4 top-1/2 flex -translate-y-1/2 justify-between opacity-0 transition-opacity group-hover:opacity-100">
						<Button
							variant="secondary"
							size="icon"
							className="h-10 w-10 rounded-full bg-background/90 shadow-lg backdrop-blur-sm hover:bg-background"
							onClick={(e) => {
								e.stopPropagation();
								handlePrevious();
							}}
						>
							<ChevronLeft className="h-5 w-5" />
						</Button>
						<Button
							variant="secondary"
							size="icon"
							className="h-10 w-10 rounded-full bg-background/90 shadow-lg backdrop-blur-sm hover:bg-background"
							onClick={(e) => {
								e.stopPropagation();
								handleNext();
							}}
						>
							<ChevronRight className="h-5 w-5" />
						</Button>
					</div>
				)}

				{/* Zoom Indicator */}
				<div className="absolute bottom-4 right-4 opacity-0 transition-opacity group-hover:opacity-100">
					<div className="flex items-center gap-2 rounded-full bg-background/90 px-3 py-1.5 text-xs font-medium backdrop-blur-sm">
						<ZoomIn className="h-3.5 w-3.5" />
						Cliquer pour zoomer
					</div>
				</div>

				{/* Image Counter */}
				{images.length > 1 && (
					<div className="absolute bottom-4 left-4 rounded-full bg-background/90 px-3 py-1.5 text-xs font-medium backdrop-blur-sm">
						{selectedIndex + 1} / {images.length}
					</div>
				)}
			</div>

			{/* Thumbnails */}
			{images.length > 1 && (
				<div className="flex gap-3 overflow-x-auto p-2 -m-2">
					{images.map((image, index) => (
						<button
							key={image}
							type="button"
							onClick={() => {
								setIsMainImageLoaded(false);
								setSelectedIndex(index);
							}}
							className={cn(
								"relative aspect-square w-20 shrink-0 overflow-hidden rounded-lg transition-all duration-200",
								selectedIndex === index
									? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
									: "opacity-60 hover:opacity-100",
							)}
						>
							<Image
								src={image}
								alt={`${productName} miniature ${index + 1}`}
								fill
								sizes="80px"
								quality={40}
								loading="lazy"
								className="object-cover transition-all duration-300 hover:brightness-110"
							/>
						</button>
					))}
				</div>
			)}
		</div>
	);
}
