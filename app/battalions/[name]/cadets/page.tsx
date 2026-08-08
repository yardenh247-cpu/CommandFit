"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ChangeEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as XLSX from "xlsx";

import {
  getActiveCycle,
  getCadetsStorageKey,
  getLegacyCadetsStorageKey,
  type CourseCycle,
} from "@/lib/cycles";

import {
  useAuth,
} from "@/lib/use-auth";

import {
  supabase,
} from "@/lib/supabase";

/* =========================================================
   TYPES
========================================================= */

type Gender =
  | ""
  | "זכר"
  | "נקבה";

type FitnessLevel =
  | ""
  | "רמה 1"
  | "רמה 2"
  | "רמה 3";

type LoranPopulation =
  | ""
  | "מתמרן"
  | 'חי"ר'
  | "יחידות מובחרות"
  | "לוחמת"
  | "לוחמת מיוחדת";

type CourseStatus =
  | "פעיל"
  | "הודח"
  | "מיועד לחזרה";

type MedicalStatus =
  | ""
  | "כשיר"
  | "לא כשיר"
  | "פטור זמני"
  | "אחר";

type IdentificationSource =
  | ""
  | "auto"
  | "manual";

type Cadet = {
  id: number;
  globalId: string;

  name: string;
  gender: Gender;

  brigade: string;
  unit: string;

  company: string;
  team: string;

  loranPopulation: LoranPopulation;

  medicalStatus: MedicalStatus;
  courseStatus: CourseStatus;

  fitnessLevel: FitnessLevel;
  shootingLevel: string;

  fitnessLevelSource: IdentificationSource;
  shootingLevelSource: IdentificationSource;
  loranPopulationSource: IdentificationSource;

  previousBattalion: string;

  dismissalReason: string;
  dismissalDate: string;
  returnNotes: string;

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

  fitness_level_source: string | null;
  shooting_level_source: string | null;
  loran_population_source: string | null;

  previous_battalion: string | null;

  dismissal_reason: string | null;
  dismissal_date: string | null;
  return_notes: string | null;

  notes: string | null;

  cadets:
    | CloudCadetRow
    | CloudCadetRow[]
    | null;
};


/* =========================================================
   CONFIG
========================================================= */

const MAX_CADETS = 350;

/* =========================================================
   HELPERS
========================================================= */

function createGlobalId() {
  if (
    typeof crypto !== "undefined" &&
    "randomUUID" in crypto
  ) {
    return crypto.randomUUID();
  }

  return `cadet-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

function createEmptyCadet(
  index: number
): Cadet {
  return {
    id: index + 1,
    globalId: createGlobalId(),

    name: "",
    gender: "",

    brigade: "",
    unit: "",

    company: "",
    team: "",

    loranPopulation: "",

    medicalStatus: "כשיר",
    courseStatus: "פעיל",

    fitnessLevel: "",
    shootingLevel: "",

    fitnessLevelSource: "",
    shootingLevelSource: "",
    loranPopulationSource: "",

    previousBattalion: "",

    dismissalReason: "",
    dismissalDate: "",
    returnNotes: "",

    notes: "",
  };
}

function createEmptyCadets() {
  return Array.from(
    {
      length: MAX_CADETS,
    },
    (_, index) =>
      createEmptyCadet(index)
  );
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

function normalizeName(
  value: string
) {
  return normalizeText(value)
    .replace(/["'״׳]/g, "")
    .toLowerCase();
}

function normalizeGender(
  value: unknown
): Gender {
  const text =
    normalizeText(value);

  if (
    text === "זכר" ||
    text === "גבר" ||
    text === "בן" ||
    text.toLowerCase() === "male"
  ) {
    return "זכר";
  }

  if (
    text === "נקבה" ||
    text === "אישה" ||
    text === "בת" ||
    text.toLowerCase() === "female"
  ) {
    return "נקבה";
  }

  return "";
}

function normalizeMedicalStatus(
  value: unknown
): MedicalStatus {
  const text =
    normalizeText(value);

  if (!text) {
    return "כשיר";
  }

  if (
    text.includes(
      "לא כשיר"
    )
  ) {
    return "לא כשיר";
  }

  if (
    text.includes(
      "פטור"
    )
  ) {
    return "פטור זמני";
  }

  if (
    text.includes(
      "כשיר"
    )
  ) {
    return "כשיר";
  }

  return "אחר";
}

function normalizeCourseStatus(
  value: unknown
): CourseStatus {
  const text =
    normalizeText(value);

  if (
    text.includes(
      "מיועד לחזרה"
    ) ||
    text.includes(
      "חוזר"
    ) ||
    text.includes(
      "מחזור נוסף"
    )
  ) {
    return "מיועד לחזרה";
  }

  if (
    text.includes(
      "הודח"
    ) ||
    text.includes(
      "מודח"
    )
  ) {
    return "הודח";
  }

  return "פעיל";
}

function includesAny(
  source: string,
  values: string[]
) {
  const normalized =
    source.toLowerCase();

  return values.some(
    (value) =>
      normalized.includes(
        value.toLowerCase()
      )
  );
}

/* =========================================================
   AUTO IDENTIFICATION
========================================================= */

function detectUnitSettings(
  cadet: Cadet
): {
  fitnessLevel: FitnessLevel;
  shootingLevel: string;
  loranPopulation: LoranPopulation;
} {
  const unitText =
    `${cadet.brigade} ${cadet.unit}`;

  const isFemale =
    cadet.gender === "נקבה";

  const specialUnits = [
    "שייטת 13",
    "שייטת",
    'סיירת מטכ"ל',
    "סיירת מטכ״ל",
    "מטכל",
    "מטכ״ל",
    "שלדג",
    "669",
    "מגלן",
    "דובדבן",
    "אגוז",
    "יהלם",
    "יהל״ם",
    "עוקץ",
    "קומנדו",
  ];

  const infantryUnits = [
    "גולני",
    "גבעתי",
    "נחל",
    "נח״ל",
    "כפיר",
    "צנחנים",
    "חי״ר",
    'חי"ר',
    "חיר",
  ];

  const maneuverUnits = [
    "שריון",
    "תותחנים",
    "הנדסה",
    "איסוף",
    "מתמרן",
    "מתנייע",
  ];

  const isSpecial =
    includesAny(
      unitText,
      specialUnits
    );

  const isInfantry =
    includesAny(
      unitText,
      infantryUnits
    );

  const isManeuver =
    includesAny(
      unitText,
      maneuverUnits
    );

  if (isFemale) {
    if (isSpecial) {
      return {
        fitnessLevel:
          "רמה 3",

        shootingLevel:
          "75",

        loranPopulation:
          "לוחמת מיוחדת",
      };
    }

    return {
      fitnessLevel:
        isInfantry
          ? "רמה 2"
          : "רמה 1",

      shootingLevel:
        isInfantry
          ? "70"
          : "60",

      loranPopulation:
        "לוחמת",
    };
  }

  if (isSpecial) {
    return {
      fitnessLevel:
        "רמה 3",

      shootingLevel:
        "75",

      loranPopulation:
        "יחידות מובחרות",
    };
  }

  if (isInfantry) {
    return {
      fitnessLevel:
        "רמה 2",

      shootingLevel:
        "70",

      loranPopulation:
        'חי"ר',
    };
  }

  if (isManeuver) {
    return {
      fitnessLevel:
        "רמה 1",

      shootingLevel:
        "60",

      loranPopulation:
        "מתמרן",
    };
  }

  return {
    fitnessLevel: "",
    shootingLevel: "",
    loranPopulation: "",
  };
}

/* =========================================================
   EXCEL
========================================================= */

function findExcelValue(
  row: Record<
    string,
    unknown
  >,
  aliases: string[]
) {
  const keys =
    Object.keys(row);

  for (
    const alias of aliases
  ) {
    const exact =
      keys.find(
        (key) =>
          normalizeText(key) ===
          normalizeText(alias)
      );

    if (exact) {
      return row[exact];
    }
  }

  for (
    const alias of aliases
  ) {
    const partial =
      keys.find(
        (key) =>
          normalizeText(key).includes(
            normalizeText(alias)
          )
      );

    if (partial) {
      return row[partial];
    }
  }

  return "";
}

/* =========================================================
   PAGE
========================================================= */

export default function CadetsPage() {
  const {
    isViewer,
  } = useAuth();

  const params =
    useParams<{
      name: string;
    }>();

  const router =
    useRouter();

  const battalionName =
    decodeURIComponent(
      params.name
    );

  const [
    activeCycle,
    setActiveCycleState,
  ] =
    useState<CourseCycle | null>(
      null
    );

  const fileInputRef =
    useRef<HTMLInputElement | null>(
      null
    );

  const [
    cadets,
    setCadets,
  ] =
    useState<Cadet[]>(
      []
    );

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    savedMessage,
    setSavedMessage,
  ] =
    useState("");

  const [
    importMessage,
    setImportMessage,
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
    showDismissed,
    setShowDismissed,
  ] =
    useState(true);

  const [
    showAddCadet,
    setShowAddCadet,
  ] =
    useState(false);

  const [
    managedCadetId,
    setManagedCadetId,
  ] =
    useState<number | null>(
      null
    );

  const [
    addCadetForm,
    setAddCadetForm,
  ] =
    useState({
      name: "",
      gender: "" as Gender,
      brigade: "",
      unit: "",
      company: "",
      team: "",
      source: "צוער חדש",
    });


  const storageKey =
    activeCycle
      ? getCadetsStorageKey(
          battalionName,
          activeCycle.id
        )
      : getLegacyCadetsStorageKey(
          battalionName
        );

  /*
    גם אם עדיין עובדים עם "נתונים קיימים"
    ללא מחזור פעיל, ה-Migration כבר יצר
    ב-Supabase מחזור טכני בשם legacy-{גדוד}.
  */
  const cloudCycleId =
    activeCycle?.id ||
    `legacy-${battalionName}`;

  const isReadOnly =
    activeCycle?.status === "closed" ||
    isViewer;
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
  }, [
    battalionName,
  ]);

  /* =======================================================
     LOAD
     Supabase first, localStorage fallback
  ======================================================= */

  useEffect(() => {
    let cancelled =
      false;

    async function loadCadets() {
      setCloudLoading(
        true
      );

      /*
        מנסים קודם לקרוא את רשימת הצוערים מהענן.
        אם אין מחזור פעיל, משתמשים במחזור
        ה-Legacy שנוצר בזמן ה-Migration.
      */
      if (cloudCycleId) {
        const {
          data,
          error,
        } =
          await supabase
            .from(
              "cadet_cycle_memberships"
            )
            .select(
              `
                global_id,
                cadet_number,
                company,
                team,
                loran_population,
                medical_status,
                course_status,
                fitness_level,
                shooting_level,
                fitness_level_source,
                shooting_level_source,
                loran_population_source,
                previous_battalion,
                dismissal_reason,
                dismissal_date,
                return_notes,
                notes,
                cadets (
                  name,
                  gender,
                  brigade,
                  unit
                )
              `
            )
            .eq(
              "cycle_id",
              cloudCycleId
            )
            .eq(
              "battalion",
              battalionName
            )
            .order(
              "cadet_number",
              {
                ascending:
                  true,
              }
            );

        if (
          !cancelled &&
          !error &&
          data &&
          data.length > 0
        ) {
          const rows =
            data as unknown as
              CloudMembershipRow[];

          const loaded =
            createEmptyCadets();

          rows.forEach(
            (
              row,
              index
            ) => {
              const cloudCadet =
                Array.isArray(
                  row.cadets
                )
                  ? row.cadets[0]
                  : row.cadets;

              const cadetNumber =
                row.cadet_number &&
                row.cadet_number >
                  0 &&
                row.cadet_number <=
                  MAX_CADETS
                  ? row.cadet_number
                  : index + 1;

              const targetIndex =
                cadetNumber -
                1;

              loaded[
                targetIndex
              ] = {
                ...createEmptyCadet(
                  targetIndex
                ),

                id:
                  cadetNumber,

                globalId:
                  row.global_id,

                name:
                  cloudCadet?.name ||
                  "",

                gender:
                  (
                    cloudCadet?.gender ||
                    ""
                  ) as Gender,

                brigade:
                  cloudCadet?.brigade ||
                  "",

                unit:
                  cloudCadet?.unit ||
                  "",

                company:
                  row.company ||
                  "",

                team:
                  row.team ||
                  "",

                loranPopulation:
                  (
                    row.loran_population ||
                    ""
                  ) as LoranPopulation,

                medicalStatus:
                  (
                    row.medical_status ||
                    "כשיר"
                  ) as MedicalStatus,

                courseStatus:
                  (
                    row.course_status ||
                    "פעיל"
                  ) as CourseStatus,

                fitnessLevel:
                  (
                    row.fitness_level ||
                    ""
                  ) as FitnessLevel,

                shootingLevel:
                  row.shooting_level ||
                  "",

                fitnessLevelSource:
                  (
                    row.fitness_level_source ||
                    ""
                  ) as IdentificationSource,

                shootingLevelSource:
                  (
                    row.shooting_level_source ||
                    ""
                  ) as IdentificationSource,

                loranPopulationSource:
                  (
                    row.loran_population_source ||
                    ""
                  ) as IdentificationSource,

                previousBattalion:
                  row.previous_battalion ||
                  "",

                dismissalReason:
                  row.dismissal_reason ||
                  "",

                dismissalDate:
                  row.dismissal_date ||
                  "",

                returnNotes:
                  row.return_notes ||
                  "",

                notes:
                  row.notes ||
                  "",
              };
            }
          );

          setCadets(
            loaded
          );

          /*
            שומרים גם עותק מקומי.
            כך נשאר fallback אם האינטרנט נופל.
          */
          localStorage.setItem(
            storageKey,
            JSON.stringify(
              loaded
            )
          );

          setCloudMessage(
            "הנתונים נטענו מהענן"
          );

          setCloudLoading(
            false
          );

          return;
        }

        if (
          !cancelled &&
          error
        ) {
          console.error(
            "שגיאה בטעינת צוערים מ-Supabase:",
            error
          );

          setCloudMessage(
            "לא ניתן היה לטעון מהענן — מוצג העותק המקומי"
          );
        }
      }

      /*
        fallback ל-localStorage.
      */
      const saved =
        localStorage.getItem(
          storageKey
        );

      if (!saved) {
        if (!cancelled) {
          setCadets(
            createEmptyCadets()
          );

          setCloudLoading(
            false
          );
        }

        return;
      }

      try {
        const parsed =
          JSON.parse(
            saved
          ) as Partial<Cadet>[];

        const normalized =
          Array.from(
            {
              length:
                MAX_CADETS,
            },
            (_, index) => {
              const existing =
                parsed[index];

              if (!existing) {
                return createEmptyCadet(
                  index
                );
              }

              return {
                ...createEmptyCadet(
                  index
                ),
                ...existing,

                id:
                  existing.id ??
                  index + 1,

                globalId:
                  existing.globalId ||
                  createGlobalId(),

                courseStatus:
                  existing.courseStatus ===
                  "מיועד לחזרה"
                    ? "מיועד לחזרה"
                    : existing.courseStatus ===
                      "הודח"
                    ? "הודח"
                    : "פעיל",
              } as Cadet;
            }
          );

        if (!cancelled) {
          setCadets(
            normalized
          );
        }
      } catch (error) {
        console.error(
          "שגיאה בטעינת הצוערים:",
          error
        );

        if (!cancelled) {
          setCadets(
            createEmptyCadets()
          );
        }
      } finally {
        if (!cancelled) {
          setCloudLoading(
            false
          );
        }
      }
    }

    loadCadets();

    return () => {
      cancelled =
        true;
    };
  }, [
    activeCycle,
    battalionName,
    cloudCycleId,
    storageKey,
  ]);

  /* =======================================================
     FIND PREVIOUS IDENTITY
  ======================================================= */

  function findPreviousIdentity(
    name: string
  ): {
    globalId: string;
    battalion: string;
  } | null {
    if (
      battalionName !==
      "גפן"
    ) {
      return null;
    }

    const normalizedName =
      normalizeName(
        name
      );

    if (
      !normalizedName
    ) {
      return null;
    }

    const sourceCycles =
      activeCycle
        ?.sourceCycles;

    const sources = [
      {
        battalion:
          "דקל",
        cycleId:
          sourceCycles
            ?.dekel,
      },
      {
        battalion:
          "רימון",
        cycleId:
          sourceCycles
            ?.rimon,
      },
    ];

    for (
      const source of
      sources
    ) {
      const previousKey =
        source.cycleId
          ? getCadetsStorageKey(
              source.battalion,
              source.cycleId
            )
          : getLegacyCadetsStorageKey(
              source.battalion
            );

      const saved =
        localStorage.getItem(
          previousKey
        );

      if (!saved) {
        continue;
      }

      try {
        const previousCadets =
          JSON.parse(
            saved
          ) as Cadet[];

        const match =
          previousCadets.find(
            (cadet) =>
              normalizeName(
                cadet.name
              ) ===
                normalizedName &&
              Boolean(
                cadet.globalId
              )
          );

        if (match) {
          return {
            globalId:
              match.globalId,

            battalion:
              source.battalion,
          };
        }
      } catch {
        // ממשיכים למחזור המקור הבא
      }
    }

    return null;
  }

  /* =======================================================
     UPDATE CADET
  ======================================================= */

  function updateCadet(
    id: number,
    field: keyof Cadet,
    value: string
  ) {
    if (isReadOnly) {
      setSavedMessage(
        isViewer
          ? "המשתמש מחובר בהרשאת צפייה בלבד"
          : "המחזור סגור לקריאה בלבד"
      );
      return;
    }

    setCadets(
      (current) =>
        current.map(
          (cadet) => {
            if (
              cadet.id !== id
            ) {
              return cadet;
            }

            const updated = {
              ...cadet,
              [field]: value,
            } as Cadet;

            if (
              field ===
              "fitnessLevel"
            ) {
              updated.fitnessLevelSource =
                "manual";
            }

            if (
              field ===
              "shootingLevel"
            ) {
              updated.shootingLevelSource =
                "manual";
            }

            if (
              field ===
              "loranPopulation"
            ) {
              updated.loranPopulationSource =
                "manual";
            }

            if (
              field ===
                "name" &&
              battalionName ===
                "גפן" &&
              value.trim()
            ) {
              const previous =
                findPreviousIdentity(
                  value
                );

              if (previous) {
                updated.globalId =
                  previous.globalId;

                updated.previousBattalion =
                  previous.battalion;
              }
            }

            return updated;
          }
        )
    );

    setSavedMessage("");
  }

  /* =======================================================
     AUTO IDENTIFY ONE
  ======================================================= */

  function autoIdentifyCadet(
    id: number
  ) {
    if (isReadOnly) {
      setSavedMessage(
        isViewer
          ? "המשתמש מחובר בהרשאת צפייה בלבד"
          : "המחזור סגור לקריאה בלבד"
      );
      return;
    }

    setCadets(
      (current) =>
        current.map(
          (cadet) => {
            if (
              cadet.id !== id
            ) {
              return cadet;
            }

            const detected =
              detectUnitSettings(
                cadet
              );

            return {
              ...cadet,

              fitnessLevel:
                detected.fitnessLevel,

              shootingLevel:
                detected.shootingLevel,

              loranPopulation:
                detected.loranPopulation,

              fitnessLevelSource:
                detected.fitnessLevel
                  ? "auto"
                  : "",

              shootingLevelSource:
                detected.shootingLevel
                  ? "auto"
                  : "",

              loranPopulationSource:
                detected.loranPopulation
                  ? "auto"
                  : "",
            };
          }
        )
    );
  }

  /* =======================================================
     AUTO IDENTIFY ALL
  ======================================================= */

  function autoIdentifyAll() {
    if (isReadOnly) {
      setSavedMessage(
        isViewer
          ? "המשתמש מחובר בהרשאת צפייה בלבד"
          : "המחזור סגור לקריאה בלבד"
      );
      return;
    }

    setCadets(
      (current) =>
        current.map(
          (cadet) => {
            if (
              !cadet.name.trim()
            ) {
              return cadet;
            }

            const detected =
              detectUnitSettings(
                cadet
              );

            const previous =
              findPreviousIdentity(
                cadet.name
              );

            return {
              ...cadet,

              globalId:
                previous?.globalId ||
                cadet.globalId,

              previousBattalion:
                previous?.battalion ||
                cadet.previousBattalion,

              fitnessLevel:
                cadet.fitnessLevelSource ===
                "manual"
                  ? cadet.fitnessLevel
                  : detected.fitnessLevel,

              shootingLevel:
                cadet.shootingLevelSource ===
                "manual"
                  ? cadet.shootingLevel
                  : detected.shootingLevel,

              loranPopulation:
                cadet.loranPopulationSource ===
                "manual"
                  ? cadet.loranPopulation
                  : detected.loranPopulation,

              fitnessLevelSource:
                cadet.fitnessLevelSource ===
                "manual"
                  ? "manual"
                  : detected.fitnessLevel
                  ? "auto"
                  : "",

              shootingLevelSource:
                cadet.shootingLevelSource ===
                "manual"
                  ? "manual"
                  : detected.shootingLevel
                  ? "auto"
                  : "",

              loranPopulationSource:
                cadet.loranPopulationSource ===
                "manual"
                  ? "manual"
                  : detected.loranPopulation
                  ? "auto"
                  : "",
            };
          }
        )
    );

    setImportMessage(
      "הזיהוי האוטומטי הושלם"
    );
  }

  /* =======================================================
     SAVE
     localStorage + Supabase
  ======================================================= */

  async function saveCadets() {
    if (isReadOnly) {
      setSavedMessage(
        isViewer
          ? "המשתמש מחובר בהרשאת צפייה בלבד"
          : "המחזור סגור לקריאה בלבד"
      );
      return;
    }

    /*
      תמיד שומרים קודם מקומית.
    */
    localStorage.setItem(
      storageKey,
      JSON.stringify(
        cadets
      )
    );

    const named =
      cadets.filter(
        (cadet) =>
          Boolean(
            cadet.name.trim()
          )
      );

    setSavedMessage(
      "שומר לענן..."
    );

    try {
      /*
        1. זהות קבועה של כל צוער.
      */
      if (
        named.length >
        0
      ) {
        const {
          error:
            cadetsError,
        } =
          await supabase
            .from(
              "cadets"
            )
            .upsert(
              named.map(
                (cadet) => ({
                  global_id:
                    cadet.globalId,

                  name:
                    cadet.name,

                  gender:
                    cadet.gender ||
                    null,

                  brigade:
                    cadet.brigade ||
                    null,

                  unit:
                    cadet.unit ||
                    null,
                })
              ),
              {
                onConflict:
                  "global_id",
              }
            );

        if (
          cadetsError
        ) {
          throw new Error(
            `שמירת צוערים: ${cadetsError.message}`
          );
        }
      }

      /*
        2. מסנכרנים מחדש את כל השיוכים
        של הגדוד במחזור הנוכחי.
        כך גם הסרה של צוער משתקפת בענן.
      */
      const {
        error:
          deleteError,
      } =
        await supabase
          .from(
            "cadet_cycle_memberships"
          )
          .delete()
          .eq(
            "cycle_id",
            cloudCycleId
          )
          .eq(
            "battalion",
            battalionName
          );

      if (
        deleteError
      ) {
        throw new Error(
          `ניקוי שיוכים ישנים: ${deleteError.message}`
        );
      }

      if (
        named.length >
        0
      ) {
        const {
          error:
            membershipsError,
        } =
          await supabase
            .from(
              "cadet_cycle_memberships"
            )
            .insert(
              named.map(
                (cadet) => ({
                  global_id:
                    cadet.globalId,

                  cycle_id:
                    cloudCycleId,

                  battalion:
                    battalionName,

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
                    cadet.courseStatus,

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
                })
              )
            );

        if (
          membershipsError
        ) {
          throw new Error(
            `שמירת שיוכים למחזור: ${membershipsError.message}`
          );
        }
      }

      setSavedMessage(
        activeCycle
          ? "רשימת הצוערים נשמרה בענן ובהצלחה"
          : "רשימת הצוערים נשמרה בענן תחת נתונים קיימים"
      );

      setCloudMessage(
        "מסונכרן עם Supabase"
      );
    } catch (
      error
    ) {
      console.error(
        "שגיאה בשמירת צוערים לענן:",
        error
      );

      setSavedMessage(
        error instanceof
        Error
          ? `הנתונים נשמרו מקומית, אך הסנכרון לענן נכשל: ${error.message}`
          : "הנתונים נשמרו מקומית, אך הסנכרון לענן נכשל"
      );
    }

    setTimeout(() => {
      setSavedMessage("");
    }, 5000);
  }

  /* =======================================================
     CADET STATUS / ADD
  ======================================================= */

  function setCadetCourseStatus(
    id: number,
    status: CourseStatus
  ) {
    if (isReadOnly) {
      setSavedMessage(
        isViewer
          ? "המשתמש מחובר בהרשאת צפייה בלבד"
          : "המחזור סגור לקריאה בלבד"
      );
      return;
    }

    setCadets(
      (current) =>
        current.map(
          (cadet) =>
            cadet.id === id
              ? {
                  ...cadet,
                  courseStatus:
                    status,
                  dismissalDate:
                    status === "פעיל"
                      ? ""
                      : cadet.dismissalDate ||
                        new Date()
                          .toISOString()
                          .slice(0, 10),
                }
              : cadet
        )
    );

    setManagedCadetId(
      null
    );
  }

  function restoreCadet(
    id: number
  ) {
    setCadetCourseStatus(
      id,
      "פעיל"
    );
  }

  function addCadetToCurrentCycle() {
    if (isReadOnly) {
      return;
    }

    const name =
      normalizeText(
        addCadetForm.name
      );

    if (!name) {
      setSavedMessage(
        "יש להזין שם צוער"
      );
      return;
    }

    const emptyIndex =
      cadets.findIndex(
        (cadet) =>
          !cadet.name.trim()
      );

    if (emptyIndex < 0) {
      setSavedMessage(
        "לא נותר מקום פנוי ברשימת הצוערים"
      );
      return;
    }

    const existingByName =
      cadets.find(
        (cadet) =>
          normalizeName(
            cadet.name
          ) ===
          normalizeName(
            name
          )
      );

    if (existingByName) {
      setSavedMessage(
        "הצוער כבר קיים במחזור הנוכחי"
      );
      return;
    }

    const previous =
      findPreviousIdentity(
        name
      );

    const base =
      createEmptyCadet(
        emptyIndex
      );

    const newCadet: Cadet = {
      ...base,

      globalId:
        previous?.globalId ||
        base.globalId,

      previousBattalion:
        previous?.battalion ||
        (
          addCadetForm.source ===
          "דקל" ||
          addCadetForm.source ===
          "רימון"
            ? addCadetForm.source
            : ""
        ),

      name,
      gender:
        addCadetForm.gender,
      brigade:
        normalizeText(
          addCadetForm.brigade
        ),
      unit:
        normalizeText(
          addCadetForm.unit
        ),
      company:
        normalizeText(
          addCadetForm.company
        ),
      team:
        normalizeText(
          addCadetForm.team
        ),
      courseStatus:
        "פעיל",
    };

    const detected =
      detectUnitSettings(
        newCadet
      );

    newCadet.fitnessLevel =
      detected.fitnessLevel;
    newCadet.shootingLevel =
      detected.shootingLevel;
    newCadet.loranPopulation =
      detected.loranPopulation;

    newCadet.fitnessLevelSource =
      detected.fitnessLevel
        ? "auto"
        : "";
    newCadet.shootingLevelSource =
      detected.shootingLevel
        ? "auto"
        : "";
    newCadet.loranPopulationSource =
      detected.loranPopulation
        ? "auto"
        : "";

    setCadets(
      (current) =>
        current.map(
          (cadet, index) =>
            index === emptyIndex
              ? newCadet
              : cadet
        )
    );

    setAddCadetForm({
      name: "",
      gender: "",
      brigade: "",
      unit: "",
      company: "",
      team: "",
      source: "צוער חדש",
    });

    setShowAddCadet(
      false
    );

    setSavedMessage(
      "הצוער נוסף למחזור. יש ללחוץ על שמירת צוערים."
    );
  }

  /* =======================================================
     CLEAR
  ======================================================= */

  function clearCadet(
    id: number
  ) {
    if (isReadOnly) {
      setSavedMessage(
        isViewer
          ? "המשתמש מחובר בהרשאת צפייה בלבד"
          : "המחזור סגור לקריאה בלבד"
      );
      return;
    }

    setCadets(
      (current) =>
        current.map(
          (cadet) =>
            cadet.id === id
              ? createEmptyCadet(
                  id - 1
                )
              : cadet
        )
    );
  }

  /* =======================================================
     EXCEL IMPORT
  ======================================================= */

  function openExcelPicker() {
    if (isReadOnly) {
      setSavedMessage(
        isViewer
          ? "המשתמש מחובר בהרשאת צפייה בלבד"
          : "המחזור סגור לקריאה בלבד"
      );
      return;
    }

    fileInputRef.current?.click();
  }

  function handleExcelImport(
    event: ChangeEvent<HTMLInputElement>
  ) {
    if (isReadOnly) {
      setSavedMessage(
        isViewer
          ? "המשתמש מחובר בהרשאת צפייה בלבד"
          : "המחזור סגור לקריאה בלבד"
      );
      return;
    }

    const file =
      event.target.files?.[0];

    if (!file) {
      return;
    }

    const reader =
      new FileReader();

    reader.onload = (
      loadEvent
    ) => {
      try {
        const data =
          loadEvent.target
            ?.result;

        if (!data) {
          return;
        }

        const workbook =
          XLSX.read(
            data,
            {
              type: "array",
            }
          );

        const sheetName =
          workbook.SheetNames[0];

        const worksheet =
          workbook.Sheets[
            sheetName
          ];

        const rows =
          XLSX.utils.sheet_to_json<
            Record<
              string,
              unknown
            >
          >(
            worksheet,
            {
              defval: "",
            }
          );

        const imported =
          rows
            .filter(
              (row) => {
                const name =
                  findExcelValue(
                    row,
                    [
                      "שם מלא",
                      "שם",
                      "שם הצוער",
                      "צוער",
                      "name",
                    ]
                  );

                return Boolean(
                  normalizeText(
                    name
                  )
                );
              }
            )
            .slice(
              0,
              MAX_CADETS
            )
            .map(
              (
                row,
                index
              ): Cadet => {
                const name =
                  normalizeText(
                    findExcelValue(
                      row,
                      [
                        "שם מלא",
                        "שם",
                        "שם הצוער",
                        "צוער",
                        "name",
                      ]
                    )
                  );

                const previous =
                  findPreviousIdentity(
                    name
                  );

                const importedGlobalId =
                  normalizeText(
                    findExcelValue(
                      row,
                      [
                        "globalId",
                        "global id",
                        "מזהה",
                      ]
                    )
                  );

                const cadet: Cadet = {
                  ...createEmptyCadet(
                    index
                  ),

                  globalId:
                    previous?.globalId ||
                    importedGlobalId ||
                    createGlobalId(),

                  previousBattalion:
                    previous?.battalion ||
                    "",

                  name,

                  gender:
                    normalizeGender(
                      findExcelValue(
                        row,
                        [
                          "מין",
                          "מגדר",
                          "gender",
                        ]
                      )
                    ),

                  brigade:
                    normalizeText(
                      findExcelValue(
                        row,
                        [
                          "חטיבה",
                          "brigade",
                        ]
                      )
                    ),

                  unit:
                    normalizeText(
                      findExcelValue(
                        row,
                        [
                          "יחידה",
                          "unit",
                        ]
                      )
                    ),

                  company:
                    normalizeText(
                      findExcelValue(
                        row,
                        [
                          "פלוגה",
                          "company",
                        ]
                      )
                    ),

                  team:
                    normalizeText(
                      findExcelValue(
                        row,
                        [
                          "צוות",
                          "team",
                        ]
                      )
                    ),

                  medicalStatus:
                    normalizeMedicalStatus(
                      findExcelValue(
                        row,
                        [
                          "סטטוס רפואי",
                          "רפואי",
                          "medical status",
                        ]
                      )
                    ),

                  courseStatus:
                    normalizeCourseStatus(
                      findExcelValue(
                        row,
                        [
                          "סטטוס קורס",
                          "סטטוס",
                          "course status",
                        ]
                      )
                    ),

                  notes:
                    normalizeText(
                      findExcelValue(
                        row,
                        [
                          "הערות",
                          "notes",
                        ]
                      )
                    ),
                };

                const importedFitness =
                  normalizeText(
                    findExcelValue(
                      row,
                      [
                        'רמת כש"ג',
                        "רמת כש״ג",
                        "fitness level",
                      ]
                    )
                  ) as FitnessLevel;

                const importedShooting =
                  normalizeText(
                    findExcelValue(
                      row,
                      [
                        "רמת קליעה",
                        "סף ירי",
                        "shooting level",
                      ]
                    )
                  );

                const importedLoran =
                  normalizeText(
                    findExcelValue(
                      row,
                      [
                        "אוכלוסיית לורן",
                        "אוכלוסיה לורן",
                        "loran population",
                      ]
                    )
                  ) as LoranPopulation;

                if (
                  importedFitness
                ) {
                  cadet.fitnessLevel =
                    importedFitness;

                  cadet.fitnessLevelSource =
                    "manual";
                }

                if (
                  importedShooting
                ) {
                  cadet.shootingLevel =
                    importedShooting;

                  cadet.shootingLevelSource =
                    "manual";
                }

                if (
                  importedLoran
                ) {
                  cadet.loranPopulation =
                    importedLoran;

                  cadet.loranPopulationSource =
                    "manual";
                }

                const detected =
                  detectUnitSettings(
                    cadet
                  );

                if (
                  !cadet.fitnessLevel
                ) {
                  cadet.fitnessLevel =
                    detected.fitnessLevel;

                  cadet.fitnessLevelSource =
                    detected.fitnessLevel
                      ? "auto"
                      : "";
                }

                if (
                  !cadet.shootingLevel
                ) {
                  cadet.shootingLevel =
                    detected.shootingLevel;

                  cadet.shootingLevelSource =
                    detected.shootingLevel
                      ? "auto"
                      : "";
                }

                if (
                  !cadet.loranPopulation
                ) {
                  cadet.loranPopulation =
                    detected.loranPopulation;

                  cadet.loranPopulationSource =
                    detected.loranPopulation
                      ? "auto"
                      : "";
                }

                return cadet;
              }
            );

        const completed =
          Array.from(
            {
              length:
                MAX_CADETS,
            },
            (_, index) =>
              imported[index] ??
              createEmptyCadet(
                index
              )
          );

        setCadets(
          completed
        );

        setImportMessage(
          `יובאו ${imported.length} צוערים בהצלחה`
        );
      } catch (error) {
        console.error(
          "שגיאה בייבוא Excel:",
          error
        );

        setImportMessage(
          "אירעה שגיאה בייבוא קובץ האקסל"
        );
      }

      if (
        fileInputRef.current
      ) {
        fileInputRef.current.value =
          "";
      }
    };

    reader.readAsArrayBuffer(
      file
    );
  }

  /* =======================================================
     EXPORT
  ======================================================= */

  function exportExcel() {
    const rows =
      cadets
        .filter(
          (cadet) =>
            cadet.name.trim()
        )
        .map(
          (cadet) => ({
            מס: cadet.id,

            "שם מלא":
              cadet.name,

            מין:
              cadet.gender,

            חטיבה:
              cadet.brigade,

            יחידה:
              cadet.unit,

            פלוגה:
              cadet.company,

            צוות:
              cadet.team,

            'רמת כש"ג':
              cadet.fitnessLevel,

            "רמת קליעה":
              cadet.shootingLevel,

            "אוכלוסיית לורן":
              cadet.loranPopulation,

            "סטטוס רפואי":
              cadet.medicalStatus,

            "סטטוס קורס":
              cadet.courseStatus,

            "גדוד קודם":
              cadet.previousBattalion,

            "סיבת הדחה":
              cadet.dismissalReason,

            "תאריך הדחה":
              cadet.dismissalDate,

            "הערות חזרה":
              cadet.returnNotes,

            הערות:
              cadet.notes,

            globalId:
              cadet.globalId,
          })
        );

    const worksheet =
      XLSX.utils.json_to_sheet(
        rows
      );

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "צוערים"
    );

    XLSX.writeFile(
      workbook,
      `CommandFit-${battalionName}-צוערים.xlsx`
    );
  }

  /* =======================================================
     DATA
  ======================================================= */

  const namedCadets =
    useMemo(
      () =>
        cadets.filter(
          (cadet) =>
            Boolean(
              cadet.name.trim()
            )
        ),
      [cadets]
    );

  const activeCadets =
    useMemo(
      () =>
        namedCadets.filter(
          (cadet) =>
            cadet.courseStatus ===
            "פעיל"
        ),
      [namedCadets]
    );

  const dismissedCadets =
    useMemo(
      () =>
        namedCadets.filter(
          (cadet) =>
            cadet.courseStatus ===
            "הודח"
        ),
      [namedCadets]
    );

  const returningCadets =
    useMemo(
      () =>
        namedCadets.filter(
          (cadet) =>
            cadet.courseStatus ===
            "מיועד לחזרה"
        ),
      [namedCadets]
    );

  const inactiveCadets =
    useMemo(
      () =>
        namedCadets.filter(
          (cadet) =>
            cadet.courseStatus !==
            "פעיל"
        ),
      [namedCadets]
    );

  const maleCount =
    activeCadets.filter(
      (cadet) =>
        cadet.gender ===
        "זכר"
    ).length;

  const femaleCount =
    activeCadets.filter(
      (cadet) =>
        cadet.gender ===
        "נקבה"
    ).length;

  const missingDataCadets =
    activeCadets.filter(
      (cadet) =>
        !cadet.unit ||
        !cadet.gender ||
        !cadet.fitnessLevel ||
        !cadet.shootingLevel ||
        !cadet.loranPopulation
    );

  const filteredCadets =
    useMemo(() => {
      const text =
        normalizeText(
          search
        ).toLowerCase();

      return cadets.filter(
        (cadet) => {
          if (
            cadet.courseStatus !==
            "פעיל"
          ) {
            return false;
          }

          if (!text) {
            return true;
          }

          return (
            cadet.name
              .toLowerCase()
              .includes(text) ||
            cadet.unit
              .toLowerCase()
              .includes(text) ||
            cadet.brigade
              .toLowerCase()
              .includes(text) ||
            cadet.company
              .toLowerCase()
              .includes(text) ||
            cadet.team
              .toLowerCase()
              .includes(text)
          );
        }
      );
    }, [
      cadets,
      search,
    ]);

  /* =======================================================
     BACK
  ======================================================= */

  function goBack() {
    router.push(
      `/battalions/${encodeURIComponent(
        battalionName
      )}`
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
      <header className="bg-slate-900 text-white px-4 sm:px-6 lg:px-8 py-5 sm:py-6">

        <div className="max-w-[2000px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">

          <div>

            <p className="text-slate-300 text-sm">
              ניהול צוערים
            </p>

            <h1 className="text-3xl font-bold">
              גדוד{" "}
              {battalionName}
            </h1>

            <p className="text-slate-300 text-sm mt-2">
              מחזור:{" "}
              <strong>
                {activeCycle
                  ? activeCycle.name
                  : "נתונים קיימים"}
              </strong>
              {isViewer
                ? " • צפייה בלבד"
                : activeCycle?.status ===
                  "closed"
                ? " • מחזור סגור"
                : activeCycle
                ? " • פעיל"
                : ""}
            </p>

          </div>

          <button
            type="button"
            onClick={
              goBack
            }
            className="w-full md:w-auto bg-white/10 hover:bg-white/20 px-5 py-3 rounded-xl"
          >
            חזרה לגדוד
          </button>

        </div>

      </header>

      <div className="max-w-[2000px] mx-auto p-4 sm:p-6 lg:p-8">

        {isReadOnly && (
          <section className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-5 mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="font-bold text-lg">
                  🔒 מצב צפייה בלבד
                </h2>

                <p className="text-sm mt-1">
                  {isViewer
                    ? "המשתמש מחובר בהרשאת צפייה בלבד. ניתן לצפות ולייצא נתונים, אך לא לבצע שינויים."
                    : "המחזור סגור. ניתן לצפות ולייצא נתונים, אך לא לבצע שינויים במחזור זה."}
                </p>
              </div>

              <Link
                href={`/battalions/${encodeURIComponent(
                  battalionName
                )}/cycles`}
                className="bg-white border border-amber-200 rounded-xl px-4 py-2 font-medium"
              >
                ניהול מחזורים
              </Link>
            </div>
          </section>
        )}

        {cloudLoading && (
          <section className="bg-blue-50 border border-blue-100 text-blue-800 rounded-2xl p-4 mb-5">
            ☁️ טוען נתוני צוערים מהענן...
          </section>
        )}

        {!cloudLoading &&
          cloudMessage && (
          <section className="bg-white border border-slate-200 text-slate-600 rounded-2xl px-4 py-3 mb-5 text-sm">
            ☁️ {cloudMessage}
          </section>
        )}

        {/* SUMMARY */}

        <section className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-5 mb-8">

          <StatCard
            title='סה"כ צוערים פעילים'
            value={
              activeCadets.length
            }
          />

          <StatCard
            title="גברים"
            value={
              maleCount
            }
          />

          <StatCard
            title="נשים"
            value={
              femaleCount
            }
          />

          <StatCard
            title="מודחים"
            value={
              dismissedCadets.length
            }
          />

          <StatCard
            title="מיועדים לחזרה"
            value={
              returningCadets.length
            }
          />

          <StatCard
            title="חסר מידע"
            value={
              missingDataCadets.length
            }
          />

        </section>

        {/* ACTIONS */}

        <section className="bg-white rounded-2xl shadow-sm p-6 mb-8">

          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">

            <div>

              <h2 className="text-2xl font-bold">
                רשימת צוערי הגדוד
              </h2>

              <p className="text-slate-500 mt-1">
                {isReadOnly
                  ? "ניתן לצפות בנתונים ולייצא אותם."
                  : "השינויים נשמרים גם מקומית וגם ב-Supabase, כך שהנתונים זמינים מכל מכשיר."}
              </p>

            </div>

            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 w-full xl:w-auto">

              {!isReadOnly && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setShowAddCadet(
                        true
                      )
                    }
                    className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-3 rounded-xl"
                  >
                    + הוספת צוער
                  </button>

                  <button
                    type="button"
                    onClick={
                      openExcelPicker
                    }
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-xl"
                  >
                    יבוא מאקסל
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={
                  exportExcel
                }
                className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-3 rounded-xl"
              >
                יצוא לאקסל
              </button>

              {!isReadOnly && (
                <>
                  <button
                    type="button"
                    onClick={
                      autoIdentifyAll
                    }
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl"
                  >
                    זיהוי אוטומטי
                  </button>

                  <button
                    type="button"
                    onClick={
                      saveCadets
                    }
                    className="bg-slate-900 hover:bg-slate-700 text-white px-4 py-3 rounded-xl"
                  >
                    שמירת צוערים
                  </button>
                </>
              )}

            </div>

          </div>

          <input
            ref={
              fileInputRef
            }
            type="file"
            accept=".xlsx,.xls,.csv"
            onChange={
              handleExcelImport
            }
            className="hidden"
          />

          {(savedMessage ||
            importMessage) && (

            <div className="mt-5 bg-green-50 border border-green-100 text-green-700 rounded-xl p-4">

              {savedMessage ||
                importMessage}

            </div>

          )}

        </section>

        {/* INFO */}

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">

          <InfoBox
            title="זיהוי אוטומטי"
            text="המערכת מזהה לפי מין ויחידה את רמת הכש״ג, רמת הקליעה ואוכלוסיית הלורן."
          />

          <InfoBox
            title="שיוך ידני"
            text="אם היחידה אינה מזוהה, ניתן לבחור ידנית רמה 1, רמה 2, רמה 3, סף ירי ואוכלוסיית לורן."
          />

          <InfoBox
            title="המשכיות לגפן"
  text="בגפן אפשר להוסיף צוער חדש, להדיח צוער או לסמן אותו כמיועד לחזרה במחזור עתידי. ההיסטוריה והתיק האישי נשמרים."
          />

        </section>

        {/* SEARCH */}

        <section className="bg-white rounded-2xl shadow-sm p-4 sm:p-5 mb-5">

          <input
            type="text"
            value={
              search
            }
            onChange={(
              event
            ) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="חיפוש לפי שם, יחידה, חטיבה, פלוגה או צוות"
            className="w-full border border-slate-300 rounded-xl px-4 py-3"
          />

        </section>

        {/* MOBILE CADET CARDS */}

        <section className="md:hidden space-y-3 mb-8">

          {filteredCadets
            .filter(
              (cadet) =>
                Boolean(
                  cadet.name.trim()
                )
            )
            .map(
              (cadet) => {

                const hasMissing =
                  Boolean(
                    !cadet.gender ||
                    !cadet.unit ||
                    !cadet.fitnessLevel ||
                    !cadet.shootingLevel ||
                    !cadet.loranPopulation
                  );

                return (
                  <div
                    key={
                      cadet.id
                    }
                    className={
                      hasMissing
                        ? "bg-amber-50 border border-amber-200 rounded-2xl p-4 shadow-sm"
                        : "bg-white border border-slate-200 rounded-2xl p-4 shadow-sm"
                    }
                  >

                    <div className="flex items-start justify-between gap-3">

                      <div className="min-w-0">

                        <p className="text-xs text-slate-400">
                          צוער מס׳ {cadet.id}
                        </p>

                        <h3 className="text-lg font-bold mt-1 truncate">
                          {cadet.name}
                        </h3>

                        <p className="text-sm text-slate-500 mt-1">
                          {cadet.unit ||
                            "יחידה לא הוזנה"}
                          {cadet.brigade
                            ? ` • ${cadet.brigade}`
                            : ""}
                        </p>

                      </div>

                      <span className="shrink-0 bg-slate-100 rounded-lg px-3 py-1 text-sm">
                        {cadet.gender ||
                          "—"}
                      </span>

                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4">

                      <MobileInfo
                        title='רמת כש"ג'
                        value={
                          cadet.fitnessLevel ||
                          "—"
                        }
                      />

                      <MobileInfo
                        title="רמת קליעה"
                        value={
                          cadet.shootingLevel ||
                          "—"
                        }
                      />

                      <MobileInfo
                        title="אוכלוסיית לורן"
                        value={
                          cadet.loranPopulation ||
                          "—"
                        }
                      />

                      <MobileInfo
                        title="סטטוס רפואי"
                        value={
                          cadet.medicalStatus ||
                          "—"
                        }
                      />

                      <MobileInfo
                        title="פלוגה"
                        value={
                          cadet.company ||
                          "—"
                        }
                      />

                      <MobileInfo
                        title="צוות"
                        value={
                          cadet.team ||
                          "—"
                        }
                      />

                    </div>

                    {cadet.previousBattalion && (
                      <div className="mt-3">
                        <span className="inline-block bg-violet-50 text-violet-700 border border-violet-100 rounded-lg px-3 py-1 text-sm font-medium">
                          הגיע מגדוד{" "}
                          {
                            cadet.previousBattalion
                          }
                        </span>
                      </div>
                    )}

                    {hasMissing && (
                      <p className="text-xs text-amber-700 mt-3">
                        ⚠️ חסרים פרטים בצוער זה
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-2 mt-4">

                      <Link
                        href={`/battalions/${encodeURIComponent(
                          battalionName
                        )}/cadets/${cadet.id}`}
                        className="bg-slate-900 text-white text-center rounded-xl px-4 py-3 font-medium"
                      >
                        תיק אישי
                      </Link>

                      {!isReadOnly ? (
                        <button
                          type="button"
                          onClick={() =>
                            setManagedCadetId(
                              cadet.id
                            )
                          }
                          className="bg-blue-50 text-blue-700 border border-blue-100 rounded-xl px-4 py-3 font-medium"
                        >
                          ניהול צוער
                        </button>
                      ) : (
                        <div className="bg-slate-50 text-slate-500 border border-slate-200 rounded-xl px-4 py-3 text-center text-sm">
                          צפייה בלבד
                        </div>
                      )}

                    </div>

                  </div>
                );
              }
            )}

          {filteredCadets.filter(
            (cadet) =>
              Boolean(
                cadet.name.trim()
              )
          ).length === 0 && (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-400">
              לא נמצאו צוערים להצגה
            </div>
          )}

        </section>

        {/* DESKTOP TABLE */}

        <section className="hidden md:block bg-white rounded-2xl shadow-sm p-4 mb-8">

          <div className="overflow-auto max-h-[720px] border border-slate-200 rounded-xl">

            <table className="w-full min-w-[2350px] border-collapse text-right">

              <thead className="bg-slate-100 sticky top-0 z-20">

                <tr>

                  <TableHead>
                    מס׳
                  </TableHead>

                  <TableHead>
                    שם מלא
                  </TableHead>

                  <TableHead>
                    מין
                  </TableHead>

                  <TableHead>
                    חטיבה
                  </TableHead>

                  <TableHead>
                    יחידה
                  </TableHead>

                  <TableHead>
                    פלוגה
                  </TableHead>

                  <TableHead>
                    צוות
                  </TableHead>

                  <TableHead>
                    רמת כש״ג
                  </TableHead>

                  <TableHead>
                    רמת קליעה
                  </TableHead>

                  <TableHead>
                    אוכלוסיית לורן
                  </TableHead>

                  <TableHead>
                    רפואי
                  </TableHead>

                  <TableHead>
                    זיהוי
                  </TableHead>

                  <TableHead>
                    גדוד קודם
                  </TableHead>

                  <TableHead>
                    הערות
                  </TableHead>

                  <TableHead>
                    תיק אישי
                  </TableHead>

                  <TableHead>
                    פעולות
                  </TableHead>

                </tr>

              </thead>

              <tbody>

                {filteredCadets.map(
                  (cadet) => {

                    const hasMissing =
                      Boolean(
                        cadet.name &&
                          (
                            !cadet.gender ||
                            !cadet.unit ||
                            !cadet.fitnessLevel ||
                            !cadet.shootingLevel ||
                            !cadet.loranPopulation
                          )
                      );

                    return (
                      <tr
                        key={
                          cadet.id
                        }
                        className={
                          hasMissing
                            ? "bg-amber-50/50"
                            : "hover:bg-slate-50"
                        }
                      >

                        <TableCell>
                          {cadet.id}
                        </TableCell>

                        <TableCell>

                          <input
                            disabled={isReadOnly}
                            type="text"
                            value={
                              cadet.name
                            }
                            onChange={(
                              event
                            ) =>
                              updateCadet(
                                cadet.id,
                                "name",
                                event.target.value
                              )
                            }
                            placeholder={`צוער ${cadet.id}`}
                            className="border rounded-lg px-3 py-2 w-44"
                          />

                        </TableCell>

                        <TableCell>

                          <select
                            disabled={isReadOnly}
                            value={
                              cadet.gender
                            }
                            onChange={(
                              event
                            ) =>
                              updateCadet(
                                cadet.id,
                                "gender",
                                event.target.value
                              )
                            }
                            className="border rounded-lg px-3 py-2 w-28"
                          >

                            <option value="">
                              בחר
                            </option>

                            <option value="זכר">
                              זכר
                            </option>

                            <option value="נקבה">
                              נקבה
                            </option>

                          </select>

                        </TableCell>

                        <TableCell>

                          <input
                            disabled={isReadOnly}
                            value={
                              cadet.brigade
                            }
                            onChange={(
                              event
                            ) =>
                              updateCadet(
                                cadet.id,
                                "brigade",
                                event.target.value
                              )
                            }
                            placeholder="חטיבה"
                            className="border rounded-lg px-3 py-2 w-32"
                          />

                        </TableCell>

                        <TableCell>

                          <input
                            disabled={isReadOnly}
                            value={
                              cadet.unit
                            }
                            onChange={(
                              event
                            ) =>
                              updateCadet(
                                cadet.id,
                                "unit",
                                event.target.value
                              )
                            }
                            placeholder="יחידה"
                            className="border rounded-lg px-3 py-2 w-40"
                          />

                        </TableCell>

                        <TableCell>

                          <input
                            disabled={isReadOnly}
                            value={
                              cadet.company
                            }
                            onChange={(
                              event
                            ) =>
                              updateCadet(
                                cadet.id,
                                "company",
                                event.target.value
                              )
                            }
                            placeholder="פלוגה"
                            className="border rounded-lg px-3 py-2 w-28"
                          />

                        </TableCell>

                        <TableCell>

                          <input
                            disabled={isReadOnly}
                            value={
                              cadet.team
                            }
                            onChange={(
                              event
                            ) =>
                              updateCadet(
                                cadet.id,
                                "team",
                                event.target.value
                              )
                            }
                            placeholder="צוות"
                            className="border rounded-lg px-3 py-2 w-28"
                          />

                        </TableCell>

                        <TableCell>

                          <select
                            disabled={isReadOnly}
                            value={
                              cadet.fitnessLevel
                            }
                            onChange={(
                              event
                            ) =>
                              updateCadet(
                                cadet.id,
                                "fitnessLevel",
                                event.target.value
                              )
                            }
                            className="border rounded-lg px-3 py-2 w-28"
                          >

                            <option value="">
                              בחר
                            </option>

                            <option value="רמה 1">
                              רמה 1
                            </option>

                            <option value="רמה 2">
                              רמה 2
                            </option>

                            <option value="רמה 3">
                              רמה 3
                            </option>

                          </select>

                        </TableCell>

                        <TableCell>

                          <select
                            disabled={isReadOnly}
                            value={
                              cadet.shootingLevel
                            }
                            onChange={(
                              event
                            ) =>
                              updateCadet(
                                cadet.id,
                                "shootingLevel",
                                event.target.value
                              )
                            }
                            className="border rounded-lg px-3 py-2 w-24"
                          >

                            <option value="">
                              בחר
                            </option>

                            <option value="60">
                              60
                            </option>

                            <option value="70">
                              70
                            </option>

                            <option value="75">
                              75
                            </option>

                          </select>

                        </TableCell>

                        <TableCell>

                          <select
                            disabled={isReadOnly}
                            value={
                              cadet.loranPopulation
                            }
                            onChange={(
                              event
                            ) =>
                              updateCadet(
                                cadet.id,
                                "loranPopulation",
                                event.target.value
                              )
                            }
                            className="border rounded-lg px-3 py-2 w-44"
                          >

                            <option value="">
                              בחר
                            </option>

                            <option value="מתמרן">
                              מתמרן
                            </option>

                            <option value='חי"ר'>
                              חי״ר
                            </option>

                            <option value="יחידות מובחרות">
                              יחידות מובחרות
                            </option>

                            <option value="לוחמת">
                              לוחמת
                            </option>

                            <option value="לוחמת מיוחדת">
                              לוחמת מיוחדת
                            </option>

                          </select>

                        </TableCell>

                        <TableCell>

                          <select
                            disabled={isReadOnly}
                            value={
                              cadet.medicalStatus
                            }
                            onChange={(
                              event
                            ) =>
                              updateCadet(
                                cadet.id,
                                "medicalStatus",
                                event.target.value
                              )
                            }
                            className="border rounded-lg px-3 py-2 w-28"
                          >

                            <option value="כשיר">
                              כשיר
                            </option>

                            <option value="לא כשיר">
                              לא כשיר
                            </option>

                            <option value="פטור זמני">
                              פטור זמני
                            </option>

                            <option value="אחר">
                              אחר
                            </option>

                          </select>

                        </TableCell>

                        <TableCell>

                          <div className="flex flex-col gap-2">

                            {!isReadOnly && (
                              <button
                                type="button"
                                onClick={() =>
                                  autoIdentifyCadet(
                                    cadet.id
                                  )
                                }
                                className="bg-blue-50 text-blue-700 border border-blue-100 rounded-lg px-3 py-2 text-sm"
                              >
                                זיהוי אוטומטי
                              </button>
                            )}

                            <SourceBadge
                              source={
                                cadet.fitnessLevelSource ||
                                cadet.shootingLevelSource ||
                                cadet.loranPopulationSource
                              }
                            />

                          </div>

                        </TableCell>

                        <TableCell>

                          {cadet.previousBattalion ? (

                            <span className="bg-violet-50 text-violet-700 border border-violet-100 rounded-lg px-3 py-1 font-medium">
                              {
                                cadet.previousBattalion
                              }
                            </span>

                          ) : (
                            "—"
                          )}

                        </TableCell>

                        <TableCell>

                          <input
                            disabled={isReadOnly}
                            type="text"
                            value={
                              cadet.notes
                            }
                            onChange={(
                              event
                            ) =>
                              updateCadet(
                                cadet.id,
                                "notes",
                                event.target.value
                              )
                            }
                            placeholder="הערות"
                            className="border rounded-lg px-3 py-2 w-44"
                          />

                        </TableCell>

                        <TableCell>

                          {cadet.name.trim() ? (

                            <Link
                              href={`/battalions/${encodeURIComponent(
                                battalionName
                              )}/cadets/${cadet.id}`}
                              className="inline-block bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg px-3 py-2 font-medium"
                            >
                              תיק אישי
                            </Link>

                          ) : (
                            "—"
                          )}

                        </TableCell>

                        <TableCell>

                          {!isReadOnly ? (
                            <div className="flex gap-2">

                              {cadet.name.trim() && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    setManagedCadetId(
                                      cadet.id
                                    )
                                  }
                                  className="bg-violet-50 text-violet-700 border border-violet-100 rounded-lg px-3 py-2"
                                >
                                  ניהול סטטוס
                                </button>
                              )}

                              {!cadet.name.trim() && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    clearCadet(
                                      cadet.id
                                    )
                                  }
                                  className="bg-slate-50 text-slate-600 border rounded-lg px-3 py-2"
                                >
                                  ניקוי
                                </button>
                              )}

                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">
                              צפייה בלבד
                            </span>
                          )}

                        </TableCell>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        </section>

        {/* MISSING */}

        {missingDataCadets.length >
          0 && (

          <section className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-6 mb-8">

            <h2 className="text-xl font-bold">
              צוערים עם מידע חסר
            </h2>

            <p className="text-amber-800 mt-1">
              חסר לפחות אחד מהנתונים:
              מין, יחידה, רמת כש״ג,
              רמת קליעה או אוכלוסיית
              לורן.
            </p>

            <div className="flex flex-wrap gap-2 mt-4">

              {missingDataCadets.map(
                (cadet) => (

                  <span
                    key={
                      cadet.id
                    }
                    className="bg-white border border-amber-200 rounded-lg px-3 py-2"
                  >
                    {cadet.name}
                  </span>

                )
              )}

            </div>

          </section>

        )}

        {/* DISMISSED */}

        <section className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

            <div>

              <h2 className="text-2xl font-bold">
                צוערים שאינם פעילים במחזור
              </h2>

              <p className="text-slate-500 mt-1">
                צוערים שהודחו או מיועדים לחזרה במחזור עתידי אינם מופיעים בבחנים הפעילים. כל ההיסטוריה נשמרת.
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                setShowDismissed(
                  (value) =>
                    !value
                )
              }
              className="border rounded-xl px-4 py-2"
            >
              {showDismissed
                ? "הסתר"
                : "הצג"}
            </button>

          </div>

          {showDismissed && (

            <div className="mt-5">

              {inactiveCadets.length ===
              0 ? (

                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center text-slate-400">
                  אין צוערים שאינם פעילים
                </div>

              ) : (

                <div className="overflow-x-auto">

                  <table className="w-full min-w-[850px]">

                    <thead className="bg-slate-100">

                      <tr>

                        <TableHead>
                          מס׳
                        </TableHead>

                        <TableHead>
                          שם
                        </TableHead>

                        <TableHead>
                          סטטוס
                        </TableHead>

                        <TableHead>
                          יחידה
                        </TableHead>

                        <TableHead>
                          פלוגה
                        </TableHead>

                        <TableHead>
                          הערות
                        </TableHead>

                        <TableHead>
                          תיק אישי
                        </TableHead>

                        <TableHead>
                          פעולה
                        </TableHead>

                      </tr>

                    </thead>

                    <tbody>

                      {inactiveCadets.map(
                        (cadet) => (

                          <tr
                            key={
                              cadet.id
                            }
                          >

                            <TableCell>
                              {cadet.id}
                            </TableCell>

                            <TableCell>
                              <strong>
                                {cadet.name}
                              </strong>
                            </TableCell>

                            <TableCell>
                              <span
                                className={
                                  cadet.courseStatus ===
                                  "מיועד לחזרה"
                                    ? "bg-violet-50 text-violet-700 border border-violet-100 rounded-lg px-3 py-1 text-sm font-medium"
                                    : "bg-red-50 text-red-700 border border-red-100 rounded-lg px-3 py-1 text-sm font-medium"
                                }
                              >
                                {cadet.courseStatus}
                              </span>
                            </TableCell>

                            <TableCell>
                              {cadet.unit ||
                                "—"}
                            </TableCell>

                            <TableCell>
                              {cadet.company ||
                                "—"}
                            </TableCell>

                            <TableCell>
                              {cadet.notes ||
                                "—"}
                            </TableCell>

                            <TableCell>

                              <Link
                                href={`/battalions/${encodeURIComponent(
                                  battalionName
                                )}/cadets/${cadet.id}`}
                                className="text-blue-700 hover:underline"
                              >
                                צפייה בתיק
                              </Link>

                            </TableCell>

                            <TableCell>

                              {!isReadOnly ? (
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      restoreCadet(
                                        cadet.id
                                      )
                                    }
                                    className="bg-green-50 text-green-700 border border-green-100 rounded-lg px-3 py-2"
                                  >
                                    החזרה לפעיל
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      setManagedCadetId(
                                        cadet.id
                                      )
                                    }
                                    className="bg-violet-50 text-violet-700 border border-violet-100 rounded-lg px-3 py-2"
                                  >
                                    ניהול
                                  </button>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-400">
                                  צפייה בלבד
                                </span>
                              )}

                            </TableCell>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              )}

            </div>

          )}

        </section>

      </div>

      {/* ADD CADET MODAL */}

      {showAddCadet && !isReadOnly && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() =>
            setShowAddCadet(
              false
            )
          }
        >
          <div
            className="bg-white w-full max-w-2xl max-h-[90vh] overflow-auto rounded-3xl shadow-2xl p-5 sm:p-7"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold">
                  הוספת צוער למחזור
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  אם הצוער כבר הופיע בדקל או ברימון, המערכת תנסה להמשיך את אותו תיק אישי.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setShowAddCadet(
                    false
                  )
                }
                className="w-10 h-10 rounded-xl bg-slate-100 text-xl"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">

              <label>
                <span className="block text-sm font-medium mb-1.5">
                  שם מלא *
                </span>
                <input
                  value={addCadetForm.name}
                  onChange={(event) =>
                    setAddCadetForm(
                      (current) => ({
                        ...current,
                        name:
                          event.target.value,
                      })
                    )
                  }
                  className="w-full border rounded-xl px-4 py-3"
                  placeholder="שם הצוער"
                />
              </label>

              <label>
                <span className="block text-sm font-medium mb-1.5">
                  מין
                </span>
                <select
                  value={addCadetForm.gender}
                  onChange={(event) =>
                    setAddCadetForm(
                      (current) => ({
                        ...current,
                        gender:
                          event.target.value as Gender,
                      })
                    )
                  }
                  className="w-full border rounded-xl px-4 py-3 bg-white"
                >
                  <option value="">
                    לא הוגדר
                  </option>
                  <option value="זכר">
                    זכר
                  </option>
                  <option value="נקבה">
                    נקבה
                  </option>
                </select>
              </label>

              <label>
                <span className="block text-sm font-medium mb-1.5">
                  חטיבה
                </span>
                <input
                  value={addCadetForm.brigade}
                  onChange={(event) =>
                    setAddCadetForm(
                      (current) => ({
                        ...current,
                        brigade:
                          event.target.value,
                      })
                    )
                  }
                  className="w-full border rounded-xl px-4 py-3"
                />
              </label>

              <label>
                <span className="block text-sm font-medium mb-1.5">
                  יחידה
                </span>
                <input
                  value={addCadetForm.unit}
                  onChange={(event) =>
                    setAddCadetForm(
                      (current) => ({
                        ...current,
                        unit:
                          event.target.value,
                      })
                    )
                  }
                  className="w-full border rounded-xl px-4 py-3"
                />
              </label>

              <label>
                <span className="block text-sm font-medium mb-1.5">
                  פלוגה
                </span>
                <input
                  value={addCadetForm.company}
                  onChange={(event) =>
                    setAddCadetForm(
                      (current) => ({
                        ...current,
                        company:
                          event.target.value,
                      })
                    )
                  }
                  className="w-full border rounded-xl px-4 py-3"
                />
              </label>

              <label>
                <span className="block text-sm font-medium mb-1.5">
                  צוות
                </span>
                <input
                  value={addCadetForm.team}
                  onChange={(event) =>
                    setAddCadetForm(
                      (current) => ({
                        ...current,
                        team:
                          event.target.value,
                      })
                    )
                  }
                  className="w-full border rounded-xl px-4 py-3"
                />
              </label>

              <label className="sm:col-span-2">
                <span className="block text-sm font-medium mb-1.5">
                  מקור הצוער
                </span>
                <select
                  value={addCadetForm.source}
                  onChange={(event) =>
                    setAddCadetForm(
                      (current) => ({
                        ...current,
                        source:
                          event.target.value,
                      })
                    )
                  }
                  className="w-full border rounded-xl px-4 py-3 bg-white"
                >
                  <option value="צוער חדש">
                    צוער חדש
                  </option>
                  <option value="דקל">
                    דקל
                  </option>
                  <option value="רימון">
                    רימון
                  </option>
                  <option value="מחזור קודם">
                    מחזור קודם
                  </option>
                </select>
              </label>

            </div>

            <div className="grid grid-cols-2 gap-3 mt-6">
              <button
                type="button"
                onClick={() =>
                  setShowAddCadet(
                    false
                  )
                }
                className="border rounded-xl px-4 py-3"
              >
                ביטול
              </button>

              <button
                type="button"
                onClick={
                  addCadetToCurrentCycle
                }
                className="bg-slate-900 text-white rounded-xl px-4 py-3 font-bold"
              >
                הוספה למחזור
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANAGE CADET MODAL */}

      {managedCadetId !== null && !isReadOnly && (() => {
        const managedCadet =
          cadets.find(
            (cadet) =>
              cadet.id ===
              managedCadetId
          );

        if (!managedCadet) {
          return null;
        }

        return (
          <div
            className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
            onClick={() =>
              setManagedCadetId(
                null
              )
            }
          >
            <div
              className="bg-white w-full max-w-xl rounded-3xl shadow-2xl p-5 sm:p-7"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">
                    ניהול סטטוס צוער
                  </p>
                  <h2 className="text-2xl font-bold mt-1">
                    {managedCadet.name}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setManagedCadetId(
                      null
                    )
                  }
                  className="w-10 h-10 rounded-xl bg-slate-100 text-xl"
                >
                  ×
                </button>
              </div>

              <div className="grid grid-cols-1 gap-3 mt-6">
                <button
                  type="button"
                  onClick={() =>
                    setCadetCourseStatus(
                      managedCadet.id,
                      "פעיל"
                    )
                  }
                  className="text-right bg-green-50 border border-green-100 text-green-800 rounded-2xl p-4"
                >
                  <strong>
                    ✓ פעיל במחזור
                  </strong>
                  <span className="block text-sm mt-1">
                    הצוער יופיע בבחנים ובסיכומים של המחזור.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setCadetCourseStatus(
                      managedCadet.id,
                      "הודח"
                    )
                  }
                  className="text-right bg-red-50 border border-red-100 text-red-800 rounded-2xl p-4"
                >
                  <strong>
                    ⛔ הודח מהמחזור
                  </strong>
                  <span className="block text-sm mt-1">
                    יוסר מהבחנים הפעילים, אך התיק וההיסטוריה נשמרים.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setCadetCourseStatus(
                      managedCadet.id,
                      "מיועד לחזרה"
                    )
                  }
                  className="text-right bg-violet-50 border border-violet-100 text-violet-800 rounded-2xl p-4"
                >
                  <strong>
                    ↩ הודח – מיועד לחזרה במחזור עתידי
                  </strong>
                  <span className="block text-sm mt-1">
                    הצוער לא יופיע בבחנים הנוכחיים, אך יסומן לחזרה בעתיד.
                  </span>
                </button>
              </div>

              <div className="mt-5 border-t pt-5 space-y-4">
                <label>
                  <span className="block text-sm font-medium mb-1.5">
                    סיבת הדחה / יציאה
                  </span>
                  <input
                    value={
                      managedCadet.dismissalReason
                    }
                    onChange={(event) =>
                      updateCadet(
                        managedCadet.id,
                        "dismissalReason",
                        event.target.value
                      )
                    }
                    className="w-full border rounded-xl px-4 py-3"
                    placeholder="למשל: רפואי, מקצועי, אישי..."
                  />
                </label>

                <label>
                  <span className="block text-sm font-medium mb-1.5">
                    הערה לחזרה עתידית
                  </span>
                  <input
                    value={
                      managedCadet.returnNotes
                    }
                    onChange={(event) =>
                      updateCadet(
                        managedCadet.id,
                        "returnNotes",
                        event.target.value
                      )
                    }
                    className="w-full border rounded-xl px-4 py-3"
                    placeholder="מחזור יעד / הערה רלוונטית"
                  />
                </label>
              </div>

              <p className="text-xs text-slate-400 mt-5">
                השינויים נשמרים סופית לאחר לחיצה על "שמירת צוערים".
              </p>
            </div>
          </div>
        );
      })()}

    </main>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function StatCard({
  title,
  value,
}: {
  title: string;
  value:
    | number
    | string;
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

function InfoBox({
  title,
  text,
}: {
  title: string;
  text: string;
}) {
  return (
    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">

      <h3 className="font-bold text-lg">
        {title}
      </h3>

      <p className="text-slate-600 text-sm leading-6 mt-2">
        {text}
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
    <div className="bg-slate-50 rounded-xl p-3 min-w-0">

      <p className="text-[11px] text-slate-400">
        {title}
      </p>

      <p className="font-bold text-sm mt-1 break-words">
        {value}
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
    <th className="p-3 border-b border-slate-200 whitespace-nowrap">
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
    <td className="p-3 border-b border-slate-200 whitespace-nowrap">
      {children}
    </td>
  );
}

function SourceBadge({
  source,
}: {
  source:
    IdentificationSource;
}) {
  if (
    source === "auto"
  ) {
    return (
      <span className="text-xs text-green-700">
        זוהה אוטומטית
      </span>
    );
  }

  if (
    source === "manual"
  ) {
    return (
      <span className="text-xs text-blue-700">
        שיוך ידני
      </span>
    );
  }

  return (
    <span className="text-xs text-slate-400">
      לא זוהה
    </span>
  );
}