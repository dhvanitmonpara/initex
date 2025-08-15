import express from 'express';
import routes from './routes/healthRoute';
import cors from "cors";

const app = express();
const corsOptions = {
  origin: process.env.ACCESS_CONTROL_ORIGIN,
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use('/', routes);

// routes
import healthRouter from "./routes/healthRoute"

app.use("/api/v1/users", healthRouter)

export default app;