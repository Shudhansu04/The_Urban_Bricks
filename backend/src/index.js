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

const defaultAllowedOrigins = [
  "https://theurbanbricks.com",
  "https://www.theurbanbricks.com",
  "https://the-urban-bricks1.vercel.app",
  env.frontendUrl,
  "http://localhost:5173",
];

const allowedOrigins = [...new Set([...defaultAllowedOrigins, ...env.corsOrigins])].filter(Boolean);
const vercelPreviewPattern = /^https:\/\/[a-zA-Z0-9-]+\.vercel\.app$/;

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without Origin (server-to-server, health checks, curl, Postman).
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      if (env.allowVercelPreview && vercelPreviewPattern.test(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(morgan("combined"));

app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));


app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

const authRateLimit = rateLimit(env.rateLimitMax, env.rateLimitWindowMs);
app.use("/api/auth", authRateLimit, authRoutes);
app.use(authenticate);
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
  const emailOk = !!(env.resendApiKey || (env.smtpHost && env.smtpUser && env.smtpPassword)) && env.adminEmail;
  console.log("[server] Email notifications:", emailOk ? "Configured (Resend or SMTP)" : "NOT CONFIGURED (set RESEND_API_KEY or SMTP_* + ADMIN_EMAIL on Render)");
});
