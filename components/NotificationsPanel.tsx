"use client";

import Link from "next/link";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  supabase,
} from "@/lib/supabase";

import {
  useAuth,
} from "@/lib/use-auth";

type NotificationRow = {
  id: number;
  battalion: string;

  severity:
    | "info"
    | "success"
    | "warning";

  title: string;
  message: string;
  href: string;

  created_at: string;
  expires_at: string;
};

function timeAgo(
  value: string
) {
  const diff =
    Date.now() -
    new Date(value).getTime();

  const minutes =
    Math.max(
      0,
      Math.floor(
        diff / 60000
      )
    );

  if (minutes < 1) {
    return "עכשיו";
  }

  if (minutes < 60) {
    return `לפני ${minutes} דקות`;
  }

  const hours =
    Math.floor(
      minutes / 60
    );

  return `לפני ${hours} שעות`;
}

export default function NotificationsPanel({
  battalion,
  compact = false,
}: {
  battalion?: string;
  compact?: boolean;
}) {
  const {
    isViewer,
  } =
    useAuth();

  const [
    items,
    setItems,
  ] =
    useState<
      NotificationRow[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const load =
    useCallback(
      async () => {
        if (!isViewer) {
          setItems([]);
          setLoading(false);
          return;
        }

        let query =
          supabase
            .from(
              "commandfit_notifications"
            )
            .select(
              `
                id,
                battalion,
                severity,
                title,
                message,
                href,
                created_at,
                expires_at
              `
            )
            .gt(
              "expires_at",
              new Date()
                .toISOString()
            )
            .order(
              "created_at",
              {
                ascending:
                  false,
              }
            )
            .limit(
              compact
                ? 5
                : 12
            );

        if (battalion) {
          query =
            query.eq(
              "battalion",
              battalion
            );
        }

        const {
          data,
          error,
        } =
          await query;

        if (error) {
          console.error(
            "Notifications load error:",
            error
          );

          setItems([]);
          setLoading(false);
          return;
        }

        setItems(
          (
            data ??
            []
          ) as NotificationRow[]
        );

        setLoading(false);
      },
      [
        battalion,
        compact,
        isViewer,
      ]
    );

  useEffect(() => {
    load();

    if (!isViewer) {
      return;
    }

    const interval =
      window.setInterval(
        load,
        30000
      );

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, [
    isViewer,
    load,
  ]);

  if (!isViewer) {
    return null;
  }

  return (
    <section className="bg-white rounded-3xl shadow-sm p-4 sm:p-6 mb-6">

      <div className="flex items-center gap-2">

        <h2 className="text-xl sm:text-2xl font-bold">
          🔔 עדכונים
        </h2>

        {items.length > 0 && (
          <span className="min-w-6 h-6 rounded-full bg-red-600 text-white text-xs font-black flex items-center justify-center px-1.5">
            {items.length}
          </span>
        )}

      </div>

      <p className="text-sm text-slate-500 mt-1">
        עדכונים ודגשים מה־24 שעות האחרונות
      </p>

      {loading ? (

        <p className="text-sm text-slate-400 mt-5">
          טוען עדכונים...
        </p>

      ) : items.length === 0 ? (

        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center text-slate-400 mt-5">
          אין עדכונים חדשים
        </div>

      ) : (

        <div className="space-y-3 mt-5">

          {items.map(
            (item) => (

              <Link
                key={
                  item.id
                }
                href={
                  item.href
                }
                className={
                  item.severity ===
                  "warning"
                    ? "block border border-red-200 bg-red-50 rounded-2xl p-4 hover:bg-red-100 transition"
                    : item.severity ===
                      "success"
                    ? "block border border-green-100 bg-green-50 rounded-2xl p-4 hover:bg-green-100 transition"
                    : "block border border-blue-100 bg-blue-50 rounded-2xl p-4 hover:bg-blue-100 transition"
                }
              >

                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">

                  <div>

                    <p className="font-bold text-slate-900">

                      {item.severity ===
                      "warning"
                        ? "⚠️ "
                        : item.severity ===
                          "success"
                        ? "✅ "
                        : "🆕 "}

                      {item.title}

                    </p>

                    <p className="text-sm text-slate-600 mt-1 leading-6">
                      {item.message}
                    </p>

                  </div>

                  <span className="text-xs text-slate-400 shrink-0">
                    {timeAgo(
                      item.created_at
                    )}
                  </span>

                </div>

                <p className="text-xs font-bold text-blue-700 mt-3">
                  לפתיחה ←
                </p>

              </Link>

            )
          )}

        </div>

      )}

    </section>
  );
}