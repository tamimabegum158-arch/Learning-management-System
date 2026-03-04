import { Router } from "express";
import * as runController from "./run.controller.js";

const router = Router();

router.post("/", async (req, res, next) => {
  try {
    await runController.executeCode(req, res);
  } catch (e) {
    next(e);
  }
});

export default router;
