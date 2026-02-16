import express from "express";
import path from "path";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import { env } from "./config/env.js";
import { authenticate } from "./middleware/auth.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { rateLimit } from "./middleware/rateLimit.js";
import authRoutes from "./routes/auth.js";
import propertyRoutes from "./routes/property.js";
import inquiryRoutes from "./routes/inquiry.js";
import adminRoutes from "./routes/admin.js";
import blogRoutes from "./routes/blog.js";
import projectRoutes from "./routes/project.js";
import leadRoutes from "./routes/lead.js";
import testRoutes from "./routes/test.js";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.frontendUrl,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan("combined"));

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));
app.use(authenticate);

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

const authRateLimit =
  process.env.NODE_ENV === "production" ? rateLimit(10, 15 * 60 * 1000) : rateLimit(200, 5 * 60 * 1000);
app.use("/api/auth", authRateLimit, authRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/inquiries", inquiryRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/leads", leadRoutes);
app.use("/api/test", testRoutes);

app.use(errorHandler);

const PORT = env.port;
app.listen(PORT, () => {
  console.log(`[server] Listening on port ${PORT}`);
  console.log("Database Connected");
});
