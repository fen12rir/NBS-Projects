export function normalizePhilippineMobile(raw: string): string | null {
  const cleaned = raw.replace(/[\s\-\(\)]/g, "");
  if (/^09\d{9}$/.test(cleaned)) {
    return "+63" + cleaned.slice(1);
  }
  if (/^\+639\d{9}$/.test(cleaned)) {
    return cleaned;
  }
  if (/^639\d{9}$/.test(cleaned)) {
    return "+" + cleaned;
  }
  return null;
}

export function validatePassword(password: string): { valid: boolean; reason?: string } {
  if (!password || password.length < 8) {
    return { valid: false, reason: "Password must be at least 8 characters long." };
  }
  if (!/[A-Za-z]/.test(password)) {
    return { valid: false, reason: "Password must contain at least one letter." };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, reason: "Password must contain at least one number." };
  }
  return { valid: true };
}
