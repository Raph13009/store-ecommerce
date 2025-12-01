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
		remotePatterns: [
			{ hostname: "*.blob.vercel-storage.com" },
			{ hostname: "*.supabase.co" }, // Supabase Storage
			{ hostname: "*.supabase.in" }, // Supabase Storage (India region)
		],
	},
};

export default nextConfig;
