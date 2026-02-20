// @ts-check

/** @type {import('next').NextConfig} */
const nextConfig = {
	/* config options here */
	reactCompiler: true,
	cacheComponents: true,
	experimental: {
		typedEnv: true,
	},
	images: {
		// Use Next.js optimizer to serve modern formats and responsive sizes.
		formats: ["image/avif", "image/webp"],
		minimumCacheTTL: 60 * 60 * 24 * 30,
		// Next.js 16 requires explicit quality allowlist for non-75 values.
		qualities: [35, 40, 45, 55, 60, 75, 80, 85],
		// Keep generated srcset variants tight to avoid unnecessary heavy transforms.
		deviceSizes: [360, 640, 768, 1024, 1280],
		imageSizes: [64, 80, 96, 128, 256, 384],
		remotePatterns: [
			{ hostname: "*.blob.vercel-storage.com" },
			{
				protocol: "https",
				hostname: "*.supabase.co",
			},
			{
				protocol: "https",
				hostname: "*.supabase.in",
			},
		],
	},
};

export default nextConfig;
