import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import * as aiController from "./ai.controller.js";

const router = Router();

router.get("/chat/status", authMiddleware, (req, res, next) => {
  try {
    aiController.chatStatus(req, res);
  } catch (e) {
    next(e);
  }
});

router.post("/ask", authMiddleware, async (req, res, next) => {
  try {
    await aiController.ask(req, res);
  } catch (e) {
    next(e);
  }
});

router.post("/chat", authMiddleware, async (req, res, next) => {
  try {
    await aiController.chat(req, res);
  } catch (e) {
    next(e);
  }
});

export default router;
