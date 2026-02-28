import crypto from "crypto";

const OAUTH_STATE_SECRET = process.env.OAUTH_STATE_SECRET || process.env.AUTH_SECRET || "fallback-secret";

/**
 * Create a signed OAuth state parameter with CSRF protection
 */
export function createOAuthState(userId: string): string {
  const nonce = crypto.randomBytes(16).toString("hex");
  const timestamp = Date.now().toString();
  const payload = `${userId}:${nonce}:${timestamp}`;
  const signature = crypto
    .createHmac("sha256", OAUTH_STATE_SECRET)
    .update(payload)
    .digest("hex");
  return Buffer.from(`${payload}:${signature}`).toString("base64url");
}

/**
 * Verify and decode a signed OAuth state parameter
 * Returns userId if valid, null if invalid or expired
 */
export function verifyOAuthState(state: string, maxAgeMs = 10 * 60 * 1000): string | null {
  try {
    const decoded = Buffer.from(state, "base64url").toString("utf-8");
    const parts = decoded.split(":");

    if (parts.length !== 4) return null;

    const [userId, nonce, timestamp, signature] = parts;

    // Verify signature
    const payload = `${userId}:${nonce}:${timestamp}`;
    const expectedSignature = crypto
      .createHmac("sha256", OAUTH_STATE_SECRET)
      .update(payload)
      .digest("hex");

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return null;
    }

    // Check expiration
    const stateTime = parseInt(timestamp, 10);
    if (isNaN(stateTime) || Date.now() - stateTime > maxAgeMs) {
      return null;
    }

    return userId;
  } catch {
    return null;
  }
}
