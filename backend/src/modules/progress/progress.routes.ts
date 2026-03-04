import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import * as progressController from "./progress.controller.js";

const router = Router();

router.use(authMiddleware);

router.get("/subjects/:subjectId", async (req, res, next) => {
  try {
    await progressController.getSubjectProgress(req, res);
  } catch (e) {
    next(e);
  }
});

router.get("/videos/:videoId", async (req, res, next) => {
  try {
    await progressController.getVideoProgress(req, res);
  } catch (e) {
    next(e);
  }
});

router.post("/videos/:videoId", async (req, res, next) => {
  try {
    await progressController.upsertVideoProgress(req, res);
  } catch (e) {
    next(e);
  }
});

export default router;
