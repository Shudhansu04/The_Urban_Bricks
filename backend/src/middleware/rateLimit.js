const rateLimitMap = new Map();

export function rateLimit(maxRequests = 25, windowMs = 15 * 60 * 1000) {
  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const record = rateLimitMap.get(key);

    if (!record || now - record.resetTime > windowMs) {
      rateLimitMap.set(key, {
        count: 1,
        resetTime: now,
      });
      return next();
    }

    if (record.count >= maxRequests) {
      return res.status(429).json({
        error: "Too many requests, please try again later",
        retryAfter: Math.ceil((windowMs - (now - record.resetTime)) / 1000),
      });
    }

    record.count++;
    next();
  };
}
