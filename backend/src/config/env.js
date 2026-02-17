import dotenv from "dotenv";

dotenv.config();

const required = [
  "DATABASE_URL",
  "JWT_SECRET",
];

for (const key of required) {
  if (!process.env[key]) {
    console.warn(`[env] Missing ${key}. Set it in your environment before deploy.`);
  }
}

export const env = {
  port: process.env.PORT ? Number(process.env.PORT) : 4000,
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || "change_me",
  frontendUrl: process.env.FRONTEND_URL || (process.env.NODE_ENV === "production" ? "https://the-urban-bricks1.vercel.app" : "http://localhost:5173"),
  apiBaseUrl: process.env.API_BASE_URL || (process.env.NODE_ENV === "production" ? "https://the-urban-bricks-1.onrender.com" : ""),
  // Nodemailer SMTP configuration
  smtpHost: process.env.SMTP_HOST || "",
  smtpPort: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587,
  smtpSecure: process.env.SMTP_SECURE === "true",
  smtpUser: process.env.SMTP_USER || "",
  smtpPassword: process.env.SMTP_PASSWORD || "",
  emailFrom: process.env.EMAIL_FROM || "onboarding@resend.dev",
  adminEmail: process.env.ADMIN_EMAIL || "",
  // Resend (API-based, works on Render - use instead of SMTP when SMTP times out)
  resendApiKey: process.env.RESEND_API_KEY || "",
  // Twilio WhatsApp configuration
  twilioSid: process.env.TWILIO_ACCOUNT_SID || "",
  twilioToken: process.env.TWILIO_AUTH_TOKEN || "",
  twilioWhatsappFrom: process.env.TWILIO_WHATSAPP_FROM || "",
  adminWhatsappTo: process.env.ADMIN_WHATSAPP_TO || "",
  // Cloudinary
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || "",
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || "",
  // Rate limit (requests per window)
  rateLimitMax: process.env.RATE_LIMIT_MAX ? Number(process.env.RATE_LIMIT_MAX) : 200,
  rateLimitWindowMs: process.env.RATE_LIMIT_WINDOW_MS ? Number(process.env.RATE_LIMIT_WINDOW_MS) : 15 * 60 * 1000,
};
