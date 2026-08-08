"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(
          data?.message ||
            "שם המשתמש או הסיסמה שגויים"
        );

        return;
      }

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error(error);

      setError(
        "לא ניתן להתחבר למערכת כרגע"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-950 flex items-center justify-center p-6"
    >
      <div className="w-full max-w-md">

        {/* LOGO / TITLE */}

        <div className="text-center mb-8">
          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-600 text-3xl font-black text-white shadow-2xl">
            CF
          </div>

          <h1 className="text-4xl font-black text-white">
            CommandFit
          </h1>

          <p className="mt-2 text-slate-400">
            מערכת ניהול הכשירות והביצועים
          </p>
        </div>

        {/* LOGIN CARD */}

        <div className="rounded-3xl bg-white p-8 shadow-2xl">
          <div className="mb-7">
            <h2 className="text-2xl font-black text-slate-900">
              כניסה למערכת
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              יש להזין שם משתמש וסיסמה
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            {/* USERNAME */}

            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                שם משתמש
              </label>

              <input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(event) =>
                  setUsername(
                    event.target.value
                  )
                }
                placeholder="הזן שם משתמש"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                required
              />
            </div>

            {/* PASSWORD */}

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-bold text-slate-700"
              >
                סיסמה
              </label>

              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) =>
                  setPassword(
                    event.target.value
                  )
                }
                placeholder="הזן סיסמה"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                required
              />
            </div>

            {/* ERROR */}

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            {/* LOGIN */}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 px-5 py-3.5 font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "מתחבר..."
                : "כניסה למערכת"}
            </button>
          </form>

          <div className="mt-7 border-t border-slate-100 pt-5 text-center">
            <p className="text-xs text-slate-400">
              הגישה למערכת מיועדת למשתמשים מורשים בלבד
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-xs text-slate-600">
          CommandFit • מערכת ניהול כשירות
        </p>
      </div>
    </main>
  );
}