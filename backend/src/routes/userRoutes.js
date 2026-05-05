import express from "express";
import { listUsers } from "../controllers/userController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, asyncHandler(listUsers));

export default router;
