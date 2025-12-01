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
		// Disable image optimization for external images to avoid hostname issues
		// This allows all external domains but images won't be optimized by Next.js
		unoptimized: true,
		// Keep remotePatterns for future use if we re-enable optimization
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
