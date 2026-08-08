"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useAuth,
} from "@/lib/use-auth";

import {
  closeCycle,
  createCycle,
  getActiveCycle,
  getAllCycles,
  getCycleStatusLabel,
  getCyclesByBattalion,
  migrateLegacyDataToCycle,
  reopenCycle,
  setActiveCycle,
  type CourseCycle,
} from "@/lib/cycles";

import {
  getBattalionTests,
} from "@/lib/battalion-tests";

/* =========================================================
   FORM
========================================================= */

type CycleForm = {
  name: string;
  startDate: string;

  dekelSourceCycleId: string;
  rimonSourceCycleId: string;
};

/* =========================================================
   PAGE
========================================================= */

export default function CyclesPage() {
  const {
    isAdmin,
    isViewer,
  } = useAuth();

  const params =
    useParams<{
      name: string;
    }>();

  const battalionName =
    decodeURIComponent(
      params.name
    );

  const [
    cycles,
    setCycles,
  ] =
    useState<
      CourseCycle[]
    >([]);

  const [
    activeCycle,
    setActiveCycleState,
  ] =
    useState<
      CourseCycle | null
    >(null);

  const [
    showCreate,
    setShowCreate,
  ] =
    useState(false);

  const [
    form,
    setForm,
  ] =
    useState<CycleForm>({
      name: "",
      startDate:
        new Date()
          .toISOString()
          .slice(
            0,
            10
          ),

      dekelSourceCycleId:
        "",

      rimonSourceCycleId:
        "",
    });

  const [
    message,
    setMessage,
  ] =
    useState("");

  /* =======================================================
     LOAD
  ======================================================= */

  function refresh() {
    setCycles(
      getCyclesByBattalion(
        battalionName
      )
    );

    setActiveCycleState(
      getActiveCycle(
        battalionName
      )
    );
  }

  useEffect(() => {
    refresh();
  }, [
    battalionName,
  ]);

  /* =======================================================
     SOURCE CYCLES FOR GEFEN
  ======================================================= */

  const dekelCycles =
    useMemo(
      () =>
        getAllCycles()
          .filter(
            (cycle) =>
              cycle.battalion ===
              "דקל"
          ),
      [
        cycles,
      ]
    );

  const rimonCycles =
    useMemo(
      () =>
        getAllCycles()
          .filter(
            (cycle) =>
              cycle.battalion ===
              "רימון"
          ),
      [
        cycles,
      ]
    );

  /* =======================================================
     CREATE
  ======================================================= */

  function handleCreateCycle() {
    if (!isAdmin) {
      setMessage(
        "אין הרשאה לבצע פעולה זו."
      );

      return;
    }

    if (
      !form.name.trim()
    ) {
      setMessage(
        "יש להזין שם למחזור."
      );

      return;
    }

    if (
      !form.startDate
    ) {
      setMessage(
        "יש לבחור תאריך פתיחה."
      );

      return;
    }

    if (
      battalionName ===
        "גפן" &&
      (
        !form.dekelSourceCycleId ||
        !form.rimonSourceCycleId
      )
    ) {
      setMessage(
        "בגפן יש לבחור מחזור מקור מדקל ומחזור מקור מרימון."
      );

      return;
    }

    const cycle =
      createCycle({
        name:
          form.name,

        battalion:
          battalionName,

        startDate:
          form.startDate,

        sourceCycles:
          battalionName ===
          "גפן"
            ? {
                dekel:
                  form.dekelSourceCycleId,

                rimon:
                  form.rimonSourceCycleId,
              }
            : undefined,
      });

    /*
      אם קיימים נתונים ישנים,
      מעבירים אותם למחזור הראשון.
    */

    const tests =
      getBattalionTests(
        battalionName
      );

    migrateLegacyDataToCycle(
      battalionName,
      cycle.id,
      tests.map(
        (test) =>
          test.name
      )
    );

    setMessage(
      `המחזור "${cycle.name}" נפתח בהצלחה.`
    );

    setShowCreate(
      false
    );

    setForm({
      name: "",
      startDate:
        new Date()
          .toISOString()
          .slice(
            0,
            10
          ),

      dekelSourceCycleId:
        "",

      rimonSourceCycleId:
        "",
    });

    refresh();
  }

  /* =======================================================
     CLOSE
  ======================================================= */

  function handleCloseCycle(
    cycle: CourseCycle
  ) {
    if (!isAdmin) {
      setMessage(
        "אין הרשאה לבצע פעולה זו."
      );

      return;
    }

    const approved =
      window.confirm(
        `לסגור את המחזור "${cycle.name}"?\n\nהנתונים לא יימחקו. המחזור יעבור לארכיון.`
      );

    if (
      !approved
    ) {
      return;
    }

    closeCycle(
      cycle.id,
      new Date()
        .toISOString()
        .slice(
          0,
          10
        )
    );

    setMessage(
      `המחזור "${cycle.name}" נסגר ונשמר בארכיון.`
    );

    refresh();
  }

  /* =======================================================
     REOPEN
  ======================================================= */

  function handleReopenCycle(
    cycle: CourseCycle
  ) {
    if (!isAdmin) {
      setMessage(
        "אין הרשאה לבצע פעולה זו."
      );

      return;
    }

    const approved =
      window.confirm(
        `לפתוח מחדש את המחזור "${cycle.name}"?\n\nאם קיים מחזור פעיל אחר באותו גדוד, הוא ייסגר.`
      );

    if (
      !approved
    ) {
      return;
    }

    reopenCycle(
      cycle.id
    );

    setMessage(
      `המחזור "${cycle.name}" נפתח מחדש.`
    );

    refresh();
  }

  /* =======================================================
     SELECT ACTIVE
  ======================================================= */

  function handleSelectCycle(
    cycle: CourseCycle
  ) {
    setActiveCycle(
      battalionName,
      cycle.id
    );

    setMessage(
      `עברת למחזור "${cycle.name}".`
    );

    refresh();
  }

  /* =======================================================
     ARCHIVE
  ======================================================= */

  const closedCycles =
    cycles.filter(
      (cycle) =>
        cycle.status ===
        "closed"
    );

  /* =======================================================
     UI
  ======================================================= */

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-100"
    >

      {/* HEADER */}

      <header className="bg-slate-900 text-white px-8 py-7">

        <div className="max-w-[1500px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-5">

          <div>

            <p className="text-sm text-slate-400">
              CommandFit
            </p>

            <h1 className="text-3xl md:text-4xl font-bold mt-1">
              ניהול מחזורים —{" "}
              {battalionName}
            </h1>

            <p className="text-slate-300 mt-2">
              פתיחה, סגירה, ארכיון ומעבר בין מחזורי הכשרה
            </p>

          </div>

          <div className="flex flex-wrap gap-3">

            <Link
              href={`/battalions/${encodeURIComponent(
                battalionName
              )}`}
              className="bg-white/10 hover:bg-white/20 px-5 py-3 rounded-xl"
            >
              חזרה לגדוד
            </Link>

            <Link
              href={`/battalions/${encodeURIComponent(
                battalionName
              )}/summary`}
              className="bg-white text-slate-900 hover:bg-slate-100 px-5 py-3 rounded-xl font-medium"
            >
              סיכום וניתוח
            </Link>

          </div>

        </div>

      </header>

      <div className="max-w-[1500px] mx-auto p-6 md:p-8">

        {isViewer && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-2xl p-4 mb-6">
            👁️ מצב צפייה בלבד — ניתן לצפות במחזורים ובארכיון ולעבור בין מחזורים, אך לא לפתוח, לסגור או לפתוח מחדש מחזור.
          </div>
        )}

        {/* MESSAGE */}

        {message && (

          <div className="bg-blue-50 border border-blue-100 text-blue-800 rounded-2xl p-4 mb-6 flex items-center justify-between gap-4">

            <span>
              {message}
            </span>

            <button
              type="button"
              onClick={() =>
                setMessage(
                  ""
                )
              }
              className="font-bold text-blue-700"
            >
              ×
            </button>

          </div>

        )}

        {/* ACTIVE CYCLE */}

        <section className="mb-8">

          <div className="flex items-center justify-between gap-4 mb-4">

            <div>

              <h2 className="text-2xl font-bold">
                המחזור הפעיל
              </h2>

              <p className="text-slate-500 mt-1">
                המחזור שמוצג כרגע במערכת
              </p>

            </div>

            {isAdmin && (
              <button
                type="button"
                onClick={() =>
                  setShowCreate(
                    true
                  )
                }
                className="bg-slate-900 text-white px-5 py-3 rounded-xl font-medium hover:bg-slate-800"
              >
                + פתיחת מחזור חדש
              </button>
            )}

          </div>

          {activeCycle ? (

            <div className="bg-white rounded-3xl shadow-sm border border-green-100 overflow-hidden">

              <div className="bg-green-50 border-b border-green-100 px-6 py-4 flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <span className="w-3 h-3 bg-green-500 rounded-full" />

                  <span className="font-bold text-green-800">
                    מחזור פעיל
                  </span>

                </div>

                <span className="text-sm text-green-700">
                  {getCycleStatusLabel(
                    activeCycle.status
                  )}
                </span>

              </div>

              <div className="p-6 md:p-8">

                <div className="grid grid-cols-1 md:grid-cols-4 gap-5">

                  <InfoCard
                    title="שם המחזור"
                    value={
                      activeCycle.name
                    }
                  />

                  <InfoCard
                    title="גדוד"
                    value={
                      activeCycle.battalion
                    }
                  />

                  <InfoCard
                    title="תאריך פתיחה"
                    value={
                      formatDate(
                        activeCycle.startDate
                      )
                    }
                  />

                  <InfoCard
                    title="סטטוס"
                    value="פעיל"
                  />

                </div>

                {battalionName ===
                  "גפן" && (

                  <div className="mt-7 border-t border-slate-100 pt-6">

                    <h3 className="font-bold text-lg">
                      מחזורי מקור
                    </h3>

                    <p className="text-sm text-slate-500 mt-1">
                      המחזורים שמהם הגיעו הצוערים לגפן
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">

                      <SourceCycleCard
                        title="דקל"
                        cycleId={
                          activeCycle
                            .sourceCycles
                            ?.dekel
                        }
                      />

                      <SourceCycleCard
                        title="רימון"
                        cycleId={
                          activeCycle
                            .sourceCycles
                            ?.rimon
                        }
                      />

                    </div>

                  </div>

                )}

                <div className="flex flex-wrap gap-3 mt-7">

                  <Link
                    href={`/battalions/${encodeURIComponent(
                      battalionName
                    )}`}
                    className="bg-slate-900 text-white px-5 py-3 rounded-xl font-medium"
                  >
                    מעבר למחזור
                  </Link>

                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() =>
                        handleCloseCycle(
                          activeCycle
                        )
                      }
                      className="bg-red-50 text-red-700 border border-red-100 px-5 py-3 rounded-xl font-medium hover:bg-red-100"
                    >
                      סגירת מחזור
                    </button>
                  )}

                </div>

              </div>

            </div>

          ) : (

            <div className="bg-white rounded-3xl shadow-sm border-2 border-dashed border-slate-200 p-12 text-center">

              <div className="text-4xl">
                📁
              </div>

              <h3 className="text-xl font-bold mt-4">
                אין מחזור פעיל
              </h3>

              <p className="text-slate-500 mt-2">
                פתח מחזור חדש כדי להתחיל לעבוד
              </p>

              {isAdmin ? (
                <button
                  type="button"
                  onClick={() =>
                    setShowCreate(
                      true
                    )
                  }
                  className="mt-6 bg-slate-900 text-white px-6 py-3 rounded-xl font-medium"
                >
                  פתיחת מחזור חדש
                </button>
              ) : (
                <p className="mt-5 text-sm text-slate-500">
                  רק משתמש מנהל יכול לפתוח מחזור חדש.
                </p>
              )}

            </div>

          )}

        </section>

        {/* ARCHIVE */}

        <section className="bg-white rounded-3xl shadow-sm p-6 md:p-8">

          <div>

            <h2 className="text-2xl font-bold">
              ארכיון מחזורים
            </h2>

            <p className="text-slate-500 mt-1">
              מחזורים קודמים שנשמרו במערכת
            </p>

          </div>

          {closedCycles.length ===
          0 ? (

            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center text-slate-400 mt-6">
              אין עדיין מחזורים סגורים
            </div>

          ) : (

            <div className="space-y-4 mt-6">

              {closedCycles.map(
                (cycle) => (

                  <div
                    key={
                      cycle.id
                    }
                    className="border border-slate-200 rounded-2xl p-5"
                  >

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">

                      <div>

                        <div className="flex items-center gap-3">

                          <span className="bg-slate-100 text-slate-600 text-xs px-3 py-1 rounded-lg">
                            🔒 סגור
                          </span>

                          <h3 className="font-bold text-lg">
                            {cycle.name}
                          </h3>

                        </div>

                        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-3 text-sm text-slate-500">

                          <span>
                            פתיחה:{" "}
                            {formatDate(
                              cycle.startDate
                            )}
                          </span>

                          <span>
                            סיום:{" "}
                            {cycle.endDate
                              ? formatDate(
                                  cycle.endDate
                                )
                              : "—"}
                          </span>

                        </div>

                      </div>

                      <div className="flex flex-wrap gap-2">

                        <button
                          type="button"
                          onClick={() =>
                            handleSelectCycle(
                              cycle
                            )
                          }
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl"
                        >
                          צפייה במחזור
                        </button>

                        {isAdmin && (
                          <button
                            type="button"
                            onClick={() =>
                              handleReopenCycle(
                                cycle
                              )
                            }
                            className="bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-100 px-4 py-2 rounded-xl"
                          >
                            פתיחה מחדש
                          </button>
                        )}

                      </div>

                    </div>

                  </div>

                )
              )}

            </div>

          )}

        </section>

      </div>

      {/* CREATE MODAL */}

      {showCreate && isAdmin && (

        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() =>
            setShowCreate(
              false
            )
          }
        >

          <div
            className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden"
            onClick={(
              event
            ) =>
              event.stopPropagation()
            }
          >

            <div className="bg-slate-900 text-white p-6 flex items-start justify-between">

              <div>

                <h2 className="text-2xl font-bold">
                  פתיחת מחזור חדש
                </h2>

                <p className="text-slate-300 text-sm mt-1">
                  {battalionName}
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setShowCreate(
                    false
                  )
                }
                className="bg-white/10 hover:bg-white/20 w-10 h-10 rounded-xl text-xl"
              >
                ×
              </button>

            </div>

            <div className="p-6">

              <label className="block">

                <span className="text-sm font-medium">
                  שם המחזור
                </span>

                <input
                  type="text"
                  value={
                    form.name
                  }
                  onChange={(
                    event
                  ) =>
                    setForm(
                      (
                        previous
                      ) => ({
                        ...previous,

                        name:
                          event
                            .target
                            .value,
                      })
                    )
                  }
                  placeholder='לדוגמה: מתקדם א׳ 2026'
                  className="mt-2 w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-slate-400"
                />

              </label>

              <label className="block mt-5">

                <span className="text-sm font-medium">
                  תאריך פתיחה
                </span>

                <input
                  type="date"
                  value={
                    form.startDate
                  }
                  onChange={(
                    event
                  ) =>
                    setForm(
                      (
                        previous
                      ) => ({
                        ...previous,

                        startDate:
                          event
                            .target
                            .value,
                      })
                    )
                  }
                  className="mt-2 w-full border border-slate-200 rounded-xl px-4 py-3 outline-none focus:border-slate-400"
                />

              </label>

              {battalionName ===
                "גפן" && (

                <div className="mt-6 bg-slate-50 rounded-2xl p-5">

                  <h3 className="font-bold">
                    מחזורי מקור
                  </h3>

                  <p className="text-sm text-slate-500 mt-1">
                    בחר מאילו מחזורי דקל ורימון הגיעו הצוערים
                  </p>

                  <label className="block mt-4">

                    <span className="text-sm font-medium">
                      מחזור דקל
                    </span>

                    <select
                      value={
                        form.dekelSourceCycleId
                      }
                      onChange={(
                        event
                      ) =>
                        setForm(
                          (
                            previous
                          ) => ({
                            ...previous,

                            dekelSourceCycleId:
                              event
                                .target
                                .value,
                          })
                        )
                      }
                      className="mt-2 w-full border border-slate-200 rounded-xl px-4 py-3 bg-white"
                    >

                      <option value="">
                        בחר מחזור
                      </option>

                      {dekelCycles.map(
                        (
                          cycle
                        ) => (

                          <option
                            key={
                              cycle.id
                            }
                            value={
                              cycle.id
                            }
                          >
                            {cycle.name}
                          </option>

                        )
                      )}

                    </select>

                  </label>

                  <label className="block mt-4">

                    <span className="text-sm font-medium">
                      מחזור רימון
                    </span>

                    <select
                      value={
                        form.rimonSourceCycleId
                      }
                      onChange={(
                        event
                      ) =>
                        setForm(
                          (
                            previous
                          ) => ({
                            ...previous,

                            rimonSourceCycleId:
                              event
                                .target
                                .value,
                          })
                        )
                      }
                      className="mt-2 w-full border border-slate-200 rounded-xl px-4 py-3 bg-white"
                    >

                      <option value="">
                        בחר מחזור
                      </option>

                      {rimonCycles.map(
                        (
                          cycle
                        ) => (

                          <option
                            key={
                              cycle.id
                            }
                            value={
                              cycle.id
                            }
                          >
                            {cycle.name}
                          </option>

                        )
                      )}

                    </select>

                  </label>

                </div>

              )}

              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mt-6">

                <p className="text-sm text-amber-800">
                  פתיחת מחזור חדש תסגור אוטומטית מחזור פעיל קודם באותו גדוד. הנתונים של המחזור הקודם לא יימחקו.
                </p>

              </div>

              <div className="flex justify-end gap-3 mt-7">

                <button
                  type="button"
                  onClick={() =>
                    setShowCreate(
                      false
                    )
                  }
                  className="bg-slate-100 text-slate-700 px-5 py-3 rounded-xl"
                >
                  ביטול
                </button>

                <button
                  type="button"
                  onClick={
                    handleCreateCycle
                  }
                  className="bg-slate-900 text-white px-6 py-3 rounded-xl font-medium"
                >
                  פתיחת המחזור
                </button>

              </div>

            </div>

          </div>

        </div>

      )}

    </main>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function InfoCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="bg-slate-50 rounded-2xl p-5">

      <p className="text-xs text-slate-500">
        {title}
      </p>

      <p className="font-bold text-lg mt-2">
        {value}
      </p>

    </div>
  );
}

function SourceCycleCard({
  title,
  cycleId,
}: {
  title: string;
  cycleId?: string;
}) {
  const cycle =
    cycleId
      ? getAllCycles().find(
          (
            item
          ) =>
            item.id ===
            cycleId
        )
      : undefined;

  return (
    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5">

      <p className="text-xs text-slate-500">
        גדוד {title}
      </p>

      <p className="font-bold text-lg mt-2">
        {cycle
          ? cycle.name
          : "לא נבחר מחזור"}
      </p>

      {cycle && (

        <p className="text-xs text-slate-400 mt-2">
          {formatDate(
            cycle.startDate
          )}
        </p>

      )}

    </div>
  );
}

function formatDate(
  value: string
) {
  if (!value) {
    return "—";
  }

  const date =
    new Date(
      `${value}T00:00:00`
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "he-IL",
    {
      day:
        "2-digit",
      month:
        "2-digit",
      year:
        "numeric",
    }
  ).format(
    date
  );
}