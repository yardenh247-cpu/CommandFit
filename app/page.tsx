"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useAuth,
} from "@/lib/use-auth";

import {
  supabase,
} from "@/lib/supabase";

import {
  getActiveCycle,
} from "@/lib/cycles";

import {
  getBattalionTests,
} from "@/lib/battalion-tests";
import NotificationsPanel from "@/components/NotificationsPanel";

/* =========================================================
   CONFIG
========================================================= */

const infantryCompletion = [
  "גפן",
];

const fighters = [
  "דקל",
  "רימון",
  "הדס",
  "דולב",
];

const staff = [
  "ארז",
  "ברוש",
  "חרוב",
  "אלון",
];

const allBattalions = [
  ...infantryCompletion,
  ...fighters,
  ...staff,
];

/* =========================================================
   TYPES
========================================================= */

type MetricValue = {
  average?: string;
  failedPercent: number;
};

type MetricsMap =
  Record<string, MetricValue>;

type CloudRow = {
  cycle_id: string;
  battalion: string;
  test_name: string;
  attempt: number | null;

  passed_percent: number | null;
  failed_percent: number | null;
  excellent_percent: number | null;

  metrics:
    | MetricsMap
    | null;
};

type ResultRow = {
  cycleId: string;
  battalion: string;
  testName: string;
  attempt: number;

  passedPercent: number;
  failedPercent: number;
  excellentPercent: number;

  metrics: MetricsMap;
};

type BattalionSummary = {
  battalion: string;

  passedAverage: number | null;
  failedAverage: number | null;
  excellentAverage: number | null;

  completionPercent: number;

  weakness:
    | {
        label: string;
        failedPercent: number;
      }
    | null;
};


type AiAnalysis = {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  trends: string[];
  recommendations: string[];
  commanderMessage: string;
};

type AiMetricPayload = Record<
  string,
  {
    average?: string;
    failedPercent: number;
  }
>;

/* =========================================================
   HELPERS
========================================================= */

function formatPercent(
  value: number | null
) {
  if (
    value === null ||
    Number.isNaN(value)
  ) {
    return "—";
  }

  return `${
    Math.round(
      value * 10
    ) / 10
  }%`;
}

function average(
  values: number[]
) {
  if (
    values.length ===
    0
  ) {
    return null;
  }

  return (
    values.reduce(
      (
        sum,
        value
      ) =>
        sum + value,
      0
    ) /
    values.length
  );
}

function getMetricLabel(
  key: string
) {
  const labels:
    Record<string, string> = {
      run: "ריצה",
      facilities: "מתקנים",
      ylm: 'יל"מ',
      sprints: "ספרינטים",
      pullups: "מתח",
      push:
        "לחיצת חזה / מקבילים",
      floorLift:
        "הרמה מהרצפה",
      pushups:
        "שכיבות סמיכה",
    };

  return (
    labels[key] ??
    key
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function Home() {
  const router =
    useRouter();

  const {
    user,
    loading: authLoading,
    isAdmin,
    isViewer,
  } =
    useAuth();

  const [
    rows,
    setRows,
  ] =
    useState<
      ResultRow[]
    >([]);

  const [
    dataLoading,
    setDataLoading,
  ] =
    useState(true);

  const [
    dataMessage,
    setDataMessage,
  ] =
    useState("");

  /* =======================================================
     LOGOUT
  ======================================================= */

  async function logout() {
    try {
      await fetch(
        "/api/auth/logout",
        {
          method: "POST",
        }
      );
    } finally {
      router.push(
        "/login"
      );

      router.refresh();
    }
  }

  /* =======================================================
     LOAD DASHBOARD DATA
  ======================================================= */

  useEffect(() => {
    let cancelled =
      false;

    async function load() {
      setDataLoading(
        true
      );

      setDataMessage(
        ""
      );

      const {
        data,
        error,
      } =
        await supabase
          .from(
            "percentage_test_results"
          )
          .select(
            `
              cycle_id,
              battalion,
              test_name,
              attempt,
              passed_percent,
              failed_percent,
              excellent_percent,
              metrics
            `
          )
          .in(
            "battalion",
            allBattalions
          );

      if (
        cancelled
      ) {
        return;
      }

      if (error) {
        console.error(
          "Home dashboard load error:",
          error
        );

        setRows(
          []
        );

        setDataMessage(
          "לא ניתן היה לטעון את נתוני הדשבורד מהענן"
        );

        setDataLoading(
          false
        );

        return;
      }

      const activeCycleByBattalion =
        Object.fromEntries(
          allBattalions.map(
            (
              battalion
            ) => {
              const cycle =
                getActiveCycle(
                  battalion
                );

              return [
                battalion,
                cycle?.id ??
                  `legacy-${battalion}`,
              ];
            }
          )
        );

      const normalized =
        (
          (
            data ??
            []
          ) as CloudRow[]
        )
          .filter(
            (row) =>
              activeCycleByBattalion[
                row.battalion
              ] ===
              row.cycle_id
          )
          .map(
            (row) => ({
              cycleId:
                row.cycle_id,

              battalion:
                row.battalion,

              testName:
                row.test_name,

              attempt:
                row.attempt ??
                1,

              passedPercent:
                Number(
                  row.passed_percent ??
                    0
                ),

              failedPercent:
                Number(
                  row.failed_percent ??
                    0
                ),

              excellentPercent:
                Number(
                  row.excellent_percent ??
                    0
                ),

              metrics:
                row.metrics ??
                {},
            })
          );

      setRows(
        normalized
      );

      setDataLoading(
        false
      );
    }

    load();

    return () => {
      cancelled =
        true;
    };
  }, []);

  /* =======================================================
     LATEST RESULT PER TEST
  ======================================================= */

  const latestRows =
    useMemo(() => {
      const map =
        new Map<
          string,
          ResultRow
        >();

      for (
        const row of
        rows
      ) {
        const key =
          `${row.battalion}::${row.testName}`;

        const existing =
          map.get(
            key
          );

        if (
          !existing ||
          row.attempt >
            existing.attempt
        ) {
          map.set(
            key,
            row
          );
        }
      }

      return [
        ...map.values(),
      ];
    }, [
      rows,
    ]);

  /* =======================================================
     BATTALION SUMMARIES
  ======================================================= */

  const battalionSummaries =
    useMemo(() => {
      const result:
        Record<
          string,
          BattalionSummary
        > = {};

      for (
        const battalion of
        allBattalions
      ) {
        const battalionRows =
          latestRows.filter(
            (row) =>
              row.battalion ===
              battalion
          );

        const tests =
          getBattalionTests(
            battalion
          );

        const completionPercent =
          tests.length > 0
            ? Math.round(
                (
                  battalionRows.length /
                  tests.length
                ) *
                  100
              )
            : 0;

        const weaknesses:
          Array<{
            label: string;
            failedPercent: number;
          }> = [];

        for (
          const row of
          battalionRows
        ) {
          for (
            const [
              key,
              metric,
            ] of
            Object.entries(
              row.metrics
            )
          ) {
            weaknesses.push({
              label:
                getMetricLabel(
                  key
                ),

              failedPercent:
                Number(
                  metric.failedPercent ??
                    0
                ),
            });
          }
        }

        const weakness =
          weaknesses.length > 0
            ? [
                ...weaknesses,
              ].sort(
                (
                  a,
                  b
                ) =>
                  b.failedPercent -
                  a.failedPercent
              )[0]
            : null;

        result[
          battalion
        ] = {
          battalion,

          passedAverage:
            average(
              battalionRows.map(
                (row) =>
                  row.passedPercent
              )
            ),

          failedAverage:
            average(
              battalionRows.map(
                (row) =>
                  row.failedPercent
              )
            ),

          excellentAverage:
            average(
              battalionRows.map(
                (row) =>
                  row.excellentPercent
              )
            ),

          completionPercent:
            Math.min(
              100,
              completionPercent
            ),

          weakness,
        };
      }

      return result;
    }, [
      latestRows,
    ]);

  /* =======================================================
     GLOBAL DASHBOARD
  ======================================================= */

  const globalSummary =
    useMemo(() => {
      const summaries =
        Object.values(
          battalionSummaries
        ).filter(
          (item) =>
            item.passedAverage !==
            null
        );

      const completionValues =
        Object.values(
          battalionSummaries
        ).map(
          (item) =>
            item.completionPercent
        );

      return {
        passed:
          average(
            summaries
              .map(
                (item) =>
                  item.passedAverage
              )
              .filter(
                (
                  value
                ): value is number =>
                  value !== null
              )
          ),

        failed:
          average(
            summaries
              .map(
                (item) =>
                  item.failedAverage
              )
              .filter(
                (
                  value
                ): value is number =>
                  value !== null
              )
          ),

        excellent:
          average(
            summaries
              .map(
                (item) =>
                  item.excellentAverage
              )
              .filter(
                (
                  value
                ): value is number =>
                  value !== null
              )
          ),

        completion:
          average(
            completionValues
          ),
      };
    }, [
      battalionSummaries,
    ]);

  /* =======================================================
     TOP WEAKNESSES
  ======================================================= */

  const interventionPoints =
    useMemo(() => {
      return Object.values(
        battalionSummaries
      )
        .filter(
          (
            item
          ): item is BattalionSummary & {
            weakness: {
              label: string;
              failedPercent: number;
            };
          } =>
            item.weakness !==
            null &&
            item.weakness
              .failedPercent >
              0
        )
        .sort(
          (
            a,
            b
          ) =>
            b.weakness
              .failedPercent -
            a.weakness
              .failedPercent
        )
        .slice(
          0,
          5
        );
    }, [
      battalionSummaries,
    ]);

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-100 text-slate-900"
    >

      {/* HEADER */}

      <header className="bg-slate-950 text-white px-4 sm:px-6 lg:px-8 py-5 sm:py-6">

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-5">

          <div className="flex items-center gap-3">

            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-lg sm:text-xl shadow-lg">
              CF
            </div>

            <div>

              <h1 className="text-2xl sm:text-3xl font-black">
                CommandFit
              </h1>

              <p className="text-slate-400 text-sm mt-1">
                מערכת ניהול ובקרת הכשירות הגופנית
              </p>

            </div>

          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">

            {!authLoading &&
              user && (
              <div className="bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm">

                <span className="text-slate-400">
                  מחובר כ־
                </span>

                <strong>
                  {isAdmin
                    ? "מנהל"
                    : isViewer
                    ? "צפייה בלבד"
                    : user.username}
                </strong>

              </div>
            )}

            <button
              type="button"
              onClick={
                logout
              }
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 border border-white/10 px-5 py-3 rounded-xl font-medium transition"
            >
              התנתקות
            </button>

          </div>

        </div>

      </header>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">

        {/* TITLE */}

        <section className="mb-7 sm:mb-10">

          <h2 className="text-2xl sm:text-3xl font-bold">
            לוח בקרה
          </h2>

          <p className="text-slate-500 mt-2">
            תמונת מצב מרכזית באחוזים וממוצעים בלבד
          </p>

        </section>

{/* ADMIN TOOLS */}


<NotificationsPanel />
        
        {/* SECURITY */}

        <section className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-7">

          <p className="font-bold text-blue-900">
            🔒 תצוגה מצרפית בלבד
          </p>

          <p className="text-sm text-blue-800 mt-1">
            ללא שמות, ללא מספרי צוערים וללא נתוני כוח אדם מספריים.
          </p>

        </section>

        {/* DASHBOARD CARDS */}

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-8 sm:mb-10">

          <DashboardCard
            title="ממוצע עוברים"
            value={
              dataLoading
                ? "..."
                : formatPercent(
                    globalSummary.passed
                  )
            }
            tone="success"
          />

          <DashboardCard
            title="ממוצע נכשלים"
            value={
              dataLoading
                ? "..."
                : formatPercent(
                    globalSummary.failed
                  )
            }
            tone="danger"
          />

          <DashboardCard
            title="ממוצע מצטיינים"
            value={
              dataLoading
                ? "..."
                : formatPercent(
                    globalSummary.excellent
                  )
            }
            tone="excellent"
          />

          <DashboardCard
            title="השלמת הזנת נתונים"
            value={
              dataLoading
                ? "..."
                : formatPercent(
                    globalSummary.completion
                  )
            }
            tone="neutral"
          />

        </section>

        {/* UNIFIED CALENDAR */}

        <section className="bg-gradient-to-l from-blue-950 to-slate-900 text-white rounded-3xl shadow-sm p-5 sm:p-7 mb-8">

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">

            <div>

              <p className="text-xs font-bold text-blue-300 uppercase tracking-wide">
                CommandFit Calendar
              </p>

              <h2 className="text-2xl font-black mt-1">
                📅 לוח בחנים אחוד
              </h2>

              <p className="text-slate-300 mt-2 max-w-3xl">
                תכנון כלל הבחנים של גדודי בה״ד 1 במקום אחד, כולל זיהוי עומסים וחפיפות, סינון לפי מגמה וגדוד וייצוא לאקסל ולקלנדר בפלאפון.
              </p>

            </div>

            <Link
              href="/calendar"
              className="w-full lg:w-auto bg-white text-slate-950 hover:bg-blue-50 rounded-xl px-6 py-3 font-black text-center transition"
            >
              📅 פתח לוח בחנים
            </Link>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 text-sm">

            <div className="bg-white/10 border border-white/10 rounded-2xl p-4">
              <p className="font-bold">🟢 ניהול עומסים</p>
              <p className="text-slate-300 mt-1">זיהוי אוטומטי של בחנים מקבילים ועומס יומי.</p>
            </div>

            <div className="bg-white/10 border border-white/10 rounded-2xl p-4">
              <p className="font-bold">🏃 כלל הגדודים</p>
              <p className="text-slate-300 mt-1">לוח אחוד למגמת לוחמים ולמגמת מטה.</p>
            </div>

            <div className="bg-white/10 border border-white/10 rounded-2xl p-4">
              <p className="font-bold">📱 ייצוא ושיתוף</p>
              <p className="text-slate-300 mt-1">ייצוא לאקסל ולקלנדר האישי בפלאפון.</p>
            </div>

          </div>

        </section>

        {/* INTERVENTION POINTS */}


        {interventionPoints.length >
          0 && (
          <section className="bg-white rounded-3xl shadow-sm p-4 sm:p-6 mb-8">

            <div className="mb-5">

              <p className="text-xs font-bold text-red-700 uppercase tracking-wide">
                תמונת מצב
              </p>

              <h2 className="text-xl sm:text-2xl font-bold mt-1">
                מוקדי התערבות
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                הפרמטרים עם אחוז אי־העמידה הגבוה ביותר כרגע
              </p>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-3">

              {interventionPoints.map(
                (item) => (

                  <Link
                    key={
                      item.battalion
                    }
                    href={`/battalions/${encodeURIComponent(
                      item.battalion
                    )}`}
                    className="border border-red-100 bg-red-50 rounded-2xl p-4 hover:bg-red-100 transition"
                  >

                    <p className="text-sm font-bold text-slate-900">
                      גדוד{" "}
                      {item.battalion}
                    </p>

                    <p className="text-sm text-slate-600 mt-2">
                      {
                        item.weakness
                          .label
                      }
                    </p>

                    <p className="text-2xl font-black text-red-700 mt-1">
                      {formatPercent(
                        item.weakness
                          .failedPercent
                      )}
                    </p>

                    <p className="text-xs text-red-600 mt-1">
                      אי־עמידה
                    </p>

                  </Link>

                )
              )}

            </div>

          </section>
        )}

        {/* INFANTRY COMPLETION */}

        <TrackSection
          title="השלמה חילית חי״ר"
          subtitle="תמונת מצב גדודית – אחוזים, ממוצעים ומוקדי חולשה"
          battalions={
            infantryCompletion
          }
          variant="dark"
          summaries={
            battalionSummaries
          }
        />

        {/* FIGHTERS */}

        <TrackSection
          title="מגמת לוחמים"
          subtitle="תמונת מצב גדודית – אחוזים, ממוצעים ומוקדי חולשה"
          battalions={
            fighters
          }
          variant="dark"
          summaries={
            battalionSummaries
          }
        />

        {/* STAFF */}

        <TrackSection
          title="מגמת מטה"
          subtitle="תמונת מצב גדודית – אחוזים, ממוצעים ומוקדי חולשה"
          battalions={
            staff
          }
          variant="staff"
          summaries={
            battalionSummaries
          }
        />

        {dataMessage && (
          <section className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 mt-8">
            {dataMessage}
          </section>
        )}

      </div>

    </main>
  );
}

/* =========================================================
   TRACK SECTION
========================================================= */

function TrackSection({
  title,
  subtitle,
  battalions,
  variant,
  summaries,
}: {
  title: string;
  subtitle: string;
  battalions:
    string[];

  variant:
    | "dark"
    | "light"
    | "staff";

  summaries:
    Record<
      string,
      BattalionSummary
    >;
}) {
  return (
    <section className="bg-white rounded-3xl shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">

      <div className="mb-5">

        <p
          className={
            variant ===
            "dark"
              ? "text-xs font-bold text-blue-700 uppercase tracking-wide"
              : variant ===
                "staff"
              ? "text-xs font-bold text-blue-700 uppercase tracking-wide"
              : "text-xs font-bold text-violet-700 uppercase tracking-wide"
          }
        >
          מגמה
        </p>

        <h2 className="text-xl sm:text-2xl font-bold mt-1">
          {title}
        </h2>

        <p className="text-sm text-slate-500 mt-1">
          {subtitle}
        </p>

      </div>

      <div
        className={`grid grid-cols-1 sm:grid-cols-2 ${
          battalions.length >=
          5
            ? "xl:grid-cols-5"
            : "xl:grid-cols-4"
        } gap-3 sm:gap-4`}
      >

        {battalions.map(
          (
            battalion
          ) => (

            <BattalionCard
              key={
                battalion
              }
              battalion={
                battalion
              }
              variant={
                variant
              }
              summary={
                summaries[
                  battalion
                ]
              }
            />

          )
        )}

      </div>

    </section>
  );
}

/* =========================================================
   BATTALION CARD
========================================================= */

function BattalionCard({
  battalion,
  variant,
  summary,
}: {
  battalion: string;

  variant:
    | "dark"
    | "light"
    | "staff";

  summary?:
    BattalionSummary;
}) {
  const dark =
    variant === "dark" ||
    variant === "staff";

  const staff =
    variant ===
    "staff";

  return (
    <Link
      href={`/battalions/${encodeURIComponent(
        battalion
      )}`}
      className={
        dark
          ? "group rounded-2xl bg-slate-900 px-4 py-5 text-white transition hover:bg-slate-800 active:scale-[0.98]"
          : staff
          ? "group rounded-2xl bg-blue-700 px-4 py-5 text-white transition hover:bg-blue-600 active:scale-[0.98]"
          : "group rounded-2xl border-2 border-slate-200 bg-white px-4 py-5 transition hover:bg-slate-50 hover:border-violet-200 active:scale-[0.98]"
      }
    >

      <div className="flex items-center justify-between gap-3">

        <span
          className={
            dark
              ? "text-2xl font-black"
              : "text-2xl font-black text-slate-900"
          }
        >
          {battalion}
        </span>

        <span
          className={
            dark
              ? "text-xs text-slate-400"
              : "text-xs text-slate-400"
          }
        >
          כניסה ←
        </span>

      </div>

      <div className="grid grid-cols-3 gap-2 mt-5">

        <MiniStat
          title="עוברים"
          value={
            formatPercent(
              summary?.passedAverage ??
                null
            )
          }
          tone="success"
          dark={
            dark
          }
        />

        <MiniStat
          title="נכשלים"
          value={
            formatPercent(
              summary?.failedAverage ??
                null
            )
          }
          tone="danger"
          dark={
            dark
          }
        />

        <MiniStat
          title="מצטיינים"
          value={
            formatPercent(
              summary?.excellentAverage ??
                null
            )
          }
          tone="excellent"
          dark={
            dark
          }
        />

      </div>

      <div
        className={
          dark
            ? "border-t border-white/10 mt-4 pt-4"
            : "border-t border-slate-100 mt-4 pt-4"
        }
      >

        {summary?.weakness ? (

          <>
            <p
              className={
                dark
                  ? "text-xs text-slate-400"
                  : "text-xs text-slate-500"
              }
            >
              מוקד לשיפור
            </p>

            <div className="flex items-center justify-between gap-3 mt-1">

              <span className="text-sm font-bold">
                {
                  summary.weakness
                    .label
                }
              </span>

              <span className="text-sm font-black text-red-500">
                {formatPercent(
                  summary.weakness
                    .failedPercent
                )}
              </span>

            </div>
          </>

        ) : (

          <p
            className={
              dark
                ? "text-xs text-slate-500"
                : "text-xs text-slate-400"
            }
          >
            טרם הוזנו נתוני פרמטרים
          </p>

        )}

      </div>

    </Link>
  );
}

/* =========================================================
   MINI STAT
========================================================= */

function MiniStat({
  title,
  value,
  tone,
  dark,
}: {
  title: string;
  value: string;

  tone:
    | "success"
    | "danger"
    | "excellent";

  dark: boolean;
}) {
  const toneClass =
    tone ===
    "success"
      ? "text-green-500"
      : tone ===
        "danger"
      ? "text-red-500"
      : "text-sky-500";

  return (
    <div
      className={
        dark
          ? "bg-white/5 rounded-xl p-2.5 text-center"
          : "bg-slate-50 rounded-xl p-2.5 text-center"
      }
    >

      <p
        className={
          dark
            ? "text-[10px] text-slate-400"
            : "text-[10px] text-slate-500"
        }
      >
        {title}
      </p>

      <p
        className={`text-base sm:text-lg font-black mt-1 ${toneClass}`}
      >
        {value}
      </p>

    </div>
  );
}

/* =========================================================
   DASHBOARD CARD
========================================================= */

function DashboardCard({
  title,
  value,
  tone,
}: {
  title: string;
  value: string;

  tone:
    | "success"
    | "danger"
    | "excellent"
    | "neutral";
}) {
  const styles = {
    success:
      "bg-green-50 border-green-100 text-green-700",

    danger:
      "bg-red-50 border-red-100 text-red-700",

    excellent:
      "bg-sky-50 border-sky-100 text-sky-700",

    neutral:
      "bg-white border-slate-200 text-slate-900",
  };

  return (
    <div
      className={`border rounded-2xl shadow-sm p-4 sm:p-5 ${styles[tone]}`}
    >

      <p className="text-xs sm:text-sm opacity-80">
        {title}
      </p>

      <p className="text-2xl sm:text-4xl font-black mt-2">
        {value}
      </p>

    </div>
  );
}