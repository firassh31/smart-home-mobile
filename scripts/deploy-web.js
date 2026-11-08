#!/usr/bin/env node
/**
 * Copies the Expo web export (dist/) into the web client repo as its /m folder,
 * so the live site serves the latest mobile build.
 *
 * Usage:  npm run deploy:web           (exports, then copies)
 *         node scripts/deploy-web.js   (copies an existing dist/ only)
 *
 * The web client repo is expected at ../Smart_home_client relative to this
 * repo; override with the WEB_CLIENT_DIR environment variable if yours lives
 * somewhere else.
 */
const fs = require('fs');
const path = require('path');

const mobileRoot = path.resolve(__dirname, '..');
const distDir = path.join(mobileRoot, 'dist');
const clientDir = process.env.WEB_CLIENT_DIR
  ? path.resolve(process.env.WEB_CLIENT_DIR)
  : path.resolve(mobileRoot, '..', 'Smart_home_client');
const targetDir = path.join(clientDir, 'm');

if (!fs.existsSync(path.join(distDir, 'index.html'))) {
  console.error(`No web export found at ${distDir}.`);
  console.error('Run "npx expo export --platform web" first, or use "npm run deploy:web".');
  process.exit(1);
}

// Sanity-check the export was built for the /m base path, otherwise assets 404 in production.
const indexHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');
if (!indexHtml.includes('/m/_expo/')) {
  console.error('The export in dist/ was not built with baseUrl "/m" (check experiments.baseUrl in app.json).');
  process.exit(1);
}

if (!fs.existsSync(path.join(clientDir, 'index.html'))) {
  console.error(`Web client repo not found at ${clientDir}.`);
  console.error('Set WEB_CLIENT_DIR to the path of your Smart_home_client checkout.');
  process.exit(1);
}

fs.rmSync(targetDir, { recursive: true, force: true });
fs.cpSync(distDir, targetDir, { recursive: true });

const fileCount = fs.readdirSync(targetDir, { recursive: true }).length;
console.log(`Copied dist/ -> ${targetDir} (${fileCount} entries).`);
console.log('');
console.log('To publish, commit and push the web client repo:');
console.log(`  cd "${clientDir}"`);
console.log('  git add m');
console.log('  git commit -m "Update mobile web build"');
console.log('  git push');
