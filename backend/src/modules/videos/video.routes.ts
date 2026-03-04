import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import * as videoController from "./video.controller.js";

const router = Router();

router.post("/", authMiddleware, async (req, res, next) => {
  try {
    await videoController.createVideo(req, res);
  } catch (e) {
    next(e);
  }
});

router.get("/:videoId", authMiddleware, async (req, res, next) => {
  try {
    await videoController.getVideoById(req, res);
  } catch (e) {
    next(e);
  }
});

export default router;
