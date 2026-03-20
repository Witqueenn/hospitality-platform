/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  transpilePackages: [
    "@repo/api",
    "@repo/db",
    "@repo/shared",
    "@repo/agents",
    "@repo/queue",
    "@repo/email",
  ],
  experimental: {
    serverActions: { allowedOrigins: ["localhost:3000"] },
    instrumentationHook: true,
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  webpack(config) {
    // Allow webpack to resolve .js imports to .ts source files in transpiled packages
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js"],
      ".jsx": [".tsx", ".jsx"],
    };
    return config;
  },
};

export default nextConfig;
