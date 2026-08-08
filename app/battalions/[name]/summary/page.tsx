"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  getBattalionTests,
  type BattalionTest,
} from "@/lib/battalion-tests";

import {
  getActiveCycle,
  getCadetsStorageKey,
  getCycleById,
  getCyclesByBattalion,
  getLegacyCadetsStorageKey,
  getLegacyResultsStorageKey,
  getResultsStorageKey,
  type CourseCycle,
} from "@/lib/cycles";

import {
  calculateRegularLoranRunningScore,
  getRegularLoranPassingTime,
} from "@/lib/loran-regular";

import {
  getStandard,
} from "@/lib/standards";

/* =========================================================
   TYPES
========================================================= */

type Cadet = {
  id: number;
  globalId?: string;

  name: string;
  gender?: string;

  brigade?: string;
  unit?: string;

  company?: string;
  team?: string;

  loranPopulation?: string;

  medicalStatus?: string;
  courseStatus?: string;

  fitnessLevel?: string;
  shootingLevel?: string;

  previousBattalion?: string;

  notes?: string;
};

type SavedResult = {
  cadetId: number;

  attempt?: number;

  runTime?: string;
  sprintTime?: string;

  pullUps?: string;
  chestPress?: string;
  trapBar?: string;

  shootingScore?: string;

  notes?: string;
};

type BattalionDataset = {
  battalion: string;
  cadets: Cadet[];
  tests: BattalionTest[];

  results: Record<
    string,
    SavedResult[]
  >;
};

type NumericMetric = {
  average: number | null;
  count: number;
  best: number | null;
  worst: number | null;
};

type FitnessSummary = {
  tested: number;

  run: NumericMetric;
  sprint: NumericMetric;

  pullUps: NumericMetric;
  chestPress: NumericMetric;
  trapBar: NumericMetric;
};

type LoranSummary = {
  tested: number;

  averageRunSeconds: number | null;
  bestRunSeconds: number | null;
  worstRunSeconds: number | null;

  averageRunningScore: number | null;

  averageShooting: number | null;
  bestShooting: number | null;
  worstShooting: number | null;

  averageRunningWeighted: number | null;
  averageShootingWeighted: number | null;
  averageFinalScore: number | null;

  runCount: number;
  shootingCount: number;

  runPassed: number;
  runFailed: number;

  shootingPassed: number;
  shootingFailed: number;

  fullPassed: number;

  runPassRate: number;
  shootingPassRate: number;
};

type GefenCadetComparison = {
  globalId: string;
  gefenCadetId: number;

  name: string;

  sourceBattalion: string;

  sourceFitness: SavedResult | null;
  gefenFitness: SavedResult | null;

  sourceLoran: SavedResult | null;
  gefenLoran: SavedResult | null;
};

type DrillRow = {
  cadetId: number;
  name: string;

  result: string;
  threshold?: string;

  status?: string;

  detail?: string;

  sortValue?: number;
};

type DrillState = {
  open: boolean;
  title: string;
  subtitle: string;
  rows: DrillRow[];
};

type OverallStatus =
  | "מצטיין"
  | "עבר"
  | "נכשל"
  | "טרם בוצע";

type TestOutcome = {
  status: OverallStatus;
  finalScore: number | null;
};

type LastTestSnapshot = {
  test: BattalionTest | null;
  tested: number;
  passed: number;
  excellent: number;
  failed: number;
  passRate: number;
};

type AttemptOverview = {
  attempt: number;
  tested: number;
};

/* =========================================================
   TIME
========================================================= */

function parseTimeToSeconds(
  value?: string
): number | null {
  if (!value) {
    return null;
  }

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

  if (parts.length === 3) {
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

function formatSeconds(
  seconds: number | null
) {
  if (
    seconds === null ||
    Number.isNaN(seconds)
  ) {
    return "—";
  }

  const rounded =
    Math.round(seconds);

  const minutes =
    Math.floor(
      rounded / 60
    );

  const remaining =
    rounded % 60;

  return `${minutes}:${String(
    remaining
  ).padStart(2, "0")}`;
}

function formatDeltaTime(
  oldValue: number | null,
  newValue: number | null
) {
  if (
    oldValue === null ||
    newValue === null
  ) {
    return {
      text: "אין מספיק נתונים",
      trend: "neutral",
    };
  }

  const diff =
    newValue - oldValue;

  if (diff < 0) {
    return {
      text: `שיפור ${formatSeconds(
        Math.abs(diff)
      )}`,
      trend: "good",
    };
  }

  if (diff > 0) {
    return {
      text: `ירידה ${formatSeconds(
        diff
      )}`,
      trend: "bad",
    };
  }

  return {
    text: "ללא שינוי",
    trend: "neutral",
  };
}

/* =========================================================
   NUMBERS
========================================================= */

function toNumber(
  value?: string
): number | null {
  if (
    value === undefined ||
    value === null ||
    value.trim() === ""
  ) {
    return null;
  }

  const number =
    Number(value);

  return Number.isNaN(number)
    ? null
    : number;
}

function average(
  values: number[]
): number | null {
  if (
    values.length === 0
  ) {
    return null;
  }

  return (
    values.reduce(
      (sum, value) =>
        sum + value,
      0
    ) / values.length
  );
}

function minValue(
  values: number[]
) {
  if (!values.length) {
    return null;
  }

  return Math.min(
    ...values
  );
}

function maxValue(
  values: number[]
) {
  if (!values.length) {
    return null;
  }

  return Math.max(
    ...values
  );
}

function formatAverage(
  value: number | null
) {
  if (value === null) {
    return "—";
  }

  return value.toFixed(1);
}

function percent(
  value: number,
  total: number
) {
  if (!total) {
    return 0;
  }

  return Math.round(
    (value / total) *
      100
  );
}

function formatNumericChange(
  oldValue: number | null,
  newValue: number | null
) {
  if (
    oldValue === null ||
    newValue === null
  ) {
    return {
      text: "אין מספיק נתונים",
      trend: "neutral",
    };
  }

  const diff =
    newValue - oldValue;

  if (diff > 0) {
    return {
      text: `שיפור +${diff.toFixed(
        1
      )}`,
      trend: "good",
    };
  }

  if (diff < 0) {
    return {
      text: `ירידה ${diff.toFixed(
        1
      )}`,
      trend: "bad",
    };
  }

  return {
    text: "ללא שינוי",
    trend: "neutral",
  };
}

/* =========================================================
   IMPROVED LORAN SCORE
========================================================= */

function calculateImprovedRunningScore(
  runTime?: string
): number | null {
  const seconds =
    parseTimeToSeconds(
      runTime
    );

  if (
    seconds === null
  ) {
    return null;
  }

  const standards = [
    [100, 33 * 60],
    [99, 33 * 60 + 9],
    [98, 33 * 60 + 18],
    [97, 33 * 60 + 27],
    [96, 33 * 60 + 36],
    [95, 33 * 60 + 45],
    [94, 33 * 60 + 56],

    [93, 34 * 60 + 7],
    [92, 34 * 60 + 18],
    [91, 34 * 60 + 29],
    [90, 34 * 60 + 40],

    [89, 34 * 60 + 53],
    [88, 35 * 60 + 6],
    [87, 35 * 60 + 19],
    [86, 35 * 60 + 32],
    [85, 35 * 60 + 45],

    [84, 36 * 60],
    [83, 36 * 60 + 15],
    [82, 36 * 60 + 30],
    [81, 36 * 60 + 45],

    [80, 37 * 60],
    [79, 37 * 60 + 15],
    [78, 37 * 60 + 30],
    [77, 37 * 60 + 45],

    [76, 38 * 60],
    [75, 38 * 60 + 15],
    [74, 38 * 60 + 35],
    [73, 38 * 60 + 55],

    [72, 39 * 60 + 15],
    [71, 39 * 60 + 35],
    [70, 39 * 60 + 59],

    [69, 40 * 60 + 22],
    [68, 40 * 60 + 45],
    [67, 41 * 60 + 8],
    [66, 41 * 60 + 31],
    [65, 41 * 60 + 54],

    [64, 42 * 60 + 17],
    [63, 42 * 60 + 40],
    [62, 43 * 60 + 3],
    [61, 43 * 60 + 26],
    [60, 43 * 60 + 49],

    [59, 44 * 60 + 12],
    [58, 44 * 60 + 35],
    [57, 44 * 60 + 58],

    [56, 45 * 60 + 21],
    [55, 45 * 60 + 44],

    [54, 46 * 60 + 7],
    [53, 46 * 60 + 30],
    [52, 46 * 60 + 53],

    [51, 47 * 60 + 16],
    [50, 47 * 60 + 39],

    [49, 48 * 60 + 2],
    [48, 48 * 60 + 25],
    [47, 48 * 60 + 48],

    [46, 49 * 60 + 11],
    [45, 49 * 60 + 34],
    [44, 49 * 60 + 57],

    [43, 50 * 60 + 20],
    [42, 50 * 60 + 43],
    [41, 51 * 60 + 6],

    [40, 2 * 60 * 60],
  ] as const;

  const match =
    standards.find(
      ([, max]) =>
        seconds <= max
    );

  return match
    ? match[0]
    : null;
}

/* =========================================================
   STORAGE
========================================================= */

function loadCadets(
  battalion: string,
  cycleId?: string | null
): Cadet[] {
  try {
    const key =
      cycleId
        ? getCadetsStorageKey(
            battalion,
            cycleId
          )
        : getLegacyCadetsStorageKey(
            battalion
          );

    const saved =
      localStorage.getItem(
        key
      );

    if (!saved) {
      return [];
    }

    const parsed =
      JSON.parse(
        saved
      ) as Cadet[];

    return parsed.filter(
      (cadet) =>
        Boolean(
          cadet.name?.trim()
        ) &&
        cadet.courseStatus !==
          "הודח"
    );
  } catch {
    return [];
  }
}

function loadResults(
  battalion: string,
  testName: string,
  cycleId?: string | null
): SavedResult[] {
  try {
    const baseKey =
      cycleId
        ? getResultsStorageKey(
            battalion,
            cycleId,
            testName
          )
        : getLegacyResultsStorageKey(
            battalion,
            testName
          );

    const collected:
      SavedResult[] = [];

    /*
      מועד א' נשמר במפתח המקורי.
    */
    const firstAttempt =
      localStorage.getItem(
        baseKey
      );

    if (firstAttempt) {
      try {
        const parsed =
          JSON.parse(
            firstAttempt
          ) as SavedResult[];

        parsed.forEach(
          (row) =>
            collected.push({
              ...row,
              attempt: 1,
            })
        );
      } catch {
        // ממשיכים לנסות מועדים נוספים
      }
    }

    /*
      מועדים ב' ומעלה נשמרים עם:
      -attempt-2, -attempt-3 וכן הלאה.
      סורקים את localStorage כדי לתמוך
      גם במועד ד', ה' ומעלה ללא הגבלה קשיחה.
    */
    const prefix =
      `${baseKey}-attempt-`;

    for (
      let index = 0;
      index < localStorage.length;
      index++
    ) {
      const key =
        localStorage.key(
          index
        );

      if (
        !key ||
        !key.startsWith(
          prefix
        )
      ) {
        continue;
      }

      const attemptText =
        key.slice(
          prefix.length
        );

      const attempt =
        Number(
          attemptText
        );

      if (
        !Number.isFinite(
          attempt
        ) ||
        attempt < 2
      ) {
        continue;
      }

      const saved =
        localStorage.getItem(
          key
        );

      if (!saved) {
        continue;
      }

      try {
        const parsed =
          JSON.parse(
            saved
          ) as SavedResult[];

        parsed.forEach(
          (row) =>
            collected.push({
              ...row,
              attempt,
            })
        );
      } catch {
        // מתעלמים ממפתח פגום בודד
      }
    }

    return collected;
  } catch {
    return [];
  }
}

function getLatestResults(
  rows: SavedResult[]
): SavedResult[] {
  const latest =
    new Map<
      number,
      SavedResult
    >();

  rows.forEach(
    (row) => {
      const current =
        latest.get(
          row.cadetId
        );

      const currentAttempt =
        current?.attempt ??
        1;

      const rowAttempt =
        row.attempt ??
        1;

      if (
        !current ||
        rowAttempt >=
          currentAttempt
      ) {
        latest.set(
          row.cadetId,
          row
        );
      }
    }
  );

  return Array.from(
    latest.values()
  );
}

function getAttemptOverview(
  rows: SavedResult[]
): AttemptOverview[] {
  const counts =
    new Map<
      number,
      Set<number>
    >();

  rows.forEach(
    (row) => {
      const attempt =
        row.attempt ??
        1;

      if (
        !counts.has(
          attempt
        )
      ) {
        counts.set(
          attempt,
          new Set<number>()
        );
      }

      const hasData =
        Boolean(
          row.runTime ||
          row.sprintTime ||
          row.pullUps ||
          row.chestPress ||
          row.trapBar ||
          row.shootingScore
        );

      if (hasData) {
        counts
          .get(
            attempt
          )
          ?.add(
            row.cadetId
          );
      }
    }
  );

  return Array.from(
    counts.entries()
  )
    .sort(
      ([a], [b]) =>
        a - b
    )
    .map(
      ([
        attempt,
        cadetIds,
      ]) => ({
        attempt,
        tested:
          cadetIds.size,
      })
    );
}

function loadBattalion(
  battalion: string,
  cycleId?: string | null
): BattalionDataset {
  const tests =
    getBattalionTests(
      battalion
    );

  const results:
    Record<
      string,
      SavedResult[]
    > = {};

  tests.forEach(
    (test) => {
      results[test.name] =
        loadResults(
          battalion,
          test.name,
          cycleId
        );
    }
  );

  return {
    battalion,

    cadets:
      loadCadets(
        battalion,
        cycleId
      ),

    tests,

    results,
  };
}

/*
  כאשר משווים דקל מול רימון:
  קודם מנסים למצוא בגדוד המקביל מחזור בעל אותו שם.
  אם אין כזה, משתמשים במחזור שנבחר כרגע בגדוד המקביל.
*/
function getParallelCycle(
  currentCycle: CourseCycle | null,
  parallelBattalion: string
): CourseCycle | null {
  if (currentCycle) {
    const sameName =
      getCyclesByBattalion(
        parallelBattalion
      ).find(
        (cycle) =>
          cycle.name ===
          currentCycle.name
      );

    if (sameName) {
      return sameName;
    }
  }

  return getActiveCycle(
    parallelBattalion
  );
}

/* =========================================================
   TEST HELPERS
========================================================= */

function getCadetResult(
  dataset: BattalionDataset,
  testName: string,
  cadetId: number
) {
  const rows =
    dataset.results[
      testName
    ] ?? [];

  const matching =
    rows
      .filter(
        (result) =>
          result.cadetId ===
          cadetId
      )
      .sort(
        (a, b) =>
          (b.attempt ?? 1) -
          (a.attempt ?? 1)
      );

  return (
    matching[0] ??
    null
  );
}

function getFitnessTest(
  dataset: BattalionDataset,
  stage:
    | "פתיחה"
    | "סוף"
) {
  return dataset.tests.find(
    (test) =>
      test.type ===
        "fitness" &&
      test.name.includes(
        stage
      )
  );
}

function getImprovedTest(
  dataset: BattalionDataset
) {
  return dataset.tests.find(
    (test) =>
      test.type ===
      "improved-loran"
  );
}

function getShootingThreshold(
  cadet: Cadet
) {
  return toNumber(
    cadet.shootingLevel
  );
}

function getRunThreshold(
  test: BattalionTest,
  cadet: Cadet
) {
  if (
    test.type ===
    "loran"
  ) {
    return getRegularLoranPassingTime(
      cadet.loranPopulation ??
        ""
    );
  }

  if (
    test.type ===
      "improved-loran" ||
    test.type === "mm"
  ) {
    return (
      39 * 60 +
      59
    );
  }

  return null;
}

function getRunningScore(
  test: BattalionTest,
  row: SavedResult,
  cadet: Cadet
) {
  if (
    test.type ===
    "loran"
  ) {
    return calculateRegularLoranRunningScore(
      row.runTime ?? "",
      cadet.loranPopulation ??
        ""
    );
  }

  if (
    test.type ===
      "improved-loran" ||
    test.type === "mm"
  ) {
    return calculateImprovedRunningScore(
      row.runTime
    );
  }

  return null;
}

/* =========================================================
   OVERALL TEST STATUS
   95+ = מצטיין
========================================================= */

function score3Km(
  value?: string
): number | null {
  const seconds =
    parseTimeToSeconds(
      value
    );

  if (
    seconds === null
  ) {
    return null;
  }

  const bands: Array<
    [number, number]
  > = [
    [10 * 60 + 57, 100],
    [11 * 60 + 3, 99],
    [11 * 60 + 9, 98],
    [11 * 60 + 15, 97],
    [11 * 60 + 20, 96],
    [11 * 60 + 25, 95],
    [11 * 60 + 30, 94],
    [11 * 60 + 35, 93],
    [11 * 60 + 40, 92],
    [11 * 60 + 45, 91],
    [11 * 60 + 50, 90],
    [11 * 60 + 55, 89],
    [12 * 60, 88],
    [12 * 60 + 5, 87],
    [12 * 60 + 10, 86],
    [12 * 60 + 15, 85],
    [12 * 60 + 20, 84],
    [12 * 60 + 25, 83],
    [12 * 60 + 30, 82],
    [12 * 60 + 35, 81],
    [12 * 60 + 40, 80],
    [12 * 60 + 45, 79],
    [12 * 60 + 50, 78],
    [12 * 60 + 55, 77],
    [13 * 60, 76],
    [13 * 60 + 5, 75],
    [13 * 60 + 10, 74],
    [13 * 60 + 15, 73],
    [13 * 60 + 20, 72],
    [13 * 60 + 25, 71],
    [13 * 60 + 31, 70],
    [13 * 60 + 37, 69],
    [13 * 60 + 42, 68],
    [13 * 60 + 48, 67],
    [13 * 60 + 54, 66],
    [14 * 60, 65],
    [14 * 60 + 5, 64],
    [14 * 60 + 11, 63],
    [14 * 60 + 17, 62],
    [14 * 60 + 23, 61],
    [14 * 60 + 29, 60],
    [14 * 60 + 39, 59],
    [14 * 60 + 49, 58],
    [14 * 60 + 59, 57],
    [15 * 60 + 9, 56],
    [15 * 60 + 20, 55],
    [15 * 60 + 26, 54],
    [15 * 60 + 32, 53],
    [15 * 60 + 39, 52],
    [15 * 60 + 45, 51],
    [15 * 60 + 52, 50],
    [15 * 60 + 59, 49],
    [16 * 60 + 5, 48],
    [16 * 60 + 11, 47],
    [16 * 60 + 18, 46],
    [16 * 60 + 24, 45],
    [16 * 60 + 31, 44],
    [16 * 60 + 37, 43],
    [16 * 60 + 43, 42],
    [16 * 60 + 50, 41],
  ];

  for (
    const [
      maxSeconds,
      score,
    ] of bands
  ) {
    if (
      seconds <=
      maxSeconds
    ) {
      return score;
    }
  }

  return 40;
}

function score150x2(
  value?: string
): number | null {
  const seconds =
    parseTimeToSeconds(
      value
    );

  if (
    seconds === null
  ) {
    return null;
  }

  if (seconds <= 43) return 100;
  if (seconds <= 44) return 95;
  if (seconds <= 46) return 90;
  if (seconds <= 48) return 85;
  if (seconds <= 50) return 80;
  if (seconds <= 53) return 75;
  if (seconds <= 56) return 70;
  if (seconds <= 59) return 65;
  if (seconds <= 61) return 60;
  if (seconds <= 64) return 55;
  if (seconds <= 67) return 50;
  if (seconds <= 70) return 45;

  return 40;
}

function scoreStrength15(
  value?: string
): number | null {
  const reps =
    toNumber(
      value
    );

  if (
    reps === null
  ) {
    return null;
  }

  if (reps >= 15) return 100;
  if (reps === 14) return 95;
  if (reps === 13) return 90;
  if (reps === 12) return 85;
  if (reps === 11) return 80;
  if (reps === 10) return 75;
  if (reps === 9) return 70;
  if (reps === 8) return 65;
  if (reps === 7) return 60;
  if (reps === 6) return 55;
  if (reps === 5) return 50;
  if (reps >= 3) return 45;

  return 40;
}

function scoreDips20(
  value?: string
): number | null {
  const reps =
    toNumber(
      value
    );

  if (
    reps === null
  ) {
    return null;
  }

  if (reps >= 20) return 100;
  if (reps === 19) return 95;
  if (reps === 18) return 90;
  if (reps === 17) return 85;
  if (reps >= 15) return 80;
  if (reps >= 13) return 75;
  if (reps >= 11) return 70;
  if (reps >= 9) return 65;
  if (reps >= 7) return 60;
  if (reps >= 5) return 55;
  if (reps >= 3) return 50;
  if (reps === 2) return 45;

  return 40;
}

function scoreTrap10(
  value?: string
): number | null {
  const reps =
    toNumber(
      value
    );

  if (
    reps === null
  ) {
    return null;
  }

  if (reps >= 10) return 100;
  if (reps === 9) return 95;
  if (reps === 8) return 90;
  if (reps === 7) return 80;
  if (reps === 6) return 70;
  if (reps === 5) return 60;
  if (reps === 4) return 50;
  if (reps === 3) return 40;
  if (reps === 2) return 30;

  return 20;
}

function calculateFitnessScore(
  battalion: string,
  cadet: Cadet,
  row: SavedResult
): number | null {
  const run =
    score3Km(
      row.runTime
    );

  const sprint =
    score150x2(
      row.sprintTime
    );

  const pull =
    scoreStrength15(
      row.pullUps
    );

  const push =
    cadet.fitnessLevel ===
      "רמה 1"
      ? scoreDips20(
          row.chestPress
        )
      : scoreStrength15(
          row.chestPress
        );

  const trap =
    scoreTrap10(
      row.trapBar
    );

  if (
    battalion !== "גפן" &&
    cadet.fitnessLevel ===
      "רמה 1"
  ) {
    if (
      run === null ||
      pull === null ||
      push === null
    ) {
      return null;
    }

    return Math.round(
      run * 0.6 +
      pull * 0.2 +
      push * 0.2
    );
  }

  if (
    run === null ||
    sprint === null ||
    pull === null ||
    push === null ||
    trap === null
  ) {
    return null;
  }

  return Math.round(
    run * 0.3 +
    sprint * 0.1 +
    pull * 0.2 +
    push * 0.2 +
    trap * 0.2
  );
}

function fitnessMetricStatus(
  battalion: string,
  testName: string,
  cadet: Cadet,
  metric: string,
  value: string | undefined,
  isTime: boolean
) {
  if (
    !value?.trim()
  ) {
    return "טרם";
  }

  const population =
    battalion === "גפן"
      ? undefined
      : cadet.fitnessLevel;

  const standard =
    getStandard(
      2026,
      battalion,
      testName,
      metric,
      population
    );

  const threshold =
    standard?.endThreshold;

  if (
    threshold ===
    undefined
  ) {
    return "טרם";
  }

  if (isTime) {
    const actual =
      parseTimeToSeconds(
        value
      );

    const required =
      parseTimeToSeconds(
        String(
          threshold
        )
      );

    if (
      actual === null ||
      required === null
    ) {
      return "טרם";
    }

    return actual <= required
      ? "עבר"
      : "נכשל";
  }

  const actual =
    Number(
      value
    );

  const required =
    Number(
      threshold
    );

  if (
    Number.isNaN(actual) ||
    Number.isNaN(required)
  ) {
    return "טרם";
  }

  return actual >= required
    ? "עבר"
    : "נכשל";
}

function getFitnessOutcome(
  battalion: string,
  test: BattalionTest,
  cadet: Cadet,
  row: SavedResult
): TestOutcome {
  const pullMetric =
    battalion === "גפן"
      ? 'מתח 15 ק"ג'
      : "מתח";

  const pushMetric =
    battalion === "גפן"
      ? "לחיצת חזה 60 ק״ג"
      : cadet.fitnessLevel ===
        "רמה 1"
      ? "מקבילים"
      : "לחיצת חזה";

  const trapMetric =
    battalion === "גפן"
      ? "טראפבר 90 ק״ג"
      : "טראפבר";

  const statuses = [
    fitnessMetricStatus(
      battalion,
      test.name,
      cadet,
      '3 ק"מ',
      row.runTime,
      true
    ),
    fitnessMetricStatus(
      battalion,
      test.name,
      cadet,
      "2×150",
      row.sprintTime,
      true
    ),
    fitnessMetricStatus(
      battalion,
      test.name,
      cadet,
      pullMetric,
      row.pullUps,
      false
    ),
    fitnessMetricStatus(
      battalion,
      test.name,
      cadet,
      pushMetric,
      row.chestPress,
      false
    ),
    fitnessMetricStatus(
      battalion,
      test.name,
      cadet,
      trapMetric,
      row.trapBar,
      false
    ),
  ];

  const hasAll =
    Boolean(
      row.runTime &&
      row.sprintTime &&
      row.pullUps &&
      row.chestPress &&
      row.trapBar
    );

  if (!hasAll) {
    return {
      status:
        "טרם בוצע",
      finalScore:
        null,
    };
  }

  if (
    statuses.includes(
      "נכשל"
    )
  ) {
    return {
      status:
        "נכשל",
      finalScore:
        calculateFitnessScore(
          battalion,
          cadet,
          row
        ),
    };
  }

  const finalScore =
    calculateFitnessScore(
      battalion,
      cadet,
      row
    );

  if (
    finalScore === null
  ) {
    return {
      status:
        "טרם בוצע",
      finalScore:
        null,
    };
  }

  return {
    status:
      finalScore >= 95
        ? "מצטיין"
        : "עבר",

    finalScore,
  };
}

function getLoranOutcome(
  test: BattalionTest,
  cadet: Cadet,
  row: SavedResult
): TestOutcome {
  const run =
    parseTimeToSeconds(
      row.runTime
    );

  const shooting =
    toNumber(
      row.shootingScore
    );

  const runThreshold =
    getRunThreshold(
      test,
      cadet
    );

  const shootingThreshold =
    getShootingThreshold(
      cadet
    );

  if (
    run === null ||
    shooting === null ||
    runThreshold === null ||
    shootingThreshold === null
  ) {
    return {
      status:
        "טרם בוצע",
      finalScore:
        null,
    };
  }

  if (
    run >
      runThreshold ||
    shooting <
      shootingThreshold
  ) {
    const runningScore =
      getRunningScore(
        test,
        row,
        cadet
      );

    return {
      status:
        "נכשל",
      finalScore:
        runningScore !==
        null
          ? Math.round(
              runningScore *
                0.7 +
              shooting *
                0.3
            )
          : null,
    };
  }

  const runningScore =
    getRunningScore(
      test,
      row,
      cadet
    );

  const finalScore =
    runningScore !== null
      ? Math.round(
          runningScore *
            0.7 +
          shooting *
            0.3
        )
      : null;

  if (
    finalScore === null
  ) {
    return {
      status:
        "טרם בוצע",
      finalScore:
        null,
    };
  }

  return {
    status:
      finalScore >= 95
        ? "מצטיין"
        : "עבר",
    finalScore,
  };
}

function getTestOutcome(
  dataset: BattalionDataset,
  test: BattalionTest,
  cadet: Cadet
): TestOutcome {
  const row =
    getCadetResult(
      dataset,
      test.name,
      cadet.id
    );

  if (!row) {
    return {
      status:
        "טרם בוצע",
      finalScore:
        null,
    };
  }

  if (
    test.type ===
      "fitness"
  ) {
    return getFitnessOutcome(
      dataset.battalion,
      test,
      cadet,
      row
    );
  }

  if (
    test.type ===
      "loran" ||
    test.type ===
      "improved-loran" ||
    test.type === "mm"
  ) {
    return getLoranOutcome(
      test,
      cadet,
      row
    );
  }

  return {
    status:
      "טרם בוצע",
    finalScore:
      null,
  };
}

function buildLastTestSnapshot(
  dataset: BattalionDataset
): LastTestSnapshot {
  const test =
    [...dataset.tests]
      .sort(
        (a, b) =>
          b.order -
          a.order
      )[0] ??
    null;

  if (!test) {
    return {
      test: null,
      tested: 0,
      passed: 0,
      excellent: 0,
      failed: 0,
      passRate: 0,
    };
  }

  let tested = 0;
  let passed = 0;
  let excellent = 0;
  let failed = 0;

  dataset.cadets.forEach(
    (cadet) => {
      const outcome =
        getTestOutcome(
          dataset,
          test,
          cadet
        );

      if (
        outcome.status ===
        "טרם בוצע"
      ) {
        return;
      }

      tested++;

      if (
        outcome.status ===
        "מצטיין"
      ) {
        excellent++;
        passed++;
      } else if (
        outcome.status ===
        "עבר"
      ) {
        passed++;
      } else if (
        outcome.status ===
        "נכשל"
      ) {
        failed++;
      }
    }
  );

  return {
    test,
    tested,
    passed,
    excellent,
    failed,
    passRate:
      percent(
        passed,
        tested
      ),
  };
}

/* =========================================================
   FITNESS SUMMARY
========================================================= */

function summarizeMetric(
  values: number[],
  lowerIsBetter = false
): NumericMetric {
  return {
    average:
      average(
        values
      ),

    count:
      values.length,

    best:
      values.length
        ? lowerIsBetter
          ? minValue(
              values
            )
          : maxValue(
              values
            )
        : null,

    worst:
      values.length
        ? lowerIsBetter
          ? maxValue(
              values
            )
          : minValue(
              values
            )
        : null,
  };
}

function summarizeFitness(
  dataset: BattalionDataset,
  testName: string
): FitnessSummary {
  const rows =
    getLatestResults(
      dataset.results[
        testName
      ] ?? []
    );

  const valid =
    rows.filter(
      (row) =>
        Boolean(
          row.runTime ||
          row.sprintTime ||
          row.pullUps ||
          row.chestPress ||
          row.trapBar
        )
    );

  const run =
    valid
      .map((row) =>
        parseTimeToSeconds(
          row.runTime
        )
      )
      .filter(
        (
          value
        ): value is number =>
          value !== null
      );

  const sprint =
    valid
      .map((row) =>
        parseTimeToSeconds(
          row.sprintTime
        )
      )
      .filter(
        (
          value
        ): value is number =>
          value !== null
      );

  const pull =
    valid
      .map((row) =>
        toNumber(
          row.pullUps
        )
      )
      .filter(
        (
          value
        ): value is number =>
          value !== null
      );

  const chest =
    valid
      .map((row) =>
        toNumber(
          row.chestPress
        )
      )
      .filter(
        (
          value
        ): value is number =>
          value !== null
      );

  const trap =
    valid
      .map((row) =>
        toNumber(
          row.trapBar
        )
      )
      .filter(
        (
          value
        ): value is number =>
          value !== null
      );

  return {
    tested:
      valid.length,

    run:
      summarizeMetric(
        run,
        true
      ),

    sprint:
      summarizeMetric(
        sprint,
        true
      ),

    pullUps:
      summarizeMetric(
        pull
      ),

    chestPress:
      summarizeMetric(
        chest
      ),

    trapBar:
      summarizeMetric(
        trap
      ),
  };
}

/* =========================================================
   LORAN SUMMARY
========================================================= */

function summarizeLoran(
  dataset: BattalionDataset,
  test: BattalionTest
): LoranSummary {
  const rows =
    getLatestResults(
      dataset.results[
        test.name
      ] ?? []
    );

  const runTimes:
    number[] = [];

  const runningScores:
    number[] = [];

  const shootings:
    number[] = [];

  const runningWeighted:
    number[] = [];

  const shootingWeighted:
    number[] = [];

  const finalScores:
    number[] = [];

  let runPassed = 0;
  let runFailed = 0;

  let shootingPassed =
    0;

  let shootingFailed =
    0;

  let fullPassed = 0;

  const testedIds =
    new Set<number>();

  rows.forEach(
    (row) => {
      const cadet =
        dataset.cadets.find(
          (item) =>
            item.id ===
            row.cadetId
        );

      if (!cadet) {
        return;
      }

      const run =
        parseTimeToSeconds(
          row.runTime
        );

      const shooting =
        toNumber(
          row.shootingScore
        );

      if (
        run === null &&
        shooting === null
      ) {
        return;
      }

      testedIds.add(
        cadet.id
      );

      const runThreshold =
        getRunThreshold(
          test,
          cadet
        );

      const shootingThreshold =
        getShootingThreshold(
          cadet
        );

      let passedRun =
        false;

      let passedShooting =
        false;

      if (
        run !== null
      ) {
        runTimes.push(
          run
        );

        if (
          runThreshold !==
          null
        ) {
          if (
            run <=
            runThreshold
          ) {
            runPassed++;
            passedRun =
              true;
          } else {
            runFailed++;
          }
        }
      }

      const runningScore =
        getRunningScore(
          test,
          row,
          cadet
        );

      if (
        runningScore !==
        null
      ) {
        runningScores.push(
          runningScore
        );

        runningWeighted.push(
          runningScore *
            0.7
        );
      }

      if (
        shooting !==
        null
      ) {
        shootings.push(
          shooting
        );

        shootingWeighted.push(
          shooting *
            0.3
        );

        if (
          shootingThreshold !==
          null
        ) {
          if (
            shooting >=
            shootingThreshold
          ) {
            shootingPassed++;
            passedShooting =
              true;
          } else {
            shootingFailed++;
          }
        }
      }

      if (
        runningScore !==
          null &&
        shooting !==
          null
      ) {
        finalScores.push(
          runningScore *
            0.7 +
            shooting *
              0.3
        );
      }

      if (
        passedRun &&
        passedShooting
      ) {
        fullPassed++;
      }
    }
  );

  const runTotal =
    runPassed +
    runFailed;

  const shootingTotal =
    shootingPassed +
    shootingFailed;

  return {
    tested:
      testedIds.size,

    averageRunSeconds:
      average(
        runTimes
      ),

    bestRunSeconds:
      minValue(
        runTimes
      ),

    worstRunSeconds:
      maxValue(
        runTimes
      ),

    averageRunningScore:
      average(
        runningScores
      ),

    averageShooting:
      average(
        shootings
      ),

    bestShooting:
      maxValue(
        shootings
      ),

    worstShooting:
      minValue(
        shootings
      ),

    averageRunningWeighted:
      average(
        runningWeighted
      ),

    averageShootingWeighted:
      average(
        shootingWeighted
      ),

    averageFinalScore:
      average(
        finalScores
      ),

    runCount:
      runTimes.length,

    shootingCount:
      shootings.length,

    runPassed,
    runFailed,

    shootingPassed,
    shootingFailed,

    fullPassed,

    runPassRate:
      percent(
        runPassed,
        runTotal
      ),

    shootingPassRate:
      percent(
        shootingPassed,
        shootingTotal
      ),
  };
}

/* =========================================================
   PARALLEL
========================================================= */

function getParallelBattalion(
  battalion: string
) {
  if (
    battalion === "דקל"
  ) {
    return "רימון";
  }

  if (
    battalion === "רימון"
  ) {
    return "דקל";
  }

  return null;
}

/* =========================================================
   GEFEN
========================================================= */

function buildGefenComparisons(
  gefen: BattalionDataset,
  dekel: BattalionDataset,
  rimon: BattalionDataset
): GefenCadetComparison[] {
  const gefenFitness =
    getFitnessTest(
      gefen,
      "סוף"
    );

  const gefenLoran =
    getImprovedTest(
      gefen
    );

  const dekelFitness =
    getFitnessTest(
      dekel,
      "סוף"
    );

  const rimonFitness =
    getFitnessTest(
      rimon,
      "סוף"
    );

  const dekelLoran =
    getImprovedTest(
      dekel
    );

  const rimonLoran =
    getImprovedTest(
      rimon
    );

  return gefen.cadets.map(
    (gefenCadet) => {
      const dekelCadet =
        gefenCadet.globalId
          ? dekel.cadets.find(
              (cadet) =>
                cadet.globalId ===
                gefenCadet.globalId
            )
          : undefined;

      const rimonCadet =
        gefenCadet.globalId
          ? rimon.cadets.find(
              (cadet) =>
                cadet.globalId ===
                gefenCadet.globalId
            )
          : undefined;

      const sourceCadet =
        dekelCadet ??
        rimonCadet;

      const sourceDataset =
        dekelCadet
          ? dekel
          : rimonCadet
          ? rimon
          : null;

      const sourceFitness =
        dekelCadet
          ? dekelFitness
          : rimonCadet
          ? rimonFitness
          : undefined;

      const sourceLoran =
        dekelCadet
          ? dekelLoran
          : rimonCadet
          ? rimonLoran
          : undefined;

      return {
        globalId:
          gefenCadet.globalId ??
          `legacy-${gefenCadet.id}`,

        gefenCadetId:
          gefenCadet.id,

        name:
          gefenCadet.name,

        sourceBattalion:
          sourceDataset?.battalion ??
          gefenCadet.previousBattalion ??
          "לא זוהה",

        sourceFitness:
          sourceCadet &&
          sourceDataset &&
          sourceFitness
            ? getCadetResult(
                sourceDataset,
                sourceFitness.name,
                sourceCadet.id
              )
            : null,

        gefenFitness:
          gefenFitness
            ? getCadetResult(
                gefen,
                gefenFitness.name,
                gefenCadet.id
              )
            : null,

        sourceLoran:
          sourceCadet &&
          sourceDataset &&
          sourceLoran
            ? getCadetResult(
                sourceDataset,
                sourceLoran.name,
                sourceCadet.id
              )
            : null,

        gefenLoran:
          gefenLoran
            ? getCadetResult(
                gefen,
                gefenLoran.name,
                gefenCadet.id
              )
            : null,
      };
    }
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function SummaryPage() {
  const params =
    useParams<{
      name: string;
    }>();

  const battalionName =
    decodeURIComponent(
      params.name
    );

  const [
    selectedCycle,
    setSelectedCycle,
  ] =
    useState<CourseCycle | null>(
      null
    );

  const [
    parallelCycle,
    setParallelCycle,
  ] =
    useState<CourseCycle | null>(
      null
    );

  const [
    current,
    setCurrent,
  ] =
    useState<BattalionDataset | null>(
      null
    );

  const [
    parallel,
    setParallel,
  ] =
    useState<BattalionDataset | null>(
      null
    );

  const [
    dekel,
    setDekel,
  ] =
    useState<BattalionDataset | null>(
      null
    );

  const [
    rimon,
    setRimon,
  ] =
    useState<BattalionDataset | null>(
      null
    );

  const [
    selectedComparison,
    setSelectedComparison,
  ] =
    useState<
      | "כללי"
      | "ריצה"
      | "כוח"
      | "לורן"
      | "ירי"
    >("כללי");

  const [
    drill,
    setDrill,
  ] =
    useState<DrillState>({
      open: false,
      title: "",
      subtitle: "",
      rows: [],
    });

  /* =======================================================
     LOAD
  ======================================================= */

  useEffect(() => {
    const currentCycle =
      getActiveCycle(
        battalionName
      );

    setSelectedCycle(
      currentCycle
    );

    setCurrent(
      loadBattalion(
        battalionName,
        currentCycle?.id
      )
    );

    const parallelName =
      getParallelBattalion(
        battalionName
      );

    if (
      parallelName
    ) {
      const matchedParallelCycle =
        getParallelCycle(
          currentCycle,
          parallelName
        );

      setParallelCycle(
        matchedParallelCycle
      );

      setParallel(
        loadBattalion(
          parallelName,
          matchedParallelCycle?.id
        )
      );
    } else {
      setParallelCycle(
        null
      );

      setParallel(
        null
      );
    }

    if (
      battalionName ===
      "גפן"
    ) {
      /*
        בגפן לא משתמשים במחזור הפעיל הכללי
        של דקל/רימון, אלא במחזורי המקור
        שנבחרו בזמן פתיחת מחזור גפן.
      */

      const dekelSourceId =
        currentCycle
          ?.sourceCycles
          ?.dekel;

      const rimonSourceId =
        currentCycle
          ?.sourceCycles
          ?.rimon;

      setDekel(
        loadBattalion(
          "דקל",
          dekelSourceId
        )
      );

      setRimon(
        loadBattalion(
          "רימון",
          rimonSourceId
        )
      );
    } else {
      setDekel(
        null
      );

      setRimon(
        null
      );
    }
  }, [
    battalionName,
  ]);

  /* =======================================================
     TEST SUMMARIES
  ======================================================= */

  const openingTest =
    current
      ? getFitnessTest(
          current,
          "פתיחה"
        )
      : undefined;

  const finalTest =
    current
      ? getFitnessTest(
          current,
          "סוף"
        )
      : undefined;

  const openingSummary =
    useMemo(() => {
      if (
        !current ||
        !openingTest
      ) {
        return null;
      }

      return summarizeFitness(
        current,
        openingTest.name
      );
    }, [
      current,
      openingTest,
    ]);

  const finalSummary =
    useMemo(() => {
      if (
        !current ||
        !finalTest
      ) {
        return null;
      }

      return summarizeFitness(
        current,
        finalTest.name
      );
    }, [
      current,
      finalTest,
    ]);

  const loranSummaries =
    useMemo(() => {
      if (!current) {
        return [];
      }

      return current.tests
        .filter(
          (test) =>
            test.type ===
              "loran" ||
            test.type ===
              "improved-loran" ||
            test.type ===
              "mm"
        )
        .map(
          (test) => ({
            test,

            summary:
              summarizeLoran(
                current,
                test
              ),
          })
        );
    }, [
      current,
    ]);

  const currentImproved =
    useMemo(() => {
      if (!current) {
        return null;
      }

      const test =
        getImprovedTest(
          current
        );

      if (!test) {
        return null;
      }

      return summarizeLoran(
        current,
        test
      );
    }, [
      current,
    ]);
    
    const currentMM =
  useMemo(() => {
    if (!current) {
      return null;
    }

    const test =
      current.tests.find(
        (item) =>
          item.type === "mm"
      );

    if (!test) {
      return null;
    }

    return {
      test,
      summary:
        summarizeLoran(
          current,
          test
        ),
    };
  }, [
    current,
  ]);
  const lastTestSnapshot =
    useMemo(() => {
      if (!current) {
        return {
          test: null,
          tested: 0,
          passed: 0,
          excellent: 0,
          failed: 0,
          passRate: 0,
        };
      }

      return buildLastTestSnapshot(
        current
      );
    }, [
      current,
    ]);

  const attemptOverview =
    useMemo(() => {
      if (!current) {
        return [];
      }

      return current.tests.map(
        (test) => ({
          test,
          attempts:
            getAttemptOverview(
              current.results[
                test.name
              ] ?? []
            ),
        })
      );
    }, [
      current,
    ]);

const parallelOpening =
  useMemo(() => {
    if (!parallel) {
      return null;
    }

    const test =
      getFitnessTest(
        parallel,
        "פתיחה"
      );

    if (!test) {
      return null;
    }

    return summarizeFitness(
      parallel,
      test.name
    );
  }, [
    parallel,
  ]);
  const parallelFinal =
    useMemo(() => {
      if (!parallel) {
        return null;
      }

      const test =
        getFitnessTest(
          parallel,
          "סוף"
        );

      if (!test) {
        return null;
      }

      return summarizeFitness(
        parallel,
        test.name
      );
    }, [
      parallel,
    ]);

  const parallelImproved =
    useMemo(() => {
      if (!parallel) {
        return null;
      }

      const test =
        getImprovedTest(
          parallel
        );

      if (!test) {
        return null;
      }

      return summarizeLoran(
        parallel,
        test
      );
    }, [
      parallel,
    ]);

  /* =======================================================
     GEFEN
  ======================================================= */

  const gefenComparisons =
    useMemo(() => {
      if (
        battalionName !==
          "גפן" ||
        !current ||
        !dekel ||
        !rimon
      ) {
        return [];
      }

      return buildGefenComparisons(
        current,
        dekel,
        rimon
      );
    }, [
      battalionName,
      current,
      dekel,
      rimon,
    ]);

  const matchedGefen =
    gefenComparisons.filter(
      (item) =>
        item.sourceBattalion ===
          "דקל" ||
        item.sourceBattalion ===
          "רימון"
    );

  const dekelGraduates =
    matchedGefen.filter(
      (item) =>
        item.sourceBattalion ===
        "דקל"
    );

  const rimonGraduates =
    matchedGefen.filter(
      (item) =>
        item.sourceBattalion ===
        "רימון"
    );

  const gefenAverages =
    useMemo(() => {
      const beforeRun:
        number[] = [];

      const duringRun:
        number[] = [];
const beforeSprint:
  number[] = [];

const duringSprint:
  number[] = [];
      const beforePull:
        number[] = [];

      const duringPull:
        number[] = [];
const beforeChest:
  number[] = [];

const duringChest:
  number[] = [];
      const beforeTrap:
        number[] = [];

      const duringTrap:
        number[] = [];

      const beforeLoran:
        number[] = [];

      const duringLoran:
        number[] = [];

      const beforeShooting:
        number[] = [];

      const duringShooting:
        number[] = [];

      gefenComparisons.forEach(
        (item) => {
          const oldRun =
            parseTimeToSeconds(
              item.sourceFitness
                ?.runTime
            );

          const newRun =
            parseTimeToSeconds(
              item.gefenFitness
                ?.runTime
            );

          if (
            oldRun !== null &&
            newRun !== null
          ) {
            beforeRun.push(
              oldRun
            );

            duringRun.push(
              newRun
            );
          }
const oldSprint =
  parseTimeToSeconds(
    item.sourceFitness
      ?.sprintTime
  );

const newSprint =
  parseTimeToSeconds(
    item.gefenFitness
      ?.sprintTime
  );

if (
  oldSprint !== null &&
  newSprint !== null
) {
  beforeSprint.push(
    oldSprint
  );

  duringSprint.push(
    newSprint
  );
}
          const oldPull =
            toNumber(
              item.sourceFitness
                ?.pullUps
            );

          const newPull =
            toNumber(
              item.gefenFitness
                ?.pullUps
            );

          if (
            oldPull !== null &&
            newPull !== null
          ) {
            beforePull.push(
              oldPull
            );

            duringPull.push(
              newPull
            );
          }
const oldChest =
  toNumber(
    item.sourceFitness
      ?.chestPress
  );

const newChest =
  toNumber(
    item.gefenFitness
      ?.chestPress
  );

if (
  oldChest !== null &&
  newChest !== null
) {
  beforeChest.push(
    oldChest
  );

  duringChest.push(
    newChest
  );
}
          const oldTrap =
            toNumber(
              item.sourceFitness
                ?.trapBar
            );

          const newTrap =
            toNumber(
              item.gefenFitness
                ?.trapBar
            );

          if (
            oldTrap !== null &&
            newTrap !== null
          ) {
            beforeTrap.push(
              oldTrap
            );

            duringTrap.push(
              newTrap
            );
          }

          const oldLoran =
            parseTimeToSeconds(
              item.sourceLoran
                ?.runTime
            );

          const newLoran =
            parseTimeToSeconds(
              item.gefenLoran
                ?.runTime
            );

          if (
            oldLoran !== null &&
            newLoran !== null
          ) {
            beforeLoran.push(
              oldLoran
            );

            duringLoran.push(
              newLoran
            );
          }

          const oldShooting =
            toNumber(
              item.sourceLoran
                ?.shootingScore
            );

          const newShooting =
            toNumber(
              item.gefenLoran
                ?.shootingScore
            );

          if (
            oldShooting !==
              null &&
            newShooting !==
              null
          ) {
            beforeShooting.push(
              oldShooting
            );

            duringShooting.push(
              newShooting
            );
          }
        }
      );

      return {
        run: {
          before:
            average(
              beforeRun
            ),

          during:
            average(
              duringRun
            ),

          n:
            beforeRun.length,
        },
sprint: {
  before:
    average(
      beforeSprint
    ),

  during:
    average(
      duringSprint
    ),

  n:
    beforeSprint.length,
},
        pull: {
          before:
            average(
              beforePull
            ),

          during:
            average(
              duringPull
            ),

          n:
            beforePull.length,
        },

        chest: {
          before:
            average(
              beforeChest
            ),

          during:
            average(
              duringChest
            ),

          n:
            beforeChest.length,
        },

        trap: {
          before:
            average(
              beforeTrap
            ),

          during:
            average(
              duringTrap
            ),

          n:
            beforeTrap.length,
        },

        loran: {
          before:
            average(
              beforeLoran
            ),

          during:
            average(
              duringLoran
            ),

          n:
            beforeLoran.length,
        },

        shooting: {
          before:
            average(
              beforeShooting
            ),

          during:
            average(
              duringShooting
            ),

          n:
            beforeShooting.length,
        },
      };
    }, [
      gefenComparisons,
    ]);

  /* =======================================================
     RISK
  ======================================================= */

  const riskRows =
    useMemo(() => {
      if (!current) {
        return [];
      }

      const map =
        new Map<
          number,
          DrillRow
        >();

      loranSummaries.forEach(
        ({
          test,
        }) => {
          const rows =
            current.results[
              test.name
            ] ?? [];

          rows.forEach(
            (row) => {
              const cadet =
                current.cadets.find(
                  (item) =>
                    item.id ===
                    row.cadetId
                );

              if (!cadet) {
                return;
              }

              const run =
                parseTimeToSeconds(
                  row.runTime
                );

              const runThreshold =
                getRunThreshold(
                  test,
                  cadet
                );

              const shooting =
                toNumber(
                  row.shootingScore
                );

              const shootingThreshold =
                getShootingThreshold(
                  cadet
                );

              const reasons:
                string[] = [];

              if (
                run !== null &&
                runThreshold !==
                  null &&
                run >
                  runThreshold
              ) {
                reasons.push(
                  `${test.name}: נכשל בריצה`
                );
              }

              if (
                shooting !==
                  null &&
                shootingThreshold !==
                  null &&
                shooting <
                  shootingThreshold
              ) {
                reasons.push(
                  `${test.name}: נכשל בירי`
                );
              }

              if (
                reasons.length
              ) {
                const previous =
                  map.get(
                    cadet.id
                  );

                map.set(
                  cadet.id,
                  {
                    cadetId:
                      cadet.id,

                    name:
                      cadet.name,

                    result:
                      previous
                        ? previous.result
                        : "דורש מעקב",

                    status:
                      "דורש התייחסות",

                    detail: [
                      previous?.detail,
                      ...reasons,
                    ]
                      .filter(
                        Boolean
                      )
                      .join(
                        " • "
                      ),
                  }
                );
              }
            }
          );
        }
      );

      return Array.from(
        map.values()
      );
    }, [
      current,
      loranSummaries,
    ]);

  const riskCount =
    riskRows.length;

  /* =======================================================
     DRILL DOWN
  ======================================================= */

  function openFitnessDrill(
    title: string,
    field:
      | "runTime"
      | "sprintTime"
      | "pullUps"
      | "chestPress"
      | "trapBar",
    isTime: boolean,
    lowerIsBetter: boolean
  ) {
    if (
      !current ||
      !finalTest
    ) {
      return;
    }

    const results =
      current.results[
        finalTest.name
      ] ?? [];

    const rows:
      DrillRow[] = [];

    current.cadets.forEach(
      (cadet) => {
        const result =
          results.find(
            (item) =>
              item.cadetId ===
              cadet.id
          );

        const raw =
          result?.[field];

        if (
          !raw?.trim()
        ) {
          return;
        }

        const numeric =
          isTime
            ? parseTimeToSeconds(
                raw
              )
            : toNumber(
                raw
              );

        if (
          numeric === null
        ) {
          return;
        }

        rows.push({
          cadetId:
            cadet.id,

          name:
            cadet.name,

          result:
            isTime
              ? formatSeconds(
                  numeric
                )
              : numeric.toString(),

          sortValue:
            numeric,
        });
      }
    );

    rows.sort(
      (a, b) => {
        const first =
          a.sortValue ?? 0;

        const second =
          b.sortValue ?? 0;

        return lowerIsBetter
          ? first - second
          : second - first;
      }
    );

    setDrill({
      open: true,

      title,

      subtitle: `${finalTest.name} • ${rows.length} צוערים עם נתון`,

      rows,
    });
  }

  function openLoranDrill(
    test: BattalionTest,
    mode:
      | "run"
      | "shooting"
      | "run-pass"
      | "shooting-pass"
      | "run-fail"
      | "shooting-fail"
  ) {
    if (!current) {
      return;
    }

    const results =
      current.results[
        test.name
      ] ?? [];

    const rows:
      DrillRow[] = [];

    current.cadets.forEach(
      (cadet) => {
        const result =
          results.find(
            (item) =>
              item.cadetId ===
              cadet.id
          );

        if (!result) {
          return;
        }

        const run =
          parseTimeToSeconds(
            result.runTime
          );

        const runThreshold =
          getRunThreshold(
            test,
            cadet
          );

        const shooting =
          toNumber(
            result.shootingScore
          );

        const shootingThreshold =
          getShootingThreshold(
            cadet
          );

        if (
          mode === "run" &&
          run !== null
        ) {
          rows.push({
            cadetId:
              cadet.id,

            name:
              cadet.name,

            result:
              formatSeconds(
                run
              ),

            threshold:
              formatSeconds(
                runThreshold
              ),

            status:
              runThreshold ===
              null
                ? "חסר סף"
                : run <=
                  runThreshold
                ? "עבר"
                : "נכשל",

            sortValue:
              run,
          });
        }

        if (
          mode ===
            "shooting" &&
          shooting !== null
        ) {
          rows.push({
            cadetId:
              cadet.id,

            name:
              cadet.name,

            result:
              shooting.toFixed(
                1
              ),

            threshold:
              shootingThreshold?.toString() ??
              "חסר",

            status:
              shootingThreshold ===
              null
                ? "חסר סף"
                : shooting >=
                  shootingThreshold
                ? "עבר"
                : "נכשל",

            sortValue:
              shooting,
          });
        }

        if (
          mode ===
            "run-pass" &&
          run !== null &&
          runThreshold !==
            null &&
          run <=
            runThreshold
        ) {
          rows.push({
            cadetId:
              cadet.id,

            name:
              cadet.name,

            result:
              formatSeconds(
                run
              ),

            threshold:
              formatSeconds(
                runThreshold
              ),

            status:
              "עבר",

            sortValue:
              run,
          });
        }

        if (
          mode ===
            "run-fail" &&
          run !== null &&
          runThreshold !==
            null &&
          run >
            runThreshold
        ) {
          rows.push({
            cadetId:
              cadet.id,

            name:
              cadet.name,

            result:
              formatSeconds(
                run
              ),

            threshold:
              formatSeconds(
                runThreshold
              ),

            status:
              "נכשל",

            detail:
              `פער ${formatSeconds(
                run -
                  runThreshold
              )} מהסף`,

            sortValue:
              run -
              runThreshold,
          });
        }

        if (
          mode ===
            "shooting-pass" &&
          shooting !== null &&
          shootingThreshold !==
            null &&
          shooting >=
            shootingThreshold
        ) {
          rows.push({
            cadetId:
              cadet.id,

            name:
              cadet.name,

            result:
              shooting.toString(),

            threshold:
              shootingThreshold.toString(),

            status:
              "עבר",

            sortValue:
              shooting,
          });
        }

        if (
          mode ===
            "shooting-fail" &&
          shooting !== null &&
          shootingThreshold !==
            null &&
          shooting <
            shootingThreshold
        ) {
          rows.push({
            cadetId:
              cadet.id,

            name:
              cadet.name,

            result:
              shooting.toString(),

            threshold:
              shootingThreshold.toString(),

            status:
              "נכשל",

            detail:
              `חסרות ${(
                shootingThreshold -
                shooting
              ).toFixed(
                1
              )} נקודות`,

            sortValue:
              shootingThreshold -
              shooting,
          });
        }
      }
    );

    if (
      mode ===
        "run-fail" ||
      mode ===
        "shooting-fail"
    ) {
      rows.sort(
        (a, b) =>
          (b.sortValue ??
            0) -
          (a.sortValue ??
            0)
      );
    } else if (
      mode ===
        "shooting" ||
      mode ===
        "shooting-pass"
    ) {
      rows.sort(
        (a, b) =>
          (b.sortValue ??
            0) -
          (a.sortValue ??
            0)
      );
    } else {
      rows.sort(
        (a, b) =>
          (a.sortValue ??
            0) -
          (b.sortValue ??
            0)
      );
    }

    const titles: Record<
      typeof mode,
      string
    > = {
      run: `${test.name} – תוצאות ריצה`,
      shooting: `${test.name} – תוצאות ירי`,
      "run-pass": `${test.name} – עברו בריצה`,
      "shooting-pass": `${test.name} – עברו בירי`,
      "run-fail": `${test.name} – נכשלים בריצה`,
      "shooting-fail": `${test.name} – נכשלים בירי`,
    };

    setDrill({
      open: true,

      title:
        titles[mode],

      subtitle:
        `${rows.length} צוערים`,

      rows,
    });
  }

  function openRiskDrill() {
    setDrill({
      open: true,

      title:
        "צוערים דורשים התייחסות",

      subtitle:
        "צוערים שנכשלו בריצה ו/או בירי",

      rows:
        riskRows,
    });
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (!current) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-slate-100 flex items-center justify-center p-4"
      >
        <div className="bg-white rounded-2xl p-6 sm:p-10 shadow-sm">
          טוען נתונים...
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

      <header className="bg-slate-900 text-white px-4 sm:px-6 lg:px-8 py-5 sm:py-7">

        <div className="max-w-[1700px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-5">

          <div>

            <p className="text-slate-400 text-sm">
              CommandFit
            </p>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mt-1">
              סיכום וניתוח גדוד{" "}
              {battalionName}
            </h1>

            <p className="text-slate-300 mt-2">
              תמונת מצב, ממוצעים,
              מגמות, השוואות ומוקדי
              התערבות
            </p>

            <div className="flex flex-wrap items-center gap-2 mt-3 text-sm">
              <span className="bg-white/10 border border-white/10 rounded-lg px-3 py-1.5">
                מחזור:{" "}
                <strong>
                  {selectedCycle?.name ||
                    "נתונים קיימים"}
                </strong>
              </span>

              {selectedCycle && (
                <span
                  className={
                    selectedCycle.status ===
                    "closed"
                      ? "bg-amber-500/20 border border-amber-400/20 text-amber-100 rounded-lg px-3 py-1.5"
                      : "bg-green-500/20 border border-green-400/20 text-green-100 rounded-lg px-3 py-1.5"
                  }
                >
                  {selectedCycle.status ===
                  "closed"
                    ? "🔒 מחזור סגור"
                    : "● מחזור פעיל"}
                </span>
              )}

              {parallel &&
                battalionName !==
                  "גפן" && (
                <span className="text-slate-400">
                  השוואה מול{" "}
                  {parallel.battalion}
                  {parallelCycle
                    ? ` • ${parallelCycle.name}`
                    : ""}
                </span>
              )}
            </div>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full md:w-auto">

            <Link
              href={`/battalions/${encodeURIComponent(
                battalionName
              )}/cycles`}
              className="bg-white text-slate-900 hover:bg-slate-100 px-5 py-3 rounded-xl font-medium text-center"
            >
              🗂️ ניהול מחזורים
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

      <div className="max-w-[1700px] mx-auto p-4 sm:p-6 md:p-8">

        {/* KPI */}

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-8">

          <HeroStat
            title="צוערים פעילים"
            value={
              current.cadets.length
            }
            subtitle="בסגל הגדוד הנוכחי"
          />

          <HeroStat
            title="בחנים במסלול"
            value={
              current.tests.length
            }
            subtitle="לפי מסלול הגדוד"
          />

          <HeroStat
            title="דורשים התייחסות"
            value={
              riskCount
            }
            subtitle="לחץ לצפייה בצוערים"
            warning={
              riskCount > 0
            }
            clickable
            onClick={
              openRiskDrill
            }
          />

          <HeroStat
            title="נתוני השוואה"
            value={
              battalionName ===
              "גפן"
                ? matchedGefen.length
                : parallel
                ? "פעיל"
                : "—"
            }
            subtitle={
              battalionName ===
              "גפן"
                ? "צוערים שזוהו מהשלב הקודם"
                : parallel
                ? `מול גדוד ${parallel.battalion}`
                : "אין גדוד מקביל"
            }
          />

        </section>

        {/* COMMAND SNAPSHOT */}

        <section className="bg-white rounded-3xl shadow-sm p-4 sm:p-6 md:p-8 mb-8">

          <SectionHeader
            title="תמונת מצב בבוחן האחרון"
            subtitle={
              lastTestSnapshot.test
                ? `${lastTestSnapshot.test.name} • לפי המועד האחרון של כל צוער`
                : "טרם הוגדר בוחן"
            }
          />

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mt-6">

            <SnapshotCard
              title="נבחנו"
              value={
                lastTestSnapshot.tested
              }
              tone="neutral"
            />

            <SnapshotCard
              title="עברו"
              value={
                lastTestSnapshot.passed
              }
              tone="success"
            />

            <SnapshotCard
              title="★ מצטיינים"
              value={
                lastTestSnapshot.excellent
              }
              tone="excellent"
              subtitle="ציון סופי 95 ומעלה"
            />

            <SnapshotCard
              title="נכשלו"
              value={
                lastTestSnapshot.failed
              }
              tone="danger"
            />

            <SnapshotCard
              title="אחוז מעבר"
              value={`${lastTestSnapshot.passRate}%`}
              tone="info"
            />

          </div>

        </section>

        {/* ATTEMPTS */}

        <section className="bg-white rounded-3xl shadow-sm p-4 sm:p-6 md:p-8 mb-8">

          <SectionHeader
            title="מועדי בחנים"
            subtitle="כמה צוערים נבחנו בכל מועד – כולל מועד ד׳, ה׳ ומעלה"
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">

            {attemptOverview.map(
              ({
                test,
                attempts,
              }) => (

                <div
                  key={
                    test.id
                  }
                  className="border border-slate-200 rounded-2xl p-4 sm:p-5"
                >

                  <div className="flex items-start justify-between gap-3">

                    <div>
                      <p className="text-xs text-slate-400">
                        בוחן
                      </p>

                      <h3 className="font-bold text-lg mt-1">
                        {test.name}
                      </h3>
                    </div>

                    <Link
                      href={`/battalions/${encodeURIComponent(
                        battalionName
                      )}/tests/${encodeURIComponent(
                        test.name
                      )}`}
                      className="text-blue-700 text-sm font-medium"
                    >
                      פתיחת בוחן ←
                    </Link>

                  </div>

                  {attempts.length ===
                  0 ? (

                    <div className="bg-slate-50 rounded-xl p-4 text-slate-400 text-sm mt-4">
                      טרם הוזנו תוצאות
                    </div>

                  ) : (

                    <div className="flex flex-wrap gap-2 mt-4">

                      {attempts.map(
                        (item) => (

                          <div
                            key={
                              item.attempt
                            }
                            className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-3"
                          >
                            <p className="text-xs text-slate-400">
                              {getAttemptLabelForSummary(
                                item.attempt
                              )}
                            </p>

                            <p className="font-bold text-lg mt-1">
                              {item.tested}
                            </p>

                            <p className="text-[11px] text-slate-400">
                              נבחנו
                            </p>
                          </div>

                        )
                      )}

                    </div>

                  )}

                </div>

              )
            )}

          </div>

        </section>

        {/* JOURNEY */}

        <section className="bg-white rounded-3xl shadow-sm p-4 sm:p-6 md:p-8 mb-8">

          <SectionHeader
            title="מסלול הבחנים"
            subtitle="תמונת התקדמות לאורך הקורס"
          />

          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 mt-7">

            {current.tests.map(
              (
                test,
                index
              ) => {
                const rows =
                  getLatestResults(
                    current.results[
                      test.name
                    ] ?? []
                  );

                const tested =
                  rows.filter(
                    (row) =>
                      Boolean(
                        row.runTime ||
                        row.sprintTime ||
                        row.pullUps ||
                        row.chestPress ||
                        row.trapBar ||
                        row.shootingScore
                      )
                  ).length;

                return (
                  <div
                    key={
                      test.id
                    }
                    className="contents"
                  >

                    <Link
                      href={`/battalions/${encodeURIComponent(
                        battalionName
                      )}/tests/${encodeURIComponent(
                        test.name
                      )}`}
                      className="flex-1 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl p-4 sm:p-5 transition active:scale-[0.99]"
                    >

                      <div className="flex justify-between items-start">

                        <span className="text-xs text-slate-500">
                          שלב{" "}
                          {test.order}
                        </span>

                        <span className="text-xs bg-white border rounded-lg px-2 py-1">
                          {tested} נבחנו
                        </span>

                      </div>

                      <h3 className="font-bold text-lg mt-3">
                        {test.name}
                      </h3>

                      <p className="text-sm text-slate-500 mt-1">
                        {test.description}
                      </p>

                    </Link>

                    {index <
                      current.tests
                        .length -
                        1 && (

                      <div className="hidden lg:block text-slate-300 text-2xl">
                        ←
                      </div>

                    )}

                  </div>
                );
              }
            )}

          </div>

        </section>

        {/* FITNESS */}

        {finalSummary && (

          <section className="bg-white rounded-3xl shadow-sm p-4 sm:p-6 md:p-8 mb-8">

            <SectionHeader
              title="ממוצעי מרכיבי הכש״ג"
              subtitle={
                openingSummary
                  ? "בוחן סוף מול בוחן פתיחה – לחץ על כל מרכיב לפירוט"
                  : "לחץ על כל מרכיב לפירוט הצוערים"
              }
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mt-7">

              <MetricCard
                icon="🏃"
                title='ריצת 3 ק"מ'
                value={
                  formatSeconds(
                    finalSummary
                      .run.average
                  )
                }
                best={
                  formatSeconds(
                    finalSummary
                      .run.best
                  )
                }
                worst={
                  formatSeconds(
                    finalSummary
                      .run.worst
                  )
                }
                count={
                  finalSummary
                    .run.count
                }
                change={
                  openingSummary
                    ? formatDeltaTime(
                        openingSummary
                          .run.average,
                        finalSummary
                          .run.average
                      )
                    : undefined
                }
                onClick={() =>
                  openFitnessDrill(
                    'ריצת 3 ק"מ – כש"ג סוף',
                    "runTime",
                    true,
                    true
                  )
                }
              />

              <MetricCard
                icon="⚡"
                title="2×150"
                value={
                  formatSeconds(
                    finalSummary
                      .sprint.average
                  )
                }
                best={
                  formatSeconds(
                    finalSummary
                      .sprint.best
                  )
                }
                worst={
                  formatSeconds(
                    finalSummary
                      .sprint.worst
                  )
                }
                count={
                  finalSummary
                    .sprint.count
                }
                change={
                  openingSummary
                    ? formatDeltaTime(
                        openingSummary
                          .sprint.average,
                        finalSummary
                          .sprint.average
                      )
                    : undefined
                }
                onClick={() =>
                  openFitnessDrill(
                    "2×150 – כש״ג סוף",
                    "sprintTime",
                    true,
                    true
                  )
                }
              />

              <MetricCard
                icon="💪"
                title="מתח"
                value={
                  formatAverage(
                    finalSummary
                      .pullUps.average
                  )
                }
                best={
                  formatAverage(
                    finalSummary
                      .pullUps.best
                  )
                }
                worst={
                  formatAverage(
                    finalSummary
                      .pullUps.worst
                  )
                }
                count={
                  finalSummary
                    .pullUps.count
                }
                change={
                  openingSummary
                    ? formatNumericChange(
                        openingSummary
                          .pullUps.average,
                        finalSummary
                          .pullUps.average
                      )
                    : undefined
                }
                onClick={() =>
                  openFitnessDrill(
                    "מתח – כש״ג סוף",
                    "pullUps",
                    false,
                    false
                  )
                }
              />

              <MetricCard
                icon="🏋️"
                title="לחיצת חזה / מקבילים"
                value={
                  formatAverage(
                    finalSummary
                      .chestPress.average
                  )
                }
                best={
                  formatAverage(
                    finalSummary
                      .chestPress.best
                  )
                }
                worst={
                  formatAverage(
                    finalSummary
                      .chestPress.worst
                  )
                }
                count={
                  finalSummary
                    .chestPress.count
                }
                change={
                  openingSummary
                    ? formatNumericChange(
                        openingSummary
                          .chestPress.average,
                        finalSummary
                          .chestPress.average
                      )
                    : undefined
                }
                onClick={() =>
                  openFitnessDrill(
                    "לחיצת חזה / מקבילים – כש״ג סוף",
                    "chestPress",
                    false,
                    false
                  )
                }
              />

              <MetricCard
                icon="🏋️"
                title="טראפ בר"
                value={
                  formatAverage(
                    finalSummary
                      .trapBar.average
                  )
                }
                best={
                  formatAverage(
                    finalSummary
                      .trapBar.best
                  )
                }
                worst={
                  formatAverage(
                    finalSummary
                      .trapBar.worst
                  )
                }
                count={
                  finalSummary
                    .trapBar.count
                }
                change={
                  openingSummary
                    ? formatNumericChange(
                        openingSummary
                          .trapBar.average,
                        finalSummary
                          .trapBar.average
                      )
                    : undefined
                }
                onClick={() =>
                  openFitnessDrill(
                    "טראפ בר – כש״ג סוף",
                    "trapBar",
                    false,
                    false
                  )
                }
              />

            </div>

          </section>

        )}

        {/* LORAN */}

        {loranSummaries.map(
          ({
            test,
            summary,
          }) => (

            <section
              key={
                test.id
              }
              className="bg-white rounded-3xl shadow-sm p-4 sm:p-6 md:p-8 mb-8"
            >

              <SectionHeader
                title={
                  test.name
                }
                subtitle="ריצה וירי נבדקים בנפרד – לחץ על הכרטיסים לפירוט"
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-7">

                <ProgressCard
                  title="מעבר בריצה"
                  percent={
                    summary.runPassRate
                  }
                  detail={`${summary.runPassed} עברו • ${summary.runFailed} נכשלו`}
                  onClick={() =>
                    openLoranDrill(
                      test,
                      "run"
                    )
                  }
                />

                <ProgressCard
                  title="מעבר בירי"
                  percent={
                    summary.shootingPassRate
                  }
                  detail={`${summary.shootingPassed} עברו • ${summary.shootingFailed} נכשלו`}
                  onClick={() =>
                    openLoranDrill(
                      test,
                      "shooting"
                    )
                  }
                />

                <SimpleBigCard
                  title="עברו ריצה + ירי"
                  value={
                    summary.fullPassed
                  }
                  subtitle={`מתוך ${summary.tested} נבחנים`}
                />

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">

                <FailureButton
                  title="נכשלים בריצה"
                  value={
                    summary.runFailed
                  }
                  onClick={() =>
                    openLoranDrill(
                      test,
                      "run-fail"
                    )
                  }
                />

                <FailureButton
                  title="נכשלים בירי"
                  value={
                    summary.shootingFailed
                  }
                  onClick={() =>
                    openLoranDrill(
                      test,
                      "shooting-fail"
                    )
                  }
                />

              </div>

              <div className="mt-8">

                <h3 className="font-bold text-lg">
                  ממוצעי מרכיבי הבוחן
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mt-4">

                  <MetricCard
                    icon="🏃"
                    title="זמן"
                    value={
                      formatSeconds(
                        summary.averageRunSeconds
                      )
                    }
                    best={
                      formatSeconds(
                        summary.bestRunSeconds
                      )
                    }
                    worst={
                      formatSeconds(
                        summary.worstRunSeconds
                      )
                    }
                    count={
                      summary.runCount
                    }
                    onClick={() =>
                      openLoranDrill(
                        test,
                        "run"
                      )
                    }
                  />

                  <MetricCard
                    icon="📊"
                    title="ציון ריצה"
                    value={
                      formatAverage(
                        summary.averageRunningScore
                      )
                    }
                    count={
                      summary.runCount
                    }
                  />

                  <MetricCard
                    icon="🎯"
                    title="ירי"
                    value={
                      formatAverage(
                        summary.averageShooting
                      )
                    }
                    best={
                      formatAverage(
                        summary.bestShooting
                      )
                    }
                    worst={
                      formatAverage(
                        summary.worstShooting
                      )
                    }
                    count={
                      summary.shootingCount
                    }
                    onClick={() =>
                      openLoranDrill(
                        test,
                        "shooting"
                      )
                    }
                  />

                  <MetricCard
                    icon="70%"
                    title="ריצה משוקללת"
                    value={
                      formatAverage(
                        summary.averageRunningWeighted
                      )
                    }
                    count={
                      summary.runCount
                    }
                  />

                  <MetricCard
                    icon="30%"
                    title="ירי משוקלל"
                    value={
                      formatAverage(
                        summary.averageShootingWeighted
                      )
                    }
                    count={
                      summary.shootingCount
                    }
                  />

                  <MetricCard
                    icon="Σ"
                    title="ציון משוקלל"
                    value={
                      formatAverage(
                        summary.averageFinalScore
                      )
                    }
                    count={
                      Math.min(
                        summary.runCount,
                        summary.shootingCount
                      )
                    }
                    footer="מידע בלבד"
                  />

                </div>

              </div>

            </section>

          )
        )}

{/* =================================================
    DEKEL VS RIMON
================================================= */}

{parallel &&
  battalionName !== "גפן" && (

  <section className="bg-white rounded-3xl shadow-sm p-4 sm:p-6 md:p-8 mb-8">

    <SectionHeader
      title={`${battalionName} מול ${parallel.battalion}`}
      subtitle="השוואת הגדודים לפי פתיחה, סוף ומגמת השיפור לאורך הקורס"
    />

    {/* TABS */}

    <div className="flex gap-2 mt-6 overflow-x-auto pb-1 -mx-1 px-1">

      {[
        "כללי",
        "ריצה",
        "כוח",
        "לורן",
        "ירי",
      ].map((tab) => (

        <button
          key={tab}
          type="button"
          onClick={() =>
            setSelectedComparison(
              tab as
                | "כללי"
                | "ריצה"
                | "כוח"
                | "לורן"
                | "ירי"
            )
          }
          className={
            selectedComparison === tab
              ? "shrink-0 bg-slate-900 text-white px-4 py-2 rounded-xl"
              : "shrink-0 bg-slate-100 text-slate-600 px-4 py-2 rounded-xl hover:bg-slate-200"
          }
        >
          {tab}
        </button>

      ))}

    </div>


    {/* =================================================
        RUNNING
    ================================================= */}

    {(selectedComparison === "כללי" ||
      selectedComparison === "ריצה") && (

      <div className="mt-8">

        <h3 className="text-xl font-bold">
          🏃 ריצה
        </h3>

        <p className="text-sm text-slate-500 mt-1">
          השוואת ממוצעי 3 ק״מ ו־2×150 בין פתיחת הקורס לסיום
        </p>


        {/* OPENING */}

        <div className="mt-6">

          <span className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm font-bold mb-3">
            כש״ג פתיחה
          </span>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            <CompareCard
              title='3 ק"מ – פתיחה'
              currentName={battalionName}
              parallelName={parallel.battalion}

              current={
                formatSeconds(
                  openingSummary?.run.average ?? null
                )
              }

              parallel={
                formatSeconds(
                  parallelOpening?.run.average ?? null
                )
              }

              winner={
                getLowerWinner(
                  battalionName,
                  parallel.battalion,
                  openingSummary?.run.average ?? null,
                  parallelOpening?.run.average ?? null
                )
              }
            />


            <CompareCard
              title="2×150 – פתיחה"
              currentName={battalionName}
              parallelName={parallel.battalion}

              current={
                formatSeconds(
                  openingSummary?.sprint.average ?? null
                )
              }

              parallel={
                formatSeconds(
                  parallelOpening?.sprint.average ?? null
                )
              }

              winner={
                getLowerWinner(
                  battalionName,
                  parallel.battalion,
                  openingSummary?.sprint.average ?? null,
                  parallelOpening?.sprint.average ?? null
                )
              }
            />

          </div>

        </div>


        {/* FINAL */}

        <div className="mt-7">

          <span className="inline-block bg-green-50 text-green-700 px-3 py-1 rounded-lg text-sm font-bold mb-3">
            כש״ג סוף
          </span>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

            <CompareCard
              title='3 ק"מ – סוף'
              currentName={battalionName}
              parallelName={parallel.battalion}

              current={
                formatSeconds(
                  finalSummary?.run.average ?? null
                )
              }

              parallel={
                formatSeconds(
                  parallelFinal?.run.average ?? null
                )
              }

              winner={
                getLowerWinner(
                  battalionName,
                  parallel.battalion,
                  finalSummary?.run.average ?? null,
                  parallelFinal?.run.average ?? null
                )
              }
            />


            <CompareCard
              title="2×150 – סוף"
              currentName={battalionName}
              parallelName={parallel.battalion}

              current={
                formatSeconds(
                  finalSummary?.sprint.average ?? null
                )
              }

              parallel={
                formatSeconds(
                  parallelFinal?.sprint.average ?? null
                )
              }

              winner={
                getLowerWinner(
                  battalionName,
                  parallel.battalion,
                  finalSummary?.sprint.average ?? null,
                  parallelFinal?.sprint.average ?? null
                )
              }
            />

          </div>

        </div>


        {/* RUNNING IMPROVEMENT */}

        <div className="mt-7 bg-slate-50 border border-slate-100 rounded-2xl p-5">

          <h4 className="font-bold text-lg">
            מגמת שיפור בריצה
          </h4>

          <p className="text-sm text-slate-500 mt-1">
            השוואת השיפור מכש״ג פתיחה לכש״ג סוף
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-5">

            <ImprovementCompareCard
              title='שיפור ב־3 ק"מ'
              currentName={battalionName}
              parallelName={parallel.battalion}

              currentBefore={
                openingSummary?.run.average ?? null
              }

              currentAfter={
                finalSummary?.run.average ?? null
              }

              parallelBefore={
                parallelOpening?.run.average ?? null
              }

              parallelAfter={
                parallelFinal?.run.average ?? null
              }

              isTime
            />


            <ImprovementCompareCard
              title="שיפור ב־2×150"
              currentName={battalionName}
              parallelName={parallel.battalion}

              currentBefore={
                openingSummary?.sprint.average ?? null
              }

              currentAfter={
                finalSummary?.sprint.average ?? null
              }

              parallelBefore={
                parallelOpening?.sprint.average ?? null
              }

              parallelAfter={
                parallelFinal?.sprint.average ?? null
              }

              isTime
            />

          </div>

        </div>

      </div>

    )}


    {/* =================================================
        STRENGTH
    ================================================= */}

    {(selectedComparison === "כללי" ||
      selectedComparison === "כוח") && (

      <div className="mt-10">

        <h3 className="text-xl font-bold">
          💪 כוח
        </h3>

        <p className="text-sm text-slate-500 mt-1">
          השוואת מתח, לחיצת חזה / מקבילים וטראפ־בר
        </p>


        {/* OPENING */}

        <div className="mt-6">

          <span className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm font-bold mb-3">
            כש״ג פתיחה
          </span>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            <CompareCard
              title="מתח – פתיחה"
              currentName={battalionName}
              parallelName={parallel.battalion}

              current={
                formatAverage(
                  openingSummary?.pullUps.average ?? null
                )
              }

              parallel={
                formatAverage(
                  parallelOpening?.pullUps.average ?? null
                )
              }

              winner={
                getHigherWinner(
                  battalionName,
                  parallel.battalion,
                  openingSummary?.pullUps.average ?? null,
                  parallelOpening?.pullUps.average ?? null
                )
              }
            />


            <CompareCard
              title="לחיצת חזה / מקבילים – פתיחה"
              currentName={battalionName}
              parallelName={parallel.battalion}

              current={
                formatAverage(
                  openingSummary?.chestPress.average ?? null
                )
              }

              parallel={
                formatAverage(
                  parallelOpening?.chestPress.average ?? null
                )
              }

              winner={
                getHigherWinner(
                  battalionName,
                  parallel.battalion,
                  openingSummary?.chestPress.average ?? null,
                  parallelOpening?.chestPress.average ?? null
                )
              }
            />


            <CompareCard
              title="טראפ־בר – פתיחה"
              currentName={battalionName}
              parallelName={parallel.battalion}

              current={
                formatAverage(
                  openingSummary?.trapBar.average ?? null
                )
              }

              parallel={
                formatAverage(
                  parallelOpening?.trapBar.average ?? null
                )
              }

              winner={
                getHigherWinner(
                  battalionName,
                  parallel.battalion,
                  openingSummary?.trapBar.average ?? null,
                  parallelOpening?.trapBar.average ?? null
                )
              }
            />

          </div>

        </div>


        {/* FINAL */}

        <div className="mt-7">

          <span className="inline-block bg-green-50 text-green-700 px-3 py-1 rounded-lg text-sm font-bold mb-3">
            כש״ג סוף
          </span>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            <CompareCard
              title="מתח – סוף"
              currentName={battalionName}
              parallelName={parallel.battalion}

              current={
                formatAverage(
                  finalSummary?.pullUps.average ?? null
                )
              }

              parallel={
                formatAverage(
                  parallelFinal?.pullUps.average ?? null
                )
              }

              winner={
                getHigherWinner(
                  battalionName,
                  parallel.battalion,
                  finalSummary?.pullUps.average ?? null,
                  parallelFinal?.pullUps.average ?? null
                )
              }
            />


            <CompareCard
              title="לחיצת חזה / מקבילים – סוף"
              currentName={battalionName}
              parallelName={parallel.battalion}

              current={
                formatAverage(
                  finalSummary?.chestPress.average ?? null
                )
              }

              parallel={
                formatAverage(
                  parallelFinal?.chestPress.average ?? null
                )
              }

              winner={
                getHigherWinner(
                  battalionName,
                  parallel.battalion,
                  finalSummary?.chestPress.average ?? null,
                  parallelFinal?.chestPress.average ?? null
                )
              }
            />


            <CompareCard
              title="טראפ־בר – סוף"
              currentName={battalionName}
              parallelName={parallel.battalion}

              current={
                formatAverage(
                  finalSummary?.trapBar.average ?? null
                )
              }

              parallel={
                formatAverage(
                  parallelFinal?.trapBar.average ?? null
                )
              }

              winner={
                getHigherWinner(
                  battalionName,
                  parallel.battalion,
                  finalSummary?.trapBar.average ?? null,
                  parallelFinal?.trapBar.average ?? null
                )
              }
            />

          </div>

        </div>


        {/* STRENGTH IMPROVEMENT */}

        <div className="mt-7 bg-slate-50 border border-slate-100 rounded-2xl p-5">

          <h4 className="font-bold text-lg">
            מגמת שיפור בכוח
          </h4>

          <p className="text-sm text-slate-500 mt-1">
            השוואת השיפור מכש״ג פתיחה לכש״ג סוף
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-5">

            <ImprovementCompareCard
              title="שיפור במתח"
              currentName={battalionName}
              parallelName={parallel.battalion}

              currentBefore={
                openingSummary?.pullUps.average ?? null
              }

              currentAfter={
                finalSummary?.pullUps.average ?? null
              }

              parallelBefore={
                parallelOpening?.pullUps.average ?? null
              }

              parallelAfter={
                parallelFinal?.pullUps.average ?? null
              }
            />


            <ImprovementCompareCard
              title="שיפור בלחיצת חזה / מקבילים"
              currentName={battalionName}
              parallelName={parallel.battalion}

              currentBefore={
                openingSummary?.chestPress.average ?? null
              }

              currentAfter={
                finalSummary?.chestPress.average ?? null
              }

              parallelBefore={
                parallelOpening?.chestPress.average ?? null
              }

              parallelAfter={
                parallelFinal?.chestPress.average ?? null
              }
            />


            <ImprovementCompareCard
              title="שיפור בטראפ־בר"
              currentName={battalionName}
              parallelName={parallel.battalion}

              currentBefore={
                openingSummary?.trapBar.average ?? null
              }

              currentAfter={
                finalSummary?.trapBar.average ?? null
              }

              parallelBefore={
                parallelOpening?.trapBar.average ?? null
              }

              parallelAfter={
                parallelFinal?.trapBar.average ?? null
              }
            />

          </div>

        </div>

      </div>

    )}


    {/* =================================================
        LORAN
    ================================================= */}

    {(selectedComparison === "כללי" ||
      selectedComparison === "לורן") && (

      <div className="mt-10">

        <h3 className="text-xl font-bold">
          🏃 לורן משופר
        </h3>

        <p className="text-sm text-slate-500 mt-1">
          השוואת ביצועי הגדודים בלורן המשופר
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-5">

          <CompareCard
            title="זמן ממוצע – לורן משופר"
            currentName={battalionName}
            parallelName={parallel.battalion}

            current={
              formatSeconds(
                currentImproved?.averageRunSeconds ?? null
              )
            }

            parallel={
              formatSeconds(
                parallelImproved?.averageRunSeconds ?? null
              )
            }

            winner={
              getLowerWinner(
                battalionName,
                parallel.battalion,
                currentImproved?.averageRunSeconds ?? null,
                parallelImproved?.averageRunSeconds ?? null
              )
            }
          />


          <CompareCard
            title="אחוז מעבר בריצה"
            currentName={battalionName}
            parallelName={parallel.battalion}

            current={
              currentImproved
                ? `${currentImproved.runPassRate}%`
                : "—"
            }

            parallel={
              parallelImproved
                ? `${parallelImproved.runPassRate}%`
                : "—"
            }

            winner={
              getHigherWinner(
                battalionName,
                parallel.battalion,
                currentImproved?.runPassRate ?? null,
                parallelImproved?.runPassRate ?? null
              )
            }
          />

        </div>

      </div>

    )}


    {/* =================================================
        SHOOTING
    ================================================= */}

    {(selectedComparison === "כללי" ||
      selectedComparison === "ירי") && (

      <div className="mt-10">

        <h3 className="text-xl font-bold">
          🎯 ירי
        </h3>

        <p className="text-sm text-slate-500 mt-1">
          השוואת ביצועי הירי בלורן המשופר
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-5">

          <CompareCard
            title="ממוצע ירי"
            currentName={battalionName}
            parallelName={parallel.battalion}

            current={
              formatAverage(
                currentImproved?.averageShooting ?? null
              )
            }

            parallel={
              formatAverage(
                parallelImproved?.averageShooting ?? null
              )
            }

            winner={
              getHigherWinner(
                battalionName,
                parallel.battalion,
                currentImproved?.averageShooting ?? null,
                parallelImproved?.averageShooting ?? null
              )
            }
          />


          <CompareCard
            title="אחוז מעבר בירי"
            currentName={battalionName}
            parallelName={parallel.battalion}

            current={
              currentImproved
                ? `${currentImproved.shootingPassRate}%`
                : "—"
            }

            parallel={
              parallelImproved
                ? `${parallelImproved.shootingPassRate}%`
                : "—"
            }

            winner={
              getHigherWinner(
                battalionName,
                parallel.battalion,
                currentImproved?.shootingPassRate ?? null,
                parallelImproved?.shootingPassRate ?? null
              )
            }
          />

        </div>

      </div>

    )}

  </section>

)}

        {/* =================================================
            GEFEN
        ================================================= */}

        {battalionName === "גפן" && (
          <>
            {/* BEFORE GEFEN -> GEFEN */}
            <section className="bg-white rounded-3xl shadow-sm p-4 sm:p-6 md:p-8 mb-8">
              <SectionHeader
                title="לפני גפן → במהלך גפן"
                subtitle="השוואת אותם צוערים מדקל/רימון מול הביצועים שלהם בגפן"
              />

              {selectedCycle && (
                <div className="flex flex-wrap gap-2 mt-4 text-xs text-slate-500">
                  <span className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
                    מקור דקל:{" "}
                    <strong>
                      {selectedCycle.sourceCycles?.dekel
                        ? getCycleById(
                            selectedCycle.sourceCycles.dekel
                          )?.name ||
                          "מחזור לא נמצא"
                        : "לא הוגדר"}
                    </strong>
                  </span>

                  <span className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
                    מקור רימון:{" "}
                    <strong>
                      {selectedCycle.sourceCycles?.rimon
                        ? getCycleById(
                            selectedCycle.sourceCycles.rimon
                          )?.name ||
                          "מחזור לא נמצא"
                        : "לא הוגדר"}
                    </strong>
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                <SimpleBigCard
                  title="צוערי גפן"
                  value={current.cadets.length}
                  subtitle="צוערים פעילים"
                />

                <SimpleBigCard
                  title="זוהו מהשלב הקודם"
                  value={matchedGefen.length}
                  subtitle={`מתוך ${current.cadets.length} צוערים`}
                />

                <SimpleBigCard
                  title="בוגרי דקל"
                  value={dekelGraduates.length}
                  subtitle="המשיכו לגפן"
                />

                <SimpleBigCard
                  title="בוגרי רימון"
                  value={rimonGraduates.length}
                  subtitle="המשיכו לגפן"
                />
              </div>

              <div className="mt-9">
                <h3 className="text-xl font-bold">🏃💪 התפתחות בכש״ג</h3>
                <p className="text-sm text-slate-500 mt-1">
                  סוף דקל/רימון מול כש״ג סוף בגפן – אותם צוערים בלבד
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-4 mt-5">
                  <BeforeAfterMetric
                    icon="🏃"
                    title='3 ק"מ'
                    before={formatSeconds(gefenAverages.run.before)}
                    during={formatSeconds(gefenAverages.run.during)}
                    count={gefenAverages.run.n}
                    change={formatDeltaTime(
                      gefenAverages.run.before,
                      gefenAverages.run.during
                    )}
                  />

                  <BeforeAfterMetric
                    icon="⚡"
                    title="2×150"
                    before={formatSeconds(gefenAverages.sprint.before)}
                    during={formatSeconds(gefenAverages.sprint.during)}
                    count={gefenAverages.sprint.n}
                    change={formatDeltaTime(
                      gefenAverages.sprint.before,
                      gefenAverages.sprint.during
                    )}
                  />

                  <BeforeAfterMetric
                    icon="💪"
                    title="מתח"
                    before={formatAverage(gefenAverages.pull.before)}
                    during={formatAverage(gefenAverages.pull.during)}
                    count={gefenAverages.pull.n}
                    change={formatNumericChange(
                      gefenAverages.pull.before,
                      gefenAverages.pull.during
                    )}
                  />

                  <BeforeAfterMetric
                    icon="🏋️"
                    title="לחיצת חזה / מקבילים"
                    before={formatAverage(gefenAverages.chest.before)}
                    during={formatAverage(gefenAverages.chest.during)}
                    count={gefenAverages.chest.n}
                    change={formatNumericChange(
                      gefenAverages.chest.before,
                      gefenAverages.chest.during
                    )}
                  />

                  <BeforeAfterMetric
                    icon="🏋️"
                    title="טראפ־בר"
                    before={formatAverage(gefenAverages.trap.before)}
                    during={formatAverage(gefenAverages.trap.during)}
                    count={gefenAverages.trap.n}
                    change={formatNumericChange(
                      gefenAverages.trap.before,
                      gefenAverages.trap.during
                    )}
                  />
                </div>
              </div>

              <div className="mt-9">
                <h3 className="text-xl font-bold">🎯 לורן משופר – לפני גפן מול גפן</h3>
                <p className="text-sm text-slate-500 mt-1">
                  השוואת זמן הריצה והירי של אותם צוערים
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
                  <BeforeAfterMetric
                    icon="🏃"
                    title="זמן לורן משופר"
                    before={formatSeconds(gefenAverages.loran.before)}
                    during={formatSeconds(gefenAverages.loran.during)}
                    count={gefenAverages.loran.n}
                    change={formatDeltaTime(
                      gefenAverages.loran.before,
                      gefenAverages.loran.during
                    )}
                  />

                  <BeforeAfterMetric
                    icon="🎯"
                    title="ירי"
                    before={formatAverage(gefenAverages.shooting.before)}
                    during={formatAverage(gefenAverages.shooting.during)}
                    count={gefenAverages.shooting.n}
                    change={formatNumericChange(
                      gefenAverages.shooting.before,
                      gefenAverages.shooting.during
                    )}
                  />
                </div>
              </div>
            </section>

            {/* GEFEN INTERNAL JOURNEY */}
            <section className="bg-white rounded-3xl shadow-sm p-4 sm:p-6 md:p-8 mb-8">
              <SectionHeader
                title="מסלול הביצועים בתוך גפן"
                subtitle="לורן משופר → כש״ג סוף → בוחן מ״מ"
              />

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-7">
                <div className="border border-slate-200 rounded-2xl p-4 sm:p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">שלב 1</p>
                      <h3 className="text-xl font-bold mt-1">לורן משופר</h3>
                    </div>
                    <span className="text-2xl">🏃</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-5">
                    <MiniData
                      title="זמן ממוצע"
                      value={formatSeconds(
                        currentImproved?.averageRunSeconds ?? null
                      )}
                    />
                    <MiniData
                      title="ירי ממוצע"
                      value={formatAverage(
                        currentImproved?.averageShooting ?? null
                      )}
                    />
                    <MiniData
                      title="מעבר ריצה"
                      value={currentImproved ? `${currentImproved.runPassRate}%` : "—"}
                    />
                    <MiniData
                      title="מעבר ירי"
                      value={currentImproved ? `${currentImproved.shootingPassRate}%` : "—"}
                    />
                  </div>
                </div>

                <div className="border border-slate-200 rounded-2xl p-4 sm:p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-500">שלב 2</p>
                      <h3 className="text-xl font-bold mt-1">כש״ג סוף</h3>
                    </div>
                    <span className="text-2xl">💪</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-5">
                    <MiniData
                      title='3 ק"מ'
                      value={formatSeconds(finalSummary?.run.average ?? null)}
                    />
                    <MiniData
                      title="2×150"
                      value={formatSeconds(finalSummary?.sprint.average ?? null)}
                    />
                    <MiniData
                      title="מתח"
                      value={formatAverage(finalSummary?.pullUps.average ?? null)}
                    />
                    <MiniData
                      title="לחיצת חזה / מקבילים"
                      value={formatAverage(finalSummary?.chestPress.average ?? null)}
                    />
                    <MiniData
                      title="טראפ־בר"
                      value={formatAverage(finalSummary?.trapBar.average ?? null)}
                    />
                  </div>
                </div>

                <div className="border border-violet-200 bg-violet-50/40 rounded-2xl p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-violet-600">שלב 3</p>
                      <h3 className="text-xl font-bold mt-1">בוחן מ״מ</h3>
                    </div>
                    <span className="text-2xl">🎖️</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-5">
                    <MiniData
                      title="זמן ממוצע"
                      value={formatSeconds(
                        currentMM?.summary.averageRunSeconds ?? null
                      )}
                    />
                    <MiniData
                      title="ירי ממוצע"
                      value={formatAverage(
                        currentMM?.summary.averageShooting ?? null
                      )}
                    />
                    <MiniData
                      title="מעבר ריצה"
                      value={currentMM ? `${currentMM.summary.runPassRate}%` : "—"}
                    />
                    <MiniData
                      title="מעבר ירי"
                      value={currentMM ? `${currentMM.summary.shootingPassRate}%` : "—"}
                    />
                    <MiniData
                      title="עברו ריצה + ירי"
                      value={currentMM ? currentMM.summary.fullPassed.toString() : "—"}
                    />
                    <MiniData
                      title="נבחנו"
                      value={currentMM ? currentMM.summary.tested.toString() : "—"}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* INDIVIDUAL GEFEN FOLLOW-UP */}
            <section className="bg-white rounded-3xl shadow-sm p-4 sm:p-6 md:p-8 mb-8">
              <SectionHeader
                title="מעקב אישי – דקל / רימון → גפן"
                subtitle="היסטוריית ביצועים אישית של כל צוער"
              />

              {gefenComparisons.length === 0 ? (
                <EmptyState text="אין עדיין נתוני השוואה" />
              ) : (
                <>
                  {/* MOBILE PERSONAL FOLLOW-UP */}

                  <div className="md:hidden space-y-4 mt-6">

                    {gefenComparisons.map((item) => {
                      const oldRun =
                        parseTimeToSeconds(
                          item.sourceFitness?.runTime
                        );

                      const newRun =
                        parseTimeToSeconds(
                          item.gefenFitness?.runTime
                        );

                      return (
                        <div
                          key={item.globalId}
                          className="border border-slate-200 rounded-2xl p-4 bg-white"
                        >

                          <div className="flex items-start justify-between gap-3">

                            <div className="min-w-0">
                              <h3 className="font-bold text-lg truncate">
                                {item.name}
                              </h3>

                              <div className="mt-2">
                                <SourceBadge
                                  battalion={
                                    item.sourceBattalion
                                  }
                                />
                              </div>
                            </div>

                            <Link
                              href={`/battalions/${encodeURIComponent(
                                battalionName
                              )}/cadets/${item.gefenCadetId}`}
                              className="shrink-0 text-blue-700 font-medium text-sm"
                            >
                              תיק אישי ←
                            </Link>

                          </div>

                          <div className="mt-4">
                            <p className="text-xs font-bold text-slate-500 mb-2">
                              כש״ג
                            </p>

                            <div className="grid grid-cols-2 gap-2">

                              <MobileData
                                title='3 ק"מ לפני'
                                value={
                                  item.sourceFitness?.runTime ||
                                  "—"
                                }
                              />

                              <MobileData
                                title='3 ק"מ בגפן'
                                value={
                                  item.gefenFitness?.runTime ||
                                  "—"
                                }
                              />

                              <MobileData
                                title="2×150 לפני"
                                value={
                                  item.sourceFitness?.sprintTime ||
                                  "—"
                                }
                              />

                              <MobileData
                                title="2×150 בגפן"
                                value={
                                  item.gefenFitness?.sprintTime ||
                                  "—"
                                }
                              />

                              <MobileData
                                title="מתח לפני"
                                value={
                                  item.sourceFitness?.pullUps ||
                                  "—"
                                }
                              />

                              <MobileData
                                title="מתח בגפן"
                                value={
                                  item.gefenFitness?.pullUps ||
                                  "—"
                                }
                              />

                              <MobileData
                                title="לחיצת חזה לפני"
                                value={
                                  item.sourceFitness?.chestPress ||
                                  "—"
                                }
                              />

                              <MobileData
                                title="לחיצת חזה בגפן"
                                value={
                                  item.gefenFitness?.chestPress ||
                                  "—"
                                }
                              />

                              <MobileData
                                title="טראפ־בר לפני"
                                value={
                                  item.sourceFitness?.trapBar ||
                                  "—"
                                }
                              />

                              <MobileData
                                title="טראפ־בר בגפן"
                                value={
                                  item.gefenFitness?.trapBar ||
                                  "—"
                                }
                              />

                            </div>
                          </div>

                          <div className="mt-4">
                            <p className="text-xs font-bold text-slate-500 mb-2">
                              לורן
                            </p>

                            <div className="grid grid-cols-2 gap-2">

                              <MobileData
                                title="לורן לפני"
                                value={
                                  item.sourceLoran?.runTime ||
                                  "—"
                                }
                              />

                              <MobileData
                                title="לורן בגפן"
                                value={
                                  item.gefenLoran?.runTime ||
                                  "—"
                                }
                              />

                            </div>
                          </div>

                          <div className="mt-4 bg-slate-50 rounded-xl p-3">
                            <p className="text-[11px] text-slate-400">
                              מגמת 3 ק״מ
                            </p>

                            <TrendBadge
                              change={
                                formatDeltaTime(
                                  oldRun,
                                  newRun
                                )
                              }
                            />
                          </div>

                        </div>
                      );
                    })}

                  </div>

                  {/* DESKTOP PERSONAL FOLLOW-UP */}

                  <div className="hidden md:block overflow-x-auto mt-6">
                    <table className="w-full min-w-[1700px]">
                    <thead>
                      <tr className="text-slate-500 text-sm">
                        <TableHead>צוער</TableHead>
                        <TableHead>גדוד מקור</TableHead>
                        <TableHead>3 ק״מ לפני</TableHead>
                        <TableHead>3 ק״מ בגפן</TableHead>
                        <TableHead>מגמת 3 ק״מ</TableHead>
                        <TableHead>2×150 לפני</TableHead>
                        <TableHead>2×150 בגפן</TableHead>
                        <TableHead>מתח לפני</TableHead>
                        <TableHead>מתח בגפן</TableHead>
                        <TableHead>לחיצת חזה לפני</TableHead>
                        <TableHead>לחיצת חזה בגפן</TableHead>
                        <TableHead>טראפ־בר לפני</TableHead>
                        <TableHead>טראפ־בר בגפן</TableHead>
                        <TableHead>לורן לפני</TableHead>
                        <TableHead>לורן בגפן</TableHead>
                        <TableHead>תיק אישי</TableHead>
                      </tr>
                    </thead>

                    <tbody>
                      {gefenComparisons.map((item) => {
                        const oldRun = parseTimeToSeconds(
                          item.sourceFitness?.runTime
                        );
                        const newRun = parseTimeToSeconds(
                          item.gefenFitness?.runTime
                        );

                        return (
                          <tr
                            key={item.globalId}
                            className="border-t border-slate-100 hover:bg-slate-50"
                          >
                            <TableCell>
                              <strong>{item.name}</strong>
                            </TableCell>

                            <TableCell>
                              <SourceBadge battalion={item.sourceBattalion} />
                            </TableCell>

                            <TableCell>{item.sourceFitness?.runTime || "—"}</TableCell>
                            <TableCell>{item.gefenFitness?.runTime || "—"}</TableCell>
                            <TableCell>
                              <TrendBadge change={formatDeltaTime(oldRun, newRun)} />
                            </TableCell>

                            <TableCell>{item.sourceFitness?.sprintTime || "—"}</TableCell>
                            <TableCell>{item.gefenFitness?.sprintTime || "—"}</TableCell>

                            <TableCell>{item.sourceFitness?.pullUps || "—"}</TableCell>
                            <TableCell>{item.gefenFitness?.pullUps || "—"}</TableCell>

                            <TableCell>{item.sourceFitness?.chestPress || "—"}</TableCell>
                            <TableCell>{item.gefenFitness?.chestPress || "—"}</TableCell>

                            <TableCell>{item.sourceFitness?.trapBar || "—"}</TableCell>
                            <TableCell>{item.gefenFitness?.trapBar || "—"}</TableCell>

                            <TableCell>{item.sourceLoran?.runTime || "—"}</TableCell>
                            <TableCell>{item.gefenLoran?.runTime || "—"}</TableCell>

                            <TableCell>
                              <Link
                                href={`/battalions/${encodeURIComponent(
                                  battalionName
                                )}/cadets/${item.gefenCadetId}`}
                                className="text-blue-700 hover:underline font-medium"
                              >
                                פתיחת תיק
                              </Link>
                            </TableCell>
                          </tr>
                        );
                      })}
                    </tbody>
                    </table>
                  </div>
                </>
              )}
            </section>
          </>
        )}

        {/* AI */}

        <section className="bg-slate-900 text-white rounded-3xl p-4 sm:p-6 md:p-8">

          <div className="flex items-start sm:items-center gap-3">

            <div className="bg-white text-slate-900 rounded-xl px-3 py-2 font-bold">
              AI
            </div>

            <div>

              <h2 className="text-xl sm:text-2xl font-bold">
                CommandFit – תמונת מצב
              </h2>

              <p className="text-slate-400 text-sm mt-1">
                תובנות ראשוניות על בסיס הנתונים
              </p>

            </div>

          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">

            <InsightCard
              title="מוקדי התערבות"
              text={
                riskCount === 0
                  ? "לא זוהו כרגע צוערים שנכשלו בריצה או בירי."
                  : `${riskCount} צוערים דורשים התייחסות. ניתן ללחוץ על הכרטיס האדום בראש הדף לצפייה מלאה.`
              }
            />

            <InsightCard
              title="איכות הנתונים"
              text="כל ממוצע מחושב רק לפי הצוערים שביצעו בפועל את אותו מרכיב. מספר הנבדקים מוצג כ־n בכל כרטיס."
            />

            <InsightCard
              title="השוואות"
              text={
                battalionName ===
                "גפן"
                  ? `${matchedGefen.length} צוערים מחוברים כרגע להיסטוריה שלהם מדקל או רימון.`
                  : parallel
                  ? `המערכת משווה את גדוד ${battalionName} מול גדוד ${parallel.battalion}.`
                  : "אין כרגע גדוד מקביל להשוואה."
              }
            />

          </div>

        </section>

      </div>

      {/* DRILL DOWN MODAL */}

      {drill.open && (

        <DrillModal
          title={
            drill.title
          }
          subtitle={
            drill.subtitle
          }
          rows={
            drill.rows
          }
          battalionName={
            battalionName
          }
          onClose={() =>
            setDrill({
              open: false,
              title: "",
              subtitle: "",
              rows: [],
            })
          }
        />

      )}

    </main>
  );
}

/* =========================================================
   WINNERS
========================================================= */

function getHigherWinner(
  currentName: string,
  parallelName: string,
  current: number | null,
  parallel: number | null
) {
  if (
    current === null ||
    parallel === null
  ) {
    return "אין מספיק נתונים";
  }

  if (
    current > parallel
  ) {
    return currentName;
  }

  if (
    parallel > current
  ) {
    return parallelName;
  }

  return "שוויון";
}

function getLowerWinner(
  currentName: string,
  parallelName: string,
  current: number | null,
  parallel: number | null
) {
  if (
    current === null ||
    parallel === null
  ) {
    return "אין מספיק נתונים";
  }

  if (
    current < parallel
  ) {
    return currentName;
  }

  if (
    parallel < current
  ) {
    return parallelName;
  }

  return "שוויון";
}

function getAttemptLabelForSummary(
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
    labels[
      attempt
    ] ??
    `מועד ${attempt}`
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div>

      <h2 className="text-xl sm:text-2xl font-bold">
        {title}
      </h2>

      <p className="text-slate-500 mt-1">
        {subtitle}
      </p>

    </div>
  );
}

function HeroStat({
  title,
  value,
  subtitle,
  warning = false,
  clickable = false,
  onClick,
}: {
  title: string;
  value:
    | string
    | number;
  subtitle: string;

  warning?: boolean;
  clickable?: boolean;

  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={
        !clickable
      }
      onClick={
        onClick
      }
      className={`text-right w-full ${
        warning
          ? "bg-red-50 border border-red-100"
          : "bg-white shadow-sm"
      } rounded-3xl p-4 sm:p-6 ${
        clickable
          ? "hover:shadow-md hover:-translate-y-0.5 transition cursor-pointer"
          : "cursor-default"
      }`}
    >

      <p className="text-sm text-slate-500">
        {title}
      </p>

      <p
        className={
          warning
            ? "text-2xl sm:text-4xl font-bold mt-2 text-red-700"
            : "text-2xl sm:text-4xl font-bold mt-2 text-slate-900"
        }
      >
        {value}
      </p>

      <p className="text-xs text-slate-400 mt-2">
        {subtitle}
      </p>

    </button>
  );
}

function SnapshotCard({
  title,
  value,
  tone,
  subtitle,
}: {
  title: string;
  value:
    | string
    | number;
  tone:
    | "neutral"
    | "success"
    | "excellent"
    | "danger"
    | "info";
  subtitle?: string;
}) {
  const styles = {
    neutral:
      "bg-slate-50 border-slate-100 text-slate-900",

    success:
      "bg-green-50 border-green-100 text-green-700",

    excellent:
      "bg-sky-50 border-sky-200 text-sky-700",

    danger:
      "bg-red-50 border-red-100 text-red-700",

    info:
      "bg-blue-50 border-blue-100 text-blue-700",
  };

  return (
    <div
      className={`border rounded-2xl p-4 sm:p-5 ${styles[tone]}`}
    >
      <p className="text-sm opacity-75">
        {title}
      </p>

      <p className="text-3xl sm:text-4xl font-bold mt-2">
        {value}
      </p>

      {subtitle && (
        <p className="text-xs opacity-70 mt-2">
          {subtitle}
        </p>
      )}
    </div>
  );
}

function MetricCard({
  icon,
  title,
  value,
  count,

  best,
  worst,

  change,
  footer,

  onClick,
}: {
  icon: string;
  title: string;
  value: string;

  count: number;

  best?: string;
  worst?: string;

  change?: {
    text: string;
    trend: string;
  };

  footer?: string;

  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      disabled={
        !onClick
      }
      onClick={
        onClick
      }
      className={`text-right w-full bg-slate-50 border border-slate-100 rounded-2xl p-4 sm:p-5 ${
        onClick
          ? "hover:border-blue-300 hover:bg-blue-50/30 hover:shadow-sm transition cursor-pointer"
          : "cursor-default"
      }`}
    >

      <div className="flex items-center justify-between gap-2">

        <span className="text-xl">
          {icon}
        </span>

        <span className="text-xs text-slate-400">
          n={count}
        </span>

      </div>

      <p className="text-sm text-slate-500 mt-4">
        {title}
      </p>

      <p className="text-2xl sm:text-3xl font-bold mt-1">
        {value}
      </p>

      {(best ||
        worst) && (

        <div className="grid grid-cols-2 gap-2 mt-4">

          <div className="bg-white rounded-lg p-2">

            <p className="text-[11px] text-slate-400">
              הטוב ביותר
            </p>

            <p className="font-bold text-sm mt-1">
              {best ??
                "—"}
            </p>

          </div>

          <div className="bg-white rounded-lg p-2">

            <p className="text-[11px] text-slate-400">
              החלש ביותר
            </p>

            <p className="font-bold text-sm mt-1">
              {worst ??
                "—"}
            </p>

          </div>

        </div>

      )}

      {change && (
        <TrendBadge
          change={
            change
          }
        />
      )}

      {footer && (

        <p className="text-xs text-slate-400 mt-2">
          {footer}
        </p>

      )}

      {onClick && (

        <p className="text-xs text-blue-700 font-medium mt-4">
          לחץ לפירוט ←
        </p>

      )}

    </button>
  );
}

function TrendBadge({
  change,
}: {
  change: {
    text: string;
    trend: string;
  };
}) {
  if (
    change.trend ===
    "good"
  ) {
    return (
      <div className="text-green-700 text-sm font-medium mt-3">
        ↑{" "}
        {change.text.replace(
          "שיפור ",
          ""
        )}
      </div>
    );
  }

  if (
    change.trend ===
    "bad"
  ) {
    return (
      <div className="text-red-700 text-sm font-medium mt-3">
        ↓{" "}
        {change.text.replace(
          "ירידה ",
          ""
        )}
      </div>
    );
  }

  return (
    <div className="text-slate-400 text-sm mt-3">
      {change.text}
    </div>
  );
}

function ProgressCard({
  title,
  percent,
  detail,
  onClick,
}: {
  title: string;
  percent: number;
  detail: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className="bg-slate-50 hover:bg-slate-100 rounded-2xl p-4 sm:p-5 text-right transition"
    >

      <div className="flex justify-between items-center">

        <p className="font-bold">
          {title}
        </p>

        <p className="text-2xl font-bold">
          {percent}%
        </p>

      </div>

      <div className="h-2 bg-slate-200 rounded-full overflow-hidden mt-4">

        <div
          className="h-full bg-slate-800 rounded-full"
          style={{
            width: `${Math.min(
              100,
              Math.max(
                0,
                percent
              )
            )}%`,
          }}
        />

      </div>

      <p className="text-xs text-slate-500 mt-3">
        {detail}
      </p>

      <p className="text-xs text-blue-700 mt-3 font-medium">
        לחץ לפירוט ←
      </p>

    </button>
  );
}

function FailureButton({
  title,
  value,
  onClick,
}: {
  title: string;
  value: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      className={
        value > 0
          ? "bg-red-50 border border-red-100 hover:bg-red-100 rounded-2xl p-4 text-right transition"
          : "bg-green-50 border border-green-100 rounded-2xl p-4 text-right"
      }
    >

      <p className="text-sm text-slate-500">
        {title}
      </p>

      <p
        className={
          value > 0
            ? "text-3xl font-bold text-red-700 mt-1"
            : "text-3xl font-bold text-green-700 mt-1"
        }
      >
        {value}
      </p>

      {value > 0 && (
        <p className="text-xs text-red-600 mt-2">
          לחץ לצפייה בצוערים
        </p>
      )}

    </button>
  );
}

function SimpleBigCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value:
    | string
    | number;
  subtitle: string;
}) {
  return (
    <div className="bg-slate-50 rounded-2xl p-4 sm:p-5">

      <p className="text-sm text-slate-500">
        {title}
      </p>

      <p className="text-3xl font-bold mt-2">
        {value}
      </p>

      <p className="text-xs text-slate-400 mt-2">
        {subtitle}
      </p>

    </div>
  );
}

function CompareCard({
  title,
  currentName,
  parallelName,
  current,
  parallel,
  winner,
}: {
  title: string;

  currentName: string;
  parallelName: string;

  current: string;
  parallel: string;

  winner: string;
}) {
  return (
    <div className="border border-slate-200 rounded-2xl p-4 sm:p-5">

      <p className="font-bold">
        {title}
      </p>

      <div className="grid grid-cols-2 gap-3 mt-5">

        <div className="bg-slate-50 rounded-xl p-4">

          <p className="text-xs text-slate-500">
            {currentName}
          </p>

          <p className="text-xl sm:text-2xl font-bold mt-1">
            {current}
          </p>

        </div>

        <div className="bg-slate-50 rounded-xl p-4">

          <p className="text-xs text-slate-500">
            {parallelName}
          </p>

          <p className="text-xl sm:text-2xl font-bold mt-1">
            {parallel}
          </p>

        </div>

      </div>

      <div className="mt-4 text-sm">

        <span className="text-slate-500">
          מוביל:{" "}
        </span>

        <strong>
          {winner}
        </strong>

      </div>

    </div>
  );
}

function BeforeAfterMetric({
  icon,
  title,
  before,
  during,
  count,
  change,
}: {
  icon: string;
  title: string;

  before: string;
  during: string;

  count: number;

  change: {
    text: string;
    trend: string;
  };
}) {
  return (
    <div className="border border-slate-200 rounded-2xl p-4 sm:p-5">

      <div className="flex justify-between">

        <span className="text-xl">
          {icon}
        </span>

        <span className="text-xs text-slate-400">
          n={count}
        </span>

      </div>

      <h3 className="font-bold mt-3">
        {title}
      </h3>

      <div className="grid grid-cols-2 gap-2 mt-4">

        <div className="bg-slate-50 rounded-xl p-3">

          <p className="text-xs text-slate-500">
            לפני גפן
          </p>

          <p className="text-xl font-bold mt-1">
            {before}
          </p>

        </div>

        <div className="bg-slate-900 text-white rounded-xl p-3">

          <p className="text-xs text-slate-300">
            בגפן
          </p>

          <p className="text-xl font-bold mt-1">
            {during}
          </p>

        </div>

      </div>

      <TrendBadge
        change={
          change
        }
      />

    </div>
  );
}

function SourceBadge({
  battalion,
}: {
  battalion: string;
}) {
  if (
    battalion === "דקל"
  ) {
    return (
      <span className="bg-green-50 text-green-700 border border-green-100 px-3 py-1 rounded-lg text-sm font-medium">
        דקל
      </span>
    );
  }

  if (
    battalion === "רימון"
  ) {
    return (
      <span className="bg-red-50 text-red-700 border border-red-100 px-3 py-1 rounded-lg text-sm font-medium">
        רימון
      </span>
    );
  }

  return (
    <span className="bg-amber-50 text-amber-700 px-3 py-1 rounded-lg text-sm">
      לא זוהה
    </span>
  );
}

function InsightCard({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5">

      <h3 className="font-bold">
        {title}
      </h3>

      <p className="text-slate-300 text-sm leading-6 mt-2">
        {text}
      </p>

    </div>
  );
}

function MobileData({
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

function EmptyState({
  text,
}: {
  text: string;
}) {
  return (
    <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center text-slate-400 mt-6">
      {text}
    </div>
  );
}

/* =========================================================
   DRILL MODAL
========================================================= */

function DrillModal({
  title,
  subtitle,
  rows,
  battalionName,
  onClose,
}: {
  title: string;
  subtitle: string;

  rows: DrillRow[];

  battalionName: string;

  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      onClick={
        onClose
      }
    >

      <div
        className="bg-white w-full max-w-5xl max-h-[85vh] rounded-3xl shadow-2xl overflow-hidden"
        onClick={(
          event
        ) =>
          event.stopPropagation()
        }
      >

        <div className="bg-slate-900 text-white p-4 sm:p-6 flex items-start justify-between gap-4">

          <div>

            <h2 className="text-2xl font-bold">
              {title}
            </h2>

            <p className="text-slate-300 text-sm mt-1">
              {subtitle}
            </p>

          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            className="bg-white/10 hover:bg-white/20 w-10 h-10 rounded-xl text-xl"
          >
            ×
          </button>

        </div>

        <div className="p-4 sm:p-6 overflow-auto max-h-[calc(85vh-100px)]">

          {rows.length ===
          0 ? (

            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center text-slate-400">
              אין צוערים להצגה
            </div>

          ) : (

            <>
              {/* MOBILE DRILL */}

              <div className="md:hidden space-y-3">

                {rows.map(
                  (
                    row,
                    index
                  ) => (

                    <div
                      key={`${row.cadetId}-${index}`}
                      className="border border-slate-200 rounded-2xl p-4"
                    >

                      <div className="flex items-start justify-between gap-3">

                        <div>
                          <p className="text-xs text-slate-400">
                            #{index + 1}
                          </p>

                          <h3 className="font-bold text-lg mt-1">
                            {row.name}
                          </h3>
                        </div>

                        {row.status && (
                          <StatusBadge
                            status={
                              row.status
                            }
                          />
                        )}

                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-4">

                        <MobileData
                          title="תוצאה"
                          value={
                            row.result ||
                            "—"
                          }
                        />

                        <MobileData
                          title="סף"
                          value={
                            row.threshold ||
                            "—"
                          }
                        />

                      </div>

                      {row.detail && (
                        <div className="bg-slate-50 rounded-xl p-3 mt-3">
                          <p className="text-[11px] text-slate-400">
                            פירוט
                          </p>

                          <p className="text-sm mt-1">
                            {row.detail}
                          </p>
                        </div>
                      )}

                      <Link
                        href={`/battalions/${encodeURIComponent(
                          battalionName
                        )}/cadets/${row.cadetId}`}
                        className="block bg-slate-900 text-white text-center rounded-xl px-4 py-3 mt-4 font-medium"
                      >
                        פתיחת תיק אישי
                      </Link>

                    </div>

                  )
                )}

              </div>

              {/* DESKTOP DRILL */}

              <div className="hidden md:block border border-slate-200 rounded-2xl overflow-hidden">

              <table className="w-full min-w-[800px]">

                <thead className="bg-slate-100 sticky top-0">

                  <tr>

                    <TableHead>
                      #
                    </TableHead>

                    <TableHead>
                      צוער
                    </TableHead>

                    <TableHead>
                      תוצאה
                    </TableHead>

                    <TableHead>
                      סף
                    </TableHead>

                    <TableHead>
                      סטטוס
                    </TableHead>

                    <TableHead>
                      פירוט
                    </TableHead>

                    <TableHead>
                      תיק אישי
                    </TableHead>

                  </tr>

                </thead>

                <tbody>

                  {rows.map(
                    (
                      row,
                      index
                    ) => (

                      <tr
                        key={`${row.cadetId}-${index}`}
                        className="border-t border-slate-100 hover:bg-slate-50"
                      >

                        <TableCell>
                          {index +
                            1}
                        </TableCell>

                        <TableCell>
                          <strong>
                            {row.name}
                          </strong>
                        </TableCell>

                        <TableCell>
                          {row.result ||
                            "—"}
                        </TableCell>

                        <TableCell>
                          {row.threshold ||
                            "—"}
                        </TableCell>

                        <TableCell>

                          {row.status ? (
                            <StatusBadge
                              status={
                                row.status
                              }
                            />
                          ) : (
                            "—"
                          )}

                        </TableCell>

                        <TableCell>
                          {row.detail ||
                            "—"}
                        </TableCell>

                        <TableCell>

                          <Link
                            href={`/battalions/${encodeURIComponent(
                              battalionName
                            )}/cadets/${row.cadetId}`}
                            className="text-blue-700 font-medium hover:underline"
                          >
                            פתיחת תיק
                          </Link>

                        </TableCell>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

              </div>
            </>

          )}

        </div>

      </div>

    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  if (
    status === "מצטיין"
  ) {
    return (
      <span className="bg-sky-50 text-sky-700 border border-sky-200 rounded-lg px-3 py-1 text-sm font-bold">
        ★ מצטיין
      </span>
    );
  }

  if (
    status === "עבר"
  ) {
    return (
      <span className="bg-green-50 text-green-700 border border-green-100 rounded-lg px-3 py-1 text-sm font-bold">
        עבר
      </span>
    );
  }

  if (
    status === "נכשל" ||
    status ===
      "דורש התייחסות"
  ) {
    return (
      <span className="bg-red-50 text-red-700 border border-red-100 rounded-lg px-3 py-1 text-sm font-bold">
        {status}
      </span>
    );
  }

  if (
    status ===
      "חסר סף"
  ) {
    return (
      <span className="bg-amber-50 text-amber-700 border border-amber-100 rounded-lg px-3 py-1 text-sm font-bold">
        חסר סף
      </span>
    );
  }

  return (
    <span className="text-slate-500">
      {status}
    </span>
  );
}

function TableHead({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <th className="p-4 text-right whitespace-nowrap font-medium">
      {children}
    </th>
  );
}

function TableCell({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <td className="p-4 whitespace-nowrap">
      {children}
    </td>
  );
}
function ImprovementCompareCard({
  title,
  currentName,
  parallelName,
  currentBefore,
  currentAfter,
  parallelBefore,
  parallelAfter,
  isTime = false,
}: {
  title: string;
  currentName: string;
  parallelName: string;
  currentBefore: number | null;
  currentAfter: number | null;
  parallelBefore: number | null;
  parallelAfter: number | null;
  isTime?: boolean;
}) {
  const currentChange =
    currentBefore !== null && currentAfter !== null
      ? isTime
        ? currentBefore - currentAfter
        : currentAfter - currentBefore
      : null;

  const parallelChange =
    parallelBefore !== null && parallelAfter !== null
      ? isTime
        ? parallelBefore - parallelAfter
        : parallelAfter - parallelBefore
      : null;

  function formatChange(value: number | null) {
    if (value === null) {
      return "—";
    }

    if (value === 0) {
      return "ללא שינוי";
    }

    if (isTime) {
      if (value > 0) {
        return `↑ ${formatSeconds(value)}`;
      }

      return `↓ ${formatSeconds(Math.abs(value))}`;
    }

    if (value > 0) {
      return `↑ +${value.toFixed(1)}`;
    }

    return `↓ ${Math.abs(value).toFixed(1)}`;
  }

  let leader = "אין מספיק נתונים";

  if (
    currentChange !== null &&
    parallelChange !== null
  ) {
    if (currentChange > parallelChange) {
      leader = currentName;
    } else if (parallelChange > currentChange) {
      leader = parallelName;
    } else {
      leader = "שוויון";
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5">

      <p className="font-bold">
        {title}
      </p>

      <div className="grid grid-cols-2 gap-3 mt-5">

        {/* CURRENT BATTALION */}

        <div className="bg-slate-50 rounded-xl p-4">

          <p className="text-xs text-slate-500">
            {currentName}
          </p>

          <p
            className={
              currentChange !== null && currentChange > 0
                ? "text-2xl font-bold text-green-700 mt-1"
                : currentChange !== null && currentChange < 0
                ? "text-2xl font-bold text-red-700 mt-1"
                : "text-2xl font-bold mt-1"
            }
          >
            {formatChange(currentChange)}
          </p>

        </div>


        {/* PARALLEL BATTALION */}

        <div className="bg-slate-50 rounded-xl p-4">

          <p className="text-xs text-slate-500">
            {parallelName}
          </p>

          <p
            className={
              parallelChange !== null && parallelChange > 0
                ? "text-2xl font-bold text-green-700 mt-1"
                : parallelChange !== null && parallelChange < 0
                ? "text-2xl font-bold text-red-700 mt-1"
                : "text-2xl font-bold mt-1"
            }
          >
            {formatChange(parallelChange)}
          </p>

        </div>

      </div>


      {/* LEADER */}

      <div className="mt-4 pt-4 border-t border-slate-100">

        <span className="text-sm text-slate-500">
          השתפר יותר:{" "}
        </span>

        <strong className="text-sm">
          {leader}
        </strong>

      </div>

    </div>
  );
}

function MiniData({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="bg-white rounded-xl p-3 border border-slate-100">
      <p className="text-xs text-slate-500">{title}</p>
      <p className="text-lg font-bold mt-1">{value}</p>
    </div>
  );
}
