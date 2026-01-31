import fs from 'fs';
import path from 'path';
import sharp from 'sharp'; // For image resizing
import exifr from 'exifr'; // For EXIF GPS extraction

const IMAGES_DIR = path.join(process.cwd(), 'public/images');
const THUMBS_DIR = path.join(IMAGES_DIR, 'thumbs');
const OUTPUT_FILE = path.join(process.cwd(), 'public/photos.json');

// Ensure thumbnails directory exists
if (!fs.existsSync(THUMBS_DIR)) {
  fs.mkdirSync(THUMBS_DIR, { recursive: true });
}

async function generate() {
  console.log('📸 Starting photo map generation...');
  
  // Get all images in public/images (excluding the thumbs directory)
  const files = fs.readdirSync(IMAGES_DIR).filter(file => {
    return /\.(jpg|jpeg|png|webp)$/i.test(file);
  });

  const photos = [];

  for (const file of files) {
    const originalPath = path.join(IMAGES_DIR, file);
    const thumbPath = path.join(THUMBS_DIR, file);
    
    // Web paths for the JSON file
    const srcWebPath = `/images/${file}`;
    const thumbWebPath = `/images/thumbs/${file}`;

    try {
      // 1. Generate Thumbnail if it doesn't exist
      if (!fs.existsSync(thumbPath)) {
        console.log(`Creating thumbnail for: ${file}`);
        await sharp(originalPath)
          .rotate() // <--- FIXED: Auto-rotate based on EXIF before resizing
          .resize(200, 200, { fit: 'cover' }) 
          .toFile(thumbPath);
      }

      // 2. Extract GPS Data
      const gps = await exifr.gps(originalPath);
      
      if (gps && gps.latitude && gps.longitude) {
        photos.push({
          id: file,
          src: srcWebPath,
          thumb: thumbWebPath,
          lat: gps.latitude,
          lng: gps.longitude
        });
        console.log(`✅ Processed: ${file}`);
      } else {
        console.warn(`⚠️ Skipped (No GPS): ${file}`);
      }

    } catch (err) {
      console.error(`❌ Error processing ${file}:`, err.message);
    }
  }

  // 3. Write JSON Output
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(photos, null, 2));
  console.log(`\n🎉 Done! Generated map data for ${photos.length} photos.`);
  console.log(`Saved to: ${OUTPUT_FILE}`);
}

generate();