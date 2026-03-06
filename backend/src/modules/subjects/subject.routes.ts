import { Router } from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { optionalAuthMiddleware } from "../../middleware/optionalAuthMiddleware.js";
import * as subjectController from "./subject.controller.js";

const router = Router();

router.get("/", optionalAuthMiddleware, async (req, res, next) => {
  try {
    await subjectController.listSubjects(req, res);
  } catch (e) {
    next(e);
  }
});

router.post("/:subjectId/enroll", authMiddleware, async (req, res, next) => {
  try {
    await subjectController.enrollInSubject(req, res);
  } catch (e) {
    next(e);
  }
});

router.delete("/:subjectId/enroll", authMiddleware, async (req, res, next) => {
  try {
    await subjectController.unenrollFromSubject(req, res);
  } catch (e) {
    next(e);
  }
});

router.post("/:subjectId/purchase", authMiddleware, async (req, res, next) => {
  try {
    await subjectController.purchaseSubject(req, res);
  } catch (e) {
    next(e);
  }
});

router.post("/", authMiddleware, async (req, res, next) => {
  try {
    await subjectController.createSubject(req, res);
  } catch (e) {
    next(e);
  }
});

router.patch("/:subjectId", authMiddleware, async (req, res, next) => {
  try {
    await subjectController.patchSubject(req, res);
  } catch (e) {
    next(e);
  }
});

router.delete("/:subjectId", authMiddleware, async (req, res, next) => {
  try {
    await subjectController.deleteSubject(req, res);
  } catch (e) {
    next(e);
  }
});

router.get("/:subjectId", async (req, res, next) => {
  try {
    await subjectController.getSubjectById(req, res);
  } catch (e) {
    next(e);
  }
});

router.get("/:subjectId/tree", authMiddleware, async (req, res, next) => {
  try {
    await subjectController.getSubjectTree(req, res);
  } catch (e) {
    next(e);
  }
});

router.get("/:subjectId/first-video", authMiddleware, async (req, res, next) => {
  try {
    await subjectController.getFirstUnlockedVideo(req, res);
  } catch (e) {
    next(e);
  }
});

router.post("/:subjectId/sections", authMiddleware, async (req, res, next) => {
  try {
    await subjectController.createSection(req, res);
  } catch (e) {
    next(e);
  }
});

export default router;
