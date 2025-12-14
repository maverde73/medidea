import type { OpenNextConfig } from "@opennextjs/cloudflare";

const config: OpenNextConfig = {
  default: {
    // Override the default lambda handler
    override: {
      wrapper: "cloudflare-node",
      converter: "edge",
      proxyExternalRequest: "fetch",
      // Use incremental cache for better performance
      incrementalCache: "dummy",
      // Use fetch cache for API routes
      tagCache: "dummy",
      // Queue configuration
      queue: "dummy",
    },
  },

  // External packages to bundle with edge runtime
  edgeExternals: ["node:crypto"],

  // Middleware configuration
  middleware: {
    external: true,
    override: {
      wrapper: "cloudflare-edge",
      converter: "edge",
      proxyExternalRequest: "fetch",
      incrementalCache: "dummy",
      tagCache: "dummy",
      queue: "dummy",
    },
  },
};

export default config;
