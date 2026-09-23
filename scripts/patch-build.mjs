import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const distDir = path.join(projectRoot, 'dist');
const appDir = path.join(projectRoot, 'app');

console.log('🔧 Running post-build patch for Node.js ESM MongoDB compatibility...');

// 1. Patch dist/server/index.mjs to inject createRequire globally at the very top
const indexMjsPath = path.join(distDir, 'server', 'index.mjs');
if (fs.existsSync(indexMjsPath)) {
  let content = fs.readFileSync(indexMjsPath, 'utf8');
  const requirePolyfill = `import { createRequire as __createRequire } from "node:module";\nif (typeof globalThis.require === "undefined") { globalThis.require = __createRequire(import.meta.url); }\n`;
  if (!content.includes('__createRequire')) {
    content = requirePolyfill + content;
    fs.writeFileSync(indexMjsPath, content, 'utf8');
    console.log('✅ Injected global require polyfill into dist/server/index.mjs');
  }
}

// 2. Patch dist/server/_libs/mongodb.mjs
const mongodbMjsPath = path.join(distDir, 'server', '_libs', 'mongodb.mjs');
if (fs.existsSync(mongodbMjsPath)) {
  let content = fs.readFileSync(mongodbMjsPath, 'utf8');

  // Add crypto import at top if missing
  if (!content.includes('import nodeCryptoBuiltin from "node:crypto";')) {
    content = 'import nodeCryptoBuiltin from "node:crypto";\n' + content;
  }

  // Replace require("crypto") with nodeCryptoBuiltin
  if (content.includes('nodeCrypto = require("crypto");')) {
    content = content.replace(
      'nodeCrypto = require("crypto");',
      'nodeCrypto = nodeCryptoBuiltin || (typeof require !== "undefined" ? require("crypto") : globalThis.require("crypto"));'
    );
    console.log('✅ Replaced dynamic require("crypto") with static import in mongodb.mjs');
  }

  fs.writeFileSync(mongodbMjsPath, content, 'utf8');
}

// 3. Sync to app/ folder
console.log('📦 Syncing fresh build to app/ folder...');
if (!fs.existsSync(appDir)) {
  fs.mkdirSync(appDir, { recursive: true });
}

// Copy dist to app/dist
fs.cpSync(distDir, path.join(appDir, 'dist'), { recursive: true, force: true });
console.log('✅ Copied dist to app/dist');

// Copy package.json, package-lock.json, and .env
const filesToSync = ['package.json', 'package-lock.json', '.env'];
for (const file of filesToSync) {
  const src = path.join(projectRoot, file);
  const dest = path.join(appDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`✅ Copied ${file} to app/`);
  }
}

console.log('🎉 App folder is 100% prepared and ready for MilesWeb deployment!');
