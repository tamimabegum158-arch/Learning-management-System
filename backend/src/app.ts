import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { corsOptions } from "./config/security.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { errorHandler } from "./middleware/errorHandler.js";
import authRoutes from "./modules/auth/auth.routes.js";
import healthRoutes from "./modules/health/health.routes.js";
import meRoutes from "./modules/me/me.routes.js";
import subjectRoutes from "./modules/subjects/subject.routes.js";
import videoRoutes from "./modules/videos/video.routes.js";
import progressRoutes from "./modules/progress/progress.routes.js";
import runRoutes from "./modules/run/run.routes.js";
import aiRoutes from "./modules/ai/ai.routes.js";

const app = express();

app.use(cors(corsOptions));
app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);

app.use("/api/auth", authRoutes);
app.use("/api/health", healthRoutes);
app.use("/api/me", meRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/videos", videoRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/run", runRoutes);
app.use("/api/ai", aiRoutes);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});
app.use(errorHandler);

export default app;
