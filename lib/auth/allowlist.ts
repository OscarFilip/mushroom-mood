/**
 * Email allowlist utilities for beta access control
 */

/**
 * Parses and normalizes emails from comma-separated environment variable
 * @param emailList - Comma-separated email addresses
 * @returns Array of normalized (lowercased, trimmed) email addresses
 */
export function parseEmailAllowlist(emailList: string | undefined): string[] {
  if (!emailList) {
    return [];
  }

  return emailList
    .split(",")
    .map((email) => email.toLowerCase().trim())
    .filter((email) => email.length > 0);
}

/**
 * Normalizes an email address for comparison
 * @param email - Email address to normalize
 * @returns Normalized email (lowercased, trimmed)
 */
export function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Checks if an email is in the beta allowed list
 * @param email - Email address to check
 * @returns True if email is in the beta allowlist
 */
export function isBetaAllowed(email: string): boolean {
  const allowlist = parseEmailAllowlist(process.env.BETA_ALLOWED_EMAILS);
  return allowlist.includes(normalizeEmail(email));
}

/**
 * Checks if an email is an admin/restricted user
 * @param email - Email address to check
 * @returns True if email is in the admin allowlist
 */
export function isAdmin(email: string): boolean {
  const adminList = parseEmailAllowlist(process.env.BETA_ADMIN_EMAILS);
  return adminList.includes(normalizeEmail(email));
}
