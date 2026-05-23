export const ADMIN_SESSION_COOKIE = "admin_session";
export const ADMIN_SESSION_TTL_SECONDS = 12 * 60 * 60;

function getSecret() {
  return (
    process.env.ADMIN_SESSION_SECRET ??
    process.env.ADMIN_PASSWORD ??
    "dev-admin-session-secret"
  );
}

async function importHmacKey(secret: string) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function toHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function fromHex(hex: string) {
  if (hex.length % 2 !== 0) return null;
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < bytes.length; i++) {
    const value = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
    if (Number.isNaN(value)) return null;
    bytes[i] = value;
  }
  return bytes;
}

export async function createAdminSessionValue() {
  const expiresAt = Date.now() + ADMIN_SESSION_TTL_SECONDS * 1000;
  const key = await importHmacKey(getSecret());
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(String(expiresAt)),
  );
  return `${expiresAt}.${toHex(signature)}`;
}

export async function verifyAdminSessionValue(value: string | undefined) {
  if (!value) return false;
  const [expiresAtRaw, signatureHex] = value.split(".");
  if (!expiresAtRaw || !signatureHex) return false;

  const expiresAt = Number(expiresAtRaw);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;

  const signatureBytes = fromHex(signatureHex);
  if (!signatureBytes) return false;

  try {
    const key = await importHmacKey(getSecret());
    return await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes,
      new TextEncoder().encode(expiresAtRaw),
    );
  } catch {
    return false;
  }
}

export function constantTimeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}
