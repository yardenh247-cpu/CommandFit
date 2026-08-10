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

type MetricValue = {
  average?: string;
  failedPercent: number;
};

type MetricsMap =
  Record<string, MetricValue>;

type PercentageRow = {
  test_name: string;
  attempt: number | null;
  company: string | null;
  passed_percent: number | null;
  failed_percent: number | null;
  excellent_percent: number | null;
  metrics: MetricsMap | null;
};

type PercentageResult = {
  testName: string;
  attempt: number;
  passedPercent: number;
  failedPercent: number;
  excellentPercent: number;
  metrics: MetricsMap;
};

type TestSummary = {
  test: BattalionTest;
  latest: PercentageResult | null;
  attempts: PercentageResult[];
};

type MetricDefinition = {
  key: string;
  title: string;
  failureOnly?: boolean;
};

/* =========================================================
   CONFIG
========================================================= */

const STAFF_BATTALIONS =
  new Set([
    "ארז",
    "ברוש",
    "חרוב",
    "אלון",
  ]);

const LORAN_METRICS:
  MetricDefinition[] = [
    {
      key: "run",
      title: "ריצה",
    },
    {
      key: "facilities",
      title: "מתקנים",
      failureOnly: true,
    },
    {
      key: "ylm",
      title: 'יל"מ',
    },
  ];

const COMBAT_FITNESS_METRICS:
  MetricDefinition[] = [
    {
      key: "run",
      title: "ריצה",
    },
    {
      key: "sprints",
      title: "ספרינטים",
    },
    {
      key: "pullups",
      title: "מתח",
    },
    {
      key: "push",
      title:
        "לחיצת חזה / מקבילים",
    },
    {
      key: "floorLift",
      title:
        "הרמה מהרצפה",
    },
  ];

const STAFF_FITNESS_METRICS:
  MetricDefinition[] = [
    {
      key: "run",
      title: "ריצה",
    },
    {
      key: "pushups",
      title:
        "שכיבות סמיכה",
    },
  ];

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
    Math.round(value * 10) / 10
  }%`;
}

function formatAverage(
  value?: string
) {
  const clean =
    String(
      value ?? ""
    ).trim();

  return clean || "—";
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

function getMetricDefinitions(
  battalionName: string,
  testName: string
): MetricDefinition[] {
  if (
    testName.includes(
      "לורן"
    )
  ) {
    return LORAN_METRICS;
  }

  const isFitness =
    testName.includes(
      'כש"ג'
    ) ||
    testName.includes(
      "כש״ג"
    );

  if (isFitness) {
    return STAFF_BATTALIONS.has(
      battalionName
    )
      ? STAFF_FITNESS_METRICS
      : COMBAT_FITNESS_METRICS;
  }

  return [];
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

    metrics:
      row.metrics ??
      {},
  };
}


function signedPercent(
  value: number
) {
  const rounded =
    Math.round(value * 10) / 10;

  if (rounded > 0) {
    return `+${rounded}%`;
  }

  return `${rounded}%`;
}

function trendForHigherIsBetter(
  first: number,
  latest: number
) {
  const change =
    latest - first;

  if (Math.abs(change) < 0.05) {
    return {
      label: "ללא שינוי",
      value: "0%",
      className:
        "text-slate-600 bg-slate-100",
    };
  }

  if (change > 0) {
    return {
      label: "שיפור",
      value:
        signedPercent(change),
      className:
        "text-green-700 bg-green-50",
    };
  }

  return {
    label: "ירידה",
    value:
      signedPercent(change),
    className:
      "text-red-700 bg-red-50",
  };
}

function trendForLowerIsBetter(
  first: number,
  latest: number
) {
  const change =
    latest - first;

  if (Math.abs(change) < 0.05) {
    return {
      label: "ללא שינוי",
      value: "0%",
      className:
        "text-slate-600 bg-slate-100",
    };
  }

  if (change < 0) {
    return {
      label: "שיפור",
      value:
        signedPercent(change),
      className:
        "text-green-700 bg-green-50",
    };
  }

  return {
    label: "החמרה",
    value:
      signedPercent(change),
    className:
      "text-red-700 bg-red-50",
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

  useEffect(() => {
    setActiveCycle(
      getActiveCycle(
        battalionName
      )
    );
  }, [
    battalionName,
  ]);

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
              company,
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
          .eq(
            "company",
            "כלל הגדוד"
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
      if (!latestResults.length) {
        return null;
      }

      return (
        latestResults.reduce(
          (sum, item) =>
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
      if (!latestResults.length) {
        return null;
      }

      return (
        latestResults.reduce(
          (sum, item) =>
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
      if (!latestResults.length) {
        return null;
      }

      return (
        latestResults.reduce(
          (sum, item) =>
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
      if (!latestResults.length) {
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

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-100 text-slate-900"
    >

      <header className="bg-slate-900 text-white px-4 sm:px-6 lg:px-8 py-5 sm:py-7">

        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-5">

          <div>

            <p className="text-slate-400 text-sm">
              CommandFit
            </p>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mt-1">
              סיכום ביצועים – גדוד{" "}
              {battalionName}
            </h1>

            <p className="text-slate-300 mt-2">
              אחוזי מעבר, אחוזי אי־עמידה וממוצעים לפי מרכיבי הבוחן
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

        <section className="bg-blue-50 border border-blue-100 rounded-2xl p-4 sm:p-5 mb-8">

          <p className="font-bold text-blue-900">
            🔒 תצוגה מצרפית בלבד
          </p>

          <p className="text-sm text-blue-800 mt-1 leading-6">
            מוצגים אחוזים וממוצעים מצרפיים בלבד, ללא שמות, ללא מספרי צוערים וללא כמות נבחנים.
          </p>

        </section>

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

        {bestPassTest && (
          <section className="bg-white rounded-3xl shadow-sm p-5 sm:p-6 mb-8">

            <p className="text-sm text-slate-500">
              אחוז המעבר הגבוה ביותר במועד האחרון
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

        <section className="space-y-6">

          {summaries.map(
            ({
              test,
              latest,
              attempts,
            }) => {
              const metricDefinitions =
                getMetricDefinitions(
                  battalionName,
                  test.name
                );

              return (
                <div
                  key={
                    test.id
                  }
                  className="bg-white rounded-3xl shadow-sm p-5 sm:p-6"
                >

                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

                    <div>

                      <p className="text-xs text-slate-400">
                        שלב{" "}
                        {test.order}
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
                      )}/tests/${encodeURIComponent(
                        test.name
                      )}`}
                      className="bg-slate-900 text-white rounded-xl px-4 py-3 text-center font-medium"
                    >
                      פתיחת הבוחן
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

                      {metricDefinitions.length >
                        0 && (
                        <div className="mt-7">

                          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">

                            <div>
                              <h3 className="text-lg font-bold">
                                פירוט לפי פרמטר
                              </h3>

                              <p className="text-sm text-slate-500 mt-1">
                                נתוני{" "}
                                {getAttemptLabel(
                                  latest.attempt
                                )}
                              </p>
                            </div>

                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">

                            {metricDefinitions.map(
                              (
                                metric
                              ) => {
                                const value =
                                  latest.metrics[
                                    metric.key
                                  ];

                                return (
                                  <MetricSummaryCard
                                    key={
                                      metric.key
                                    }
                                    title={
                                      metric.title
                                    }
                                    average={
                                      value?.average
                                    }
                                    failedPercent={
                                      value?.failedPercent ??
                                      0
                                    }
                                    failureOnly={
                                      metric.failureOnly
                                    }
                                  />
                                );
                              }
                            )}

                          </div>

                        </div>
                      )}

                      {attempts.length >= 2 && (
                        <TrendSection
                          first={
                            attempts[0]
                          }
                          latest={
                            attempts[
                              attempts.length -
                                1
                            ]
                          }
                          metricDefinitions={
                            metricDefinitions
                          }
                        />
                      )}

                      <div className="mt-7">

                        <p className="text-sm font-bold text-slate-700">
                          היסטוריית מועדים
                        </p>

                        <div className="space-y-3 mt-3">

                          {attempts.map(
                            (
                              attempt
                            ) => (

                              <div
                                key={
                                  attempt.attempt
                                }
                                className="bg-slate-50 border border-slate-100 rounded-2xl p-4"
                              >

                                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4">

                                  <div>

                                    <p className="font-bold">
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

                                  {metricDefinitions.length >
                                    0 && (
                                    <div className="flex flex-wrap gap-2">

                                      {metricDefinitions.map(
                                        (
                                          metric
                                        ) => {
                                          const value =
                                            attempt.metrics[
                                              metric.key
                                            ];

                                          return (
                                            <div
                                              key={
                                                metric.key
                                              }
                                              className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs"
                                            >

                                              <span className="font-bold">
                                                {metric.title}
                                              </span>

                                              {!metric.failureOnly && (
                                                <span className="text-slate-500 mr-2">
                                                  ממוצע{" "}
                                                  {formatAverage(
                                                    value?.average
                                                  )}
                                                </span>
                                              )}

                                              <span className="text-red-700 font-bold mr-2">
                                                נכשלים{" "}
                                                {formatPercent(
                                                  value?.failedPercent ??
                                                  0
                                                )}
                                              </span>

                                            </div>
                                          );
                                        }
                                      )}

                                    </div>
                                  )}

                                </div>

                              </div>

                            )
                          )}

                        </div>

                      </div>

                    </>
                  ) : (

                    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-400 mt-6">
                      טרם הוזנו נתונים לבוחן זה
                    </div>

                  )}

                </div>
              );
            }
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


function TrendSection({
  first,
  latest,
  metricDefinitions,
}: {
  first: PercentageResult;
  latest: PercentageResult;
  metricDefinitions:
    MetricDefinition[];
}) {
  const passTrend =
    trendForHigherIsBetter(
      first.passedPercent,
      latest.passedPercent
    );

  const failTrend =
    trendForLowerIsBetter(
      first.failedPercent,
      latest.failedPercent
    );

  const excellentTrend =
    trendForHigherIsBetter(
      first.excellentPercent,
      latest.excellentPercent
    );

  return (
    <div className="mt-7 border-t border-slate-100 pt-7">

      <div>
        <h3 className="text-lg font-bold">
          מגמת שיפור
        </h3>

        <p className="text-sm text-slate-500 mt-1">
          השוואה בין{" "}
          {getAttemptLabel(
            first.attempt
          )}{" "}
          לבין{" "}
          {getAttemptLabel(
            latest.attempt
          )}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">

        <TrendCard
          title="עוברים"
          first={
            first.passedPercent
          }
          latest={
            latest.passedPercent
          }
          trend={
            passTrend
          }
        />

        <TrendCard
          title="נכשלים"
          first={
            first.failedPercent
          }
          latest={
            latest.failedPercent
          }
          trend={
            failTrend
          }
        />

        <TrendCard
          title="מצטיינים"
          first={
            first.excellentPercent
          }
          latest={
            latest.excellentPercent
          }
          trend={
            excellentTrend
          }
        />

      </div>

      {metricDefinitions.length >
        0 && (
        <div className="mt-5">

          <p className="text-sm font-bold text-slate-700">
            שינוי באחוזי אי־עמידה לפי פרמטר
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 mt-3">

            {metricDefinitions.map(
              (metric) => {
                const firstFailed =
                  first.metrics[
                    metric.key
                  ]?.failedPercent ??
                  0;

                const latestFailed =
                  latest.metrics[
                    metric.key
                  ]?.failedPercent ??
                  0;

                const trend =
                  trendForLowerIsBetter(
                    firstFailed,
                    latestFailed
                  );

                return (
                  <TrendCard
                    key={
                      metric.key
                    }
                    title={
                      metric.title
                    }
                    first={
                      firstFailed
                    }
                    latest={
                      latestFailed
                    }
                    trend={
                      trend
                    }
                    failureMetric
                  />
                );
              }
            )}

          </div>

        </div>
      )}

    </div>
  );
}

function TrendCard({
  title,
  first,
  latest,
  trend,
  failureMetric = false,
}: {
  title: string;
  first: number;
  latest: number;
  trend: {
    label: string;
    value: string;
    className: string;
  };
  failureMetric?: boolean;
}) {
  return (
    <div className="border border-slate-200 rounded-2xl p-4 bg-white">

      <div className="flex items-start justify-between gap-3">

        <div>
          <p className="font-bold">
            {title}
          </p>

          {failureMetric && (
            <p className="text-xs text-slate-400 mt-0.5">
              אחוז אי־עמידה
            </p>
          )}
        </div>

        <span
          className={`rounded-lg px-2.5 py-1 text-xs font-bold ${trend.className}`}
        >
          {trend.label}{" "}
          {trend.value}
        </span>

      </div>

      <div className="flex items-center gap-3 mt-4">

        <div>
          <p className="text-xs text-slate-400">
            ראשון
          </p>

          <p className="text-xl font-bold">
            {formatPercent(
              first
            )}
          </p>
        </div>

        <span className="text-slate-300 text-xl">
          ←
        </span>

        <div>
          <p className="text-xs text-slate-400">
            אחרון
          </p>

          <p className="text-xl font-bold">
            {formatPercent(
              latest
            )}
          </p>
        </div>

      </div>

    </div>
  );
}

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

function MetricSummaryCard({
  title,
  average,
  failedPercent,
  failureOnly,
}: {
  title: string;
  average?: string;
  failedPercent: number;
  failureOnly?: boolean;
}) {
  return (
    <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50">

      <h4 className="text-lg font-bold">
        {title}
      </h4>

      <div
        className={`grid ${
          failureOnly
            ? "grid-cols-1"
            : "grid-cols-2"
        } gap-3 mt-4`}
      >

        {!failureOnly && (
          <div className="bg-white rounded-xl p-3 border border-slate-100">

            <p className="text-xs text-slate-500">
              ממוצע
            </p>

            <p className="text-xl font-bold mt-1">
              {formatAverage(
                average
              )}
            </p>

          </div>
        )}

        <div className="bg-red-50 rounded-xl p-3 border border-red-100">

          <p className="text-xs text-red-600">
            {failureOnly
              ? "% לא עוברים"
              : "% נכשלים"}
          </p>

          <p className="text-xl font-bold text-red-700 mt-1">
            {formatPercent(
              failedPercent
            )}
          </p>

        </div>

      </div>

      <div className="h-2 bg-white rounded-full overflow-hidden mt-4">

        <div
          className="h-full bg-red-500"
          style={{
            width:
              `${failedPercent}%`,
          }}
        />

      </div>

    </div>
  );
}