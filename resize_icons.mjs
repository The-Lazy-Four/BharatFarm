import sharp from 'sharp';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const publicDir = path.join(__dirname, 'client', 'public');
const iconsDir = path.join(publicDir, 'icons');
const sourceIcon = path.join(iconsDir, 'icon-512.png');

const targets = [
    { file: path.join(iconsDir, 'icon-32.png'), size: 32 },
    { file: path.join(iconsDir, 'icon-96.png'), size: 96 },
    { file: path.join(iconsDir, 'icon-144.png'), size: 144 },
    { file: path.join(iconsDir, 'icon-192.png'), size: 192 },
    { file: path.join(iconsDir, 'icon-384.png'), size: 384 },
    { file: path.join(iconsDir, 'icon-512.png'), size: 512 },
    { file: path.join(iconsDir, 'icon-192-maskable.png'), size: 192 },
    { file: path.join(iconsDir, 'icon-512-maskable.png'), size: 512 },
    { file: path.join(iconsDir, 'apple-touch-icon.png'), size: 180 },
    { file: path.join(publicDir, 'favicon.png'), size: 256 },
    { file: path.join(publicDir, 'favicon-16.png'), size: 16 },
    { file: path.join(publicDir, 'logo.png'), size: 512 },
];

async function resizeIcons() {
    console.log('Resizing icons from source:', sourceIcon);
    for (const target of targets) {
        await sharp(sourceIcon)
            .resize(target.size, target.size, { fit: 'cover' })
            .toFile(target.file + '.tmp');

        // Overwrite original
        const fs = await import('fs');
        fs.renameSync(target.file + '.tmp', target.file);
        console.log(`Generated: ${path.relative(publicDir, target.file)} (${target.size}x${target.size})`);
    }
    console.log('All icons successfully updated!');
}

resizeIcons().catch(err => {
    console.error('Error resizing icons:', err);
    process.exit(1);
});
