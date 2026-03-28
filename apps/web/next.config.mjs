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
    serverActions: {
      allowedOrigins: ["localhost:3000", "localhost:3001", "localhost:3002"],
    },
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
  webpack(config, { isServer }) {
    // Allow webpack to resolve .js imports to .ts source files in transpiled packages
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js"],
      ".jsx": [".tsx", ".jsx"],
    };
    if (isServer) {
      // Map node: URI scheme to plain built-in names that webpack handles natively
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : []),
        ({ request }, callback) => {
          if (request?.startsWith("node:")) {
            return callback(null, `commonjs ${request.slice(5)}`);
          }
          callback();
        },
      ];
    } else {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        crypto: false,
        stream: false,
        buffer: false,
      };
    }
    return config;
  },
};

export default nextConfig;
