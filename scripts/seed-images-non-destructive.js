// scripts/seed-images-non-destructive.js

/* ---------------------- seed-images-non-destructive.js ---------------------- */
// ✔ This file now REFRESHES images even when the car already exists in MongoDB.
// ✔ DOES NOT delete existing cars.
// ✔ Only updates the "images" field when images are missing or empty.

import mongoose from "mongoose";
import dotenv from "dotenv";
import Car from "../models/Car.js";
import cloudinary from "../utils/cloudinaryConfig.js";
import fs from "fs";
import path from "path";

dotenv.config();

// Folder where car images are stored
const IMAGES_DIR = path.join(process.cwd(), "scripts", "images");
const ALLOWED_ANGLES = ["main", "front", "rear", "roof"];

function getSalePrice(pricePerDay, condition) {
  if (!pricePerDay) return 0;

  return condition === "new" ? pricePerDay * 400 : pricePerDay * 300;
}

function getDefaultLocation() {
  return {
    branch: "West Kendall",
  };
}

function getConditionFromYear(year) {
  const CURRENT_YEAR = new Date().getFullYear();
  return year >= CURRENT_YEAR - 1 ? "new" : "used";
}

function getCertifiedFlag(condition) {
  return condition === "used";
}

// Simple slugify to match folder naming
function slugifyString(s) {
  return s
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

// Your 10 new cars list
const sampleCars = [
  {
    make: "Toyota",
    model: "RAV4",
    year: 2023,
    color: "White",
    seats: 5,
    fuelType: "Gasoline",
    transmission: "Automatic",
    pricePerDay: 70,
    features: ["Bluetooth", "Air Conditioning"],
    category: "SUV",
    slug: "toyota-rav4-2023",
  },
  {
    make: "Honda",
    model: "Accord",
    year: 2022,
    color: "Black",
    seats: 5,
    fuelType: "Gasoline",
    transmission: "Automatic",
    pricePerDay: 65,
    features: ["Leather Seats", "Bluetooth"],
    category: "Sedan",
    slug: "honda-accord-2022",
  },
  {
    make: "Ford",
    model: "Mustang",
    year: 2021,
    color: "Red",
    seats: 4,
    fuelType: "Gasoline",
    transmission: "Manual",
    pricePerDay: 90,
    features: ["Sport Mode", "Bluetooth"],
    category: "Sports Car",
    slug: "ford-mustang-2021",
  },
  {
    make: "Chevrolet",
    model: "Tahoe",
    year: 2020,
    color: "Silver",
    seats: 7,
    fuelType: "Gasoline",
    transmission: "Automatic",
    pricePerDay: 85,
    features: ["Bluetooth", "Air Conditioning"],
    category: "SUV",
    slug: "chevrolet-tahoe-2020",
  },
  {
    make: "BMW",
    model: "i8",
    year: 2022,
    color: "Blue",
    seats: 2,
    fuelType: "Hybrid",
    transmission: "Automatic",
    pricePerDay: 150,
    features: ["Luxury Package", "Bluetooth"],
    category: "Luxury",
    slug: "bmw-i8-2022",
  },
  {
    make: "Tesla",
    model: "Model X",
    year: 2023,
    color: "White",
    seats: 6,
    fuelType: "Electric",
    transmission: "Automatic",
    pricePerDay: 130,
    features: ["Autopilot", "Bluetooth"],
    category: "Minivan",
    slug: "tesla-modelx-2023",
  },
  {
    make: "Mercedes-Benz",
    model: "C-Class",
    year: 2022,
    color: "Black",
    seats: 5,
    fuelType: "Gasoline",
    transmission: "Automatic",
    pricePerDay: 100,
    features: ["Leather Seats", "Bluetooth"],
    category: "Luxury",
    slug: "mercedes-cclass-2022",
  },
  {
    make: "Porsche",
    model: "911",
    year: 2021,
    color: "Red",
    seats: 2,
    fuelType: "Gasoline",
    transmission: "Manual",
    pricePerDay: 160,
    features: ["Sport Mode", "Bluetooth"],
    category: "Sports Car",
    slug: "porsche-911-2021",
  },
  {
    make: "Kia",
    model: "Carnival",
    year: 2022,
    color: "Gray",
    seats: 7,
    fuelType: "Gasoline",
    transmission: "Automatic",
    pricePerDay: 75,
    features: ["Bluetooth", "Air Conditioning"],
    category: "Minivan",
    slug: "kia-carnival-2022",
  },
  {
    make: "Audi",
    model: "R8",
    year: 2023,
    color: "White",
    seats: 2,
    fuelType: "Gasoline",
    transmission: "Automatic",
    pricePerDay: 200,
    features: ["Luxury Package", "Sport Mode"],
    category: "Luxury",
    slug: "audi-r8-2023",
  },

  {
    make: "Jeep",
    model: "Wrangler",
    year: 2025,
    color: "Granite",
    seats: 5,
    fuelType: "Gasoline",
    transmission: "Automatic",
    pricePerDay: 85,
    features: ["Bluetooth", "Air Conditioning"],
    category: "SUV",
    slug: "jeep_granite-wrangler-2025",
  },
  {
    make: "Lincoln",
    model: "Navigator",
    year: 2025,
    color: "Burgundi",
    seats: 5,
    fuelType: "Gasoline",
    transmission: "Automatic",
    pricePerDay: 85,
    price: 65000,
    features: ["Bluetooth", "Air Conditioning"],
    category: "SUV",
    slug: "lincoln_burgundi-navigator-2025",
  },
  {
    make: "Chevrolet",
    model: "Equinox",
    year: 2025,
    color: "Granite",
    seats: 5,
    fuelType: "Gasoline",
    transmission: "Automatic",
    pricePerDay: 85,
    price: 65000,
    features: ["Bluetooth", "Air Conditioning"],
    category: "SUV",
    slug: "chevrolet-equinox-2025",
  },
  {
    make: "Toyota",
    model: "Corolla",
    year: 2022,
    color: "White",
    seats: 5,
    fuelType: "Gasoline",
    transmission: "Automatic",
    pricePerDay: 54,
    features: ["Bluetooth", "Air Conditioning"],
    category: "Sedan",
    slug: "toyota-corolla-2022",
  },
  {
    make: "BMW",
    model: "3Series",
    year: 2022,
    color: "Silver",
    seats: 5,
    fuelType: "Gasoline",
    transmission: "Automatic",
    pricePerDay: 51,
    features: ["Bluetooth", "Air Conditioning"],
    category: "Sedan",
    slug: "bmw-3series-2022",
  },
  {
  make: "Chevrolet",
  model: "Cruze",
  year: 2020,
  slug: "chevrolet-cruze-2020",
},
{
  make: "Ford",
  model: "Focus",
  year: 2019,
  slug: "ford-focus-2019",
},
{
  make: "Jeep",
  model: "Wrangler",
  year: 2023,
  slug: "jeep-wrangler-2023",
},
{
    make: "Jeep",
    model: "Wrangler",
    year: 2024,
    color: "Blue",
    seats: 5,
    fuelType: "Gasoline",
    transmission: "Automatic",
    pricePerDay: 79,
    features: ["Bluetooth", "Air Conditioning"],
    category: "SUV",
    slug: "jeep-wrangler-2024",
  },
  {
  make: "Tesla",
  model: "Model-3",
  year: 2023,
  slug: "tesla-model3-2023",
},

{
  make: "Honda",
  model: "Civic",
  year: 2021,
  slug: "honda-civic-2021",
},
{
    make: "Lincoln",
    model: "Nautilus",
    year: 2025,
    color: "Burgundi",
    seats: 5,
    fuelType: "Gasoline",
    transmission: "Automatic",
    pricePerDay: 99,
    features: ["Bluetooth", "Air Conditioning"],
    category: "SUV",
    slug: "lincoln-nautilus-2025",
    drivetrain: "4WD",
  },
];

// Upload images from local folder to Cloudinary
async function uploadImagesForFolder(folderName) {
  const folderPath = path.join(IMAGES_DIR, folderName);
  if (!fs.existsSync(folderPath)) {
    console.warn(`  → Folder not found: ${folderPath}`);
    return [];
  }

  const files = fs
    .readdirSync(folderPath)
    .filter((f) => /\.(png|jpe?g)$/i.test(f));
  if (!files.length) {
    console.warn(`  → No image files found in: ${folderPath}`);
    return [];
  }

  const images = [];
  for (const file of files) {
    const angleName = path.parse(file).name.toLowerCase();
    if (!ALLOWED_ANGLES.includes(angleName)) continue;

    const localFilePath = path.join(folderPath, file);
    console.log(`  - Uploading ${localFilePath} as angle="${angleName}"...`);

    try {
      const uploaded = await cloudinary.uploader.upload(localFilePath, {
        folder: `car_showcase/${folderName}`,
        use_filename: true,
        unique_filename: false,
        overwrite: true,
        resource_type: "image",
      });
      images.push({ url: uploaded.secure_url, angle: angleName });
      console.log(`    → uploaded: ${uploaded.secure_url}`);
    } catch (err) {
      console.error(
        `    ! upload failed for ${localFilePath}:`,
        err.message || err
      );
    }
  }

  images.sort(
    (a, b) => ALLOWED_ANGLES.indexOf(a.angle) - ALLOWED_ANGLES.indexOf(b.angle)
  );
  return images;
}

// ---------------------------- MAIN SEED FUNCTION -----------------------------
async function seed() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI, {});
    console.log("Connected.");

    console.log("Backfilling sale price for legacy cars...");

    const legacyPriceCars = await Car.find({
      price: { $exists: false },
    });

    for (const car of legacyPriceCars) {
      const condition = car.condition || getConditionFromYear(car.year);
      const price = getSalePrice(car.pricePerDay, condition);

      await Car.updateOne(
        { _id: car._id },
        {
          $set: { price },
        }
      );
    }

    console.log(`✔ Backfilled price for ${legacyPriceCars.length} cars`);

    console.log("Backfilling condition & certified for legacy cars...");

    const legacyCars = await Car.find({
      $or: [
        { condition: { $exists: false } },
        { certified: { $exists: false } },
      ],
    });

    const countUsed = await Car.countDocuments({ condition: "used" });
    const countNew = await Car.countDocuments({ condition: "new" });

    console.log("Seed check → used:", countUsed, "new:", countNew);

    for (const car of legacyCars) {
      const condition = getConditionFromYear(car.year);
      const certified = getCertifiedFlag(condition);

      await Car.updateOne(
        { _id: car._id },
        {
          $set: {
            condition,
            certified,
          },
        }
      );
    }

    console.log(`✔ Backfilled ${legacyCars.length} legacy cars`);

    // 🔵 ONE-TIME BACKFILL FOR LEGACY CARS
    // await Car.updateMany(
    //   { "location.branch": { $exists: false } },
    //   { $set: { location: getDefaultLocation() } }
    // );
    // console.log("✔ Legacy cars updated with branch");

    for (const car of sampleCars) {
      const folderName =
        car.slug || slugifyString(`${car.make}-${car.model}-${car.year}`);

      // 🔵 CHANGE #1 — find existing car
      const existingCar = await Car.findOne({ slug: folderName });

      if (existingCar) {
        console.log(`  → Car ${folderName} already exists.`);

        // 🔵 CHANGE #2 — Only update images if empty or missing
        if (!existingCar.images || existingCar.images.length === 0) {
          console.log(`    → Car has NO images. Uploading now...`);

          const newImages = await uploadImagesForFolder(folderName);

          await Car.updateOne(
            { slug: folderName },
            { $set: { images: newImages } } // <-- ONLY updating images field
          );

          console.log(`    → Images added (${newImages.length}).`);
        } else {
          console.log(`    → Images already exist. Leaving untouched.`);
        }

        // 🔵 ADD location.branch if missing
        if (!existingCar.location?.branch) {
          await Car.updateOne(
            { _id: existingCar._id },
            {
              $set: {
                location: getDefaultLocation(),
              },
            }
          );

          console.log(`    → Branch added: ${getDefaultLocation().branch}`);
        }

        continue; // skip creating a new document
      }

      // 🔵 CHANGE #3 — create car normally (same as before)
      const images = await uploadImagesForFolder(folderName);
      const condition = getConditionFromYear(car.year);
      const certified = getCertifiedFlag(condition);
      const price = getSalePrice(car.pricePerDay, condition);

      const doc = {
        ...car,
        images,
        slug: folderName,
        location: getDefaultLocation(),
        condition,
        certified,
        price,
      };

      const created = await Car.create(doc);

      console.log(
        `  → Inserted new car ${created.slug} with ${images.length} images.`
      );
    }

    console.log("Done seeding new cars!");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seed();
