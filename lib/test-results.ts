import {
  getActiveCycle,
  getCycleById,
  type CourseCycle,
} from "@/lib/cycles";

export type TestStage =
  | "פתיחה"
  | "סיום"
  | "אחר";

export type SharedTestResult = {
  id: string;

  /*
    זהות הצוער
  */
  globalId: string;
  cadetId: number;
  cadetName: string;

  /*
    שיוך בזמן ביצוע הבוחן
  */
  battalion: string;
  testName: string;
  stage: TestStage;

  /*
    מועד הבוחן:
    1 = א׳, 2 = ב׳, 3 = ג׳
    רשומות ישנות ללא attempt נחשבות מועד א׳.
  */
  attempt?: number;

  /*
    שיוך למחזור
    רשומות ישנות יכולות להיות ללא cycleId.
  */
  cycleId?: string;
  cycleName?: string;

  /*
    כש"ג
  */
  runTime: string;
  sprintTime: string;
  pullUps: string;
  chestPress: string;
  trapBar: string;

  /*
    לורן / לורן משופר / בוחן מ"מ
  */
  shootingScore: string;

  notes: string;

  updatedAt: string;
};

const SHARED_RESULTS_KEY =
  "commandfit-shared-test-results-v3";

const LEGACY_SHARED_RESULTS_KEY =
  "commandfit-shared-test-results-v2";

/* =========================================================
   HELPERS
========================================================= */

function safeParseResults(
  value: string | null
): SharedTestResult[] {
  if (!value) {
    return [];
  }

  try {
    const parsed =
      JSON.parse(
        value
      ) as SharedTestResult[];

    return Array.isArray(
      parsed
    )
      ? parsed
      : [];
  } catch {
    return [];
  }
}

function sortHistory(
  rows: SharedTestResult[]
) {
  return rows
    .slice()
    .sort(
      (a, b) =>
        new Date(
          a.updatedAt
        ).getTime() -
        new Date(
          b.updatedAt
        ).getTime()
    );
}

function getCycleLabel(
  cycleId?: string
) {
  if (!cycleId) {
    return "";
  }

  return (
    getCycleById(
      cycleId
    )?.name ?? ""
  );
}

/* =========================================================
   TEST STAGE
========================================================= */

export function detectTestStage(
  testName: string
): TestStage {
  const normalized =
    testName.trim();

  if (
    normalized.includes(
      "פתיחה"
    )
  ) {
    return "פתיחה";
  }

  if (
    normalized.includes(
      "סוף"
    ) ||
    normalized.includes(
      "סיום"
    )
  ) {
    return "סיום";
  }

  return "אחר";
}

/* =========================================================
   LOAD ALL
========================================================= */

export function loadAllSharedResults():
  SharedTestResult[] {
  if (
    typeof window ===
    "undefined"
  ) {
    return [];
  }

  const current =
    safeParseResults(
      localStorage.getItem(
        SHARED_RESULTS_KEY
      )
    );

  if (
    current.length > 0
  ) {
    return current;
  }

  /*
    תאימות לאחור:
    אם עדיין אין v3, טוענים את v2.
  */
  return safeParseResults(
    localStorage.getItem(
      LEGACY_SHARED_RESULTS_KEY
    )
  );
}

/* =========================================================
   SAVE SHARED TEST RESULTS
========================================================= */

export function saveSharedTestResults(
  battalion: string,
  testName: string,
  rows: {
    globalId?: string;
    cadetId: number;
    cadetName?: string;

    runTime?: string;
    sprintTime?: string;
    pullUps?: string;
    chestPress?: string;
    trapBar?: string;
    shootingScore?: string;
    notes?: string;
  }[],
  cycleId?: string,
  attempt: number = 1
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  const existing =
    loadAllSharedResults();

  const resolvedAttempt =
    Number.isFinite(
      attempt
    ) &&
    attempt >= 1
      ? Math.floor(
          attempt
        )
      : 1;

  const stage =
    detectTestStage(
      testName
    );

  /*
    אם דף הבוחן לא העביר cycleId,
    נזהה אוטומטית את המחזור שנבחר בגדוד.
  */
  const activeCycle =
    getActiveCycle(
      battalion
    );

  const resolvedCycleId =
    cycleId ||
    activeCycle?.id ||
    "";

  const resolvedCycleName =
    resolvedCycleId
      ? getCycleLabel(
          resolvedCycleId
        )
      : "";

  /*
    מוחקים רק את הרשומות של:
    אותו גדוד + אותו בוחן + אותו מחזור.

    כך שמירה במחזור חדש לא מוחקת
    היסטוריה של מחזור קודם.
  */
  const withoutCurrentTest =
    existing.filter(
      (result) => {
        const sameBattalion =
          result.battalion ===
          battalion;

        const sameTest =
          result.testName ===
          testName;

        /*
          לרשומות legacy אין cycleId.
          אם אין כרגע מחזור, מתנהגים כמו v2.
          אם יש מחזור, לא מוחקים רשומות legacy.
        */
        const sameCycle =
          resolvedCycleId
            ? result.cycleId ===
              resolvedCycleId
            : !result.cycleId;

        const sameAttempt =
          (result.attempt ?? 1) ===
          resolvedAttempt;

        return !(
          sameBattalion &&
          sameTest &&
          sameCycle &&
          sameAttempt
        );
      }
    );

  /*
    שומרים רק מי שיש לו תוצאה כלשהי.
  */
  const normalizedRows =
    rows
      .filter(
        (row) =>
          Boolean(
            row.runTime ||
              row.sprintTime ||
              row.pullUps ||
              row.chestPress ||
              row.trapBar ||
              row.shootingScore ||
              row.notes
          )
      )
      .map(
        (
          row
        ): SharedTestResult => ({
          id:
            `${resolvedCycleId || "legacy"}-${battalion}-${testName}-attempt-${resolvedAttempt}-${row.globalId || row.cadetId}`,

          attempt:
            resolvedAttempt,

          globalId:
            row.globalId || "",

          cadetId:
            row.cadetId,

          cadetName:
            row.cadetName || "",

          battalion,
          testName,
          stage,

          cycleId:
            resolvedCycleId ||
            undefined,

          cycleName:
            resolvedCycleName ||
            undefined,

          runTime:
            row.runTime || "",

          sprintTime:
            row.sprintTime || "",

          pullUps:
            row.pullUps || "",

          chestPress:
            row.chestPress || "",

          trapBar:
            row.trapBar || "",

          shootingScore:
            row.shootingScore || "",

          notes:
            row.notes || "",

          updatedAt:
            new Date()
              .toISOString(),
        })
      );

  localStorage.setItem(
    SHARED_RESULTS_KEY,
    JSON.stringify([
      ...withoutCurrentTest,
      ...normalizedRows,
    ])
  );
}

/* =========================================================
   ALL HISTORY BY GLOBAL ID
========================================================= */

export function getCadetHistory(
  globalId: string
) {
  if (!globalId) {
    return [];
  }

  return sortHistory(
    loadAllSharedResults()
      .filter(
        (result) =>
          result.globalId ===
          globalId
      )
  );
}

/* =========================================================
   HISTORY FOR A SPECIFIC COURSE CONTEXT
========================================================= */

export function getCadetHistoryForCycle(
  globalId: string,
  battalion: string,
  cycle: CourseCycle | null
) {
  if (!globalId) {
    return [];
  }

  const all =
    loadAllSharedResults()
      .filter(
        (result) =>
          result.globalId ===
          globalId
      );

  /*
    אם עדיין עובדים בלי מערכת מחזורים,
    נשמרת ההתנהגות הישנה.
  */
  if (!cycle) {
    return sortHistory(
      all
    );
  }

  /*
    דקל / רימון:
    מציגים רק את המחזור שנבחר.
  */
  if (
    battalion !==
    "גפן"
  ) {
    const filtered =
      all.filter(
        (result) =>
          result.battalion ===
            battalion &&
          result.cycleId ===
            cycle.id
      );

    /*
      fallback זמני לנתונים ישנים:
      אם אין בכלל רשומות מחזוריות,
      מאפשרים להציג legacy של אותו גדוד.
    */
    if (
      filtered.length === 0
    ) {
      return sortHistory(
        all.filter(
          (result) =>
            result.battalion ===
              battalion &&
            !result.cycleId
        )
      );
    }

    return sortHistory(
      filtered
    );
  }

  /*
    גפן:
    מציגים את מחזור גפן הנוכחי
    + מחזורי המקור שנבחרו בדקל וברימון.
  */
  const allowed = new Set<
    string
  >();

  allowed.add(
    `גפן:${cycle.id}`
  );

  if (
    cycle.sourceCycles
      ?.dekel
  ) {
    allowed.add(
      `דקל:${cycle.sourceCycles.dekel}`
    );
  }

  if (
    cycle.sourceCycles
      ?.rimon
  ) {
    allowed.add(
      `רימון:${cycle.sourceCycles.rimon}`
    );
  }

  const filtered =
    all.filter(
      (result) =>
        result.cycleId &&
        allowed.has(
          `${result.battalion}:${result.cycleId}`
        )
    );

  /*
    fallback לנתונים ישנים אם עדיין
    אין היסטוריה מסומנת לפי מחזור.
  */
  if (
    filtered.length === 0
  ) {
    return sortHistory(
      all.filter(
        (result) =>
          (
            result.battalion ===
              "גפן" ||
            result.battalion ===
              "דקל" ||
            result.battalion ===
              "רימון"
          ) &&
          !result.cycleId
      )
    );
  }

  return sortHistory(
    filtered
  );
}

/* =========================================================
   LEGACY ID
========================================================= */

export function getCadetHistoryByLegacyId(
  battalion: string,
  cadetId: number,
  cycleId?: string
) {
  const rows =
    loadAllSharedResults()
      .filter(
        (result) =>
          result.battalion ===
            battalion &&
          result.cadetId ===
            cadetId
      );

  if (
    cycleId
  ) {
    const cycleRows =
      rows.filter(
        (result) =>
          result.cycleId ===
          cycleId
      );

    if (
      cycleRows.length >
      0
    ) {
      return sortHistory(
        cycleRows
      );
    }
  }

  return sortHistory(
    rows.filter(
      (result) =>
        !result.cycleId
    )
  );
}

/* =========================================================
   FITNESS COMPARISON
========================================================= */

export function getCadetFitnessComparison(
  globalId: string,
  battalion?: string,
  cycle?: CourseCycle | null
) {
  const history =
    battalion
      ? getCadetHistoryForCycle(
          globalId,
          battalion,
          cycle ?? null
        )
      : getCadetHistory(
          globalId
        );

  const fitness =
    history.filter(
      (result) =>
        result.testName.includes(
          'כש"ג'
        ) ||
        result.testName.includes(
          "כש״ג"
        )
    );

  const opening =
    [...fitness]
      .reverse()
      .find(
        (result) =>
          result.stage ===
          "פתיחה"
      ) ?? null;

  const final =
    [...fitness]
      .reverse()
      .find(
        (result) =>
          result.stage ===
          "סיום"
      ) ?? null;

  return {
    opening,
    final,
  };
}