// scripts/seed.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import Car from "../models/Car.js";
import cloudinary from "../utils/cloudinaryConfig.js";
import fs from "fs";
import path from "path";

dotenv.config();

const sampleCars = [
  {
    make: "Toyota",
    model: "Corolla",
    year: 2022,
    fuelType: "Gasoline",
    transmission: "Automatic",
    pricePerDay: 45,
    images: [
      {
        url: "https://res.cloudinary.com/your_cloud_name/image/upload/main.jpg",
        angle: "main",
      },
      {
        url: "https://res.cloudinary.com/your_cloud_name/image/upload/front.jpg",
        angle: "front",
      },
      {
        url: "https://res.cloudinary.com/your_cloud_name/image/upload/rear.jpg",
        angle: "rear",
      },
      {
        url: "https://res.cloudinary.com/your_cloud_name/image/upload/roof.jpg",
        angle: "roof",
      },
    ],
    seats: 5,
    color: "White",
    features: ["Bluetooth", "Air Conditioning"],
  },
  {
    make: "Honda",
    model: "Civic",
    year: 2021,
    fuelType: "Gasoline",
    transmission: "Automatic",
    pricePerDay: 50,
    images: [
      {
        url: "https://res.cloudinary.com/your_cloud_name/image/upload/main.jpg",
        angle: "main",
      },
      {
        url: "https://res.cloudinary.com/your_cloud_name/image/upload/front.jpg",
        angle: "front",
      },
      {
        url: "https://res.cloudinary.com/your_cloud_name/image/upload/rear.jpg",
        angle: "rear",
      },
      {
        url: "https://res.cloudinary.com/your_cloud_name/image/upload/roof.jpg",
        angle: "roof",
      },
    ],
    seats: 5,
  },
  {
    make: "Ford",
    model: "Focus",
    year: 2019,
    fuelType: "Diesel",
    transmission: "Manual",
    pricePerDay: 38,
    images: [
      {
        url: "https://res.cloudinary.com/your_cloud_name/image/upload/main.jpg",
        angle: "main",
      },
      {
        url: "https://res.cloudinary.com/your_cloud_name/image/upload/front.jpg",
        angle: "front",
      },
      {
        url: "https://res.cloudinary.com/your_cloud_name/image/upload/rear.jpg",
        angle: "rear",
      },
      {
        url: "https://res.cloudinary.com/your_cloud_name/image/upload/roof.jpg",
        angle: "roof",
      },
    ],
  },
  {
    make: "Chevrolet",
    model: "Cruze",
    year: 2020,
    fuelType: "Gasoline",
    transmission: "Automatic",
    pricePerDay: 42,
    images: [
      {
        url: "https://res.cloudinary.com/your_cloud_name/image/upload/main.jpg",
        angle: "main",
      },
      {
        url: "https://res.cloudinary.com/your_cloud_name/image/upload/front.jpg",
        angle: "front",
      },
      {
        url: "https://res.cloudinary.com/your_cloud_name/image/upload/rear.jpg",
        angle: "rear",
      },
      {
        url: "https://res.cloudinary.com/your_cloud_name/image/upload/roof.jpg",
        angle: "roof",
      },
    ],
  },
  {
    make: "BMW",
    model: "3 Series",
    year: 2022,
    fuelType: "Gasoline",
    transmission: "Automatic",
    pricePerDay: 95,
    images: [
      {
        url: "https://res.cloudinary.com/your_cloud_name/image/upload/main.jpg",
        angle: "main",
      },
      {
        url: "https://res.cloudinary.com/your_cloud_name/image/upload/front.jpg",
        angle: "front",
      },
      {
        url: "https://res.cloudinary.com/your_cloud_name/image/upload/rear.jpg",
        angle: "rear",
      },
      {
        url: "https://res.cloudinary.com/your_cloud_name/image/upload/roof.jpg",
        angle: "roof",
      },
    ],
  },
  {
    make: "Tesla",
    model: "Model 3",
    year: 2023,
    fuelType: "Electric",
    transmission: "Automatic",
    pricePerDay: 120,
    images: [
      {
        url: "https://res.cloudinary.com/your_cloud_name/image/upload/main.jpg",
        angle: "main",
      },
      {
        url: "https://res.cloudinary.com/your_cloud_name/image/upload/front.jpg",
        angle: "front",
      },
      {
        url: "https://res.cloudinary.com/your_cloud_name/image/upload/rear.jpg",
        angle: "rear",
      },
      {
        url: "https://res.cloudinary.com/your_cloud_name/image/upload/roof.jpg",
        angle: "roof",
      },
    ],
  },
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to DB for seeding");
    await Car.deleteMany({});
    await Car.insertMany(sampleCars);
    console.log("Seeded cars");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

seed();

// How to get real images:
// Easiest: go to Cloudinary dashboard, upload images manually, copy the secure URL and paste into images arrays in sampleCars.
// Or: I can give you an automated seed that uploads local image files in scripts/images/ to Cloudinary and uses their returned URLs — tell me if you want that.
