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

/* =========================================================
   TYPES
========================================================= */

type PercentageRow = {
  test_name: string;
  attempt: number | null;
  passed_percent: number | null;
  failed_percent: number | null;
  excellent_percent: number | null;
};

type PercentageResult = {
  testName: string;
  attempt: number;
  passedPercent: number;
  failedPercent: number;
  excellentPercent: number;
};

type TestSummary = {
  test: BattalionTest;
  latest: PercentageResult | null;
  attempts: PercentageResult[];
};

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

  const rounded =
    Math.round(
      value * 10
    ) / 10;

  return `${rounded}%`;
}

function getAttemptLabel(
  attempt: number
) {
  const labels:
    Record<number, string> = {
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
  row: PercentageRow
): PercentageResult {
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

export default function PercentageSummaryPage() {
  const params =
    useParams<{
      name: string;
    }>();

  const battalionName =
    decodeURIComponent(
      params.name
    );

  const [
    activeCycle,
    setActiveCycle,
  ] =
    useState<CourseCycle | null>(
      null
    );

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
    useState(true);

  const [
    message,
    setMessage,
  ] =
    useState("");

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
     LOAD PERCENTAGE DATA
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
          "Percentage summary load error:",
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
     BUILD SUMMARIES
  ======================================================= */

  const summaries =
    useMemo<
      TestSummary[]
    >(() => {
      return tests.map(
        (test) => {
          const attempts =
            rows
              .filter(
                (row) =>
                  row.testName ===
                  test.name
              )
              .sort(
                (a, b) =>
                  a.attempt -
                  b.attempt
              );

          return {
            test,

            attempts,

            latest:
              attempts.length
                ? attempts[
                    attempts.length -
                      1
                  ]
                : null,
          };
        }
      );
    }, [
      rows,
      tests,
    ]);

  const latestResults =
    useMemo(
      () =>
        summaries
          .map(
            (item) =>
              item.latest
          )
          .filter(
            (
              item
            ): item is PercentageResult =>
              item !== null
          ),
      [
        summaries,
      ]
    );

  const averagePassed =
    useMemo(() => {
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
    }, [
      latestResults,
    ]);

  const averageFailed =
    useMemo(() => {
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
    }, [
      latestResults,
    ]);

  const averageExcellent =
    useMemo(() => {
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
    }, [
      latestResults,
    ]);

  const bestPassTest =
    useMemo(() => {
      if (
        latestResults.length ===
        0
      ) {
        return null;
      }

      return [
        ...latestResults,
      ].sort(
        (a, b) =>
          b.passedPercent -
          a.passedPercent
      )[0];
    }, [
      latestResults,
    ]);

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
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

      {/* HEADER */}

      <header className="bg-slate-900 text-white px-4 sm:px-6 lg:px-8 py-5 sm:py-7">

        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-5">

          <div>

            <p className="text-slate-400 text-sm">
              CommandFit
            </p>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mt-1">
              סיכום באחוזים – גדוד{" "}
              {battalionName}
            </h1>

            <p className="text-slate-300 mt-2">
              תמונת מצב מצרפית בלבד – ללא שמות וללא נתוני כוח אדם מספריים
            </p>

            <div className="flex flex-wrap gap-2 mt-3 text-sm">

              <span className="bg-white/10 border border-white/10 rounded-lg px-3 py-1.5">
                מחזור:{" "}
                <strong>
                  {activeCycle?.name ??
                    "נתונים קיימים"}
                </strong>
              </span>

            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full md:w-auto">

            <Link
              href={`/battalions/${encodeURIComponent(
                battalionName
              )}/cadets`}
              className="bg-white text-slate-900 hover:bg-slate-100 px-5 py-3 rounded-xl font-medium text-center"
            >
              הזנת אחוזים
            </Link>

            <Link
              href={`/battalions/${encodeURIComponent(
                battalionName
              )}`}
              className="bg-white/10 hover:bg-white/20 px-5 py-3 rounded-xl text-center"
            >
              חזרה לגדוד
            </Link>

          </div>

        </div>

      </header>

      <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">

        {/* SECURITY */}

        <section className="bg-blue-50 border border-blue-100 rounded-2xl p-4 sm:p-5 mb-8">

          <p className="font-bold text-blue-900">
            🔒 תצוגה מצרפית בלבד
          </p>

          <p className="text-sm text-blue-800 mt-1 leading-6">
            הדף מציג אחוזי מעבר, כישלון והצטיינות בלבד. אין בו שמות, מספרי צוערים, מספר נבחנים או תיק אישי.
          </p>

        </section>

        {/* TOP KPIs */}

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">

          <TopCard
            title="ממוצע מעבר"
            value={
              formatPercent(
                averagePassed
              )
            }
            tone="success"
          />

          <TopCard
            title="ממוצע כישלון"
            value={
              formatPercent(
                averageFailed
              )
            }
            tone="danger"
          />

          <TopCard
            title="ממוצע מצטיינים"
            value={
              formatPercent(
                averageExcellent
              )
            }
            tone="excellent"
          />

        </section>

        {/* BEST */}

        {bestPassTest && (
          <section className="bg-white rounded-3xl shadow-sm p-5 sm:p-6 mb-8">

            <p className="text-sm text-slate-500">
              הביצוע הגבוה ביותר במועד האחרון
            </p>

            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mt-2">

              <div>
                <h2 className="text-2xl font-bold">
                  {bestPassTest.testName}
                </h2>

                <p className="text-sm text-slate-500 mt-1">
                  {getAttemptLabel(
                    bestPassTest.attempt
                  )}
                </p>
              </div>

              <div className="text-4xl font-bold text-green-700">
                {formatPercent(
                  bestPassTest.passedPercent
                )}
              </div>

            </div>

          </section>
        )}

        {/* TEST CARDS */}

        <section className="space-y-5">

          {summaries.map(
            ({
              test,
              latest,
              attempts,
            }) => (

              <div
                key={
                  test.id
                }
                className="bg-white rounded-3xl shadow-sm p-5 sm:p-6"
              >

                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

                  <div>
                    <p className="text-xs text-slate-400">
                      שלב {test.order}
                    </p>

                    <h2 className="text-xl sm:text-2xl font-bold mt-1">
                      {test.name}
                    </h2>

                    <p className="text-sm text-slate-500 mt-1">
                      {test.description}
                    </p>
                  </div>

                  <Link
                    href={`/battalions/${encodeURIComponent(
                      battalionName
                    )}/cadets`}
                    className="bg-slate-900 text-white rounded-xl px-4 py-3 text-center font-medium"
                  >
                    עדכון אחוזים
                  </Link>

                </div>

                {latest ? (

                  <>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">

                      <PercentCard
                        title="עברו"
                        value={
                          latest.passedPercent
                        }
                        tone="success"
                      />

                      <PercentCard
                        title="נכשלו"
                        value={
                          latest.failedPercent
                        }
                        tone="danger"
                      />

                      <PercentCard
                        title="מצטיינים"
                        value={
                          latest.excellentPercent
                        }
                        tone="excellent"
                      />

                    </div>

                    <div className="mt-5">

                      <p className="text-sm font-bold text-slate-700">
                        היסטוריית מועדים
                      </p>

                      <div className="flex flex-wrap gap-2 mt-3">

                        {attempts.map(
                          (
                            attempt
                          ) => (

                            <div
                              key={
                                attempt.attempt
                              }
                              className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3"
                            >

                              <p className="text-xs text-slate-400">
                                {getAttemptLabel(
                                  attempt.attempt
                                )}
                              </p>

                              <div className="flex flex-wrap gap-3 mt-2 text-sm">

                                <span className="text-green-700 font-bold">
                                  עברו{" "}
                                  {formatPercent(
                                    attempt.passedPercent
                                  )}
                                </span>

                                <span className="text-red-700 font-bold">
                                  נכשלו{" "}
                                  {formatPercent(
                                    attempt.failedPercent
                                  )}
                                </span>

                                <span className="text-sky-700 font-bold">
                                  מצטיינים{" "}
                                  {formatPercent(
                                    attempt.excellentPercent
                                  )}
                                </span>

                              </div>

                            </div>

                          )
                        )}

                      </div>

                    </div>

                  </>

                ) : (

                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-400 mt-6">
                    טרם הוזנו אחוזים לבוחן זה
                  </div>

                )}

              </div>

            )
          )}

        </section>

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

function TopCard({
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

function PercentCard({
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
      "bg-green-50 border-green-100 text-green-700",

    danger:
      "bg-red-50 border-red-100 text-red-700",

    excellent:
      "bg-sky-50 border-sky-200 text-sky-700",
  };

  return (
    <div
      className={`border rounded-2xl p-5 ${styles[tone]}`}
    >

      <p className="text-sm font-bold">
        {title}
      </p>

      <p className="text-4xl font-bold mt-2">
        {formatPercent(
          value
        )}
      </p>

    </div>
  );
}