import {
  parseEmailAllowlist,
  normalizeEmail,
  isBetaAllowed,
  isAdmin,
} from "@/lib/auth/allowlist";

describe("Email Allowlist Utilities", () => {
  // Save original env vars
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe("parseEmailAllowlist", () => {
    it("should parse comma-separated emails", () => {
      const result = parseEmailAllowlist("user1@example.com,user2@example.com");
      expect(result).toEqual(["user1@example.com", "user2@example.com"]);
    });

    it("should normalize emails (lowercase, trim)", () => {
      const result = parseEmailAllowlist(
        "  User1@Example.Com , User2@EXAMPLE.COM  "
      );
      expect(result).toEqual(["user1@example.com", "user2@example.com"]);
    });

    it("should handle empty strings", () => {
      const result = parseEmailAllowlist("");
      expect(result).toEqual([]);
    });

    it("should handle undefined", () => {
      const result = parseEmailAllowlist(undefined);
      expect(result).toEqual([]);
    });

    it("should filter out empty entries", () => {
      const result = parseEmailAllowlist("user1@example.com,,user2@example.com");
      expect(result).toEqual(["user1@example.com", "user2@example.com"]);
    });
  });

  describe("normalizeEmail", () => {
    it("should lowercase email", () => {
      expect(normalizeEmail("USER@EXAMPLE.COM")).toBe("user@example.com");
    });

    it("should trim whitespace", () => {
      expect(normalizeEmail("  user@example.com  ")).toBe("user@example.com");
    });

    it("should handle mixed case and whitespace", () => {
      expect(normalizeEmail("  User@Example.Com  ")).toBe("user@example.com");
    });
  });

  describe("isBetaAllowed", () => {
    it("should return true if email is in BETA_ALLOWED_EMAILS", () => {
      process.env.BETA_ALLOWED_EMAILS = "user1@example.com,user2@example.com";
      expect(isBetaAllowed("user1@example.com")).toBe(true);
    });

    it("should return false if email is not in BETA_ALLOWED_EMAILS", () => {
      process.env.BETA_ALLOWED_EMAILS = "user1@example.com,user2@example.com";
      expect(isBetaAllowed("user3@example.com")).toBe(false);
    });

    it("should normalize email for comparison", () => {
      process.env.BETA_ALLOWED_EMAILS = "user1@example.com";
      expect(isBetaAllowed("USER1@EXAMPLE.COM")).toBe(true);
      expect(isBetaAllowed("  User1@Example.Com  ")).toBe(true);
    });

    it("should return false if BETA_ALLOWED_EMAILS is not set", () => {
      delete process.env.BETA_ALLOWED_EMAILS;
      expect(isBetaAllowed("user1@example.com")).toBe(false);
    });
  });

  describe("isAdmin", () => {
    it("should return true if email is in BETA_ADMIN_EMAILS", () => {
      process.env.BETA_ADMIN_EMAILS = "admin@example.com";
      expect(isAdmin("admin@example.com")).toBe(true);
    });

    it("should return false if email is not in BETA_ADMIN_EMAILS", () => {
      process.env.BETA_ADMIN_EMAILS = "admin@example.com";
      expect(isAdmin("user@example.com")).toBe(false);
    });

    it("should normalize email for comparison", () => {
      process.env.BETA_ADMIN_EMAILS = "admin@example.com";
      expect(isAdmin("ADMIN@EXAMPLE.COM")).toBe(true);
      expect(isAdmin("  Admin@Example.Com  ")).toBe(true);
    });

    it("should return false if BETA_ADMIN_EMAILS is not set", () => {
      delete process.env.BETA_ADMIN_EMAILS;
      expect(isAdmin("admin@example.com")).toBe(false);
    });
  });
});
