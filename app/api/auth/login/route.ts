import { NextResponse } from "next/server";

import {
  authenticateUser,
  createSessionToken,
  SESSION_COOKIE_NAME,
} from "@/lib/auth";

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json();

    const username =
      String(
        body?.username ?? ""
      ).trim();

    const password =
      String(
        body?.password ?? ""
      );

    if (
      !username ||
      !password
    ) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "יש להזין שם משתמש וסיסמה",
        },
        {
          status: 400,
        }
      );
    }

    const user =
      authenticateUser(
        username,
        password
      );

    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "שם המשתמש או הסיסמה שגויים",
        },
        {
          status: 401,
        }
      );
    }

    const token =
      createSessionToken(
        user
      );

    const response =
      NextResponse.json({
        ok: true,
        user: {
          username:
            user.username,
          role:
            user.role,
        },
      });

    response.cookies.set({
      name:
        SESSION_COOKIE_NAME,

      value:
        token,

      httpOnly:
        true,

      sameSite:
        "lax",

      secure:
        process.env.NODE_ENV ===
        "production",

      path:
        "/",

      maxAge:
        60 * 60 * 12,
    });

    return response;
  } catch (error) {
    console.error(
      "Login error:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        message:
          "אירעה שגיאה בהתחברות",
      },
      {
        status: 500,
      }
    );
  }
}
