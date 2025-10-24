import mongoose from "mongoose";
import dotenv from "dotenv";
import Car from "../models/Car.js";

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI).then(() => {
  console.log("✅ Connected to MongoDB");
}).catch(err => {
  console.error("MongoDB connection error:", err);
});

mongoose.connection.once("open", async () => {
  try {
    const cars = await Car.find({});
    console.log(`Found ${cars.length} cars`);

    let totalCarsUpdated = 0;
    let totalImagesUpdated = 0;

    for (const car of cars) {
      let updated = false;

      car.images = car.images.map(img => {
        if (!img.imageId) {
          updated = true;
          totalImagesUpdated++;
          return { ...img.toObject(), imageId: new mongoose.Types.ObjectId().toString() };
        }
        return img;
      });

      if (updated) {
        await car.save();
        totalCarsUpdated++;
        console.log(`Updated car ${car._id} with new imageId(s)`);
      }
    }

    console.log("\n✅ Migration complete!");
    console.log(`Cars updated: ${totalCarsUpdated}`);
    console.log(`Images updated: ${totalImagesUpdated}`);
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    mongoose.disconnect();
  }
});
