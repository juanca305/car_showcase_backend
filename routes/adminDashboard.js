import express from "express";
import adminAuth from "../middleware/auth.js";
import { getAdminDashboardStats } from "../controllers/adminDashboardController.js";

const router = express.Router();

router.get("/stats", adminAuth, getAdminDashboardStats);

export default router;
