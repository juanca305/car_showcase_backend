import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Car from "../models/Car.js";

function getCloudinaryPublicId(url = "") {
  const afterUpload = url.split("/upload/")[1];
  if (!afterUpload) return null;

  const noExt = afterUpload.replace(/\.[^/.]+$/, "");
  const publicId = noExt.replace(/^v\d+\//, "");

  return publicId || null;
}

async function run() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI);

    console.log("✅ Connected. Scanning cars...");
    const cars = await Car.find({ "images.0": { $exists: true } });

    let carsUpdated = 0;
    let imagesUpdated = 0;

    for (const car of cars) {
      let changed = false;

      for (const img of car.images) {
        if (!img.publicId && img.url) {
          const publicId = getCloudinaryPublicId(img.url);

          if (publicId) {
            img.publicId = publicId;
            changed = true;
            imagesUpdated++;
          }
        }
      }

      if (changed) {
        await car.save();
        carsUpdated++;
      }
    }

    console.log("✅ Backfill complete.");
    console.log("Cars updated:", carsUpdated);
    console.log("Images updated:", imagesUpdated);
  } catch (err) {
    console.error("❌ Backfill error:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB.");
    process.exit(0);
  }
}

run();
