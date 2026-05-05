import express from "express";
import { body, param } from "express-validator";
import {
  createProject,
  deleteProject,
  getProject,
  listProjects,
  updateProject
} from "../controllers/projectController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { adminOnly, protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

router
  .route("/")
  .get(protect, asyncHandler(listProjects))
  .post(
    protect,
    adminOnly,
    [
      body("name").trim().notEmpty().withMessage("Project name is required"),
      body("members").optional().isArray()
    ],
    validate,
    asyncHandler(createProject)
  );

router
  .route("/:id")
  .get(protect, param("id").isMongoId(), validate, asyncHandler(getProject))
  .put(
    protect,
    adminOnly,
    [
      param("id").isMongoId(),
      body("name").optional().trim().notEmpty(),
      body("members").optional().isArray()
    ],
    validate,
    asyncHandler(updateProject)
  )
  .delete(
    protect,
    adminOnly,
    param("id").isMongoId(),
    validate,
    asyncHandler(deleteProject)
  );

export default router;
