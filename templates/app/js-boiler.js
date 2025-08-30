import { env } from "./conf/env";
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
// routes
import healthRouter from "./routes/healthRoute"

const app = express();
const corsOptions = {
  origin: env.ACCESS_CONTROL_ORIGIN,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200,
};

app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));

// routes
app.use("/api/v1/health", healthRouter)

export default app;