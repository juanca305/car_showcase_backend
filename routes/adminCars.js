import express from "express";
import multer from "multer";

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
  replaceCarImage,
} from "../controllers/carController.js";

import adminAuth from "../middleware/auth.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// ✅ ADMIN inventory list (includes deleted by default is OPTIONAL; you control by query params)
router.get("/", adminAuth, getCars);

// ✅ Admin can fetch a specific car
router.get("/:id", adminAuth, getCarById);

// ✅ CRUD (protected)
router.post("/", adminAuth, createCar);
router.put("/:id", adminAuth, updateCar);

// ✅ Soft delete / restore / permanent delete (protected)
router.delete("/:id", adminAuth, deleteCar);
router.put("/:id/restore", adminAuth, restoreCar);
router.delete("/:id/permanent", adminAuth, permanentDeleteCar);

// ✅ Images (protected)
router.post("/:id/images", adminAuth, upload.single("image"), uploadImage);
router.post(
  "/:id/images/multiple",
  adminAuth,
  upload.array("images", 10),
  uploadMultipleImages
);
router.delete("/:id/images/:imageId", adminAuth, deleteCarImage);
router.put(
  "/:id/images/:imageId",
  adminAuth,
  upload.single("image"),
  replaceCarImage
);

export default router;
