"use client";

import { useParams, useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getActiveCycle,
  getCadetsStorageKey,
  getLegacyCadetsStorageKey,
  getResultsStorageKey,
  getLegacyResultsStorageKey,
  type CourseCycle,
} from "@/lib/cycles";

import {
  useAuth,
} from "@/lib/use-auth";

import {
  supabase,
} from "@/lib/supabase";

import {
  saveSharedTestResults,
} from "@/lib/test-results";

import {
  getStandard,
} from "@/lib/standards";

import {
  calculateRegularLoranRunningScore,
  formatLoranTime,
  getRegularLoranArray,
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

  company: string;
  team: string;

  loranPopulation: string;

  medicalStatus: string;
  courseStatus?: string;
  previousBattalion?: string;

  fitnessLevel?: string;

  /*
    סף ירי אישי:
    60 / 70 / 75
  */
  shootingLevel?: string;

  notes: string;
};

type CloudCadetRow = {
  name: string;
  gender: string | null;
  brigade: string | null;
  unit: string | null;
};

type CloudMembershipRow = {
  global_id: string;
  cadet_number: number | null;
  company: string | null;
  team: string | null;
  loran_population: string | null;
  medical_status: string | null;
  course_status: string | null;
  fitness_level: string | null;
  shooting_level: string | null;
  previous_battalion: string | null;
  notes: string | null;
  cadets:
    | CloudCadetRow
    | CloudCadetRow[]
    | null;
};

type CloudTestResultRow = {
  cadet_id: number | null;
  attempt: number | null;
  run_time: string | null;
  sprint_time: string | null;
  pull_ups: string | null;
  chest_press: string | null;
  trap_bar: string | null;
  shooting_score: string | null;
  notes: string | null;
};


type ResultRow = {
  cadetId: number;

  runTime: string;
  sprintTime: string;

  pullUps: string;
  chestPress: string;
  trapBar: string;

  shootingScore: string;

  notes: string;
};

type RunningStandard = {
  score: number;
  maxSeconds: number;
};

type TestStatus =
  | "מצטיין"
  | "עבר"
  | "נכשל"
  | "טרם חושב"
  | "חסר סף"
  | "אין מערך";

type FitnessMetricEvaluation = {
  status: TestStatus;

  threshold:
    | string
    | number
    | null;

  excellenceThreshold:
    | string
    | number
    | null;
};

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

/* =========================================================
   CONFIG
========================================================= */

const IMPROVED_LORAN_MAX_PASS_TIME =
  39 * 60 + 59;

/*
  כרגע בוחן מ"מ משתמש באותו
  סף זמן כמו לורן משופר.
*/
const MM_MAX_PASS_TIME =
  39 * 60 + 59;

/* =========================================================
   לורן משופר / בוחן מ"מ
   טבלת ציון ריצה
========================================================= */

const improvedLoranStandards: RunningStandard[] = [
  { score: 100, maxSeconds: 33 * 60 },

  { score: 99, maxSeconds: 33 * 60 + 9 },
  { score: 98, maxSeconds: 33 * 60 + 18 },
  { score: 97, maxSeconds: 33 * 60 + 27 },
  { score: 96, maxSeconds: 33 * 60 + 36 },
  { score: 95, maxSeconds: 33 * 60 + 45 },
  { score: 94, maxSeconds: 33 * 60 + 56 },

  { score: 93, maxSeconds: 34 * 60 + 7 },
  { score: 92, maxSeconds: 34 * 60 + 18 },
  { score: 91, maxSeconds: 34 * 60 + 29 },
  { score: 90, maxSeconds: 34 * 60 + 40 },

  { score: 89, maxSeconds: 34 * 60 + 53 },
  { score: 88, maxSeconds: 35 * 60 + 6 },
  { score: 87, maxSeconds: 35 * 60 + 19 },
  { score: 86, maxSeconds: 35 * 60 + 32 },
  { score: 85, maxSeconds: 35 * 60 + 45 },

  { score: 84, maxSeconds: 36 * 60 },
  { score: 83, maxSeconds: 36 * 60 + 15 },
  { score: 82, maxSeconds: 36 * 60 + 30 },
  { score: 81, maxSeconds: 36 * 60 + 45 },

  { score: 80, maxSeconds: 37 * 60 },
  { score: 79, maxSeconds: 37 * 60 + 15 },
  { score: 78, maxSeconds: 37 * 60 + 30 },
  { score: 77, maxSeconds: 37 * 60 + 45 },

  { score: 76, maxSeconds: 38 * 60 },
  { score: 75, maxSeconds: 38 * 60 + 15 },
  { score: 74, maxSeconds: 38 * 60 + 35 },
  { score: 73, maxSeconds: 38 * 60 + 55 },

  { score: 72, maxSeconds: 39 * 60 + 15 },
  { score: 71, maxSeconds: 39 * 60 + 35 },
  { score: 70, maxSeconds: 39 * 60 + 59 },

  { score: 69, maxSeconds: 40 * 60 + 22 },
  { score: 68, maxSeconds: 40 * 60 + 45 },
  { score: 67, maxSeconds: 41 * 60 + 8 },
  { score: 66, maxSeconds: 41 * 60 + 31 },
  { score: 65, maxSeconds: 41 * 60 + 54 },

  { score: 64, maxSeconds: 42 * 60 + 17 },
  { score: 63, maxSeconds: 42 * 60 + 40 },
  { score: 62, maxSeconds: 43 * 60 + 3 },
  { score: 61, maxSeconds: 43 * 60 + 26 },
  { score: 60, maxSeconds: 43 * 60 + 49 },

  { score: 59, maxSeconds: 44 * 60 + 12 },
  { score: 58, maxSeconds: 44 * 60 + 35 },
  { score: 57, maxSeconds: 44 * 60 + 58 },

  { score: 56, maxSeconds: 45 * 60 + 21 },
  { score: 55, maxSeconds: 45 * 60 + 44 },

  { score: 54, maxSeconds: 46 * 60 + 7 },
  { score: 53, maxSeconds: 46 * 60 + 30 },
  { score: 52, maxSeconds: 46 * 60 + 53 },

  { score: 51, maxSeconds: 47 * 60 + 16 },
  { score: 50, maxSeconds: 47 * 60 + 39 },

  { score: 49, maxSeconds: 48 * 60 + 2 },
  { score: 48, maxSeconds: 48 * 60 + 25 },
  { score: 47, maxSeconds: 48 * 60 + 48 },

  { score: 46, maxSeconds: 49 * 60 + 11 },
  { score: 45, maxSeconds: 49 * 60 + 34 },
  { score: 44, maxSeconds: 49 * 60 + 57 },

  { score: 43, maxSeconds: 50 * 60 + 20 },
  { score: 42, maxSeconds: 50 * 60 + 43 },

  { score: 41, maxSeconds: 51 * 60 + 6 },

  {
    score: 40,
    maxSeconds: 2 * 60 * 60,
  },
];

/* =========================================================
   HELPERS
========================================================= */

function createEmptyResult(
  cadetId: number
): ResultRow {
  return {
    cadetId,

    runTime: "",
    sprintTime: "",

    pullUps: "",
    chestPress: "",
    trapBar: "",

    shootingScore: "",

    notes: "",
  };
}

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

/* =========================================================
   ציון ריצה - משופר / מ"מ
========================================================= */

function calculateImprovedRunningScore(
  runTime: string
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

  const standard =
    improvedLoranStandards.find(
      (item) =>
        seconds <=
        item.maxSeconds
    );

  return (
    standard?.score ??
    null
  );
}

/* =========================================================
   שקלול 70/30
   מידע בלבד
========================================================= */

function calculateFinalScore(
  runningScore:
    | number
    | null,
  shootingScoreText: string
): number | null {
  if (
    runningScore === null ||
    !shootingScoreText.trim()
  ) {
    return null;
  }

  const shootingScore =
    Number(
      shootingScoreText
    );

  if (
    Number.isNaN(
      shootingScore
    ) ||
    shootingScore < 0 ||
    shootingScore > 100
  ) {
    return null;
  }

  return Math.round(
    runningScore * 0.7 +
      shootingScore * 0.3
  );
}

/* =========================================================
   SHOOTING THRESHOLD
========================================================= */

function getShootingPassScore(
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
   REGULAR LORAN RUN STATUS
========================================================= */

function calculateRegularRunStatus(
  runTime: string,
  population: string
): TestStatus {
  const actual =
    parseTimeToSeconds(
      runTime
    );

  if (
    actual === null
  ) {
    return "טרם חושב";
  }

  const array =
    getRegularLoranArray(
      population
    );

  if (!array) {
    return "אין מערך";
  }

  const passing =
    getRegularLoranPassingTime(
      population
    );

  if (
    passing === null
  ) {
    return "אין מערך";
  }

  return actual <= passing
    ? "עבר"
    : "נכשל";
}

/* =========================================================
   IMPROVED / MM RUN STATUS
========================================================= */

function calculateImprovedStyleRunStatus(
  runTime: string,
  maxPassTime: number
): TestStatus {
  const actual =
    parseTimeToSeconds(
      runTime
    );

  if (
    actual === null
  ) {
    return "טרם חושב";
  }

  return actual <=
    maxPassTime
    ? "עבר"
    : "נכשל";
}

/* =========================================================
   SHOOTING STATUS
========================================================= */

function calculateShootingStatus(
  shootingScoreText: string,
  cadet: Cadet
): TestStatus {
  if (
    !shootingScoreText.trim()
  ) {
    return "טרם חושב";
  }

  const score =
    Number(
      shootingScoreText
    );

  if (
    Number.isNaN(score)
  ) {
    return "טרם חושב";
  }

  const threshold =
    getShootingPassScore(
      cadet
    );

  if (
    threshold === null
  ) {
    return "חסר סף";
  }

  return score >= threshold
    ? "עבר"
    : "נכשל";
}

/* =========================================================
   FITNESS STANDARDS / STATUS
========================================================= */

function evaluateFitnessMetric(
  battalionName: string,
  testName: string,
  metric: string,
  value: string,
  isTimeMetric: boolean,
  population?: string
): FitnessMetricEvaluation {
  if (!value.trim()) {
    return {
      status: "טרם חושב",
      threshold: null,
      excellenceThreshold: null,
    };
  }

  const standard =
    getStandard(
      2026,
      battalionName,
      testName,
      metric,
      population
    );

  if (!standard) {
    return {
      status: "אין מערך",
      threshold: null,
      excellenceThreshold: null,
    };
  }

  const threshold =
    testName.includes("פתיחה")
      ? standard.startThreshold
      : standard.endThreshold;

  const excellenceThreshold =
    standard.excellenceThreshold;

  if (
    threshold === undefined
  ) {
    return {
      status: "אין מערך",
      threshold: null,
      excellenceThreshold:
        excellenceThreshold ?? null,
    };
  }

  if (isTimeMetric) {
    const actualSeconds =
      parseTimeToSeconds(
        value
      );

    const thresholdSeconds =
      parseTimeToSeconds(
        String(
          threshold
        )
      );

    const excellenceSeconds =
      excellenceThreshold !== undefined
        ? parseTimeToSeconds(
            String(
              excellenceThreshold
            )
          )
        : null;

    if (
      actualSeconds === null ||
      thresholdSeconds === null
    ) {
      return {
        status: "טרם חושב",
        threshold,
        excellenceThreshold:
          excellenceThreshold ?? null,
      };
    }

    if (
      excellenceSeconds !== null &&
      actualSeconds <= excellenceSeconds
    ) {
      return {
        status: "מצטיין",
        threshold,
        excellenceThreshold:
          excellenceThreshold ?? null,
      };
    }

    return {
      status:
        actualSeconds <=
        thresholdSeconds
          ? "עבר"
          : "נכשל",

      threshold,

      excellenceThreshold:
        excellenceThreshold ?? null,
    };
  }

  const actual =
    Number(value);

  const required =
    Number(threshold);

  const excellenceRequired =
    excellenceThreshold !== undefined
      ? Number(
          excellenceThreshold
        )
      : null;

  if (
    Number.isNaN(actual) ||
    Number.isNaN(required)
  ) {
    return {
      status: "טרם חושב",
      threshold,
      excellenceThreshold:
        excellenceThreshold ?? null,
    };
  }

  if (
    excellenceRequired !== null &&
    !Number.isNaN(
      excellenceRequired
    ) &&
    actual >= excellenceRequired
  ) {
    return {
      status: "מצטיין",
      threshold,
      excellenceThreshold:
        excellenceThreshold ?? null,
    };
  }

  return {
    status:
      actual >= required
        ? "עבר"
        : "נכשל",

    threshold,

    excellenceThreshold:
      excellenceThreshold ?? null,
  };
}


/* =========================================================
   FITNESS SCORE TABLES
   לפי טבלאות הניקוד שבהוראת הכושר:
   3 ק"מ, 2×150, מתח/לחיצת חזה/מקבילים, טראפ-בר.
========================================================= */

function score3Km(
  timeText: string
): number | null {
  const seconds =
    parseTimeToSeconds(
      timeText
    );

  if (seconds === null) {
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
    [12 * 60 + 0, 88],
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
    [13 * 60 + 0, 76],
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
    [14 * 60 + 0, 65],
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
    const [maxSeconds, score]
    of bands
  ) {
    if (
      seconds <= maxSeconds
    ) {
      return score;
    }
  }

  return 40;
}

function score150x2(
  timeText: string
): number | null {
  const seconds =
    parseTimeToSeconds(
      timeText
    );

  if (seconds === null) {
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

function scoreWeightedStrength15(
  valueText: string
): number | null {
  const reps =
    Number(
      valueText
    );

  if (
    !valueText.trim() ||
    Number.isNaN(reps)
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
  valueText: string
): number | null {
  const reps =
    Number(
      valueText
    );

  if (
    !valueText.trim() ||
    Number.isNaN(reps)
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

function scoreTrapBar10(
  valueText: string
): number | null {
  const reps =
    Number(
      valueText
    );

  if (
    !valueText.trim() ||
    Number.isNaN(reps)
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

function calculateFitnessFinalScore(
  battalionName: string,
  fitnessLevel: string | undefined,
  result: ResultRow
): number | null {
  const runScore =
    score3Km(
      result.runTime
    );

  const sprintScore =
    score150x2(
      result.sprintTime
    );

  const pullScore =
    scoreWeightedStrength15(
      result.pullUps
    );

  const pushScore =
    fitnessLevel === "רמה 1"
      ? scoreDips20(
          result.chestPress
        )
      : scoreWeightedStrength15(
          result.chestPress
        );

  const trapScore =
    scoreTrapBar10(
      result.trapBar
    );

  /*
    גפן עובד כמו רמה 3 מבחינת חמשת מרכיבי הכש"ג.
    רמה 2 / רמה 3:
    30% ריצה + 10% 2×150 + 20% מתח +
    20% דחיפה + 20% טראפ-בר.

    רמה 1:
    60% ריצה + 20% מתח + 20% מקבילים.
    שאר המרכיבים עדיין יכולים לשמש תנאי מעבר
    לפי ספי המערכת, אך אינם נכנסים לציון המשוקלל.
  */

  if (
    battalionName !== "גפן" &&
    fitnessLevel === "רמה 1"
  ) {
    if (
      runScore === null ||
      pullScore === null ||
      pushScore === null
    ) {
      return null;
    }

    return Math.round(
      runScore * 0.6 +
      pullScore * 0.2 +
      pushScore * 0.2
    );
  }

  if (
    runScore === null ||
    sprintScore === null ||
    pullScore === null ||
    pushScore === null ||
    trapScore === null
  ) {
    return null;
  }

  return Math.round(
    runScore * 0.3 +
    sprintScore * 0.1 +
    pullScore * 0.2 +
    pushScore * 0.2 +
    trapScore * 0.2
  );
}

function calculateOverallTestStatus(
  runStatus: TestStatus,
  shootingStatus: TestStatus,
  finalScore: number | null
): TestStatus {
  if (
    runStatus === "נכשל" ||
    shootingStatus === "נכשל"
  ) {
    return "נכשל";
  }

  if (
    runStatus !== "עבר" ||
    shootingStatus !== "עבר" ||
    finalScore === null
  ) {
    return "טרם חושב";
  }

  if (
    finalScore >= 95
  ) {
    return "מצטיין";
  }

  return "עבר";
}

function calculateFitnessOverallStatus(
  result: ResultRow,
  statuses: TestStatus[],
  finalScore: number | null
): TestStatus {
  const enteredValues = [
    result.runTime,
    result.sprintTime,
    result.pullUps,
    result.chestPress,
    result.trapBar,
  ].filter(
    (value) =>
      Boolean(
        value.trim()
      )
  );

  if (
    enteredValues.length < 5
  ) {
    return "טרם חושב";
  }

  if (
    statuses.some(
      (status) =>
        status === "נכשל"
    )
  ) {
    return "נכשל";
  }

  if (
    statuses.some(
      (status) =>
        status === "אין מערך"
    )
  ) {
    return "אין מערך";
  }

  if (
    finalScore === null
  ) {
    return "טרם חושב";
  }

  /*
    כלל אחיד:
    ציון סופי 95 ומעלה = מצטיין.
  */
  if (
    finalScore >= 95
  ) {
    return "מצטיין";
  }

  return "עבר";
}

/* =========================================================
   PAGE
========================================================= */

export default function TestPage() {
  const {
    isViewer,
  } = useAuth();

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

  /* =======================================================
     TEST TYPES
  ======================================================= */

  const isImprovedLoran =
    testName.includes(
      "לורן משופר"
    );

  const isMMTest =
    testName.includes(
      'בוחן מ"מ'
    ) ||
    testName.includes(
      "בוחן מ״מ"
    );

  /*
    בוחן מ"מ משתמש באותו
    מבנה הזנה כמו לורן משופר.
  */
  const usesImprovedLoranLayout =
    isImprovedLoran ||
    isMMTest;

  const isRegularLoran =
    testName.includes(
      "לורן"
    ) &&
    !isImprovedLoran;

  const isAnyLoranStyleTest =
    isRegularLoran ||
    usesImprovedLoranLayout;

  const isFitnessTest =
    testName.includes(
      'כש"ג'
    ) ||
    testName.includes(
      "כש״ג"
    );

  const isOpeningFitness =
    isFitnessTest &&
    testName.includes(
      "פתיחה"
    );

  const isFinalFitness =
    isFitnessTest &&
    (
      testName.includes(
        "סוף"
      ) ||
      testName.includes(
        "סיום"
      )
    );

  /* =======================================================
     STATE
  ======================================================= */

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
    cadets,
    setCadets,
  ] =
    useState<Cadet[]>(
      []
    );

  const [
    results,
    setResults,
  ] =
    useState<
      ResultRow[]
    >([]);

  const [
    savedMessage,
    setSavedMessage,
  ] =
    useState("");

  const [
    cloudMessage,
    setCloudMessage,
  ] =
    useState("");

  const [
    cloudLoading,
    setCloudLoading,
  ] =
    useState(false);

  const [
    attempt,
    setAttempt,
  ] =
    useState(1);

  const [
    maxAttempt,
    setMaxAttempt,
  ] =
    useState(3);

  /* =======================================================
     STORAGE / ACTIVE CYCLE
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

  const isReadOnly =
    activeCycle?.status === "closed" ||
    isViewer;

  const cadetsStorageKey =
    activeCycle
      ? getCadetsStorageKey(
          battalionName,
          activeCycle.id
        )
      : getLegacyCadetsStorageKey(
          battalionName
        );

  const resultsStorageKey =
    activeCycle
      ? getResultsStorageKey(
          battalionName,
          activeCycle.id,
          testName
        )
      : getLegacyResultsStorageKey(
          battalionName,
          testName
        );

  const cloudCycleId =
    activeCycle?.id ||
    `legacy-${battalionName}`;

  const attemptLabel =
    getAttemptLabel(
      attempt
    );

  /*
    מועד א׳ ממשיך להשתמש במפתח הישן כדי לשמור
    תאימות מלאה לנתונים שכבר קיימים.
    מועדים ב׳/ג׳ מקבלים מפתח נפרד.
  */
  const attemptResultsStorageKey =
    attempt === 1
      ? resultsStorageKey
      : `${resultsStorageKey}-attempt-${attempt}`;

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
     LOAD CADETS
     Supabase first, localStorage fallback
  ======================================================= */

  useEffect(() => {
    if (!cycleLoaded) {
      return;
    }

    let cancelled = false;

    async function loadCadets() {
      setCloudLoading(true);

      const { data, error } =
        await supabase
          .from("cadet_cycle_memberships")
          .select(`
            global_id,
            cadet_number,
            company,
            team,
            loran_population,
            medical_status,
            course_status,
            fitness_level,
            shooting_level,
            previous_battalion,
            notes,
            cadets (
              name,
              gender,
              brigade,
              unit
            )
          `)
          .eq("cycle_id", cloudCycleId)
          .eq("battalion", battalionName)
          .order("cadet_number", {
            ascending: true,
          });

      if (
        !cancelled &&
        !error &&
        data &&
        data.length > 0
      ) {
        const rows =
          data as unknown as
            CloudMembershipRow[];

        const allCadets =
          rows.map(
            (
              row,
              index
            ): Cadet => {
              const identity =
                Array.isArray(row.cadets)
                  ? row.cadets[0]
                  : row.cadets;

              return {
                id:
                  row.cadet_number ||
                  index + 1,

                globalId:
                  row.global_id,

                name:
                  identity?.name ||
                  "",

                gender:
                  identity?.gender ||
                  "",

                brigade:
                  identity?.brigade ||
                  "",

                unit:
                  identity?.unit ||
                  "",

                company:
                  row.company ||
                  "",

                team:
                  row.team ||
                  "",

                loranPopulation:
                  row.loran_population ||
                  "",

                medicalStatus:
                  row.medical_status ||
                  "כשיר",

                courseStatus:
                  row.course_status ||
                  "פעיל",

                fitnessLevel:
                  row.fitness_level ||
                  "",

                shootingLevel:
                  row.shooting_level ||
                  "",

                previousBattalion:
                  row.previous_battalion ||
                  "",

                notes:
                  row.notes ||
                  "",
              };
            }
          );

        const active =
          allCadets.filter(
            (cadet) =>
              Boolean(
                cadet.name.trim()
              ) &&
              cadet.courseStatus ===
                "פעיל"
          );

        setCadets(active);

        localStorage.setItem(
          cadetsStorageKey,
          JSON.stringify(
            allCadets
          )
        );

        setCloudMessage(
          "הצוערים נטענו מהענן"
        );
        setCloudLoading(false);
        return;
      }

      if (!cancelled && error) {
        console.error(
          "שגיאה בטעינת צוערים מ-Supabase:",
          error
        );

        setCloudMessage(
          "טעינת הצוערים מהענן נכשלה — מוצג העותק המקומי"
        );
      }

      const saved =
        localStorage.getItem(
          cadetsStorageKey
        );

      if (!saved) {
        if (!cancelled) {
          setCadets([]);
          setCloudLoading(false);
        }
        return;
      }

      try {
        const parsed =
          JSON.parse(saved) as Cadet[];

        setCadets(
          parsed.filter(
            (cadet) =>
              Boolean(
                cadet.name?.trim()
              ) &&
              cadet.courseStatus ===
                "פעיל"
          )
        );
      } catch (error) {
        console.error(
          "שגיאה בטעינת הצוערים:",
          error
        );
        setCadets([]);
      } finally {
        if (!cancelled) {
          setCloudLoading(false);
        }
      }
    }

    loadCadets();

    return () => {
      cancelled = true;
    };
  }, [
    battalionName,
    cadetsStorageKey,
    cloudCycleId,
    cycleLoaded,
  ]);

  /* =======================================================
     LOAD AVAILABLE ATTEMPTS
     נשמרים בענן גם אם עדיין אין תוצאה במועד החדש
  ======================================================= */

  useEffect(() => {
    if (!cycleLoaded) {
      return;
    }

    let cancelled =
      false;

    async function loadAvailableAttempts() {
      /*
        1. מקור ראשי: טבלת test_attempts.
      */
      const {
        data:
          attemptRows,
        error:
          attemptsError,
      } =
        await supabase
          .from(
            "test_attempts"
          )
          .select(
            "attempt"
          )
          .eq(
            "cycle_id",
            cloudCycleId
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
        !cancelled &&
        !attemptsError &&
        attemptRows
      ) {
        const values =
          attemptRows
            .map(
              (row) =>
                Number(
                  row.attempt
                )
            )
            .filter(
              (value) =>
                Number.isFinite(
                  value
                ) &&
                value >= 1
            );

        const highest =
          values.length > 0
            ? Math.max(
                3,
                ...values
              )
            : 3;

        setMaxAttempt(
          highest
        );

        return;
      }

      /*
        2. fallback:
        אם הטבלה החדשה עדיין ריקה/לא זמינה,
        מזהים לפי תוצאות קיימות.
      */
      const {
        data:
          resultRows,
        error:
          resultsError,
      } =
        await supabase
          .from(
            "test_results"
          )
          .select(
            "attempt"
          )
          .eq(
            "cycle_id",
            cloudCycleId
          )
          .eq(
            "battalion",
            battalionName
          )
          .eq(
            "test_name",
            testName
          );

      if (
        cancelled ||
        resultsError ||
        !resultRows
      ) {
        return;
      }

      const attempts =
        resultRows
          .map(
            (row) =>
              Number(
                row.attempt ||
                1
              )
          )
          .filter(
            (value) =>
              Number.isFinite(
                value
              ) &&
              value >= 1
          );

      setMaxAttempt(
        attempts.length > 0
          ? Math.max(
              3,
              ...attempts
            )
          : 3
      );
    }

    loadAvailableAttempts();

    return () => {
      cancelled =
        true;
    };
  }, [
    battalionName,
    cloudCycleId,
    cycleLoaded,
    testName,
  ]);

  /* =======================================================
     LOAD CURRENT TEST RESULTS
     Supabase first, localStorage fallback
  ======================================================= */

  useEffect(() => {
    if (!cycleLoaded) {
      return;
    }

    let cancelled = false;

    async function loadResults() {
      setCloudLoading(true);

      const { data, error } =
        await supabase
          .from("test_results")
          .select(`
            cadet_id,
            attempt,
            run_time,
            sprint_time,
            pull_ups,
            chest_press,
            trap_bar,
            shooting_score,
            notes
          `)
          .eq("cycle_id", cloudCycleId)
          .eq("battalion", battalionName)
          .eq("test_name", testName)
          .eq("attempt", attempt)
          .order("cadet_id", {
            ascending: true,
          });

      if (
        !cancelled &&
        !error &&
        data &&
        data.length > 0
      ) {
        const loaded =
          (
            data as
              CloudTestResultRow[]
          )
            .filter(
              (row) =>
                row.cadet_id !== null
            )
            .map(
              (row): ResultRow => ({
                ...createEmptyResult(
                  row.cadet_id || 0
                ),
                cadetId:
                  row.cadet_id || 0,
                runTime:
                  row.run_time || "",
                sprintTime:
                  row.sprint_time || "",
                pullUps:
                  row.pull_ups || "",
                chestPress:
                  row.chest_press || "",
                trapBar:
                  row.trap_bar || "",
                shootingScore:
                  row.shooting_score || "",
                notes:
                  row.notes || "",
              })
            );

        setResults(loaded);

        localStorage.setItem(
          attemptResultsStorageKey,
          JSON.stringify(loaded)
        );

        setCloudMessage(
          `תוצאות ${attemptLabel} נטענו מהענן`
        );
        setCloudLoading(false);
        return;
      }

      if (!cancelled && error) {
        console.error(
          "שגיאה בטעינת תוצאות מ-Supabase:",
          error
        );

        setCloudMessage(
          "טעינת התוצאות מהענן נכשלה — מוצג העותק המקומי"
        );
      }

      const saved =
        localStorage.getItem(
          attemptResultsStorageKey
        );

      if (!saved) {
        if (!cancelled) {
          setResults([]);
          setCloudLoading(false);
        }
        return;
      }

      try {
        const parsed =
          JSON.parse(
            saved
          ) as Partial<ResultRow>[];

        const normalized =
          parsed.map(
            (result) => ({
              ...createEmptyResult(
                result.cadetId ?? 0
              ),
              ...result,
            })
          );

        if (!cancelled) {
          setResults(normalized);
        }
      } catch (error) {
        console.error(
          "שגיאה בטעינת התוצאות:",
          error
        );
        setResults([]);
      } finally {
        if (!cancelled) {
          setCloudLoading(false);
        }
      }
    }

    loadResults();

    return () => {
      cancelled = true;
    };
  }, [
    battalionName,
    cloudCycleId,
    cycleLoaded,
    attempt,
    attemptResultsStorageKey,
    testName,
  ]);

  /* =======================================================
     GET RESULT
  ======================================================= */

  function getResult(
    cadetId: number
  ): ResultRow {
    return (
      results.find(
        (result) =>
          result.cadetId ===
          cadetId
      ) ??
      createEmptyResult(
        cadetId
      )
    );
  }

  /* =======================================================
     UPDATE
  ======================================================= */

  function updateResult(
    cadetId: number,
    field: keyof Omit<
      ResultRow,
      "cadetId"
    >,
    value: string
  ) {
    if (isReadOnly) {
      return;
    }

    setResults(
      (current) => {
        const exists =
          current.some(
            (result) =>
              result.cadetId ===
              cadetId
          );

        if (exists) {
          return current.map(
            (result) =>
              result.cadetId ===
              cadetId
                ? {
                    ...result,
                    [field]:
                      value,
                  }
                : result
          );
        }

        return [
          ...current,

          {
            ...createEmptyResult(
              cadetId
            ),

            [field]:
              value,
          },
        ];
      }
    );

    setSavedMessage("");
  }

  /* =======================================================
     SAVE
     localStorage + Supabase
  ======================================================= */

  async function saveResults() {
    if (isReadOnly) {
      setSavedMessage(
        isViewer
          ? "המשתמש מחובר בהרשאת צפייה בלבד"
          : "המחזור סגור לקריאה בלבד"
      );
      return;
    }

    localStorage.setItem(
      attemptResultsStorageKey,
      JSON.stringify(results)
    );

    const sharedRows =
      results.map(
        (result) => {
          const cadet =
            cadets.find(
              (item) =>
                item.id ===
                result.cadetId
            );

          return {
            ...result,
            globalId:
              cadet?.globalId || "",
            cadetName:
              cadet?.name || "",
          };
        }
      );

    saveSharedTestResults(
      battalionName,
      testName,
      sharedRows,
      activeCycle?.id,
      attempt
    );

    const nonEmptyResults =
      results.filter(
        (result) =>
          Boolean(
            result.runTime ||
            result.sprintTime ||
            result.pullUps ||
            result.chestPress ||
            result.trapBar ||
            result.shootingScore ||
            result.notes
          )
      );

    setSavedMessage(
      "שומר תוצאות לענן..."
    );

    try {
      /*
        שומרים את עצם קיום המועד בענן,
        גם אם אין עדיין תוצאה באף שדה.
      */
      const {
        error:
          attemptError,
      } =
        await supabase
          .from(
            "test_attempts"
          )
          .upsert(
            {
              cycle_id:
                cloudCycleId,

              battalion:
                battalionName,

              test_name:
                testName,

              attempt,
            },
            {
              onConflict:
                "cycle_id,battalion,test_name,attempt",
            }
          );

      if (
        attemptError
      ) {
        throw new Error(
          `שמירת המועד: ${attemptError.message}`
        );
      }

      const { error: deleteError } =
        await supabase
          .from("test_results")
          .delete()
          .eq(
            "cycle_id",
            cloudCycleId
          )
          .eq(
            "battalion",
            battalionName
          )
          .eq(
            "test_name",
            testName
          )
          .eq(
            "attempt",
            attempt
          );

      if (deleteError) {
        throw new Error(
          `ניקוי תוצאות קודמות: ${deleteError.message}`
        );
      }

      const cloudRows =
        nonEmptyResults
          .map(
            (result) => {
              const cadet =
                cadets.find(
                  (item) =>
                    item.id ===
                    result.cadetId
                );

              if (!cadet?.globalId) {
                return null;
              }

              return {
                id:
                  `result:${cloudCycleId}::${battalionName}::${testName}::attempt-${attempt}::${cadet.globalId}`,

                attempt,

                global_id:
                  cadet.globalId,

                cycle_id:
                  cloudCycleId,

                cadet_id:
                  result.cadetId,

                cadet_name:
                  cadet.name,

                battalion:
                  battalionName,

                test_name:
                  testName,

                stage:
                  isOpeningFitness
                    ? "פתיחה"
                    : isFinalFitness
                    ? "סיום"
                    : "אחר",

                cycle_name:
                  activeCycle?.name ||
                  "נתונים קודמים",

                run_time:
                  result.runTime ||
                  null,

                sprint_time:
                  result.sprintTime ||
                  null,

                pull_ups:
                  result.pullUps ||
                  null,

                chest_press:
                  result.chestPress ||
                  null,

                trap_bar:
                  result.trapBar ||
                  null,

                shooting_score:
                  result.shootingScore ||
                  null,

                notes:
                  result.notes ||
                  null,

                updated_at:
                  new Date()
                    .toISOString(),
              };
            }
          )
          .filter(
            (
              row
            ): row is NonNullable<
              typeof row
            > =>
              row !== null
          );

      if (cloudRows.length > 0) {
        const {
          error: insertError,
        } =
          await supabase
            .from("test_results")
            .insert(cloudRows);

        if (insertError) {
          throw new Error(
            `שמירת תוצאות: ${insertError.message}`
          );
        }
      }

      setSavedMessage(
        activeCycle
          ? `תוצאות ${attemptLabel} נשמרו בענן ובהצלחה`
          : `תוצאות ${attemptLabel} נשמרו בענן תחת נתונים קיימים`
      );

      setCloudMessage(
        "מסונכרן עם Supabase"
      );
    } catch (error) {
      console.error(
        "שגיאה בשמירת תוצאות לענן:",
        error
      );

      setSavedMessage(
        error instanceof Error
          ? `התוצאות נשמרו מקומית, אך הסנכרון לענן נכשל: ${error.message}`
          : "התוצאות נשמרו מקומית, אך הסנכרון לענן נכשל"
      );
    }

    setTimeout(() => {
      setSavedMessage("");
    }, 5000);
  }

  /* =======================================================
     CALCULATIONS
  ======================================================= */

  const calculatedResults =
    useMemo(() => {
      return cadets.map(
        (cadet) => {
          const result =
            getResult(
              cadet.id
            );

          /* ===============================================
             REGULAR LORAN
          =============================================== */

          const regularArray =
            isRegularLoran
              ? getRegularLoranArray(
                  cadet.loranPopulation
                )
              : null;

          const regularPassingTime =
            isRegularLoran
              ? getRegularLoranPassingTime(
                  cadet.loranPopulation
                )
              : null;

          const regularRunningScore =
            isRegularLoran
              ? calculateRegularLoranRunningScore(
                  result.runTime,
                  cadet.loranPopulation
                )
              : null;

          /* ===============================================
             IMPROVED / MM
          =============================================== */

          const improvedStyleRunningScore =
            usesImprovedLoranLayout
              ? calculateImprovedRunningScore(
                  result.runTime
                )
              : null;

          /* ===============================================
             RUNNING SCORE
          =============================================== */

          const runningScore =
            isRegularLoran
              ? regularRunningScore
              : usesImprovedLoranLayout
              ? improvedStyleRunningScore
              : null;

          /* ===============================================
             FINAL SCORE
             מידע בלבד
          =============================================== */

          const finalScore =
            isAnyLoranStyleTest
              ? calculateFinalScore(
                  runningScore,
                  result.shootingScore
                )
              : null;

          /* ===============================================
             RUN STATUS
          =============================================== */

          let runStatus:
            TestStatus =
            "טרם חושב";

          if (
            isRegularLoran
          ) {
            runStatus =
              calculateRegularRunStatus(
                result.runTime,
                cadet.loranPopulation
              );
          }

          if (
            isImprovedLoran
          ) {
            runStatus =
              calculateImprovedStyleRunStatus(
                result.runTime,
                IMPROVED_LORAN_MAX_PASS_TIME
              );
          }

          if (
            isMMTest
          ) {
            runStatus =
              calculateImprovedStyleRunStatus(
                result.runTime,
                MM_MAX_PASS_TIME
              );
          }

          /* ===============================================
             SHOOTING STATUS
          =============================================== */

          const shootingStatus =
            isAnyLoranStyleTest
              ? calculateShootingStatus(
                  result.shootingScore,
                  cadet
                )
              : "טרם חושב";

          const shootingPassScore =
            getShootingPassScore(
              cadet
            );

          /*
            בדקל/רימון:
            רמה 1 = שריון + הנדסה
            רמה 2 = חי"ר
            רמה 3 = מיוחדות

            בגפן אין חלוקה לרמות.
          */
          const fitnessPopulation =
            battalionName === "גפן"
              ? undefined
              : cadet.fitnessLevel;

          const fitnessRun =
            isFitnessTest
              ? evaluateFitnessMetric(
                  battalionName,
                  testName,
                  '3 ק"מ',
                  result.runTime,
                  true,
                  fitnessPopulation
                )
              : {
                  status:
                    "טרם חושב" as TestStatus,
                  threshold:
                    null,
                  excellenceThreshold:
                    null,
                };

          const fitnessSprint =
            isFitnessTest
              ? evaluateFitnessMetric(
                  battalionName,
                  testName,
                  "2×150",
                  result.sprintTime,
                  true,
                  fitnessPopulation
                )
              : {
                  status:
                    "טרם חושב" as TestStatus,
                  threshold:
                    null,
                  excellenceThreshold:
                    null,
                };

          const fitnessPullUps =
            isFitnessTest
              ? evaluateFitnessMetric(
                  battalionName,
                  testName,
                  battalionName === "גפן"
                    ? 'מתח 15 ק"ג'
                    : "מתח",
                  result.pullUps,
                  false,
                  fitnessPopulation
                )
              : {
                  status:
                    "טרם חושב" as TestStatus,
                  threshold:
                    null,
                  excellenceThreshold:
                    null,
                };

          const fitnessChestPress =
            isFitnessTest
              ? evaluateFitnessMetric(
                  battalionName,
                  testName,
                  battalionName === "גפן"
                    ? "לחיצת חזה 60 ק״ג"
                    : fitnessPopulation === "רמה 1"
                    ? "מקבילים"
                    : "לחיצת חזה",
                  result.chestPress,
                  false,
                  fitnessPopulation
                )
              : {
                  status:
                    "טרם חושב" as TestStatus,
                  threshold:
                    null,
                  excellenceThreshold:
                    null,
                };

          const fitnessTrapBar =
            isFitnessTest
              ? evaluateFitnessMetric(
                  battalionName,
                  testName,
                  battalionName === "גפן"
                    ? "טראפבר 90 ק״ג"
                    : "טראפבר",
                  result.trapBar,
                  false,
                  fitnessPopulation
                )
              : {
                  status:
                    "טרם חושב" as TestStatus,
                  threshold:
                    null,
                  excellenceThreshold:
                    null,
                };

          const fitnessFinalScore =
            isFitnessTest
              ? calculateFitnessFinalScore(
                  battalionName,
                  cadet.fitnessLevel,
                  result
                )
              : null;

          const fitnessOverallStatus =
            isFitnessTest
              ? calculateFitnessOverallStatus(
                  result,
                  [
                    fitnessRun.status,
                    fitnessSprint.status,
                    fitnessPullUps.status,
                    fitnessChestPress.status,
                    fitnessTrapBar.status,
                  ],
                  fitnessFinalScore
                )
              : "טרם חושב";

          const overallStatus =
            isAnyLoranStyleTest
              ? calculateOverallTestStatus(
                  runStatus,
                  shootingStatus,
                  finalScore
                )
              : "טרם חושב";

          return {
            cadet,
            result,

            regularArray,
            regularPassingTime,

            runningScore,
            finalScore,

            shootingPassScore,

            runStatus,
            shootingStatus,

            fitnessRun,
            fitnessSprint,
            fitnessPullUps,
            fitnessChestPress,
            fitnessTrapBar,
            fitnessFinalScore,
            fitnessOverallStatus,

            overallStatus,
          };
        }
      );
    }, [
      cadets,
      results,
      isRegularLoran,
      isImprovedLoran,
      isMMTest,
      usesImprovedLoranLayout,
      isAnyLoranStyleTest,
      isFitnessTest,
      battalionName,
      testName,
    ]);

  /* =======================================================
     TESTED
  ======================================================= */

  const tested =
    calculatedResults.filter(
      (row) => {
        if (
          isAnyLoranStyleTest
        ) {
          return Boolean(
            row.result.runTime ||
              row.result
                .shootingScore
          );
        }

        if (
          isFitnessTest
        ) {
          return Boolean(
            row.result.runTime ||
              row.result
                .sprintTime ||
              row.result
                .pullUps ||
              row.result
                .chestPress ||
              row.result
                .trapBar
          );
        }

        return false;
      }
    );

  /* =======================================================
     SUMMARY
  ======================================================= */

  const runPassed =
    tested.filter(
      (row) =>
        row.runStatus ===
        "עבר"
    );

  const runFailed =
    tested.filter(
      (row) =>
        row.runStatus ===
        "נכשל"
    );

  const shootingPassed =
    tested.filter(
      (row) =>
        row.shootingStatus ===
        "עבר"
    );

  const shootingFailed =
    tested.filter(
      (row) =>
        row.shootingStatus ===
        "נכשל"
    );

  const fullyPassed =
    tested.filter(
      (row) =>
        row.runStatus ===
          "עבר" &&
        row.shootingStatus ===
          "עבר"
    );

  const missingShootingThreshold =
    tested.filter(
      (row) =>
        row.shootingStatus ===
        "חסר סף"
    );

  const withoutArray =
    isRegularLoran
      ? calculatedResults.filter(
          (row) =>
            row.cadet.name &&
            !row.regularArray
        ).length
      : 0;

  const fitnessExcellent =
    isFitnessTest
      ? calculatedResults.filter(
          (row) =>
            row.fitnessOverallStatus ===
            "מצטיין"
        )
      : [];

  const fitnessPassed =
    isFitnessTest
      ? calculatedResults.filter(
          (row) =>
            row.fitnessOverallStatus ===
              "עבר" ||
            row.fitnessOverallStatus ===
              "מצטיין"
        )
      : [];

  const fitnessFailed =
    isFitnessTest
      ? calculatedResults.filter(
          (row) =>
            row.fitnessOverallStatus ===
            "נכשל"
        )
      : [];

  const fitnessWithoutStandard =
    isFitnessTest
      ? calculatedResults.filter(
          (row) =>
            row.fitnessOverallStatus ===
            "אין מערך"
        )
      : [];

  /* =======================================================
     DESCRIPTION
  ======================================================= */

  function getDescription() {
    if (
      isRegularLoran
    ) {
      return "לורן רגיל – מעבר בריצה לפי המערך האישי ומעבר בירי לפי סף הקליעה";
    }

    if (
      isImprovedLoran
    ) {
      return "לורן משופר – ריצה וירי נבדקים בנפרד";
    }

    if (
      isMMTest
    ) {
      return 'בוחן מ"מ – מבנה הזנה זהה ללורן משופר';
    }

    if (
      isOpeningFitness
    ) {
      return "כש״ג פתיחה";
    }

    if (
      isFinalFitness
    ) {
      return "כש״ג סוף";
    }

    return testName;
  }

  function getImprovedStylePassTime() {
    if (
      isMMTest
    ) {
      return "39:59";
    }

    return "39:59";
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

        <div className="max-w-[1950px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">

          <div>

            <p className="text-slate-300">
              גדוד{" "}
              {battalionName}
            </p>

            <p className="text-slate-400 text-sm mt-1">
              מחזור:{" "}
              <strong className="text-white">
                {activeCycle?.name ||
                  "נתונים קיימים"}
              </strong>
              {isViewer
                ? " · 👁️ צפייה בלבד"
                : activeCycle?.status === "closed"
                ? " · 🔒 מחזור סגור"
                : ""}
            </p>

            <h1 className="text-2xl sm:text-3xl font-bold">
              {testName}
            </h1>

            <p className="text-slate-300 mt-1">
              {getDescription()}
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

      <div className="max-w-[1950px] mx-auto p-4 sm:p-6 lg:p-8">

        {isReadOnly && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-4 mb-6 font-medium">
            {isViewer
              ? "👁️ מצב צפייה בלבד — ניתן לצפות בתוצאות אך לא לערוך או לשמור."
              : "🔒 המחזור סגור — הנתונים מוצגים לקריאה בלבד ולא ניתן לערוך או לשמור תוצאות."}
          </div>
        )}

        {cloudLoading && (
          <div className="bg-blue-50 border border-blue-100 text-blue-800 rounded-2xl p-4 mb-6">
            ☁️ טוען נתונים מהענן...
          </div>
        )}

        {!cloudLoading &&
          cloudMessage && (
          <div className="bg-white border border-slate-200 text-slate-600 rounded-2xl px-4 py-3 mb-6 text-sm">
            ☁️ {cloudMessage}
          </div>
        )}

        <section className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 mb-6">
          <div className="flex flex-col gap-4">

            <div>
              <h2 className="font-bold text-lg">
                מועד הבוחן
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                כל מועד נשמר בנפרד. ניתן להוסיף מועדים נוספים ללא הגבלה, בלי למחוק תוצאות קודמות.
              </p>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">

              {Array.from(
                {
                  length:
                    maxAttempt,
                },
                (_, index) =>
                  index + 1
              ).map(
                (item) => (

                  <button
                    key={item}
                    type="button"
                    onClick={() =>
                      setAttempt(
                        item
                      )
                    }
                    className={
                      attempt === item
                        ? "shrink-0 rounded-xl bg-slate-900 text-white px-5 py-3 font-bold"
                        : "shrink-0 rounded-xl border border-slate-200 bg-white text-slate-700 px-5 py-3 font-bold hover:bg-slate-50"
                    }
                  >
                    {getAttemptLabel(
                      item
                    )}
                  </button>

                )
              )}

              {!isReadOnly && (
                <button
                  type="button"
                  onClick={
                    async () => {
                      const next =
                        maxAttempt +
                        1;

                      const {
                        error,
                      } =
                        await supabase
                          .from(
                            "test_attempts"
                          )
                          .upsert(
                            {
                              cycle_id:
                                cloudCycleId,

                              battalion:
                                battalionName,

                              test_name:
                                testName,

                              attempt:
                                next,
                            },
                            {
                              onConflict:
                                "cycle_id,battalion,test_name,attempt",
                            }
                          );

                      if (
                        error
                      ) {
                        console.error(
                          "שגיאה ביצירת מועד חדש:",
                          error
                        );

                        setSavedMessage(
                          `לא ניתן ליצור מועד חדש בענן: ${error.message}`
                        );

                        return;
                      }

                      setMaxAttempt(
                        next
                      );

                      setAttempt(
                        next
                      );

                      setSavedMessage(
                        `${getAttemptLabel(
                          next
                        )} נוצר ונשמר בענן`
                      );
                    }
                  }
                  className="shrink-0 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 px-5 py-3 font-bold hover:bg-blue-100"
                >
                  + מועד נוסף
                </button>
              )}

            </div>

          </div>

          <div className="mt-3 text-sm font-medium text-blue-700">
            מציג כעת: {getAttemptLabel(
              attempt
            )}
          </div>
        </section>

        {/* =================================================
            KPI
        ================================================= */}

        {isAnyLoranStyleTest && (

          <section className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-5 mb-8">

            <StatCard
              title='סה"כ נבחנים'
              value={
                tested.length.toString()
              }
            />

            <StatCard
              title="עברו ריצה"
              value={
                runPassed.length.toString()
              }
            />

            <StatCard
              title="נכשלו בריצה"
              value={
                runFailed.length.toString()
              }
            />

            <StatCard
              title="נכשלו בירי"
              value={
                shootingFailed.length.toString()
              }
            />

            <StatCard
              title="עברו ריצה + ירי"
              value={
                fullyPassed.length.toString()
              }
            />

          </section>

        )}

        {!isAnyLoranStyleTest && (

          <section className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-5 mb-8">

            <StatCard
              title='סה"כ נבחנים'
              value={
                tested.length.toString()
              }
            />

            <StatCard
              title="עברו"
              value={
                fitnessPassed.length.toString()
              }
            />

            <StatCard
              title="מצטיינים"
              value={
                fitnessExcellent.length.toString()
              }
            />

            <StatCard
              title="נכשלו"
              value={
                fitnessFailed.length.toString()
              }
            />

            <StatCard
              title="צוערים פעילים"
              value={
                cadets.length.toString()
              }
            />

          </section>

        )}

        {isFitnessTest &&
          fitnessWithoutStandard.length >
            0 && (

          <WarningBox>
            לא נמצא סף מלא לחלק מהצוערים. בגפן הסף אחיד; בדקל וברימון רמת הכש״ג חייבת להיות רמה 1, רמה 2 או רמה 3.
          </WarningBox>

        )}

        {/* =================================================
            REGULAR LORAN
        ================================================= */}

        {isRegularLoran && (

          <section className="bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-8">

            <h2 className="text-xl font-bold">
              לורן רגיל
            </h2>

            <p className="text-slate-600 mt-2">
              סף הריצה משתנה לפי
              אוכלוסיית הלורן של
              הצוער. הירי נבדק
              בנפרד לפי סף הקליעה
              האישי.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-5">

              <ArrayCard
                title="מערך 1"
                population="מתמרן"
                passing="23:15"
              />

              <ArrayCard
                title="מערך 2"
                population='חי"ר'
                passing="22:15"
              />

              <ArrayCard
                title="מערך 3"
                population="יחידות מובחרות"
                passing="21:15"
              />

              <ArrayCard
                title="מערך 4"
                population="לוחמת / לוחמת מיוחדת"
                passing="28:08"
              />

            </div>

            {withoutArray >
              0 && (

              <WarningBox>
                {withoutArray} צוערים
                עדיין ללא אוכלוסיית
                לורן תקינה.
              </WarningBox>

            )}

          </section>

        )}

        {/* =================================================
            IMPROVED / MM INFO
        ================================================= */}

        {usesImprovedLoranLayout && (

          <section
            className={
              isMMTest
                ? "bg-violet-50 border border-violet-100 rounded-2xl p-5 mb-8"
                : "bg-blue-50 border border-blue-100 rounded-2xl p-5 mb-8"
            }
          >

            <h2 className="text-xl font-bold">

              {isMMTest
                ? 'בוחן מ"מ'
                : "לורן משופר"}

            </h2>

            <p className="text-slate-600 mt-2">

              מעבר בריצה: עד{" "}
              <strong>
                {getImprovedStylePassTime()}
              </strong>
              .

              {" "}

              מעבר בירי נקבע לפי
              סף הקליעה האישי של
              הצוער.

            </p>

            <p className="text-slate-600 mt-1">

              הציון המשוקלל
              70% ריצה + 30% ירי
              נשמר לצורך מידע וניתוח,
              אך אינו קובע עבר/נכשל.

            </p>

            {isMMTest && (

              <p className="text-violet-700 font-medium mt-3">
                בוחן זה נשמר בנפרד
                מלורן משופר ומופיע
                בתיק האישי כבוחן
                מ״מ.
              </p>

            )}

          </section>

        )}

        {/* =================================================
            WARNINGS
        ================================================= */}

        {isAnyLoranStyleTest &&
          missingShootingThreshold.length >
            0 && (

          <WarningBox>

            ל־
            {
              missingShootingThreshold.length
            }{" "}
            צוערים חסר סף ירי.
            יש להשלים רמת קליעה
            בניהול הצוערים.

          </WarningBox>

        )}

        {/* =================================================
            RESULTS
        ================================================= */}

        <section className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">

            <div>

              <h2 className="text-2xl font-bold">
                הזנת תוצאות
              </h2>

              <p className="text-slate-500 mt-1">

                מוצגות כאן רק
                תוצאות{" "}

                <strong>
                  {testName}
                </strong>
                .

                {" "}

                הנתונים נשמרים גם
                בתיק האישי.

              </p>

            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 w-full md:w-auto">

              {savedMessage && (

                <span className="text-green-700 font-medium">
                  {savedMessage}
                </span>

              )}

              <button
                type="button"
                onClick={
                  saveResults
                }
                disabled={
                  isReadOnly
                }
                className={
                  isReadOnly
                    ? "w-full sm:w-auto bg-slate-300 text-slate-500 px-5 py-3 rounded-xl cursor-not-allowed"
                    : "w-full sm:w-auto bg-slate-900 text-white px-5 py-3 rounded-xl hover:bg-slate-700"
                }
              >
                {isReadOnly
                  ? "🔒 קריאה בלבד"
                  : "שמירת תוצאות"}
              </button>

            </div>

          </div>

          {cadets.length ===
          0 ? (

            <div className="border-2 border-dashed border-slate-200 rounded-xl p-10 text-center">

              <p className="font-bold">
                אין צוערים פעילים
              </p>

            </div>

          ) : isAnyLoranStyleTest ? (

            /* =============================================
               LORAN / IMPROVED / MM
            ============================================= */

            <>
              <div className="md:hidden space-y-4">

                {calculatedResults.map(
                  (row) => {

                    const shooting =
                      row.result.shootingScore
                        ? Number(
                            row.result.shootingScore
                          )
                        : null;

                    const failed =
                      row.runStatus === "נכשל" ||
                      row.shootingStatus === "נכשל";

                    return (
                      <div
                        key={
                          row.cadet.globalId ||
                          row.cadet.id
                        }
                        className={
                          failed
                            ? "border border-red-200 bg-red-50/50 rounded-2xl p-4"
                            : "border border-slate-200 bg-white rounded-2xl p-4"
                        }
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs text-slate-400">
                              צוער מס׳ {row.cadet.id}
                            </p>
                            <h3 className="text-lg font-bold mt-1">
                              {row.cadet.name}
                            </h3>
                            {isRegularLoran && (
                              <p className="text-sm text-slate-500 mt-1">
                                {row.cadet.loranPopulation || "אוכלוסייה לא הוגדרה"}
                                {row.regularArray
                                  ? ` • ${row.regularArray.name}`
                                  : ""}
                              </p>
                            )}
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <StatusBadge status={row.runStatus} />
                            <StatusBadge status={row.shootingStatus} />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-4">
                          <MobileField
                            label="סף ריצה"
                            value={
                              isRegularLoran
                                ? formatLoranTime(
                                    row.regularPassingTime
                                  )
                                : getImprovedStylePassTime()
                            }
                          />

                          <MobileField
                            label="סף ירי"
                            value={
                              row.shootingPassScore?.toString() ||
                              "חסר"
                            }
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-4">
                          <MobileInput
                            label="זמן ריצה"
                            value={row.result.runTime}
                            placeholder={
                              isRegularLoran
                                ? "21:30"
                                : "38:10"
                            }
                            disabled={isReadOnly}
                            inputMode="text"
                            onChange={(value) =>
                              updateResult(
                                row.cadet.id,
                                "runTime",
                                value
                              )
                            }
                          />

                          <MobileInput
                            label="ציון ירי"
                            value={row.result.shootingScore}
                            placeholder="0-100"
                            disabled={isReadOnly}
                            inputMode="numeric"
                            onChange={(value) =>
                              updateResult(
                                row.cadet.id,
                                "shootingScore",
                                value
                              )
                            }
                          />
                        </div>

                        <div className="grid grid-cols-3 gap-2 mt-4">
                          <MobileField
                            label="ציון ריצה"
                            value={
                              row.runningScore?.toString() ||
                              "—"
                            }
                          />

                          <MobileField
                            label="70% + 30%"
                            value={
                              row.finalScore?.toString() ||
                              "—"
                            }
                          />

                          <MobileField
                            label="ציון ירי"
                            value={
                              shooting !== null &&
                              !Number.isNaN(shooting)
                                ? shooting.toString()
                                : "—"
                            }
                          />
                        </div>

                        <div className="mt-4 flex justify-end">
                          <StatusBadge
                            status={
                              row.overallStatus
                            }
                          />
                        </div>

                        <div className="mt-4">
                          <MobileInput
                            label="הערות"
                            value={row.result.notes}
                            placeholder="הערות"
                            disabled={isReadOnly}
                            inputMode="text"
                            onChange={(value) =>
                              updateResult(
                                row.cadet.id,
                                "notes",
                                value
                              )
                            }
                          />
                        </div>
                      </div>
                    );
                  }
                )}

              </div>

              <div className="hidden md:block overflow-auto max-h-[720px] border border-slate-200 rounded-xl">

              <table className="w-full min-w-[2100px] border-collapse text-right">

                <thead className="bg-slate-100 sticky top-0 z-10">

                  <tr>

                    <TableHead>
                      מס׳
                    </TableHead>

                    <TableHead>
                      צוער
                    </TableHead>

                    {isRegularLoran && (
                      <>
                        <TableHead>
                          אוכלוסייה
                        </TableHead>

                        <TableHead>
                          מערך
                        </TableHead>
                      </>
                    )}

                    <TableHead>
                      סף ריצה
                    </TableHead>

                    <TableHead>
                      זמן
                    </TableHead>

                    <TableHead>
                      ציון ריצה
                    </TableHead>

                    <TableHead>
                      סטטוס ריצה
                    </TableHead>

                    <TableHead>
                      סף ירי
                    </TableHead>

                    <TableHead>
                      ציון ירי
                    </TableHead>

                    <TableHead>
                      סטטוס ירי
                    </TableHead>

                    <TableHead>
                      70%
                    </TableHead>

                    <TableHead>
                      30%
                    </TableHead>

                    <TableHead>
                      ציון סופי
                    </TableHead>

                    <TableHead>
                      סטטוס כללי
                    </TableHead>

                    <TableHead>
                      הערות
                    </TableHead>

                  </tr>

                </thead>

                <tbody>

                  {calculatedResults.map(
                    (row) => {

                      const shooting =
                        row.result
                          .shootingScore
                          ? Number(
                              row.result
                                .shootingScore
                            )
                          : null;

                      return (
                        <tr
                          key={
                            row.cadet.globalId ||
                            row.cadet.id
                          }
                          className={
                            row.runStatus ===
                              "נכשל" ||
                            row.shootingStatus ===
                              "נכשל"
                              ? "bg-red-50/40"
                              : "hover:bg-slate-50"
                          }
                        >

                          <TableCell>
                            {row.cadet.id}
                          </TableCell>

                          <TableCell>
                            <strong>
                              {row.cadet.name}
                            </strong>
                          </TableCell>

                          {/* REGULAR ONLY */}

                          {isRegularLoran && (
                            <>

                              <TableCell>
                                {row.cadet
                                  .loranPopulation ||
                                  "לא הוגדר"}
                              </TableCell>

                              <TableCell>

                                {row.regularArray ? (

                                  <span className="bg-blue-50 text-blue-700 border border-blue-100 px-3 py-1 rounded-lg font-bold">
                                    {
                                      row.regularArray
                                        .name
                                    }
                                  </span>

                                ) : (

                                  <span className="text-amber-700 font-bold">
                                    אין מערך
                                  </span>

                                )}

                              </TableCell>

                            </>
                          )}

                          {/* PASS TIME */}

                          <TableCell>

                            {isRegularLoran
                              ? formatLoranTime(
                                  row.regularPassingTime
                                )
                              : getImprovedStylePassTime()}

                          </TableCell>

                          {/* TIME */}

                          <TableCell>

                            <input
                              disabled={isReadOnly}
                              type="text"
                              value={
                                row.result.runTime
                              }
                              onChange={(
                                event
                              ) =>
                                updateResult(
                                  row.cadet.id,
                                  "runTime",
                                  event.target.value
                                )
                              }
                              placeholder={
                                isRegularLoran
                                  ? "21:30"
                                  : "38:10"
                              }
                              className="border rounded-lg px-3 py-2 w-28"
                            />

                          </TableCell>

                          {/* RUN SCORE */}

                          <TableCell>

                            <strong>
                              {row.runningScore ??
                                "—"}
                            </strong>

                          </TableCell>

                          {/* RUN STATUS */}

                          <TableCell>

                            <StatusBadge
                              status={
                                row.runStatus
                              }
                            />

                          </TableCell>

                          {/* SHOOTING PASS */}

                          <TableCell>

                            {row.shootingPassScore ??
                              (
                                <span className="text-amber-700">
                                  חסר
                                </span>
                              )}

                          </TableCell>

                          {/* SHOOTING */}

                          <TableCell>

                            <input
                              disabled={isReadOnly}
                              type="number"
                              min="0"
                              max="100"
                              value={
                                row.result
                                  .shootingScore
                              }
                              onChange={(
                                event
                              ) =>
                                updateResult(
                                  row.cadet.id,
                                  "shootingScore",
                                  event.target.value
                                )
                              }
                              className="border rounded-lg px-3 py-2 w-24"
                            />

                          </TableCell>

                          {/* SHOOTING STATUS */}

                          <TableCell>

                            <StatusBadge
                              status={
                                row.shootingStatus
                              }
                            />

                          </TableCell>

                          {/* 70 */}

                          <TableCell>

                            {row.runningScore !==
                            null
                              ? (
                                  row.runningScore *
                                  0.7
                                ).toFixed(
                                  1
                                )
                              : "—"}

                          </TableCell>

                          {/* 30 */}

                          <TableCell>

                            {shooting !==
                              null &&
                            !Number.isNaN(
                              shooting
                            )
                              ? (
                                  shooting *
                                  0.3
                                ).toFixed(
                                  1
                                )
                              : "—"}

                          </TableCell>

                          {/* FINAL */}

                          <TableCell>

                            <div className="font-bold">
                              {row.finalScore ??
                                "—"}
                            </div>

                            <div className="text-xs text-slate-400">
                              מידע בלבד
                            </div>

                          </TableCell>

                          {/* OVERALL STATUS */}

                          <TableCell>
                            <StatusBadge
                              status={
                                row.overallStatus
                              }
                            />
                          </TableCell>

                          {/* NOTES */}

                          <TableCell>

                            <input
                              disabled={isReadOnly}
                              type="text"
                              value={
                                row.result.notes
                              }
                              onChange={(
                                event
                              ) =>
                                updateResult(
                                  row.cadet.id,
                                  "notes",
                                  event.target.value
                                )
                              }
                              placeholder="הערות"
                              className="border rounded-lg px-3 py-2 w-52"
                            />

                          </TableCell>

                        </tr>
                      );
                    }
                  )}

                </tbody>

              </table>

              </div>
            </>

          ) : isFitnessTest ? (

            /* =============================================
               FITNESS
            ============================================= */

            <>
              <div className="md:hidden space-y-4">

                {calculatedResults.map(
                  (row) => (
                    <div
                      key={
                        row.cadet.globalId ||
                        row.cadet.id
                      }
                      className="border border-slate-200 bg-white rounded-2xl p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs text-slate-400">
                            צוער מס׳ {row.cadet.id}
                          </p>
                          <h3 className="text-lg font-bold mt-1">
                            {row.cadet.name}
                          </h3>
                        </div>

                        <div className="flex flex-col items-end gap-2">
                          <span className="bg-blue-50 text-blue-700 border border-blue-100 rounded-lg px-3 py-1 text-sm font-bold">
                            {row.cadet.fitnessLevel || "ללא רמה"}
                          </span>

                          <StatusBadge
                            status={
                              row.fitnessOverallStatus
                            }
                          />

                          <span className="inline-flex items-center justify-center min-w-16 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1 text-sm font-bold text-slate-700">
                            ציון {row.fitnessFinalScore ?? "—"}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <div>
                          <MobileInput
                            label='3 ק"מ'
                            value={row.result.runTime}
                            placeholder="13:20"
                            disabled={isReadOnly}
                            inputMode="text"
                            onChange={(value) =>
                              updateResult(
                                row.cadet.id,
                                "runTime",
                                value
                              )
                            }
                          />
                          <div className="mt-2">
                            <StatusBadge
                              status={
                                row.fitnessRun.status
                              }
                            />
                          </div>
                        </div>

                        <div>
                          <MobileInput
                            label="2×150"
                            value={row.result.sprintTime}
                            placeholder="00:55"
                            disabled={isReadOnly}
                            inputMode="text"
                            onChange={(value) =>
                              updateResult(
                                row.cadet.id,
                                "sprintTime",
                                value
                              )
                            }
                          />
                          <div className="mt-2">
                            <StatusBadge
                              status={
                                row.fitnessSprint.status
                              }
                            />
                          </div>
                        </div>

                        <div>
                          <MobileInput
                            label="מתח"
                            value={row.result.pullUps}
                            placeholder="0"
                            disabled={isReadOnly}
                            inputMode="numeric"
                            onChange={(value) =>
                              updateResult(
                                row.cadet.id,
                                "pullUps",
                                value
                              )
                            }
                          />
                          <div className="mt-2">
                            <StatusBadge
                              status={
                                row.fitnessPullUps.status
                              }
                            />
                          </div>
                        </div>

                        <div>
                          <MobileInput
                            label="לחיצת חזה / מקבילים"
                            value={row.result.chestPress}
                            placeholder="0"
                            disabled={isReadOnly}
                            inputMode="numeric"
                            onChange={(value) =>
                              updateResult(
                                row.cadet.id,
                                "chestPress",
                                value
                              )
                            }
                          />
                          <div className="mt-2">
                            <StatusBadge
                              status={
                                row.fitnessChestPress.status
                              }
                            />
                          </div>
                        </div>

                        <div>
                          <MobileInput
                            label="טראפ בר"
                            value={row.result.trapBar}
                            placeholder="0"
                            disabled={isReadOnly}
                            inputMode="numeric"
                            onChange={(value) =>
                              updateResult(
                                row.cadet.id,
                                "trapBar",
                                value
                              )
                            }
                          />
                          <div className="mt-2">
                            <StatusBadge
                              status={
                                row.fitnessTrapBar.status
                              }
                            />
                          </div>
                        </div>

                        <MobileField
                          label="שלב"
                          value={
                            isOpeningFitness
                              ? "פתיחה"
                              : isFinalFitness
                              ? "סוף"
                              : testName
                          }
                        />
                      </div>

                      <div className="mt-4">
                        <MobileInput
                          label="הערות"
                          value={row.result.notes}
                          placeholder="הערות"
                          disabled={isReadOnly}
                          inputMode="text"
                          onChange={(value) =>
                            updateResult(
                              row.cadet.id,
                              "notes",
                              value
                            )
                          }
                        />
                      </div>
                    </div>
                  )
                )}

              </div>

              <div className="hidden md:block overflow-auto max-h-[720px] border border-slate-200 rounded-xl">

              <table className="w-full min-w-[1500px] border-collapse text-right">

                <thead className="bg-slate-100 sticky top-0 z-10">

                  <tr>

                    <TableHead>
                      מס׳
                    </TableHead>

                    <TableHead>
                      צוער
                    </TableHead>

                    <TableHead>
                      רמת כש״ג
                    </TableHead>

                    <TableHead>
                      3 ק״מ
                    </TableHead>

                    <TableHead>
                      2×150
                    </TableHead>

                    <TableHead>
                      מתח
                    </TableHead>

                    <TableHead>
                      לחיצת חזה /
                      מקבילים
                    </TableHead>

                    <TableHead>
                      טראפ בר
                    </TableHead>

                    <TableHead>
                      ציון סופי
                    </TableHead>

                    <TableHead>
                      סטטוס כללי
                    </TableHead>

                    <TableHead>
                      הערות
                    </TableHead>

                  </tr>

                </thead>

                <tbody>

                  {calculatedResults.map(
                    (row) => (

                      <tr
                        key={
                          row.cadet.globalId ||
                          row.cadet.id
                        }
                        className="hover:bg-slate-50"
                      >

                        <TableCell>
                          {row.cadet.id}
                        </TableCell>

                        <TableCell>
                          <strong>
                            {row.cadet.name}
                          </strong>
                        </TableCell>

                        <TableCell>
                          {row.cadet.fitnessLevel ||
                            "—"}
                        </TableCell>

                        <TableCell>

                          <input
                            disabled={isReadOnly}
                            type="text"
                            value={
                              row.result.runTime
                            }
                            onChange={(
                              event
                            ) =>
                              updateResult(
                                row.cadet.id,
                                "runTime",
                                event.target.value
                              )
                            }
                            placeholder="13:20"
                            className="border rounded-lg px-3 py-2 w-28"
                          />

                        </TableCell>

                        <TableCell>

                          <input
                            disabled={isReadOnly}
                            type="text"
                            value={
                              row.result
                                .sprintTime
                            }
                            onChange={(
                              event
                            ) =>
                              updateResult(
                                row.cadet.id,
                                "sprintTime",
                                event.target.value
                              )
                            }
                            placeholder="00:55"
                            className="border rounded-lg px-3 py-2 w-24"
                          />

                        </TableCell>

                        <TableCell>

                          <input
                            disabled={isReadOnly}
                            type="number"
                            min="0"
                            value={
                              row.result.pullUps
                            }
                            onChange={(
                              event
                            ) =>
                              updateResult(
                                row.cadet.id,
                                "pullUps",
                                event.target.value
                              )
                            }
                            className="border rounded-lg px-3 py-2 w-20"
                          />

                        </TableCell>

                        <TableCell>

                          <input
                            disabled={isReadOnly}
                            type="number"
                            min="0"
                            value={
                              row.result
                                .chestPress
                            }
                            onChange={(
                              event
                            ) =>
                              updateResult(
                                row.cadet.id,
                                "chestPress",
                                event.target.value
                              )
                            }
                            className="border rounded-lg px-3 py-2 w-20"
                          />

                        </TableCell>

                        <TableCell>

                          <input
                            disabled={isReadOnly}
                            type="number"
                            min="0"
                            value={
                              row.result.trapBar
                            }
                            onChange={(
                              event
                            ) =>
                              updateResult(
                                row.cadet.id,
                                "trapBar",
                                event.target.value
                              )
                            }
                            className="border rounded-lg px-3 py-2 w-20"
                          />

                        </TableCell>

                        <TableCell>
                          <div className={
                            row.fitnessFinalScore !== null &&
                            row.fitnessFinalScore >= 95
                              ? "inline-flex min-w-14 justify-center bg-sky-50 border border-sky-200 text-sky-700 rounded-lg px-3 py-1 font-bold"
                              : "inline-flex min-w-14 justify-center bg-slate-50 border border-slate-200 text-slate-700 rounded-lg px-3 py-1 font-bold"
                          }>
                            {row.fitnessFinalScore ?? "—"}
                          </div>
                        </TableCell>

                        <TableCell>
                          <StatusBadge
                            status={
                              row.fitnessOverallStatus
                            }
                          />
                        </TableCell>

                        <TableCell>

                          <input
                            disabled={isReadOnly}
                            type="text"
                            value={
                              row.result.notes
                            }
                            onChange={(
                              event
                            ) =>
                              updateResult(
                                row.cadet.id,
                                "notes",
                                event.target.value
                              )
                            }
                            className="border rounded-lg px-3 py-2 w-48"
                          />

                        </TableCell>

                      </tr>

                    )
                  )}

                </tbody>

              </table>

              </div>
            </>

          ) : (

            <div className="border-2 border-dashed border-slate-200 rounded-xl p-10 text-center text-slate-500">
              סוג הבוחן עדיין אינו מוגדר.
            </div>

          )}

        </section>

        {/* =================================================
            FAILURE SUMMARY
        ================================================= */}

        {isAnyLoranStyleTest &&
          tested.length >
            0 && (

          <section className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 mt-8">

            <h2 className="text-2xl font-bold">
              תמונת נכשלים
            </h2>

            <p className="text-slate-500 mt-1">
              נכשלים לפי המרכיב
              בפועל — ריצה או ירי —
              ולא לפי הציון הסופי.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-6">

              <FailureCard
                title="נכשלים בריצה"
                count={
                  runFailed.length
                }
              >

                {runFailed.length ===
                0 ? (

                  <p className="text-slate-400">
                    אין נכשלים בריצה
                  </p>

                ) : (

                  runFailed.map(
                    (row) => (

                      <FailureRow
                        key={
                          row.cadet.globalId ||
                          row.cadet.id
                        }
                        name={
                          row.cadet.name
                        }
                        result={
                          row.result.runTime ||
                          "—"
                        }
                        threshold={
                          isRegularLoran
                            ? formatLoranTime(
                                row.regularPassingTime
                              )
                            : getImprovedStylePassTime()
                        }
                      />

                    )
                  )

                )}

              </FailureCard>

              <FailureCard
                title="נכשלים בירי"
                count={
                  shootingFailed.length
                }
              >

                {shootingFailed.length ===
                0 ? (

                  <p className="text-slate-400">
                    אין נכשלים בירי
                  </p>

                ) : (

                  shootingFailed.map(
                    (row) => (

                      <FailureRow
                        key={
                          row.cadet.globalId ||
                          row.cadet.id
                        }
                        name={
                          row.cadet.name
                        }
                        result={
                          row.result.shootingScore ||
                          "—"
                        }
                        threshold={
                          row.shootingPassScore?.toString() ||
                          "חסר"
                        }
                      />

                    )
                  )

                )}

              </FailureCard>

            </div>

          </section>

        )}

      </div>

    </main>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function MobileField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 min-w-0">
      <p className="text-[11px] text-slate-400">
        {label}
      </p>
      <p className="font-bold text-sm mt-1 break-words">
        {value}
      </p>
    </div>
  );
}

function MobileInput({
  label,
  value,
  placeholder,
  disabled,
  inputMode,
  onChange,
}: {
  label: string;
  value: string;
  placeholder?: string;
  disabled: boolean;
  inputMode:
    | "text"
    | "numeric";
  onChange: (
    value: string
  ) => void;
}) {
  return (
    <label className="block min-w-0">
      <span className="block text-xs font-medium text-slate-500 mb-1.5">
        {label}
      </span>
      <input
        type="text"
        inputMode={inputMode}
        disabled={disabled}
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(
            event.target.value
          )
        }
        className={
          disabled
            ? "w-full border border-slate-200 bg-slate-100 text-slate-600 rounded-xl px-3 py-3 outline-none"
            : "w-full border border-slate-300 bg-white rounded-xl px-3 py-3 outline-none focus:ring-2 focus:ring-slate-300"
        }
      />
    </label>
  );
}

function StatusBadge({
  status,
}: {
  status: TestStatus;
}) {
  if (
    status === "מצטיין"
  ) {
    return (
      <span className="inline-flex items-center gap-1 bg-sky-50 border border-sky-200 text-sky-700 px-3 py-1 rounded-lg font-bold shadow-sm">
        <span aria-hidden="true">★</span>
        מצטיין
      </span>
    );
  }

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

function StatCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">

      <p className="text-slate-500">
        {title}
      </p>

      <p className="text-4xl font-bold mt-2">
        {value}
      </p>

    </div>
  );
}

function ArrayCard({
  title,
  population,
  passing,
}: {
  title: string;
  population: string;
  passing: string;
}) {
  return (
    <div className="bg-white border border-blue-100 rounded-xl p-4">

      <p className="text-sm text-slate-500">
        {title}
      </p>

      <p className="font-bold mt-1">
        {population}
      </p>

      <p className="text-sm text-slate-600 mt-2">
        סף ריצה:{" "}
        <strong>
          {passing}
        </strong>
      </p>

    </div>
  );
}

function WarningBox({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 mb-6">
      {children}
    </div>
  );
}

function FailureCard({
  title,
  count,
  children,
}: {
  title: string;
  count: number;
  children:
    React.ReactNode;
}) {
  return (
    <div className="border border-slate-200 rounded-2xl p-5">

      <div className="flex items-center justify-between">

        <h3 className="text-xl font-bold">
          {title}
        </h3>

        <span className="bg-red-50 text-red-700 rounded-xl px-4 py-2 font-bold">
          {count}
        </span>

      </div>

      <div className="mt-4">
        {children}
      </div>

    </div>
  );
}

function FailureRow({
  name,
  result,
  threshold,
}: {
  name: string;
  result: string;
  threshold: string;
}) {
  return (
    <div className="border-b border-slate-100 py-3 last:border-0">

      <p className="font-bold">
        {name}
      </p>

      <p className="text-sm text-slate-500 mt-1">
        תוצאה:{" "}
        <strong>
          {result}
        </strong>
        {" | "}
        סף:{" "}
        <strong>
          {threshold}
        </strong>
      </p>

    </div>
  );
}

function TableHead({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <th className="p-3 border-b whitespace-nowrap">
      {children}
    </th>
  );
}

function TableCell({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <td className="p-3 border-b whitespace-nowrap">
      {children}
    </td>
  );
}