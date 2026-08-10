"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { supabase } from "@/lib/supabase";

type NotificationItem = {
  id: number;
  battalion: string;
  event_type: string;
  severity: "info" | "success" | "warning";
  title: string;
  message: string;
  href: string;
  created_at: string;
  expires_at: string;
};

export default function NotificationsPanel({
  battalion,
  compact = false,
}: {
  battalion?: string;
  compact?: boolean;
}) {
  const [notifications, setNotifications] =
    useState<NotificationItem[]>([]);

  const [loading, setLoading] =
    useState(true);

  useEffect(() => {
    async function loadNotifications() {
      try {
        setLoading(true);

        let query = supabase
          .from("commandfit_notifications")
          .select(`
            id,
            battalion,
            event_type,
            severity,
            title,
            message,
            href,
            created_at,
            expires_at
          `)
          .gt(
            "expires_at",
            new Date().toISOString()
          )
          .order(
            "created_at",
            {
              ascending: false,
            }
          )
          .limit(
            compact ? 5 : 10
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
        } = await query;

        if (error) {
          throw error;
        }

        setNotifications(
          (data ?? []) as NotificationItem[]
        );
      } catch (error) {
        console.error(
          "Notifications load error:",
          error
        );

        setNotifications([]);
      } finally {
        setLoading(false);
      }
    }

    loadNotifications();

    const interval =
      window.setInterval(
        loadNotifications,
        60_000
      );

    return () => {
      window.clearInterval(
        interval
      );
    };
  }, [
    battalion,
    compact,
  ]);

  function getStyle(
    severity:
      | "info"
      | "success"
      | "warning"
  ) {
    if (
      severity ===
      "warning"
    ) {
      return {
        box:
          "bg-red-50 border-red-100",
        badge:
          "bg-red-100 text-red-700",
        label:
          "דורש תשומת לב",
        icon:
          "⚠️",
      };
    }

    if (
      severity ===
      "success"
    ) {
      return {
        box:
          "bg-green-50 border-green-100",
        badge:
          "bg-green-100 text-green-700",
        label:
          "עודכן",
        icon:
          "✓",
      };
    }

    return {
      box:
        "bg-blue-50 border-blue-100",
      badge:
        "bg-blue-100 text-blue-700",
      label:
        "עדכון",
      icon:
        "🔔",
    };
  }

  function formatTime(
    value: string
  ) {
    try {
      return new Intl.DateTimeFormat(
        "he-IL",
        {
          hour:
            "2-digit",
          minute:
            "2-digit",
          day:
            "2-digit",
          month:
            "2-digit",
        }
      ).format(
        new Date(value)
      );
    } catch {
      return "";
    }
  }

  if (loading) {
    return (
      <section
        dir="rtl"
        className="bg-white rounded-3xl shadow-sm p-5 sm:p-6 mb-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
            🔔
          </div>

          <div>
            <h2 className="font-bold text-lg">
              עדכונים
            </h2>

            <p className="text-sm text-slate-400">
              טוען עדכונים...
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (
    notifications.length ===
    0
  ) {
    return (
      <section
        dir="rtl"
        className="bg-white rounded-3xl shadow-sm p-5 sm:p-6 mb-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
            🔔
          </div>

          <div>
            <h2 className="font-bold text-lg">
              עדכונים
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              אין עדכונים חדשים ב־24 השעות האחרונות.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      dir="rtl"
      className="bg-white rounded-3xl shadow-sm p-5 sm:p-6 mb-6"
    >
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl">
              🔔
            </span>

            <h2 className="text-xl sm:text-2xl font-black">
              עדכונים
            </h2>
          </div>

          <p className="text-sm text-slate-500 mt-1">
            עדכונים מה־24 שעות האחרונות
          </p>
        </div>

        <div className="min-w-10 h-10 px-3 rounded-full bg-slate-900 text-white flex items-center justify-center font-black">
          {
            notifications.length
          }
        </div>
      </div>

      <div className="space-y-3">
        {notifications.map(
          (
            notification
          ) => {
            const style =
              getStyle(
                notification.severity
              );

            return (
              <Link
                key={
                  notification.id
                }
                href={
                  notification.href
                }
                className={`block border rounded-2xl p-4 transition hover:shadow-sm ${style.box}`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-xl leading-none mt-1">
                    {
                      style.icon
                    }
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-xs font-bold rounded-full px-2.5 py-1 ${style.badge}`}
                      >
                        {
                          style.label
                        }
                      </span>

                      <span className="text-xs text-slate-400">
                        {
                          formatTime(
                            notification.created_at
                          )
                        }
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-900 mt-2">
                      {
                        notification.title
                      }
                    </h3>

                    <p className="text-sm text-slate-600 mt-1 leading-6">
                      {
                        notification.message
                      }
                    </p>

                    {!battalion && (
                      <p className="text-xs font-bold text-slate-500 mt-2">
                        גדוד{" "}
                        {
                          notification.battalion
                        }
                      </p>
                    )}

                    <p className="text-sm font-bold text-blue-700 mt-3">
                      לצפייה בעדכון ←
                    </p>
                  </div>
                </div>
              </Link>
            );
          }
        )}
      </div>
    </section>
  );
}
