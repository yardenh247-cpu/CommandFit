"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getBattalionTests,
  type BattalionTest,
} from "@/lib/battalion-tests";

import {
  getActiveCycle,
  type CourseCycle,
} from "@/lib/cycles";

import {
  supabase,
} from "@/lib/supabase";

import NotificationsPanel from "@/components/NotificationsPanel";

/* =========================================================
   TYPES
========================================================= */

type MetricValue = {
  average?: string;
  maleAverage?: string;
  femaleAverage?: string;
  failedCount?: number;
  failedPercent?: number;
};

type MetricsMap = Record<string, MetricValue>;


const GENDER_SPLIT_BATTALIONS =
  new Set([
    "ברוש",
    "ארז",
    "הדס",
    "אלון",
    "חרוב",
  ]);

function usesGenderSplit(
  battalionName: string
) {
  return GENDER_SPLIT_BATTALIONS.has(
    battalionName
  );
}

type PercentageRow = {
  test_name: string;

  attempt:
    | number
    | null;

  passed_percent:
    | number
    | null;

  failed_percent:
    | number
    | null;

  excellent_percent:
    | number
    | null;

  metrics:
    | MetricsMap
    | null;
};

type PercentageResult = {
  testName: string;

  attempt: number;

  passedPercent: number;

  failedPercent: number;

  excellentPercent: number;

  metrics: MetricsMap;
};

type TestCardData = {
  test: BattalionTest;

  latest:
    | PercentageResult
    | null;

  attempts:
    PercentageResult[];
};



type AiAnalysis = {
  summary: string;
  strengths: string[];
  weaknesses: string[];
  trends: string[];
  recommendations: string[];
  commanderMessage: string;
};

/* =========================================================
   CONFIG
========================================================= */

const battalionTracks:
  Record<
    string,
    string
  > = {
  דקל: "מגמת לוחמים",
  רימון: "מגמת לוחמים",
  גפן: "מגמת לוחמים",
  הדס: "מגמת לוחמים",
  דולב: "מגמת לוחמים",

  ארז: "מגמת מטה",
  ברוש: "מגמת מטה",
  חרוב: "מגמת מטה",
  אלון: "מגמת מטה",
};

/* =========================================================
   HELPERS
========================================================= */

function formatPercent(
  value:
    | number
    | null
) {
  if (
    value === null ||
    Number.isNaN(value)
  ) {
    return "—";
  }

  const rounded =
    Math.round(
      value * 10
    ) / 10;

  return `${rounded}%`;
}

function attemptLabel(
  attempt: number
) {
  const labels:
    Record<
      number,
      string
    > = {
    1: "מועד א׳",
    2: "מועד ב׳",
    3: "מועד ג׳",
    4: "מועד ד׳",
    5: "מועד ה׳",
    6: "מועד ו׳",
    7: "מועד ז׳",
    8: "מועד ח׳",
    9: "מועד ט׳",
    10: "מועד י׳",
  };

  return (
    labels[attempt] ??
    `מועד ${attempt}`
  );
}

function getMetricLabel(
  key: string
) {
  const labels: Record<string, string> = {
    run: "ריצה",
    facilities: "מתקנים",
    ylm: 'יל"מ',
    sprints: "ספרינטים",
    pullups: "מתח",
    push: "לחיצת חזה / מקבילים",
    floorLift: "הרמה מהרצפה",
    pushups: "שכיבות סמיכה",
  };

  return labels[key] ?? key;
}

function signedPoints(
  value: number
) {
  const rounded =
    Math.round(value * 10) / 10;

  return rounded > 0
    ? `+${rounded}`
    : `${rounded}`;
}

function normalizeRow(
  row:
    PercentageRow
):
  PercentageResult {
  return {
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
      row.metrics ?? {},
  };
}

/* =========================================================
   PAGE
========================================================= */

export default function BattalionPage() {
  const params =
    useParams<{
      name: string;
    }>();

  const battalionName =
    decodeURIComponent(
      params.name
    );

  const track =
    battalionTracks[
      battalionName
    ] ??
    "CommandFit";

  const tests =
    useMemo(
      () =>
        getBattalionTests(
          battalionName
        ),
      [
        battalionName,
      ]
    );

  const [
    activeCycle,
    setActiveCycle,
  ] =
    useState<
      CourseCycle | null
    >(
      null
    );

  const [
    rows,
    setRows,
  ] =
    useState<
      PercentageResult[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(
      true
    );

  const [
    message,
    setMessage,
  ] =
    useState(
      ""
    );

  const [
    aiLoading,
    setAiLoading,
  ] = useState(false);

  const [
    aiError,
    setAiError,
  ] = useState("");

  const [
    aiAnalysis,
    setAiAnalysis,
  ] = useState<AiAnalysis | null>(null);

  const cycleId =
    activeCycle?.id ??
    `legacy-${battalionName}`;

  /* =======================================================
     LOAD CYCLE
  ======================================================= */

  useEffect(() => {
    setActiveCycle(
      getActiveCycle(
        battalionName
      )
    );
  }, [
    battalionName,
  ]);

  /* =======================================================
     LOAD PERCENTAGES
  ======================================================= */

  useEffect(() => {
    let cancelled =
      false;

    async function load() {
      setLoading(
        true
      );

      setMessage(
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
              test_name,
              attempt,
              passed_percent,
              failed_percent,
              excellent_percent,
              metrics
            `
          )
          .eq(
            "cycle_id",
            cycleId
          )
          .eq(
            "battalion",
            battalionName
          )
          .order(
            "test_name",
            {
              ascending:
                true,
            }
          )
          .order(
            "attempt",
            {
              ascending:
                true,
            }
          );

      if (cancelled) {
        return;
      }

      if (error) {
        console.error(
          "Battalion percentage load error:",
          error
        );

        setRows(
          []
        );

        setMessage(
          "לא ניתן היה לטעון את נתוני הבחנים מהענן"
        );

        setLoading(
          false
        );

        return;
      }

      setRows(
        (
          (
            data ??
            []
          ) as PercentageRow[]
        ).map(
          normalizeRow
        )
      );

      setLoading(
        false
      );
    }

    load();

    return () => {
      cancelled =
        true;
    };
  }, [
    battalionName,
    cycleId,
  ]);

  /* =======================================================
     DERIVED
  ======================================================= */

  const testCards =
    useMemo<
      TestCardData[]
    >(
      () => {
        return tests.map(
          (
            test
          ) => {
            const attempts =
              rows
                .filter(
                  (
                    row
                  ) =>
                    row.testName ===
                    test.name
                )
                .sort(
                  (
                    a,
                    b
                  ) =>
                    a.attempt -
                    b.attempt
                );

            return {
              test,

              attempts,

              latest:
                attempts.length >
                0
                  ? attempts[
                      attempts.length -
                        1
                    ]
                  : null,
            };
          }
        );
      },
      [
        rows,
        tests,
      ]
    );

  const latestResults =
    useMemo(
      () =>
        testCards
          .map(
            (
              item
            ) =>
              item.latest
          )
          .filter(
            (
              item
            ):
              item is PercentageResult =>
              item !==
              null
          ),
      [
        testCards,
      ]
    );

  const averagePassed =
    useMemo(
      () => {
        if (
          latestResults.length ===
          0
        ) {
          return null;
        }

        return (
          latestResults.reduce(
            (
              sum,
              item
            ) =>
              sum +
              item.passedPercent,
            0
          ) /
          latestResults.length
        );
      },
      [
        latestResults,
      ]
    );

  const averageFailed =
    useMemo(
      () => {
        if (
          latestResults.length ===
          0
        ) {
          return null;
        }

        return (
          latestResults.reduce(
            (
              sum,
              item
            ) =>
              sum +
              item.failedPercent,
            0
          ) /
          latestResults.length
        );
      },
      [
        latestResults,
      ]
    );

  const averageExcellent =
    useMemo(
      () => {
        if (
          latestResults.length ===
          0
        ) {
          return null;
        }

        return (
          latestResults.reduce(
            (
              sum,
              item
            ) =>
              sum +
              item.excellentPercent,
            0
          ) /
          latestResults.length
        );
      },
      [
        latestResults,
      ]
    );


  const battalionIntelligence =
    useMemo(() => {
      const trends = testCards
        .filter(
          (item) =>
            item.attempts.length >= 2
        )
        .map((item) => {
          const ordered =
            [...item.attempts].sort(
              (a, b) =>
                a.attempt -
                b.attempt
            );

          const first =
            ordered[0];

          const latest =
            ordered[
              ordered.length - 1
            ];

          return {
            testName:
              item.test.name,

            firstAttempt:
              first.attempt,

            latestAttempt:
              latest.attempt,

            passedChange:
              latest.passedPercent -
              first.passedPercent,

            failedChange:
              latest.failedPercent -
              first.failedPercent,

            excellentChange:
              latest.excellentPercent -
              first.excellentPercent,
          };
        });

      const weakestTest =
        latestResults.length > 0
          ? [...latestResults].sort(
              (a, b) =>
                b.failedPercent -
                a.failedPercent
            )[0]
          : null;

      const strongestTest =
        latestResults.length > 0
          ? [...latestResults].sort(
              (a, b) =>
                b.passedPercent -
                a.passedPercent
            )[0]
          : null;

      const biggestImprovement =
        trends.length > 0
          ? [...trends].sort(
              (a, b) =>
                b.passedChange -
                a.passedChange
            )[0]
          : null;

      const biggestDecline =
        trends
          .filter(
            (item) =>
              item.passedChange < 0
          )
          .sort(
            (a, b) =>
              a.passedChange -
              b.passedChange
          )[0] ?? null;

      return {
        trends,
        weakestTest,
        strongestTest,
        biggestImprovement,
        biggestDecline,
      };
    }, [
      latestResults,
      testCards,
    ]);

  const genderMetricSummary =
    useMemo(() => {
      if (
        !usesGenderSplit(
          battalionName
        )
      ) {
        return [];
      }

      const groups =
        new Map<
          string,
          {
            male: string[];
            female: string[];
          }
        >();

      for (
        const item of
        latestResults
      ) {
        for (
          const [
            key,
            metric,
          ] of
          Object.entries(
            item.metrics
          )
        ) {
          const label =
            getMetricLabel(
              key
            );

          const current =
            groups.get(
              label
            ) ?? {
              male: [],
              female: [],
            };

          if (
            metric.maleAverage
          ) {
            current.male.push(
              metric.maleAverage
            );
          }

          if (
            metric.femaleAverage
          ) {
            current.female.push(
              metric.femaleAverage
            );
          }

          groups.set(
            label,
            current
          );
        }
      }

      return [
        ...groups.entries(),
      ]
        .map(
          ([
            label,
            values,
          ]) => ({
            label,
            male:
              values.male[
                values.male.length -
                  1
              ] ?? null,
            female:
              values.female[
                values.female.length -
                  1
              ] ?? null,
          })
        )
        .filter(
          (item) =>
            item.male !==
              null ||
            item.female !==
              null
        );
    }, [
      battalionName,
      latestResults,
    ]);

  const aiMetrics =
    useMemo(() => {
      const result: Record<
        string,
        {
          average?: string;
          failedPercent: number;
        }
      > = {};

      /*
        1. תמונת מצב של כל בוחן
      */
      for (
        const item of
        latestResults
      ) {
        const card =
          testCards.find(
            (candidate) =>
              candidate.test.name ===
              item.testName
          );

        const ordered =
          card
            ? [...card.attempts].sort(
                (a, b) =>
                  a.attempt -
                  b.attempt
              )
            : [];

        const first =
          ordered[0];

        const change =
          first &&
          first.attempt !==
            item.attempt
            ? item.passedPercent -
              first.passedPercent
            : null;

        result[
          `בוחן: ${item.testName}`
        ] = {
          failedPercent:
            item.failedPercent,

          average:
            [
              `${attemptLabel(
                item.attempt
              )}: ${formatPercent(
                item.passedPercent
              )} עוברים`,
              `${formatPercent(
                item.excellentPercent
              )} מצטיינים`,
              change !== null
                ? `שינוי במעבר מהמועד הראשון: ${signedPoints(
                    change
                  )} נק׳`
                : "",
            ]
              .filter(Boolean)
              .join(" | "),
        };
      }

      /*
        2. פרמטרים פנימיים — ריצה, מתח,
           ספרינטים וכו׳, אם קיימים בענן
      */
      const metricGroups =
        new Map<
          string,
          {
            failed: number[];
            averages: string[];
            maleAverages: string[];
            femaleAverages: string[];
          }
        >();

      for (
        const item of
        latestResults
      ) {
        for (
          const [
            key,
            metric,
          ] of
          Object.entries(
            item.metrics
          )
        ) {
          const label =
            getMetricLabel(
              key
            );

          const current =
            metricGroups.get(
              label
            ) ?? {
              failed: [],
              averages: [],
              maleAverages: [],
              femaleAverages: [],
            };

          current.failed.push(
            Number(
              metric.failedPercent ??
                0
            )
          );

          if (
            metric.average
          ) {
            current.averages.push(
              metric.average
            );
          }

          if (
            metric.maleAverage
          ) {
            current.maleAverages.push(
              metric.maleAverage
            );
          }

          if (
            metric.femaleAverage
          ) {
            current.femaleAverages.push(
              metric.femaleAverage
            );
          }

          metricGroups.set(
            label,
            current
          );
        }
      }

      for (
        const [
          label,
          group,
        ] of
        metricGroups.entries()
      ) {
        const failedAverage =
          group.failed.length > 0
            ? group.failed.reduce(
                (sum, value) =>
                  sum + value,
                0
              ) /
              group.failed.length
            : 0;

        result[
          `פרמטר: ${label}`
        ] = {
          failedPercent:
            failedAverage,

          average:
            usesGenderSplit(
              battalionName
            ) &&
            (
              group.maleAverages.length >
                0 ||
              group.femaleAverages.length >
                0
            )
              ? `ממוצעי צוערים: ${
                  group.maleAverages
                    .slice(-4)
                    .join(" | ") ||
                  "אין נתון"
                } | ממוצעי צוערות: ${
                  group.femaleAverages
                    .slice(-4)
                    .join(" | ") ||
                  "אין נתון"
                }`
              : group.averages.length > 0
              ? `ממוצעים שנקלטו: ${group.averages
                  .slice(0, 4)
                  .join(" | ")}`
              : "ניתוח לפי אחוז אי־עמידה",
        };
      }

      /*
        3. מגמות בין מועדים
      */
      for (
        const trend of
        battalionIntelligence.trends
      ) {
        const latest =
          latestResults.find(
            (item) =>
              item.testName ===
              trend.testName
          );

        result[
          `מגמה: ${trend.testName}`
        ] = {
          failedPercent:
            latest?.failedPercent ??
            0,

          average:
            `מ${attemptLabel(
              trend.firstAttempt
            )} ל${attemptLabel(
              trend.latestAttempt
            )}: שינוי בעוברים ${signedPoints(
              trend.passedChange
            )} נק׳ | שינוי בנכשלים ${signedPoints(
              trend.failedChange
            )} נק׳ | שינוי במצטיינים ${signedPoints(
              trend.excellentChange
            )} נק׳`,
        };
      }

      return result;
    }, [
      latestResults,
      testCards,
      battalionIntelligence,
    ]);

  async function runAiAnalysis() {
    setAiLoading(true);
    setAiError("");

    try {
      const response =
        await fetch(
          "/api/ai/analysis",
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                track:
                  `${track} – גדוד ${battalionName}`,

                overall: {
                  passedPercent:
                    averagePassed ?? 0,

                  failedPercent:
                    averageFailed ?? 0,

                  excellentPercent:
                    averageExcellent ?? 0,
                },

                metrics:
                  aiMetrics,
              }),
          }
        );

      const data =
        await response.json();

      if (
        !response.ok ||
        !data?.ok
      ) {
        throw new Error(
          data?.message ??
            "ניתוח AI נכשל"
        );
      }

      setAiAnalysis(
        data.analysis as
          AiAnalysis
      );
    } catch (error) {
      console.error(
        "Battalion AI analysis error:",
        error
      );

      setAiError(
        error instanceof Error
          ? error.message
          : "אירעה שגיאה בניתוח AI"
      );
    } finally {
      setAiLoading(false);
    }
  }


  /* =======================================================
     NOT FOUND
  ======================================================= */

  if (
    tests.length ===
    0
  ) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-slate-100 p-4 sm:p-8"
      >
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-6 sm:p-10">

          <h1 className="text-2xl sm:text-3xl font-bold">
            גדוד לא נמצא
          </h1>

          <p className="text-slate-500 mt-2">
            לא הוגדרה כרגע תכנית
            בחנים לגדוד{" "}
            {battalionName}.
          </p>

          <Link
            href="/"
            className="inline-block mt-6 bg-slate-900 text-white px-5 py-3 rounded-xl"
          >
            חזרה לדף הבית
          </Link>

        </div>
      </main>
    );
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (
    loading
  ) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-slate-100 flex items-center justify-center p-4"
      >
        <div className="bg-white rounded-2xl p-8 shadow-sm text-slate-700">
          טוען נתוני בחנים...
        </div>
      </main>
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-100 text-slate-900"
    >

      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="bg-slate-900 text-white px-4 sm:px-6 lg:px-8 py-5 sm:py-7">

        <div className="max-w-[1500px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-5">

          <div>

            <p className="text-slate-300">
              {track}
            </p>

            <h1 className="text-3xl font-bold mt-1">
              גדוד{" "}
              {battalionName}
            </h1>

            <div className="flex flex-wrap items-center gap-2 mt-3">

              <span className="bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 text-sm">
                מחזור:{" "}
                <strong>
                  {activeCycle?.name ??
                    "נתונים קיימים"}
                </strong>
              </span>

              {activeCycle && (
                <span
                  className={
                    activeCycle.status ===
                    "closed"
                      ? "bg-amber-500/20 border border-amber-400/20 text-amber-100 rounded-lg px-3 py-1.5 text-sm"
                      : "bg-green-500/20 border border-green-400/20 text-green-100 rounded-lg px-3 py-1.5 text-sm"
                  }
                >
                  {activeCycle.status ===
                  "closed"
                    ? "🔒 מחזור סגור"
                    : "● מחזור פעיל"}
                </span>
              )}

            </div>

            <p className="text-slate-400 text-sm mt-3">
              CommandFit – תמונת מצב
              מצרפית באחוזים בלבד
            </p>

          </div>

          {/* =================================================
              MAIN NAVIGATION
          ================================================= */}

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 w-full md:w-auto">

            <Link
              href={`/battalions/${encodeURIComponent(
                battalionName
              )}/cadets`}
              className="bg-green-600 hover:bg-green-500 text-white px-5 py-3 rounded-xl font-medium shadow-sm text-center transition"
            >
              📈 הזנת נתונים
            </Link>

            <Link
              href={`/battalions/${encodeURIComponent(
                battalionName
              )}/summary`}
              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-xl font-medium shadow-sm text-center transition"
            >
              📊 סיכום באחוזים
            </Link>

            <Link
              href={`/battalions/${encodeURIComponent(
                battalionName
              )}/training-plan`}
              className="bg-violet-600 hover:bg-violet-500 text-white px-5 py-3 rounded-xl font-medium shadow-sm text-center transition"
            >
              📅 תוכנית אימונים
            </Link>

            <Link
              href="/"
              className="bg-white/10 hover:bg-white/20 px-5 py-3 rounded-xl text-center transition"
            >
              חזרה לדף הבית
            </Link>

          </div>

        </div>

      </header>

      <div className="max-w-[1500px] mx-auto p-4 sm:p-6 md:p-8">

        {/* =================================================
            SECURITY
        ================================================= */}

        <section className="bg-blue-50 border border-blue-100 rounded-2xl p-4 sm:p-5 mb-6">

          <p className="font-bold text-blue-900">
            🔒 נתונים מצרפיים בלבד
          </p>

          <p className="text-sm text-blue-800 mt-1 leading-6">
            במסך זה לא מוצגים שמות,
            מספרי צוערים, מספר נבחנים
            או תיק אישי. כל הנתונים
            מוצגים באחוזים בלבד.
          </p>

        </section>

        {/* =================================================
            NOTIFICATIONS
        ================================================= */}

        <NotificationsPanel
          battalion={
            battalionName
          }
          compact
        />

        {/* =================================================
            KPI
        ================================================= */}

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

          <PercentKpi
            title="ממוצע עוברים"
            value={
              formatPercent(
                averagePassed
              )
            }
            tone="success"
          />

          <PercentKpi
            title="ממוצע נכשלים"
            value={
              formatPercent(
                averageFailed
              )
            }
            tone="danger"
          />

          <PercentKpi
            title="ממוצע מצטיינים"
            value={
              formatPercent(
                averageExcellent
              )
            }
            tone="excellent"
          />

        </section>

        {usesGenderSplit(
          battalionName
        ) && (
          <section className="bg-white rounded-3xl shadow-sm p-5 sm:p-6 mb-8">
            <div>
              <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">
                ממוצעים לפי מגדר
              </p>

              <h2 className="text-xl sm:text-2xl font-black mt-1">
                צוערים וצוערות – ממוצעי מרכיבי הבוחן
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                הנתונים נמשכים אוטומטית מהמועד האחרון שנשמר לכל מרכיב.
              </p>
            </div>

            {genderMetricSummary.length >
            0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-5">
                {genderMetricSummary.map(
                  (metric) => (
                    <div
                      key={
                        metric.label
                      }
                      className="border border-slate-200 rounded-2xl p-4"
                    >
                      <p className="font-black text-lg">
                        {metric.label}
                      </p>

                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                          <p className="text-xs font-bold text-blue-700">
                            בנים
                          </p>
                          <p className="text-xl font-black mt-1">
                            {metric.male ??
                              "אין נתון"}
                          </p>
                        </div>

                        <div className="bg-fuchsia-50 border border-fuchsia-100 rounded-xl p-3">
                          <p className="text-xs font-bold text-fuchsia-700">
                            בנות
                          </p>
                          <p className="text-xl font-black mt-1">
                            {metric.female ??
                              "אין נתון"}
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                )}
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 mt-5 text-slate-500 text-center">
                טרם הוזנו ממוצעי צוערים וצוערות בנפרד
              </div>
            )}
          </section>
        )}

        {/* =================================================
            COMMAND INTELLIGENCE
        ================================================= */}

        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">

          <CommanderInsightCard
            title="מוקד מרכזי"
            value={
              battalionIntelligence
                .weakestTest
                ? battalionIntelligence
                    .weakestTest
                    .testName
                : "אין מספיק נתונים"
            }
            subtitle={
              battalionIntelligence
                .weakestTest
                ? `${formatPercent(
                    battalionIntelligence
                      .weakestTest
                      .failedPercent
                  )} נכשלים במועד האחרון`
                : "נדרש להזין תוצאות"
            }
            tone="danger"
          />

          <CommanderInsightCard
            title="בוחן חזק"
            value={
              battalionIntelligence
                .strongestTest
                ? battalionIntelligence
                    .strongestTest
                    .testName
                : "אין מספיק נתונים"
            }
            subtitle={
              battalionIntelligence
                .strongestTest
                ? `${formatPercent(
                    battalionIntelligence
                      .strongestTest
                      .passedPercent
                  )} עוברים במועד האחרון`
                : "נדרש להזין תוצאות"
            }
            tone="success"
          />

          <CommanderInsightCard
            title="השיפור הגדול ביותר"
            value={
              battalionIntelligence
                .biggestImprovement
                ? battalionIntelligence
                    .biggestImprovement
                    .testName
                : "אין עדיין השוואה"
            }
            subtitle={
              battalionIntelligence
                .biggestImprovement
                ? `${signedPoints(
                    battalionIntelligence
                      .biggestImprovement
                      .passedChange
                  )} נק׳ באחוז העוברים`
                : "נדרשים לפחות שני מועדים"
            }
            tone="info"
          />

          <CommanderInsightCard
            title="דורש מעקב"
            value={
              battalionIntelligence
                .biggestDecline
                ? battalionIntelligence
                    .biggestDecline
                    .testName
                : "אין ירידה מזוהה"
            }
            subtitle={
              battalionIntelligence
                .biggestDecline
                ? `${signedPoints(
                    battalionIntelligence
                      .biggestDecline
                      .passedChange
                  )} נק׳ באחוז העוברים`
                : "המגמות הקיימות יציבות/חיוביות"
            }
            tone="warning"
          />

        </section>

        {/* =================================================
            COMMANDER AI
        ================================================= */}

        <section className="bg-gradient-to-l from-indigo-950 to-slate-900 text-white rounded-3xl shadow-sm p-5 sm:p-7 mb-8">

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">

            <div>

              <p className="text-xs font-bold text-indigo-300 uppercase tracking-wide">
                CommandFit AI
              </p>

              <h2 className="text-2xl font-black mt-1">
                ✨ AI למפקד גדוד {battalionName}
              </h2>

              <p className="text-slate-300 mt-2 max-w-3xl">
                ניתוח ממוקד של גדוד {battalionName} בלבד — השוואה בין מועדים, זיהוי שיפור וירידה, בחנים חלשים, מוקדי אי־עמידה והמלצות ממוקדות להמשך האימונים.
              </p>

            </div>

            <button
              type="button"
              onClick={
                runAiAnalysis
              }
              disabled={
                aiLoading ||
                latestResults.length === 0
              }
              className="w-full lg:w-auto bg-white text-slate-950 hover:bg-indigo-50 rounded-xl px-6 py-3 font-black disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {aiLoading
                ? "מנתח את נתוני הגדוד..."
                : aiAnalysis
                ? "🔄 ניתוח מחדש"
                : "✨ נתח את הגדוד באמצעות AI"}
            </button>

          </div>

          {aiError && (
            <div className="bg-red-500/10 border border-red-400/20 text-red-100 rounded-xl p-4 mt-5">
              {aiError}
            </div>
          )}

          {!aiAnalysis &&
            !aiError && (
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 mt-5 text-slate-300 text-sm">
              לחץ על „נתח את הגדוד באמצעות AI” לקבלת תמונת מצב, חוזקות, מוקדי חולשה, מגמות והמלצות לפעולה המבוססות על הנתונים של גדוד {battalionName}.
            </div>
          )}

          {aiAnalysis && (
            <div className="mt-6 space-y-4">

              <div className="bg-white/10 border border-white/10 rounded-2xl p-5">
                <p className="text-xs text-indigo-200 font-bold">
                  תמונת מצב גדודית
                </p>

                <p className="text-lg font-bold mt-2 leading-8">
                  {aiAnalysis.summary}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

                <BattalionAiListCard
                  title="חוזקות"
                  items={
                    aiAnalysis.strengths
                  }
                  icon="✅"
                />

                <BattalionAiListCard
                  title="מוקדי חולשה"
                  items={
                    aiAnalysis.weaknesses
                  }
                  icon="⚠️"
                />

                <BattalionAiListCard
                  title="מגמות"
                  items={
                    aiAnalysis.trends
                  }
                  icon="📈"
                />

                <BattalionAiListCard
                  title="המלצות לפעולה"
                  items={
                    aiAnalysis.recommendations
                  }
                  icon="🎯"
                />

              </div>

              <div className="bg-indigo-500/10 border border-indigo-300/20 rounded-2xl p-5">
                <p className="text-xs text-indigo-200 font-bold">
                  מסר למפקד גדוד {battalionName}
                </p>

                <p className="mt-2 font-bold leading-7">
                  {aiAnalysis.commanderMessage}
                </p>
              </div>

            </div>
          )}

        </section>

        {/* =================================================
            BATTALION PROGRESS
        ================================================= */}

        <section className="bg-gradient-to-l from-slate-900 to-slate-800 text-white rounded-3xl p-5 sm:p-7 mb-8 shadow-sm">

          <div>

            <h2 className="text-2xl sm:text-3xl font-bold">
              תמונת מצב גדודית
            </h2>

            <p className="text-slate-300 mt-1">
              התקדמות בכל בוחן בנפרד לפי מועדים — אחוזי עוברים, נכשלים ומצטיינים.
            </p>

          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-6">

            {testCards.map(
              (item) => (
                <TestProgressChart
                  key={item.test.id}
                  testName={item.test.name}
                  attempts={item.attempts}
                />
              )
            )}

          </div>

        </section>

        {/* =================================================
            TESTS
        ================================================= */}

        <section className="bg-white rounded-3xl shadow-sm p-4 sm:p-6 mb-8">

          <div>

            <h2 className="text-2xl font-bold">
              מסלול הבחנים
            </h2>

            <p className="text-slate-500 mt-1">
              בכל בוחן מוצגים אחוז
              מעבר, כישלון והצטיינות
              בלבד.
            </p>

          </div>

          <div
            className={`grid grid-cols-1 md:grid-cols-2 ${
              tests.length >=
              4
                ? "xl:grid-cols-4"
                : "xl:grid-cols-3"
            } gap-4 mt-6`}
          >

            {testCards.map(
              (
                item,
                index
              ) => (

                <div
                  key={
                    item.test.id
                  }
                  className="border border-slate-200 rounded-2xl p-4 sm:p-5 bg-white"
                >

                  <div className="flex items-start justify-between gap-3">

                    <div>

                      <p className="text-sm text-slate-500">
                        שלב{" "}
                        {index +
                          1}
                      </p>

                      <h3 className="font-bold text-xl mt-1">
                        {
                          item.test
                            .name
                        }
                      </h3>

                    </div>

                    {item.latest && (
                      <span className="bg-slate-100 rounded-lg px-3 py-1 text-xs font-medium">
                        {attemptLabel(
                          item
                            .latest
                            .attempt
                        )}
                      </span>
                    )}

                  </div>

                  <p className="text-sm text-slate-500 mt-3 min-h-[40px]">
                    {
                      item.test
                        .description
                    }
                  </p>

                  {item.latest ? (

                    <div className="grid grid-cols-3 gap-2 mt-5">

                      <MiniPercent
                        title="עברו"
                        value={
                          item.latest
                            .passedPercent
                        }
                        tone="success"
                      />

                      <MiniPercent
                        title="נכשלו"
                        value={
                          item.latest
                            .failedPercent
                        }
                        tone="danger"
                      />

                      <MiniPercent
                        title="מצטיינים"
                        value={
                          item.latest
                            .excellentPercent
                        }
                        tone="excellent"
                      />

                    </div>

                  ) : (

                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-slate-400 text-sm mt-5 text-center">
                      טרם הוזנו נתונים
                    </div>

                  )}

                  <Link
                    href={`/battalions/${encodeURIComponent(
                      battalionName
                    )}/cadets`}
                    className="block mt-5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-4 py-3 text-center font-medium transition"
                  >
                    הזנת / עדכון נתונים
                  </Link>

                </div>

              )
            )}

          </div>

        </section>

        {/* =================================================
            QUICK ACTIONS
        ================================================= */}

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <Link
            href={`/battalions/${encodeURIComponent(
              battalionName
            )}/cadets`}
            className="bg-green-50 border border-green-100 rounded-3xl p-6 hover:bg-green-100 transition"
          >

            <p className="text-sm text-green-700 font-bold">
              הזנה
            </p>

            <h2 className="text-2xl font-bold text-green-900 mt-1">
              הזנת אחוזי ביצוע
            </h2>

            <p className="text-green-800 text-sm mt-2">
              הזנת אחוז מעבר ואחוז
              מצטיינים. אחוז הכישלון
              מחושב אוטומטית.
            </p>

          </Link>

          <Link
            href={`/battalions/${encodeURIComponent(
              battalionName
            )}/summary`}
            className="bg-blue-50 border border-blue-100 rounded-3xl p-6 hover:bg-blue-100 transition"
          >

            <p className="text-sm text-blue-700 font-bold">
              ניתוח
            </p>

            <h2 className="text-2xl font-bold text-blue-900 mt-1">
              סיכום גדודי באחוזים
            </h2>

            <p className="text-blue-800 text-sm mt-2">
              צפייה בהיסטוריית
              המועדים ובמגמות הביצוע
              ללא מידע אישי.
            </p>

          </Link>

          <Link
            href={`/battalions/${encodeURIComponent(
              battalionName
            )}/training-plan`}
            className="bg-violet-50 border border-violet-100 rounded-3xl p-6 hover:bg-violet-100 transition"
          >

            <p className="text-sm text-violet-700 font-bold">
              תכנון
            </p>

            <h2 className="text-2xl font-bold text-violet-900 mt-1">
              📅 תוכנית אימונים
            </h2>

            <p className="text-violet-800 text-sm mt-2">
              תכנון האימונים לפי
              שבועות, מעקב ביצוע
              והתראות על עומס אימונים
              נמוך.
            </p>

          </Link>

        </section>

        {/* =================================================
            MESSAGE
        ================================================= */}

        {message && (
          <section className="bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 mt-8">
            {message}
          </section>
        )}

      </div>

    </main>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function CommanderInsightCard({
  title,
  value,
  subtitle,
  tone,
}: {
  title: string;
  value: string;
  subtitle: string;
  tone:
    | "success"
    | "danger"
    | "warning"
    | "info";
}) {
  const styles = {
    success:
      "bg-green-50 border-green-100 text-green-950",
    danger:
      "bg-red-50 border-red-100 text-red-950",
    warning:
      "bg-amber-50 border-amber-100 text-amber-950",
    info:
      "bg-blue-50 border-blue-100 text-blue-950",
  };

  return (
    <div
      className={`border rounded-2xl p-5 shadow-sm ${styles[tone]}`}
    >
      <p className="text-xs font-bold opacity-70">
        {title}
      </p>

      <p className="text-xl font-black mt-2">
        {value}
      </p>

      <p className="text-sm mt-2 opacity-80 leading-6">
        {subtitle}
      </p>
    </div>
  );
}



function BattalionAiListCard({
  title,
  items,
  icon,
}: {
  title: string;
  items: string[];
  icon: string;
}) {
  return (
    <div className="bg-white/10 border border-white/10 rounded-2xl p-5">

      <p className="font-black">
        {icon} {title}
      </p>

      {items.length > 0 ? (
        <ul className="space-y-2 mt-3 text-sm text-slate-200">

          {items.map(
            (
              item,
              index
            ) => (
              <li
                key={`${title}-${index}`}
                className="leading-6"
              >
                • {item}
              </li>
            )
          )}

        </ul>
      ) : (
        <p className="text-sm text-slate-400 mt-3">
          אין מספיק נתונים.
        </p>
      )}

    </div>
  );
}


function TestProgressChart({
  testName,
  attempts,
}: {
  testName: string;
  attempts: PercentageResult[];
}) {
  const width = 600;
  const height = 260;

  const padding = {
    top: 24,
    right: 24,
    bottom: 52,
    left: 48,
  };

  const plotWidth =
    width -
    padding.left -
    padding.right;

  const plotHeight =
    height -
    padding.top -
    padding.bottom;

  const orderedAttempts =
    [...attempts].sort(
      (a, b) =>
        a.attempt -
        b.attempt
    );

  function xForIndex(
    index: number
  ) {
    if (
      orderedAttempts.length <=
      1
    ) {
      return (
        padding.left +
        plotWidth / 2
      );
    }

    return (
      padding.left +
      (
        index /
        (
          orderedAttempts.length -
          1
        )
      ) *
        plotWidth
    );
  }

  function yForPercent(
    value: number
  ) {
    const safeValue =
      Math.max(
        0,
        Math.min(
          100,
          value
        )
      );

    return (
      padding.top +
      (
        1 -
        safeValue /
          100
      ) *
        plotHeight
    );
  }

  function pointsFor(
    key:
      | "passedPercent"
      | "failedPercent"
      | "excellentPercent"
  ) {
    return orderedAttempts
      .map(
        (
          item,
          index
        ) =>
          `${xForIndex(
            index
          )},${yForPercent(
            item[key]
          )}`
      )
      .join(" ");
  }

  const yTicks = [
    0,
    25,
    50,
    75,
    100,
  ];

  return (
    <div className="bg-white/10 border border-white/10 rounded-2xl p-4 sm:p-5">

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">

        <div>
          <p className="text-xs text-slate-400">
            בוחן
          </p>

          <h3 className="text-xl font-bold mt-1">
            {testName}
          </h3>
        </div>

        <div className="flex flex-wrap gap-3 text-xs">

          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-green-400" />
            עוברים
          </span>

          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-red-400" />
            נכשלים
          </span>

          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-sky-400" />
            מצטיינים
          </span>

        </div>

      </div>

      {orderedAttempts.length === 0 ? (

        <div className="border border-white/10 bg-white/5 rounded-xl p-8 text-center text-slate-400 mt-5">
          טרם הוזנו נתונים לבוחן זה
        </div>

      ) : (

        <>
          <div className="w-full overflow-x-auto mt-5">

            <svg
              viewBox={`0 0 ${width} ${height}`}
              className="w-full min-w-[520px] h-auto"
              role="img"
              aria-label={`גרף התקדמות ${testName}`}
            >

              {yTicks.map(
                (tick) => {
                  const y =
                    yForPercent(
                      tick
                    );

                  return (
                    <g
                      key={
                        tick
                      }
                    >
                      <line
                        x1={
                          padding.left
                        }
                        x2={
                          width -
                          padding.right
                        }
                        y1={y}
                        y2={y}
                        stroke="rgba(255,255,255,0.12)"
                        strokeWidth="1"
                      />

                      <text
                        x={
                          padding.left -
                          10
                        }
                        y={
                          y + 4
                        }
                        textAnchor="end"
                        fontSize="12"
                        fill="rgba(226,232,240,0.8)"
                      >
                        {tick}%
                      </text>
                    </g>
                  );
                }
              )}

              <line
                x1={padding.left}
                x2={padding.left}
                y1={padding.top}
                y2={
                  height -
                  padding.bottom
                }
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="1"
              />

              <line
                x1={padding.left}
                x2={
                  width -
                  padding.right
                }
                y1={
                  height -
                  padding.bottom
                }
                y2={
                  height -
                  padding.bottom
                }
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="1"
              />

              {orderedAttempts.length >
                1 && (
                <>
                  <polyline
                    points={pointsFor(
                      "passedPercent"
                    )}
                    fill="none"
                    stroke="#4ade80"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  <polyline
                    points={pointsFor(
                      "failedPercent"
                    )}
                    fill="none"
                    stroke="#f87171"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  <polyline
                    points={pointsFor(
                      "excellentPercent"
                    )}
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </>
              )}

              {orderedAttempts.map(
                (
                  item,
                  index
                ) => {
                  const x =
                    xForIndex(
                      index
                    );

                  return (
                    <g
                      key={
                        item.attempt
                      }
                    >
                      <circle
                        cx={x}
                        cy={yForPercent(
                          item.passedPercent
                        )}
                        r="6"
                        fill="#4ade80"
                      />

                      <circle
                        cx={x}
                        cy={yForPercent(
                          item.failedPercent
                        )}
                        r="6"
                        fill="#f87171"
                      />

                      <circle
                        cx={x}
                        cy={yForPercent(
                          item.excellentPercent
                        )}
                        r="6"
                        fill="#38bdf8"
                      />

                      <text
                        x={x}
                        y={
                          height -
                          20
                        }
                        textAnchor="middle"
                        fontSize="12"
                        fill="rgba(226,232,240,0.9)"
                      >
                        {attemptLabel(
                          item.attempt
                        )}
                      </text>
                    </g>
                  );
                }
              )}

            </svg>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">

            <div className="bg-green-400/10 border border-green-400/20 rounded-xl p-3">
              <p className="text-xs text-green-200">
                עוברים – מועד אחרון
              </p>
              <p className="text-xl font-bold text-green-300 mt-1">
                {formatPercent(
                  orderedAttempts[
                    orderedAttempts.length -
                      1
                  ].passedPercent
                )}
              </p>
            </div>

            <div className="bg-red-400/10 border border-red-400/20 rounded-xl p-3">
              <p className="text-xs text-red-200">
                נכשלים – מועד אחרון
              </p>
              <p className="text-xl font-bold text-red-300 mt-1">
                {formatPercent(
                  orderedAttempts[
                    orderedAttempts.length -
                      1
                  ].failedPercent
                )}
              </p>
            </div>

            <div className="bg-sky-400/10 border border-sky-400/20 rounded-xl p-3">
              <p className="text-xs text-sky-200">
                מצטיינים – מועד אחרון
              </p>
              <p className="text-xl font-bold text-sky-300 mt-1">
                {formatPercent(
                  orderedAttempts[
                    orderedAttempts.length -
                      1
                  ].excellentPercent
                )}
              </p>
            </div>

          </div>
        </>

      )}

    </div>
  );
}

function PercentKpi({
  title,
  value,
  tone,
}: {
  title: string;

  value: string;

  tone:
    | "success"
    | "danger"
    | "excellent";
}) {
  const styles = {
    success:
      "bg-green-50 border-green-100 text-green-700",

    danger:
      "bg-red-50 border-red-100 text-red-700",

    excellent:
      "bg-sky-50 border-sky-200 text-sky-700",
  };

  return (
    <div
      className={`border rounded-3xl p-5 sm:p-6 ${styles[tone]}`}
    >

      <p className="text-sm font-bold">
        {title}
      </p>

      <p className="text-4xl sm:text-5xl font-bold mt-2">
        {value}
      </p>

    </div>
  );
}

function MiniPercent({
  title,
  value,
  tone,
}: {
  title: string;

  value: number;

  tone:
    | "success"
    | "danger"
    | "excellent";
}) {
  const styles = {
    success:
      "bg-green-50 text-green-700",

    danger:
      "bg-red-50 text-red-700",

    excellent:
      "bg-sky-50 text-sky-700",
  };

  return (
    <div
      className={`rounded-xl p-3 text-center ${styles[tone]}`}
    >

      <p className="text-[11px] font-bold">
        {title}
      </p>

      <p className="text-lg sm:text-xl font-bold mt-1">
        {formatPercent(
          value
        )}
      </p>

    </div>
  );
}