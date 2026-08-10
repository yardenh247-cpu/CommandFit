"use client";

import {
  useEffect,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

export default function SummaryRedirectPage() {
  const params =
    useParams<{
      name: string;
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
      )}/cadets`
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
      <div className="bg-white rounded-2xl p-6 shadow-sm text-slate-600">
        מעביר לתוצאות הבחנים...
      </div>
    </main>
  );
}
