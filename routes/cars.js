// routes/cars.js
import express from "express";
import multer from "multer";
import Car from "../models/Car.js";
import {
  getCars,
  getCarById,
  createCar,
  updateCar,
  deleteCar,
  restoreCar,
  permanentDeleteCar,
  uploadImage,
  uploadMultipleImages,
  deleteCarImage,
  replaceCarImage
} from "../controllers/carController.js";
import adminAuth from "../middleware/auth.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // temp storage

// ✅ GET all cars
router.get("/", getCars);

// ✅ GET distinct makes (must be before /:id)
router.get("/makes/distinct", async (req, res) => {
  try {
    const makes = await Car.distinct("make");
    res.json({ data: makes });
  } catch (err) {
    console.error("getDistinctMakes error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ GET car by ID
router.get("/:id", getCarById);

// ✅ CRUD operations
router.post("/", adminAuth, createCar);

router.put("/:id", adminAuth, updateCar);

// ✅ Restore a soft-deleted car
router.put("/:id/restore", adminAuth, restoreCar);

// ✅ Permanently delete a car (irreversible)
router.delete("/:id/permanent", adminAuth, permanentDeleteCar);

router.delete("/:id", adminAuth, deleteCar);

// ✅ Replace a specific image
router.put("/:id/images/:imageId", adminAuth, upload.single("image"), replaceCarImage);


// ✅ Image upload routes
router.post("/:id/images", adminAuth, upload.single("image"), uploadImage);
router.post("/:id/images/multiple", adminAuth, upload.array("images", 10), uploadMultipleImages);

// ✅ Delete specific image
router.delete("/:id/images/:imageId", adminAuth, deleteCarImage);

export default router;

