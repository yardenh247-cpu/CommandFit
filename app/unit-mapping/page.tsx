"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Population = "לוחמים" | "לוחמות";

type UnitMapping = {
  id: number;
  unit: string;
  population: Population;
  fitnessLevel: string;
  shootingLevel: string;
  active: boolean;
};

type Standard = {
  id: number;
  component: string;
  population: Population;
  level: string;
  metric: string;
  startThreshold: string;
  endThreshold: string;
  excellenceThreshold: string;
  active: boolean;
};

const MAPPING_STORAGE_KEY =
  "commandfit-unit-mapping-v4";

const STANDARDS_STORAGE_KEY =
  "commandfit-entry-standards-v3";

// ======================================================
// שיוך יחידות לכש"ג - לוחמים
// ======================================================

const maleLevel1Units = [
  "שריון",
  "תותחנים",
  'פקע"ר',
  'קמ"נים',
  'קשר"גים',
  'מג"ב',
  'הגנ"א',
  "תלפיות",
  'חי"ר גבולות',
  "איסוף קרבי",
  "הנדסה קרבית",
  "כנפי חיל האוויר",
];

const maleLevel2Units = [
  'נח"ל',
  "ניוד",
  "כפיר",
  "גולני",
  'בלנ"מ',
  "גבעתי",
  "צנחנים",
  'ביסל"ח',
  "חשמונאים",
  'גדס"ר הבדואי',
];

const maleLevel3Units = [
  "עוקץ",
  'יהל"ם',
  "קומנדו",
  'לוט"ר',
  'שלד"ג',
  'רבמ"ד',
  'ימ"ס',
  'ימ"מ',
  "669",
  "504",
  'גדס"רים',
  "שייטת 13",
  'גדס"ם 8200',
  'סיירת מטכ"ל',
];

// ======================================================
// שיוך יחידות לכש"ג - לוחמות
// ======================================================

const femaleLevel1Units = [
  'מג"ב',
  'הגנ"א',
  'פקע"ר',
  'קמ"נים',
  "תותחנים",
  'קשר"גים',
  "איסוף קרבי",
  'חי"ר גבולות',
  'גדס"ם 8200',
];

const femaleLevel2Units = [
  "עוקץ",
  'יהל"ם',
];

// ======================================================
// רמות קליעה
// ======================================================

const shooting60Units = [
  "שריון",
  "תותחנים",
  'פקע"ר',
  'קמ"נים',
  'קשר"גים',
  'הגנ"א',
  "תלפיות",
  'חי"ר גבולות',
  "איסוף קרבי",
  "כנפי חיל האוויר",
];

const shooting70Units = [
  'מג"ב',
  'נח"ל',
  "ניוד",
  "כפיר",
  "גולני",
  'בלנ"מ',
  "גבעתי",
  "צנחנים",
  'ביסל"ח',
  "חשמונאים",
  'גדס"ר הבדואי',
  "הנדסה קרבית",
];

const shooting75Units = [
  "עוקץ",
  'יהל"ם',
  "קומנדו",
  'לוט"ר',
  'שלד"ג',
  'רבמ"ד',
  'ימ"ס',
  'ימ"מ',
  "669",
  "504",
  'גדס"רים',
  "שייטת 13",
  'גדס"ם 8200',
  'סיירת מטכ"ל',
];

function getShootingLevel(
  unit: string,
  population: Population
) {
  // חריג שמופיע בטבלת הקליעה ללוחמות
  if (
    population === "לוחמות" &&
    unit === 'גדס"ם 8200'
  ) {
    return "60";
  }

  if (shooting75Units.includes(unit)) {
    return "75";
  }

  if (shooting70Units.includes(unit)) {
    return "70";
  }

  if (shooting60Units.includes(unit)) {
    return "60";
  }

  return "60";
}

function buildInitialMappings(): UnitMapping[] {
  const result: UnitMapping[] = [];
  let id = 1;

  maleLevel1Units.forEach((unit) => {
    result.push({
      id: id++,
      unit,
      population: "לוחמים",
      fitnessLevel: "רמה 1",
      shootingLevel: getShootingLevel(
        unit,
        "לוחמים"
      ),
      active: true,
    });
  });

  maleLevel2Units.forEach((unit) => {
    result.push({
      id: id++,
      unit,
      population: "לוחמים",
      fitnessLevel: "רמה 2",
      shootingLevel: getShootingLevel(
        unit,
        "לוחמים"
      ),
      active: true,
    });
  });

  maleLevel3Units.forEach((unit) => {
    result.push({
      id: id++,
      unit,
      population: "לוחמים",
      fitnessLevel: "רמה 3",
      shootingLevel: getShootingLevel(
        unit,
        "לוחמים"
      ),
      active: true,
    });
  });

  femaleLevel1Units.forEach((unit) => {
    result.push({
      id: id++,
      unit,
      population: "לוחמות",
      fitnessLevel: "רמה 1",
      shootingLevel: getShootingLevel(
        unit,
        "לוחמות"
      ),
      active: true,
    });
  });

  femaleLevel2Units.forEach((unit) => {
    result.push({
      id: id++,
      unit,
      population: "לוחמות",
      fitnessLevel: "רמה 2",
      shootingLevel: getShootingLevel(
        unit,
        "לוחמות"
      ),
      active: true,
    });
  });

  return result;
}

const initialMappings =
  buildInitialMappings();

// ======================================================
// ספים לדוגמה
// משמשים רק אם עדיין לא נשמרו ספים ב-/standards
// ======================================================

const fallbackStandards: Standard[] = [
  // -------------------------
  // לוחמים רמה 1
  // -------------------------

  {
    id: 1001,
    component: "ריצה",
    population: "לוחמים",
    level: "רמה 1",
    metric: 'ריצת 3 ק"מ',
    startThreshold: "14:15",
    endThreshold: "14:00",
    excellenceThreshold: "",
    active: true,
  },

  {
    id: 1002,
    component: "ספרינטים",
    population: "לוחמים",
    level: "רמה 1",
    metric: "2×150 מטר",
    startThreshold: "00:59",
    endThreshold: "00:58",
    excellenceThreshold: "",
    active: true,
  },

  {
    id: 1003,
    component: "כוח",
    population: "לוחמים",
    level: "רמה 1",
    metric: "מתח",
    startThreshold: '6 חזרות × 7 ק"ג',
    endThreshold: '7 חזרות × 7 ק"ג',
    excellenceThreshold: "",
    active: true,
  },

  {
    id: 1004,
    component: "כוח",
    population: "לוחמים",
    level: "רמה 1",
    metric: "מקבילים",
    startThreshold: "9 חזרות",
    endThreshold: "11 חזרות",
    excellenceThreshold: "",
    active: true,
  },

  {
    id: 1005,
    component: "כוח",
    population: "לוחמים",
    level: "רמה 1",
    metric: "טראפ בר",
    startThreshold: '5 חזרות × 80 ק"ג',
    endThreshold: '7 חזרות × 80 ק"ג',
    excellenceThreshold: "",
    active: true,
  },

  // -------------------------
  // לוחמים רמה 2
  // -------------------------

  {
    id: 2001,
    component: "ריצה",
    population: "לוחמים",
    level: "רמה 2",
    metric: 'ריצת 3 ק"מ',
    startThreshold: "13:30",
    endThreshold: "12:50",
    excellenceThreshold: "",
    active: true,
  },

  {
    id: 2002,
    component: "ספרינטים",
    population: "לוחמים",
    level: "רמה 2",
    metric: "2×150 מטר",
    startThreshold: "00:57",
    endThreshold: "00:55",
    excellenceThreshold: "",
    active: true,
  },

  {
    id: 2003,
    component: "כוח",
    population: "לוחמים",
    level: "רמה 2",
    metric: "מתח",
    startThreshold: '8 חזרות × 7 ק"ג',
    endThreshold: '7 חזרות × 15 ק"ג',
    excellenceThreshold: "",
    active: true,
  },

  {
    id: 2004,
    component: "כוח",
    population: "לוחמים",
    level: "רמה 2",
    metric: "מקבילים / לחיצת חזה",
    startThreshold: "13 חזרות מקבילים",
    endThreshold: "5 חזרות לחיצת חזה",
    excellenceThreshold: "",
    active: true,
  },

  {
    id: 2005,
    component: "כוח",
    population: "לוחמים",
    level: "רמה 2",
    metric: "טראפ בר",
    startThreshold: '5 חזרות × 80 ק"ג',
    endThreshold: '5 חזרות × 80 ק"ג',
    excellenceThreshold: "",
    active: true,
  },

  // -------------------------
  // לוחמים רמה 3
  // -------------------------

  {
    id: 3001,
    component: "ריצה",
    population: "לוחמים",
    level: "רמה 3",
    metric: 'ריצת 3 ק"מ',
    startThreshold: "12:50",
    endThreshold: "12:40",
    excellenceThreshold: "11:03",
    active: true,
  },

  {
    id: 3002,
    component: "ספרינטים",
    population: "לוחמים",
    level: "רמה 3",
    metric: "2×150 מטר",
    startThreshold: "00:55",
    endThreshold: "00:53",
    excellenceThreshold: "",
    active: true,
  },

  {
    id: 3003,
    component: "כוח",
    population: "לוחמים",
    level: "רמה 3",
    metric: "מתח",
    startThreshold: '7 חזרות × 15 ק"ג',
    endThreshold: '8 חזרות × 15 ק"ג',
    excellenceThreshold: "15 חזרות",
    active: true,
  },

  {
    id: 3004,
    component: "כוח",
    population: "לוחמים",
    level: "רמה 3",
    metric: "לחיצת חזה",
    startThreshold: "5 חזרות",
    endThreshold: "7 חזרות",
    excellenceThreshold: "",
    active: true,
  },

  {
    id: 3005,
    component: "כוח",
    population: "לוחמים",
    level: "רמה 3",
    metric: "טראפ בר",
    startThreshold: '5 חזרות × 80 ק"ג',
    endThreshold: '7 חזרות × 90 ק"ג',
    excellenceThreshold: "",
    active: true,
  },

  // -------------------------
  // לוחמות רמה 1
  // -------------------------

  {
    id: 4001,
    component: "ריצה",
    population: "לוחמות",
    level: "רמה 1",
    metric: 'ריצת 3 ק"מ',
    startThreshold: "17:32",
    endThreshold: "17:00",
    excellenceThreshold: "",
    active: true,
  },

  {
    id: 4002,
    component: "ספרינטים",
    population: "לוחמות",
    level: "רמה 1",
    metric: "2×150 מטר",
    startThreshold: "01:07",
    endThreshold: "01:05",
    excellenceThreshold: "",
    active: true,
  },

  {
    id: 4003,
    component: "כוח",
    population: "לוחמות",
    level: "רמה 1",
    metric: "מתח עם גומייה",
    startThreshold: "7 חזרות",
    endThreshold: "8 חזרות",
    excellenceThreshold: "",
    active: true,
  },

  {
    id: 4004,
    component: "כוח",
    population: "לוחמות",
    level: "רמה 1",
    metric: "מקבילים / לחיצת חזה",
    startThreshold: "11 חזרות עם גומייה",
    endThreshold: "13 חזרות עם גומייה",
    excellenceThreshold: "",
    active: true,
  },

  {
    id: 4005,
    component: "כוח",
    population: "לוחמות",
    level: "רמה 1",
    metric: "טראפ בר",
    startThreshold: '5 חזרות × 50 ק"ג',
    endThreshold: '7 חזרות × 50 ק"ג',
    excellenceThreshold: "",
    active: true,
  },

  // -------------------------
  // לוחמות רמה 2
  // -------------------------

  {
    id: 5001,
    component: "ריצה",
    population: "לוחמות",
    level: "רמה 2",
    metric: 'ריצת 3 ק"מ',
    startThreshold: "14:47",
    endThreshold: "14:00",
    excellenceThreshold: "",
    active: true,
  },

  {
    id: 5002,
    component: "ספרינטים",
    population: "לוחמות",
    level: "רמה 2",
    metric: "2×150 מטר",
    startThreshold: "00:58",
    endThreshold: "00:58",
    excellenceThreshold: "",
    active: true,
  },

  {
    id: 5003,
    component: "כוח",
    population: "לוחמות",
    level: "רמה 2",
    metric: "מתח",
    startThreshold: "5 חזרות",
    endThreshold: "7 חזרות",
    excellenceThreshold: "",
    active: true,
  },

  {
    id: 5004,
    component: "כוח",
    population: "לוחמות",
    level: "רמה 2",
    metric: 'לחיצת חזה 30 ק"ג',
    startThreshold: "9 חזרות",
    endThreshold: "11 חזרות",
    excellenceThreshold: "",
    active: true,
  },

  {
    id: 5005,
    component: "כוח",
    population: "לוחמות",
    level: "רמה 2",
    metric: "טראפ בר",
    startThreshold: '5 חזרות × 50 ק"ג',
    endThreshold: '7 חזרות × 50 ק"ג',
    excellenceThreshold: "",
    active: true,
  },
];

export default function UnitMappingPage() {
  const [mappings, setMappings] =
    useState<UnitMapping[]>(initialMappings);

  const [savedStandards, setSavedStandards] =
    useState<Standard[]>([]);

  const [searchText, setSearchText] =
    useState("");

  const [
    populationFilter,
    setPopulationFilter,
  ] = useState("הכל");

  const [
    fitnessLevelFilter,
    setFitnessLevelFilter,
  ] = useState("הכל");

  const [
    explanationPopulation,
    setExplanationPopulation,
  ] = useState<Population>("לוחמים");

  const [savedMessage, setSavedMessage] =
    useState("");

  useEffect(() => {
    const storedMappings =
      localStorage.getItem(
        MAPPING_STORAGE_KEY
      );

    if (storedMappings) {
      try {
        setMappings(
          JSON.parse(
            storedMappings
          ) as UnitMapping[]
        );
      } catch (error) {
        console.error(
          "שגיאה בטעינת שיוך היחידות:",
          error
        );
      }
    }

    const storedStandards =
      localStorage.getItem(
        STANDARDS_STORAGE_KEY
      );

    if (storedStandards) {
      try {
        setSavedStandards(
          JSON.parse(
            storedStandards
          ) as Standard[]
        );
      } catch (error) {
        console.error(
          "שגיאה בטעינת הספים:",
          error
        );
      }
    }
  }, []);

  function updateMapping(
    id: number,
    field: keyof UnitMapping,
    value: string | boolean
  ) {
    setMappings((current) =>
      current.map((mapping) =>
        mapping.id === id
          ? {
              ...mapping,
              [field]: value,
            }
          : mapping
      )
    );

    setSavedMessage("");
  }

  function addMapping() {
    setMappings((current) => [
      ...current,
      {
        id: Date.now(),
        unit: "",
        population: "לוחמים",
        fitnessLevel: "רמה 1",
        shootingLevel: "60",
        active: true,
      },
    ]);
  }

  function duplicateMapping(
    mapping: UnitMapping
  ) {
    setMappings((current) => [
      ...current,
      {
        ...mapping,
        id: Date.now(),
        unit: mapping.unit
          ? `${mapping.unit} - עותק`
          : "",
      },
    ]);
  }

  function deleteMapping(id: number) {
    const approved = window.confirm(
      "האם למחוק את שיוך היחידה?"
    );

    if (!approved) return;

    setMappings((current) =>
      current.filter(
        (mapping) =>
          mapping.id !== id
      )
    );
  }

  function saveMappings() {
    localStorage.setItem(
      MAPPING_STORAGE_KEY,
      JSON.stringify(mappings)
    );

    setSavedMessage(
      "שיוך היחידות נשמר בהצלחה"
    );

    setTimeout(() => {
      setSavedMessage("");
    }, 3000);
  }

  function resetMappings() {
    const approved = window.confirm(
      "האם לאפס את כל שיוך היחידות?"
    );

    if (!approved) return;

    setMappings(initialMappings);

    localStorage.setItem(
      MAPPING_STORAGE_KEY,
      JSON.stringify(initialMappings)
    );

    setSavedMessage(
      "שיוך היחידות אופס"
    );

    setTimeout(() => {
      setSavedMessage("");
    }, 3000);
  }

  const filteredMappings =
    useMemo(() => {
      return mappings.filter(
        (mapping) => {
          const searchMatches =
            mapping.unit
              .toLowerCase()
              .includes(
                searchText
                  .trim()
                  .toLowerCase()
              );

          const populationMatches =
            populationFilter ===
              "הכל" ||
            mapping.population ===
              populationFilter;

          const levelMatches =
            fitnessLevelFilter ===
              "הכל" ||
            mapping.fitnessLevel ===
              fitnessLevelFilter;

          return (
            searchMatches &&
            populationMatches &&
            levelMatches
          );
        }
      );
    }, [
      mappings,
      searchText,
      populationFilter,
      fitnessLevelFilter,
    ]);

  function getLevelStandards(
    population: Population,
    level: string
  ) {
    const customStandards =
      savedStandards.filter(
        (standard) =>
          standard.active &&
          standard.population ===
            population &&
          standard.level === level
      );

    if (customStandards.length > 0) {
      return customStandards;
    }

    return fallbackStandards.filter(
      (standard) =>
        standard.population ===
          population &&
        standard.level === level
    );
  }

  function getExampleUnits(
    population: Population,
    level: string
  ) {
    return mappings
      .filter(
        (mapping) =>
          mapping.active &&
          mapping.population ===
            population &&
          mapping.fitnessLevel === level
      )
      .map((mapping) => mapping.unit)
      .filter(Boolean)
      .slice(0, 6);
  }

  const level1Standards =
    getLevelStandards(
      explanationPopulation,
      "רמה 1"
    );

  const level2Standards =
    getLevelStandards(
      explanationPopulation,
      "רמה 2"
    );

  const level3Standards =
    getLevelStandards(
      explanationPopulation,
      "רמה 3"
    );

  const level1Units =
    getExampleUnits(
      explanationPopulation,
      "רמה 1"
    );

  const level2Units =
    getExampleUnits(
      explanationPopulation,
      "רמה 2"
    );

  const level3Units =
    getExampleUnits(
      explanationPopulation,
      "רמה 3"
    );

  const activeMappings =
    mappings.filter(
      (mapping) => mapping.active
    ).length;

  const warriorMappings =
    mappings.filter(
      (mapping) =>
        mapping.population ===
        "לוחמים"
    ).length;

  const femaleWarriorMappings =
    mappings.filter(
      (mapping) =>
        mapping.population ===
        "לוחמות"
    ).length;

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-100"
    >
      <header className="bg-slate-900 text-white px-8 py-6">

        <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-4">

          <div>
            <p className="text-slate-300">
              CommandFit
            </p>

            <h1 className="text-3xl font-bold">
              שיוך יחידות לרמות סף
            </h1>
          </div>

          <div className="flex flex-wrap gap-3">

            <Link
              href="/standards"
              className="bg-white/10 hover:bg-white/20 px-5 py-3 rounded-xl"
            >
              ניהול ספים
            </Link>

            <Link
              href="/"
              className="bg-white/10 hover:bg-white/20 px-5 py-3 rounded-xl"
            >
              חזרה לדף הבית
            </Link>

          </div>

        </div>

      </header>

      <div className="max-w-[1700px] mx-auto p-8">

        <section className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">

          <StatCard
            title='סה"כ שיוכים'
            value={
              mappings.length.toString()
            }
          />

          <StatCard
            title="לוחמים"
            value={
              warriorMappings.toString()
            }
          />

          <StatCard
            title="לוחמות"
            value={
              femaleWarriorMappings.toString()
            }
          />

          <StatCard
            title="שיוכים פעילים"
            value={
              activeMappings.toString()
            }
          />

        </section>

        <section className="bg-white rounded-2xl shadow-sm p-6 mb-6">

          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">

            <div>

              <h2 className="text-2xl font-bold">
                ניהול שיוך יחידות
              </h2>

              <p className="text-slate-500 mt-2">
                ניתן לשנות בכל עת את
                האוכלוסייה, רמת הכש״ג
                ורמת הקליעה של כל יחידה.
              </p>

            </div>

            <div className="flex flex-wrap gap-3">

              <input
                type="text"
                value={searchText}
                onChange={(event) =>
                  setSearchText(
                    event.target.value
                  )
                }
                placeholder="חיפוש יחידה..."
                className="border rounded-xl px-4 py-3 w-48"
              />

              <select
                value={populationFilter}
                onChange={(event) =>
                  setPopulationFilter(
                    event.target.value
                  )
                }
                className="border rounded-xl px-4 py-3"
              >

                <option value="הכל">
                  כל האוכלוסיות
                </option>

                <option value="לוחמים">
                  לוחמים
                </option>

                <option value="לוחמות">
                  לוחמות
                </option>

              </select>

              <select
                value={fitnessLevelFilter}
                onChange={(event) =>
                  setFitnessLevelFilter(
                    event.target.value
                  )
                }
                className="border rounded-xl px-4 py-3"
              >

                <option value="הכל">
                  כל הרמות
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

              <button
                onClick={addMapping}
                className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-3 rounded-xl"
              >
                + הוספת יחידה
              </button>

              <button
                onClick={saveMappings}
                className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl"
              >
                שמירת שיוכים
              </button>

              <button
                onClick={resetMappings}
                className="bg-white border border-slate-300 hover:bg-slate-50 px-5 py-3 rounded-xl"
              >
                איפוס
              </button>

            </div>

          </div>

          {savedMessage && (
            <div className="mt-4 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3">
              {savedMessage}
            </div>
          )}

        </section>

        <section className="bg-white rounded-2xl shadow-sm p-6 mb-8">

          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">

            <table className="w-full min-w-[1200px] border-collapse text-right">

              <thead className="bg-slate-100 sticky top-0 z-10">

                <tr>

                  <th className="p-3 border-b">
                    יחידה
                  </th>

                  <th className="p-3 border-b">
                    אוכלוסייה
                  </th>

                  <th className="p-3 border-b">
                    רמת כש״ג
                  </th>

                  <th className="p-3 border-b">
                    רמת קליעה
                  </th>

                  <th className="p-3 border-b">
                    פעיל
                  </th>

                  <th className="p-3 border-b">
                    פעולות
                  </th>

                </tr>

              </thead>

              <tbody>

                {filteredMappings.map(
                  (mapping) => (

                    <tr
                      key={mapping.id}
                      className={
                        mapping.active
                          ? "hover:bg-slate-50"
                          : "bg-slate-50 opacity-60"
                      }
                    >

                      <td className="p-2 border-b">

                        <input
                          type="text"
                          value={mapping.unit}
                          onChange={(event) =>
                            updateMapping(
                              mapping.id,
                              "unit",
                              event.target.value
                            )
                          }
                          className="border rounded-lg px-3 py-2 w-56"
                        />

                      </td>

                      <td className="p-2 border-b">

                        <select
                          value={
                            mapping.population
                          }
                          onChange={(event) =>
                            updateMapping(
                              mapping.id,
                              "population",
                              event.target.value
                            )
                          }
                          className="border rounded-lg px-3 py-2 w-32"
                        >

                          <option value="לוחמים">
                            לוחמים
                          </option>

                          <option value="לוחמות">
                            לוחמות
                          </option>

                        </select>

                      </td>

                      <td className="p-2 border-b">

                        <select
                          value={
                            mapping.fitnessLevel
                          }
                          onChange={(event) =>
                            updateMapping(
                              mapping.id,
                              "fitnessLevel",
                              event.target.value
                            )
                          }
                          className="border rounded-lg px-3 py-2 w-28"
                        >

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

                      </td>

                      <td className="p-2 border-b">

                        <select
                          value={
                            mapping.shootingLevel
                          }
                          onChange={(event) =>
                            updateMapping(
                              mapping.id,
                              "shootingLevel",
                              event.target.value
                            )
                          }
                          className="border rounded-lg px-3 py-2 w-28"
                        >

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

                      </td>

                      <td className="p-2 border-b text-center">

                        <input
                          type="checkbox"
                          checked={
                            mapping.active
                          }
                          onChange={(event) =>
                            updateMapping(
                              mapping.id,
                              "active",
                              event.target.checked
                            )
                          }
                          className="w-5 h-5"
                        />

                      </td>

                      <td className="p-2 border-b">

                        <div className="flex gap-2">

                          <button
                            onClick={() =>
                              duplicateMapping(
                                mapping
                              )
                            }
                            className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-2 rounded-lg"
                          >
                            שכפול
                          </button>

                          <button
                            onClick={() =>
                              deleteMapping(
                                mapping.id
                              )
                            }
                            className="bg-red-50 text-red-700 hover:bg-red-100 px-3 py-2 rounded-lg"
                          >
                            מחיקה
                          </button>

                        </div>

                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        </section>

        <section className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-8">

          <h2 className="text-xl font-bold">
            איך השיוך עובד?
          </h2>

          <p className="text-slate-600 mt-2">
            כאשר צוער או צוערת מוזנים
            למערכת, CommandFit יוכל לזהות
            את היחידה שלהם ולמשוך את
            רמת הכש״ג ואת רמת הקליעה
            שהוגדרו כאן.
          </p>

        </section>

        {/* ==================================================
            פירוט ודוגמאות לכל רמה
        ================================================== */}

        <section className="bg-white rounded-2xl shadow-sm p-6">

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">

            <div>

              <h2 className="text-2xl font-bold">
                מה המשמעות של כל רמה?
              </h2>

              <p className="text-slate-500 mt-1">
                דוגמה מלאה לספי ההתחלה
                והסיום בכל קבוצת סף.
              </p>

            </div>

            <select
              value={
                explanationPopulation
              }
              onChange={(event) =>
                setExplanationPopulation(
                  event.target
                    .value as Population
                )
              }
              className="border rounded-xl px-4 py-3"
            >

              <option value="לוחמים">
                לוחמים
              </option>

              <option value="לוחמות">
                לוחמות
              </option>

            </select>

          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

            <LevelCard
              level="רמה 1"
              standards={
                level1Standards
              }
              exampleUnits={
                level1Units
              }
            />

            <LevelCard
              level="רמה 2"
              standards={
                level2Standards
              }
              exampleUnits={
                level2Units
              }
            />

            {explanationPopulation ===
            "לוחמים" ? (

              <LevelCard
                level="רמה 3"
                standards={
                  level3Standards
                }
                exampleUnits={
                  level3Units
                }
              />

            ) : (

              <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 min-h-[450px] flex flex-col items-center justify-center text-center">

                <div className="text-3xl font-bold text-slate-400">
                  רמה 3
                </div>

                <p className="text-slate-500 mt-4">
                  לא מוגדרת כרגע קבוצת
                  רמה 3 ללוחמות.
                </p>

                <p className="text-sm text-slate-400 mt-2">
                  אם בעתיד יוגדר סף
                  נוסף, ניתן יהיה להוסיף
                  אותו במסך ניהול הספים.
                </p>

              </div>

            )}

          </div>

          <div className="mt-6 bg-amber-50 border border-amber-100 rounded-xl p-5">

            <h3 className="font-bold">
              חשוב לדעת
            </h3>

            <p className="text-slate-600 mt-2">
              רמה 1, רמה 2 ורמה 3 הן
              קבוצות סף בהתאם לשיוך
              היחידתי. הן אינן דירוג
              של איכות הצוער או היחידה.
            </p>

            <p className="text-slate-600 mt-2">
              הספים כאן נמשכים ממסך
              ניהול הספים. אם תשנה שם
              נתון ותשמור, גם הדוגמה
              כאן תתעדכן.
            </p>

          </div>

          {/* ==================================================
              רמות קליעה
          ================================================== */}

          <div className="mt-8">

            <h2 className="text-2xl font-bold">
              רמות קליעה
            </h2>

            <p className="text-slate-500 mt-1">
              רמת הקליעה נפרדת מרמת הכש״ג.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">

              <ShootingCard
                score="60"
                description="רמת דרישה 60 נקודות"
              />

              <ShootingCard
                score="70"
                description="רמת דרישה 70 נקודות"
              />

              <ShootingCard
                score="75"
                description="רמת דרישה 75 נקודות"
              />

            </div>

          </div>

        </section>

      </div>

    </main>
  );
}

function LevelCard({
  level,
  standards,
  exampleUnits,
}: {
  level: string;
  standards: Standard[];
  exampleUnits: string[];
}) {
  return (
    <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">

      <div className="bg-slate-100 p-5">

        <div className="flex items-center justify-between">

          <h3 className="text-2xl font-bold">
            {level}
          </h3>

          <span className="bg-white border border-slate-200 rounded-full px-3 py-1 text-sm text-slate-500">
            {standards.length} מדדים
          </span>

        </div>

        {exampleUnits.length > 0 && (

          <div className="mt-4">

            <p className="text-xs text-slate-500 mb-2">
              דוגמאות ליחידות ברמה זו
            </p>

            <div className="flex flex-wrap gap-2">

              {exampleUnits.map(
                (unit) => (

                  <span
                    key={unit}
                    className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs"
                  >
                    {unit}
                  </span>

                )
              )}

            </div>

          </div>

        )}

      </div>

      <div className="p-4">

        {standards.length === 0 ? (

          <div className="text-center text-slate-400 py-10">
            לא הוגדרו ספים
          </div>

        ) : (

          <div className="space-y-3">

            {standards.map(
              (standard) => (

                <div
                  key={standard.id}
                  className="border border-slate-100 rounded-xl p-4"
                >

                  <div className="flex items-start justify-between gap-3">

                    <div>

                      <p className="font-bold">
                        {standard.metric}
                      </p>

                      <p className="text-xs text-slate-400 mt-1">
                        {
                          standard.component
                        }
                      </p>

                    </div>

                    {standard.excellenceThreshold && (

                      <span className="bg-amber-50 text-amber-700 text-xs px-2 py-1 rounded-lg">
                        מצטיין:{" "}
                        {
                          standard.excellenceThreshold
                        }
                      </span>

                    )}

                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-3">

                    <div className="bg-slate-50 rounded-lg p-3">

                      <p className="text-xs text-slate-400">
                        סף התחלה
                      </p>

                      <p className="font-bold mt-1">
                        {
                          standard.startThreshold ||
                          "—"
                        }
                      </p>

                    </div>

                    <div className="bg-slate-50 rounded-lg p-3">

                      <p className="text-xs text-slate-400">
                        סף סיום
                      </p>

                      <p className="font-bold mt-1">
                        {
                          standard.endThreshold ||
                          "—"
                        }
                      </p>

                    </div>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>

    </div>
  );
}

function ShootingCard({
  score,
  description,
}: {
  score: string;
  description: string;
}) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 text-center">

      <p className="text-sm text-slate-500">
        רמת קליעה
      </p>

      <p className="text-5xl font-bold mt-2">
        {score}
      </p>

      <p className="text-sm text-slate-500 mt-3">
        {description}
      </p>

    </div>
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