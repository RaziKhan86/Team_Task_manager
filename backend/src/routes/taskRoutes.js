import express from "express";
import { body, param } from "express-validator";
import {
  createTask,
  deleteTask,
  listTasks,
  updateTask
} from "../controllers/taskController.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { protect } from "../middleware/authMiddleware.js";
import { validate } from "../middleware/validate.js";

const router = express.Router();

router
  .route("/")
  .get(protect, asyncHandler(listTasks))
  .post(
    protect,
    [
      body("title").trim().notEmpty().withMessage("Task title is required"),
      body("project").isMongoId().withMessage("Valid project is required"),
      body("assignedTo").isMongoId().withMessage("Valid assignee is required"),
      body("status").optional().isIn(["todo", "in-progress", "done"]),
      body("priority").optional().isIn(["low", "medium", "high"]),
      body("dueDate").isISO8601().withMessage("Valid due date is required")
    ],
    validate,
    asyncHandler(createTask)
  );

router
  .route("/:id")
  .put(
    protect,
    [
      param("id").isMongoId(),
      body("status").optional().isIn(["todo", "in-progress", "done"]),
      body("priority").optional().isIn(["low", "medium", "high"]),
      body("dueDate").optional().isISO8601()
    ],
    validate,
    asyncHandler(updateTask)
  )
  .delete(protect, param("id").isMongoId(), validate, asyncHandler(deleteTask));

export default router;
