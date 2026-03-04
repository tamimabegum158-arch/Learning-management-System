import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import * as aiController from "./ai.controller.js";

const router = Router();

router.post("/ask", authMiddleware, async (req, res, next) => {
  try {
    await aiController.ask(req, res);
  } catch (e) {
    next(e);
  }
});

export default router;
