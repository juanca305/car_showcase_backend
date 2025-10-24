// scripts/seed-images.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Car from '../models/Car.js';
import cloudinary from '../utils/cloudinaryConfig.js';
import fs from 'fs';
import path from 'path';

dotenv.config();

const IMAGES_DIR = path.join(process.cwd(), 'scripts', 'images');
const ALLOWED_ANGLES = ['main', 'front', 'rear', 'roof'];

/**
 * Simple slugify to match folder naming.
 * Converts "BMW 3 Series" -> "bmw-3-series"
 * Then we append -year if desired by the sample data slug.
 */
function slugifyString(s) {
  return s
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')   // remove invalid chars
    .trim()
    .replace(/\s+/g, '-')           // replace spaces with -
    .replace(/-+/g, '-');           // collapse multiple -
}

// Define the cars you want seeded.
// Important: each car should have a slug property that matches the folder name in scripts/images
const sampleCars = [
  {
    make: 'Toyota', model: 'Corolla', year: 2022, color: 'White',
    seats: 5, fuelType: 'Gasoline', transmission: 'Automatic',
    pricePerDay: 45, features: ['Bluetooth', 'Air Conditioning'],
    // slug must match folder name exactly; if you named folder "toyota-corolla-2022" use that
    slug: 'toyota-corolla-2022'
  },
  {
    make: 'Honda', model: 'Civic', year: 2021, color: 'Red',
    seats: 5, fuelType: 'Gasoline', transmission: 'Automatic',
    pricePerDay: 50, slug: 'honda-civic-2021'
  },
  {
    make: 'Ford', model: 'Focus', year: 2019, color: 'Blue',
    seats: 5, fuelType: 'Diesel', transmission: 'Manual',
    pricePerDay: 38, slug: 'ford-focus-2019'
  },
  {
    make: 'Chevrolet', model: 'Cruze', year: 2020, color: 'Black',
    seats: 5, fuelType: 'Gasoline', transmission: 'Automatic',
    pricePerDay: 42, slug: 'chevrolet-cruze-2020'
  },
  {
    make: 'BMW', model: '3 Series', year: 2022, color: 'Silver',
    seats: 5, fuelType: 'Gasoline', transmission: 'Automatic',
    pricePerDay: 95, slug: 'bmw-3series-2022'
  },
  {
    make: 'Tesla', model: 'Model 3', year: 2023, color: 'White',
    seats: 5, fuelType: 'Electric', transmission: 'Automatic',
    pricePerDay: 120, slug: 'tesla-model3-2023'
  }
];

async function uploadImagesForFolder(folderName) {
  const folderPath = path.join(IMAGES_DIR, folderName);
  if (!fs.existsSync(folderPath)) {
    console.warn(`  → Folder not found: ${folderPath}`);
    return []; // no images
  }

  const files = fs.readdirSync(folderPath).filter(f => /\.(png|jpe?g)$/i.test(f));
  if (!files.length) {
    console.warn(`  → No image files found in: ${folderPath}`);
    return [];
  }

  const images = [];

  // Upload one by one (sequential) to keep control and avoid rate issues
  for (const file of files) {
    const angleName = path.parse(file).name.toLowerCase(); // e.g., "main"

    if (!ALLOWED_ANGLES.includes(angleName)) {
      console.log(`  - Skipping file (angle not recognized): ${file}`);
      continue;
    }

    const localFilePath = path.join(folderPath, file);
    console.log(`  - Uploading ${localFilePath} as angle="${angleName}"...`);

    try {
      const uploaded = await cloudinary.uploader.upload(localFilePath, {
        folder: `car_showcase/${folderName}`,   // organized in Cloudinary
        use_filename: true,
        unique_filename: false,
        overwrite: true,
        resource_type: 'image'
      });

      images.push({ url: uploaded.secure_url, angle: angleName });
      console.log(`    → uploaded: ${uploaded.secure_url}`);
    } catch (err) {
      console.error(`    ! upload failed for ${localFilePath}:`, err.message || err);
    }
  }

  // Sort images so 'main' comes first then front/rear/roof (optional)
  images.sort((a, b) => ALLOWED_ANGLES.indexOf(a.angle) - ALLOWED_ANGLES.indexOf(b.angle));

  return images;
}

async function seed() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {});

    console.log('Connected. Clearing existing Car documents (this is destructive)...');
    await Car.deleteMany({});

    for (const car of sampleCars) {
      const folderName = car.slug || slugifyString(`${car.make}-${car.model}-${car.year}`);
      console.log(`Processing car: ${car.make} ${car.model} (${folderName})`);

      // upload images if the folder exists and files present
      const images = await uploadImagesForFolder(folderName);

      // attach images and slug to car object
      const doc = {
        ...car,
        images,     // may be empty array if upload failed or folder missing
        slug: folderName
      };

      // Insert the car document
      const created = await Car.create(doc);
      console.log(`  → Inserted car _id=${created._id}, images=${images.length}`);
    }

    console.log('Done seeding. Exiting.');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err);
    process.exit(1);
  }
}

seed();
