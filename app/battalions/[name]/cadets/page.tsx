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
  company: string;
  passedPercent: number;
  failedPercent: number;
  excellentPercent: number;
  testDate: string;
};

type CloudRow = {
  test_name: string;
  attempt: number | null;
  company: string | null;
  passed_percent: number | null;
  failed_percent: number | null;
  excellent_percent: number | null;
  test_date: string | null;
};

const COMPANY_COUNTS: Record<string, number> = {
  "דקל": 4,
  "רימון": 4,
  "גפן": 4,
  "דולב": 2,
  "חרוב": 4,
};

const COMPANY_NAMES = [
  "פלוגה א׳",
  "פלוגה ב׳",
  "פלוגה ג׳",
  "פלוגה ד׳",
  "פלוגה ה׳",
];

function getCompanies(
  battalion: string
) {
  return COMPANY_NAMES.slice(
    0,
    COMPANY_COUNTS[
      battalion
    ] ?? 5
  );
}

const GENERAL_COMPANY =
  "כלל הגדוד";

function emptyResult(
  testName: string,
  attempt = 1,
  company = GENERAL_COMPANY
): PercentageResult {
  return {
    testName,
    attempt,
    company,
    passedPercent: 0,
    failedPercent: 0,
    excellentPercent: 0,
    testDate: "",
  };
}

function clampPercent(value: string) {
  const n = Number(value);
  if (Number.isNaN(n)) return 0;
  return Math.min(100, Math.max(0, Math.round(n * 10) / 10));
}

function formatPercent(value: number | null) {
  if (value === null || Number.isNaN(value)) return "—";
  return `${Math.round(value * 10) / 10}%`;
}

function safeInt(value: number) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.round(value));
}

function percentFromCounts(part: number, total: number) {
  if (total <= 0) return null;
  return Math.round((part / total) * 1000) / 10;
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
  const [selectedCompany, setSelectedCompany] = useState(GENERAL_COMPANY);
  const companies = useMemo(
    () => getCompanies(battalionName),
    [battalionName]
  );
  const [result, setResult] = useState<PercentageResult | null>(null);
  const [attempts, setAttempts] = useState<PercentageResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const [openingStrength, setOpeningStrength] = useState(0);
  const [currentStrength, setCurrentStrength] = useState(0);
  const [tested, setTested] = useState(0);
  const [passedCount, setPassedCount] = useState(0);
  const [excellentCount, setExcellentCount] = useState(0);
  const [absentCount, setAbsentCount] = useState(0);
  const [dismissedCount, setDismissedCount] = useState(0);
  const [previousCumulativePassed, setPreviousCumulativePassed] = useState(0);

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
        .select("test_name,attempt,company,passed_percent,failed_percent,excellent_percent,test_date")
        .eq("cycle_id", cycleId)
        .eq("battalion", battalionName)
        .eq("test_name", selectedTest.name)
        .eq("company", selectedCompany)
        .order("attempt", { ascending: true });

      if (cancelled) return;

      if (error) {
        console.error(error);
        setAttempts([]);
        setResult(
          emptyResult(
            selectedTest.name,
            1,
            selectedCompany
          )
        );
        setMessage("לא ניתן היה לטעון את נתוני האחוזים מהענן");
        setLoading(false);
        return;
      }

      const loaded = ((data ?? []) as CloudRow[]).map((row) => ({
        testName: row.test_name,
        attempt: row.attempt ?? 1,
        company: row.company ?? GENERAL_COMPANY,
        passedPercent: Number(row.passed_percent ?? 0),
        failedPercent: Number(row.failed_percent ?? 100),
        excellentPercent: Number(row.excellent_percent ?? 0),
        testDate: row.test_date ?? "",
      }));

      setAttempts(loaded);
      setResult(
        loaded.length
          ? loaded[loaded.length - 1]
          : emptyResult(
              selectedTest.name,
              1,
              selectedCompany
            )
      );
      setLoading(false);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [
    battalionName,
    cycleId,
    selectedTest,
    selectedCompany,
  ]);

  const calculator = useMemo(() => {
    const opening = safeInt(openingStrength);
    const current = safeInt(currentStrength);
    const testedNow = safeInt(tested);
    const passedNow = safeInt(passedCount);
    const excellentNow = safeInt(excellentCount);
    const absentNow = safeInt(absentCount);
    const dismissedNow = safeInt(dismissedCount);
    const previousPassed = safeInt(previousCumulativePassed);

    const failedNow = Math.max(0, testedNow - passedNow);
    const cumulativePassed = previousPassed + passedNow;

    const attendancePercent = percentFromCounts(testedNow, current);
    const passOfTestedPercent = percentFromCounts(passedNow, testedNow);
    const failOfTestedPercent = percentFromCounts(failedNow, testedNow);
    const excellentOfTestedPercent = percentFromCounts(excellentNow, testedNow);
    const remainingCohortPercent = percentFromCounts(current, opening);
    const cumulativePassOfOpeningPercent = percentFromCounts(cumulativePassed, opening);

    const valid =
      opening > 0 &&
      current > 0 &&
      testedNow > 0 &&
      passedNow <= testedNow &&
      excellentNow <= passedNow &&
      current <= opening &&
      testedNow + absentNow <= current &&
      dismissedNow <= opening &&
      cumulativePassed <= opening;

    return {
      failedNow,
      cumulativePassed,
      attendancePercent,
      passOfTestedPercent,
      failOfTestedPercent,
      excellentOfTestedPercent,
      remainingCohortPercent,
      cumulativePassOfOpeningPercent,
      valid,
    };
  }, [
    openingStrength,
    currentStrength,
    tested,
    passedCount,
    excellentCount,
    absentCount,
    dismissedCount,
    previousCumulativePassed,
  ]);

  useEffect(() => {
    if (isReadOnly || !result) return;

    setResult((current) => {
      if (!current) return current;

      return {
        ...current,
        passedPercent: calculator.passOfTestedPercent ?? 0,
        failedPercent: calculator.failOfTestedPercent ?? 0,
        excellentPercent: calculator.excellentOfTestedPercent ?? 0,
      };
    });
  }, [
    calculator.passOfTestedPercent,
    calculator.failOfTestedPercent,
    calculator.excellentOfTestedPercent,
    isReadOnly,
    result?.attempt,
  ]);

  const validation = useMemo(() => {
    if (!result) return { valid: false, text: "" };

    if (!result.testDate) {
      return { valid: false, text: "יש להזין תאריך ביצוע לבוחן." };
    }

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
    setResult(
      emptyResult(
        selectedTest.name,
        highest + 1,
        selectedCompany
      )
    );
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
          company: selectedCompany,
          passed_percent: result.passedPercent,
          failed_percent: result.failedPercent,
          excellent_percent: result.excellentPercent,
          test_date: result.testDate,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "cycle_id,battalion,test_name,attempt,company",
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


  async function deleteCurrentAttempt() {
    if (
      isReadOnly ||
      !result ||
      !selectedTest
    ) {
      return;
    }

    const exists =
      attempts.some(
        (item) =>
          item.attempt ===
          result.attempt
      );

    if (!exists) {
      setMessage(
        "המועד עדיין לא נשמר ולכן אין מה למחוק."
      );
      return;
    }

    const approved =
      window.confirm(
        `למחוק את ${attemptLabel(
          result.attempt
        )} של ${selectedTest.name}?\n\nהתוצאות והתאריך של המועד יימחקו לצמיתות.`
      );

    if (!approved) {
      return;
    }

    setSaving(true);
    setMessage(
      "מוחק את המועד..."
    );

    const { error } =
      await supabase
        .from(
          "percentage_test_results"
        )
        .delete()
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
        .eq(
          "attempt",
          result.attempt
        )
        .eq(
          "company",
          selectedCompany
        );

    if (error) {
      console.error(error);
      setMessage(
        `מחיקת המועד נכשלה: ${error.message}`
      );
      setSaving(false);
      return;
    }

    const remaining =
      attempts
        .filter(
          (item) =>
            item.attempt !==
            result.attempt
        )
        .sort(
          (a, b) =>
            a.attempt -
            b.attempt
        );

    setAttempts(
      remaining
    );

    setResult(
      remaining.length > 0
        ? remaining[
            remaining.length - 1
          ]
        : emptyResult(
            selectedTest.name,
            1,
            selectedCompany
          )
    );

    setMessage(
      "המועד נמחק בהצלחה"
    );
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
            נשמרים אחוזי ביצוע בלבד. ניתן לעבוד ברמת כלל הגדוד או פלוגה נבחרת, ללא שמות צוערים.
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

            <div className="flex-1">
              <label className="block text-sm font-bold text-slate-900 mb-2">
                תצוגה / הזנה
              </label>

              <select
                value={selectedCompany}
                onChange={(event) => {
                  setSelectedCompany(
                    event.target.value
                  );
                  setMessage("");
                }}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 bg-white text-slate-900"
              >
                <option value={GENERAL_COMPANY}>
                  כלל הגדוד
                </option>

                {companies.map(
                  (company) => (
                    <option
                      key={company}
                      value={company}
                    >
                      {company}
                    </option>
                  )
                )}
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
                  <span>{attemptLabel(item.attempt)}</span>
                  {item.testDate && (
                    <span className="block text-[11px] opacity-75 mt-0.5">
                      {new Date(`${item.testDate}T00:00:00`).toLocaleDateString("he-IL")}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </section>

        {result && (
          <>
            <section className="bg-white rounded-3xl shadow-sm p-4 sm:p-5 mb-4 border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-slate-500">מועד נבחר</p>
                  <h2 className="text-lg sm:text-xl font-black mt-1">
                    {selectedTest?.name} • {attemptLabel(result.attempt)}
                  </h2>

                  <p className="text-sm font-bold text-blue-700 mt-1">
                    {selectedCompany}
                  </p>
                </div>

                <div className="w-full sm:w-auto">
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    תאריך ביצוע הבוחן
                  </label>
                  <input
                    type="date"
                    value={result.testDate}
                    disabled={isReadOnly}
                    onChange={(event) => {
                      setResult({
                        ...result,
                        testDate: event.target.value,
                      });
                      setMessage("");
                    }}
                    className="w-full sm:w-auto border border-slate-300 rounded-xl px-4 py-3 bg-white text-slate-900 disabled:bg-slate-100"
                  />
                  {!!attempts.find((item) => item.attempt === result.attempt) && !isReadOnly && (
                    <p className="text-[11px] text-blue-700 font-bold mt-1">
                      ✏️ ניתן לשנות את התאריך ולשמור מחדש את המועד
                    </p>
                  )}
                </div>

                {!isReadOnly && (
                  <div className="hidden sm:flex items-center gap-2">
                    {attempts.some(
                      (item) =>
                        item.attempt ===
                        result.attempt
                    ) && (
                      <button
                        type="button"
                        disabled={saving}
                        onClick={
                          deleteCurrentAttempt
                        }
                        className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl px-4 py-3 font-bold disabled:opacity-40"
                      >
                        🗑️ מחיקת מועד
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={saving || !validation.valid || !calculator.valid}
                      onClick={saveResult}
                      className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-5 py-3 font-bold disabled:opacity-40"
                    >
                      {saving
                        ? "שומר..."
                        : attempts.some((item) => item.attempt === result.attempt)
                        ? "💾 שמירת שינויים במועד"
                        : "💾 שמירת תוצאות המועד"}
                    </button>
                  </div>
                )}
              </div>
            </section>

            <details className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-4">
              <summary className="font-black text-blue-900 cursor-pointer">
                💡 איך מזינים נכון?
              </summary>
              <div className="text-sm text-blue-800 leading-7 mt-3">
                <p>במועד א׳ מזינים את כל מי שניגשו בפועל לבוחן.</p>
                <p>במועד ב׳/ג׳ מזינים רק את מי שניגשו לאותו מועד חוזר.</p>
                <p>אין להזין נכשלים — המערכת מחשבת ניגשו פחות עברו.</p>
                <p>מצטיינים חייבים להיות חלק מתוך העוברים.</p>
                <p>מצבה נוכחית היא המצבה הפעילה בשלב הנוכחי בקורס.</p>
              </div>
            </details>

            {!isReadOnly && (
              <section className="bg-white rounded-3xl shadow-sm p-4 sm:p-5 mb-4">
                <div>
                  <h2 className="text-lg sm:text-xl font-black">
                    🧮 הזנת כמויות
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    האחוזים מחושבים ומתעדכנים אוטומטית בזמן ההזנה.
                  </p>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mt-4">
                  <CompactNumberField title="מצבת פתיחה" value={openingStrength} onChange={setOpeningStrength} />
                  <CompactNumberField title="מצבה נוכחית" value={currentStrength} onChange={setCurrentStrength} />
                  <CompactNumberField title="ניגשו" value={tested} onChange={setTested} />
                  <CompactNumberField title="עברו" value={passedCount} onChange={setPassedCount} />
                  <CompactNumberField title="מצטיינים" value={excellentCount} onChange={setExcellentCount} />
                  <CompactNumberField title="לא ניגשו" value={absentCount} onChange={setAbsentCount} />
                  <CompactNumberField title="מודחים / עזבו" value={dismissedCount} onChange={setDismissedCount} />
                  <CompactNumberField title="עברו קודם" value={previousCumulativePassed} onChange={setPreviousCumulativePassed} />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mt-4">
                  <CompactResultCard title="% ניגשו מהמצבה" value={formatPercent(calculator.attendancePercent)} tone="neutral" />
                  <CompactResultCard title="% עברו מהניגשים" value={formatPercent(calculator.passOfTestedPercent)} tone="success" />
                  <CompactResultCard title="% נכשלו מהניגשים" value={formatPercent(calculator.failOfTestedPercent)} tone="danger" />
                  <CompactResultCard title="% מצטיינים מהניגשים" value={formatPercent(calculator.excellentOfTestedPercent)} tone="excellent" />
                  <CompactResultCard title="% שנותרו במחזור" value={formatPercent(calculator.remainingCohortPercent)} tone="neutral" />
                  <CompactResultCard title="% מעבר מצטבר מהפתיחה" value={formatPercent(calculator.cumulativePassOfOpeningPercent)} tone="neutral" />
                </div>

                <div
                  className={
                    calculator.valid
                      ? "bg-green-50 border border-green-100 text-green-700 rounded-xl p-3 mt-4 text-sm font-bold"
                      : "bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3 mt-4 text-sm font-bold"
                  }
                >
                  {calculator.valid
                    ? `✅ החישוב תקין. נכשלו במועד: ${calculator.failedNow}`
                    : "⚠️ ודא שיש מצבת פתיחה, מצבה נוכחית וניגשים, ושכל הכמויות מסתדרות."}
                </div>
              </section>
            )}

            <section className="bg-white rounded-3xl shadow-sm p-4 sm:p-5 mb-4">
              <h2 className="text-lg sm:text-xl font-black">
                תוצאות שיישמרו
              </h2>

              <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4">
                <CompactPercentCard title="עברו" value={result.passedPercent} tone="success" />
                <CompactPercentCard title="נכשלו" value={result.failedPercent} tone="danger" />
                <CompactPercentCard title="מצטיינים" value={result.excellentPercent} tone="excellent" />
              </div>

              <div
                className={
                  validation.valid && calculator.valid
                    ? "bg-green-50 border border-green-100 text-green-700 rounded-xl p-3 mt-4 text-sm"
                    : "bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3 mt-4 text-sm"
                }
              >
                {calculator.valid ? validation.text : "השלם הזנת כמויות תקינה לפני השמירה."}
              </div>

              {message && (
                <div className="bg-blue-50 border border-blue-100 text-blue-700 rounded-xl p-3 mt-3 text-sm">
                  {message}
                </div>
              )}
            </section>

            {!isReadOnly && (
              <div className="sticky bottom-3 z-30 sm:hidden flex gap-2">
                {attempts.some(
                  (item) =>
                    item.attempt ===
                    result.attempt
                ) && (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={
                      deleteCurrentAttempt
                    }
                    className="bg-red-600 text-white rounded-2xl px-4 py-4 font-black shadow-xl disabled:opacity-40"
                  >
                    🗑️
                  </button>
                )}

                <button
                  type="button"
                  disabled={saving || !validation.valid || !calculator.valid}
                  onClick={saveResult}
                  className="flex-1 bg-slate-950 text-white rounded-2xl px-5 py-4 font-black shadow-xl disabled:opacity-40"
                >
                  {saving
                    ? "שומר..."
                    : attempts.some((item) => item.attempt === result.attempt)
                    ? "💾 שמירת שינויים במועד"
                    : "💾 שמירת תוצאות המועד"}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}

function CompactNumberField({
  title,
  value,
  onChange,
}: {
  title: string;
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="bg-slate-50 border border-slate-200 rounded-xl p-3">
      <span className="block text-[11px] sm:text-xs font-bold text-slate-600">
        {title}
      </span>

      <input
        type="number"
        min={0}
        step={1}
        value={value}
        onChange={(event) =>
          onChange(safeInt(Number(event.target.value)))
        }
        className="w-full border border-slate-300 rounded-lg px-2 py-2 mt-2 text-xl sm:text-2xl font-black bg-white text-center"
      />
    </label>
  );
}

function CompactResultCard({
  title,
  value,
  tone,
}: {
  title: string;
  value: string;
  tone: "success" | "danger" | "excellent" | "neutral";
}) {
  const styles = {
    success: "bg-green-50 border-green-100 text-green-700",
    danger: "bg-red-50 border-red-100 text-red-700",
    excellent: "bg-sky-50 border-sky-100 text-sky-700",
    neutral: "bg-slate-50 border-slate-200 text-slate-800",
  };

  return (
    <div className={`border rounded-xl p-3 text-center ${styles[tone]}`}>
      <p className="text-[10px] sm:text-xs font-bold leading-4">{title}</p>
      <p className="text-xl sm:text-2xl font-black mt-1">{value}</p>
    </div>
  );
}

function CompactPercentCard({
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
    excellent: "bg-sky-50 border-sky-100 text-sky-700",
  };

  return (
    <div className={`border rounded-xl p-3 text-center ${styles[tone]}`}>
      <p className="text-[10px] sm:text-xs font-bold">{title}</p>
      <p className="text-2xl sm:text-3xl font-black mt-1">
        {formatPercent(value)}
      </p>
    </div>
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