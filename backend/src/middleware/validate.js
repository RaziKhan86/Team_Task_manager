import { validationResult } from "express-validator";

export const validate = (req, res, next) => {
  const result = validationResult(req);

  if (!result.isEmpty()) {
    res.status(400);
    const error = new Error("Validation failed");
    error.errors = result.array();
    throw error;
  }

  next();
};
