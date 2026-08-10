"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getActiveCycle,
} from "@/lib/cycles";

import {
  useAuth,
} from "@/lib/use-auth";

import {
  supabase,
} from "@/lib/supabase";

import {
  clearNotification,
  publishNotification,
} from "@/lib/notifications";

import NotificationsPanel from "@/components/NotificationsPanel";

/* =========================================================
   TYPES
========================================================= */

type TrainingStatus =
  | "planned"
  | "completed"
  | "not_completed";

type TrainingSession = {
  id: number;
  weekNumber: number;
  trainingType: string;
  status: TrainingStatus;
};

type CloudTrainingSession = {
  id: number;
  week_number: number;
  training_type: string;
  status: TrainingStatus;
};

/* =========================================================
   CONFIG
========================================================= */

const FIGHTER_BATTALIONS =
  new Set([
    "דקל",
    "רימון",
    "הדס",
    "דולב",
    "גפן",
  ]);

const TRAINING_TYPES = [
  "אימון ריצה",
  "כוח מארז 2",
  "כוח מארז 3",
  "ריצת וסט",
  "אימון שחייה",
  'בוחן כש"ג כוח',
  'בוחן כש"ג ריצה',
  "לורן",
  "לורן משופר",
];

/* =========================================================
   HELPERS
========================================================= */

function getMinimumTrainings(
  battalion: string
) {
  return FIGHTER_BATTALIONS.has(
    battalion
  )
    ? 4
    : 2;
}

function isExemptWeek(
  weekNumber: number,
  totalWeeks: number
) {
  return (
    weekNumber === 1 ||
    weekNumber === totalWeeks
  );
}

/* =========================================================
   PAGE
========================================================= */

export default function TrainingPlanPage() {
  const params =
    useParams<{
      name: string;
    }>();

  const battalionName =
    decodeURIComponent(
      params.name
    );

  const {
    isAdmin,
    isViewer,
  } =
    useAuth();

  const activeCycle =
    getActiveCycle(
      battalionName
    );

  const cycleId =
    activeCycle?.id ??
    `legacy-${battalionName}`;

  const [
    totalWeeks,
    setTotalWeeks,
  ] =
    useState(0);

  const [
    weeksInput,
    setWeeksInput,
  ] =
    useState("12");

  const [
    sessions,
    setSessions,
  ] =
    useState<
      TrainingSession[]
    >([]);

  const [
    selectedTraining,
    setSelectedTraining,
  ] =
    useState<
      Record<number, string>
    >({});

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    message,
    setMessage,
  ] =
    useState("");

  const readOnly =
    isViewer ||
    !isAdmin;

  const minimumTrainings =
    getMinimumTrainings(
      battalionName
    );

  /* =======================================================
     LOAD
  ======================================================= */

  useEffect(() => {
    let cancelled =
      false;

    async function load() {
      setLoading(true);

      const {
        data:
          planData,
        error:
          planError,
      } =
        await supabase
          .from(
            "commandfit_training_plans"
          )
          .select(
            "total_weeks"
          )
          .eq(
            "cycle_id",
            cycleId
          )
          .eq(
            "battalion",
            battalionName
          )
          .maybeSingle();

      if (cancelled) {
        return;
      }

      if (planError) {
        console.error(
          "Training plan load error:",
          planError
        );
      }

      const loadedWeeks =
        Number(
          planData
            ?.total_weeks ??
            0
        );

      setTotalWeeks(
        loadedWeeks
      );

      if (loadedWeeks > 0) {
        setWeeksInput(
          String(
            loadedWeeks
          )
        );
      }

      const {
        data:
          sessionData,
        error:
          sessionError,
      } =
        await supabase
          .from(
            "commandfit_training_sessions"
          )
          .select(
            `
              id,
              week_number,
              training_type,
              status
            `
          )
          .eq(
            "cycle_id",
            cycleId
          )
          .eq(
            "battalion",
            battalionName
          )
          .order(
            "week_number",
            {
              ascending: true,
            }
          )
          .order(
            "id",
            {
              ascending: true,
            }
          );

      if (cancelled) {
        return;
      }

      if (sessionError) {
        console.error(
          "Training sessions load error:",
          sessionError
        );

        setMessage(
          "לא ניתן היה לטעון את תוכנית האימונים"
        );

        setLoading(false);

        return;
      }

      setSessions(
        (
          (
            sessionData ??
            []
          ) as CloudTrainingSession[]
        ).map(
          (row) => ({
            id:
              row.id,

            weekNumber:
              row.week_number,

            trainingType:
              row.training_type,

            status:
              row.status ?? "planned",
          })
        )
      );

      setLoading(false);
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [
    battalionName,
    cycleId,
  ]);

  /* =======================================================
     WEEKS
  ======================================================= */

  const weeks =
    useMemo(
      () =>
        Array.from(
          {
            length:
              totalWeeks,
          },
          (
            _,
            index
          ) =>
            index + 1
        ),
      [
        totalWeeks,
      ]
    );

  function sessionsForWeek(
    weekNumber: number
  ) {
    return sessions.filter(
      (session) =>
        session.weekNumber ===
        weekNumber
    );
  }

  /* =======================================================
     ALERT CHECK
  ======================================================= */

  async function updateWeekAlert(
    weekNumber: number,
    nextSessions:
      TrainingSession[]
  ) {
    if (totalWeeks <= 0) {
      return;
    }

    const alertKey =
      `low-training:${cycleId}:${battalionName}:week-${weekNumber}`;

    if (
      isExemptWeek(
        weekNumber,
        totalWeeks
      )
    ) {
      await clearNotification(
        alertKey
      );

      return;
    }

    const amount =
      nextSessions.filter(
        (session) =>
          session.weekNumber ===
          weekNumber
      ).length;

    if (
      amount <
      minimumTrainings
    ) {
      await publishNotification({
        cycleId,

        battalion:
          battalionName,

        eventType:
          "low_training_load",

        severity:
          "warning",

        title:
          `גדוד ${battalionName} – שבוע ${weekNumber}`,

        message:
          `קיימים ${amount} אימונים בלבד בשבוע זה. מומלץ לבדוק את תוכנית האימונים.`,

        href:
          `/battalions/${encodeURIComponent(
            battalionName
          )}/training-plan#week-${weekNumber}`,

        dedupeKey:
          alertKey,
      });

      return;
    }

    await clearNotification(
      alertKey
    );
  }

  /* =======================================================
     CREATE / UPDATE PLAN
  ======================================================= */

  async function saveWeeks() {
    if (readOnly) {
      return;
    }

    const amount =
      Math.round(
        Number(
          weeksInput
        )
      );

    if (
      !Number.isFinite(
        amount
      ) ||
      amount < 1 ||
      amount > 52
    ) {
      setMessage(
        "יש להזין מספר שבועות בין 1 ל־52"
      );

      return;
    }

    const hasSessionsAbove =
      sessions.some(
        (session) =>
          session.weekNumber >
          amount
      );

    if (hasSessionsAbove) {
      setMessage(
        "לא ניתן לקצר את מספר השבועות כל עוד קיימים אימונים בשבועות שמעל המספר החדש"
      );

      return;
    }

    const {
      error,
    } =
      await supabase
        .from(
          "commandfit_training_plans"
        )
        .upsert(
          {
            cycle_id:
              cycleId,

            battalion:
              battalionName,

            total_weeks:
              amount,

            updated_at:
              new Date()
                .toISOString(),
          },
          {
            onConflict:
              "cycle_id,battalion",
          }
        );

    if (error) {
      setMessage(
        `שמירת התוכנית נכשלה: ${error.message}`
      );

      return;
    }

    setTotalWeeks(
      amount
    );

    setMessage(
      "מספר השבועות נשמר בהצלחה"
    );

    await publishNotification({
      cycleId,

      battalion:
        battalionName,

      eventType:
        "training_update",

      severity:
        "info",

      title:
        `עודכנה תוכנית האימונים – גדוד ${battalionName}`,

      message:
        "מבנה תוכנית האימונים עודכן.",

      href:
        `/battalions/${encodeURIComponent(
          battalionName
        )}/training-plan`,

      dedupeKey:
        `training-plan:${cycleId}:${battalionName}`,
    });
  }

  /* =======================================================
     ADD TRAINING
  ======================================================= */

  async function addTraining(
    weekNumber: number
  ) {
    if (readOnly) {
      return;
    }

    const trainingType =
      selectedTraining[
        weekNumber
      ] ??
      TRAINING_TYPES[0];

    const {
      data,
      error,
    } =
      await supabase
        .from(
          "commandfit_training_sessions"
        )
        .insert({
          cycle_id:
            cycleId,

          battalion:
            battalionName,

          week_number:
            weekNumber,

          training_type:
            trainingType,

          status:
            "planned",
        })
        .select(
          `
            id,
            week_number,
            training_type,
            status
          `
        )
        .single();

    if (
      error ||
      !data
    ) {
      setMessage(
        `הוספת האימון נכשלה: ${
          error?.message ??
          "שגיאה"
        }`
      );

      return;
    }

    const newTraining:
      TrainingSession = {
        id:
          data.id,

        weekNumber:
          data.week_number,

        trainingType:
          data.training_type,

        status:
          data.status ?? "planned",
      };

    const nextSessions =
      [
        ...sessions,
        newTraining,
      ];

    setSessions(
      nextSessions
    );

    setMessage(
      `האימון נוסף לשבוע ${weekNumber}`
    );

    await publishNotification({
      cycleId,

      battalion:
        battalionName,

      eventType:
        "training_update",

      severity:
        "info",

      title:
        `גדוד ${battalionName} – שבוע ${weekNumber}`,

      message:
        `נוסף ${trainingType} לתוכנית האימונים.`,

      href:
        `/battalions/${encodeURIComponent(
          battalionName
        )}/training-plan#week-${weekNumber}`,

      dedupeKey:
        `training-update:${cycleId}:${battalionName}:week-${weekNumber}`,
    });

    await updateWeekAlert(
      weekNumber,
      nextSessions
    );
  }

  /* =======================================================
     COMPLETE
  ======================================================= */

  async function setStatus(
    session: TrainingSession,
    status: TrainingStatus
  ) {
    if (readOnly) {
      return;
    }

    const { error } =
      await supabase
        .from("commandfit_training_sessions")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", session.id);

    if (error) {
      setMessage(
        `עדכון האימון נכשל: ${error.message}`
      );
      return;
    }

    setSessions((current) =>
      current.map((item) =>
        item.id === session.id
          ? { ...item, status }
          : item
      )
    );

    const statusText =
      status === "completed"
        ? "בוצע"
        : status === "not_completed"
        ? "לא בוצע"
        : "טרם סומן";

    await publishNotification({
      cycleId,
      battalion: battalionName,
      eventType: "training_update",
      severity:
        status === "completed"
          ? "success"
          : status === "not_completed"
          ? "warning"
          : "info",
      title:
        `גדוד ${battalionName} – שבוע ${session.weekNumber}`,
      message:
        `${session.trainingType} סומן כ־${statusText}.`,
      href:
        `/battalions/${encodeURIComponent(
          battalionName
        )}/training-plan#week-${session.weekNumber}`,
      dedupeKey:
        `training-status:${cycleId}:${battalionName}:session-${session.id}`,
    });
  }

  /* =======================================================
     DELETE
  ======================================================= */

  async function deleteTraining(
    session:
      TrainingSession
  ) {
    if (
      readOnly ||
      session.status ===
        "completed"
    ) {
      return;
    }

    const {
      error,
    } =
      await supabase
        .from(
          "commandfit_training_sessions"
        )
        .delete()
        .eq(
          "id",
          session.id
        );

    if (error) {
      setMessage(
        `מחיקת האימון נכשלה: ${error.message}`
      );

      return;
    }

    const nextSessions =
      sessions.filter(
        (item) =>
          item.id !==
          session.id
      );

    setSessions(
      nextSessions
    );

    await updateWeekAlert(
      session.weekNumber,
      nextSessions
    );
  }

  /* =======================================================
     LOADING
  ======================================================= */

  if (loading) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-slate-100 flex items-center justify-center"
      >
        טוען תוכנית אימונים...
      </main>
    );
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-100 text-slate-900"
    >

      <header className="bg-slate-900 text-white px-4 sm:px-6 lg:px-8 py-6">

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">

          <div>

            <p className="text-slate-400 text-sm">
              גדוד{" "}
              {battalionName}
            </p>

            <h1 className="text-3xl font-black mt-1">
              תוכנית אימונים
            </h1>

            <p className="text-slate-300 mt-2">
              תכנון שבועי ומעקב ביצוע
            </p>

          </div>

          <Link
            href={`/battalions/${encodeURIComponent(
              battalionName
            )}`}
            className="bg-white/10 hover:bg-white/20 rounded-xl px-5 py-3 text-center"
          >
            חזרה לגדוד
          </Link>

        </div>

      </header>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">

        <NotificationsPanel
          battalion={
            battalionName
          }
          compact
        />

        <section className="bg-white rounded-3xl shadow-sm p-5 sm:p-6 mb-6">

          <h2 className="text-xl font-bold">
            מספר שבועות בקורס
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            הזן את מספר השבועות והמערכת תפתח את התוכנית אוטומטית.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-5">

            <input
              type="number"
              min={1}
              max={52}
              disabled={
                readOnly
              }
              value={
                weeksInput
              }
              onChange={(
                event
              ) =>
                setWeeksInput(
                  event.target.value
                )
              }
              className="border border-slate-300 rounded-xl px-4 py-3 text-xl font-bold sm:w-48"
            />

            {!readOnly && (
              <button
                type="button"
                onClick={
                  saveWeeks
                }
                className="bg-slate-900 text-white rounded-xl px-6 py-3 font-bold"
              >
                {totalWeeks > 0
                  ? "עדכון"
                  : "צור תוכנית"}
              </button>
            )}

          </div>

        </section>

        {message && (
          <div className="bg-blue-50 border border-blue-100 text-blue-800 rounded-2xl p-4 mb-6">
            {message}
          </div>
        )}

        {totalWeeks === 0 ? (

          <section className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center text-slate-400">
            טרם הוגדר מספר שבועות בקורס
          </section>

        ) : (

          <section className="space-y-5">

            {weeks.map(
              (
                weekNumber
              ) => {
                const weekSessions =
                  sessionsForWeek(
                    weekNumber
                  );

                const completed =
                  weekSessions.filter(
                    (session) =>
                      session.status ===
                      "completed"
                  ).length;

                const completion =
                  weekSessions.length > 0
                    ? Math.round(
                        completed /
                          weekSessions.length *
                          100
                      )
                    : 0;

                const exempt =
                  isExemptWeek(
                    weekNumber,
                    totalWeeks
                  );

                const lowTraining =
                  !exempt &&
                  weekSessions.length <
                    minimumTrainings;

                return (
                  <article
                    key={
                      weekNumber
                    }
                    id={`week-${weekNumber}`}
                    className={
                      lowTraining
                        ? "bg-red-50 border-2 border-red-300 rounded-3xl p-5 sm:p-6"
                        : "bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm"
                    }
                  >

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

                      <div>

                        <div className="flex items-center gap-3">

                          <h2 className="text-2xl font-black">
                            שבוע{" "}
                            {weekNumber}
                          </h2>

                          {lowTraining && (
                            <span className="bg-red-600 text-white text-xs font-bold rounded-lg px-3 py-1">
                              ⚠️ מעט אימונים
                            </span>
                          )}

                        </div>

                        <div className="flex flex-wrap gap-4 text-sm mt-2">

                          <span>
                            מתוכננים:{" "}
                            <strong>
                              {
                                weekSessions.length
                              }
                            </strong>
                          </span>

                          <span>
                            בוצעו:{" "}
                            <strong>
                              {
                                completed
                              }
                            </strong>
                          </span>

                          <span>
                            אחוז ביצוע:{" "}
                            <strong>
                              {
                                completion
                              }
                              %
                            </strong>
                          </span>

                        </div>

                        {lowTraining && (
                          <p className="text-red-700 font-bold text-sm mt-3">
                            נדרש מינימום של{" "}
                            {
                              minimumTrainings
                            }{" "}
                            אימונים בשבוע.
                          </p>
                        )}

                      </div>

                      {!readOnly && (
                        <div className="flex flex-col sm:flex-row gap-2">

                          <select
                            value={
                              selectedTraining[
                                weekNumber
                              ] ??
                              TRAINING_TYPES[0]
                            }
                            onChange={(
                              event
                            ) =>
                              setSelectedTraining(
                                (
                                  current
                                ) => ({
                                  ...current,

                                  [weekNumber]:
                                    event
                                      .target
                                      .value,
                                })
                              )
                            }
                            className="border border-slate-300 rounded-xl px-4 py-3 bg-white"
                          >

                            {TRAINING_TYPES.map(
                              (
                                type
                              ) => (
                                <option
                                  key={
                                    type
                                  }
                                  value={
                                    type
                                  }
                                >
                                  {
                                    type
                                  }
                                </option>
                              )
                            )}

                          </select>

                          <button
                            type="button"
                            onClick={() =>
                              addTraining(
                                weekNumber
                              )
                            }
                            className="bg-slate-900 text-white rounded-xl px-5 py-3 font-bold"
                          >
                            + הוסף אימון
                          </button>

                        </div>
                      )}

                    </div>

                    <div className="space-y-3 mt-5">

                      {weekSessions.length ===
                      0 ? (

                        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center text-slate-400">
                          טרם הוזנו אימונים
                        </div>

                      ) : (

                        weekSessions.map(
                          (
                            session
                          ) => (

                            <div
                              key={
                                session.id
                              }
                              className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                            >

                              <div>

                                <p className="font-bold text-lg">
                                  {
                                    session.trainingType
                                  }
                                </p>

                                <p
                                  className={
                                    session.status === "completed"
                                      ? "text-green-700 font-bold text-sm mt-1"
                                      : session.status === "not_completed"
                                      ? "text-red-700 font-bold text-sm mt-1"
                                      : "text-slate-400 text-sm mt-1"
                                  }
                                >
                                  {session.status === "completed"
                                    ? "✅ בוצע"
                                    : session.status === "not_completed"
                                    ? "❌ לא בוצע"
                                    : "טרם סומן"}
                                </p>

                              </div>

                              {!readOnly && (
                                <div className="flex flex-wrap gap-2">

                                  <button
                                    type="button"
                                    onClick={() =>
                                      setStatus(
                                        session,
                                        "completed"
                                      )
                                    }
                                    className={
                                      session.status === "completed"
                                        ? "bg-green-600 text-white rounded-xl px-4 py-2 font-bold"
                                        : "bg-green-50 border border-green-100 text-green-700 rounded-xl px-4 py-2 font-bold"
                                    }
                                  >
                                    ✅ בוצע
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      setStatus(
                                        session,
                                        "not_completed"
                                      )
                                    }
                                    className="bg-red-50 border border-red-100 text-red-700 rounded-xl px-4 py-2 font-bold"
                                  >
                                    ❌ לא בוצע
                                  </button>

                                  {session.status !== "completed" && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        deleteTraining(
                                          session
                                        )
                                      }
                                      className="bg-slate-100 text-slate-600 rounded-xl px-4 py-2 font-bold"
                                    >
                                      מחיקה
                                    </button>
                                  )}

                                </div>
                              )}

                            </div>

                          )
                        )

                      )}

                    </div>

                  </article>
                );
              }
            )}

          </section>

        )}

      </div>

    </main>
  );
}
