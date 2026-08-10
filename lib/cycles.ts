/* =========================================================
   COMMAND FIT
   ניהול מחזורים — Local cache + Supabase sync
========================================================= */

import {
  supabase,
} from "@/lib/supabase";

export type CycleStatus =
  | "active"
  | "closed";

export type CourseCycle = {
  id: string;

  name: string;

  battalion: string;

  status: CycleStatus;

  startDate: string;

  endDate?: string;

  sourceCycles?: {
    dekel?: string;
    rimon?: string;
  };

  createdAt: string;

  closedAt?: string;
};

/* =========================================================
   STORAGE KEYS
========================================================= */

const CYCLES_STORAGE_KEY =
  "commandfit-cycles";

const ACTIVE_CYCLE_PREFIX =
  "commandfit-active-cycle";

/* =========================================================
   CLOUD TYPES
========================================================= */

type CloudCycleRow = {
  id: string;
  name: string;
  battalion: string;
  status: CycleStatus;
  start_date: string;
  end_date: string | null;
  source_cycles:
    | {
        dekel?: string;
        rimon?: string;
      }
    | null;
  created_at: string;
  closed_at: string | null;
};

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

function sortCycles(
  cycles: CourseCycle[]
) {
  return cycles
    .slice()
    .sort(
      (a, b) =>
        new Date(
          b.createdAt
        ).getTime() -
        new Date(
          a.createdAt
        ).getTime()
    );
}

function toCloudRow(
  cycle: CourseCycle
) {
  return {
    id: cycle.id,
    name: cycle.name,
    battalion:
      cycle.battalion,
    status:
      cycle.status,
    start_date:
      cycle.startDate,
    end_date:
      cycle.endDate ?? null,
    source_cycles:
      cycle.sourceCycles ?? null,
    created_at:
      cycle.createdAt,
    closed_at:
      cycle.closedAt ?? null,
  };
}

function fromCloudRow(
  row: CloudCycleRow
): CourseCycle {
  return {
    id: row.id,
    name: row.name,
    battalion:
      row.battalion,
    status:
      row.status,
    startDate:
      row.start_date,
    endDate:
      row.end_date ??
      undefined,
    sourceCycles:
      row.source_cycles ??
      undefined,
    createdAt:
      row.created_at,
    closedAt:
      row.closed_at ??
      undefined,
  };
}

/* =========================================================
   GET ALL CYCLES
   נשאר סינכרוני כדי לא לשבור את שאר המערכת.
   localStorage משמש כ-cache מקומי.
========================================================= */

export function getAllCycles():
  CourseCycle[] {
  if (
    typeof window ===
    "undefined"
  ) {
    return [];
  }

  const saved =
    localStorage.getItem(
      CYCLES_STORAGE_KEY
    );

  return sortCycles(
    safeParse<
      CourseCycle[]
    >(
      saved,
      []
    )
  );
}

/* =========================================================
   SAVE LOCAL CACHE
========================================================= */

function saveAllCycles(
  cycles: CourseCycle[]
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  localStorage.setItem(
    CYCLES_STORAGE_KEY,
    JSON.stringify(
      sortCycles(
        cycles
      )
    )
  );
}

/* =========================================================
   INITIAL CLOUD HYDRATION
   1. מעלה לענן מחזורים ישנים שחסרים שם
   2. טוען את הענן מחדש
   3. מעדכן את ה-cache המקומי
========================================================= */

export async function hydrateCyclesFromCloud() {
  if (
    typeof window ===
    "undefined"
  ) {
    return [];
  }

  const localCycles =
    getAllCycles();

  const {
    data: cloudData,
    error: cloudError,
  } =
    await supabase
      .from(
        "commandfit_cycles"
      )
      .select(
        `
          id,
          name,
          battalion,
          status,
          start_date,
          end_date,
          source_cycles,
          created_at,
          closed_at
        `
      )
      .order(
        "created_at",
        {
          ascending: false,
        }
      );

  if (cloudError) {
    console.error(
      "Cycles cloud load error:",
      cloudError
    );

    return localCycles;
  }

  const existingIds =
    new Set(
      (
        (
          cloudData ??
          []
        ) as CloudCycleRow[]
      ).map(
        (row) =>
          row.id
      )
    );

  const missingLocal =
    localCycles.filter(
      (cycle) =>
        !existingIds.has(
          cycle.id
        )
    );

  /*
    מעלים רק מחזורים מקומיים שחסרים בענן.
    כך לא דורסים מידע שכבר עודכן ממחשב אחר.
  */
  for (
    const cycle of
    missingLocal
  ) {
    if (
      cycle.status ===
      "active"
    ) {
      await supabase
        .from(
          "commandfit_cycles"
        )
        .update({
          status:
            "closed",
          closed_at:
            new Date()
              .toISOString(),
        })
        .eq(
          "battalion",
          cycle.battalion
        )
        .eq(
          "status",
          "active"
        );
    }

    const {
      error,
    } =
      await supabase
        .from(
          "commandfit_cycles"
        )
        .upsert(
          toCloudRow(
            cycle
          ),
          {
            onConflict:
              "id",
          }
        );

    if (error) {
      console.error(
        "Legacy cycle cloud migration error:",
        error
      );
    }
  }

  const {
    data: refreshed,
    error: refreshError,
  } =
    await supabase
      .from(
        "commandfit_cycles"
      )
      .select(
        `
          id,
          name,
          battalion,
          status,
          start_date,
          end_date,
          source_cycles,
          created_at,
          closed_at
        `
      )
      .order(
        "created_at",
        {
          ascending: false,
        }
      );

  if (refreshError) {
    console.error(
      "Cycles cloud refresh error:",
      refreshError
    );

    return localCycles;
  }

  const cycles =
    (
      (
        refreshed ??
        []
      ) as CloudCycleRow[]
    ).map(
      fromCloudRow
    );

  saveAllCycles(
    cycles
  );

  /*
    אם אין בחירה מקומית לגדוד אבל יש מחזור פעיל בענן,
    בוחרים אותו אוטומטית.
  */
  const activeByBattalion =
    new Map<
      string,
      CourseCycle
    >();

  for (
    const cycle of
    cycles
  ) {
    if (
      cycle.status ===
      "active" &&
      !activeByBattalion.has(
        cycle.battalion
      )
    ) {
      activeByBattalion.set(
        cycle.battalion,
        cycle
      );
    }
  }

  for (
    const [
      battalion,
      cycle,
    ] of
    activeByBattalion
  ) {
    const localActiveId =
      getActiveCycleId(
        battalion
      );

    if (
      !localActiveId ||
      !cycles.some(
        (item) =>
          item.id ===
            localActiveId &&
          item.battalion ===
            battalion
      )
    ) {
      setActiveCycle(
        battalion,
        cycle.id
      );
    }
  }

  return cycles;
}

/* =========================================================
   GET CYCLES BY BATTALION
========================================================= */

export function getCyclesByBattalion(
  battalion: string
): CourseCycle[] {
  return getAllCycles()
    .filter(
      (cycle) =>
        cycle.battalion ===
        battalion
    );
}

/* =========================================================
   GET CYCLE BY ID
========================================================= */

export function getCycleById(
  cycleId: string
): CourseCycle | null {
  return (
    getAllCycles().find(
      (cycle) =>
        cycle.id ===
        cycleId
    ) ?? null
  );
}

/* =========================================================
   ACTIVE CYCLE
========================================================= */

export function getActiveCycleId(
  battalion: string
): string | null {
  if (
    typeof window ===
    "undefined"
  ) {
    return null;
  }

  return localStorage.getItem(
    `${ACTIVE_CYCLE_PREFIX}-${battalion}`
  );
}

export function getActiveCycle(
  battalion: string
): CourseCycle | null {
  const cycleId =
    getActiveCycleId(
      battalion
    );

  if (!cycleId) {
    /*
      fallback: אם אין בחירה מקומית,
      נחזיר את המחזור הפעיל האחרון שיש ב-cache.
    */
    return (
      getCyclesByBattalion(
        battalion
      ).find(
        (cycle) =>
          cycle.status ===
          "active"
      ) ?? null
    );
  }

  const cycle =
    getCycleById(
      cycleId
    );

  if (
    !cycle ||
    cycle.battalion !==
      battalion
  ) {
    return null;
  }

  return cycle;
}

export function setActiveCycle(
  battalion: string,
  cycleId: string
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  const cycle =
    getCycleById(
      cycleId
    );

  if (
    !cycle ||
    cycle.battalion !==
      battalion
  ) {
    return;
  }

  localStorage.setItem(
    `${ACTIVE_CYCLE_PREFIX}-${battalion}`,
    cycleId
  );
}

/* =========================================================
   CLOUD MUTATIONS
========================================================= */

async function createCycleInCloud(
  cycle: CourseCycle
) {
  /*
    סוגרים קודם מחזור פעיל קיים כדי לא להפר
    את ה-unique index של מחזור פעיל אחד לגדוד.
  */
  const now =
    new Date()
      .toISOString();

  const {
    error: closeError,
  } =
    await supabase
      .from(
        "commandfit_cycles"
      )
      .update({
        status:
          "closed",
        closed_at:
          now,
      })
      .eq(
        "battalion",
        cycle.battalion
      )
      .eq(
        "status",
        "active"
      );

  if (closeError) {
    console.error(
      "Close previous active cycle in cloud failed:",
      closeError
    );
  }

  const {
    error,
  } =
    await supabase
      .from(
        "commandfit_cycles"
      )
      .upsert(
        toCloudRow(
          cycle
        ),
        {
          onConflict:
            "id",
        }
      );

  if (error) {
    console.error(
      "Create cycle in cloud failed:",
      error
    );
  }
}

async function closeCycleInCloud(
  cycle: CourseCycle
) {
  const {
    error,
  } =
    await supabase
      .from(
        "commandfit_cycles"
      )
      .update({
        status:
          cycle.status,
        end_date:
          cycle.endDate ??
          null,
        closed_at:
          cycle.closedAt ??
          null,
      })
      .eq(
        "id",
        cycle.id
      );

  if (error) {
    console.error(
      "Close cycle in cloud failed:",
      error
    );
  }
}

async function reopenCycleInCloud(
  cycle: CourseCycle
) {
  const now =
    new Date()
      .toISOString();

  const {
    error: closeError,
  } =
    await supabase
      .from(
        "commandfit_cycles"
      )
      .update({
        status:
          "closed",
        closed_at:
          now,
      })
      .eq(
        "battalion",
        cycle.battalion
      )
      .eq(
        "status",
        "active"
      )
      .neq(
        "id",
        cycle.id
      );

  if (closeError) {
    console.error(
      "Close other active cycles in cloud failed:",
      closeError
    );
  }

  const {
    error,
  } =
    await supabase
      .from(
        "commandfit_cycles"
      )
      .update({
        status:
          "active",
        end_date:
          null,
        closed_at:
          null,
      })
      .eq(
        "id",
        cycle.id
      );

  if (error) {
    console.error(
      "Reopen cycle in cloud failed:",
      error
    );
  }
}

/* =========================================================
   CREATE CYCLE
========================================================= */

export function createCycle({
  name,
  battalion,
  startDate,
  sourceCycles,
}: {
  name: string;
  battalion: string;
  startDate: string;

  sourceCycles?: {
    dekel?: string;
    rimon?: string;
  };
}): CourseCycle {
  const now =
    new Date().toISOString();

  const cycle:
    CourseCycle = {
      id:
        `cycle-${battalion}-${Date.now()}`,

      name:
        name.trim(),

      battalion,

      status:
        "active",

      startDate,

      sourceCycles,

      createdAt:
        now,
    };

  const cycles =
    getAllCycles();

  const updated =
    cycles.map(
      (item) => {
        if (
          item.battalion ===
            battalion &&
          item.status ===
            "active"
        ) {
          return {
            ...item,

            status:
              "closed" as const,

            closedAt:
              now,
          };
        }

        return item;
      }
    );

  updated.push(
    cycle
  );

  saveAllCycles(
    updated
  );

  setActiveCycle(
    battalion,
    cycle.id
  );

  void createCycleInCloud(
    cycle
  );

  return cycle;
}

/* =========================================================
   CLOSE CYCLE
========================================================= */

export function closeCycle(
  cycleId: string,
  endDate?: string
): CourseCycle | null {
  const cycles =
    getAllCycles();

  const current =
    cycles.find(
      (cycle) =>
        cycle.id ===
        cycleId
    );

  if (!current) {
    return null;
  }

  const closedAt =
    new Date().toISOString();

  const updatedCycle:
    CourseCycle = {
      ...current,

      status:
        "closed",

      endDate:
        endDate ||
        current.endDate,

      closedAt,
    };

  saveAllCycles(
    cycles.map(
      (cycle) =>
        cycle.id ===
        cycleId
          ? updatedCycle
          : cycle
    )
  );

  const activeId =
    getActiveCycleId(
      current.battalion
    );

  if (
    activeId ===
      cycleId &&
    typeof window !==
      "undefined"
  ) {
    localStorage.removeItem(
      `${ACTIVE_CYCLE_PREFIX}-${current.battalion}`
    );
  }

  void closeCycleInCloud(
    updatedCycle
  );

  return updatedCycle;
}

/* =========================================================
   REOPEN CYCLE
========================================================= */

export function reopenCycle(
  cycleId: string
): CourseCycle | null {
  const cycles =
    getAllCycles();

  const current =
    cycles.find(
      (cycle) =>
        cycle.id ===
        cycleId
    );

  if (!current) {
    return null;
  }

  const updated =
    cycles.map(
      (cycle) => {
        if (
          cycle.battalion ===
            current.battalion &&
          cycle.id !==
            cycleId &&
          cycle.status ===
            "active"
        ) {
          return {
            ...cycle,

            status:
              "closed" as const,

            closedAt:
              new Date()
                .toISOString(),
          };
        }

        if (
          cycle.id ===
          cycleId
        ) {
          return {
            ...cycle,

            status:
              "active" as const,

            closedAt:
              undefined,

            endDate:
              undefined,
          };
        }

        return cycle;
      }
    );

  saveAllCycles(
    updated
  );

  setActiveCycle(
    current.battalion,
    cycleId
  );

  const reopened =
    updated.find(
      (cycle) =>
        cycle.id ===
        cycleId
    ) ?? null;

  if (reopened) {
    void reopenCycleInCloud(
      reopened
    );
  }

  return reopened;
}

/* =========================================================
   DELETE CYCLE
========================================================= */

export function deleteCycle(
  cycleId: string
): boolean {
  const cycles =
    getAllCycles();

  const cycle =
    cycles.find(
      (item) =>
        item.id ===
        cycleId
    );

  if (!cycle) {
    return false;
  }

  const updated =
    cycles.filter(
      (item) =>
        item.id !==
        cycleId
    );

  saveAllCycles(
    updated
  );

  const activeId =
    getActiveCycleId(
      cycle.battalion
    );

  if (
    activeId ===
      cycleId &&
    typeof window !==
      "undefined"
  ) {
    localStorage.removeItem(
      `${ACTIVE_CYCLE_PREFIX}-${cycle.battalion}`
    );
  }

  /*
    שמירה לעתיד בלבד — אם נשתמש במחיקה בפועל,
    היא תימחק גם מהענן.
  */
  void supabase
    .from(
      "commandfit_cycles"
    )
    .delete()
    .eq(
      "id",
      cycleId
    )
    .then(
      ({ error }) => {
        if (error) {
          console.error(
            "Delete cycle from cloud failed:",
            error
          );
        }
      }
    );

  return true;
}

/* =========================================================
   STORAGE KEYS FOR DATA
========================================================= */

export function getCadetsStorageKey(
  battalion: string,
  cycleId: string
) {
  return `commandfit-cadets-${battalion}-${cycleId}`;
}

export function getResultsStorageKey(
  battalion: string,
  cycleId: string,
  testName: string
) {
  return `commandfit-results-${battalion}-${cycleId}-${testName}`;
}

/* =========================================================
   LEGACY STORAGE
========================================================= */

export function getLegacyCadetsStorageKey(
  battalion: string
) {
  return `commandfit-cadets-${battalion}`;
}

export function getLegacyResultsStorageKey(
  battalion: string,
  testName: string
) {
  return `commandfit-results-${battalion}-${testName}`;
}

/* =========================================================
   MIGRATION
========================================================= */

export function migrateLegacyDataToCycle(
  battalion: string,
  cycleId: string,
  testNames: string[]
) {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  const legacyCadetsKey =
    getLegacyCadetsStorageKey(
      battalion
    );

  const newCadetsKey =
    getCadetsStorageKey(
      battalion,
      cycleId
    );

  const existingNewCadets =
    localStorage.getItem(
      newCadetsKey
    );

  if (!existingNewCadets) {
    const legacyCadets =
      localStorage.getItem(
        legacyCadetsKey
      );

    if (legacyCadets) {
      localStorage.setItem(
        newCadetsKey,
        legacyCadets
      );
    }
  }

  testNames.forEach(
    (testName) => {
      const legacyKey =
        getLegacyResultsStorageKey(
          battalion,
          testName
        );

      const newKey =
        getResultsStorageKey(
          battalion,
          cycleId,
          testName
        );

      const existingNew =
        localStorage.getItem(
          newKey
        );

      if (existingNew) {
        return;
      }

      const legacy =
        localStorage.getItem(
          legacyKey
        );

      if (legacy) {
        localStorage.setItem(
          newKey,
          legacy
        );
      }
    }
  );
}

/* =========================================================
   HAS LEGACY DATA
========================================================= */

export function hasLegacyData(
  battalion: string,
  testNames: string[]
): boolean {
  if (
    typeof window ===
    "undefined"
  ) {
    return false;
  }

  const cadets =
    localStorage.getItem(
      getLegacyCadetsStorageKey(
        battalion
      )
    );

  if (cadets) {
    return true;
  }

  return testNames.some(
    (testName) =>
      Boolean(
        localStorage.getItem(
          getLegacyResultsStorageKey(
            battalion,
            testName
          )
        )
      )
  );
}

/* =========================================================
   CYCLE LABEL
========================================================= */

export function getCycleStatusLabel(
  status: CycleStatus
) {
  if (
    status ===
    "active"
  ) {
    return "פעיל";
  }

  return "סגור";
}