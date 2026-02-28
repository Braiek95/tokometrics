/**
 * Input sanitization utilities to prevent XSS and injection attacks.
 */

const HTML_ENTITIES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;",
  "`": "&#96;",
};

const ENTITY_REGEX = /[&<>"'`/]/g;

/**
 * Escape HTML special characters to prevent XSS
 */
export function escapeHtml(str: string): string {
  return str.replace(ENTITY_REGEX, (char) => HTML_ENTITIES[char] || char);
}

/**
 * Strip HTML tags from a string
 */
export function stripTags(str: string): string {
  return str.replace(/<[^>]*>/g, "");
}

/**
 * Sanitize a string input: trim, strip tags, limit length
 */
export function sanitizeString(
  input: unknown,
  maxLength = 500
): string {
  if (typeof input !== "string") return "";
  return stripTags(input).trim().slice(0, maxLength);
}

/**
 * Sanitize an email address
 */
export function sanitizeEmail(input: unknown): string {
  if (typeof input !== "string") return "";
  // Basic email sanitization: lowercase, trim, remove dangerous chars
  return input.toLowerCase().trim().replace(/[<>'"`;]/g, "").slice(0, 254);
}

/**
 * Sanitize a numeric string (for IDs, etc.)
 */
export function sanitizeId(input: unknown): string {
  if (typeof input !== "string") return "";
  // Allow only alphanumeric, hyphens, underscores (CUID format)
  return input.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 100);
}

/**
 * Sanitize search query input
 */
export function sanitizeSearch(input: unknown): string {
  if (typeof input !== "string") return "";
  return stripTags(input).trim().replace(/[<>'"`;]/g, "").slice(0, 200);
}

/**
 * Validate and sanitize a positive number
 */
export function sanitizePositiveNumber(input: unknown, defaultVal = 0): number {
  const num = Number(input);
  if (isNaN(num) || num < 0) return defaultVal;
  return num;
}

/**
 * Sanitize URL parameter dates
 */
export function sanitizeDate(input: unknown): Date | null {
  if (typeof input !== "string") return null;
  const cleaned = input.replace(/[^0-9TZ:.+-]/g, "");
  const date = new Date(cleaned);
  if (isNaN(date.getTime())) return null;
  return date;
}
