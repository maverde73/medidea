const fs = require('fs');
const path = require('path');

const workerDir = path.join(process.cwd(), '.open-next');
const workerPath = path.join(workerDir, 'worker.js');
const originalWorkerPath = path.join(workerDir, 'original-worker.js');

if (!fs.existsSync(workerPath)) {
  console.error('Worker file not found:', workerPath);
  process.exit(1);
}

// Rename the generated worker
fs.renameSync(workerPath, originalWorkerPath);

// Create the wrapper
const wrapperContent = `
import worker from "./original-worker.js";

export default {
  async fetch(request, env, ctx) {
    // Cloudflare Pages ASSETS binding - only for GET/HEAD requests
    if (env.ASSETS && (request.method === "GET" || request.method === "HEAD")) {
      try {
        const asset = await env.ASSETS.fetch(request);
        if (asset.status !== 404) {
          return asset;
        }
      } catch (e) {
        // Ignore error and fall back to worker
      }
    }

    return worker.fetch(request, env, ctx);
  }
};
`;

fs.writeFileSync(workerPath, wrapperContent);
console.log('Worker patched successfully.');
