import cors from "cors";
import express from "express";
import helmet from "helmet";
import { executeRouter } from "./execute.routes";

export function createApp() {
  const app = express();

  app.use(helmet());
  const allowedOrigins = (process.env.CORS_ORIGINS ?? "http://localhost:3000").split(",");
  app.use(cors({ origin: allowedOrigins }));
  app.use(express.json({ limit: "1mb" }));

  app.get("/", (_req, res) => {
    res.status(200).json({ data: { status: "ok", timestamp: new Date().toISOString() }, message: "health" });
  });

  app.use("/execute", executeRouter);

  app.use((_req, res) => {
    res.status(404).json({ success: false, error: "Not found" });
  });

  return app;
}
