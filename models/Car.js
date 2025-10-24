// models/Car.js

import mongoose from 'mongoose';

const ImageSchema = new mongoose.Schema({
  url: { type: String, required: true },
  angle: {
    type: String,
    enum: ['main', 'front', 'rear', 'roof'],
    default: 'main'
  }
});

const CarSchema = new mongoose.Schema({
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
  createdAt: { type: Date, default: Date.now },
  slug: { type: String, index: true }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

export default mongoose.models.Car || mongoose.model('Car', CarSchema);


