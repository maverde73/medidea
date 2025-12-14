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
    // Cloudflare Pages ASSETS binding
    if (env.ASSETS) {
      try {
        const url = new URL(request.url);
        // Only try to fetch assets for static paths to avoid overhead
        // or just try for everything. 
        // Trying for everything is safer for 404 handling (if a file exists, serve it).
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
