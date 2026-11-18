import { describe, it, expect } from "vitest";
import { normalizePhilippineMobile, validatePassword } from "@/lib/auth/validation";
import { hashToken } from "@/lib/auth/session";

describe("Trainee Signup Validation", () => {
  it("normalizes Philippine mobile formats to +639XXXXXXXXX", () => {
    expect(normalizePhilippineMobile("09171234567")).toBe("+639171234567");
    expect(normalizePhilippineMobile("+639171234567")).toBe("+639171234567");
    expect(normalizePhilippineMobile("639171234567")).toBe("+639171234567");
    expect(normalizePhilippineMobile("0917-123-4567")).toBe("+639171234567");
    expect(normalizePhilippineMobile("0917 123 4567")).toBe("+639171234567");
  });

  it("rejects non-Philippine or invalid phone numbers", () => {
    expect(normalizePhilippineMobile("08171234567")).toBeNull();
    expect(normalizePhilippineMobile("12345")).toBeNull();
    expect(normalizePhilippineMobile("+12025550123")).toBeNull();
    expect(normalizePhilippineMobile("abcdefghijk")).toBeNull();
  });

  it("validates password length and complexity rules", () => {
    // Under 8 characters
    expect(validatePassword("Pass1").valid).toBe(false);
    expect(validatePassword("Pass1").reason).toContain("8 characters");

    // No numbers
    expect(validatePassword("PasswordOnly").valid).toBe(false);
    expect(validatePassword("PasswordOnly").reason).toContain("number");

    // No letters
    expect(validatePassword("123456789").valid).toBe(false);
    expect(validatePassword("123456789").reason).toContain("letter");

    // Valid passwords
    expect(validatePassword("Cashier2026").valid).toBe(true);
    expect(validatePassword("NbsTraining1!").valid).toBe(true);
  });
});

describe("Session Token Security", () => {
  it("generates deterministic 64-character SHA-256 hex hashes", () => {
    const rawToken = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";
    const hash1 = hashToken(rawToken);
    const hash2 = hashToken(rawToken);

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
    expect(typeof hash1).toBe("string");
  });
});
