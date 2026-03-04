import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import * as meController from "./me.controller.js";

const router = Router();

router.get("/enrollments", authMiddleware, async (req, res, next) => {
  try {
    await meController.getMyEnrollments(req, res);
  } catch (e) {
    next(e);
  }
});

export default router;
