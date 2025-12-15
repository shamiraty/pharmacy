// Simple in-memory rate limiting
// In production, use Redis or a proper rate limiting service

interface RateLimitEntry {
  count: number;
  resetTime: number;
  lockedUntil?: number;
}

const attempts = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of attempts.entries()) {
    if (value.resetTime < now && (!value.lockedUntil || value.lockedUntil < now)) {
      attempts.delete(key);
    }
  }
}, 5 * 60 * 1000);

export function checkRateLimit(identifier: string): {
  allowed: boolean;
  remainingAttempts?: number;
  lockedUntil?: number;
  resetTime?: number;
} {
  const now = Date.now();
  const entry = attempts.get(identifier);

  // If no entry exists, create one
  if (!entry) {
    attempts.set(identifier, {
      count: 1,
      resetTime: now + 15 * 60 * 1000, // 15 minutes
    });
    return { allowed: true, remainingAttempts: 4, resetTime: now + 15 * 60 * 1000 };
  }

  // Check if account is locked
  if (entry.lockedUntil && entry.lockedUntil > now) {
    return { allowed: false, lockedUntil: entry.lockedUntil };
  }

  // Reset counter if time window has passed
  if (entry.resetTime < now) {
    attempts.set(identifier, {
      count: 1,
      resetTime: now + 15 * 60 * 1000,
    });
    return { allowed: true, remainingAttempts: 4, resetTime: now + 15 * 60 * 1000 };
  }

  // Increment counter
  entry.count++;

  // Lock account if too many attempts (5 failed attempts)
  if (entry.count >= 5) {
    entry.lockedUntil = now + 30 * 60 * 1000; // Lock for 30 minutes
    attempts.set(identifier, entry);
    return { allowed: false, lockedUntil: entry.lockedUntil };
  }

  attempts.set(identifier, entry);
  return {
    allowed: true,
    remainingAttempts: 5 - entry.count,
    resetTime: entry.resetTime
  };
}

export function recordFailedAttempt(identifier: string): void {
  const now = Date.now();
  const entry = attempts.get(identifier);

  if (!entry) {
    attempts.set(identifier, {
      count: 1,
      resetTime: now + 15 * 60 * 1000,
    });
    return;
  }

  // Don't increment if already locked
  if (entry.lockedUntil && entry.lockedUntil > now) {
    return;
  }

  entry.count++;

  // Lock if threshold reached
  if (entry.count >= 5) {
    entry.lockedUntil = now + 30 * 60 * 1000; // 30 minutes lockout
  }

  attempts.set(identifier, entry);
}

export function resetAttempts(identifier: string): void {
  attempts.delete(identifier);
}
