import { createHmac, timingSafeEqual } from "crypto";

export type UserRole = "admin" | "viewer";

export type AuthUser = {
  username: string;
  role: UserRole;
};

type SessionPayload = AuthUser & {
  expiresAt: number;
};

export const SESSION_COOKIE_NAME = "commandfit-session";

const SESSION_DURATION = 60 * 60 * 12; // 12 שעות

function getAuthSecret() {
  const secret = process.env.AUTH_SECRET?.trim();

  if (!secret) {
    throw new Error("AUTH_SECRET is missing");
  }

  return secret;
}

function safeCompare(first: string, second: string) {
  const firstBuffer = Buffer.from(first);
  const secondBuffer = Buffer.from(second);

  if (firstBuffer.length !== secondBuffer.length) {
    return false;
  }

  return timingSafeEqual(firstBuffer, secondBuffer);
}

export function authenticateUser(
  username: string,
  password: string
): AuthUser | null {
  const adminUsername = process.env.ADMIN_USERNAME?.trim();
  const adminPassword = process.env.ADMIN_PASSWORD?.trim();
  const viewerUsername = process.env.VIEWER_USERNAME?.trim();
  const viewerPassword = process.env.VIEWER_PASSWORD?.trim();

  const cleanUsername = username.trim();
  const cleanPassword = password.trim();

  if (
    adminUsername &&
    adminPassword &&
    safeCompare(cleanUsername, adminUsername) &&
    safeCompare(cleanPassword, adminPassword)
  ) {
    return {
      username: adminUsername,
      role: "admin",
    };
  }

  if (
    viewerUsername &&
    viewerPassword &&
    safeCompare(cleanUsername, viewerUsername) &&
    safeCompare(cleanPassword, viewerPassword)
  ) {
    return {
      username: viewerUsername,
      role: "viewer",
    };
  }

  return null;
}

function sign(value: string) {
  return createHmac("sha256", getAuthSecret())
    .update(value)
    .digest("base64url");
}

export function createSessionToken(user: AuthUser) {
  const payload: SessionPayload = {
    ...user,
    expiresAt:
      Math.floor(Date.now() / 1000) +
      SESSION_DURATION,
  };

  const encodedPayload = Buffer.from(
    JSON.stringify(payload)
  ).toString("base64url");

  const signature = sign(encodedPayload);

  return `${encodedPayload}.${signature}`;
}

export function verifySessionToken(
  token?: string | null
): AuthUser | null {
  if (!token) {
    return null;
  }

  const parts = token.split(".");

  if (parts.length !== 2) {
    return null;
  }

  const [encodedPayload, suppliedSignature] = parts;

  const expectedSignature = sign(encodedPayload);

  if (!safeCompare(suppliedSignature, expectedSignature)) {
    return null;
  }

  try {
    const payload = JSON.parse(
      Buffer.from(
        encodedPayload,
        "base64url"
      ).toString("utf8")
    ) as SessionPayload;

    if (
      !payload.username ||
      (payload.role !== "admin" &&
        payload.role !== "viewer")
    ) {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);

    if (payload.expiresAt <= now) {
      return null;
    }

    return {
      username: payload.username,
      role: payload.role,
    };
  } catch {
    return null;
  }
}