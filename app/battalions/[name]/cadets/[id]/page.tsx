"use client";

import { useParams, useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getCadetHistoryForCycle,
  getCadetHistoryByLegacyId,
  SharedTestResult,
} from "@/lib/test-results";

import {
  getActiveCycle,
  getCadetsStorageKey,
  getLegacyCadetsStorageKey,
  type CourseCycle,
} from "@/lib/cycles";

import {
  getRegularLoranArray,
  getRegularLoranPassingTime,
  formatLoranTime,
} from "@/lib/loran-regular";

import {
  supabase,
} from "@/lib/supabase";

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

  company: string;
  team: string;

  loranPopulation: string;

  medicalStatus: string;
  courseStatus?: string;

  fitnessLevel?: string;
  shootingLevel?: string;

  sourceBattalion?: string;
  currentBattalion?: string;
  previousBattalion?: string;

  notes: string;
};

type Status =
  | "עבר"
  | "נכשל"
  | "טרם חושב"
  | "חסר סף"
  | "אין מערך";

type AnalysisResult = {
  runStatus: Status;
  shootingStatus: Status;

  runThreshold: string;
  shootingThreshold: string;

  runGap: string;
  shootingGap: string;
};

/* =========================================================
   CONFIG
========================================================= */

const IMPROVED_LORAN_MAX_PASS_TIME =
  39 * 60 + 59;

function getAttemptLabel(
  attempt?: number
) {
  const resolved =
    attempt ?? 1;

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

  return `מועד ${
    letters[resolved] ||
    resolved
  }`;
}

/* =========================================================
   TIME HELPERS
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
    parts.some((part) =>
      Number.isNaN(part)
    )
  ) {
    return null;
  }

  if (parts.length === 2) {
    const [
      minutes,
      seconds,
    ] = parts;

    if (
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

  if (parts.length === 3) {
    const [
      hours,
      minutes,
      seconds,
    ] = parts;

    if (
      minutes > 59 ||
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

function formatSeconds(
  seconds: number
) {
  const absolute =
    Math.abs(seconds);

  const minutes =
    Math.floor(
      absolute / 60
    );

  const remainder =
    absolute % 60;

  if (minutes === 0) {
    return `${remainder} שנ׳`;
  }

  return `${minutes}:${String(
    remainder
  ).padStart(2, "0")}`;
}

/* =========================================================
   TEST IDENTIFICATION
========================================================= */

function isImprovedLoran(
  testName: string
) {
  return testName.includes(
    "לורן משופר"
  );
}

function isMMTest(
  testName: string
) {
  return (
    testName.includes(
      'בוחן מ"מ'
    ) ||
    testName.includes(
      "בוחן מ״מ"
    )
  );
}

function isRegularLoran(
  testName: string
) {
  return (
    testName.includes(
      "לורן"
    ) &&
    !isImprovedLoran(
      testName
    )
  );
}

function isImprovedStyleTest(
  testName: string
) {
  return (
    isImprovedLoran(
      testName
    ) ||
    isMMTest(
      testName
    )
  );
}

function isFitnessTest(
  testName: string
) {
  return (
    testName.includes(
      'כש"ג'
    ) ||
    testName.includes(
      "כש״ג"
    )
  );
}

/* =========================================================
   SHOOTING
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
   LORAN ANALYSIS
========================================================= */

function analyzeLoranResult(
  result: SharedTestResult,
  cadet: Cadet
): AnalysisResult {
  let runStatus: Status =
    "טרם חושב";

  let shootingStatus: Status =
    "טרם חושב";

  let runThreshold = "—";
  let shootingThreshold =
    "—";

  let runGap = "—";
  let shootingGap = "—";

  /* =======================================================
     RUN
  ======================================================= */

  const actualRun =
    parseTimeToSeconds(
      result.runTime
    );

  if (
    isRegularLoran(
      result.testName
    )
  ) {
    const array =
      getRegularLoranArray(
        cadet.loranPopulation
      );

    const threshold =
      getRegularLoranPassingTime(
        cadet.loranPopulation
      );

    if (!array) {
      runStatus =
        "אין מערך";
    } else if (
      actualRun === null
    ) {
      runStatus =
        "טרם חושב";
    } else if (
      threshold === null
    ) {
      runStatus =
        "אין מערך";
    } else {
      runThreshold =
        formatLoranTime(
          threshold
        );

      if (
        actualRun <=
        threshold
      ) {
        runStatus =
          "עבר";

        runGap =
          `${formatSeconds(
            threshold -
              actualRun
          )} מתחת לסף`;
      } else {
        runStatus =
          "נכשל";

        runGap =
          `${formatSeconds(
            actualRun -
              threshold
          )} מעל הסף`;
      }
    }
  }

  if (
    isImprovedStyleTest(
      result.testName
    )
  ) {
    runThreshold =
      "39:59";

    if (
      actualRun === null
    ) {
      runStatus =
        "טרם חושב";
    } else if (
      actualRun <=
      IMPROVED_LORAN_MAX_PASS_TIME
    ) {
      runStatus =
        "עבר";

      runGap =
        `${formatSeconds(
          IMPROVED_LORAN_MAX_PASS_TIME -
            actualRun
        )} מתחת לסף`;
    } else {
      runStatus =
        "נכשל";

      runGap =
        `${formatSeconds(
          actualRun -
            IMPROVED_LORAN_MAX_PASS_TIME
        )} מעל הסף`;
    }
  }

  /* =======================================================
     SHOOTING
  ======================================================= */

  const threshold =
    getShootingThreshold(
      cadet
    );

  if (
    threshold !== null
  ) {
    shootingThreshold =
      threshold.toString();
  }

  if (
    !result.shootingScore
  ) {
    shootingStatus =
      "טרם חושב";
  } else {
    const actual =
      Number(
        result.shootingScore
      );

    if (
      Number.isNaN(actual)
    ) {
      shootingStatus =
        "טרם חושב";
    } else if (
      threshold === null
    ) {
      shootingStatus =
        "חסר סף";
    } else if (
      actual >= threshold
    ) {
      shootingStatus =
        "עבר";

      shootingGap =
        `+${actual - threshold}`;
    } else {
      shootingStatus =
        "נכשל";

      shootingGap =
        `-${threshold - actual}`;
    }
  }

  return {
    runStatus,
    shootingStatus,

    runThreshold,
    shootingThreshold,

    runGap,
    shootingGap,
  };
}

/* =========================================================
   FITNESS IMPROVEMENT
========================================================= */

function compareTime(
  opening: string,
  final: string
) {
  const openingSeconds =
    parseTimeToSeconds(
      opening
    );

  const finalSeconds =
    parseTimeToSeconds(
      final
    );

  if (
    openingSeconds === null ||
    finalSeconds === null
  ) {
    return {
      text: "—",
      status: "missing",
    };
  }

  const difference =
    openingSeconds -
    finalSeconds;

  if (difference > 0) {
    return {
      text:
        `שיפור ${formatSeconds(
          difference
        )}`,
      status: "improved",
    };
  }

  if (difference < 0) {
    return {
      text:
        `ירידה ${formatSeconds(
          difference
        )}`,
      status: "declined",
    };
  }

  return {
    text: "ללא שינוי",
    status: "same",
  };
}

function compareNumber(
  opening: string,
  final: string
) {
  if (
    !opening ||
    !final
  ) {
    return {
      text: "—",
      status: "missing",
    };
  }

  const first =
    Number(opening);

  const second =
    Number(final);

  if (
    Number.isNaN(first) ||
    Number.isNaN(second)
  ) {
    return {
      text: "—",
      status: "missing",
    };
  }

  const difference =
    second - first;

  if (difference > 0) {
    return {
      text:
        `+${difference}`,
      status: "improved",
    };
  }

  if (difference < 0) {
    return {
      text:
        `${difference}`,
      status: "declined",
    };
  }

  return {
    text: "ללא שינוי",
    status: "same",
  };
}

/* =========================================================
   PAGE
========================================================= */

export default function CadetProfilePage() {
  const params =
    useParams<{
      name: string;
      id: string;
    }>();

  const router =
    useRouter();

  const battalionName =
    decodeURIComponent(
      params.name
    );

  const cadetId =
    Number(
      params.id
    );

  const [
    activeCycle,
    setActiveCycleState,
  ] =
    useState<CourseCycle | null>(
      null
    );

  const [
    cycleLoaded,
    setCycleLoaded,
  ] =
    useState(false);

  const [
    cadet,
    setCadet,
  ] =
    useState<Cadet | null>(
      null
    );

  const [
    history,
    setHistory,
  ] =
    useState<
      SharedTestResult[]
    >([]);

  const [
    selectedBattalion,
    setSelectedBattalion,
  ] =
    useState("הכל");

  const cadetsStorageKey =
    activeCycle
      ? getCadetsStorageKey(
          battalionName,
          activeCycle.id
        )
      : getLegacyCadetsStorageKey(
          battalionName
        );

  const cloudCycleId =
    activeCycle?.id ||
    `legacy-${battalionName}`;

  /* =======================================================
     LOAD ACTIVE CYCLE
  ======================================================= */

  useEffect(() => {
    const cycle =
      getActiveCycle(
        battalionName
      );

    setActiveCycleState(
      cycle
    );

    setCycleLoaded(true);
  }, [
    battalionName,
  ]);

  /* =======================================================
     LOAD CADET
  ======================================================= */

  useEffect(() => {
    if (!cycleLoaded) {
      return;
    }

    const saved =
      localStorage.getItem(
        cadetsStorageKey
      );

    if (!saved) {
      return;
    }

    try {
      const parsed =
        JSON.parse(
          saved
        ) as Cadet[];

      const found =
        parsed.find(
          (item) =>
            item.id ===
            cadetId
        );

      setCadet(
        found ?? null
      );
    } catch (error) {
      console.error(
        "שגיאה בטעינת הצוער:",
        error
      );
    }
  }, [
    cadetId,
    cadetsStorageKey,
    cycleLoaded,
  ]);

  /* =======================================================
     LOAD HISTORY
     Supabase first, localStorage fallback
  ======================================================= */

  useEffect(() => {
    if (!cadet) {
      return;
    }

    let cancelled = false;

    async function loadHistory() {
      if (cadet?.globalId) {
        const {
          data,
          error,
        } =
          await supabase
            .from(
              "test_results"
            )
            .select(
              `
                id,
                global_id,
                cadet_id,
                cadet_name,
                battalion,
                test_name,
                stage,
                cycle_id,
                cycle_name,
                attempt,
                run_time,
                sprint_time,
                pull_ups,
                chest_press,
                trap_bar,
                shooting_score,
                notes,
                updated_at
              `
            )
            .eq(
              "global_id",
              cadet.globalId
            )
            .order(
              "updated_at",
              {
                ascending: true,
              }
            );

        if (
          !cancelled &&
          !error &&
          data
        ) {
          const cloudHistory =
            data
              .filter(
                (row) => {
                  /*
                    במחזור פעיל מציגים את המחזור הנוכחי.
                    בנתונים קיימים מציגים את legacy של הגדוד.
                  */
                  if (activeCycle) {
                    return (
                      row.cycle_id ===
                        activeCycle.id ||
                      (
                        battalionName ===
                          "גפן" &&
                        (
                          row.battalion ===
                            "דקל" ||
                          row.battalion ===
                            "רימון"
                        )
                      )
                    );
                  }

                  return (
                    row.cycle_id ===
                      cloudCycleId ||
                    !row.cycle_id
                  );
                }
              )
              .map(
                (row): SharedTestResult => ({
                  id:
                    row.id,

                  globalId:
                    row.global_id ||
                    "",

                  cadetId:
                    row.cadet_id ||
                    cadet.id,

                  cadetName:
                    row.cadet_name ||
                    cadet.name,

                  battalion:
                    row.battalion,

                  testName:
                    row.test_name,

                  stage:
                    row.stage,

                  cycleId:
                    row.cycle_id ||
                    undefined,

                  cycleName:
                    row.cycle_name ||
                    undefined,

                  attempt:
                    Number(
                      row.attempt ||
                      1
                    ),

                  runTime:
                    row.run_time ||
                    "",

                  sprintTime:
                    row.sprint_time ||
                    "",

                  pullUps:
                    row.pull_ups ||
                    "",

                  chestPress:
                    row.chest_press ||
                    "",

                  trapBar:
                    row.trap_bar ||
                    "",

                  shootingScore:
                    row.shooting_score ||
                    "",

                  notes:
                    row.notes ||
                    "",

                  updatedAt:
                    row.updated_at ||
                    new Date()
                      .toISOString(),
                })
              );

          if (
            cloudHistory.length >
            0
          ) {
            setHistory(
              cloudHistory
            );
            return;
          }
        }

        if (error) {
          console.error(
            "שגיאה בטעינת היסטוריית הצוער מ-Supabase:",
            error
          );
        }
      }

      /*
        fallback ל-localStorage ולנתונים הישנים.
      */
      let results:
        SharedTestResult[] =
        [];

      if (
        cadet?.globalId
      ) {
        results =
          getCadetHistoryForCycle(
            cadet.globalId,
            battalionName,
            activeCycle
          );
      }

      if (
        results.length === 0
      ) {
        results =
          getCadetHistoryByLegacyId(
            battalionName,
            cadet?.id ?? cadetId,
            activeCycle?.id
          );
      }

      if (!cancelled) {
        setHistory(
          results
        );
      }
    }

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, [
    cadet,
    battalionName,
    activeCycle,
    cloudCycleId,
  ]);

  /* =======================================================
     HISTORY SORT
  ======================================================= */

  const sortedHistory =
    useMemo(() => {
      return [...history].sort(
        (a, b) =>
          new Date(
            a.updatedAt
          ).getTime() -
          new Date(
            b.updatedAt
          ).getTime()
      );
    }, [history]);

  /* =======================================================
     LORAN HISTORY
  ======================================================= */

  const loranHistory =
    useMemo(() => {
      if (!cadet) {
        return [];
      }

      return sortedHistory
        .filter(
          (result) =>
            result.testName.includes(
              "לורן"
            ) ||
            isMMTest(
              result.testName
            )
        )
        .map(
          (result) => ({
            result,
            analysis:
              analyzeLoranResult(
                result,
                cadet
              ),
          })
        );
    }, [
      sortedHistory,
      cadet,
    ]);

  /* =======================================================
     FAILURES
  ======================================================= */

  const runFailures =
    loranHistory.filter(
      (item) =>
        item.analysis
          .runStatus ===
        "נכשל"
    );

  const shootingFailures =
    loranHistory.filter(
      (item) =>
        item.analysis
          .shootingStatus ===
        "נכשל"
    );

  const passedBoth =
    loranHistory.filter(
      (item) =>
        item.analysis
          .runStatus ===
          "עבר" &&
        item.analysis
          .shootingStatus ===
          "עבר"
    );

  /* =======================================================
     FITNESS
  ======================================================= */

  const fitnessHistory =
    sortedHistory.filter(
      (result) =>
        isFitnessTest(
          result.testName
        ) &&
        result.battalion ===
          battalionName
    );

  const openingFitness =
    [...fitnessHistory]
      .reverse()
      .find(
        (result) =>
          result.stage ===
          "פתיחה"
      ) ?? null;

  const finalFitness =
    [...fitnessHistory]
      .reverse()
      .find(
        (result) =>
          result.stage ===
          "סיום"
      ) ?? null;

  const fitnessComparison =
    useMemo(() => {
      return [
        {
          name:
            'ריצת 3 ק"מ',

          opening:
            openingFitness
              ?.runTime ??
            "",

          final:
            finalFitness
              ?.runTime ??
            "",

          comparison:
            compareTime(
              openingFitness
                ?.runTime ??
                "",
              finalFitness
                ?.runTime ??
                ""
            ),
        },

        {
          name:
            "2×150",

          opening:
            openingFitness
              ?.sprintTime ??
            "",

          final:
            finalFitness
              ?.sprintTime ??
            "",

          comparison:
            compareTime(
              openingFitness
                ?.sprintTime ??
                "",
              finalFitness
                ?.sprintTime ??
                ""
            ),
        },

        {
          name:
            "מתח",

          opening:
            openingFitness
              ?.pullUps ??
            "",

          final:
            finalFitness
              ?.pullUps ??
            "",

          comparison:
            compareNumber(
              openingFitness
                ?.pullUps ??
                "",
              finalFitness
                ?.pullUps ??
                ""
            ),
        },

        {
          name:
            "לחיצת חזה / מקבילים",

          opening:
            openingFitness
              ?.chestPress ??
            "",

          final:
            finalFitness
              ?.chestPress ??
            "",

          comparison:
            compareNumber(
              openingFitness
                ?.chestPress ??
                "",
              finalFitness
                ?.chestPress ??
                ""
            ),
        },

        {
          name:
            "טראפ בר",

          opening:
            openingFitness
              ?.trapBar ??
            "",

          final:
            finalFitness
              ?.trapBar ??
            "",

          comparison:
            compareNumber(
              openingFitness
                ?.trapBar ??
                "",
              finalFitness
                ?.trapBar ??
                ""
            ),
        },
      ];
    }, [
      openingFitness,
      finalFitness,
    ]);

  /* =======================================================
     BATTALIONS
  ======================================================= */

  const battalions =
    useMemo(() => {
      return Array.from(
        new Set(
          sortedHistory.map(
            (result) =>
              result.battalion
          )
        )
      );
    }, [
      sortedHistory,
    ]);

  const filteredHistory =
    useMemo(() => {
      if (
        selectedBattalion ===
        "הכל"
      ) {
        return sortedHistory;
      }

      return sortedHistory.filter(
        (result) =>
          result.battalion ===
          selectedBattalion
      );
    }, [
      sortedHistory,
      selectedBattalion,
    ]);

  /* =======================================================
     MISSING DATA
  ======================================================= */

  const missingData =
    useMemo(() => {
      if (!cadet) {
        return [];
      }

      const missing:
        string[] =
        [];

      if (!cadet.gender) {
        missing.push("מין");
      }

      if (!cadet.unit) {
        missing.push("יחידה");
      }

      if (
        !cadet.fitnessLevel
      ) {
        missing.push(
          'רמת כש"ג'
        );
      }

      if (
        !cadet.shootingLevel
      ) {
        missing.push(
          "רמת קליעה"
        );
      }

      if (
        !cadet.loranPopulation
      ) {
        missing.push(
          "אוכלוסיית לורן"
        );
      }

      return missing;
    }, [cadet]);

  /* =======================================================
     COMMAND FIT RECOMMENDATION
  ======================================================= */

  const recommendation =
    useMemo(() => {
      if (
        missingData.length >
        0
      ) {
        return {
          title:
            "נדרשת השלמת מידע",

          text:
            `לא ניתן לבצע ניתוח מלא. חסרים הנתונים: ${missingData.join(
              ", "
            )}.`,
        };
      }

      if (
        runFailures.length >
          0 &&
        shootingFailures.length >
          0
      ) {
        return {
          title:
            "נדרש מענה משולב – ריצה וירי",

          text:
            `זוהו ${runFailures.length} כישלונות בריצה ו-${shootingFailures.length} כישלונות בירי. מומלץ לבנות לצוער מענה נפרד לכל מרכיב ולא להסתמך על הציון המשוקלל.`,
        };
      }

      if (
        runFailures.length >
        0
      ) {
        const lastFailure =
          runFailures[
            runFailures.length -
              1
          ];

        return {
          title:
            "מוקד מרכזי – ריצה",

          text:
            `הכישלון האחרון בריצה היה בבוחן ${lastFailure.result.testName}. תוצאה: ${lastFailure.result.runTime}, סף: ${lastFailure.analysis.runThreshold}. הפער הוא ${lastFailure.analysis.runGap}.`,
        };
      }

      if (
        shootingFailures.length >
        0
      ) {
        const lastFailure =
          shootingFailures[
            shootingFailures.length -
              1
          ];

        return {
          title:
            "מוקד מרכזי – ירי",

          text:
            `הכישלון האחרון בירי היה בבוחן ${lastFailure.result.testName}. תוצאה: ${lastFailure.result.shootingScore}, סף: ${lastFailure.analysis.shootingThreshold}.`,
        };
      }

      if (
        loranHistory.length >
          0 &&
        passedBoth.length ===
          loranHistory.length
      ) {
        return {
          title:
            "עמידה מלאה בדרישות הלורן",

          text:
            "בכל בחני הלורן הקיימים בתיק הצוער עבר גם את מרכיב הריצה וגם את מרכיב הירי.",
        };
      }

      return {
        title:
          "ממתין לנתונים",

        text:
          "אין עדיין מספיק תוצאות בתיק האישי כדי להפיק המלצה מלאה.",
      };
    }, [
      missingData,
      runFailures,
      shootingFailures,
      passedBoth,
      loranHistory,
    ]);

  /* =======================================================
     NOT FOUND
  ======================================================= */

  if (!cadet) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-slate-100 flex items-center justify-center p-4"
      >
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm p-6 sm:p-10 text-center">

          <h1 className="text-2xl font-bold">
            הצוער לא נמצא
          </h1>

          <button
            type="button"
            onClick={() =>
              router.push(
                `/battalions/${encodeURIComponent(
                  battalionName
                )}/cadets`
              )
            }
            className="mt-6 bg-slate-900 text-white px-5 py-3 rounded-xl"
          >
            חזרה
          </button>

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
      {/* HEADER */}

      <header className="bg-slate-900 text-white px-4 sm:px-6 lg:px-8 py-5 sm:py-6">

        <div className="max-w-[1800px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">

          <div>

            <p className="text-slate-300">
              תיק אישי
            </p>

            <h1 className="text-2xl sm:text-3xl font-bold">
              {cadet.name}
            </h1>

            <p className="text-slate-300 mt-1">
              {cadet.unit ||
                "יחידה לא הוזנה"}
            </p>

            <p className="text-slate-400 text-sm mt-2">
              מחזור:{" "}
              <strong className="text-white">
                {activeCycle?.name ||
                  "נתונים קיימים"}
              </strong>
              {activeCycle?.status ===
                "closed" &&
                " • 🔒 סגור"}
            </p>

          </div>

          <button
            type="button"
            onClick={() =>
              router.push(
                `/battalions/${encodeURIComponent(
                  battalionName
                )}/cadets`
              )
            }
            className="w-full md:w-auto bg-white/10 hover:bg-white/20 px-5 py-3 rounded-xl"
          >
            חזרה לרשימת הצוערים
          </button>

        </div>

      </header>

      <div className="max-w-[1800px] mx-auto p-4 sm:p-6 lg:p-8">

        {/* PERSONAL INFO */}

        <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-5 mb-8">

          <InfoCard
            title="מחזור"
            value={
              activeCycle?.name ||
              "נתונים קיימים"
            }
          />

          <InfoCard
            title="גדוד"
            value={
              cadet.currentBattalion ||
              battalionName
            }
          />

          <InfoCard
            title="יחידה"
            value={
              cadet.unit ||
              "לא הוזן"
            }
          />

          <InfoCard
            title='רמת כש"ג'
            value={
              cadet.fitnessLevel ||
              "לא הוגדר"
            }
          />

          <InfoCard
            title="רמת קליעה"
            value={
              cadet.shootingLevel ||
              "לא הוגדר"
            }
          />

          <InfoCard
            title="אוכלוסיית לורן"
            value={
              cadet.loranPopulation ||
              "לא הוגדר"
            }
          />

        </section>

        {/* MISSING */}

        {missingData.length >
          0 && (

          <section className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-8">

            <h2 className="font-bold text-lg">
              מידע חסר
            </h2>

            <p className="text-amber-800 mt-2">
              חסר:{" "}
              {missingData.join(
                ", "
              )}
            </p>

          </section>

        )}

        {/* KPI */}

        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-5 mb-8">

          <StatCard
            title="סה״כ בחנים"
            value={
              history.length.toString()
            }
          />

          <StatCard
            title="כישלונות בריצה"
            value={
              runFailures.length.toString()
            }
          />

          <StatCard
            title="כישלונות בירי"
            value={
              shootingFailures.length.toString()
            }
          />

          <StatCard
            title="עבר ריצה + ירי"
            value={
              passedBoth.length.toString()
            }
          />

        </section>

        {/* FITNESS IMPROVEMENT */}

        <section className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 mb-8">

          <h2 className="text-2xl font-bold">
            מגמת שיפור בכש״ג
          </h2>

          <p className="text-slate-500 mt-1 mb-6">
            הנתונים נמשכים אוטומטית
            מבוחן פתיחה ומבוחן סוף.
          </p>

          {/* MOBILE FITNESS COMPARISON */}

          <div className="md:hidden space-y-3">

            {fitnessComparison.map(
              (item) => (

                <div
                  key={
                    item.name
                  }
                  className="border border-slate-200 rounded-2xl p-4"
                >

                  <div className="flex items-center justify-between gap-3">

                    <h3 className="font-bold">
                      {item.name}
                    </h3>

                    <TrendBadge
                      status={
                        item.comparison
                          .status
                      }
                    />

                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4">

                    <MobileInfo
                      title="פתיחה"
                      value={
                        item.opening ||
                        "—"
                      }
                    />

                    <MobileInfo
                      title="סיום"
                      value={
                        item.final ||
                        "—"
                      }
                    />

                  </div>

                  <div className="mt-2">

                    <MobileInfo
                      title="שינוי"
                      value={
                        item.comparison
                          .text
                      }
                    />

                  </div>

                </div>

              )
            )}

          </div>

          {/* DESKTOP FITNESS TABLE */}

          <div className="hidden md:block overflow-x-auto">

            <table className="w-full min-w-[800px] border-collapse text-right">

              <thead className="bg-slate-100">

                <tr>

                  <th className="p-3 border-b">
                    מרכיב
                  </th>

                  <th className="p-3 border-b">
                    פתיחה
                  </th>

                  <th className="p-3 border-b">
                    סוף
                  </th>

                  <th className="p-3 border-b">
                    שינוי
                  </th>

                  <th className="p-3 border-b">
                    מגמה
                  </th>

                </tr>

              </thead>

              <tbody>

                {fitnessComparison.map(
                  (item) => (

                    <tr
                      key={
                        item.name
                      }
                    >

                      <td className="p-3 border-b font-bold">
                        {item.name}
                      </td>

                      <td className="p-3 border-b">
                        {item.opening ||
                          "—"}
                      </td>

                      <td className="p-3 border-b">
                        {item.final ||
                          "—"}
                      </td>

                      <td className="p-3 border-b font-medium">
                        {
                          item.comparison
                            .text
                        }
                      </td>

                      <td className="p-3 border-b">

                        <TrendBadge
                          status={
                            item.comparison
                              .status
                          }
                        />

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        </section>

        {/* LORAN ANALYSIS */}

        <section className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 mb-8">

          <h2 className="text-2xl font-bold">
            היסטוריית לורן
          </h2>

          <p className="text-slate-500 mt-1 mb-6">
            ריצה וירי מנותחים
            בנפרד. הציון הסופי אינו
            קובע עבר או נכשל.
          </p>

          {loranHistory.length ===
          0 ? (

            <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400">
              אין עדיין תוצאות לורן
            </div>

          ) : (

            <>
              {/* MOBILE LORAN HISTORY */}

              <div className="md:hidden space-y-4">

                {loranHistory.map(
                  ({
                    result,
                    analysis,
                  }) => {

                    const failed =
                      analysis.runStatus ===
                        "נכשל" ||
                      analysis.shootingStatus ===
                        "נכשל";

                    return (
                      <div
                        key={
                          result.id
                        }
                        className={
                          failed
                            ? "border border-red-200 bg-red-50/40 rounded-2xl p-4"
                            : "border border-slate-200 bg-white rounded-2xl p-4"
                        }
                      >

                        <div className="flex items-start justify-between gap-3">

                          <div>
                            <p className="text-xs text-slate-400">
                              גדוד {result.battalion}
                            </p>

                            <h3 className="font-bold text-lg mt-1">
                              {result.testName}
                            </h3>

                            <span className="inline-block mt-2 bg-blue-50 border border-blue-100 text-blue-700 rounded-lg px-2.5 py-1 text-xs font-bold">
                              {getAttemptLabel(
                                result.attempt
                              )}
                            </span>

                            <p className="text-sm text-slate-500 mt-1">
                              {result.cycleName ||
                                "נתונים קודמים"}
                            </p>
                          </div>

                          {failed && (
                            <span className="shrink-0 bg-red-100 text-red-700 rounded-lg px-2.5 py-1 text-xs font-bold">
                              נדרש מעקב
                            </span>
                          )}

                        </div>

                        <div className="mt-4">

                          <p className="text-xs font-bold text-slate-500 mb-2">
                            ריצה
                          </p>

                          <div className="grid grid-cols-2 gap-2">

                            <MobileInfo
                              title="תוצאה"
                              value={
                                result.runTime ||
                                "—"
                              }
                            />

                            <MobileInfo
                              title="סף"
                              value={
                                analysis.runThreshold
                              }
                            />

                            <MobileInfo
                              title="פער"
                              value={
                                analysis.runGap
                              }
                            />

                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                              <p className="text-[11px] text-slate-400 mb-1">
                                סטטוס
                              </p>

                              <StatusBadge
                                status={
                                  analysis.runStatus
                                }
                              />
                            </div>

                          </div>

                        </div>

                        <div className="mt-4">

                          <p className="text-xs font-bold text-slate-500 mb-2">
                            ירי
                          </p>

                          <div className="grid grid-cols-2 gap-2">

                            <MobileInfo
                              title="תוצאה"
                              value={
                                result.shootingScore ||
                                "—"
                              }
                            />

                            <MobileInfo
                              title="סף"
                              value={
                                analysis.shootingThreshold
                              }
                            />

                            <MobileInfo
                              title="פער"
                              value={
                                analysis.shootingGap
                              }
                            />

                            <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                              <p className="text-[11px] text-slate-400 mb-1">
                                סטטוס
                              </p>

                              <StatusBadge
                                status={
                                  analysis.shootingStatus
                                }
                              />
                            </div>

                          </div>

                        </div>

                        {result.notes && (
                          <div className="bg-slate-50 rounded-xl p-3 mt-4">
                            <p className="text-[11px] text-slate-400">
                              הערות
                            </p>
                            <p
                              className={
                                result.notes.includes(
                                  "נכשל"
                                )
                                  ? "text-sm font-bold text-red-700 mt-1"
                                  : "text-sm mt-1"
                              }
                            >
                              {result.notes}
                            </p>
                          </div>
                        )}

                      </div>
                    );
                  }
                )}

              </div>

              {/* DESKTOP LORAN TABLE */}

              <div className="hidden md:block overflow-x-auto border border-slate-200 rounded-xl">

              <table className="w-full min-w-[1500px] border-collapse text-right">

                <thead className="bg-slate-100">

                  <tr>

                    <th className="p-3 border-b">
                      גדוד
                    </th>

                    <th className="p-3 border-b">
                      מחזור
                    </th>

                    <th className="p-3 border-b">
                      בוחן
                    </th>

                    <th className="p-3 border-b">
                      מועד
                    </th>

                    <th className="p-3 border-b">
                      זמן
                    </th>

                    <th className="p-3 border-b">
                      סף ריצה
                    </th>

                    <th className="p-3 border-b">
                      פער ריצה
                    </th>

                    <th className="p-3 border-b">
                      סטטוס ריצה
                    </th>

                    <th className="p-3 border-b">
                      ירי
                    </th>

                    <th className="p-3 border-b">
                      סף ירי
                    </th>

                    <th className="p-3 border-b">
                      פער ירי
                    </th>

                    <th className="p-3 border-b">
                      סטטוס ירי
                    </th>

                    <th className="p-3 border-b">
                      הערות
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {loranHistory.map(
                    ({
                      result,
                      analysis,
                    }) => (

                      <tr
                        key={
                          result.id
                        }
                        className={
                          analysis.runStatus ===
                            "נכשל" ||
                          analysis.shootingStatus ===
                            "נכשל"
                            ? "bg-red-50/40"
                            : ""
                        }
                      >

                        <td className="p-3 border-b font-bold">
                          {result.battalion}
                        </td>

                        <td className="p-3 border-b">
                          {result.cycleName ||
                            "נתונים קודמים"}
                        </td>

                        <td className="p-3 border-b font-bold">
                          {result.testName}
                        </td>

                        <td className="p-3 border-b">
                          {getAttemptLabel(
                            result.attempt
                          )}
                        </td>

                        <td className="p-3 border-b">
                          {result.runTime ||
                            "—"}
                        </td>

                        <td className="p-3 border-b">
                          {analysis.runThreshold}
                        </td>

                        <td className="p-3 border-b">
                          {analysis.runGap}
                        </td>

                        <td className="p-3 border-b">

                          <StatusBadge
                            status={
                              analysis.runStatus
                            }
                          />

                        </td>

                        <td className="p-3 border-b">
                          {result.shootingScore ||
                            "—"}
                        </td>

                        <td className="p-3 border-b">
                          {analysis.shootingThreshold}
                        </td>

                        <td className="p-3 border-b">
                          {analysis.shootingGap}
                        </td>

                        <td className="p-3 border-b">

                          <StatusBadge
                            status={
                              analysis.shootingStatus
                            }
                          />

                        </td>

                        <td
                          className={
                            result.notes.includes(
                              "נכשל"
                            )
                              ? "p-3 border-b text-red-700 font-bold"
                              : "p-3 border-b"
                          }
                        >
                          {result.notes ||
                            "—"}
                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

              </div>
            </>

          )}

        </section>

        {/* ALL HISTORY */}

        <section className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 mb-8">

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">

            <div>

              <h2 className="text-2xl font-bold">
                כל היסטוריית הבחנים
              </h2>

              <p className="text-slate-500 mt-1">
                כל התוצאות מכל
                הגדודים שבהם הצוער
                עבר.
              </p>

            </div>

            <select
              value={
                selectedBattalion
              }
              onChange={(
                event
              ) =>
                setSelectedBattalion(
                  event.target.value
                )
              }
              className="w-full md:w-auto border rounded-xl px-4 py-3 bg-white"
            >

              <option value="הכל">
                כל הגדודים
              </option>

              {battalions.map(
                (battalion) => (

                  <option
                    key={
                      battalion
                    }
                    value={
                      battalion
                    }
                  >
                    גדוד {battalion}
                  </option>

                )
              )}

            </select>

          </div>

          {filteredHistory.length ===
          0 ? (

            <div className="border-2 border-dashed border-slate-200 rounded-xl p-10 text-center text-slate-400">
              טרם נשמרו בחנים
            </div>

          ) : (

            <>
              {/* MOBILE ALL HISTORY */}

              <div className="md:hidden space-y-3">

                {filteredHistory.map(
                  (result) => (

                    <div
                      key={
                        result.id
                      }
                      className="border border-slate-200 rounded-2xl p-4"
                    >

                      <div className="flex items-start justify-between gap-3">

                        <div>
                          <p className="text-xs text-slate-400">
                            גדוד {result.battalion}
                          </p>

                          <h3 className="font-bold text-lg mt-1">
                            {result.testName}
                          </h3>

                          <span className="inline-block mt-2 bg-blue-50 border border-blue-100 text-blue-700 rounded-lg px-2.5 py-1 text-xs font-bold">
                            {getAttemptLabel(
                              result.attempt
                            )}
                          </span>

                          <p className="text-sm text-slate-500 mt-1">
                            {result.cycleName ||
                              "נתונים קודמים"}
                          </p>
                        </div>

                        <span className="text-xs text-slate-400 text-left">
                          {new Date(
                            result.updatedAt
                          ).toLocaleDateString(
                            "he-IL"
                          )}
                        </span>

                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-4">

                        <MobileInfo
                          title='זמן / 3 ק"מ'
                          value={
                            result.runTime ||
                            "—"
                          }
                        />

                        <MobileInfo
                          title="2×150"
                          value={
                            result.sprintTime ||
                            "—"
                          }
                        />

                        <MobileInfo
                          title="מתח"
                          value={
                            result.pullUps ||
                            "—"
                          }
                        />

                        <MobileInfo
                          title="לחיצת חזה"
                          value={
                            result.chestPress ||
                            "—"
                          }
                        />

                        <MobileInfo
                          title="טראפ בר"
                          value={
                            result.trapBar ||
                            "—"
                          }
                        />

                        <MobileInfo
                          title="ירי"
                          value={
                            result.shootingScore ||
                            "—"
                          }
                        />

                      </div>

                      {result.notes && (
                        <div className="bg-slate-50 rounded-xl p-3 mt-3">
                          <p className="text-[11px] text-slate-400">
                            הערות
                          </p>
                          <p className="text-sm mt-1">
                            {result.notes}
                          </p>
                        </div>
                      )}

                    </div>

                  )
                )}

              </div>

              {/* DESKTOP ALL HISTORY TABLE */}

              <div className="hidden md:block overflow-x-auto border border-slate-200 rounded-xl">

              <table className="w-full min-w-[1400px] border-collapse text-right">

                <thead className="bg-slate-100">

                  <tr>

                    <th className="p-3 border-b">
                      גדוד
                    </th>

                    
                    <th className="p-3 border-b">
                      מחזור
                    </th>

                    <th className="p-3 border-b">
                      בוחן
                    </th>

                    <th className="p-3 border-b">
                      מועד
                    </th>

                    <th className="p-3 border-b">
                      זמן / 3 ק״מ
                    </th>

                    <th className="p-3 border-b">
                      2×150
                    </th>

                    <th className="p-3 border-b">
                      מתח
                    </th>

                    <th className="p-3 border-b">
                      לחיצת חזה
                    </th>

                    <th className="p-3 border-b">
                      טראפ בר
                    </th>

                    <th className="p-3 border-b">
                      ירי
                    </th>

                    <th className="p-3 border-b">
                      הערות
                    </th>

                    <th className="p-3 border-b">
                      עודכן
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {filteredHistory.map(
                    (result) => (

                      <tr
                        key={
                          result.id
                        }
                      >

                        <td className="p-3 border-b font-bold">
                          {result.battalion}
                        </td>

                        
                        <td className="p-3 border-b">
                          {result.cycleName ||
                            "נתונים קודמים"}
                        </td>

                        <td className="p-3 border-b font-bold">
                          {result.testName}
                        </td>

                        <td className="p-3 border-b">
                          {getAttemptLabel(
                            result.attempt
                          )}
                        </td>

                        <td className="p-3 border-b">
                          {result.runTime ||
                            "—"}
                        </td>

                        <td className="p-3 border-b">
                          {result.sprintTime ||
                            "—"}
                        </td>

                        <td className="p-3 border-b">
                          {result.pullUps ||
                            "—"}
                        </td>

                        <td className="p-3 border-b">
                          {result.chestPress ||
                            "—"}
                        </td>

                        <td className="p-3 border-b">
                          {result.trapBar ||
                            "—"}
                        </td>

                        <td className="p-3 border-b">
                          {result.shootingScore ||
                            "—"}
                        </td>

                        <td className="p-3 border-b">
                          {result.notes ||
                            "—"}
                        </td>

                        <td className="p-3 border-b text-sm text-slate-500">

                          {new Date(
                            result.updatedAt
                          ).toLocaleString(
                            "he-IL"
                          )}

                        </td>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

              </div>
            </>

          )}

        </section>

        {/* COMMAND FIT */}

        <section className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">

          <div className="flex items-start sm:items-center gap-3">

            <div className="bg-slate-900 text-white rounded-xl px-3 py-2 font-bold">
              AI
            </div>

            <div>

              <h2 className="text-2xl font-bold">
                המלצת CommandFit
              </h2>

              <p className="text-slate-500 text-sm">
                מבוסס על תיק הצוער
                והכישלונות בפועל
              </p>

            </div>

          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mt-5">

            <h3 className="text-xl font-bold">
              {recommendation.title}
            </h3>

            <p className="text-slate-700 leading-7 mt-3">
              {recommendation.text}
            </p>

          </div>

        </section>

      </div>

    </main>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

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

function StatusBadge({
  status,
}: {
  status: Status;
}) {
  if (
    status === "עבר"
  ) {
    return (
      <span className="inline-block bg-green-50 border border-green-100 text-green-700 px-3 py-1 rounded-lg font-bold">
        עבר
      </span>
    );
  }

  if (
    status === "נכשל"
  ) {
    return (
      <span className="inline-block bg-red-50 border border-red-100 text-red-700 px-3 py-1 rounded-lg font-bold">
        נכשל
      </span>
    );
  }

  if (
    status === "חסר סף" ||
    status === "אין מערך"
  ) {
    return (
      <span className="inline-block bg-amber-50 border border-amber-200 text-amber-700 px-3 py-1 rounded-lg font-bold">
        {status}
      </span>
    );
  }

  return (
    <span className="text-slate-400">
      טרם חושב
    </span>
  );
}

function TrendBadge({
  status,
}: {
  status: string;
}) {
  if (
    status ===
    "improved"
  ) {
    return (
      <span className="inline-block bg-green-50 text-green-700 border border-green-100 px-3 py-1 rounded-lg font-bold">
        ↑ השתפר
      </span>
    );
  }

  if (
    status ===
    "declined"
  ) {
    return (
      <span className="inline-block bg-red-50 text-red-700 border border-red-100 px-3 py-1 rounded-lg font-bold">
        ↓ ירידה
      </span>
    );
  }

  if (
    status ===
    "same"
  ) {
    return (
      <span className="inline-block bg-slate-100 text-slate-600 px-3 py-1 rounded-lg">
        ללא שינוי
      </span>
    );
  }

  return (
    <span className="text-slate-300">
      —
    </span>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">

      <p className="text-slate-500">
        {title}
      </p>

      <p className="text-2xl sm:text-4xl font-bold mt-2">
        {value}
      </p>

    </div>
  );
}

function InfoCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-3 sm:p-5">

      <p className="text-sm text-slate-500">
        {title}
      </p>

      <p className="text-base sm:text-xl font-bold mt-2 break-words">
        {value}
      </p>

    </div>
  );
}