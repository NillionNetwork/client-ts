/** @type {import("next").NextConfig} */
const nextConfig = {
  transpilePackages: [
    "@nillion/client-core",
    "@nillion/client-react-hooks",
    "@nillion/client-vms",
  ],
  webpack: (
    config,
    { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack },
  ) => {
    config.resolve.fallback = {
      crypto: false,
      stream: false,
      buffer: false,
      vm: false,
    };

    config.module.rules.push({
      test: /\.wasm$/,
      type: "asset/resource",
    });

    return config;
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        ],
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/nilchain",
        destination: "http://127.0.0.1:48102/",
      },
    ];
  },
};

export default nextConfig;
