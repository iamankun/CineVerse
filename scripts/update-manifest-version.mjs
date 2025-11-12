import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read package.json to get version
const packageJsonPath = path.join(__dirname, '..', 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
const version = packageJson.version;

// Read manifest.json
const manifestPath = path.join(__dirname, '..', 'public', 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));

// Add version to manifest
manifest.version = version;

// Add version query param to all icon URLs for cache busting
if (manifest.icons && Array.isArray(manifest.icons)) {
  manifest.icons = manifest.icons.map((icon) => {
    // Remove existing version param if any
    const baseSrc = icon.src.split('?')[0];
    return {
      ...icon,
      src: `${baseSrc}?v=${version}`,
    };
  });
}

// Write updated manifest
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

console.log(`✅ Manifest updated with version ${version}`);
console.log(`✅ Added cache busting to ${manifest.icons.length} icons`);
