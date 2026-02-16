export function errorHandler(err, req, res, next) {
  console.error("[error]", err);

  if (err.name === "ValidationError" || err.name === "ZodError") {
    return res.status(400).json({ error: "Validation failed", details: err.message });
  }

  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ error: "Invalid token" });
  }

  if (err.name === "MulterError") {
    return res.status(400).json({ error: err.message });
  }

  if (err.message === "Only image files are allowed") {
    return res.status(400).json({ error: err.message });
  }

  if (err.name === "PrismaClientKnownRequestError") {
    if (err.code === "P2002") {
      return res.status(400).json({ error: "Duplicate entry" });
    }
    if (err.code === "P2025") {
      return res.status(404).json({ error: "Record not found" });
    }
  }

  res.status(500).json({
    error: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
}
