import "dotenv/config";
import cors from "cors";
import express from "express";
import path from "node:path";
import authRoutes from "./routes/authRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import esgRoutes from "./routes/esgRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import HttpError from "./utils/HttpError.js";

const app = express();
const origins = (process.env.FRONTEND_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
const uploadDirectory = path.resolve(process.cwd(), "uploads");

app.disable("x-powered-by");
app.use(cors({
  origin(origin, callback) {
    if (!origin || origins.includes(origin)) return callback(null, true);
    callback(new HttpError(403, "This frontend origin is not allowed."));
  },
  allowedHeaders: ["Content-Type", "Authorization"],
  methods: ["GET", "POST", "PUT", "OPTIONS"],
}));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use("/uploads", express.static(uploadDirectory, { fallthrough: false, index: false }));

app.get("/", (_request, response) => response.json({ name: "MEIL ESG / BRSR API", status: "ready" }));
app.use("/api/auth", authRoutes);
app.use("/api/esg/submissions", esgRoutes);
app.use("/api", dashboardRoutes);
app.use("/api/reports", reportRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
