"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Population = "לוחמים" | "לוחמות";

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

/*
  משתמשים במפתח חדש כדי שהנתונים הישנים
  ששמרנו ב-localStorage לא ידרסו את הספים המתוקנים.
*/
const STORAGE_KEY = "commandfit-entry-standards-v3";

const initialStandards: Standard[] = [
  // =========================================================
  // לוחמים — רמה 1
  // =========================================================

  {
    id: 1,
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
    id: 2,
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
    id: 3,
    component: "כוח",
    population: "לוחמים",
    level: "רמה 1",
    metric: "מתח",
    startThreshold: '6 חזרות עם 7 ק"ג',
    endThreshold: '7 חזרות עם 7 ק"ג',
    excellenceThreshold: "",
    active: true,
  },

  {
    id: 4,
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
    id: 5,
    component: "כוח",
    population: "לוחמים",
    level: "רמה 1",
    metric: "טראפ בר",
    startThreshold: '5 חזרות עם 80 ק"ג',
    endThreshold: '7 חזרות עם 80 ק"ג',
    excellenceThreshold: "",
    active: true,
  },

  // =========================================================
  // לוחמים — רמה 2
  // =========================================================

  {
    id: 6,
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
    id: 7,
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
    id: 8,
    component: "כוח",
    population: "לוחמים",
    level: "רמה 2",
    metric: "מתח",
    startThreshold: '8 חזרות עם 7 ק"ג',
    endThreshold: '7 חזרות עם 15 ק"ג',
    excellenceThreshold: "",
    active: true,
  },

  {
    id: 9,
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
    id: 10,
    component: "כוח",
    population: "לוחמים",
    level: "רמה 2",
    metric: "טראפ בר",
    startThreshold: '5 חזרות עם 80 ק"ג',
    endThreshold: '5 חזרות עם 80 ק"ג',
    excellenceThreshold: "",
    active: true,
  },

  // =========================================================
  // לוחמים — רמה 3
  // =========================================================

  {
    id: 11,
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
    id: 12,
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
    id: 13,
    component: "כוח",
    population: "לוחמים",
    level: "רמה 3",
    metric: "מתח",
    startThreshold: '7 חזרות עם 15 ק"ג',
    endThreshold: '8 חזרות עם 15 ק"ג',
    excellenceThreshold: "15 חזרות",
    active: true,
  },

  {
    id: 14,
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
    id: 15,
    component: "כוח",
    population: "לוחמים",
    level: "רמה 3",
    metric: "טראפ בר",
    startThreshold: '5 חזרות עם 80 ק"ג',
    endThreshold: '7 חזרות עם 90 ק"ג',
    excellenceThreshold: "",
    active: true,
  },

  // =========================================================
  // לוחמות — רמה 1
  // =========================================================

  {
    id: 16,
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
    id: 17,
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
    id: 18,
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
    id: 19,
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
    id: 20,
    component: "כוח",
    population: "לוחמות",
    level: "רמה 1",
    metric: "טראפ בר",
    startThreshold: '5 חזרות עם 50 ק"ג',
    endThreshold: '7 חזרות עם 50 ק"ג',
    excellenceThreshold: "",
    active: true,
  },

  // =========================================================
  // לוחמות — רמה 2
  // =========================================================

  {
    id: 21,
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
    id: 22,
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
    id: 23,
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
    id: 24,
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
    id: 25,
    component: "כוח",
    population: "לוחמות",
    level: "רמה 2",
    metric: "טראפ בר",
    startThreshold: '5 חזרות עם 50 ק"ג',
    endThreshold: '7 חזרות עם 50 ק"ג',
    excellenceThreshold: "",
    active: true,
  },
];

export default function StandardsPage() {
  const [standards, setStandards] =
    useState<Standard[]>(initialStandards);

  const [populationFilter, setPopulationFilter] =
    useState("הכל");

  const [levelFilter, setLevelFilter] =
    useState("הכל");

  const [componentFilter, setComponentFilter] =
    useState("הכל");

  const [savedMessage, setSavedMessage] =
    useState("");

  /*
    טעינת הנתונים שנשמרו
  */
  useEffect(() => {
    const savedStandards =
      localStorage.getItem(STORAGE_KEY);

    if (!savedStandards) {
      return;
    }

    try {
      const parsed =
        JSON.parse(savedStandards) as Standard[];

      setStandards(parsed);
    } catch (error) {
      console.error(
        "שגיאה בטעינת הספים:",
        error
      );

      setStandards(initialStandards);
    }
  }, []);

  /*
    שינוי שדה בתוך סף
  */
  function updateStandard(
    id: number,
    field: keyof Standard,
    value: string | boolean
  ) {
    setStandards((current) =>
      current.map((standard) =>
        standard.id === id
          ? {
              ...standard,
              [field]: value,
            }
          : standard
      )
    );

    setSavedMessage("");
  }

  /*
    שמירת כל הספים
  */
  function saveStandards() {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(standards)
    );

    setSavedMessage(
      "הספים נשמרו בהצלחה"
    );

    setTimeout(() => {
      setSavedMessage("");
    }, 3000);
  }

  /*
    הוספת שורה חדשה
  */
  function addStandard() {
    const newStandard: Standard = {
      id: Date.now(),
      component: "ריצה",
      population: "לוחמים",
      level: "רמה 1",
      metric: "",
      startThreshold: "",
      endThreshold: "",
      excellenceThreshold: "",
      active: true,
    };

    setStandards((current) => [
      ...current,
      newStandard,
    ]);

    setSavedMessage("");
  }

  /*
    שכפול סף
  */
  function duplicateStandard(
    standard: Standard
  ) {
    const duplicatedStandard: Standard = {
      ...standard,
      id: Date.now(),
    };

    setStandards((current) => [
      ...current,
      duplicatedStandard,
    ]);

    setSavedMessage("");
  }

  /*
    מחיקת סף
  */
  function deleteStandard(id: number) {
    const approved = window.confirm(
      "האם למחוק את הסף?"
    );

    if (!approved) {
      return;
    }

    setStandards((current) =>
      current.filter(
        (standard) =>
          standard.id !== id
      )
    );

    setSavedMessage("");
  }

  /*
    איפוס לברירת המחדל
  */
  function resetStandards() {
    const approved = window.confirm(
      "האם לאפס את כל הספים לנתוני ברירת המחדל?"
    );

    if (!approved) {
      return;
    }

    setStandards(initialStandards);

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(initialStandards)
    );

    setSavedMessage(
      "הספים אופסו בהצלחה"
    );

    setTimeout(() => {
      setSavedMessage("");
    }, 3000);
  }

  /*
    סינון הטבלה
  */
  const filteredStandards =
    useMemo(() => {
      return standards.filter(
        (standard) => {
          const populationMatches =
            populationFilter === "הכל" ||
            standard.population ===
              populationFilter;

          const levelMatches =
            levelFilter === "הכל" ||
            standard.level ===
              levelFilter;

          const componentMatches =
            componentFilter === "הכל" ||
            standard.component ===
              componentFilter;

          return (
            populationMatches &&
            levelMatches &&
            componentMatches
          );
        }
      );
    }, [
      standards,
      populationFilter,
      levelFilter,
      componentFilter,
    ]);

  const activeStandards =
    standards.filter(
      (standard) =>
        standard.active
    ).length;

  const warriorStandards =
    standards.filter(
      (standard) =>
        standard.population === "לוחמים"
    ).length;

  const femaleWarriorStandards =
    standards.filter(
      (standard) =>
        standard.population === "לוחמות"
    ).length;

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-100"
    >
      {/* כותרת */}

      <header className="bg-slate-900 text-white px-8 py-6">

        <div className="max-w-[1700px] mx-auto flex items-center justify-between gap-4">

          <div>

            <p className="text-slate-300">
              CommandFit
            </p>

            <h1 className="text-3xl font-bold">
              ניהול ספי כניסה
            </h1>

          </div>

          <Link
            href="/"
            className="bg-white/10 hover:bg-white/20 px-5 py-3 rounded-xl"
          >
            חזרה לדף הבית
          </Link>

        </div>

      </header>

      <div className="max-w-[1700px] mx-auto p-8">

        {/* נתוני סיכום */}

        <section className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">

          <StatCard
            title='סה"כ ספים'
            value={standards.length.toString()}
          />

          <StatCard
            title="לוחמים"
            value={warriorStandards.toString()}
          />

          <StatCard
            title="לוחמות"
            value={femaleWarriorStandards.toString()}
          />

          <StatCard
            title="ספים פעילים"
            value={activeStandards.toString()}
          />

        </section>

        {/* הגדרות וסינון */}

        <section className="bg-white rounded-2xl shadow-sm p-6 mb-6">

          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">

            <div>

              <h2 className="text-2xl font-bold">
                ספי הכניסה לבה״ד 1
              </h2>

              <p className="text-slate-500 mt-2">
                הספים מחולקים לפי אוכלוסייה,
                רמת סף ומרכיב בבוחן.
              </p>

            </div>

            <div className="flex flex-wrap items-center gap-3">

              {/* אוכלוסייה */}

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

              {/* רמה */}

              <select
                value={levelFilter}
                onChange={(event) =>
                  setLevelFilter(
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

              {/* מרכיב */}

              <select
                value={componentFilter}
                onChange={(event) =>
                  setComponentFilter(
                    event.target.value
                  )
                }
                className="border rounded-xl px-4 py-3"
              >

                <option value="הכל">
                  כל המרכיבים
                </option>

                <option value="ריצה">
                  ריצה
                </option>

                <option value="ספרינטים">
                  ספרינטים
                </option>

                <option value="כוח">
                  כוח
                </option>

                <option value="קליעה">
                  קליעה
                </option>

              </select>

              <button
                onClick={addStandard}
                className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-3 rounded-xl"
              >
                + הוספת סף
              </button>

              <button
                onClick={saveStandards}
                className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl"
              >
                שמירת ספים
              </button>

              <button
                onClick={resetStandards}
                className="bg-white border border-slate-300 hover:bg-slate-50 px-5 py-3 rounded-xl"
              >
                איפוס
              </button>

            </div>

          </div>

          {savedMessage && (
            <div className="mt-4 text-green-700 font-medium">
              {savedMessage}
            </div>
          )}

        </section>

        {/* הטבלה */}

        <section className="bg-white rounded-2xl shadow-sm p-6">

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1500px] border-collapse text-right">

              <thead className="bg-slate-100 sticky top-0 z-10">

                <tr>

                  <th className="p-3 border-b">
                    מרכיב בבוחן
                  </th>

                  <th className="p-3 border-b">
                    אוכלוסייה
                  </th>

                  <th className="p-3 border-b">
                    רמת סף
                  </th>

                  <th className="p-3 border-b">
                    מדד
                  </th>

                  <th className="p-3 border-b">
                    סף התחלה
                  </th>

                  <th className="p-3 border-b">
                    סף סיום
                  </th>

                  <th className="p-3 border-b">
                    מצטיין
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

                {filteredStandards.map(
                  (standard) => (

                    <tr
                      key={standard.id}
                      className={
                        standard.active
                          ? "hover:bg-slate-50"
                          : "bg-slate-50 opacity-60"
                      }
                    >

                      {/* מרכיב בבוחן */}

                      <td className="p-2 border-b">

                        <select
                          value={standard.component}
                          onChange={(event) =>
                            updateStandard(
                              standard.id,
                              "component",
                              event.target.value
                            )
                          }
                          className="border rounded-lg px-3 py-2 w-32"
                        >

                          <option value="ריצה">
                            ריצה
                          </option>

                          <option value="ספרינטים">
                            ספרינטים
                          </option>

                          <option value="כוח">
                            כוח
                          </option>

                          <option value="קליעה">
                            קליעה
                          </option>

                        </select>

                      </td>

                      {/* אוכלוסייה */}

                      <td className="p-2 border-b">

                        <select
                          value={standard.population}
                          onChange={(event) =>
                            updateStandard(
                              standard.id,
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

                      {/* רמה */}

                      <td className="p-2 border-b">

                        <select
                          value={standard.level}
                          onChange={(event) =>
                            updateStandard(
                              standard.id,
                              "level",
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

                      {/* מדד */}

                      <td className="p-2 border-b">

                        <input
                          type="text"
                          value={standard.metric}
                          onChange={(event) =>
                            updateStandard(
                              standard.id,
                              "metric",
                              event.target.value
                            )
                          }
                          placeholder="שם המדד"
                          className="border rounded-lg px-3 py-2 w-56"
                        />

                      </td>

                      {/* סף התחלה */}

                      <td className="p-2 border-b">

                        <input
                          type="text"
                          value={standard.startThreshold}
                          onChange={(event) =>
                            updateStandard(
                              standard.id,
                              "startThreshold",
                              event.target.value
                            )
                          }
                          className="border rounded-lg px-3 py-2 w-48"
                        />

                      </td>

                      {/* סף סיום */}

                      <td className="p-2 border-b">

                        <input
                          type="text"
                          value={standard.endThreshold}
                          onChange={(event) =>
                            updateStandard(
                              standard.id,
                              "endThreshold",
                              event.target.value
                            )
                          }
                          className="border rounded-lg px-3 py-2 w-48"
                        />

                      </td>

                      {/* מצטיין */}

                      <td className="p-2 border-b">

                        <input
                          type="text"
                          value={standard.excellenceThreshold}
                          onChange={(event) =>
                            updateStandard(
                              standard.id,
                              "excellenceThreshold",
                              event.target.value
                            )
                          }
                          placeholder="לא הוגדר"
                          className="border rounded-lg px-3 py-2 w-36"
                        />

                      </td>

                      {/* פעיל */}

                      <td className="p-2 border-b text-center">

                        <input
                          type="checkbox"
                          checked={standard.active}
                          onChange={(event) =>
                            updateStandard(
                              standard.id,
                              "active",
                              event.target.checked
                            )
                          }
                          className="w-5 h-5"
                        />

                      </td>

                      {/* פעולות */}

                      <td className="p-2 border-b">

                        <div className="flex gap-2">

                          <button
                            onClick={() =>
                              duplicateStandard(
                                standard
                              )
                            }
                            className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-2 rounded-lg"
                          >
                            שכפול
                          </button>

                          <button
                            onClick={() =>
                              deleteStandard(
                                standard.id
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

          {/* הסבר */}

          <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-5">

            <h3 className="font-bold text-lg">
              מבנה הספים
            </h3>

            <p className="text-slate-600 mt-2">
              לכל אוכלוסייה ניתן להגדיר מספר
              רמות סף שונות. בהמשך המערכת
              תשייך אוטומטית כל צוער או צוערת
              לרמה המתאימה לפי היחידה שממנה
              הגיעו.
            </p>

          </div>

        </section>

      </div>

    </main>
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