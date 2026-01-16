// models/Car.js

import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, index: true }, // ✅ NEW (not required for backward compatibility)
    angle: {
      type: String,
      enum: ["main", "front", "rear", "roof"],
      default: "main",
    },
  },
  { _id: true } // optional; default is true anyway, but explicit is fine
);

const CarSchema = new mongoose.Schema(
  {
    make: { type: String, required: true, index: true },
    model: { type: String, required: true },
    category: {
      type: String,
      enum: [
        "SUV",
        "Sedan",
        "Hatchback",
        "Pickup",
        "Minivan",
        "Coupe",
        "Convertible",
        "Luxury",
        "Electric",
        "Sports Car",
      ], // optional
      default: "Unknown",
    },
    trim: String,
    year: Number,
    color: String,
    seats: Number,
    fuelType: String,
    transmission: String,
    mileage: Number,
    pricePerDay: { type: Number, required: true }, // legacy (to be deprecated)
    price: {
      type: Number,
      required: true, // dealership price
      index: true,
    },
    images: [ImageSchema], // <- structured images
    description: String,
    features: [String],
    available: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    //createdAt: { type: Date, default: Date.now },
    slug: { type: String, index: true },
    location: {
      branch: {
        type: String,
        required: true,
        index: true,
      },
    },

    condition: {
      type: String,
      enum: ["new", "used"],
      required: true,
      index: true,
    },

    certified: {
      type: Boolean,
      default: false,
      index: true,
    },

    drivetrain: {
      type: String,
      enum: ["FWD", "RWD", "AWD", "4WD"],
      required: false,
      trim: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
    timestamps: true,
  }
);

// Automatically exclude soft-deleted cars from queries unless explicitly included
// CarSchema.pre(/^find/, function (next) {
//   if (!this.getQuery().includeDeleted) {
//     this.where({ isDeleted: false });
//   } else {
//     delete this.getQuery().includeDeleted;
//   }
//   next();
// });

export default mongoose.models.Car || mongoose.model("Car", CarSchema);
