"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { getBattalionTests, type BattalionTest } from "@/lib/battalion-tests";
import { getActiveCycle, type CourseCycle } from "@/lib/cycles";
import { useAuth } from "@/lib/use-auth";
import { supabase } from "@/lib/supabase";

type MetricValue = {
  // תאימות לאחור לגדודים שבהם נשמר בעבר ממוצע אחד
  average?: string;

  // בגדודים מעורבים נשמר ממוצע נפרד לבנים ולבנות
  maleAverage?: string;
  femaleAverage?: string;

  failedCount?: number;

  // תאימות לנתונים ישנים שנשמרו כאחוז
  failedPercent?: number;
};

type MetricsMap =
  Record<string, MetricValue>;

type MetricDefinition = {
  key: string;
  title: string;
  failureOnly?: boolean;
};

type PercentageResult = {
  testName: string;
  attempt: number;
  company: string;
  passedPercent: number;
  failedPercent: number;
  excellentPercent: number;
  testDate: string;
  testedCount: number;
  metrics: MetricsMap;
};

type CloudRow = {
  test_name: string;
  attempt: number | null;
  company: string | null;
  passed_percent: number | null;
  failed_percent: number | null;
  excellent_percent: number | null;
  test_date: string | null;
  tested_count: number | null;
  metrics: MetricsMap | null;
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

function getMetricDefinitions(
  battalionName: string,
  testName: string
): MetricDefinition[] {
  const battalion =
    String(
      battalionName ?? ""
    ).trim();

  const normalizedTest =
    String(
      testName ?? ""
    )
      .trim()
      .replace(/[״"']/g, "");

  if (
    normalizedTest.includes(
      "לורן"
    )
  ) {
    return LORAN_METRICS;
  }

  /*
    מגמת מטה:
    ארז / ברוש / חרוב / אלון
    בבחנים האלה שמות הבוחנים אינם בהכרח כוללים כש"ג,
    ולכן אנחנו מזהים במפורש ריצת 3000 ושכיבות סמיכה.
  */
  if (
    STAFF_BATTALIONS.has(
      battalion
    )
  ) {
    if (
      normalizedTest.includes(
        "3000"
      ) ||
      normalizedTest.includes(
        "3,000"
      ) ||
      normalizedTest.includes(
        "ריצת"
      ) ||
      normalizedTest ===
        "ריצה"
    ) {
      return [
        {
          key: "run",
          title:
            "ריצת 3000 מטר",
        },
      ];
    }

    if (
      normalizedTest.includes(
        "שכיבות"
      ) ||
      normalizedTest.includes(
        "סמיכה"
      )
    ) {
      return [
        {
          key: "pushups",
          title:
            "שכיבות סמיכה",
        },
      ];
    }

    if (
      normalizedTest.includes(
        "כשג"
      ) ||
      normalizedTest.includes(
        "כש"
      )
    ) {
      return STAFF_FITNESS_METRICS;
    }

    return [];
  }

  /*
    מגמת לוחמים:
    הדס נשאר עם אותם מרכיבי כש"ג,
    אך הממוצעים יוצגו בנפרד לצוערים ולצוערות
    בגלל usesGenderSplit().
  */
  const isFitness =
    normalizedTest.includes(
      "כשג"
    ) ||
    normalizedTest.includes(
      "כש"
    );

  if (isFitness) {
    return COMBAT_FITNESS_METRICS;
  }

  return [];
}
function formatAverage(
  value?: string
) {
  const clean =
    String(
      value ?? ""
    ).trim();

  return clean || "אין נתון";
}

function formatMetricFailed(
  value?: number
) {
  if (
    value === undefined ||
    value === null ||
    Number.isNaN(value)
  ) {
    return "אין נתון";
  }

  return formatPercent(value);
}

function metricFailedPercent(
  value: MetricValue | undefined,
  testedCount: number
) {
  if (
    value?.failedCount !== undefined &&
    testedCount > 0
  ) {
    return percentFromCounts(
      value.failedCount,
      testedCount
    );
  }

  // נתונים ישנים: אם נשמר failedPercent, עדיין נציג אותו.
  return value?.failedPercent;
}

function formatMetricFailureSummary(
  value: MetricValue | undefined,
  testedCount: number
) {
  const percent =
    metricFailedPercent(
      value,
      testedCount
    );

  if (
    value?.failedCount === undefined
  ) {
    return percent === undefined
      ? "אין נתון"
      : formatPercent(percent);
  }

  return testedCount > 0
    ? `${value.failedCount} (${formatPercent(
        percent ?? null
      )})`
    : `${value.failedCount}`;
}

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
    testedCount: 0,
    metrics: {},
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
  const [currentStrength, setCurrentStrength] = useState(0);
  const [tested, setTested] = useState(0);
  const [passedCount, setPassedCount] = useState(0);
  const [excellentCount, setExcellentCount] = useState(0);
  const [absentCount, setAbsentCount] = useState(0);
  const [dismissedCount, setDismissedCount] = useState(0);

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
        .select("test_name,attempt,company,passed_percent,failed_percent,excellent_percent,test_date,tested_count,metrics")
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
        setMessage("לא ניתן היה לטעון את נתוני הבחנים מהענן");
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
        testedCount: Number(
          row.tested_count ?? 0
        ),
        metrics: row.metrics ?? {},
      }));

      setAttempts(loaded);

      const latestLoaded =
        loaded.length
          ? loaded[
              loaded.length - 1
            ]
          : null;

      setResult(
        latestLoaded ??
          emptyResult(
            selectedTest.name,
            1,
            selectedCompany
          )
      );

      setTested(
        latestLoaded?.testedCount ??
          0
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
    const current = safeInt(currentStrength);
    const testedNow = safeInt(tested);
    const passedNow = safeInt(passedCount);
    const excellentNow = safeInt(excellentCount);
    const absentNow = safeInt(absentCount);
    const dismissedNow = safeInt(dismissedCount);

    const failedNow = Math.max(0, testedNow - passedNow);

    const attendancePercent = percentFromCounts(testedNow, current);
    const passOfTestedPercent = percentFromCounts(passedNow, testedNow);
    const failOfTestedPercent = percentFromCounts(failedNow, testedNow);
    const excellentOfTestedPercent = percentFromCounts(excellentNow, testedNow);

    const valid =
      current > 0 &&
      testedNow > 0 &&
      passedNow <= testedNow &&
      excellentNow <= passedNow &&
      testedNow + absentNow <= current &&
      dismissedNow <= current;

    return {
      failedNow,
      attendancePercent,
      passOfTestedPercent,
      failOfTestedPercent,
      excellentOfTestedPercent,
      valid,
    };
  }, [
    currentStrength,
    tested,
    passedCount,
    excellentCount,
    absentCount,
    dismissedCount,
  ]);

  useEffect(() => {
    if (isReadOnly || !result) return;

    setResult((current) => {
      if (!current) return current;

      return {
        ...current,
        passedPercent:
          calculator.passOfTestedPercent ??
          0,
        failedPercent:
          calculator.failOfTestedPercent ??
          0,
        excellentPercent:
          calculator.excellentOfTestedPercent ??
          0,
        testedCount:
          safeInt(tested),
      };
    });
  }, [
    calculator.passOfTestedPercent,
    calculator.failOfTestedPercent,
    calculator.excellentOfTestedPercent,
    tested,
    isReadOnly,
    result?.attempt,
  ]);

  const metricDefinitions =
    useMemo(
      () => {
        const testName =
          selectedTest?.name ??
          result?.testName ??
          "";

        return getMetricDefinitions(
          battalionName,
          testName
        );
      },
      [
        battalionName,
        selectedTest,
        result?.testName,
      ]
    );

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
    const existing = attempts.find(
      (item) =>
        item.attempt === attempt
    );

    if (existing) {
      setResult(existing);

      if (
        existing.testedCount >
        0
      ) {
        setTested(
          existing.testedCount
        );
      }
    }
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

  function updateMetricAverage(
    key: string,
    value: string,
    gender:
      | "male"
      | "female"
      | "general" =
      "general"
  ) {
    if (
      isReadOnly ||
      !result
    ) {
      return;
    }

    const currentMetric =
      result.metrics[
        key
      ] ?? {};

    const nextMetric =
      gender === "male"
        ? {
            ...currentMetric,
            maleAverage:
              value,
          }
        : gender ===
          "female"
        ? {
            ...currentMetric,
            femaleAverage:
              value,
          }
        : {
            ...currentMetric,
            average:
              value,
          };

    setResult({
      ...result,
      metrics: {
        ...result.metrics,
        [key]:
          nextMetric,
      },
    });

    setMessage("");
  }

  function updateMetricFailedCount(
    key: string,
    value: string
  ) {
    if (
      isReadOnly ||
      !result
    ) {
      return;
    }

    const clean =
      value.trim();

    const failedCount =
      clean === ""
        ? undefined
        : Math.max(
            0,
            Math.min(
              safeInt(tested),
              safeInt(
                Number(clean)
              )
            )
          );

    setResult({
      ...result,
      metrics: {
        ...result.metrics,
        [key]: {
          ...result.metrics[
            key
          ],
          failedCount,
          // ברגע שמזינים כמות חדשה, לא משתמשים יותר באחוז הישן.
          failedPercent:
            undefined,
        },
      },
    });

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
          tested_count:
            safeInt(tested),
          metrics: result.metrics,
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

    setMessage("הנתונים נשמרו בענן בהצלחה");
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
              הזנת נתונים – גדוד {battalionName}
            </h1>
            <p className="text-slate-300 mt-2">
              הזנת נתוני בחנים בצורה מצרפית, ללא שמות צוערים
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
            נשמרים נתוני ביצוע מצרפיים בלבד. ניתן לעבוד ברמת כלל הגדוד או פלוגה נבחרת, ללא שמות צוערים.
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
                  <CompactNumberField title="מצבה נוכחית" value={currentStrength} onChange={setCurrentStrength} />
                  <CompactNumberField title="ניגשו" value={tested} onChange={setTested} />
                  <CompactNumberField title="עברו" value={passedCount} onChange={setPassedCount} />
                  <CompactNumberField title="מצטיינים" value={excellentCount} onChange={setExcellentCount} />
                  <CompactNumberField title="לא ניגשו" value={absentCount} onChange={setAbsentCount} />
                  <CompactNumberField title="מודחים / עזבו" value={dismissedCount} onChange={setDismissedCount} />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mt-4">
                  <CompactResultCard title="% ניגשו מהמצבה" value={formatPercent(calculator.attendancePercent)} tone="neutral" />
                  <CompactResultCard title="% עברו מהניגשים" value={formatPercent(calculator.passOfTestedPercent)} tone="success" />
                  <CompactResultCard title="% נכשלו מהניגשים" value={formatPercent(calculator.failOfTestedPercent)} tone="danger" />
                  <CompactResultCard title="% מצטיינים מהניגשים" value={formatPercent(calculator.excellentOfTestedPercent)} tone="excellent" />
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
                    : "⚠️ ודא שיש מצבה נוכחית וניגשים, ושכל הכמויות מסתדרות."}
                </div>
              </section>
            )}

            <section className="bg-white rounded-3xl shadow-sm p-4 sm:p-5 mb-4">
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-3">
                <div>
                  <h2 className="text-lg sm:text-xl font-black">
                    סיכום המועד – אחוזים ומרכיבי הבוחן
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    כל נתוני המועד מרוכזים במקום אחד: מעבר, כישלון, מצטיינים והממוצע / אחוז הכשל בכל מרכיב.
                  </p>
                </div>

                <div className="text-sm font-bold text-slate-600">
                  {selectedTest?.name} • {attemptLabel(result.attempt)}
                  {result.testDate && (
                    <span className="mr-2">
                      •{" "}
                      {new Date(
                        `${result.testDate}T00:00:00`
                      ).toLocaleDateString(
                        "he-IL"
                      )}
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-5">
                <CompactPercentCard
                  title="עברו"
                  value={result.passedPercent}
                  tone="success"
                />
                <CompactPercentCard
                  title="נכשלו"
                  value={result.failedPercent}
                  tone="danger"
                />
                <CompactPercentCard
                  title="מצטיינים"
                  value={result.excellentPercent}
                  tone="excellent"
                />
              </div>

              {metricDefinitions.length > 0 && (
                <div className="mt-6 border-t border-slate-100 pt-6">
                  <div>
                    <h3 className="text-lg font-black">
                      פירוט לפי מרכיבי הבוחן
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      {usesGenderSplit(
                        battalionName
                      )
                        ? "בגדוד זה מזינים ממוצע צוערים וממוצע צוערות בנפרד. מספר הנכשלים נשאר נתון כולל, ואחוז הכשל מחושב אוטומטית מתוך מספר הניגשים במחשבון."
                        : "הזן את ממוצע המרכיב ואת מספר הנכשלים בו. אחוז הנכשלים יחושב אוטומטית מתוך מספר הניגשים במחשבון. אם אין פילוח אמיתי, השאר ריק."}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4">
                    {metricDefinitions.map(
                      (metric) => {
                        const value =
                          result.metrics[
                            metric.key
                          ];

                        return (
                          <div
                            key={
                              metric.key
                            }
                            className="border border-slate-200 rounded-2xl p-4 bg-slate-50"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <h4 className="font-black text-lg">
                                {metric.title}
                              </h4>

                              {(value?.failedCount !==
                                undefined ||
                                value?.failedPercent !==
                                  undefined) && (
                                <span className="bg-red-50 border border-red-100 text-red-700 rounded-lg px-2 py-1 text-xs font-black">
                                  {formatMetricFailureSummary(
                                    value,
                                    safeInt(tested)
                                  )}{" "}
                                  נכשלים
                                </span>
                              )}
                            </div>

                            {!isReadOnly ? (
                              <div
                                className={`grid ${
                                  metric.failureOnly
                                    ? "grid-cols-1"
                                    : "grid-cols-1 sm:grid-cols-2"
                                } gap-3 mt-4`}
                              >
                                {!metric.failureOnly && (
                                  usesGenderSplit(
                                    battalionName
                                  ) ? (
                                    <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                      <label className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                                        <span className="block text-xs font-bold text-blue-700">
                                          ממוצע צוערים
                                        </span>

                                        <input
                                          type="text"
                                          value={
                                            value?.maleAverage ??
                                            ""
                                          }
                                          onChange={(
                                            event
                                          ) =>
                                            updateMetricAverage(
                                              metric.key,
                                              event.target.value,
                                              "male"
                                            )
                                          }
                                          placeholder="לדוגמה 12:21 / 48 / 10"
                                          className="w-full border border-blue-200 rounded-lg px-3 py-2 mt-2 bg-white font-bold"
                                        />
                                      </label>

                                      <label className="bg-fuchsia-50 border border-fuchsia-100 rounded-xl p-3">
                                        <span className="block text-xs font-bold text-fuchsia-700">
                                          ממוצע צוערות
                                        </span>

                                        <input
                                          type="text"
                                          value={
                                            value?.femaleAverage ??
                                            ""
                                          }
                                          onChange={(
                                            event
                                          ) =>
                                            updateMetricAverage(
                                              metric.key,
                                              event.target.value,
                                              "female"
                                            )
                                          }
                                          placeholder="לדוגמה 14:35 / 55 / 8"
                                          className="w-full border border-fuchsia-200 rounded-lg px-3 py-2 mt-2 bg-white font-bold"
                                        />
                                      </label>

                                      {value?.average && (
                                        <p className="sm:col-span-2 text-[11px] text-slate-500">
                                          נתון ממוצע ישן שנשמר לפני הפיצול: {value.average}
                                        </p>
                                      )}
                                    </div>
                                  ) : (
                                    <label className="bg-white border border-slate-200 rounded-xl p-3">
                                      <span className="block text-xs font-bold text-slate-600">
                                        ממוצע
                                      </span>

                                      <input
                                        type="text"
                                        value={
                                          value?.average ??
                                          ""
                                        }
                                        onChange={(
                                          event
                                        ) =>
                                          updateMetricAverage(
                                            metric.key,
                                            event.target.value
                                          )
                                        }
                                        placeholder="לדוגמה 12:21 / 48 / 10"
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 mt-2 bg-white font-bold"
                                      />
                                    </label>
                                  )
                                )}

                                <label className="bg-red-50 border border-red-100 rounded-xl p-3">
                                  <span className="block text-xs font-bold text-red-700">
                                    מספר נכשלים
                                  </span>

                                  <input
                                    type="number"
                                    min={0}
                                    max={safeInt(tested)}
                                    step={1}
                                    value={
                                      value?.failedCount ??
                                      ""
                                    }
                                    onChange={(
                                      event
                                    ) =>
                                      updateMetricFailedCount(
                                        metric.key,
                                        event.target.value
                                      )
                                    }
                                    placeholder="לדוגמה 6"
                                    className="w-full border border-red-200 rounded-lg px-3 py-2 mt-2 bg-white font-black text-red-700"
                                  />
                                </label>
                              </div>
                            ) : (
                              <div
                                className={`grid ${
                                  metric.failureOnly
                                    ? "grid-cols-1"
                                    : "grid-cols-2"
                                } gap-3 mt-4`}
                              >
                                {!metric.failureOnly && (
                                  usesGenderSplit(
                                    battalionName
                                  ) ? (
                                    <div className="col-span-2 grid grid-cols-2 gap-2">
                                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                                        <p className="text-xs text-blue-700">
                                          ממוצע צוערים
                                        </p>
                                        <p className="text-xl font-black mt-1">
                                          {formatAverage(
                                            value?.maleAverage
                                          )}
                                        </p>
                                      </div>

                                      <div className="bg-fuchsia-50 border border-fuchsia-100 rounded-xl p-3">
                                        <p className="text-xs text-fuchsia-700">
                                          ממוצע צוערות
                                        </p>
                                        <p className="text-xl font-black mt-1">
                                          {formatAverage(
                                            value?.femaleAverage
                                          )}
                                        </p>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="bg-white border border-slate-200 rounded-xl p-3">
                                      <p className="text-xs text-slate-500">
                                        ממוצע
                                      </p>
                                      <p className="text-xl font-black mt-1">
                                        {formatAverage(
                                          value?.average
                                        )}
                                      </p>
                                    </div>
                                  )
                                )}

                                <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                                  <p className="text-xs text-red-600">
                                    נכשלים
                                  </p>
                                  <p className="text-xl font-black text-red-700 mt-1">
                                    {formatMetricFailureSummary(
                                      value,
                                      safeInt(tested)
                                    )}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      }
                    )}
                  </div>
                </div>
              )}

              <div
                className={
                  validation.valid &&
                  calculator.valid
                    ? "bg-green-50 border border-green-100 text-green-700 rounded-xl p-3 mt-5 text-sm"
                    : "bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3 mt-5 text-sm"
                }
              >
                {calculator.valid
                  ? validation.text
                  : "השלם הזנת כמויות תקינה לפני השמירה."}
              </div>

              {message && (
                <div className="bg-blue-50 border border-blue-100 text-blue-700 rounded-xl p-3 mt-3 text-sm">
                  {message}
                </div>
              )}
            </section>

            {!!attempts.length && (
              <section className="bg-white rounded-3xl shadow-sm p-4 sm:p-5 mb-4">
                <h2 className="text-lg sm:text-xl font-black">
                  היסטוריית מועדים
                </h2>

                <div className="space-y-3 mt-4">
                  {attempts.map(
                    (attempt) => (
                      <button
                        key={
                          attempt.attempt
                        }
                        type="button"
                        onClick={() =>
                          selectAttempt(
                            attempt.attempt
                          )
                        }
                        className="w-full text-right bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl p-4"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                          <div>
                            <p className="font-black">
                              {attemptLabel(
                                attempt.attempt
                              )}
                              {attempt.testDate && (
                                <span className="text-slate-400 font-medium mr-2">
                                  •{" "}
                                  {new Date(
                                    `${attempt.testDate}T00:00:00`
                                  ).toLocaleDateString(
                                    "he-IL"
                                  )}
                                </span>
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
                                (metric) => {
                                  const metricValue =
                                    attempt.metrics[
                                      metric.key
                                    ];

                                  return (
                                    <span
                                      key={
                                        metric.key
                                      }
                                      className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs"
                                    >
                                      <strong>
                                        {metric.title}
                                      </strong>
                                      {!metric.failureOnly && (
                                        usesGenderSplit(
                                          battalionName
                                        ) ? (
                                          <span className="text-slate-500 mr-1">
                                            {" "}צוערים: {formatAverage(
                                              metricValue?.maleAverage
                                            )} • צוערות: {formatAverage(
                                              metricValue?.femaleAverage
                                            )}
                                          </span>
                                        ) : (
                                          <span className="text-slate-500 mr-1">
                                            {" "}
                                            {formatAverage(
                                              metricValue?.average
                                            )}
                                          </span>
                                        )
                                      )}
                                      <span className="text-red-700 font-bold mr-1">
                                        {" "}
                                        כשל{" "}
                                        {metricValue?.failedCount !==
                                        undefined
                                          ? `${metricValue.failedCount}`
                                          : formatMetricFailed(
                                              metricValue?.failedPercent
                                            )}
                                      </span>
                                    </span>
                                  );
                                }
                              )}
                            </div>
                          )}
                        </div>
                      </button>
                    )
                  )}
                </div>
              </section>
            )}

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