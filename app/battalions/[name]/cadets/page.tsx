"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { getBattalionTests, type BattalionTest } from "@/lib/battalion-tests";
import { getActiveCycle, type CourseCycle } from "@/lib/cycles";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/lib/supabase";

type PercentageResult = {
  testName: string;
  attempt: number;
  passedPercent: number;
  failedPercent: number;
  excellentPercent: number;
};

type CloudRow = {
  test_name: string;
  attempt: number | null;
  passed_percent: number | null;
  failed_percent: number | null;
  excellent_percent: number | null;
};

function emptyResult(testName: string, attempt = 1): PercentageResult {
  return {
    testName,
    attempt,
    passedPercent: 0,
    failedPercent: 100,
    excellentPercent: 0,
  };
}

function clampPercent(value: string) {
  const n = Number(value);
  if (Number.isNaN(n)) return 0;
  return Math.min(100, Math.max(0, Math.round(n * 10) / 10));
}

function formatPercent(value: number) {
  return `${Math.round(value * 10) / 10}%`;
}

function attemptLabel(attempt: number) {
  const labels: Record<number, string> = {
    1: "מועד א׳",
    2: "מועד ב׳",
    3: "מועד ג׳",
    4: "מועד ד׳",
    5: "מועד ה׳",
  };
  return labels[attempt] ?? `מועד ${attempt}`;
}

export default function PercentageResultsPage() {
  const { isViewer } = useAuth();
  const params = useParams<{ name: string }>();
  const battalionName = decodeURIComponent(params.name);

  const [activeCycle, setActiveCycle] = useState<CourseCycle | null>(null);
  const tests = useMemo(() => getBattalionTests(battalionName), [battalionName]);
  const [selectedTest, setSelectedTest] = useState<BattalionTest | null>(null);
  const [result, setResult] = useState<PercentageResult | null>(null);
  const [attempts, setAttempts] = useState<PercentageResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const cycleId = activeCycle?.id ?? `legacy-${battalionName}`;
  const isReadOnly = isViewer || activeCycle?.status === "closed";

  useEffect(() => {
    setActiveCycle(getActiveCycle(battalionName));
  }, [battalionName]);

  useEffect(() => {
    if (!tests.length) {
      setSelectedTest(null);
      setResult(null);
      return;
    }
    setSelectedTest((current) =>
      current && tests.some((test) => test.name === current.name)
        ? current
        : tests[0]
    );
  }, [tests]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!selectedTest) {
        setAttempts([]);
        setResult(null);
        setLoading(false);
        return;
      }

      setLoading(true);
      setMessage("");

      const { data, error } = await supabase
        .from("percentage_test_results")
        .select("test_name,attempt,passed_percent,failed_percent,excellent_percent")
        .eq("cycle_id", cycleId)
        .eq("battalion", battalionName)
        .eq("test_name", selectedTest.name)
        .order("attempt", { ascending: true });

      if (cancelled) return;

      if (error) {
        console.error(error);
        setAttempts([]);
        setResult(emptyResult(selectedTest.name));
        setMessage("לא ניתן היה לטעון את נתוני האחוזים מהענן");
        setLoading(false);
        return;
      }

      const loaded = ((data ?? []) as CloudRow[]).map((row) => ({
        testName: row.test_name,
        attempt: row.attempt ?? 1,
        passedPercent: Number(row.passed_percent ?? 0),
        failedPercent: Number(row.failed_percent ?? 100),
        excellentPercent: Number(row.excellent_percent ?? 0),
      }));

      setAttempts(loaded);
      setResult(
        loaded.length
          ? loaded[loaded.length - 1]
          : emptyResult(selectedTest.name)
      );
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [battalionName, cycleId, selectedTest]);

  const validation = useMemo(() => {
    if (!result) return { valid: false, text: "" };

    if (
      result.passedPercent < 0 ||
      result.passedPercent > 100 ||
      result.failedPercent < 0 ||
      result.failedPercent > 100 ||
      result.excellentPercent < 0 ||
      result.excellentPercent > 100
    ) {
      return { valid: false, text: "כל אחוז חייב להיות בין 0% ל־100%." };
    }

    if (Math.abs(result.passedPercent + result.failedPercent - 100) > 0.11) {
      return { valid: false, text: "אחוז העוברים והנכשלים חייב להסתכם ל־100%." };
    }

    if (result.excellentPercent > result.passedPercent) {
      return { valid: false, text: "אחוז המצטיינים לא יכול להיות גבוה מאחוז העוברים." };
    }

    return { valid: true, text: "הנתונים תקינים ומוכנים לשמירה." };
  }, [result]);

  function updatePassed(value: string) {
    if (isReadOnly || !result) return;
    const passed = clampPercent(value);
    const failed = Math.round((100 - passed) * 10) / 10;

    setResult({
      ...result,
      passedPercent: passed,
      failedPercent: failed,
      excellentPercent: Math.min(result.excellentPercent, passed),
    });
    setMessage("");
  }

  function updateExcellent(value: string) {
    if (isReadOnly || !result) return;
    setResult({
      ...result,
      excellentPercent: clampPercent(value),
    });
    setMessage("");
  }

  function selectAttempt(attempt: number) {
    const existing = attempts.find((item) => item.attempt === attempt);
    if (existing) setResult(existing);
  }

  function createNextAttempt() {
    if (isReadOnly || !selectedTest) return;
    const highest = attempts.reduce((max, item) => Math.max(max, item.attempt), 0);
    setResult(emptyResult(selectedTest.name, highest + 1));
    setMessage("");
  }

  async function saveResult() {
    if (isReadOnly || !result || !selectedTest || !validation.valid) return;

    setSaving(true);
    setMessage("שומר לענן...");

    const { error } = await supabase
      .from("percentage_test_results")
      .upsert(
        {
          cycle_id: cycleId,
          battalion: battalionName,
          test_name: selectedTest.name,
          attempt: result.attempt,
          passed_percent: result.passedPercent,
          failed_percent: result.failedPercent,
          excellent_percent: result.excellentPercent,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "cycle_id,battalion,test_name,attempt",
        }
      );

    if (error) {
      console.error(error);
      setMessage(`השמירה נכשלה: ${error.message}`);
      setSaving(false);
      return;
    }

    setAttempts((current) => {
      const rest = current.filter((item) => item.attempt !== result.attempt);
      return [...rest, result].sort((a, b) => a.attempt - b.attempt);
    });

    setMessage("האחוזים נשמרו בענן בהצלחה");
    setSaving(false);
  }

  if (loading && !result) {
    return (
      <main dir="rtl" className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-8 shadow-sm text-slate-700">
          טוען נתוני ביצוע...
        </div>
      </main>
    );
  }

  return (
    <main dir="rtl" className="min-h-screen bg-slate-100 text-slate-900">
      <header className="bg-slate-900 text-white px-4 sm:px-6 lg:px-8 py-5 sm:py-7">
        <div className="max-w-[1500px] mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <p className="text-slate-300 text-sm">CommandFit</p>
            <h1 className="text-2xl sm:text-3xl font-bold mt-1">
              תמונת מצב באחוזים – גדוד {battalionName}
            </h1>
            <p className="text-slate-300 mt-2">
              ללא שמות צוערים וללא נתוני כוח אדם מספריים
            </p>
          </div>

          <Link
            href={`/battalions/${encodeURIComponent(battalionName)}`}
            className="w-full lg:w-auto bg-white/10 hover:bg-white/20 rounded-xl px-5 py-3 text-center"
          >
            חזרה לגדוד
          </Link>
        </div>
      </header>

      <div className="max-w-[1500px] mx-auto p-4 sm:p-6 lg:p-8">
        <section className="bg-blue-50 border border-blue-100 rounded-2xl p-4 sm:p-5 mb-6">
          <p className="font-bold text-blue-900">🔒 תצוגה מצרפית בלבד</p>
          <p className="text-sm text-blue-800 mt-1 leading-6">
            נשמרים אחוזי ביצוע בלבד. אין אפשרות להזין שמות, מספרי צוערים או מספר נבחנים.
          </p>
        </section>

        <section className="bg-white rounded-3xl shadow-sm p-5 sm:p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
            <div className="flex-1">
              <label className="block text-sm font-bold text-slate-900 mb-2">בוחן</label>
              <select
                value={selectedTest?.name ?? ""}
                onChange={(event) => {
                  const next = tests.find((test) => test.name === event.target.value);
                  setSelectedTest(next ?? null);
                }}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white text-slate-900"
              >
                {tests.map((test) => (
                  <option key={test.id} value={test.name}>
                    {test.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              disabled={isReadOnly}
              onClick={createNextAttempt}
              className="bg-blue-50 text-blue-700 border border-blue-100 rounded-xl px-5 py-3 font-bold disabled:opacity-50"
            >
              + מועד נוסף
            </button>
          </div>

          {!!attempts.length && (
            <div className="flex flex-wrap gap-2 mt-5">
              {attempts.map((item) => (
                <button
                  key={item.attempt}
                  type="button"
                  onClick={() => selectAttempt(item.attempt)}
                  className={
                    result?.attempt === item.attempt
                      ? "bg-slate-900 text-white rounded-xl px-4 py-2 font-bold"
                      : "bg-slate-100 text-slate-700 rounded-xl px-4 py-2"
                  }
                >
                  {attemptLabel(item.attempt)}
                </button>
              ))}
            </div>
          )}
        </section>

        {result && (
          <>
            <section className="bg-white rounded-3xl shadow-sm p-5 sm:p-6 mb-6">
              <p className="text-sm text-slate-500">מועד נבחר</p>
              <h2 className="text-2xl font-bold mt-1">
                {selectedTest?.name} • {attemptLabel(result.attempt)}
              </h2>
            </section>

            <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <PercentInput
                title="אחוז עברו"
                value={result.passedPercent}
                disabled={isReadOnly}
                onChange={updatePassed}
                helper="אחוז הנכשלים יחושב אוטומטית."
              />

              <ReadOnlyPercent
                title="אחוז נכשלו"
                value={result.failedPercent}
                helper="מחושב אוטומטית כ־100% פחות אחוז העוברים."
              />

              <PercentInput
                title="אחוז מצטיינים"
                value={result.excellentPercent}
                disabled={isReadOnly}
                onChange={updateExcellent}
                helper="המצטיינים הם חלק מהעוברים."
              />
            </section>

            <section className="bg-white rounded-3xl shadow-sm p-5 sm:p-7 mb-6">
              <h2 className="text-xl sm:text-2xl font-bold">תמונת מצב</h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                <SummaryCard title="עברו" value={result.passedPercent} tone="success" />
                <SummaryCard title="נכשלו" value={result.failedPercent} tone="danger" />
                <SummaryCard title="מצטיינים" value={result.excellentPercent} tone="excellent" />
              </div>
            </section>

            <section className="bg-white rounded-3xl shadow-sm p-5 sm:p-6 mb-6">
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
                  disabled={saving || !validation.valid}
                  onClick={saveResult}
                  className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-6 py-3 font-bold mt-5 disabled:opacity-40"
                >
                  {saving ? "שומר..." : "שמירת האחוזים"}
                </button>
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}

function PercentInput({
  title,
  value,
  disabled,
  onChange,
  helper,
}: {
  title: string;
  value: number;
  disabled: boolean;
  onChange: (value: string) => void;
  helper: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-5">
      <label className="block text-sm font-bold text-slate-900 mb-3">{title}</label>
      <div className="relative">
        <input
          disabled={disabled}
          type="number"
          min={0}
          max={100}
          step={0.1}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="w-full border border-slate-300 rounded-xl pr-4 pl-12 py-3 text-2xl font-bold text-slate-900 bg-white disabled:bg-slate-50"
        />
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">%</span>
      </div>
      <p className="text-xs text-slate-500 mt-3">{helper}</p>
    </div>
  );
}

function ReadOnlyPercent({
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
      <p className="text-sm font-bold text-slate-900 mb-3">{title}</p>
      <p className="text-3xl font-bold text-slate-900">{formatPercent(value)}</p>
      <p className="text-xs text-slate-500 mt-3">{helper}</p>
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
  tone: "success" | "danger" | "excellent";
}) {
  const styles = {
    success: "bg-green-50 border-green-100 text-green-700",
    danger: "bg-red-50 border-red-100 text-red-700",
    excellent: "bg-sky-50 border-sky-200 text-sky-700",
  };

  return (
    <div className={`border rounded-2xl p-5 ${styles[tone]}`}>
      <p className="text-sm font-bold">{title}</p>
      <p className="text-4xl font-bold mt-2">{formatPercent(value)}</p>
    </div>
  );
}