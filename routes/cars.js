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
  uploadImage,
  uploadMultipleImages,
  deleteCarImage,
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
router.delete("/:id", adminAuth, deleteCar);

// ✅ Image upload routes
router.post("/:id/images", adminAuth, upload.single("image"), uploadImage);
router.post("/:id/images/multiple", adminAuth, upload.array("images", 10), uploadMultipleImages);

// ✅ Delete specific image
router.delete("/:id/images/:imageId", adminAuth, deleteCarImage);

export default router;


/******
 * // routes/cars.js

// import express from 'express';
// import multer from 'multer';

// import {
//   getCars,
//   getCarById,
//   createCar,
//   updateCar,
//   deleteCar,
//   uploadImage,
//   uploadMultipleImages,
//   deleteCarImage   // ✅ Added missing import
// } from '../controllers/carController.js';
// import adminAuth from '../middleware/adminAuth.js';

// const router = express.Router();

// // ---------------------------------------------
// // 📦 Multer Configuration (for image uploads)
// // ---------------------------------------------
// const storage = multer.memoryStorage();
// const upload = multer({ storage });

// // ---------------------------------------------
// // 🚗 CAR CRUD ROUTES
// // ---------------------------------------------

// // 🔹 GET all cars
// router.get('/', getCars);

// // 🔹 GET a specific car by ID
// router.get('/:id', getCarById);

// // 🔹 CREATE a new car (Admin only)
// router.post('/', adminAuth, createCar);

// // 🔹 UPDATE an existing car (Admin only)
// router.put('/:id', adminAuth, updateCar);

// // 🔹 DELETE a car (Admin only)
// router.delete('/:id', adminAuth, deleteCar);

// // ---------------------------------------------
// // 🖼️ IMAGE MANAGEMENT ROUTES (Cloudinary integration)
// // ---------------------------------------------

// // 🔹 Upload a single image for a car
// router.post('/:id/images', adminAuth, upload.single('image'), uploadImage);

// // 🔹 Upload multiple images for a car (up to 10)
// router.post('/:id/images/multiple', adminAuth, upload.array('images', 10), uploadMultipleImages);

// // 🔹 Delete a specific image from a car
// router.delete('/:id/images/:imageId', adminAuth, deleteCarImage);

// // ---------------------------------------------
// // ✅ Export router
// // ---------------------------------------------
// export default router;

//********************************************************


// // // routes/cars.js
/// ***THIS WORKS!!! *****/
// import express from "express";
// import multer from "multer";
// import Car from "../models/Car.js";
// import {
//   getCars,
//   getCarById,
//   createCar,
//   updateCar,
//   deleteCar,
//   uploadImage,
//   uploadMultipleImages,
//   deleteCarImage,
// } from "../controllers/carController.js";
// import adminAuth from "../middleware/auth.js";

// const router = express.Router();
// const upload = multer({ dest: "uploads/" }); // temp storage

// router.get("/", getCars);



// // GET /api/cars/makes
// router.get("/makes/distinct", async (req, res) => {
//   try {
//     const makes = await Car.distinct("make"); // get all unique makes
//     res.json({ data: makes });
//   } catch (err) {
//     console.error("getDistinctMakes error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// // GET /api/cars
// router.get("/:id", getCarById); // GET /api/cars/:id

// router.post("/", adminAuth, createCar); // POST /api/cars  (admin)
// router.put("/:id", adminAuth, updateCar);
// router.delete("/:id", adminAuth, deleteCar);

// router.post("/:id/images", adminAuth, upload.single("image"), uploadImage); // upload an image

// // ✅ Upload multiple images (up to 10 at once)
// router.post(
//   "/:id/images/multiple",
//   adminAuth,
//   upload.array("images", 10),
//   uploadMultipleImages
// );

// // ✅ Delete a specific image from a car
// router.delete("/:id/images/:imageId", adminAuth, deleteCarImage);

// export default router;

// Why separate controllers and routes? Clean code organization and easier testing.
