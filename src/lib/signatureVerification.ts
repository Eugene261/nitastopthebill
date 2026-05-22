import { createHash, createHmac } from "node:crypto";

function getVerificationSecret() {
  const secret = process.env.SIGNATURE_VERIFICATION_SECRET;

  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("SIGNATURE_VERIFICATION_SECRET is not configured.");
  }

  return secret ?? "dev-signature-verification-secret";
}

export function normalizeEmail(email?: string) {
  return email?.trim().toLowerCase() ?? "";
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function hashEmail(email: string) {
  return createHmac("sha256", getVerificationSecret())
    .update(email)
    .digest("hex");
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}
