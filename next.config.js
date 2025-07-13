const path = require("path");

const nextConfig = {
  reactStrictMode: false,
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" },
          {
            key: "Access-Control-Allow-Methods",
            value: "GET,DELETE,PATCH,POST,PUT",
          },
          {
            key: "Access-Control-Allow-Headers",
            value:
              "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
          },
        ],
      },
      {
        source: "/firebase-messaging-sw.js",
        headers: [
          {
            key: "Service-Worker-Allowed",
            value: "/",
          },
        ],
      },
    ];
  },
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add the new externals
    config.externals = [
      ...(config.externals || []),
      "pino-pretty",
      "lokijs",
      "encoding",
      "uint8arrays",
    ];

    if (!isServer) {
      config.output.environment = {
        ...config.output.environment,
        asyncFunction: true,
      };
    }

    // Existing webpack configurations
    try {
      require("canvas");
    } catch (e) {
      if (e.code === "MODULE_NOT_FOUND") {
        config.resolve.alias.canvas = false;
      }
    }

    // Exclude the validator folder from the build process
    config.module.rules.push({
      test: /\.(js|jsx|ts|tsx)$/,
      exclude: [path.resolve(__dirname, "validator")],
    });

    // Exclude the specific route from the build process
    config.module.rules.push({
      test: /\.(js|jsx|ts|tsx)$/,
      exclude: [
        path.resolve(__dirname, "pages/api/nyc_open_data/rate_sightings"),
      ],
    });

    // Update the rule for handling .worker.ts files with worker-loader
    config.module.rules.push({
      test: /\.worker\.ts$/,
      loader: "worker-loader",
      options: {
        filename: "static/[hash].worker.js",
        publicPath: "/_next/",
      },
    });

    // Configure Next.js to use @svgr/webpack
    config.module.rules.push({
      test: /\.svg$/,
      use: ["@svgr/webpack"],
    });

    // Add watch options from the second webpack config
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ["**/not-needed/**"],
    };

    return config;
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.istockphoto.com",
      },
      {
        protocol: "https",
        hostname: "via.placeholder.com",
      },
      {
        protocol: "https",
        hostname: "i.imgur.com",
      },
      {
        protocol: "https",
        hostname: "i.pinimg.com",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "ipfs.io",
      },
      {
        protocol: "https",
        hostname: "pbs.twimg.com",
      },
      {
        protocol: "https",
        hostname: "cdn.vectorstock.com",
      },
    ],
  },

  experimental: {
    serverActions: {
      bodySizeLimit: "500mb",
    },
  },

  typescript: {
    ignoreBuildErrors: false,
  },
};

const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer(nextConfig);
