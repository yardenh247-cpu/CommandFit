export type UserRole =
  | "admin"
  | "viewer";

export type AuthUser = {
  username: string;
  role: UserRole;
};

type SessionPayload = AuthUser & {
  expiresAt: number;
};

export const SESSION_COOKIE_NAME =
  "commandfit-session";

/* =========================================================
   BASE64 URL
========================================================= */

function base64UrlToBytes(
  value: string
) {
  const base64 =
    value
      .replace(/-/g, "+")
      .replace(/_/g, "/");

  const padding =
    "=".repeat(
      (4 -
        (base64.length %
          4)) %
        4
    );

  const binary =
    atob(
      base64 +
        padding
    );

  return Uint8Array.from(
    binary,
    (
      char
    ) =>
      char.charCodeAt(
        0
      )
  );
}

/* =========================================================
   VERIFY HMAC
========================================================= */

async function verifySignature(
  payload: string,
  signature: string
) {
  const secret =
    process.env.AUTH_SECRET;

  if (!secret) {
    return false;
  }

  const encoder =
    new TextEncoder();

  const key =
    await crypto.subtle.importKey(
      "raw",
      encoder.encode(
        secret
      ),
      {
        name:
          "HMAC",
        hash:
          "SHA-256",
      },
      false,
      [
        "verify",
      ]
    );

  try {
    return await crypto.subtle.verify(
      "HMAC",
      key,
      base64UrlToBytes(
        signature
      ),
      encoder.encode(
        payload
      )
    );
  } catch {
    return false;
  }
}

/* =========================================================
   VERIFY SESSION
========================================================= */

export async function verifyEdgeSessionToken(
  token?: string | null
): Promise<AuthUser | null> {
  if (!token) {
    return null;
  }

  const parts =
    token.split(".");

  if (
    parts.length !== 2
  ) {
    return null;
  }

  const [
    encodedPayload,
    signature,
  ] = parts;

  const validSignature =
    await verifySignature(
      encodedPayload,
      signature
    );

  if (!validSignature) {
    return null;
  }

  try {
    const payloadText =
      new TextDecoder().decode(
        base64UrlToBytes(
          encodedPayload
        )
      );

    const payload =
      JSON.parse(
        payloadText
      ) as SessionPayload;

    if (
      !payload.username ||
      (
        payload.role !==
          "admin" &&
        payload.role !==
          "viewer"
      )
    ) {
      return null;
    }

    const now =
      Math.floor(
        Date.now() /
          1000
      );

    if (
      payload.expiresAt <=
      now
    ) {
      return null;
    }

    return {
      username:
        payload.username,

      role:
        payload.role,
    };
  } catch {
    return null;
  }
}