import fs from 'node:fs';
import path from 'node:path';

const projectRoot = process.cwd();
const distDir = path.join(projectRoot, 'dist');
const appDir = path.join(projectRoot, 'app');

console.log('🔧 Running post-build patch for Node.js ESM MongoDB compatibility & dynamic uploads...');

// 1. Patch dist/server/index.mjs
const indexMjsPath = path.join(distDir, 'server', 'index.mjs');
if (fs.existsSync(indexMjsPath)) {
  let content = fs.readFileSync(indexMjsPath, 'utf8');
  const requirePolyfill = `import { createRequire as __createRequire } from "node:module";\nif (typeof globalThis.require === "undefined") { globalThis.require = __createRequire(import.meta.url); }\n`;
  if (!content.includes('__createRequire')) {
    content = requirePolyfill + content;
    console.log('✅ Injected global require polyfill into dist/server/index.mjs');
  }

  // Patch getAsset & readAsset so runtime uploaded images in /uploads/ are served with 200 OK
  const targetOldAssetHandler = `function readAsset(id) {
  const serverDir = dirname(fileURLToPath(globalThis.__nitro_main__));
  return promises.readFile(resolve(serverDir, assets[id].path));
}
const publicAssetBases = {};
function isPublicAssetURL(id = "") {
  if (assets[id]) {
    return true;
  }
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) {
      return true;
    }
  }
  return false;
}
function getAsset(id) {
  return assets[id];
}`;

  const patchedAssetHandler = `function readAsset(id) {
  const asset = getAsset(id);
  if (asset && asset._fullPath) {
    return promises.readFile(asset._fullPath);
  }
  const serverDir = dirname(fileURLToPath(globalThis.__nitro_main__));
  return promises.readFile(resolve(serverDir, assets[id].path));
}
const publicAssetBases = {};
function isPublicAssetURL(id = "") {
  if (getAsset(id)) {
    return true;
  }
  for (const base in publicAssetBases) {
    if (id.startsWith(base)) {
      return true;
    }
  }
  return false;
}
function getAsset(id) {
  if (assets[id]) return assets[id];
  if (typeof id === "string" && id.startsWith("/uploads/")) {
    try {
      const fsModule = globalThis.require ? globalThis.require("node:fs") : null;
      const pathModule = globalThis.require ? globalThis.require("node:path") : null;
      if (fsModule && pathModule) {
        const serverDir = dirname(fileURLToPath(globalThis.__nitro_main__));
        const filename = id.replace("/uploads/", "");
        const candidates = [
          pathModule.resolve(serverDir, "../client/uploads", filename),
          pathModule.resolve(process.cwd(), "dist/client/uploads", filename),
          pathModule.resolve(process.cwd(), "public/uploads", filename),
          pathModule.resolve(process.cwd(), "uploads", filename),
          pathModule.resolve(process.cwd(), "app/dist/client/uploads", filename),
        ];
        for (const fullPath of candidates) {
          if (fsModule.existsSync(fullPath)) {
            const stat = fsModule.statSync(fullPath);
            const ext = pathModule.extname(fullPath).toLowerCase();
            const mimeTypes = {
              ".jpg": "image/jpeg",
              ".jpeg": "image/jpeg",
              ".png": "image/png",
              ".webp": "image/webp",
              ".gif": "image/gif",
              ".svg": "image/svg+xml",
              ".mp4": "video/mp4",
              ".txt": "text/plain",
            };
            const dynamicAsset = {
              type: mimeTypes[ext] || "application/octet-stream",
              size: stat.size,
              mtime: stat.mtime.toISOString(),
              path: fullPath,
              _fullPath: fullPath,
            };
            assets[id] = dynamicAsset;
            return dynamicAsset;
          }
        }
      }
    } catch (e) {}
  }
  return undefined;
}`;

  if (content.includes(targetOldAssetHandler)) {
    content = content.replace(targetOldAssetHandler, patchedAssetHandler);
    console.log('✅ Patched getAsset & readAsset for dynamic runtime /uploads/ support');
  }

  // Also inject startup sync from MongoDB media collection to disk
  if (!content.includes('__syncMongoMediaToDisk')) {
    const startupSyncCode = `
// Auto-sync uploaded media from MongoDB to local disk on server boot
(async function __syncMongoMediaToDisk() {
  try {
    const { getMongoDb } = await import("./_libs/mongodb.mjs");
    const db = await getMongoDb();
    const mediaDocs = await db.collection("media").find({}).toArray();
    const fsMod = globalThis.require ? globalThis.require("node:fs") : null;
    const pathMod = globalThis.require ? globalThis.require("node:path") : null;
    if (!fsMod || !pathMod || !mediaDocs || mediaDocs.length === 0) return;
    const serverDir = dirname(fileURLToPath(globalThis.__nitro_main__));
    const targetDir = pathMod.resolve(serverDir, "../client/uploads");
    if (!fsMod.existsSync(targetDir)) fsMod.mkdirSync(targetDir, { recursive: true });
    for (const doc of mediaDocs) {
      if (doc.filename && doc.data) {
        const dest = pathMod.join(targetDir, doc.filename);
        if (!fsMod.existsSync(dest)) {
          const buf = doc.data.buffer ? doc.data.buffer : Buffer.from(doc.data);
          fsMod.writeFileSync(dest, buf);
        }
      }
    }
  } catch (e) {}
})();
`;
    content += startupSyncCode;
    console.log('✅ Injected MongoDB media auto-sync to disk into dist/server/index.mjs');
  }

  fs.writeFileSync(indexMjsPath, content, 'utf8');
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
