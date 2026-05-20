const rateLimitMap = new Map();

function cleanupOldEntries() {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now - entry.windowStart > entry.windowMs * 2) {
      rateLimitMap.delete(key);
    }
  }
}

setInterval(cleanupOldEntries, 60_000);

export function rateLimit({ max = 10, windowMs = 60_000, message = 'Too many requests, please try again later' } = {}) {
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const key = `${req.path}:${ip}`;
    const now = Date.now();

    let entry = rateLimitMap.get(key);

    if (!entry || now - entry.windowStart > windowMs) {
      entry = { windowStart: now, count: 0, max, windowMs };
      rateLimitMap.set(key, entry);
    }

    entry.count++;

    if (entry.count > max) {
      return res.status(429).json({ error: message });
    }

    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, max - entry.count));
    next();
  };
}
