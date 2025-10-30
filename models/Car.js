// models/Car.js

import mongoose from "mongoose";

const ImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  angle: {
    type: String,
    enum: ["main", "front", "rear", "roof"],
    default: "main",
  },
});

const CarSchema = new mongoose.Schema(
  {
    make: { type: String, required: true, index: true },
    model: { type: String, required: true },
    trim: String,
    year: Number,
    color: String,
    seats: Number,
    fuelType: String,
    transmission: String,
    mileage: Number,
    pricePerDay: { type: Number, required: true },
    images: [ImageSchema], // <- structured images
    description: String,
    features: [String],
    available: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
    createdAt: { type: Date, default: Date.now },
    slug: { type: String, index: true },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Automatically exclude soft-deleted cars from queries unless explicitly included
CarSchema.pre(/^find/, function (next) {
  if (!this.getQuery().includeDeleted) {
    this.where({ isDeleted: false });
  } else {
    delete this.getQuery().includeDeleted;
  }
  next();
});

export default mongoose.models.Car || mongoose.model("Car", CarSchema);
