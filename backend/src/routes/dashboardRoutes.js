import express from "express";
import { getDashboard } from "../controllers/dashboardController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, asyncHandler(getDashboard));

export default router;
