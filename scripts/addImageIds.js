import mongoose from "mongoose";
import Car from "../models/Car.js"; // adjust path if needed
import dotenv from "dotenv";
dotenv.config();


// === 1️⃣ MongoDB connection ===
//const MONGO_URI = "mongodb://127.0.0.1:27017/car_showcase"; // replace with your DB URI
const MONGO_URI = process.env.MONGO_URI
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.once("open", async () => {
  console.log("✅ Connected to MongoDB");

  try {
    // === 2️⃣ Fetch all cars ===
    const cars = await Car.find({});
    console.log(`Found ${cars.length} cars in total`);

    let totalUpdated = 0;
    let totalImagesUpdated = 0;

    // === 3️⃣ Loop through each car ===
    for (const car of cars) {
      let updated = false;
      let imagesUpdatedCount = 0;

      car.images = car.images.map(image => {
        if (!image._id) {
          updated = true;
          imagesUpdatedCount++;
          return { ...image, _id: new mongoose.Types.ObjectId() };
        }
        return image;
      });

      if (updated) {
        await car.save();
        totalUpdated++;
        totalImagesUpdated += imagesUpdatedCount;
        console.log(`Updated car ${car._id} with ${imagesUpdatedCount} new image _id(s)`);
      }
    }

    console.log(`\n✅ Migration complete!`);
    console.log(`Cars updated: ${totalUpdated}`);
    console.log(`Images updated: ${totalImagesUpdated}`);
  } catch (err) {
    console.error("Migration error:", err);
  } finally {
    mongoose.disconnect();
  }
});


/***********
 * // import mongoose from "mongoose";
// import Car from "../models/Car.js"; // adjust path if needed

// // MongoDB connection string
// const MONGO_URI = "mongodb://127.0.0.1:27017/car_showcase"; // change to your DB

// mongoose.connect(MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// mongoose.connection.once("open", async () => {
//   console.log("Connected to MongoDB");

//   try {
//     // Migration code will go here
//   } catch (err) {
//     console.error(err);
//   } finally {
//     mongoose.disconnect();
//   }
// });*/
