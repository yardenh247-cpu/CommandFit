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
  getRegularLoranPassingTime,
} from "@/lib/loran-regular";

/* =========================================================
   TYPES
========================================================= */

type Cadet = {
  id: number;
  globalId?: string;

  name: string;
  gender: string;

  brigade?: string;
  unit?: string;

  company?: string;
  team?: string;

  loranPopulation?: string;

  medicalStatus?: string;
  courseStatus?: string;

  fitnessLevel?: string;

  /*
    סף הירי של הצוער:
    60 / 70 / 75
  */
  shootingLevel?: string;

  previousBattalion?: string;

  notes?: string;
};

type SavedResult = {
  cadetId: number;

  runTime?: string;
  sprintTime?: string;

  pullUps?: string;
  chestPress?: string;
  trapBar?: string;

  shootingScore?: string;

  notes?: string;
};

type ComponentStatus =
  | "עבר"
  | "נכשל"
  | "טרם בוצע"
  | "חסר סף"
  | "אין מערך"
  | "לא רלוונטי";

type TestEvaluation = {
  tested: boolean;

  runStatus: ComponentStatus;
  shootingStatus: ComponentStatus;

  runThreshold: string;
  shootingThreshold: string;

  runResult: string;
  shootingResult: string;
};

/* =========================================================
   BATTALION TRACKS
========================================================= */

const battalionTracks: Record<
  string,
  string
> = {
  דקל: "מגמת לוחמים",
  רימון: "מגמת לוחמים",
  גפן: "מגמת לוחמים",

  /*
    נשמרים כדי שגדודים קיימים
    אחרים באתר לא יישברו.
  */
  הדס: "מגמת לוחמים",
  דולב: "מגמת לוחמים",

  ארז: "מגמת מטה",
  ברוש: "מגמת מטה",
  חרוב: "מגמת מטה",
  אלון: "מגמת מטה",
};

/* =========================================================
   FALLBACK TESTS
========================================================= */

const fallbackTests: Record<
  string,
  BattalionTest[]
> = {
  הדס: [
    {
      id: "fitness-opening",
      name: 'כש"ג פתיחה',
      type: "fitness",
      order: 1,
      description:
        "בוחן כשירות פתיחה",
    },

    {
      id: "loran-regular",
      name: "לורן",
      type: "loran",
      order: 2,
      description:
        "בוחן לורן",
    },

    {
      id: "fitness-final",
      name: 'כש"ג סוף',
      type: "fitness",
      order: 3,
      description:
        "בוחן כשירות סוף",
    },

    {
      id: "loran-improved",
      name: "לורן מסכם",
      type: "improved-loran",
      order: 4,
      description:
        "בוחן לורן מסכם",
    },
  ],

  דולב: [
    {
      id: "fitness-opening",
      name: 'כש"ג פתיחה',
      type: "fitness",
      order: 1,
      description:
        "בוחן כשירות פתיחה",
    },

    {
      id: "loran-regular",
      name: "לורן",
      type: "loran",
      order: 2,
      description:
        "בוחן לורן",
    },

    {
      id: "fitness-final",
      name: 'כש"ג סוף',
      type: "fitness",
      order: 3,
      description:
        "בוחן כשירות סוף",
    },

    {
      id: "loran-improved",
      name: "לורן מסכם",
      type: "improved-loran",
      order: 4,
      description:
        "בוחן לורן מסכם",
    },
  ],
};

/* =========================================================
   STAFF TESTS
========================================================= */

function getStaffTests(
  battalionName: string
): BattalionTest[] {
  if (
    ![
      "ארז",
      "ברוש",
      "חרוב",
      "אלון",
    ].includes(
      battalionName
    )
  ) {
    return [];
  }

  return [
    {
      id: "run-3000",
      name: "ריצת 3000 מטר",
      type: "fitness",
      order: 1,
      description:
        "ריצת 3000 מטר",
    },

    {
      id: "push-ups",
      name: "שכיבות סמיכה",
      type: "fitness",
      order: 2,
      description:
        "בוחן שכיבות סמיכה",
    },
  ];
}

/* =========================================================
   GET TESTS
========================================================= */

function resolveBattalionTests(
  battalionName: string
): BattalionTest[] {
  /*
    מקור האמת:
    דקל / רימון / גפן
    מגיעים מ-lib/battalion-tests.ts
  */
  const configured =
    getBattalionTests(
      battalionName
    );

  if (
    configured.length > 0
  ) {
    return configured;
  }

  if (
    fallbackTests[
      battalionName
    ]
  ) {
    return fallbackTests[
      battalionName
    ];
  }

  return getStaffTests(
    battalionName
  );
}

/* =========================================================
   TIME
========================================================= */

function parseTimeToSeconds(
  value: string
): number | null {
  const clean =
    value.trim();

  if (!clean) {
    return null;
  }

  const parts =
    clean
      .split(":")
      .map(Number);

  if (
    parts.some((value) =>
      Number.isNaN(value)
    )
  ) {
    return null;
  }

  if (
    parts.length === 2
  ) {
    const [
      minutes,
      seconds,
    ] = parts;

    if (
      minutes < 0 ||
      seconds < 0 ||
      seconds > 59
    ) {
      return null;
    }

    return (
      minutes * 60 +
      seconds
    );
  }

  if (
    parts.length === 3
  ) {
    const [
      hours,
      minutes,
      seconds,
    ] = parts;

    if (
      hours < 0 ||
      minutes < 0 ||
      minutes > 59 ||
      seconds < 0 ||
      seconds > 59
    ) {
      return null;
    }

    return (
      hours * 3600 +
      minutes * 60 +
      seconds
    );
  }

  return null;
}

function formatTime(
  seconds:
    | number
    | null
) {
  if (
    seconds === null
  ) {
    return "—";
  }

  const minutes =
    Math.floor(
      seconds / 60
    );

  const rest =
    seconds % 60;

  return `${minutes}:${String(
    rest
  ).padStart(2, "0")}`;
}

/* =========================================================
   TEST IDENTIFICATION
========================================================= */

function isRegularLoranTest(
  test: BattalionTest
) {
  return (
    test.type === "loran"
  );
}

function isImprovedLoranTest(
  test: BattalionTest
) {
  return (
    test.type ===
    "improved-loran"
  );
}

function isMMTest(
  test: BattalionTest
) {
  return (
    test.type === "mm"
  );
}

/*
  לורן רגיל + לורן משופר + בוחן מ"מ
  כולם משתמשים בסיכום של זמן + ירי.
*/
function isAnyLoranStyleTest(
  test: BattalionTest
) {
  return (
    isRegularLoranTest(
      test
    ) ||
    isImprovedLoranTest(
      test
    ) ||
    isMMTest(
      test
    )
  );
}

/* =========================================================
   SHOOTING THRESHOLD
========================================================= */

function getShootingThreshold(
  cadet: Cadet
): number | null {
  if (
    !cadet.shootingLevel
  ) {
    return null;
  }

  const threshold =
    Number(
      cadet.shootingLevel
    );

  if (
    Number.isNaN(
      threshold
    )
  ) {
    return null;
  }

  return threshold;
}

/* =========================================================
   REGULAR LORAN RUN
========================================================= */

function evaluateRegularLoranRun(
  result: SavedResult,
  cadet: Cadet
): {
  status: ComponentStatus;
  threshold: string;
} {
  const runTime =
    result.runTime?.trim() ??
    "";

  const threshold =
    getRegularLoranPassingTime(
      cadet.loranPopulation ??
        ""
    );

  if (!runTime) {
    return {
      status:
        "טרם בוצע",

      threshold:
        formatTime(
          threshold
        ),
    };
  }

  const actual =
    parseTimeToSeconds(
      runTime
    );

  if (
    actual === null
  ) {
    return {
      status:
        "טרם בוצע",

      threshold:
        formatTime(
          threshold
        ),
    };
  }

  if (
    threshold === null
  ) {
    return {
      status:
        "אין מערך",

      threshold:
        "—",
    };
  }

  return {
    status:
      actual <= threshold
        ? "עבר"
        : "נכשל",

    threshold:
      formatTime(
        threshold
      ),
  };
}

/* =========================================================
   IMPROVED LORAN / MM RUN
========================================================= */

function evaluateImprovedStyleRun(
  result: SavedResult
): {
  status: ComponentStatus;
  threshold: string;
} {
  const runTime =
    result.runTime?.trim() ??
    "";

  const threshold =
    39 * 60 + 59;

  if (!runTime) {
    return {
      status:
        "טרם בוצע",

      threshold:
        "39:59",
    };
  }

  const actual =
    parseTimeToSeconds(
      runTime
    );

  if (
    actual === null
  ) {
    return {
      status:
        "טרם בוצע",

      threshold:
        "39:59",
    };
  }

  return {
    status:
      actual <= threshold
        ? "עבר"
        : "נכשל",

    threshold:
      "39:59",
  };
}

/* =========================================================
   SHOOTING
========================================================= */

function evaluateShooting(
  result: SavedResult,
  cadet: Cadet
): {
  status: ComponentStatus;
  threshold: string;
} {
  const shootingText =
    result.shootingScore?.trim() ??
    "";

  const threshold =
    getShootingThreshold(
      cadet
    );

  if (
    threshold === null
  ) {
    return {
      status:
        shootingText
          ? "חסר סף"
          : "טרם בוצע",

      threshold:
        "חסר",
    };
  }

  if (!shootingText) {
    return {
      status:
        "טרם בוצע",

      threshold:
        threshold.toString(),
    };
  }

  const score =
    Number(
      shootingText
    );

  if (
    Number.isNaN(score)
  ) {
    return {
      status:
        "טרם בוצע",

      threshold:
        threshold.toString(),
    };
  }

  return {
    status:
      score >= threshold
        ? "עבר"
        : "נכשל",

    threshold:
      threshold.toString(),
  };
}

/* =========================================================
   EVALUATE TEST
========================================================= */

function evaluateTestResult(
  test: BattalionTest,
  result: SavedResult,
  cadet: Cadet
): TestEvaluation {
  /*
    לורן רגיל,
    לורן משופר
    ובוחן מ"מ
  */
  if (
    isAnyLoranStyleTest(
      test
    )
  ) {
    const run =
      isRegularLoranTest(
        test
      )
        ? evaluateRegularLoranRun(
            result,
            cadet
          )
        : evaluateImprovedStyleRun(
            result
          );

    const shooting =
      evaluateShooting(
        result,
        cadet
      );

    const tested =
      Boolean(
        result.runTime?.trim() ||
          result.shootingScore?.trim()
      );

    return {
      tested,

      runStatus:
        run.status,

      shootingStatus:
        shooting.status,

      runThreshold:
        run.threshold,

      shootingThreshold:
        shooting.threshold,

      runResult:
        result.runTime ??
        "",

      shootingResult:
        result.shootingScore ??
        "",
    };
  }

  /*
    כש"ג ובחנים אחרים
  */
  const tested =
    Boolean(
      result.runTime?.trim() ||
        result.sprintTime?.trim() ||
        result.pullUps?.trim() ||
        result.chestPress?.trim() ||
        result.trapBar?.trim() ||
        result.shootingScore?.trim() ||
        result.notes?.trim()
    );

  return {
    tested,

    runStatus:
      "לא רלוונטי",

    shootingStatus:
      "לא רלוונטי",

    runThreshold:
      "—",

    shootingThreshold:
      "—",

    runResult:
      result.runTime ??
      "",

    shootingResult:
      result.shootingScore ??
      "",
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
    ];

  const tests =
    useMemo(
      () =>
        resolveBattalionTests(
          battalionName
        ),
      [battalionName]
    );

  const [
    cadets,
    setCadets,
  ] =
    useState<Cadet[]>(
      []
    );

  const [
    allResults,
    setAllResults,
  ] =
    useState<
      Record<
        string,
        SavedResult[]
      >
    >({});

  /* =======================================================
     LOAD
  ======================================================= */

  useEffect(() => {
    if (
      !track ||
      tests.length === 0
    ) {
      return;
    }

    /* =====================================================
       CADETS
    ===================================================== */

    const cadetsKey =
      `commandfit-cadets-${battalionName}`;

    const savedCadets =
      localStorage.getItem(
        cadetsKey
      );

    if (
      savedCadets
    ) {
      try {
        const parsed =
          JSON.parse(
            savedCadets
          ) as Cadet[];

        setCadets(
          parsed.filter(
            (cadet) =>
              Boolean(
                cadet.name?.trim()
              ) &&
              cadet.courseStatus !==
                "הודח"
          )
        );
      } catch {
        setCadets([]);
      }
    } else {
      setCadets([]);
    }

    /* =====================================================
       RESULTS
    ===================================================== */

    const loadedResults:
      Record<
        string,
        SavedResult[]
      > = {};

    tests.forEach(
      (test) => {
        const key =
          `commandfit-results-${battalionName}-${test.name}`;

        const saved =
          localStorage.getItem(
            key
          );

        if (!saved) {
          loadedResults[
            test.name
          ] = [];

          return;
        }

        try {
          loadedResults[
            test.name
          ] =
            JSON.parse(
              saved
            );
        } catch {
          loadedResults[
            test.name
          ] = [];
        }
      }
    );

    setAllResults(
      loadedResults
    );
  }, [
    battalionName,
    tests,
    track,
  ]);

  /* =======================================================
     SUMMARY
  ======================================================= */

  const summary =
    useMemo(() => {
      const runFailureIds =
        new Set<number>();

      const shootingFailureIds =
        new Set<number>();

      const passedBothIds =
        new Set<number>();

      const testedIds =
        new Set<number>();

      const cadetEvaluations =
        new Map<
          number,
          TestEvaluation[]
        >();

      tests
        .filter(
          isAnyLoranStyleTest
        )
        .forEach(
          (test) => {
            const results =
              allResults[
                test.name
              ] ?? [];

            results.forEach(
              (result) => {
                const cadet =
                  cadets.find(
                    (item) =>
                      item.id ===
                      result.cadetId
                  );

                if (!cadet) {
                  return;
                }

                const evaluation =
                  evaluateTestResult(
                    test,
                    result,
                    cadet
                  );

                if (
                  !evaluation.tested
                ) {
                  return;
                }

                testedIds.add(
                  cadet.id
                );

                const existing =
                  cadetEvaluations.get(
                    cadet.id
                  ) ?? [];

                cadetEvaluations.set(
                  cadet.id,
                  [
                    ...existing,
                    evaluation,
                  ]
                );

                if (
                  evaluation.runStatus ===
                  "נכשל"
                ) {
                  runFailureIds.add(
                    cadet.id
                  );
                }

                if (
                  evaluation.shootingStatus ===
                  "נכשל"
                ) {
                  shootingFailureIds.add(
                    cadet.id
                  );
                }
              }
            );
          }
        );

      cadetEvaluations.forEach(
        (
          evaluations,
          cadetId
        ) => {
          const hasFailure =
            evaluations.some(
              (evaluation) =>
                evaluation.runStatus ===
                  "נכשל" ||
                evaluation.shootingStatus ===
                  "נכשל"
            );

          const hasFullPass =
            evaluations.some(
              (evaluation) =>
                evaluation.runStatus ===
                  "עבר" &&
                evaluation.shootingStatus ===
                  "עבר"
            );

          if (
            !hasFailure &&
            hasFullPass
          ) {
            passedBothIds.add(
              cadetId
            );
          }
        }
      );

      return {
        tested:
          testedIds.size,

        passedBoth:
          passedBothIds.size,

        runFailures:
          runFailureIds.size,

        shootingFailures:
          shootingFailureIds.size,
      };
    }, [
      allResults,
      cadets,
      tests,
    ]);

  /* =======================================================
     TEST PROGRESS
  ======================================================= */

  const testProgress =
    useMemo(() => {
      return tests.map(
        (test) => {
          const results =
            allResults[
              test.name
            ] ?? [];

          const testedCadets =
            new Set<number>();

          let runFailures = 0;
          let shootingFailures =
            0;

          results.forEach(
            (result) => {
              const cadet =
                cadets.find(
                  (item) =>
                    item.id ===
                    result.cadetId
                );

              if (!cadet) {
                return;
              }

              const evaluation =
                evaluateTestResult(
                  test,
                  result,
                  cadet
                );

              if (
                !evaluation.tested
              ) {
                return;
              }

              testedCadets.add(
                cadet.id
              );

              if (
                evaluation.runStatus ===
                "נכשל"
              ) {
                runFailures++;
              }

              if (
                evaluation.shootingStatus ===
                "נכשל"
              ) {
                shootingFailures++;
              }
            }
          );

          return {
            ...test,

            testedCount:
              testedCadets.size,

            runFailures,

            shootingFailures,
          };
        }
      );
    }, [
      tests,
      allResults,
      cadets,
    ]);

  /* =======================================================
     DATA COMPLETENESS
  ======================================================= */

  const completedTestsCount =
    useMemo(() => {
      return testProgress.filter(
        (test) =>
          test.testedCount > 0
      ).length;
    }, [
      testProgress,
    ]);

  const testsCompletionPercent =
    tests.length > 0
      ? Math.round(
          (
            completedTestsCount /
            tests.length
          ) *
            100
        )
      : 0;

  /* =======================================================
     NOT FOUND
  ======================================================= */

  if (
    !track ||
    tests.length === 0
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
     UI
  ======================================================= */

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-100"
    >
      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="bg-slate-900 text-white px-4 sm:px-6 lg:px-8 py-5 sm:py-6">

        <div className="max-w-[1500px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-5">

          <div>

            <p className="text-slate-300">
              {track}
            </p>

            <h1 className="text-3xl font-bold">
              גדוד{" "}
              {battalionName}
            </h1>

            <p className="text-slate-400 text-sm mt-2">
              CommandFit – ניהול כשירות
              וביצועי הצוערים
            </p>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto">

            <Link
              href={`/battalions/${encodeURIComponent(
                battalionName
              )}/summary`}
              className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-xl font-medium shadow-sm text-center"
            >
              📊 סיכום וניתוח גדודי
            </Link>
<Link
  href={`/battalions/${encodeURIComponent(
    battalionName
  )}/cycles`}
  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 text-center"
>
  🗂️ ניהול מחזורים
</Link>
            <Link
              href="/"
              className="bg-white/10 hover:bg-white/20 px-5 py-3 rounded-xl text-center"
            >
              חזרה לדף הבית
            </Link>

          </div>

        </div>

      </header>

      <div className="max-w-[1500px] mx-auto p-4 sm:p-6 md:p-8">

        {/* =================================================
            KPI
        ================================================= */}

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-8">

          <StatCard
            title='סה"כ צוערים פעילים'
            value={
              cadets.length.toString()
            }
          />

          <StatCard
            title="עברו ריצה + ירי"
            value={
              summary.passedBoth.toString()
            }
          />

          <StatCard
            title="נכשלים בריצה"
            value={
              summary.runFailures.toString()
            }
            danger={
              summary.runFailures >
              0
            }
          />

          <StatCard
            title="נכשלים בירי"
            value={
              summary.shootingFailures.toString()
            }
            danger={
              summary.shootingFailures >
              0
            }
          />

        </section>

        {/* =================================================
            QUICK SUMMARY ACCESS
        ================================================= */}

        <section className="bg-gradient-to-l from-slate-900 to-slate-800 text-white rounded-3xl p-4 sm:p-6 md:p-7 mb-8 shadow-sm">

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">

            <div>

              <div className="flex items-center gap-3">

                <div className="bg-white/10 w-12 h-12 rounded-xl flex items-center justify-center text-2xl">
                  📊
                </div>

                <div>

                  <h2 className="text-2xl font-bold">
                    סיכום וניתוח גדודי
                  </h2>

                  <p className="text-slate-300 mt-1">
                    ממוצעי כל המרכיבים,
                    מגמות שיפור,
                    השוואת גדודים
                    ומוקדי התערבות
                  </p>

                </div>

              </div>

              {battalionName ===
                "גפן" && (

                <p className="text-violet-200 text-sm mt-4">
                  כולל השוואת ביצועי
                  הצוערים לפני גפן מול
                  הביצועים במהלך גפן
                </p>

              )}

              {(
                battalionName ===
                  "דקל" ||
                battalionName ===
                  "רימון"
              ) && (

                <p className="text-blue-200 text-sm mt-4">
                  כולל השוואה ישירה מול
                  גדוד{" "}
                  {battalionName ===
                  "דקל"
                    ? "רימון"
                    : "דקל"}
                </p>

              )}

            </div>

            <div className="flex flex-col sm:flex-row lg:flex-col xl:flex-row items-stretch gap-3">

              <div className="bg-white/10 rounded-xl px-5 py-3 text-center">

                <p className="text-xs text-slate-300">
                  התקדמות הזנת בחנים
                </p>

                <p className="text-2xl font-bold mt-1">
                  {
                    testsCompletionPercent
                  }
                  %
                </p>

              </div>

              <Link
                href={`/battalions/${encodeURIComponent(
                  battalionName
                )}/summary`}
                className="bg-white text-slate-900 hover:bg-slate-100 px-6 py-4 rounded-xl font-bold flex items-center justify-center"
              >
                פתיחת הדשבורד ←
              </Link>

            </div>

          </div>

        </section>

        {/* =================================================
            BATTALION STRUCTURE
        ================================================= */}

        <section className="bg-white rounded-3xl shadow-sm p-4 sm:p-6 mb-8">

          <div>

            <h2 className="text-2xl font-bold">
              מסלול הבחנים
            </h2>

            <p className="text-slate-500 mt-1">
              הבחנים מוצגים לפי
              הסדר שנקבע עבור גדוד{" "}
              {battalionName}.
            </p>

          </div>

          {/* GEFEN INFO */}

          {battalionName ===
            "גפן" && (

            <div className="bg-violet-50 border border-violet-100 rounded-xl p-4 mt-5">

              <p className="font-bold text-violet-800">
                מסלול גפן
              </p>

              <p className="text-violet-700 mt-1">
                לורן משופר → כש״ג סוף
                → בוחן מ״מ
              </p>

              <p className="text-sm text-violet-600 mt-2">
                אין לורן רגיל ואין
                כש״ג פתיחה בגפן.
              </p>

            </div>

          )}

          {/* DEKEL / RIMON */}

          {(
            battalionName ===
              "דקל" ||
            battalionName ===
              "רימון"
          ) && (

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mt-5">

              <p className="font-bold text-blue-800">
                מסלול{" "}
                {battalionName}
              </p>

              <p className="text-blue-700 mt-1">
                כש״ג פתיחה → לורן →
                כש״ג סוף → לורן משופר
              </p>

            </div>

          )}

          {/* TEST CARDS */}

          <div
            className={`grid grid-cols-1 md:grid-cols-2 ${
              tests.length >= 4
                ? "xl:grid-cols-4"
                : "xl:grid-cols-3"
            } gap-4 mt-6`}
          >

            {testProgress.map(
              (
                test,
                index
              ) => (

                <Link
                  key={
                    test.id
                  }
                  href={`/battalions/${encodeURIComponent(
                    battalionName
                  )}/tests/${encodeURIComponent(
                    test.name
                  )}`}
                  className="group border border-slate-200 rounded-2xl p-4 sm:p-5 hover:border-blue-300 hover:shadow-md transition bg-white active:scale-[0.99]"
                >

                  <div className="flex items-start justify-between gap-3">

                    <div>

                      <p className="text-sm text-slate-500">
                        שלב{" "}
                        {index + 1}
                      </p>

                      <h3 className="font-bold text-xl mt-1 group-hover:text-blue-700 transition">
                        {test.name}
                      </h3>

                    </div>

                    <span className="bg-slate-100 rounded-lg px-3 py-1 text-sm font-medium">
                      {
                        test.testedCount
                      }{" "}
                      נבחנו
                    </span>

                  </div>

                  <p className="text-sm text-slate-500 mt-3 min-h-[40px]">
                    {test.description}
                  </p>

                  {isAnyLoranStyleTest(
                    test
                  ) && (

                    <div className="grid grid-cols-2 gap-2 mt-4">

                      <MiniStat
                        title="נכשלו בריצה"
                        value={
                          test.runFailures
                        }
                      />

                      <MiniStat
                        title="נכשלו בירי"
                        value={
                          test.shootingFailures
                        }
                      />

                    </div>

                  )}

                  {test.type ===
                    "mm" && (

                    <div className="mt-4 bg-violet-50 border border-violet-100 rounded-lg px-3 py-2 text-sm text-violet-700">
                      בוחן מ״מ – גפן בלבד
                    </div>

                  )}

                  <div className="mt-5 text-sm font-medium text-blue-700">
                    צפייה והזנת תוצאות ←
                  </div>

                </Link>

              )
            )}

          </div>

        </section>

        {/* =================================================
            CADETS
        ================================================= */}

        <section className="bg-white rounded-3xl shadow-sm p-4 sm:p-6">

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">

            <div>

              <h2 className="text-2xl font-bold">
                צוערי הגדוד
              </h2>

              <p className="text-slate-500 mt-1">

                {cadets.length >
                0
                  ? `נשמרו ${cadets.length} צוערים פעילים בגדוד`
                  : "טרם הוזנו צוערים למחזור זה"}

              </p>

            </div>

            <div className="grid grid-cols-2 gap-3 w-full md:w-auto">

              <Link
                href={`/battalions/${encodeURIComponent(
                  battalionName
                )}/summary`}
                className="bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-100 px-4 sm:px-5 py-3 rounded-xl font-medium text-center"
              >
                📊 סיכום גדודי
              </Link>

              <Link
                href={`/battalions/${encodeURIComponent(
                  battalionName
                )}/cadets`}
                className="bg-slate-900 hover:bg-slate-700 text-white px-4 sm:px-5 py-3 rounded-xl text-center"
              >
                ניהול צוערים
              </Link>

            </div>

          </div>

          {cadets.length ===
          0 ? (

            <div className="border-2 border-dashed border-slate-200 rounded-xl p-10 text-center">

              <p className="text-slate-400">
                טרם הוזנו צוערים למחזור
                זה
              </p>

              <Link
                href={`/battalions/${encodeURIComponent(
                  battalionName
                )}/cadets`}
                className="inline-block mt-4 text-blue-700 font-medium hover:underline"
              >
                מעבר לניהול צוערים
              </Link>

            </div>

          ) : (

            <>
              {/* MOBILE CADET PREVIEW */}
              <div className="md:hidden space-y-3">

                {cadets
                  .slice(
                    0,
                    10
                  )
                  .map(
                    (cadet) => (

                      <Link
                        key={
                          cadet.globalId ||
                          cadet.id
                        }
                        href={`/battalions/${encodeURIComponent(
                          battalionName
                        )}/cadets/${cadet.id}`}
                        className="block border border-slate-200 rounded-2xl p-4 bg-white active:bg-slate-50"
                      >

                        <div className="flex items-start justify-between gap-3">

                          <div className="min-w-0">

                            <p className="text-xs text-slate-400">
                              צוער מס׳ {cadet.id}
                            </p>

                            <h3 className="font-bold text-lg mt-1 truncate">
                              {cadet.name}
                            </h3>

                            <p className="text-sm text-slate-500 mt-1">
                              {cadet.unit || "יחידה לא הוזנה"}
                            </p>

                          </div>

                          <span className="shrink-0 bg-slate-100 rounded-lg px-3 py-1 text-sm">
                            {cadet.gender || "—"}
                          </span>

                        </div>

                        <div className="grid grid-cols-2 gap-2 mt-4">

                          <MobileInfo
                            title="סטטוס רפואי"
                            value={
                              cadet.medicalStatus ||
                              "—"
                            }
                          />

                          <MobileInfo
                            title='רמת כש"ג'
                            value={
                              cadet.fitnessLevel ||
                              "—"
                            }
                          />

                        </div>

                        <div className="mt-4 text-blue-700 font-medium text-sm">
                          פתיחת תיק אישי ←
                        </div>

                      </Link>

                    )
                  )}

                {cadets.length >
                  10 && (

                  <div className="p-4 text-center text-slate-500 bg-slate-50 rounded-xl">
                    מוצגים 10 מתוך{" "}
                    {cadets.length}{" "}
                    צוערים
                  </div>

                )}

              </div>

              {/* DESKTOP CADET TABLE */}
              <div className="hidden md:block border border-slate-200 rounded-xl overflow-hidden">

              <div className="grid grid-cols-6 bg-slate-100 font-bold p-3 gap-3">

                <div>
                  מס׳
                </div>

                <div>
                  שם
                </div>

                <div>
                  יחידה
                </div>

                <div>
                  מין
                </div>

                <div>
                  סטטוס רפואי
                </div>

                <div>
                  תיק אישי
                </div>

              </div>

              {cadets
                .slice(
                  0,
                  10
                )
                .map(
                  (cadet) => (

                    <div
                      key={
                        cadet.globalId ||
                        cadet.id
                      }
                      className="grid grid-cols-6 p-3 gap-3 border-t border-slate-100 items-center hover:bg-slate-50"
                    >

                      <div>
                        {cadet.id}
                      </div>

                      <div className="font-medium">
                        {cadet.name}
                      </div>

                      <div>
                        {cadet.unit ||
                          "—"}
                      </div>

                      <div>
                        {cadet.gender ||
                          "—"}
                      </div>

                      <div>
                        {cadet.medicalStatus ||
                          "—"}
                      </div>

                      <div>

                        <Link
                          href={`/battalions/${encodeURIComponent(
                            battalionName
                          )}/cadets/${cadet.id}`}
                          className="text-blue-700 hover:underline font-medium"
                        >
                          פתיחת תיק
                        </Link>

                      </div>

                    </div>

                  )
                )}

              {cadets.length >
                10 && (

                <div className="p-4 text-center text-slate-500 border-t">

                  מוצגים 10 מתוך{" "}
                  {cadets.length}{" "}
                  צוערים

                </div>

              )}

              </div>
            </>

          )}

        </section>

      </div>

    </main>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function StatCard({
  title,
  value,
  danger = false,
}: {
  title: string;
  value: string;
  danger?: boolean;
}) {
  return (
    <div
      className={
        danger
          ? "bg-red-50 border border-red-100 rounded-2xl p-4 sm:p-6"
          : "bg-white rounded-2xl shadow-sm p-4 sm:p-6"
      }
    >

      <p className="text-slate-500">
        {title}
      </p>

      <p
        className={
          danger
            ? "text-2xl sm:text-4xl font-bold mt-2 text-red-700"
            : "text-2xl sm:text-4xl font-bold mt-2"
        }
      >
        {value}
      </p>

    </div>
  );
}

function MobileInfo({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 min-w-0">

      <p className="text-[11px] text-slate-400">
        {title}
      </p>

      <p className="font-bold text-sm mt-1 break-words">
        {value}
      </p>

    </div>
  );
}

function MiniStat({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div
      className={
        value > 0
          ? "bg-red-50 border border-red-100 rounded-lg p-3"
          : "bg-green-50 border border-green-100 rounded-lg p-3"
      }
    >

      <p className="text-xs text-slate-500">
        {title}
      </p>

      <p
        className={
          value > 0
            ? "font-bold text-red-700 mt-1"
            : "font-bold text-green-700 mt-1"
        }
      >
        {value}
      </p>

    </div>
  );
}