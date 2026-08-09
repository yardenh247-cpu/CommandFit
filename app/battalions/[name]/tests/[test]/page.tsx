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

/* =========================================================
   TYPES
========================================================= */

type PercentageResult = {
  attempt: number;

  passedPercent: number;
  failedPercent: number;
  excellentPercent: number;
};

type CloudPercentageRow = {
  attempt: number | null;

  passed_percent: number | null;
  failed_percent: number | null;
  excellent_percent: number | null;
};

/* =========================================================
   HELPERS
========================================================= */

function getHebrewAttemptLetter(
  attempt: number
) {
  const letters: Record<
    number,
    string
  > = {
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

  return (
    letters[attempt] ||
    attempt.toString()
  );
}

function getAttemptLabel(
  attempt: number
) {
  return `מועד ${getHebrewAttemptLetter(
    attempt
  )}`;
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
  const rounded =
    Math.round(
      value * 10
    ) / 10;

  return `${rounded}%`;
}

function createEmptyResult(
  attempt: number
): PercentageResult {
  return {
    attempt,

    passedPercent: 0,
    failedPercent: 100,
    excellentPercent: 0,
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
      createEmptyResult(1)
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

        setAttempts(
          []
        );

        setSelectedAttempt(
          1
        );

        setResult(
          createEmptyResult(
            1
          )
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
              1
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
    testName,
  ]);

  /* =======================================================
     VALIDATION
  ======================================================= */

  const validation =
    useMemo(() => {
      if (
        result.passedPercent <
          0 ||
        result.passedPercent >
          100 ||
        result.failedPercent <
          0 ||
        result.failedPercent >
          100 ||
        result.excellentPercent <
          0 ||
        result.excellentPercent >
          100
      ) {
        return {
          valid: false,
          text:
            "כל אחוז חייב להיות בין 0% ל־100%.",
        };
      }

      if (
        Math.abs(
          result.passedPercent +
            result.failedPercent -
            100
        ) >
        0.11
      ) {
        return {
          valid: false,
          text:
            "אחוז העוברים ואחוז הנכשלים חייבים להסתכם ל־100%.",
        };
      }

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

      return {
        valid: true,
        text:
          "הנתונים תקינים ומוכנים לשמירה.",
      };
    }, [
      result,
    ]);

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
        attempt
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
        next
      )
    );

    setMessage(
      ""
    );
  }

  /* =======================================================
     UPDATE
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

    setMessage(
      ""
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
      "האחוזים נשמרו בענן בהצלחה"
    );

    setSaving(
      false
    );
  }

  /* =======================================================
     BACK
  ======================================================= */

  function goBackToBattalion() {
    router.push(
      `/battalions/${encodeURIComponent(
        battalionName
      )}`
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
              נתוני ביצוע מצרפיים באחוזים בלבד
            </p>

          </div>

          <button
            type="button"
            onClick={
              goBackToBattalion
            }
            className="w-full md:w-auto bg-white/10 hover:bg-white/20 px-5 py-3 rounded-xl"
          >
            חזרה לגדוד
          </button>

        </div>

      </header>

      <div className="max-w-[1500px] mx-auto p-4 sm:p-6 lg:p-8">

        {/* SECURITY */}

        <section className="bg-blue-50 border border-blue-100 rounded-2xl p-4 sm:p-5 mb-6">

          <p className="font-bold text-blue-900">
            🔒 נתונים מצרפיים בלבד
          </p>

          <p className="text-sm text-blue-800 mt-1 leading-6">
            אין במסך שמות, מספרי צוערים, כמות נבחנים, תוצאות אישיות או תיק אישי. נשמרים אחוזי ביצוע בלבד.
          </p>

        </section>

        {isReadOnly && (
          <section className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-4 mb-6 font-medium">
            {isViewer
              ? "👁️ מצב צפייה בלבד — ניתן לצפות באחוזים אך לא לערוך."
              : "🔒 המחזור סגור — הנתונים מוצגים לקריאה בלבד."}
          </section>
        )}

        {/* ATTEMPTS */}

        <section className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 mb-6">

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

            <div>
              <h2 className="font-bold text-lg">
                מועד הבוחן
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                לכל מועד נשמרים אחוזים נפרדים.
              </p>
            </div>

            {!isReadOnly && (
              <button
                type="button"
                onClick={
                  addAttempt
                }
                className="bg-blue-50 border border-blue-100 text-blue-700 rounded-xl px-5 py-3 font-bold hover:bg-blue-100"
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
                      : "rounded-xl border border-slate-200 bg-white text-slate-700 px-5 py-3 font-bold hover:bg-slate-50"
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

        {/* INPUT */}

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

          <PercentInputCard
            title="אחוז עברו"
            value={
              result.passedPercent
            }
            disabled={
              isReadOnly
            }
            onChange={
              updatePassed
            }
            helper="הזן 0–100. אחוז הנכשלים יחושב אוטומטית."
          />

          <ReadOnlyPercentCard
            title="אחוז נכשלו"
            value={
              result.failedPercent
            }
            helper="מחושב אוטומטית כ־100% פחות אחוז העוברים."
          />

          <PercentInputCard
            title="אחוז מצטיינים"
            value={
              result.excellentPercent
            }
            disabled={
              isReadOnly
            }
            onChange={
              updateExcellent
            }
            helper="המצטיינים הם חלק מהעוברים."
          />

        </section>

        {/* SUMMARY */}

        <section className="bg-white rounded-3xl shadow-sm p-5 sm:p-7 mb-6">

          <h2 className="text-xl sm:text-2xl font-bold">
            תמונת מצב
          </h2>

          <p className="text-slate-500 mt-1">
            {getAttemptLabel(
              result.attempt
            )}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">

            <SummaryCard
              title="עברו"
              value={
                result.passedPercent
              }
              tone="success"
            />

            <SummaryCard
              title="נכשלו"
              value={
                result.failedPercent
              }
              tone="danger"
            />

            <SummaryCard
              title="מצטיינים"
              value={
                result.excellentPercent
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
                    `${result.passedPercent}%`,
                }}
              />

              <div
                className="bg-red-500 h-full"
                style={{
                  width:
                    `${result.failedPercent}%`,
                }}
              />

            </div>

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
              className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-6 py-3 font-bold mt-5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving
                ? "שומר..."
                : "שמירת האחוזים"}
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

function PercentInputCard({
  title,
  value,
  disabled,
  onChange,
  helper,
}: {
  title: string;
  value: number;
  disabled: boolean;
  onChange: (
    value: string
  ) => void;
  helper: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">

      <label className="block text-sm font-bold text-slate-900 mb-3">
        {title}
      </label>

      <div className="relative">

        <input
          disabled={
            disabled
          }
          type="number"
          min={0}
          max={100}
          step={0.1}
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
          className="w-full border border-slate-300 rounded-xl pr-4 pl-12 py-3 text-2xl font-bold text-slate-900 bg-white disabled:bg-slate-50"
        />

        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
          %
        </span>

      </div>

      <p className="text-xs text-slate-500 mt-3 leading-5">
        {helper}
      </p>

    </div>
  );
}

function ReadOnlyPercentCard({
  title,
  value,
  helper,
}: {
  title: string;
  value: number;
  helper: string;
}) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">

      <p className="text-sm font-bold text-slate-900 mb-3">
        {title}
      </p>

      <p className="text-3xl font-bold text-slate-900">
        {formatPercent(
          value
        )}
      </p>

      <p className="text-xs text-slate-500 mt-3 leading-5">
        {helper}
      </p>

    </div>
  );
}

function SummaryCard({
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