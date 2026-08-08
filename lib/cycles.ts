/* =========================================================
   COMMAND FIT
   ניהול מחזורים
========================================================= */

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

/* =========================================================
   GET ALL CYCLES
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
   SAVE ALL CYCLES
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
      cycles
    )
  );
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
    return null;
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

  const cycle: CourseCycle =
    {
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

  /*
    רק מחזור פעיל אחד לכל גדוד
  */
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

  /*
    סוגרים כל מחזור פעיל אחר
    של אותו גדוד
  */
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
              new Date().toISOString(),
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

  return (
    updated.find(
      (cycle) =>
        cycle.id ===
        cycleId
    ) ?? null
  );
}

/* =========================================================
   DELETE CYCLE
   נשתמש בזה רק אם נרצה בעתיד
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
   הנתונים הישנים שקיימים כרגע
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
   העברת הנתונים הקיימים למחזור ראשון
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

  /*
    צוערים
  */
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

  /*
    תוצאות
  */
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
    status === "active"
  ) {
    return "פעיל";
  }

  return "סגור";
}