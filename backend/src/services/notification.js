import nodemailer from "nodemailer";
import twilio from "twilio";
import { env } from "../config/env.js";
import { prisma } from "../config/prisma.js";

// Initialize Nodemailer transporter
let emailTransporter = null;
if (env.smtpHost && env.smtpUser && env.smtpPassword) {
  emailTransporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: env.smtpPort,
    secure: env.smtpSecure, // true for 465, false for other ports (587 uses STARTTLS)
    auth: {
      user: env.smtpUser,
      pass: env.smtpPassword,
    },
    connectionTimeout: 30000, // 30s - cloud providers can be slow to reach SMTP
    greetingTimeout: 30000,
    socketTimeout: 60000, // 60s for slow networks
  });
  console.log("[notification] Nodemailer transporter initialized (host:", env.smtpHost + ")");
} else {
  const missing = [];
  if (!env.smtpHost) missing.push("SMTP_HOST");
  if (!env.smtpUser) missing.push("SMTP_USER");
  if (!env.smtpPassword) missing.push("SMTP_PASSWORD");
  console.warn("[notification] Nodemailer not configured - missing:", missing.join(", "));
}

// Initialize Twilio client
let twilioClient = null;
if (env.twilioSid && env.twilioToken) {
  try {
    twilioClient = twilio(env.twilioSid, env.twilioToken);
    console.log("[notification] Twilio client initialized");
    console.log("[notification] Twilio SID:", env.twilioSid.substring(0, 10) + "...");
    console.log("[notification] WhatsApp From:", env.twilioWhatsappFrom || "Not set");
    console.log("[notification] WhatsApp To:", env.adminWhatsappTo || "Not set");
  } catch (err) {
    console.error("[notification] Failed to initialize Twilio client:", err.message);
  }
} else {
  console.warn("[notification] Twilio not configured - missing TWILIO_ACCOUNT_SID or TWILIO_AUTH_TOKEN");
}

function isValidObjectId(value) {
  return typeof value === "string" && /^[a-fA-F0-9]{24}$/.test(value);
}

async function logNotification(propertyId, channel, status, detail = null) {
  try {
    await prisma.notificationLog.create({
      data: { 
        propertyId: isValidObjectId(propertyId) ? propertyId : null,
        channel, 
        status, 
        detail: detail || null,
      },
    });
  } catch (err) {
    console.error("[notification] Failed to log:", err);
  }
}

// Helper function to send email using Nodemailer
async function sendEmail(to, subject, html) {
  if (!emailTransporter) {
    throw new Error("Email transporter not configured. Check SMTP settings.");
  }
  if (!env.emailFrom) {
    throw new Error("EMAIL_FROM is not set");
  }

  const mailOptions = {
    from: env.emailFrom,
    to,
    subject,
    html,
  };

  const info = await emailTransporter.sendMail(mailOptions);
  return info;
}

export async function sendEmailNotification(property) {
  console.log("[notification] Attempting to send email notification");
  console.log("[notification] Config check - SMTP configured:", !!emailTransporter, "Admin Email:", env.adminEmail);
  
  if (!emailTransporter || !env.adminEmail) {
    const reason = !emailTransporter ? "Missing SMTP configuration" : "Missing ADMIN_EMAIL";
    console.warn(`[notification] Email not configured - ${reason}`);
    await logNotification(property.id, "email", "skipped", reason);
    return;
  }

  try {
    console.log(`[notification] Sending email to: ${env.adminEmail} from: ${env.emailFrom}`);
    
    const submissionDate = property.createdAt 
      ? new Date(property.createdAt).toLocaleString() 
      : new Date().toLocaleString();

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Property Listing Submitted</h2>
        
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #111;">Property Information</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 150px;">Property ID:</td>
              <td style="padding: 8px 0;">${property.id}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Title:</td>
              <td style="padding: 8px 0;">${property.title}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Price:</td>
              <td style="padding: 8px 0;"><strong style="color: #2563eb;">$${Number(property.price).toLocaleString()}</strong></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Location:</td>
              <td style="padding: 8px 0;">${property.location}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">City:</td>
              <td style="padding: 8px 0;">${property.city || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">State:</td>
              <td style="padding: 8px 0;">${property.state || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Country:</td>
              <td style="padding: 8px 0;">${property.country || "N/A"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Status:</td>
              <td style="padding: 8px 0;"><span style="background: #fef3c7; padding: 4px 8px; border-radius: 4px;">${property.status}</span></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Submitted:</td>
              <td style="padding: 8px 0;">${submissionDate}</td>
            </tr>
          </table>
          <div style="margin-top: 15px;">
            <p style="margin: 5px 0; font-weight: bold;">Description:</p>
            <p style="margin: 5px 0; color: #555; line-height: 1.6;">${property.description}</p>
          </div>
          ${property.mediaUrls && property.mediaUrls.length > 0 ? `
            <div style="margin-top: 15px;">
              <p style="margin: 5px 0; font-weight: bold;">Images:</p>
              <p style="margin: 5px 0; color: #555;">${property.mediaUrls.length} image(s) attached</p>
            </div>
          ` : ''}
        </div>

        <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #111;">Client/Owner Information</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 150px;">Owner ID:</td>
              <td style="padding: 8px 0;">${property.owner.id}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Full Name:</td>
              <td style="padding: 8px 0;">${property.owner.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Email Address:</td>
              <td style="padding: 8px 0;"><a href="mailto:${property.owner.email}">${property.owner.email}</a></td>
            </tr>
            ${property.owner.phone ? `
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Phone Number:</td>
              <td style="padding: 8px 0;"><a href="tel:${property.owner.phone}">${property.owner.phone}</a></td>
            </tr>
            ` : ''}
          </table>
        </div>

        <p style="color: #666; font-size: 14px; margin-top: 20px;">
          Please review and approve/reject this listing in the admin dashboard.
        </p>
      </div>
    `;

    const result = await sendEmail(env.adminEmail, `New Property Listing: ${property.title}`, html);
    console.log("[notification] Email sent:", result.messageId);
    await logNotification(property.id, "email", "sent", `Email delivered successfully. Message ID: ${result.messageId}`);
    console.log(`[notification] ✅ Email sent successfully to ${env.adminEmail}`);
  } catch (err) {
    console.error("[notification] ❌ Email failed with error:", err.message);
    await logNotification(property.id, "email", "failed", err.message || "Unknown error");
  }
}

export async function sendWhatsAppNotification(property) {
  console.log("[notification] ===== WhatsApp Notification Debug =====");
  console.log("[notification] Twilio Client initialized:", !!twilioClient);
  console.log("[notification] TWILIO_ACCOUNT_SID:", env.twilioSid ? `${env.twilioSid.substring(0, 10)}...` : "NOT SET");
  console.log("[notification] TWILIO_AUTH_TOKEN:", env.twilioToken ? "SET (hidden)" : "NOT SET");
  console.log("[notification] TWILIO_WHATSAPP_FROM:", env.twilioWhatsappFrom || "NOT SET");
  console.log("[notification] ADMIN_WHATSAPP_TO:", env.adminWhatsappTo || "NOT SET");
  
  if (!twilioClient) {
    const reasons = [];
    if (!env.twilioSid) reasons.push("Missing TWILIO_ACCOUNT_SID");
    if (!env.twilioToken) reasons.push("Missing TWILIO_AUTH_TOKEN");
    console.error(`[notification] ❌ Twilio client not initialized - ${reasons.join(", ")}`);
    await logNotification(property.id, "whatsapp", "skipped", `Twilio client not initialized: ${reasons.join(", ")}`);
    return;
  }

  if (!env.adminWhatsappTo) {
    console.error("[notification] ❌ ADMIN_WHATSAPP_TO is not set");
    await logNotification(property.id, "whatsapp", "skipped", "Missing ADMIN_WHATSAPP_TO");
    return;
  }

  if (!env.twilioWhatsappFrom) {
    console.error("[notification] ❌ TWILIO_WHATSAPP_FROM is not set");
    await logNotification(property.id, "whatsapp", "skipped", "Missing TWILIO_WHATSAPP_FROM");
    return;
  }

  try {
    const submissionDate = property.createdAt 
      ? new Date(property.createdAt).toLocaleString() 
      : new Date().toLocaleString();

    const message = `🏠 *New Property Listing Submitted*\n\n*Property Information:*\n━━━━━━━━━━━━━━━━━━━━\n🆔 Property ID: ${property.id}\n📝 Title: ${property.title}\n💰 Price: $${Number(property.price).toLocaleString()}\n📍 Location: ${property.location}\n🏙️ City: ${property.city || "N/A"}\n🗺️ State: ${property.state || "N/A"}\n📊 Status: ${property.status}\n📅 Submitted: ${submissionDate}\n\n*Client/Owner Information:*\n━━━━━━━━━━━━━━━━━━━━\n🆔 Owner ID: ${property.owner.id}\n👤 Name: ${property.owner.name}\n📧 Email: ${property.owner.email}\n${property.owner.phone ? `📱 Phone: ${property.owner.phone}\n` : ''}\nPlease review in admin dashboard.`;

    const fromNumber = env.twilioWhatsappFrom.startsWith("whatsapp:") 
      ? env.twilioWhatsappFrom 
      : `whatsapp:${env.twilioWhatsappFrom}`;
    const toNumber = env.adminWhatsappTo.startsWith("whatsapp:") 
      ? env.adminWhatsappTo 
      : `whatsapp:${env.adminWhatsappTo}`;

    console.log(`[notification] Sending WhatsApp message...`);
    console.log(`[notification] From: ${fromNumber}`);
    console.log(`[notification] To: ${toNumber}`);
    console.log(`[notification] Message length: ${message.length} characters`);
    
    const result = await twilioClient.messages.create({
      from: fromNumber,
      to: toNumber,
      body: message,
    });

    console.log("[notification] ✅ Twilio API Response:");
    console.log("[notification]   Message SID:", result.sid);
    console.log("[notification]   Status:", result.status);
    console.log("[notification]   Error Code:", result.errorCode || "None");
    console.log("[notification]   Error Message:", result.errorMessage || "None");
    
    await logNotification(property.id, "whatsapp", "sent", `Message SID: ${result.sid}, Status: ${result.status}`);
    console.log(`[notification] ✅ WhatsApp sent successfully to ${toNumber}`);
  } catch (err) {
    console.error("[notification] ❌ WhatsApp failed with error:");
    console.error("[notification]   Error message:", err.message);
    console.error("[notification]   Error code:", err.code);
    console.error("[notification]   Error status:", err.status);
    console.error("[notification]   More info:", err.moreInfo || "N/A");
    console.error("[notification]   Full error:", JSON.stringify(err, null, 2));
    await logNotification(property.id, "whatsapp", "failed", `Error: ${err.message} (Code: ${err.code || "N/A"})`);
  }
}

export async function notifyAdminOnNewListing(property) {
  console.log("[notification] Triggering notifications for property:", property.id);
  try {
    await Promise.all([
      sendEmailNotification(property),
      sendWhatsAppNotification(property),
    ]);
    console.log("[notification] All notifications processed for property:", property.id);
  } catch (err) {
    console.error("[notification] Error in notifyAdminOnNewListing:", err);
  }
}

// New user registration notifications
export async function sendUserRegistrationEmail(user) {
  if (!emailTransporter || !env.adminEmail) {
    console.warn("[notification] Email not configured for user registration - SMTP:", !!emailTransporter, "Admin Email:", !!env.adminEmail);
    await logNotification(null, "email", "skipped", "Email not configured", user.id);
    return;
  }

  try {
    const registrationDate = user.createdAt 
      ? new Date(user.createdAt).toLocaleString() 
      : new Date().toLocaleString();

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New User Registration</h2>
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #111;">Client Information</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 150px;">User ID:</td>
              <td style="padding: 8px 0;">${user.id}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Full Name:</td>
              <td style="padding: 8px 0;">${user.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Email Address:</td>
              <td style="padding: 8px 0;"><a href="mailto:${user.email}">${user.email}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Phone Number:</td>
              <td style="padding: 8px 0;">${user.phone || "Not provided"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Location:</td>
              <td style="padding: 8px 0;">${user.location || "Not provided"}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Account Role:</td>
              <td style="padding: 8px 0;">${user.role}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Registration Date:</td>
              <td style="padding: 8px 0;">${registrationDate}</td>
            </tr>
          </table>
        </div>
        <p style="color: #666; font-size: 14px;">
          A new client has registered on the property marketplace. You can view their profile in the admin dashboard.
        </p>
      </div>
    `;

    const result = await sendEmail(env.adminEmail, `New User Registration: ${user.name}`, html);
    await logNotification(null, "email", "sent", `User registration email delivered. Message ID: ${result.messageId}`, user.id);
    console.log("[notification] User registration email sent to admin");
  } catch (err) {
    console.error("[notification] User registration email failed:", err);
    await logNotification(null, "email", "failed", err.message, user.id);
  }
}

export async function sendUserRegistrationWhatsApp(user) {
  if (!twilioClient || !env.adminWhatsappTo || !env.twilioWhatsappFrom) {
    const reasons = [];
    if (!twilioClient) reasons.push("Twilio client not initialized");
    if (!env.adminWhatsappTo) reasons.push("Missing ADMIN_WHATSAPP_TO");
    if (!env.twilioWhatsappFrom) reasons.push("Missing TWILIO_WHATSAPP_FROM");
    console.warn(`[notification] Twilio WhatsApp not configured for user registration - ${reasons.join(", ")}`);
    await logNotification(null, "whatsapp", "skipped", `Twilio not configured: ${reasons.join(", ")}`, user.id);
    return;
  }

  try {
    const registrationDate = user.createdAt 
      ? new Date(user.createdAt).toLocaleString() 
      : new Date().toLocaleString();

    const message = `👤 *New User Registration*\n\n*Client Information:*\n━━━━━━━━━━━━━━━━━━━━\n🆔 User ID: ${user.id}\n👤 Name: ${user.name}\n📧 Email: ${user.email}\n📱 Phone: ${user.phone || "Not provided"}\n📍 Location: ${user.location || "Not provided"}\n🔐 Role: ${user.role}\n📅 Registered: ${registrationDate}\n\nA new client has joined the platform.`;

    const fromNumber = env.twilioWhatsappFrom.startsWith("whatsapp:") 
      ? env.twilioWhatsappFrom 
      : `whatsapp:${env.twilioWhatsappFrom}`;
    const toNumber = env.adminWhatsappTo.startsWith("whatsapp:") 
      ? env.adminWhatsappTo 
      : `whatsapp:${env.adminWhatsappTo}`;

    const result = await twilioClient.messages.create({
      from: fromNumber,
      to: toNumber,
      body: message,
    });

    console.log("[notification] User registration WhatsApp sent:", result.sid, result.status);
    await logNotification(null, "whatsapp", "sent", `User registration WhatsApp delivered. SID: ${result.sid}`, user.id);
    console.log("[notification] ✅ User registration WhatsApp sent to admin");
  } catch (err) {
    console.error("[notification] ❌ User registration WhatsApp failed:", err.message);
    console.error("[notification] Error code:", err.code, "Status:", err.status);
    await logNotification(null, "whatsapp", "failed", `Error: ${err.message} (Code: ${err.code || "N/A"})`, user.id);
  }
}

export async function notifyAdminOnNewUser(user) {
  console.log("[notification] Triggering notifications for new user:", user.id);
  try {
    await Promise.all([
      sendUserRegistrationEmail(user),
      sendUserRegistrationWhatsApp(user),
    ]);
    console.log("[notification] All notifications processed for user:", user.id);
  } catch (err) {
    console.error("[notification] Error in notifyAdminOnNewUser:", err);
  }
}

export async function sendPasswordResetEmail(user, resetLink) {
  if (!emailTransporter || !user?.email) {
    throw new Error("Email transporter not configured or user email missing");
  }

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Reset Your Password</h2>
      <p style="color: #444;">
        We received a request to reset your password. Click the button below to create a new one.
      </p>
      <div style="margin: 24px 0;">
        <a href="${resetLink}" style="background: #2563eb; color: #fff; padding: 12px 18px; text-decoration: none; border-radius: 6px; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p style="color: #666; font-size: 14px;">
        If you did not request this, you can ignore this email. This link expires in 1 hour.
      </p>
    </div>
  `;

  await sendEmail(user.email, "Reset your password", html);
}

// Inquiry notifications - notify property owner
export async function sendInquiryEmailToOwner(inquiry, property, buyer) {
  console.log("[notification] Attempting to send inquiry email to owner");
  console.log("[notification] Owner email:", property.owner.email);
  
  if (!emailTransporter || !property.owner.email) {
    const reason = !emailTransporter ? "Missing SMTP configuration" : "Owner email not found";
    console.warn(`[notification] Email not configured for inquiry - ${reason}`);
    await logNotification(property.id, "email", "skipped", `Inquiry notification: ${reason}`, property.owner.id);
    return;
  }

  try {
    const buyerName = buyer ? buyer.name : "Anonymous User";
    const buyerEmail = buyer ? buyer.email : "Not provided";
    const buyerPhone = buyer?.phone || "Not provided";
    const inquiryDate = inquiry.createdAt 
      ? new Date(inquiry.createdAt).toLocaleString() 
      : new Date().toLocaleString();

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Property Inquiry</h2>
        
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #111;">Your Property</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 150px;">Property:</td>
              <td style="padding: 8px 0;">${property.title}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Price:</td>
              <td style="padding: 8px 0;"><strong style="color: #2563eb;">$${Number(property.price).toLocaleString()}</strong></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Location:</td>
              <td style="padding: 8px 0;">${property.location}</td>
            </tr>
          </table>
        </div>

        <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #111;">Buyer Information</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 150px;">Name:</td>
              <td style="padding: 8px 0;">${buyerName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Email:</td>
              <td style="padding: 8px 0;"><a href="mailto:${buyerEmail}">${buyerEmail}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Phone:</td>
              <td style="padding: 8px 0;">${buyerPhone}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Inquiry Date:</td>
              <td style="padding: 8px 0;">${inquiryDate}</td>
            </tr>
          </table>
        </div>

        <div style="background: #fff7ed; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #111;">Message from Buyer</h3>
          <p style="color: #555; line-height: 1.6; white-space: pre-wrap;">${inquiry.message}</p>
        </div>

        <p style="color: #666; font-size: 14px; margin-top: 20px;">
          Please contact the buyer to discuss further details about your property.
        </p>
      </div>
    `;

    const result = await sendEmail(property.owner.email, `New Inquiry for Your Property: ${property.title}`, html);
    console.log("[notification] Email sent:", result.messageId);
    await logNotification(property.id, "email", "sent", `Inquiry notification sent to owner. Message ID: ${result.messageId}`, property.owner.id);
    console.log(`[notification] ✅ Inquiry email sent to property owner: ${property.owner.email}`);
  } catch (err) {
    console.error("[notification] ❌ Inquiry email failed:", err.message);
    await logNotification(property.id, "email", "failed", `Inquiry notification: ${err.message}`, property.owner.id);
  }
}

export async function sendInquiryWhatsAppToOwner(inquiry, property, buyer) {
  console.log("[notification] Attempting to send inquiry WhatsApp to owner");
  console.log("[notification] Owner WhatsApp:", property.owner.phone);
  
  if (!twilioClient || !property.owner.phone || !env.twilioWhatsappFrom) {
    const reasons = [];
    if (!twilioClient) reasons.push("Twilio client not initialized");
    if (!property.owner.phone) reasons.push("Owner phone not found");
    if (!env.twilioWhatsappFrom) reasons.push("Missing TWILIO_WHATSAPP_FROM");
    console.warn(`[notification] Twilio WhatsApp not configured for inquiry - ${reasons.join(", ")}`);
    await logNotification(property.id, "whatsapp", "skipped", `Inquiry notification: ${reasons.join(", ")}`, property.owner.id);
    return;
  }

  try {
    const buyerName = buyer ? buyer.name : "Anonymous User";
    const buyerEmail = buyer ? buyer.email : "Not provided";
    const buyerPhone = buyer?.phone || "Not provided";
    const inquiryDate = inquiry.createdAt 
      ? new Date(inquiry.createdAt).toLocaleString() 
      : new Date().toLocaleString();

    // Format phone number for WhatsApp
    const ownerPhone = property.owner.phone.startsWith("whatsapp:") 
      ? property.owner.phone 
      : `whatsapp:${property.owner.phone}`;

    const message = `🏠 *New Property Inquiry*\n\n*Your Property:*\n━━━━━━━━━━━━━━━━━━━━\n📝 ${property.title}\n💰 $${Number(property.price).toLocaleString()}\n📍 ${property.location}\n\n*Buyer Information:*\n━━━━━━━━━━━━━━━━━━━━\n👤 Name: ${buyerName}\n📧 Email: ${buyerEmail}\n📱 Phone: ${buyerPhone}\n📅 Inquiry Date: ${inquiryDate}\n\n*Message:*\n${inquiry.message}\n\nPlease contact the buyer to discuss further.`;

    console.log(`[notification] Sending inquiry WhatsApp to ${ownerPhone}`);
    
    const result = await twilioClient.messages.create({
      from: `whatsapp:${env.twilioWhatsappFrom}`,
      to: ownerPhone,
      body: message,
    });

    console.log("[notification] Twilio response:", result.sid, result.status);
    await logNotification(property.id, "whatsapp", "sent", `Inquiry notification SID: ${result.sid}`, property.owner.id);
    console.log(`[notification] ✅ Inquiry WhatsApp sent to property owner`);
  } catch (err) {
    console.error("[notification] ❌ Inquiry WhatsApp failed:", err.message);
    await logNotification(property.id, "whatsapp", "failed", `Inquiry notification: ${err.message}`, property.owner.id);
  }
}

export async function notifyOwnerOnInquiry(inquiry, property, buyer) {
  console.log("[notification] Triggering notifications for inquiry:", inquiry.id);
  await Promise.all([
    sendInquiryEmailToOwner(inquiry, property, buyer),
    sendInquiryWhatsAppToOwner(inquiry, property, buyer),
  ]);
}

// Inquiry notifications - notify admin
export async function sendInquiryEmailToAdmin(inquiry, property, buyer) {
  console.log("[notification] Attempting to send inquiry email to admin");
  
  if (!emailTransporter || !env.adminEmail) {
    const reason = !emailTransporter ? "Missing SMTP configuration" : "Missing ADMIN_EMAIL";
    console.warn(`[notification] Email not configured for inquiry admin notification - ${reason}`);
    await logNotification(property.id, "email", "skipped", `Admin inquiry notification: ${reason}`);
    return;
  }

  try {
    const buyerName = buyer ? buyer.name : "Anonymous User";
    const buyerEmail = buyer ? buyer.email : "Not provided";
    const buyerPhone = buyer?.phone || "Not provided";
    const inquiryDate = inquiry.createdAt 
      ? new Date(inquiry.createdAt).toLocaleString() 
      : new Date().toLocaleString();

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Property Inquiry</h2>
        
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #111;">Property Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 150px;">Property:</td>
              <td style="padding: 8px 0;">${property.title}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Price:</td>
              <td style="padding: 8px 0;"><strong style="color: #2563eb;">$${Number(property.price).toLocaleString()}</strong></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Location:</td>
              <td style="padding: 8px 0;">${property.location}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Owner:</td>
              <td style="padding: 8px 0;">${property.owner.name} (${property.owner.email})</td>
            </tr>
          </table>
        </div>

        <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #111;">Buyer Information</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 150px;">Name:</td>
              <td style="padding: 8px 0;">${buyerName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Email:</td>
              <td style="padding: 8px 0;"><a href="mailto:${buyerEmail}">${buyerEmail}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Phone:</td>
              <td style="padding: 8px 0;">${buyerPhone}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Inquiry Date:</td>
              <td style="padding: 8px 0;">${inquiryDate}</td>
            </tr>
          </table>
        </div>

        <div style="background: #fff7ed; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #111;">Message from Buyer</h3>
          <p style="color: #555; line-height: 1.6; white-space: pre-wrap;">${inquiry.message}</p>
        </div>
      </div>
    `;

    const result = await sendEmail(env.adminEmail, `New Inquiry: ${buyerName} interested in ${property.title}`, html);
    console.log("[notification] Email sent:", result.messageId);
    await logNotification(property.id, "email", "sent", `Admin inquiry notification sent. Message ID: ${result.messageId}`);
    console.log(`[notification] ✅ Inquiry email sent to admin`);
  } catch (err) {
    console.error("[notification] ❌ Admin inquiry email failed:", err.message);
    await logNotification(property.id, "email", "failed", `Admin inquiry notification: ${err.message}`);
  }
}

export async function sendInquiryWhatsAppToAdmin(inquiry, property, buyer) {
  console.log("[notification] Attempting to send inquiry WhatsApp to admin");
  
  if (!twilioClient || !env.adminWhatsappTo || !env.twilioWhatsappFrom) {
    const reasons = [];
    if (!twilioClient) reasons.push("Twilio client not initialized");
    if (!env.adminWhatsappTo) reasons.push("Missing ADMIN_WHATSAPP_TO");
    if (!env.twilioWhatsappFrom) reasons.push("Missing TWILIO_WHATSAPP_FROM");
    console.warn(`[notification] Twilio WhatsApp not configured for inquiry admin notification - ${reasons.join(", ")}`);
    await logNotification(property.id, "whatsapp", "skipped", `Admin inquiry notification: ${reasons.join(", ")}`);
    return;
  }

  try {
    const buyerName = buyer ? buyer.name : "Anonymous User";
    const buyerEmail = buyer ? buyer.email : "Not provided";
    const buyerPhone = buyer?.phone || "Not provided";
    const inquiryDate = inquiry.createdAt 
      ? new Date(inquiry.createdAt).toLocaleString() 
      : new Date().toLocaleString();

    const message = `🏠 *New Property Inquiry*\n\n*Property:*\n━━━━━━━━━━━━━━━━━━━━\n📝 ${property.title}\n💰 $${Number(property.price).toLocaleString()}\n📍 ${property.location}\n👤 Owner: ${property.owner.name}\n\n*Buyer:*\n━━━━━━━━━━━━━━━━━━━━\n👤 ${buyerName}\n📧 ${buyerEmail}\n📱 ${buyerPhone}\n📅 ${inquiryDate}\n\n*Message:*\n${inquiry.message}`;

    const fromNumber = env.twilioWhatsappFrom.startsWith("whatsapp:")
      ? env.twilioWhatsappFrom
      : `whatsapp:${env.twilioWhatsappFrom}`;
    const toNumber = env.adminWhatsappTo.startsWith("whatsapp:")
      ? env.adminWhatsappTo
      : `whatsapp:${env.adminWhatsappTo}`;

    const result = await twilioClient.messages.create({
      from: fromNumber,
      to: toNumber,
      body: message,
    });

    console.log("[notification] Twilio response:", result.sid, result.status);
    await logNotification(property.id, "whatsapp", "sent", `Admin inquiry notification SID: ${result.sid}`);
    console.log(`[notification] ✅ Inquiry WhatsApp sent to admin`);
  } catch (err) {
    console.error("[notification] ❌ Admin inquiry WhatsApp failed:", err.message);
    await logNotification(property.id, "whatsapp", "failed", `Admin inquiry notification: ${err.message}`);
  }
}

export async function notifyAdminOnInquiry(inquiry, property, buyer) {
  console.log("[notification] Triggering admin notifications for inquiry:", inquiry.id);
  await Promise.all([
    sendInquiryEmailToAdmin(inquiry, property, buyer),
    sendInquiryWhatsAppToAdmin(inquiry, property, buyer),
  ]);
}

export async function sendLeadEmailToAdmin(lead, property) {
  if (!emailTransporter || !env.adminEmail) {
    const reason = !emailTransporter ? "Missing SMTP configuration" : "Missing ADMIN_EMAIL";
    console.warn(`[notification] Email not configured for lead admin notification - ${reason}`);
    await logNotification(property.id, "email", "skipped", `Lead admin notification: ${reason}`);
    return;
  }

  try {
    const submittedAt = lead.createdAt ? new Date(lead.createdAt).toLocaleString() : new Date().toLocaleString();
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New ${lead.type} Request</h2>
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #111;">Property Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 150px;">Property:</td>
              <td style="padding: 8px 0;">${property.title}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Price:</td>
              <td style="padding: 8px 0;"><strong style="color: #2563eb;">$${Number(property.price).toLocaleString()}</strong></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Location:</td>
              <td style="padding: 8px 0;">${property.location}</td>
            </tr>
          </table>
        </div>
        <div style="background: #eff6ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #111;">Client Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; font-weight: bold; width: 150px;">Name:</td>
              <td style="padding: 8px 0;">${lead.name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Email:</td>
              <td style="padding: 8px 0;"><a href="mailto:${lead.email}">${lead.email}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Phone:</td>
              <td style="padding: 8px 0;">${lead.phone}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; font-weight: bold;">Submitted:</td>
              <td style="padding: 8px 0;">${submittedAt}</td>
            </tr>
          </table>
        </div>
        ${lead.message ? `
          <div style="background: #fff7ed; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; color: #111;">Message</h3>
            <p style="color: #555; line-height: 1.6; white-space: pre-wrap;">${lead.message}</p>
          </div>
        ` : ""}
      </div>
    `;

    const result = await sendEmail(env.adminEmail, `New ${lead.type} Request: ${property.title}`, html);
    await logNotification(property.id, "email", "sent", `Lead admin notification sent. Message ID: ${result.messageId}`);
  } catch (err) {
    console.error("[notification] ❌ Lead admin email failed:", err.message);
    await logNotification(property.id, "email", "failed", `Lead admin notification: ${err.message}`);
  }
}

export async function sendLeadWhatsAppToAdmin(lead, property) {
  if (!twilioClient || !env.adminWhatsappTo || !env.twilioWhatsappFrom) {
    const reasons = [];
    if (!twilioClient) reasons.push("Twilio client not initialized");
    if (!env.adminWhatsappTo) reasons.push("Missing ADMIN_WHATSAPP_TO");
    if (!env.twilioWhatsappFrom) reasons.push("Missing TWILIO_WHATSAPP_FROM");
    console.warn(`[notification] Twilio WhatsApp not configured for lead admin notification - ${reasons.join(", ")}`);
    await logNotification(property.id, "whatsapp", "skipped", `Lead admin notification: ${reasons.join(", ")}`);
    return;
  }

  try {
    const submittedAt = lead.createdAt ? new Date(lead.createdAt).toLocaleString() : new Date().toLocaleString();
    const message = `🏠 *New ${lead.type} Request*\n\n*Property:*\n━━━━━━━━━━━━━━━━━━━━\n📝 ${property.title}\n💰 $${Number(property.price).toLocaleString()}\n📍 ${property.location}\n\n*Client:*\n━━━━━━━━━━━━━━━━━━━━\n👤 ${lead.name}\n📧 ${lead.email}\n📱 ${lead.phone}\n📅 ${submittedAt}\n\n${lead.message ? `Message:\n${lead.message}` : ""}`;

    const normalize = (value) => {
      if (!value) return "";
      let v = value.trim();
      if (v.startsWith("whatsapp:")) {
        v = v.slice("whatsapp:".length);
      }
      return v.replace(/\s+/g, "");
    };

    const fromRaw = normalize(env.twilioWhatsappFrom);
    const toRaw = normalize(env.adminWhatsappTo);

    if (!fromRaw.startsWith("+") || !toRaw.startsWith("+")) {
      throw new Error("WhatsApp numbers must be in E.164 format like +1234567890");
    }

    const fromNumber = `whatsapp:${fromRaw}`;
    const toNumber = `whatsapp:${toRaw}`;

    console.log("[notification] Lead WhatsApp From:", fromNumber);
    console.log("[notification] Lead WhatsApp To:", toNumber);

    const result = await twilioClient.messages.create({
      from: fromNumber,
      to: toNumber,
      body: message,
    });

    await logNotification(property.id, "whatsapp", "sent", `Lead admin notification SID: ${result.sid}`);
  } catch (err) {
    console.error("[notification] ❌ Lead admin WhatsApp failed:", err.message);
    await logNotification(property.id, "whatsapp", "failed", `Lead admin notification: ${err.message}`);
  }
}

export async function notifyAdminOnLead(lead, property) {
  console.log("[notification] Triggering admin notifications for lead:", lead.id);
  await Promise.all([
    sendLeadEmailToAdmin(lead, property),
    sendLeadWhatsAppToAdmin(lead, property),
  ]);
}
