// controllers/carController.js
import mongoose from "mongoose";
import Car from "../models/Car.js";
import cloudinary from "../utils/cloudinaryConfig.js";
import fs from "fs";

const allowedAngles = ["main", "front", "rear", "roof"];

// Sanitize make before building a RegExp. Prevents RegExp injection / crashes if user passes special characters.
function escapeRegex(str = "") {
  // escape special chars for RegExp
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Ensures page/limit are sane integers.
function parsePositiveInt(val, fallback) {
  const n = Number(val);
  return Number.isInteger(n) && n > 0 ? n : fallback;
}

/**
 * GET /api/cars
 * Supports: page, limit, make, fuelType, transmission, priceMin, priceMax, year, sort
 */
export const getCars = async (req, res) => {
  try {
    const page = parsePositiveInt(req.query.page, 1);
    const rawLimit = parsePositiveInt(req.query.limit, 12);
    const limit = Math.min(rawLimit, 100); // cap limit
    const skip = (page - 1) * limit;

    const { make, fuelType, transmission, priceMin, priceMax, year, sort } =
      req.query;

    const query = {};

    if (make) {
      // sanitize user input before using in RegExp
      const safe = escapeRegex(String(make));
      query.make = { $regex: new RegExp(safe, "i") };
    }

    if (req.query.model) {
      const safeModel = escapeRegex(String(req.query.model));
      query.model = { $regex: new RegExp(safeModel, "i") };
    }

    // if (fuelType) query.fuelType = String(fuelType);
    // if (transmission) query.transmission = String(transmission);

    if (fuelType) {
      const safeFuel = escapeRegex(String(fuelType));
      query.fuelType = { $regex: new RegExp(safeFuel, "i") };
    }
    if (transmission) {
      const safeTrans = escapeRegex(String(transmission));
      query.transmission = { $regex: new RegExp(safeTrans, "i") };
    }

    const y = Number(year);
    if (!Number.isNaN(y)) query.year = y;

    if (priceMin || priceMax) {
      query.pricePerDay = {};
      const pMin = Number(priceMin);
      const pMax = Number(priceMax);
      if (!Number.isNaN(pMin)) query.pricePerDay.$gte = pMin;
      if (!Number.isNaN(pMax)) query.pricePerDay.$lte = pMax;
      if (Object.keys(query.pricePerDay).length === 0) delete query.pricePerDay;
    }

    // sorting: ?sort=pricePerDay:asc  or sort=year:desc
    let sortObj = { createdAt: -1 }; // default newest first
    if (sort) {
      const [field, order] = String(sort).split(":");
      if (field) sortObj = { [field]: order === "desc" ? -1 : 1 };
    }

    const [cars, total] = await Promise.all([
      Car.find(query)
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean()
        .select("-__v"),
      Car.countDocuments(query),
    ]);

    return res.json({
      data: cars,
      meta: {
        total,
        page,
        limit,
        pages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  } catch (err) {
    console.error("getCars error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const getCarById = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: "Invalid id" });

    const car = await Car.findById(id).lean().select("-__v");
    if (!car) return res.status(404).json({ message: "Car not found" });

    return res.json({ data: car });
  } catch (err) {
    console.error("getCarById error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const createCar = async (req, res) => {
  try {
    // Basic validation: require make, model, pricePerDay
    // const { make, model, pricePerDay } = req.body;
    // if (!make || !model || pricePerDay === undefined) {
    //   return res
    //     .status(400)
    //     .json({ message: "make, model and pricePerDay are required" });
    // }

    const { make, model, pricePerDay } = req.body;
    if (!make || !model || pricePerDay === undefined) {
      return res
        .status(400)
        .json({ message: "make, model and pricePerDay are required" });
    }

    // Validate pricePerDay is a positive finite number
    const priceNum = Number(pricePerDay);
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      return res
        .status(400)
        .json({ message: "pricePerDay must be a positive number" });
    }

    // Optionally normalize to a fixed decimal or integer:
    req.body.pricePerDay = Math.round(priceNum); // or parseFloat(priceNum.toFixed(2))

    const car = new Car(req.body);
    await car.save();

    return res.status(201).json({ data: car.toObject() });
  } catch (err) {
    console.error("createCar error:", err);
    return res.status(400).json({ message: err.message });
  }
};

export const updateCar = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: "Invalid id" });

    const car = await Car.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!car) return res.status(404).json({ message: "Car not found" });

    return res.json({ data: car });
  } catch (err) {
    console.error("updateCar error:", err);
    return res.status(400).json({ message: err.message });
  }
};

export const deleteCar = async (req, res) => {
  try {
    const id = req.params.id;
    if (!mongoose.isValidObjectId(id))
      return res.status(400).json({ message: "Invalid id" });

    const car = await Car.findByIdAndDelete(id);
    if (!car) return res.status(404).json({ message: "Car not found" });

    return res.json({ message: "Deleted" });
  } catch (err) {
    console.error("deleteCar error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// Upload image and append to car.images (angle validated)
export const uploadImage = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const localPath = req.file.path;
  let uploaded = null;

  // validate angle
  const rawAngle = (req.body.angle || "").toString();
  const angle = allowedAngles.includes(rawAngle) ? rawAngle : "main";

  try {
    // upload
    uploaded = await cloudinary.uploader.upload(localPath, {
      folder: `car_showcase/${req.params.id}`,
      use_filename: true,
      unique_filename: false,
      overwrite: true,
      resource_type: "image",
    });

    // push with object {url, angle}
    const car = await Car.findByIdAndUpdate(
      req.params.id,
      {
        $push: {
          images: { url: uploaded.secure_url, angle },
        },
      },
      { new: true, runValidators: true }
    ).lean();

    return res.json({ data: car });
  } catch (err) {
    console.error("uploadImage error:", err);
    return res.status(500).json({ message: "Image upload failed" });
  } finally {
    // always try to remove temp file
    try {
      await fs.promises.unlink(localPath);
    } catch (e) {
      // not fatal — log for debug
      console.warn("Could not delete temp file:", localPath, e?.message || e);
    }
  }
};

// Upload multiple images (up to 4 angles)
export const uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const carId = req.params.id;
    if (!mongoose.isValidObjectId(carId)) {
      return res.status(400).json({ message: "Invalid car ID" });
    }

    // ✅ Step 3.1: Fetch car first
    const car = await Car.findById(carId);
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }

    // ✅ Step 3.2: Enforce image limit (4 max)
    const existingCount = car.images?.length || 0;
    const newCount = req.files.length;

    if (existingCount + newCount > 4) {
      return res.status(400).json({
        message: `You can upload up to 4 images per car. This car already has ${existingCount} image(s).`,
      });
    }

    const uploadedImages = [];

    for (const file of req.files) {
      const rawAngle = (file.originalname.split(".")[0] || "").toLowerCase();
      const angle = allowedAngles.includes(rawAngle) ? rawAngle : "main";

      const upload = await cloudinary.uploader.upload(file.path, {
        folder: `car_showcase/${carId}`,
        use_filename: true,
        unique_filename: false,
        overwrite: true,
      });

      uploadedImages.push({ url: upload.secure_url, angle });

      // delete temp file after each upload
      try {
        await fs.promises.unlink(file.path);
      } catch (e) {
        console.warn("Could not delete temp file:", file.path);
      }
    }

    // ✅ Step 3.5: Update car with new images
    const updatedCar = await Car.findByIdAndUpdate(
      carId,
      { $push: { images: { $each: uploadedImages } } },
      { new: true, runValidators: true }
    ).lean();

    return res.json({ data: updatedCar });
  } catch (err) {
    console.error("uploadMultipleImages error:", err);
    return res.status(500).json({ message: "Image upload failed" });
  }
};

export const deleteCarImage = async (req, res) => {
  try {
    const { id: carId, imageId } = req.params;

    // ✅ Step 1: Validate IDs
    if (
      !mongoose.isValidObjectId(carId) ||
      !mongoose.isValidObjectId(imageId)
    ) {
      return res.status(400).json({ message: "Invalid car or image ID" });
    }

    // ✅ Step 2: Find car
    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ message: "Car not found" });

    // ✅ Step 3: Locate image
    const imageToDelete = car.images.id(imageId);
    if (!imageToDelete)
      return res.status(404).json({ message: "Image not found in this car" });

    // ✅ Step 4: Extract Cloudinary public_id dynamically
    const imageUrl = imageToDelete.url;
    const publicId = imageUrl.split("/upload/")[1]?.split(".")[0];

    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudErr) {
        console.warn("⚠️ Cloudinary deletion failed:", cloudErr.message);
      }
    }

    // ✅ Step 5: Remove image from MongoDB
    imageToDelete.deleteOne();
    await car.save();

    // ✅ Step 6: Return updated car
    return res.status(200).json({
      message: "Image deleted successfully",
      data: car,
    });
  } catch (err) {
    console.error("deleteCarImage error:", err);
    return res.status(500).json({ message: "Failed to delete image" });
  }
};

export const replaceCarImage = async (req, res) => {
  try {
    const { id: carId, imageId } = req.params;

    // ✅ Validate IDs
    if (
      !mongoose.isValidObjectId(carId) ||
      !mongoose.isValidObjectId(imageId)
    ) {
      return res.status(400).json({ message: "Invalid car or image ID" });
    }

    // ✅ Find car
    const car = await Car.findById(carId);
    if (!car) return res.status(404).json({ message: "Car not found" });

    // ✅ Find image to replace
    const imageToReplace = car.images.id(imageId);
    if (!imageToReplace)
      return res.status(404).json({ message: "Image not found in this car" });

    // ✅ Delete old image from Cloudinary
    const oldUrl = imageToReplace.url;
    const publicId = oldUrl.split("/upload/")[1]?.split(".")[0];
    if (publicId) {
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (cloudErr) {
        console.warn("⚠️ Cloudinary deletion failed:", cloudErr.message);
      }
    }

    // ✅ Upload new image
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: `car_showcase/${carId}`,
      resource_type: "image",
    });

    // ✅ Replace the image info (keep same angle if exists)
    imageToReplace.url = result.secure_url;
    imageToReplace.angle = imageToReplace.angle || "unknown";

    await car.save();

    // ✅ Return updated car
    return res.status(200).json({
      message: "Image replaced successfully",
      data: car,
    });
  } catch (err) {
    console.error("replaceCarImage error:", err);
    return res.status(500).json({ message: "Failed to replace image" });
  }
};

