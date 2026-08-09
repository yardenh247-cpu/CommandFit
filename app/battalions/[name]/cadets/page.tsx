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
  useAuth,
} from "@/lib/use-auth";

import {
  supabase,
} from "@/lib/supabase";

/* =========================================================
   TYPES
========================================================= */

type AggregateResult = {
  testName: string;
  attempt: number;

  tested: number;
  passed: number;
  failed: number;
  excellent: number;

  notes: string;
};

type CloudAggregateRow = {
  test_name: string;
  attempt: number | null;

  tested: number | null;
  passed: number | null;
  failed: number | null;
  excellent: number | null;

  notes: string | null;
};

/* =========================================================
   HELPERS
========================================================= */

function emptyResult(
  testName: string,
  attempt = 1
): AggregateResult {
  return {
    testName,
    attempt,

    tested: 0,
    passed: 0,
    failed: 0,
    excellent: 0,

    notes: "",
  };
}

function clampNumber(
  value: string
) {
  const parsed =
    Number(value);

  if (
    Number.isNaN(parsed)
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.round(parsed)
  );
}

function percent(
  value: number,
  total: number
) {
  if (
    total <= 0
  ) {
    return 0;
  }

  return (
    (value / total) *
    100
  );
}

function formatPercent(
  value: number
) {
  return `${value.toFixed(1)}%`;
}

function getAttemptLabel(
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

/* =========================================================
   PAGE
========================================================= */

export default function AggregateResultsPage() {
  const {
    isViewer,
  } =
    useAuth();

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
    selectedTest,
    setSelectedTest,
  ] =
    useState<BattalionTest | null>(
      null
    );

  const [
    result,
    setResult,
  ] =
    useState<AggregateResult | null>(
      null
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

  const [
    attempts,
    setAttempts,
  ] =
    useState<
      AggregateResult[]
    >([]);

  const cycleId =
    activeCycle?.id ??
    `legacy-${battalionName}`;

  const isReadOnly =
    isViewer ||
    activeCycle?.status ===
      "closed";

  /* =======================================================
     LOAD CYCLE + DEFAULT TEST
  ======================================================= */

  useEffect(() => {
    const cycle =
      getActiveCycle(
        battalionName
      );

    setActiveCycle(
      cycle
    );
  }, [
    battalionName,
  ]);

  useEffect(() => {
    if (
      tests.length === 0
    ) {
      setSelectedTest(
        null
      );

      setResult(
        null
      );

      return;
    }

    setSelectedTest(
      (current) =>
        current &&
        tests.some(
          (test) =>
            test.name ===
            current.name
        )
          ? current
          : tests[0]
    );
  }, [
    tests,
  ]);

  /* =======================================================
     LOAD TEST ATTEMPTS
  ======================================================= */

  useEffect(() => {
    let cancelled =
      false;

    async function load() {
      if (
        !selectedTest
      ) {
        setAttempts(
          []
        );

        setResult(
          null
        );

        setLoading(
          false
        );

        return;
      }

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
            "aggregate_test_results"
          )
          .select(
            `
              test_name,
              attempt,
              tested,
              passed,
              failed,
              excellent,
              notes
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
            selectedTest.name
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
          "Aggregate results load error:",
          error
        );

        setAttempts(
          []
        );

        setResult(
          emptyResult(
            selectedTest.name
          )
        );

        setMessage(
          "לא ניתן היה לטעון נתונים מהענן"
        );

        setLoading(
          false
        );

        return;
      }

      const loaded =
        (
          data as
            CloudAggregateRow[]
        ).map(
          (row) => ({
            testName:
              row.test_name,

            attempt:
              row.attempt ??
              1,

            tested:
              row.tested ??
              0,

            passed:
              row.passed ??
              0,

            failed:
              row.failed ??
              0,

            excellent:
              row.excellent ??
              0,

            notes:
              row.notes ??
              "",
          })
        );

      setAttempts(
        loaded
      );

      setResult(
        loaded.length > 0
          ? loaded[
              loaded.length -
                1
            ]
          : emptyResult(
              selectedTest.name
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
    selectedTest,
  ]);

  /* =======================================================
     DERIVED
  ======================================================= */

  const passedPercent =
    result
      ? percent(
          result.passed,
          result.tested
        )
      : 0;

  const failedPercent =
    result
      ? percent(
          result.failed,
          result.tested
        )
      : 0;

  const excellentPercent =
    result
      ? percent(
          result.excellent,
          result.tested
        )
      : 0;

  const validation =
    useMemo(() => {
      if (!result) {
        return {
          valid: false,
          text: "",
        };
      }

      if (
        result.tested ===
        0
      ) {
        return {
          valid: false,
          text:
            "יש להזין מספר נבחנים גדול מ־0.",
        };
      }

      if (
        result.passed +
          result.failed !==
        result.tested
      ) {
        return {
          valid: false,
          text:
            "מספר העוברים + מספר הנכשלים חייב להיות שווה למספר הנבחנים.",
        };
      }

      if (
        result.excellent >
        result.passed
      ) {
        return {
          valid: false,
          text:
            "מספר המצטיינים לא יכול להיות גדול ממספר העוברים.",
        };
      }

      return {
        valid: true,
        text:
          "הנתונים תקינים ומוכנים לשמירה.",
      };
    }, [
      result,
    ]);

  /* =======================================================
     UPDATE
  ======================================================= */

  function updateNumber(
    field:
      | "tested"
      | "passed"
      | "failed"
      | "excellent",
    value: string
  ) {
    if (
      isReadOnly ||
      !result
    ) {
      return;
    }

    setResult({
      ...result,
      [field]:
        clampNumber(
          value
        ),
    });

    setMessage(
      ""
    );
  }

  function selectAttempt(
    attempt: number
  ) {
    const existing =
      attempts.find(
        (item) =>
          item.attempt ===
          attempt
      );

    if (existing) {
      setResult(
        existing
      );
    }
  }

  function createNextAttempt() {
    if (
      isReadOnly ||
      !selectedTest
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

    setResult(
      emptyResult(
        selectedTest.name,
        highest + 1
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
      !result ||
      !selectedTest ||
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
          "aggregate_test_results"
        )
        .upsert(
          {
            cycle_id:
              cycleId,

            battalion:
              battalionName,

            test_name:
              selectedTest.name,

            attempt:
              result.attempt,

            tested:
              result.tested,

            passed:
              result.passed,

            failed:
              result.failed,

            excellent:
              result.excellent,

            notes:
              result.notes ||
              null,

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
        "Aggregate results save error:",
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
        const withoutCurrent =
          current.filter(
            (item) =>
              item.attempt !==
              result.attempt
          );

        return [
          ...withoutCurrent,
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

    setSaving(
      false
    );
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (
    loading &&
    !result
  ) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-slate-100 flex items-center justify-center p-4"
      >
        <div className="bg-white rounded-2xl p-8 shadow-sm text-slate-700">
          טוען נתוני ביצוע...
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

      <header className="bg-slate-900 text-white px-4 sm:px-6 lg:px-8 py-5 sm:py-7">

        <div className="max-w-[1500px] mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-5">

          <div>

            <p className="text-slate-300 text-sm">
              CommandFit
            </p>

            <h1 className="text-2xl sm:text-3xl font-bold mt-1">
              הזנת נתוני ביצוע – גדוד{" "}
              {battalionName}
            </h1>

            <p className="text-slate-300 mt-2">
              הזנה ברמת הבוחן בלבד – ללא שמות צוערים
            </p>

            <div className="flex flex-wrap gap-2 mt-3 text-sm">

              <span className="bg-white/10 border border-white/10 rounded-lg px-3 py-1.5">
                מחזור:{" "}
                <strong>
                  {activeCycle?.name ??
                    "נתונים קיימים"}
                </strong>
              </span>

              {isReadOnly && (
                <span className="bg-amber-500/20 border border-amber-400/20 text-amber-100 rounded-lg px-3 py-1.5">
                  צפייה בלבד
                </span>
              )}

            </div>

          </div>

          <Link
            href={`/battalions/${encodeURIComponent(
              battalionName
            )}`}
            className="w-full lg:w-auto bg-white/10 hover:bg-white/20 rounded-xl px-5 py-3 text-center"
          >
            חזרה לגדוד
          </Link>

        </div>

      </header>

      <div className="max-w-[1500px] mx-auto p-4 sm:p-6 lg:p-8">

        {/* TEST SELECTOR */}

        <section className="bg-white rounded-3xl shadow-sm p-5 sm:p-6 mb-6">

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">

            <div className="flex-1">

              <label className="block text-sm font-bold text-slate-900 mb-2">
                בוחן
              </label>

              <select
                value={
                  selectedTest?.name ??
                  ""
                }
                onChange={(
                  event
                ) => {
                  const next =
                    tests.find(
                      (test) =>
                        test.name ===
                        event.target
                          .value
                    );

                  setSelectedTest(
                    next ??
                    null
                  );
                }}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white text-slate-900"
              >

                {tests.map(
                  (test) => (

                    <option
                      key={
                        test.id
                      }
                      value={
                        test.name
                      }
                    >
                      {test.name}
                    </option>

                  )
                )}

              </select>

            </div>

            <button
              type="button"
              disabled={
                isReadOnly
              }
              onClick={
                createNextAttempt
              }
              className="bg-blue-50 text-blue-700 border border-blue-100 rounded-xl px-5 py-3 font-bold disabled:opacity-50"
            >
              + מועד נוסף
            </button>

          </div>

          {attempts.length >
            0 && (

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
                      result?.attempt ===
                      item.attempt
                        ? "bg-slate-900 text-white rounded-xl px-4 py-2 font-bold"
                        : "bg-slate-100 text-slate-700 rounded-xl px-4 py-2"
                    }
                  >
                    {getAttemptLabel(
                      item.attempt
                    )}
                  </button>

                )
              )}

            </div>

          )}

        </section>

        {result && (
          <>

            {/* ATTEMPT HEADER */}

            <section className="bg-white rounded-3xl shadow-sm p-5 sm:p-6 mb-6">

              <p className="text-sm text-slate-500">
                מועד נבחר
              </p>

              <h2 className="text-2xl font-bold mt-1">
                {selectedTest?.name} •{" "}
                {getAttemptLabel(
                  result.attempt
                )}
              </h2>

            </section>

            {/* INPUT */}

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

              <NumberCard
                title='סה"כ נבחנו'
                value={
                  result.tested
                }
                disabled={
                  isReadOnly
                }
                onChange={(
                  value
                ) =>
                  updateNumber(
                    "tested",
                    value
                  )
                }
              />

              <NumberCard
                title="עברו"
                value={
                  result.passed
                }
                disabled={
                  isReadOnly
                }
                onChange={(
                  value
                ) =>
                  updateNumber(
                    "passed",
                    value
                  )
                }
              />

              <NumberCard
                title="נכשלו"
                value={
                  result.failed
                }
                disabled={
                  isReadOnly
                }
                onChange={(
                  value
                ) =>
                  updateNumber(
                    "failed",
                    value
                  )
                }
              />

              <NumberCard
                title="מצטיינים"
                value={
                  result.excellent
                }
                disabled={
                  isReadOnly
                }
                onChange={(
                  value
                ) =>
                  updateNumber(
                    "excellent",
                    value
                  )
                }
              />

            </section>

            {/* PERCENTAGES */}

            <section className="bg-white rounded-3xl shadow-sm p-5 sm:p-7 mb-6">

              <div>

                <h2 className="text-xl sm:text-2xl font-bold">
                  תמונת מצב
                </h2>

                <p className="text-slate-500 mt-1">
                  האחוזים מחושבים אוטומטית מתוך כלל הנבחנים
                </p>

              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">

                <PercentCard
                  title="עברו"
                  percent={
                    passedPercent
                  }
                  count={
                    result.passed
                  }
                  total={
                    result.tested
                  }
                  tone="success"
                />

                <PercentCard
                  title="נכשלו"
                  percent={
                    failedPercent
                  }
                  count={
                    result.failed
                  }
                  total={
                    result.tested
                  }
                  tone="danger"
                />

                <PercentCard
                  title="מצטיינים"
                  percent={
                    excellentPercent
                  }
                  count={
                    result.excellent
                  }
                  total={
                    result.tested
                  }
                  tone="excellent"
                />

              </div>

              <div className="mt-6">

                <div className="h-5 bg-slate-100 rounded-full overflow-hidden flex">

                  <div
                    className="bg-green-500 h-full"
                    style={{
                      width:
                        `${Math.min(
                          100,
                          passedPercent
                        )}%`,
                    }}
                  />

                  <div
                    className="bg-red-500 h-full"
                    style={{
                      width:
                        `${Math.min(
                          100,
                          failedPercent
                        )}%`,
                    }}
                  />

                </div>

                <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-600">

                  <span>
                    🟢 עברו{" "}
                    {formatPercent(
                      passedPercent
                    )}
                  </span>

                  <span>
                    🔴 נכשלו{" "}
                    {formatPercent(
                      failedPercent
                    )}
                  </span>

                  <span>
                    ★ מצטיינים{" "}
                    {formatPercent(
                      excellentPercent
                    )}
                  </span>

                </div>

              </div>

            </section>

            {/* NOTES + VALIDATION */}

            <section className="bg-white rounded-3xl shadow-sm p-5 sm:p-6 mb-6">

              <label className="block text-sm font-bold text-slate-900 mb-2">
                הערות
              </label>

              <textarea
                disabled={
                  isReadOnly
                }
                value={
                  result.notes
                }
                onChange={(
                  event
                ) =>
                  setResult({
                    ...result,
                    notes:
                      event.target
                        .value,
                  })
                }
                rows={3}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white text-slate-900 disabled:bg-slate-50"
                placeholder="הערה כללית על הבוחן / המועד"
              />

              <div
                className={
                  validation.valid
                    ? "bg-green-50 border border-green-100 text-green-700 rounded-xl p-4 mt-4"
                    : "bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 mt-4"
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
                  className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-6 py-3 font-bold mt-5 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {saving
                    ? "שומר..."
                    : "שמירת נתוני הבוחן"}
                </button>
              )}

            </section>

          </>
        )}

      </div>

    </main>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function NumberCard({
  title,
  value,
  disabled,
  onChange,
}: {
  title: string;
  value: number;
  disabled: boolean;
  onChange: (
    value: string
  ) => void;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">

      <label className="block text-sm font-bold text-slate-900 mb-3">
        {title}
      </label>

      <input
        disabled={
          disabled
        }
        type="number"
        min={0}
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
        className="w-full border border-slate-300 rounded-xl px-4 py-3 text-2xl font-bold text-slate-900 bg-white disabled:bg-slate-50"
      />

    </div>
  );
}

function PercentCard({
  title,
  percent,
  count,
  total,
  tone,
}: {
  title: string;
  percent: number;
  count: number;
  total: number;
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
          percent
        )}
      </p>

      <p className="text-sm mt-2 opacity-80">
        {count} מתוך{" "}
        {total}
      </p>

    </div>
  );
}
