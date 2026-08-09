"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function DisabledCadetProfilePage() {
  const params =
    useParams<{
      name: string;
      id: string;
    }>();

  const router =
    useRouter();

  const battalionName =
    decodeURIComponent(
      params.name
    );

  useEffect(() => {
    router.replace(
      `/battalions/${encodeURIComponent(
        battalionName
      )}/summary`
    );
  }, [
    battalionName,
    router,
  ]);

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-100 flex items-center justify-center p-4"
    >
      <div className="max-w-lg w-full bg-white rounded-3xl shadow-sm p-6 sm:p-8 text-center">

        <div className="text-4xl mb-4">
          🔒
        </div>

        <h1 className="text-2xl font-bold text-slate-900">
          התיק האישי הוסר
        </h1>

        <p className="text-slate-600 mt-3 leading-7">
          CommandFit פועל כעת במודל מצרפי בלבד ומציג נתוני ביצוע באחוזים, ללא שמות צוערים וללא מידע אישי.
        </p>

        <p className="text-sm text-slate-400 mt-4">
          מועבר לסיכום הגדודי...
        </p>

      </div>
    </main>
  );
}