"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  supabase,
} from "@/lib/supabase";

import {
  useAuth,
} from "@/lib/use-auth";

/* =========================================================
   TYPES
========================================================= */

type LocalCycle = {
  id: string;
  name: string;
  battalion: string;
  status:
    | "active"
    | "closed";
  startDate: string;
  endDate?: string;
  sourceCycles?: {
    dekel?: string;
    rimon?: string;
  };
  createdAt: string;
  closedAt?: string;
};

type LocalCadet = {
  id: number;
  globalId?: string;

  name?: string;
  gender?: string;

  brigade?: string;
  unit?: string;

  company?: string;
  team?: string;

  loranPopulation?: string;

  medicalStatus?: string;
  courseStatus?:
    | "פעיל"
    | "הודח"
    | "מיועד לחזרה";

  fitnessLevel?: string;
  shootingLevel?: string;

  fitnessLevelSource?: string;
  shootingLevelSource?: string;
  loranPopulationSource?: string;

  previousBattalion?: string;

  dismissalReason?: string;
  dismissalDate?: string;
  returnNotes?: string;

  notes?: string;
};

type SharedTestResult = {
  id: string;

  globalId?: string;
  cadetId: number;
  cadetName?: string;

  battalion: string;
  testName: string;

  stage?:
    | "פתיחה"
    | "סיום"
    | "אחר";

  cycleId?: string;
  cycleName?: string;

  runTime?: string;
  sprintTime?: string;

  pullUps?: string;
  chestPress?: string;
  trapBar?: string;

  shootingScore?: string;

  notes?: string;

  updatedAt?: string;
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

type Preview = {
  cycles: number;
  legacyCycles: number;

  cadetIdentities: number;
  memberships: number;

  testResults: number;
  directResultStorages: number;

  skippedCadets: number;
  skippedResults: number;
};

type MigrationStatus =
  | "idle"
  | "running"
  | "success"
  | "error";

/* =========================================================
   CONFIG
========================================================= */

const BATTALIONS = [
  "דקל",
  "רימון",
  "גפן",
  "הדס",
  "דולב",
  "ארז",
  "ברוש",
  "חרוב",
  "אלון",
];

const CYCLES_STORAGE_KEY =
  "commandfit-cycles";

const SHARED_RESULTS_V3 =
  "commandfit-shared-test-results-v3";

const SHARED_RESULTS_V2 =
  "commandfit-shared-test-results-v2";

/* =========================================================
   HELPERS
========================================================= */

function safeParse<T>(
  value: string | null,
  fallback: T
): T {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(
      value
    ) as T;
  } catch {
    return fallback;
  }
}

function normalizeText(
  value: unknown
) {
  return String(
    value ?? ""
  )
    .trim()
    .replace(/\s+/g, " ");
}

function createFallbackGlobalId(
  battalion: string,
  cycleId: string,
  cadetId: number,
  name: string
) {
  const safeName =
    normalizeText(name)
      .replace(/\s+/g, "-")
      .replace(/[^\p{L}\p{N}-]/gu, "")
      .slice(0, 40);

  return `legacy-${battalion}-${cycleId}-${cadetId}-${safeName || "cadet"}`;
}

function getLegacyCycleId(
  battalion: string
) {
  return `legacy-${battalion}`;
}

function getToday() {
  return new Date()
    .toISOString()
    .slice(0, 10);
}

function getAllLocalCycles():
  LocalCycle[] {
  return safeParse<
    LocalCycle[]
  >(
    localStorage.getItem(
      CYCLES_STORAGE_KEY
    ),
    []
  );
}

function getCycleCadets(
  battalion: string,
  cycleId: string
): LocalCadet[] {
  return safeParse<
    LocalCadet[]
  >(
    localStorage.getItem(
      `commandfit-cadets-${battalion}-${cycleId}`
    ),
    []
  );
}

function getLegacyCadets(
  battalion: string
): LocalCadet[] {
  return safeParse<
    LocalCadet[]
  >(
    localStorage.getItem(
      `commandfit-cadets-${battalion}`
    ),
    []
  );
}

function getSharedResults():
  SharedTestResult[] {
  const v3 =
    safeParse<
      SharedTestResult[]
    >(
      localStorage.getItem(
        SHARED_RESULTS_V3
      ),
      []
    );

  if (v3.length > 0) {
    return v3;
  }

  return safeParse<
    SharedTestResult[]
  >(
    localStorage.getItem(
      SHARED_RESULTS_V2
    ),
    []
  );
}

/*
  בונה מפה שמאפשרת למצוא globalId
  לפי גדוד + מחזור + מספר צוער.
*/
function buildCadetIdentityMap(
  cycles: LocalCycle[]
) {
  const map =
    new Map<
      string,
      string
    >();

  cycles.forEach(
    (cycle) => {
      getCycleCadets(
        cycle.battalion,
        cycle.id
      )
        .filter(
          (cadet) =>
            Boolean(
              cadet.name?.trim()
            )
        )
        .forEach(
          (cadet) => {
            const globalId =
              cadet.globalId ||
              createFallbackGlobalId(
                cycle.battalion,
                cycle.id,
                cadet.id,
                cadet.name || ""
              );

            map.set(
              `${cycle.battalion}:${cycle.id}:${cadet.id}`,
              globalId
            );
          }
        );
    }
  );

  BATTALIONS.forEach(
    (battalion) => {
      const legacyCycleId =
        getLegacyCycleId(
          battalion
        );

      getLegacyCadets(
        battalion
      )
        .filter(
          (cadet) =>
            Boolean(
              cadet.name?.trim()
            )
        )
        .forEach(
          (cadet) => {
            const globalId =
              cadet.globalId ||
              createFallbackGlobalId(
                battalion,
                legacyCycleId,
                cadet.id,
                cadet.name || ""
              );

            map.set(
              `${battalion}:${legacyCycleId}:${cadet.id}`,
              globalId
            );
          }
        );
    }
  );

  return map;
}

/* =========================================================
   DIRECT TEST RESULT STORAGE
   מזהה גם תוצאות שנשמרו ישירות בדפי הבחנים
========================================================= */

function hasAnyResultValue(
  row: SavedResult
) {
  return Boolean(
    row.runTime ||
    row.sprintTime ||
    row.pullUps ||
    row.chestPress ||
    row.trapBar ||
    row.shootingScore ||
    row.notes
  );
}

function detectStageFromTestName(
  testName: string
):
  | "פתיחה"
  | "סיום"
  | "אחר" {
  if (
    testName.includes(
      "פתיחה"
    )
  ) {
    return "פתיחה";
  }

  if (
    testName.includes(
      "סוף"
    ) ||
    testName.includes(
      "סיום"
    )
  ) {
    return "סיום";
  }

  return "אחר";
}

function getDirectResultStorages(
  cycles: LocalCycle[]
) {
  const found: {
    storageKey: string;
    battalion: string;
    cycleId: string;
    cycleName: string;
    testName: string;
    rows: SavedResult[];
  }[] = [];

  const resultKeys =
    Array.from(
      {
        length:
          localStorage.length,
      },
      (_, index) =>
        localStorage.key(
          index
        )
    )
      .filter(
        (
          key
        ): key is string =>
          Boolean(
            key &&
            key.startsWith(
              "commandfit-results-"
            )
          )
      );

  resultKeys.forEach(
    (storageKey) => {
      const battalion =
        BATTALIONS.find(
          (name) =>
            storageKey.startsWith(
              `commandfit-results-${name}-`
            )
        );

      if (!battalion) {
        return;
      }

      const remainder =
        storageKey.slice(
          `commandfit-results-${battalion}-`
            .length
        );

      /*
        בודקים קודם אם זה מפתח מחזורי:
        commandfit-results-{גדוד}-{cycleId}-{testName}

        משתמשים ב-cycleId הארוך ביותר כדי למנוע
        זיהוי שגוי במקרה של prefixes דומים.
      */
      const battalionCycles =
        cycles
          .filter(
            (cycle) =>
              cycle.battalion ===
              battalion
          )
          .slice()
          .sort(
            (a, b) =>
              b.id.length -
              a.id.length
          );

      const matchedCycle =
        battalionCycles.find(
          (cycle) =>
            remainder.startsWith(
              `${cycle.id}-`
            )
        );

      let cycleId: string;
      let cycleName: string;
      let testName: string;

      if (matchedCycle) {
        cycleId =
          matchedCycle.id;

        cycleName =
          matchedCycle.name;

        testName =
          remainder.slice(
            matchedCycle.id.length +
            1
          );
      } else {
        /*
          מבנה ישן:
          commandfit-results-{גדוד}-{testName}
        */
        cycleId =
          getLegacyCycleId(
            battalion
          );

        cycleName =
          "נתונים קודמים";

        testName =
          remainder;
      }

      if (!testName.trim()) {
        return;
      }

      const rows =
        safeParse<
          SavedResult[]
        >(
          localStorage.getItem(
            storageKey
          ),
          []
        )
          .filter(
            (row) =>
              Boolean(
                row &&
                Number.isFinite(
                  Number(
                    row.cadetId
                  )
                )
              )
          )
          .filter(
            hasAnyResultValue
          );

      if (
        rows.length === 0
      ) {
        return;
      }

      found.push({
        storageKey,
        battalion,
        cycleId,
        cycleName,
        testName,
        rows,
      });
    }
  );

  return found;
}

/* =========================================================
   BUILD MIGRATION DATA
========================================================= */

function buildMigrationData() {
  const localCycles =
    getAllLocalCycles();

  const identityMap =
    buildCadetIdentityMap(
      localCycles
    );

  const cycleRows:
    Record<
      string,
      unknown
    >[] = [];

  const cadetRowsById =
    new Map<
      string,
      Record<
        string,
        unknown
      >
    >();

  const membershipRows:
    Record<
      string,
      unknown
    >[] = [];

  const resultRowsByKey =
    new Map<
      string,
      Record<
        string,
        unknown
      >
    >();

  let legacyCycles = 0;
  let skippedCadets = 0;
  let skippedResults = 0;

  /* =======================================================
     REAL CYCLES
  ======================================================= */

  localCycles.forEach(
    (cycle) => {
      cycleRows.push({
        id:
          cycle.id,

        name:
          cycle.name,

        battalion:
          cycle.battalion,

        status:
          cycle.status,

        start_date:
          cycle.startDate ||
          getToday(),

        end_date:
          cycle.endDate ||
          null,

        source_dekel_cycle_id:
          cycle.sourceCycles
            ?.dekel ||
          null,

        source_rimon_cycle_id:
          cycle.sourceCycles
            ?.rimon ||
          null,

        created_at:
          cycle.createdAt ||
          new Date()
            .toISOString(),

        closed_at:
          cycle.closedAt ||
          null,
      });

      const cadets =
        getCycleCadets(
          cycle.battalion,
          cycle.id
        );

      cadets
        .filter(
          (cadet) =>
            Boolean(
              cadet.name?.trim()
            )
        )
        .forEach(
          (cadet) => {
            const name =
              normalizeText(
                cadet.name
              );

            if (!name) {
              skippedCadets++;
              return;
            }

            const globalId =
              cadet.globalId ||
              createFallbackGlobalId(
                cycle.battalion,
                cycle.id,
                cadet.id,
                name
              );

            cadetRowsById.set(
              globalId,
              {
                global_id:
                  globalId,

                name,

                gender:
                  cadet.gender ||
                  null,

                brigade:
                  cadet.brigade ||
                  null,

                unit:
                  cadet.unit ||
                  null,
              }
            );

            membershipRows.push({
              global_id:
                globalId,

              cycle_id:
                cycle.id,

              battalion:
                cycle.battalion,

              cadet_number:
                cadet.id,

              company:
                cadet.company ||
                null,

              team:
                cadet.team ||
                null,

              loran_population:
                cadet.loranPopulation ||
                null,

              medical_status:
                cadet.medicalStatus ||
                "כשיר",

              course_status:
                cadet.courseStatus ||
                "פעיל",

              fitness_level:
                cadet.fitnessLevel ||
                null,

              shooting_level:
                cadet.shootingLevel ||
                null,

              fitness_level_source:
                cadet.fitnessLevelSource ||
                null,

              shooting_level_source:
                cadet.shootingLevelSource ||
                null,

              loran_population_source:
                cadet.loranPopulationSource ||
                null,

              previous_battalion:
                cadet.previousBattalion ||
                null,

              dismissal_reason:
                cadet.dismissalReason ||
                null,

              dismissal_date:
                cadet.dismissalDate ||
                null,

              return_notes:
                cadet.returnNotes ||
                null,

              notes:
                cadet.notes ||
                null,
            });
          }
        );
    }
  );

  /* =======================================================
     LEGACY CADETS
  ======================================================= */

  BATTALIONS.forEach(
    (battalion) => {
      const cadets =
        getLegacyCadets(
          battalion
        ).filter(
          (cadet) =>
            Boolean(
              cadet.name?.trim()
            )
        );

      if (
        cadets.length === 0
      ) {
        return;
      }

      const legacyCycleId =
        getLegacyCycleId(
          battalion
        );

      /*
        מחזור טכני בלבד לצורך שמירת
        נתונים שנוצרו לפני מערכת המחזורים.
      */
      if (
        !cycleRows.some(
          (row) =>
            row.id ===
            legacyCycleId
        )
      ) {
        legacyCycles++;

        cycleRows.push({
          id:
            legacyCycleId,

          name:
            "נתונים קודמים",

          battalion,

          status:
            "closed",

          /*
            זהו תאריך טכני בלבד.
            המחזור מסומן במפורש כ"נתונים קודמים".
          */
          start_date:
            "2000-01-01",

          end_date:
            null,

          source_dekel_cycle_id:
            null,

          source_rimon_cycle_id:
            null,

          created_at:
            new Date(
              "2000-01-01T00:00:00.000Z"
            ).toISOString(),

          closed_at:
            new Date()
              .toISOString(),
        });
      }

      cadets.forEach(
        (cadet) => {
          const name =
            normalizeText(
              cadet.name
            );

          if (!name) {
            skippedCadets++;
            return;
          }

          const globalId =
            cadet.globalId ||
            createFallbackGlobalId(
              battalion,
              legacyCycleId,
              cadet.id,
              name
            );

          cadetRowsById.set(
            globalId,
            {
              global_id:
                globalId,

              name,

              gender:
                cadet.gender ||
                null,

              brigade:
                cadet.brigade ||
                null,

              unit:
                cadet.unit ||
                null,
            }
          );

          membershipRows.push({
            global_id:
              globalId,

            cycle_id:
              legacyCycleId,

            battalion,

            cadet_number:
              cadet.id,

            company:
              cadet.company ||
              null,

            team:
              cadet.team ||
              null,

            loran_population:
              cadet.loranPopulation ||
              null,

            medical_status:
              cadet.medicalStatus ||
              "כשיר",

            course_status:
              cadet.courseStatus ||
              "פעיל",

            fitness_level:
              cadet.fitnessLevel ||
              null,

            shooting_level:
              cadet.shootingLevel ||
              null,

            fitness_level_source:
              cadet.fitnessLevelSource ||
              null,

            shooting_level_source:
              cadet.shootingLevelSource ||
              null,

            loran_population_source:
              cadet.loranPopulationSource ||
              null,

            previous_battalion:
              cadet.previousBattalion ||
              null,

            dismissal_reason:
              cadet.dismissalReason ||
              null,

            dismissal_date:
              cadet.dismissalDate ||
              null,

            return_notes:
              cadet.returnNotes ||
              null,

            notes:
              cadet.notes ||
              null,
          });
        }
      );
    }
  );

  /* =======================================================
     DIRECT TEST RESULTS
     מקור התוצאות הראשי של דפי הבחנים
  ======================================================= */

  const directStorages =
    getDirectResultStorages(
      localCycles
    );

  directStorages.forEach(
    (storage) => {
      /*
        אם מדובר בתוצאות Legacy ואין עדיין
        מחזור טכני - יוצרים אותו.
      */
      if (
        !cycleRows.some(
          (row) =>
            row.id ===
            storage.cycleId
        )
      ) {
        legacyCycles++;

        cycleRows.push({
          id:
            storage.cycleId,

          name:
            storage.cycleName,

          battalion:
            storage.battalion,

          status:
            "closed",

          start_date:
            "2000-01-01",

          end_date:
            null,

          source_dekel_cycle_id:
            null,

          source_rimon_cycle_id:
            null,

          created_at:
            new Date(
              "2000-01-01T00:00:00.000Z"
            ).toISOString(),

          closed_at:
            new Date()
              .toISOString(),
        });
      }

      const cycleCadets =
        storage.cycleId.startsWith(
          "legacy-"
        )
          ? getLegacyCadets(
              storage.battalion
            )
          : getCycleCadets(
              storage.battalion,
              storage.cycleId
            );

      storage.rows.forEach(
        (result) => {
          const matchedCadet =
            cycleCadets.find(
              (cadet) =>
                cadet.id ===
                Number(
                  result.cadetId
                )
            );

          let globalId =
            matchedCadet?.globalId ||
            identityMap.get(
              `${storage.battalion}:${storage.cycleId}:${result.cadetId}`
            ) ||
            "";

          if (
            !globalId &&
            storage.cycleId !==
              getLegacyCycleId(
                storage.battalion
              )
          ) {
            globalId =
              identityMap.get(
                `${storage.battalion}:${getLegacyCycleId(
                  storage.battalion
                )}:${result.cadetId}`
              ) ||
              "";
          }

          if (!globalId) {
            /*
              לא נזרוק תוצאה קיימת:
              יוצרים מזהה fallback יציב.
            */
            globalId =
              createFallbackGlobalId(
                storage.battalion,
                storage.cycleId,
                Number(
                  result.cadetId
                ),
                matchedCadet?.name ||
                `צוער ${result.cadetId}`
              );
          }

          if (
            !cadetRowsById.has(
              globalId
            )
          ) {
            cadetRowsById.set(
              globalId,
              {
                global_id:
                  globalId,

                name:
                  normalizeText(
                    matchedCadet?.name
                  ) ||
                  `צוער ${result.cadetId}`,

                gender:
                  matchedCadet?.gender ||
                  null,

                brigade:
                  matchedCadet?.brigade ||
                  null,

                unit:
                  matchedCadet?.unit ||
                  null,
              }
            );
          }

          /*
            אם נאלצנו ליצור זהות מתוצאה בלבד
            ואין membership - מוסיפים membership
            כדי לשמור את הקשר למחזור.
          */
          if (
            !membershipRows.some(
              (row) =>
                row.global_id ===
                  globalId &&
                row.cycle_id ===
                  storage.cycleId
            )
          ) {
            membershipRows.push({
              global_id:
                globalId,

              cycle_id:
                storage.cycleId,

              battalion:
                storage.battalion,

              cadet_number:
                Number(
                  result.cadetId
                ),

              company:
                matchedCadet?.company ||
                null,

              team:
                matchedCadet?.team ||
                null,

              loran_population:
                matchedCadet?.loranPopulation ||
                null,

              medical_status:
                matchedCadet?.medicalStatus ||
                "כשיר",

              course_status:
                matchedCadet?.courseStatus ||
                "פעיל",

              fitness_level:
                matchedCadet?.fitnessLevel ||
                null,

              shooting_level:
                matchedCadet?.shootingLevel ||
                null,

              fitness_level_source:
                matchedCadet?.fitnessLevelSource ||
                null,

              shooting_level_source:
                matchedCadet?.shootingLevelSource ||
                null,

              loran_population_source:
                matchedCadet?.loranPopulationSource ||
                null,

              previous_battalion:
                matchedCadet?.previousBattalion ||
                null,

              dismissal_reason:
                matchedCadet?.dismissalReason ||
                null,

              dismissal_date:
                matchedCadet?.dismissalDate ||
                null,

              return_notes:
                matchedCadet?.returnNotes ||
                null,

              notes:
                matchedCadet?.notes ||
                null,
            });
          }

          const logicalKey =
            `${storage.cycleId}::${storage.battalion}::${storage.testName}::${globalId}`;

          resultRowsByKey.set(
            logicalKey,
            {
              id:
                `migrate:${logicalKey}`,

              global_id:
                globalId,

              cycle_id:
                storage.cycleId,

              cadet_id:
                Number(
                  result.cadetId
                ),

              cadet_name:
                matchedCadet?.name ||
                null,

              battalion:
                storage.battalion,

              test_name:
                storage.testName,

              stage:
                detectStageFromTestName(
                  storage.testName
                ),

              cycle_name:
                storage.cycleName,

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
            }
          );
        }
      );
    }
  );

  /* =======================================================
     SHARED TEST RESULTS
     מקור משלים לתיק האישי
  ======================================================= */

  const sharedResults =
    getSharedResults();

  sharedResults.forEach(
    (result) => {
      const cycleId =
        result.cycleId ||
        getLegacyCycleId(
          result.battalion
        );

      /*
        אם תוצאה legacy קיימת בלי רשימת
        צוערים legacy, עדיין יוצרים מחזור
        טכני כדי לא לאבד את התוצאה.
      */
      if (
        !cycleRows.some(
          (row) =>
            row.id ===
            cycleId
        )
      ) {
        legacyCycles++;

        cycleRows.push({
          id:
            cycleId,

          name:
            result.cycleName ||
            "נתונים קודמים",

          battalion:
            result.battalion,

          status:
            "closed",

          start_date:
            "2000-01-01",

          end_date:
            null,

          source_dekel_cycle_id:
            null,

          source_rimon_cycle_id:
            null,

          created_at:
            new Date(
              "2000-01-01T00:00:00.000Z"
            ).toISOString(),

          closed_at:
            new Date()
              .toISOString(),
        });
      }

      let globalId =
        result.globalId ||
        "";

      if (!globalId) {
        globalId =
          identityMap.get(
            `${result.battalion}:${cycleId}:${result.cadetId}`
          ) ||
          "";
      }

      /*
        fallback נוסף ל-v2:
        חיפוש במספר צוער בנתוני legacy.
      */
      if (!globalId) {
        globalId =
          identityMap.get(
            `${result.battalion}:${getLegacyCycleId(
              result.battalion
            )}:${result.cadetId}`
          ) ||
          "";
      }

      if (!globalId) {
        skippedResults++;
        return;
      }

      /*
        במקרה שקיימת תוצאה אבל זהות הצוער
        עדיין לא נמצאה בטבלת cadets,
        יוצרים זהות מינימלית כדי שהתוצאה
        לא תלך לאיבוד.
      */
      if (
        !cadetRowsById.has(
          globalId
        )
      ) {
        cadetRowsById.set(
          globalId,
          {
            global_id:
              globalId,

            name:
              normalizeText(
                result.cadetName
              ) ||
              `צוער ${result.cadetId}`,

            gender:
              null,

            brigade:
              null,

            unit:
              null,
          }
        );
      }

      const logicalKey =
        `${cycleId}::${result.battalion}::${result.testName}::${globalId}`;

      const existingDirect =
        resultRowsByKey.get(
          logicalKey
        );

      /*
        Shared history משלים שדות חסרים,
        אך אינו מוחק תוצאה שכבר נמצאה ישירות
        ב-storage של דף הבוחן.
      */
      resultRowsByKey.set(
        logicalKey,
        {
          id:
            existingDirect?.id ||
            `migrate:${logicalKey}`,

          global_id:
            globalId,

          cycle_id:
            cycleId,

          cadet_id:
            result.cadetId,

          cadet_name:
            result.cadetName ||
            existingDirect?.cadet_name ||
            null,

          battalion:
            result.battalion,

          test_name:
            result.testName,

          stage:
            result.stage ||
            existingDirect?.stage ||
            "אחר",

          cycle_name:
            result.cycleName ||
            existingDirect?.cycle_name ||
            (
              cycleRows.find(
                (row) =>
                  row.id ===
                  cycleId
              )?.name as
                | string
                | undefined
            ) ||
            null,

          run_time:
            existingDirect?.run_time ||
            result.runTime ||
            null,

          sprint_time:
            existingDirect?.sprint_time ||
            result.sprintTime ||
            null,

          pull_ups:
            existingDirect?.pull_ups ||
            result.pullUps ||
            null,

          chest_press:
            existingDirect?.chest_press ||
            result.chestPress ||
            null,

          trap_bar:
            existingDirect?.trap_bar ||
            result.trapBar ||
            null,

          shooting_score:
            existingDirect?.shooting_score ||
            result.shootingScore ||
            null,

          notes:
            existingDirect?.notes ||
            result.notes ||
            null,

          updated_at:
            result.updatedAt ||
            existingDirect?.updated_at ||
            new Date()
              .toISOString(),
        }
      );
    }
  );

  /*
    מסירים כפילויות memberships
    לפי globalId + cycleId.
  */
  const membershipsByKey =
    new Map<
      string,
      Record<
        string,
        unknown
      >
    >();

  membershipRows.forEach(
    (row) => {
      membershipsByKey.set(
        `${row.global_id}:${row.cycle_id}`,
        row
      );
    }
  );

  /*
    התוצאות כבר מאוחדות לפי:
    מחזור + גדוד + בוחן + globalId.
  */

  return {
    cycles:
      cycleRows,

    cadets:
      Array.from(
        cadetRowsById.values()
      ),

    memberships:
      Array.from(
        membershipsByKey.values()
      ),

    results:
      Array.from(
        resultRowsByKey.values()
      ),

    preview: {
      cycles:
        cycleRows.length,

      legacyCycles,

      cadetIdentities:
        cadetRowsById.size,

      memberships:
        membershipsByKey.size,

      testResults:
        resultRowsByKey.size,

      directResultStorages:
        directStorages.length,

      skippedCadets,
      skippedResults,
    } satisfies Preview,
  };
}

/* =========================================================
   PAGE
========================================================= */

export default function DatabaseMigrationPage() {
  const {
    isAdmin,
    isViewer,
  } = useAuth();

  const [
    mounted,
    setMounted,
  ] =
    useState(false);

  const [
    migration,
    setMigration,
  ] =
    useState<ReturnType<
      typeof buildMigrationData
    > | null>(
      null
    );

  const [
    status,
    setStatus,
  ] =
    useState<MigrationStatus>(
      "idle"
    );

  const [
    message,
    setMessage,
  ] =
    useState("");

  const [
    cloudCounts,
    setCloudCounts,
  ] =
    useState<{
      cycles: number | null;
      cadets: number | null;
      memberships: number | null;
      results: number | null;
    }>({
      cycles: null,
      cadets: null,
      memberships: null,
      results: null,
    });

  useEffect(() => {
    setMounted(
      true
    );

    setMigration(
      buildMigrationData()
    );
  }, []);

  const preview =
    migration?.preview;

  function refreshLocalPreview() {
    setMigration(
      buildMigrationData()
    );
  }

  /* =======================================================
     CLOUD COUNTS
  ======================================================= */

  async function refreshCloudCounts() {
    setMessage(
      "בודק את הנתונים ב-Supabase..."
    );

    try {
      const [
        cyclesResult,
        cadetsResult,
        membershipsResult,
        resultsResult,
      ] =
        await Promise.all([
        supabase
          .from(
            "course_cycles"
          )
          .select(
            "*",
            {
              count: "exact",
              head: true,
            }
          ),

        supabase
          .from(
            "cadets"
          )
          .select(
            "*",
            {
              count: "exact",
              head: true,
            }
          ),

        supabase
          .from(
            "cadet_cycle_memberships"
          )
          .select(
            "*",
            {
              count: "exact",
              head: true,
            }
          ),

        supabase
          .from(
            "test_results"
          )
          .select(
            "*",
            {
              count: "exact",
              head: true,
            }
          ),
      ]);

      const firstError =
        cyclesResult.error ||
        cadetsResult.error ||
        membershipsResult.error ||
        resultsResult.error;

      if (firstError) {
        throw firstError;
      }

      setCloudCounts({
        cycles:
          cyclesResult.count ??
          0,

        cadets:
          cadetsResult.count ??
          0,

        memberships:
          membershipsResult.count ??
          0,

        results:
          resultsResult.count ??
          0,
      });

      setMessage(
        "בדיקת Supabase הושלמה בהצלחה."
      );

      if (
        status !==
        "success"
      ) {
        setStatus(
          "idle"
        );
      }
    } catch (error) {
      console.error(
        "Supabase count error:",
        error
      );

      setStatus(
        "error"
      );

      setMessage(
        error instanceof Error
          ? `שגיאת Supabase: ${error.message}`
          : "שגיאה בבדיקת Supabase"
      );
    }
  }

  /* =======================================================
     MIGRATE
  ======================================================= */

  async function migrate() {
    if (!isAdmin) {
      setStatus(
        "error"
      );

      setMessage(
        "רק משתמש מנהל יכול לבצע את ההעברה."
      );

      return;
    }

    if (!migration) {
      return;
    }

    const approved =
      window.confirm(
        "להעביר את נתוני CommandFit הקיימים ל-Supabase?\n\nהפעולה אינה מוחקת דבר מה-localStorage."
      );

    if (!approved) {
      return;
    }

    setStatus(
      "running"
    );

    setMessage(
      "מעביר מחזורים..."
    );

    try {
      /* ===================================================
         1. CYCLES
      =================================================== */

      if (
        migration.cycles.length >
        0
      ) {
        const {
          error,
        } =
          await supabase
            .from(
              "course_cycles"
            )
            .upsert(
              migration.cycles,
              {
                onConflict:
                  "id",
              }
            );

        if (error) {
          throw new Error(
            `מחזורים: ${error.message}`
          );
        }
      }

      /* ===================================================
         2. CADETS
      =================================================== */

      setMessage(
        "מעביר זהויות צוערים..."
      );

      if (
        migration.cadets.length >
        0
      ) {
        const {
          error,
        } =
          await supabase
            .from(
              "cadets"
            )
            .upsert(
              migration.cadets,
              {
                onConflict:
                  "global_id",
              }
            );

        if (error) {
          throw new Error(
            `צוערים: ${error.message}`
          );
        }
      }

      /* ===================================================
         3. MEMBERSHIPS
      =================================================== */

      setMessage(
        "מעביר שיוך צוערים למחזור..."
      );

      if (
        migration.memberships.length >
        0
      ) {
        const {
          error,
        } =
          await supabase
            .from(
              "cadet_cycle_memberships"
            )
            .upsert(
              migration.memberships,
              {
                onConflict:
                  "global_id,cycle_id",
              }
            );

        if (error) {
          throw new Error(
            `שיוך למחזור: ${error.message}`
          );
        }
      }

      /* ===================================================
         4. RESULTS
      =================================================== */

      setMessage(
        "מעביר תוצאות בחנים..."
      );

      /*
        שולחים במנות קטנות יותר
        כדי לא להעמיס על הבקשה.
      */
      const chunkSize =
        200;

      for (
        let index = 0;
        index <
        migration.results.length;
        index +=
          chunkSize
      ) {
        const chunk =
          migration.results.slice(
            index,
            index +
              chunkSize
          );

        const {
          error,
        } =
          await supabase
            .from(
              "test_results"
            )
            .upsert(
              chunk,
              {
                onConflict:
                  "id",
              }
            );

        if (error) {
          throw new Error(
            `תוצאות בחנים: ${error.message}`
          );
        }
      }

      /* ===================================================
         VERIFY
      =================================================== */

      await refreshCloudCounts();

      setStatus(
        "success"
      );

      setMessage(
        "העברת הנתונים הסתיימה בהצלחה. הנתונים המקומיים לא נמחקו."
      );
    } catch (
      error
    ) {
      console.error(
        error
      );

      setStatus(
        "error"
      );

      setMessage(
        error instanceof
        Error
          ? error.message
          : "אירעה שגיאה בהעברת הנתונים."
      );
    }
  }

  /* =======================================================
     UI
  ======================================================= */

  if (!mounted) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8"
      >
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl shadow-sm p-6 text-center text-slate-500">
            טוען נתוני CommandFit...
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8"
    >
      <div className="max-w-5xl mx-auto">

        <div className="bg-slate-900 text-white rounded-3xl p-5 sm:p-7">

          <p className="text-slate-400 text-sm">
            CommandFit
          </p>

          <h1 className="text-2xl sm:text-3xl font-bold mt-1">
            העברת נתונים ל-Supabase
          </h1>

          <p className="text-slate-300 mt-2">
            העברה חד-פעמית ובטוחה של הנתונים הקיימים מהדפדפן למסד הנתונים בענן.
          </p>

        </div>

        {isViewer && (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-4 mt-5">
            👁️ משתמש צפייה בלבד אינו מורשה לבצע Migration.
          </div>
        )}

        <section className="bg-white rounded-3xl shadow-sm p-5 sm:p-7 mt-6">

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

            <div>
              <h2 className="text-xl sm:text-2xl font-bold">
                נתונים שנמצאו בדפדפן
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                זו תצוגה מקדימה בלבד. עדיין לא הועבר דבר.
              </p>
            </div>

            <button
              type="button"
              onClick={
                refreshLocalPreview
              }
              className="border border-slate-200 rounded-xl px-4 py-3"
            >
              רענון בדיקה
            </button>

          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">

            <CountCard
              title="מחזורים"
              value={
                preview?.cycles ??
                0
              }
            />

            <CountCard
              title="זהויות צוערים"
              value={
                preview?.cadetIdentities ??
                0
              }
            />

            <CountCard
              title="שיוכי צוער למחזור"
              value={
                preview?.memberships ??
                0
              }
            />

            <CountCard
              title="תוצאות בחנים"
              value={
                preview?.testResults ??
                0
              }
            />

          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">

            <SmallCard
              title="מחזורי Legacy"
              value={
                preview?.legacyCycles ??
                0
              }
            />

            <SmallCard
              title="קבצי תוצאות מקומיים"
              value={
                preview?.directResultStorages ??
                0
              }
            />

            <SmallCard
              title="צוערים שדולגו"
              value={
                preview?.skippedCadets ??
                0
              }
            />

            <SmallCard
              title="תוצאות שדולגו"
              value={
                preview?.skippedResults ??
                0
              }
            />

          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mt-6 text-sm text-blue-900 leading-6">
            הנתונים המקומיים נשארים ב-localStorage גם לאחר ההעברה. אפשר לבצע את ההעברה שוב; הנתונים ב-Supabase מתעדכנים באמצעות Upsert ולא אמורים להיווצר כפילויות.
          </div>

          <button
            type="button"
            disabled={
              !isAdmin ||
              status ===
                "running"
            }
            onClick={
              migrate
            }
            className={
              !isAdmin ||
              status ===
                "running"
                ? "w-full mt-6 bg-slate-300 text-slate-500 rounded-2xl px-5 py-4 font-bold cursor-not-allowed"
                : "w-full mt-6 bg-green-600 hover:bg-green-700 text-white rounded-2xl px-5 py-4 font-bold"
            }
          >
            {status ===
            "running"
              ? "מעביר נתונים..."
              : "העברת נתוני CommandFit לענן"}
          </button>

          {message && (
            <div
              className={
                status ===
                "error"
                  ? "bg-red-50 border border-red-200 text-red-800 rounded-2xl p-4 mt-5"
                  : status ===
                    "success"
                  ? "bg-green-50 border border-green-200 text-green-800 rounded-2xl p-4 mt-5"
                  : "bg-slate-50 border border-slate-200 text-slate-700 rounded-2xl p-4 mt-5"
              }
            >
              {message}
            </div>
          )}

        </section>

        <section className="bg-white rounded-3xl shadow-sm p-5 sm:p-7 mt-6">

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">

            <div>
              <h2 className="text-xl sm:text-2xl font-bold">
                נתונים שנמצאים בענן
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                אפשר לבדוק בכל רגע כמה רשומות קיימות ב-Supabase.
              </p>
            </div>

            <button
              type="button"
              onClick={
                refreshCloudCounts
              }
              className="bg-slate-900 text-white rounded-xl px-4 py-3"
            >
              בדיקת Supabase
            </button>

          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6">

            <CountCard
              title="מחזורים בענן"
              value={
                cloudCounts.cycles ??
                "—"
              }
            />

            <CountCard
              title="צוערים בענן"
              value={
                cloudCounts.cadets ??
                "—"
              }
            />

            <CountCard
              title="שיוכים בענן"
              value={
                cloudCounts.memberships ??
                "—"
              }
            />

            <CountCard
              title="תוצאות בענן"
              value={
                cloudCounts.results ??
                "—"
              }
            />

          </div>

        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">

          <Link
            href="/db-test"
            className="bg-white border border-slate-200 rounded-xl px-5 py-3 text-center font-medium"
          >
            בדיקת חיבור למסד
          </Link>

          <Link
            href="/"
            className="bg-slate-900 text-white rounded-xl px-5 py-3 text-center font-medium"
          >
            חזרה ל-CommandFit
          </Link>

        </div>

      </div>
    </main>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function CountCard({
  title,
  value,
}: {
  title: string;
  value:
    | number
    | string;
}) {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 sm:p-5">

      <p className="text-xs sm:text-sm text-slate-500">
        {title}
      </p>

      <p className="text-2xl sm:text-4xl font-black mt-2">
        {value}
      </p>

    </div>
  );
}

function SmallCard({
  title,
  value,
}: {
  title: string;
  value:
    | number
    | string;
}) {
  return (
    <div className="border border-slate-200 rounded-xl p-4">

      <p className="text-xs text-slate-500">
        {title}
      </p>

      <p className="text-xl font-bold mt-1">
        {value}
      </p>

    </div>
  );
}
