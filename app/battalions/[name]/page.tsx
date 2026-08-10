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
};

type PercentageResult = {
  testName: string;

  attempt: number;

  passedPercent: number;

  failedPercent: number;

  excellentPercent: number;
};

type TestCardData = {
  test: BattalionTest;

  latest:
    | PercentageResult
    | null;

  attempts:
    PercentageResult[];
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
              excellent_percent
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
          "לא ניתן היה לטעון את נתוני האחוזים מהענן"
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
          טוען נתוני אחוזים...
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
              📈 הזנת אחוזים
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
                      טרם הוזנו אחוזים
                    </div>

                  )}

                  <Link
                    href={`/battalions/${encodeURIComponent(
                      battalionName
                    )}/cadets`}
                    className="block mt-5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-4 py-3 text-center font-medium transition"
                  >
                    הזנת / עדכון אחוזים
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