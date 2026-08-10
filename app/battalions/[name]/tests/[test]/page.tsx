"use client";

import { useParams, useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getActiveCycle,
  type CourseCycle,
} from "@/lib/cycles";

import {
  useAuth,
} from "@/lib/use-auth";

import {
  supabase,
} from "@/lib/supabase";
import {
  publishNotification,
} from "@/lib/notifications";
/* =========================================================
   TYPES
========================================================= */

type MetricValue = {
  average?: string;
  failedPercent: number;
};

type MetricsMap =
  Record<string, MetricValue>;

type PercentageResult = {
  attempt: number;

  passedPercent: number;
  failedPercent: number;
  excellentPercent: number;

  metrics: MetricsMap;
};

type CloudPercentageRow = {
  attempt: number | null;

  passed_percent: number | null;
  failed_percent: number | null;
  excellent_percent: number | null;

  metrics:
    | MetricsMap
    | null;
};

type MetricDefinition = {
  key: string;
  title: string;

  averageLabel?: string;
  averagePlaceholder?: string;

  failedLabel: string;

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
      averageLabel:
        "ממוצע ריצה",
      averagePlaceholder:
        "לדוגמה 21:45",
      failedLabel:
        "% נכשלי ריצה",
    },
    {
      key: "facilities",
      title: "מתקנים",
      failedLabel:
        "% לא עוברים מתקנים",
      failureOnly:
        true,
    },
    {
      key: "ylm",
      title: 'יל"מ',
      averageLabel:
        'ממוצע יל"מ',
      averagePlaceholder:
        "הזן ממוצע",
      failedLabel:
        ' % נכשלי יל"מ',
    },
  ];

const COMBAT_FITNESS_METRICS:
  MetricDefinition[] = [
    {
      key: "run",
      title: "ריצה",
      averageLabel:
        "ממוצע ריצה",
      averagePlaceholder:
        "לדוגמה 12:35",
      failedLabel:
        "% נכשלי ריצה",
    },
    {
      key: "sprints",
      title: "ספרינטים",
      averageLabel:
        "ממוצע ספרינטים",
      averagePlaceholder:
        "לדוגמה 48.5",
      failedLabel:
        "% נכשלי ספרינטים",
    },
    {
      key: "pullups",
      title: "מתח",
      averageLabel:
        "ממוצע מתח",
      averagePlaceholder:
        "לדוגמה 11.2",
      failedLabel:
        "% נכשלי מתח",
    },
    {
      key: "push",
      title:
        "לחיצת חזה / מקבילים",
      averageLabel:
        "ממוצע",
      averagePlaceholder:
        "לדוגמה 13.4",
      failedLabel:
        "% נכשלי לחיצת חזה / מקבילים",
    },
    {
      key: "floorLift",
      title:
        "הרמה מהרצפה",
      averageLabel:
        "ממוצע הרמה מהרצפה",
      averagePlaceholder:
        "לדוגמה 9.8",
      failedLabel:
        "% נכשלי הרמה מהרצפה",
    },
  ];

const STAFF_FITNESS_METRICS:
  MetricDefinition[] = [
    {
      key: "run",
      title: "ריצה",
      averageLabel:
        "ממוצע ריצה",
      averagePlaceholder:
        "לדוגמה 15:10",
      failedLabel:
        "% נכשלי ריצה",
    },
    {
      key: "pushups",
      title:
        "שכיבות סמיכה",
      averageLabel:
        "ממוצע שכיבות סמיכה",
      averagePlaceholder:
        "לדוגמה 32.5",
      failedLabel:
        "% נכשלי שכיבות סמיכה",
    },
  ];

/* =========================================================
   HELPERS
========================================================= */

function getAttemptLabel(
  attempt: number
) {
  const letters:
    Record<number, string> = {
      1: "א׳",
      2: "ב׳",
      3: "ג׳",
      4: "ד׳",
      5: "ה׳",
      6: "ו׳",
      7: "ז׳",
      8: "ח׳",
      9: "ט׳",
      10: "י׳",
    };

  return `מועד ${
    letters[attempt] ??
    attempt
  }`;
}

function clampPercent(
  value: string
) {
  const parsed =
    Number(value);

  if (
    Number.isNaN(parsed)
  ) {
    return 0;
  }

  return Math.min(
    100,
    Math.max(
      0,
      Math.round(
        parsed * 10
      ) / 10
    )
  );
}

function formatPercent(
  value: number
) {
  return `${
    Math.round(
      value * 10
    ) / 10
  }%`;
}

function getMetricDefinitions(
  battalionName: string,
  testName: string
): MetricDefinition[] {
  const isLoran =
    testName.includes(
      "לורן"
    );

  if (isLoran) {
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

function createEmptyMetrics(
  definitions:
    MetricDefinition[]
): MetricsMap {
  return Object.fromEntries(
    definitions.map(
      (metric) => [
        metric.key,
        {
          average:
            metric.failureOnly
              ? undefined
              : "",
          failedPercent:
            0,
        },
      ]
    )
  );
}

function normalizeMetrics(
  source:
    | MetricsMap
    | null,
  definitions:
    MetricDefinition[]
): MetricsMap {
  const empty =
    createEmptyMetrics(
      definitions
    );

  for (
    const definition of
    definitions
  ) {
    const current =
      source?.[
        definition.key
      ];

    if (!current) {
      continue;
    }

    empty[
      definition.key
    ] = {
      average:
        definition.failureOnly
          ? undefined
          : String(
              current.average ??
              ""
            ),

      failedPercent:
        clampPercent(
          String(
            current.failedPercent ??
            0
          )
        ),
    };
  }

  return empty;
}

function createEmptyResult(
  attempt: number,
  definitions:
    MetricDefinition[]
): PercentageResult {
  return {
    attempt,

    passedPercent: 0,
    failedPercent: 100,
    excellentPercent: 0,

    metrics:
      createEmptyMetrics(
        definitions
      ),
  };
}

/* =========================================================
   PAGE
========================================================= */

export default function TestPage() {
  const {
    isViewer,
  } =
    useAuth();

  const params =
    useParams<{
      name: string;
      test: string;
    }>();

  const router =
    useRouter();

  const battalionName =
    decodeURIComponent(
      params.name
    );

  const testName =
    decodeURIComponent(
      params.test
    );

  const metricDefinitions =
    useMemo(
      () =>
        getMetricDefinitions(
          battalionName,
          testName
        ),
      [
        battalionName,
        testName,
      ]
    );

  const [
    activeCycle,
    setActiveCycle,
  ] =
    useState<CourseCycle | null>(
      null
    );

  const [
    attempts,
    setAttempts,
  ] =
    useState<
      PercentageResult[]
    >([]);

  const [
    selectedAttempt,
    setSelectedAttempt,
  ] =
    useState(1);

  const [
    result,
    setResult,
  ] =
    useState<PercentageResult>(
      () =>
        createEmptyResult(
          1,
          metricDefinitions
        )
    );

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    message,
    setMessage,
  ] =
    useState("");

  const cycleId =
    activeCycle?.id ??
    `legacy-${battalionName}`;

  const isReadOnly =
    isViewer ||
    activeCycle?.status ===
      "closed";

  /* =======================================================
     ACTIVE CYCLE
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
     LOAD
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
          .eq(
            "test_name",
            testName
          )
          .order(
            "attempt",
            {
              ascending:
                true,
            }
          );

      if (
        cancelled
      ) {
        return;
      }

      if (error) {
        console.error(
          "Percentage test load error:",
          error
        );

        const empty =
          createEmptyResult(
            1,
            metricDefinitions
          );

        setAttempts(
          []
        );

        setSelectedAttempt(
          1
        );

        setResult(
          empty
        );

        setMessage(
          "לא ניתן היה לטעון את נתוני האחוזים מהענן"
        );

        setLoading(
          false
        );

        return;
      }

      const loaded =
        (
          (
            data ??
            []
          ) as CloudPercentageRow[]
        ).map(
          (row) => ({
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
                100
              ),

            excellentPercent:
              Number(
                row.excellent_percent ??
                0
              ),

            metrics:
              normalizeMetrics(
                row.metrics,
                metricDefinitions
              ),
          })
        );

      setAttempts(
        loaded
      );

      const latest =
        loaded.length > 0
          ? loaded[
              loaded.length -
                1
            ]
          : createEmptyResult(
              1,
              metricDefinitions
            );

      setSelectedAttempt(
        latest.attempt
      );

      setResult(
        latest
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
    metricDefinitions,
    testName,
  ]);

  /* =======================================================
     VALIDATION
  ======================================================= */

  const validation =
    useMemo(() => {
      if (
        result.excellentPercent >
        result.passedPercent
      ) {
        return {
          valid: false,
          text:
            "אחוז המצטיינים לא יכול להיות גבוה מאחוז העוברים.",
        };
      }

      for (
        const metric of
        metricDefinitions
      ) {
        const failed =
          result.metrics[
            metric.key
          ]?.failedPercent ??
          0;

        if (
          failed < 0 ||
          failed > 100
        ) {
          return {
            valid: false,
            text:
              `אחוז הנכשלים ב${metric.title} חייב להיות בין 0% ל־100%.`,
          };
        }
      }

      return {
        valid: true,
        text:
          "הנתונים תקינים ומוכנים לשמירה.",
      };
    }, [
      metricDefinitions,
      result,
    ]);

  /* =======================================================
     UPDATE OVERALL
  ======================================================= */

  function updatePassed(
    value: string
  ) {
    if (
      isReadOnly
    ) {
      return;
    }

    const passed =
      clampPercent(
        value
      );

    const failed =
      Math.round(
        (
          100 -
          passed
        ) *
          10
      ) / 10;

    setResult(
      (current) => ({
        ...current,

        passedPercent:
          passed,

        failedPercent:
          failed,

        excellentPercent:
          Math.min(
            current.excellentPercent,
            passed
          ),
      })
    );
  }

  function updateExcellent(
    value: string
  ) {
    if (
      isReadOnly
    ) {
      return;
    }

    setResult(
      (current) => ({
        ...current,

        excellentPercent:
          clampPercent(
            value
          ),
      })
    );
  }

  /* =======================================================
     UPDATE METRICS
  ======================================================= */

  function updateMetricAverage(
    key: string,
    value: string
  ) {
    if (
      isReadOnly
    ) {
      return;
    }

    setResult(
      (current) => ({
        ...current,

        metrics: {
          ...current.metrics,

          [key]: {
            ...current.metrics[
              key
            ],

            average:
              value,
          },
        },
      })
    );
  }

  function updateMetricFailed(
    key: string,
    value: string
  ) {
    if (
      isReadOnly
    ) {
      return;
    }

    setResult(
      (current) => ({
        ...current,

        metrics: {
          ...current.metrics,

          [key]: {
            ...current.metrics[
              key
            ],

            failedPercent:
              clampPercent(
                value
              ),
          },
        },
      })
    );
  }

  /* =======================================================
     ATTEMPTS
  ======================================================= */

  function selectAttempt(
    attempt: number
  ) {
    setSelectedAttempt(
      attempt
    );

    const existing =
      attempts.find(
        (item) =>
          item.attempt ===
          attempt
      );

    setResult(
      existing ??
      createEmptyResult(
        attempt,
        metricDefinitions
      )
    );

    setMessage(
      ""
    );
  }

  function addAttempt() {
    if (
      isReadOnly
    ) {
      return;
    }

    const highest =
      attempts.reduce(
        (
          max,
          item
        ) =>
          Math.max(
            max,
            item.attempt
          ),
        0
      );

    const next =
      Math.max(
        highest + 1,
        selectedAttempt + 1
      );

    setSelectedAttempt(
      next
    );

    setResult(
      createEmptyResult(
        next,
        metricDefinitions
      )
    );

    setMessage(
      ""
    );
  }

  /* =======================================================
     SAVE
  ======================================================= */

  async function saveResult() {
    if (
      isReadOnly ||
      !validation.valid
    ) {
      return;
    }

    setSaving(
      true
    );

    setMessage(
      "שומר לענן..."
    );

    const {
      error,
    } =
      await supabase
        .from(
          "percentage_test_results"
        )
        .upsert(
          {
            cycle_id:
              cycleId,

            battalion:
              battalionName,

            test_name:
              testName,

            attempt:
              result.attempt,

            passed_percent:
              result.passedPercent,

            failed_percent:
              result.failedPercent,

            excellent_percent:
              result.excellentPercent,

            metrics:
              result.metrics,

            updated_at:
              new Date()
                .toISOString(),
          },
          {
            onConflict:
              "cycle_id,battalion,test_name,attempt",
          }
        );

    if (error) {
      console.error(
        "Percentage test save error:",
        error
      );

      setMessage(
        `השמירה נכשלה: ${error.message}`
      );

      setSaving(
        false
      );

      return;
    }

    setAttempts(
      (current) => {
        const rest =
          current.filter(
            (item) =>
              item.attempt !==
              result.attempt
          );

        return [
          ...rest,
          result,
        ].sort(
          (a, b) =>
            a.attempt -
            b.attempt
        );
      }
    );

    setMessage(
      "הנתונים נשמרו בענן בהצלחה"
    );
await publishNotification({
  cycleId,

  battalion:
    battalionName,

  eventType:
    "test_update",

  severity:
    "success",

  title:
    `גדוד ${battalionName} – ${testName}`,

  message:
    `${getAttemptLabel(
      result.attempt
    )} עודכן. לחץ לצפייה בבוחן ובפירוט הנתונים.`,

  href:
    `/battalions/${encodeURIComponent(
      battalionName
    )}/tests/${encodeURIComponent(
      testName
    )}`,

  dedupeKey:
    `test-update:${cycleId}:${battalionName}:${testName}:attempt-${result.attempt}`,
});
    setSaving(
      false
    );
  }

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
          טוען נתוני בוחן...
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

      <header className="bg-slate-900 text-white px-4 sm:px-6 lg:px-8 py-5 sm:py-6">

        <div className="max-w-[1500px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">

          <div>

            <p className="text-slate-300">
              גדוד{" "}
              {battalionName}
            </p>

            <p className="text-slate-400 text-sm mt-1">
              מחזור:{" "}
              <strong className="text-white">
                {activeCycle?.name ??
                  "נתונים קיימים"}
              </strong>
            </p>

            <h1 className="text-2xl sm:text-3xl font-bold mt-1">
              {testName}
            </h1>

            <p className="text-slate-300 mt-1">
              אחוזי ביצוע וממוצעים לפי פרמטר
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              router.push(
                `/battalions/${encodeURIComponent(
                  battalionName
                )}`
              )
            }
            className="w-full md:w-auto bg-white/10 hover:bg-white/20 px-5 py-3 rounded-xl"
          >
            חזרה לגדוד
          </button>

        </div>

      </header>

      <div className="max-w-[1500px] mx-auto p-4 sm:p-6 lg:p-8">

        <section className="bg-blue-50 border border-blue-100 rounded-2xl p-4 sm:p-5 mb-6">

          <p className="font-bold text-blue-900">
            🔒 נתונים מצרפיים בלבד
          </p>

          <p className="text-sm text-blue-800 mt-1">
            אין שמות, כמויות או תוצאות אישיות. כל נתוני הכשל נשמרים באחוזים בלבד.
          </p>

        </section>

        {/* ATTEMPTS */}

        <section className="bg-white rounded-2xl shadow-sm p-5 mb-6">

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

            <div>
              <h2 className="font-bold text-lg">
                מועד הבוחן
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                לכל מועד נשמרת תמונת מצב נפרדת.
              </p>
            </div>

            {!isReadOnly && (
              <button
                type="button"
                onClick={
                  addAttempt
                }
                className="bg-blue-50 border border-blue-100 text-blue-700 rounded-xl px-5 py-3 font-bold"
              >
                + מועד נוסף
              </button>
            )}

          </div>

          <div className="flex flex-wrap gap-2 mt-5">

            {attempts.map(
              (item) => (

                <button
                  key={
                    item.attempt
                  }
                  type="button"
                  onClick={() =>
                    selectAttempt(
                      item.attempt
                    )
                  }
                  className={
                    selectedAttempt ===
                    item.attempt
                      ? "rounded-xl bg-slate-900 text-white px-5 py-3 font-bold"
                      : "rounded-xl border border-slate-200 bg-white text-slate-700 px-5 py-3 font-bold"
                  }
                >
                  {getAttemptLabel(
                    item.attempt
                  )}
                </button>

              )
            )}

            {!attempts.some(
              (item) =>
                item.attempt ===
                selectedAttempt
            ) && (
              <button
                type="button"
                className="rounded-xl bg-slate-900 text-white px-5 py-3 font-bold"
              >
                {getAttemptLabel(
                  selectedAttempt
                )}
              </button>
            )}

          </div>

        </section>

        {/* OVERALL */}

        <section className="bg-white rounded-3xl shadow-sm p-5 sm:p-6 mb-6">

          <h2 className="text-xl sm:text-2xl font-bold">
            תמונת מצב כללית
          </h2>

          <p className="text-slate-500 mt-1">
            {getAttemptLabel(
              result.attempt
            )}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">

            <PercentInput
              title="% עברו"
              value={
                result.passedPercent
              }
              disabled={
                isReadOnly
              }
              onChange={
                updatePassed
              }
            />

            <ReadOnlyPercent
              title="% נכשלו"
              value={
                result.failedPercent
              }
            />

            <PercentInput
              title="% מצטיינים"
              value={
                result.excellentPercent
              }
              disabled={
                isReadOnly
              }
              onChange={
                updateExcellent
              }
            />

          </div>

        </section>

        {/* METRICS */}

        <section className="bg-white rounded-3xl shadow-sm p-5 sm:p-6 mb-6">

          <div>

            <h2 className="text-xl sm:text-2xl font-bold">
              חלוקה לפי פרמטר
            </h2>

            <p className="text-slate-500 mt-1">
              ממוצע ואחוז נכשלים בכל מרכיב בהתאם לסוג הבוחן.
            </p>

          </div>

          {metricDefinitions.length ===
          0 ? (

            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-400 mt-6">
              טרם הוגדרה חלוקת פרמטרים לבוחן זה.
            </div>

          ) : (

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-6">

              {metricDefinitions.map(
                (metric) => {

                  const metricValue =
                    result.metrics[
                      metric.key
                    ] ?? {
                      average: "",
                      failedPercent:
                        0,
                    };

                  return (
                    <MetricCard
                      key={
                        metric.key
                      }
                      definition={
                        metric
                      }
                      value={
                        metricValue
                      }
                      disabled={
                        isReadOnly
                      }
                      onAverageChange={(
                        value
                      ) =>
                        updateMetricAverage(
                          metric.key,
                          value
                        )
                      }
                      onFailedChange={(
                        value
                      ) =>
                        updateMetricFailed(
                          metric.key,
                          value
                        )
                      }
                    />
                  );
                }
              )}

            </div>

          )}

        </section>

        {/* VISUAL */}

        <section className="bg-white rounded-3xl shadow-sm p-5 sm:p-6 mb-6">

          <h2 className="text-xl sm:text-2xl font-bold">
            אחוזי אי־עמידה לפי מרכיב
          </h2>

          <div className="space-y-4 mt-6">

            {metricDefinitions.map(
              (metric) => {

                const failed =
                  result.metrics[
                    metric.key
                  ]?.failedPercent ??
                  0;

                return (
                  <div
                    key={
                      metric.key
                    }
                  >

                    <div className="flex justify-between gap-3 text-sm">

                      <span className="font-bold">
                        {metric.title}
                      </span>

                      <span className="text-red-700 font-bold">
                        {formatPercent(
                          failed
                        )}
                      </span>

                    </div>

                    <div className="h-3 bg-slate-100 rounded-full overflow-hidden mt-2">

                      <div
                        className="h-full bg-red-500"
                        style={{
                          width:
                            `${failed}%`,
                        }}
                      />

                    </div>

                  </div>
                );
              }
            )}

          </div>

        </section>

        {/* SAVE */}

        <section className="bg-white rounded-2xl shadow-sm p-5 sm:p-6">

          <div
            className={
              validation.valid
                ? "bg-green-50 border border-green-100 text-green-700 rounded-xl p-4"
                : "bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4"
            }
          >
            {validation.text}
          </div>

          {message && (
            <div className="bg-blue-50 border border-blue-100 text-blue-700 rounded-xl p-4 mt-4">
              {message}
            </div>
          )}

          {!isReadOnly && (
            <button
              type="button"
              disabled={
                saving ||
                !validation.valid
              }
              onClick={
                saveResult
              }
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-6 py-3 font-bold mt-5 disabled:opacity-40"
            >
              {saving
                ? "שומר..."
                : "שמירת נתוני הבוחן"}
            </button>
          )}

        </section>

      </div>

    </main>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function PercentInput({
  title,
  value,
  disabled,
  onChange,
}: {
  title: string;
  value: number;
  disabled: boolean;
  onChange:
    (value: string) =>
      void;
}) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">

      <label className="block text-sm font-bold mb-3">
        {title}
      </label>

      <input
        type="number"
        min={0}
        max={100}
        step={0.1}
        disabled={
          disabled
        }
        value={
          value
        }
        onChange={(
          event
        ) =>
          onChange(
            event.target.value
          )
        }
        className="w-full border border-slate-300 rounded-xl px-4 py-3 text-2xl font-bold bg-white"
      />

    </div>
  );
}

function ReadOnlyPercent({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">

      <p className="text-sm font-bold mb-3">
        {title}
      </p>

      <p className="text-3xl font-bold">
        {formatPercent(
          value
        )}
      </p>

      <p className="text-xs text-slate-500 mt-2">
        מחושב אוטומטית
      </p>

    </div>
  );
}

function MetricCard({
  definition,
  value,
  disabled,
  onAverageChange,
  onFailedChange,
}: {
  definition:
    MetricDefinition;

  value:
    MetricValue;

  disabled:
    boolean;

  onAverageChange:
    (value: string) =>
      void;

  onFailedChange:
    (value: string) =>
      void;
}) {
  return (
    <div className="border border-slate-200 rounded-2xl p-5">

      <h3 className="text-lg font-bold">
        {definition.title}
      </h3>

      {!definition.failureOnly && (
        <label className="block mt-4">

          <span className="block text-xs font-bold text-slate-500 mb-2">
            {definition.averageLabel}
          </span>

          <input
            type="text"
            disabled={
              disabled
            }
            value={
              value.average ??
              ""
            }
            onChange={(
              event
            ) =>
              onAverageChange(
                event.target.value
              )
            }
            placeholder={
              definition.averagePlaceholder
            }
            className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white"
          />

        </label>
      )}

      <label className="block mt-4">

        <span className="block text-xs font-bold text-red-700 mb-2">
          {definition.failedLabel}
        </span>

        <div className="relative">

          <input
            type="number"
            min={0}
            max={100}
            step={0.1}
            disabled={
              disabled
            }
            value={
              value.failedPercent
            }
            onChange={(
              event
            ) =>
              onFailedChange(
                event.target.value
              )
            }
            className="w-full border border-red-200 rounded-xl px-4 py-3 pl-10 bg-white font-bold"
          />

          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-red-600 font-bold">
            %
          </span>

        </div>

      </label>

      {definition.failureOnly && (
        <p className="text-xs text-slate-500 mt-3">
          בפרמטר זה נשמר אחוז אי־עמידה בלבד, ללא ממוצע.
        </p>
      )}

    </div>
  );
}
