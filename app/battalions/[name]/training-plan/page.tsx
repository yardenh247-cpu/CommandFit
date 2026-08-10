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

type CompanyExecution = {
  id?: number;
  sessionId: number;
  company: string;
  status: TrainingStatus;
};

type CloudCompanyExecution = {
  id: number;
  session_id: number;
  company: string;
  status: TrainingStatus;
};

type CompanyOnlySession = {
  id: number;
  weekNumber: number;
  trainingType: string;
  company: string;
  status: TrainingStatus;
};

type CloudCompanyOnlySession = {
  id: number;
  week_number: number;
  training_type: string;
  company: string;
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

const COMPANY_COUNTS: Record<string, number> = {
  "דקל": 4,
  "רימון": 4,
  "גפן": 4,
  "דולב": 2,
  "חרוב": 4,
};

const COMPANY_NAMES = [
  "פלוגה א׳",
  "פלוגה ב׳",
  "פלוגה ג׳",
  "פלוגה ד׳",
  "פלוגה ה׳",
];

function getCompanies(
  battalion: string
) {
  return COMPANY_NAMES.slice(
    0,
    COMPANY_COUNTS[battalion] ?? 5
  );
}

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
    companyExecutions,
    setCompanyExecutions,
  ] =
    useState<
      CompanyExecution[]
    >([]);

  const [
    selectedScope,
    setSelectedScope,
  ] =
    useState("כלל הגדוד");

  const [
    showComparison,
    setShowComparison,
  ] =
    useState(false);

  const companies =
    useMemo(
      () =>
        getCompanies(
          battalionName
        ),
      [battalionName]
    );

  const [
    companyOnlySessions,
    setCompanyOnlySessions,
  ] =
    useState<
      CompanyOnlySession[]
    >([]);

  const [
    selectedCompanyTraining,
    setSelectedCompanyTraining,
  ] =
    useState<
      Record<number, string>
    >({});

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

  useEffect(() => {
    if (isViewer) {
      setSelectedScope(
        "כלל הגדוד"
      );
    }
  }, [isViewer]);

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

      const {
        data: executionData,
        error: executionError,
      } =
        await supabase
          .from(
            "commandfit_training_company_executions"
          )
          .select(
            "id,session_id,company,status"
          )
          .eq(
            "cycle_id",
            cycleId
          )
          .eq(
            "battalion",
            battalionName
          );

      if (executionError) {
        console.error(
          "Company executions load error:",
          executionError
        );
      } else {
        setCompanyExecutions(
          (
            (
              executionData ??
              []
            ) as CloudCompanyExecution[]
          ).map(
            (row) => ({
              id: row.id,
              sessionId:
                row.session_id,
              company:
                row.company,
              status:
                row.status ??
                "planned",
            })
          )
        );
      }

      const {
        data: companySessionData,
        error: companySessionError,
      } =
        await supabase
          .from(
            "commandfit_training_company_sessions"
          )
          .select(
            "id,week_number,training_type,company,status"
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

      if (companySessionError) {
        console.error(
          "Company-only sessions load error:",
          companySessionError
        );
      } else {
        setCompanyOnlySessions(
          (
            (
              companySessionData ??
              []
            ) as CloudCompanyOnlySession[]
          ).map(
            (row) => ({
              id: row.id,
              weekNumber:
                row.week_number,
              trainingType:
                row.training_type,
              company:
                row.company,
              status:
                row.status ??
                "planned",
            })
          )
        );
      }

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

  function getCompanyStatus(
    sessionId: number,
    company: string
  ): TrainingStatus {
    return (
      companyExecutions.find(
        (item) =>
          item.sessionId ===
            sessionId &&
          item.company ===
            company
      )?.status ??
      "planned"
    );
  }

  async function setCompanyStatus(
    session: TrainingSession,
    company: string,
    status: TrainingStatus
  ) {
    if (readOnly) {
      return;
    }

    const {
      data,
      error,
    } =
      await supabase
        .from(
          "commandfit_training_company_executions"
        )
        .upsert(
          {
            cycle_id:
              cycleId,
            battalion:
              battalionName,
            session_id:
              session.id,
            company,
            status,
            updated_at:
              new Date().toISOString(),
          },
          {
            onConflict:
              "session_id,company",
          }
        )
        .select(
          "id,session_id,company,status"
        )
        .single();

    if (error || !data) {
      setMessage(
        `עדכון ביצוע הפלוגה נכשל: ${
          error?.message ??
          "שגיאה"
        }`
      );
      return;
    }

    setCompanyExecutions(
      (current) => {
        const without =
          current.filter(
            (item) =>
              !(
                item.sessionId ===
                  session.id &&
                item.company ===
                  company
              )
          );

        return [
          ...without,
          {
            id: data.id,
            sessionId:
              data.session_id,
            company:
              data.company,
            status:
              data.status ??
              "planned",
          },
        ];
      }
    );

    setMessage(
      `${company}: ${session.trainingType} עודכן`
    );
  }

  const companySummary =
    useMemo(() => {
      return companies.map(
        (company) => {
          const completedSessions =
            sessions.filter(
              (session) =>
                getCompanyStatus(
                  session.id,
                  company
                ) ===
                "completed"
            );

          const companyExtras =
            companyOnlySessions.filter(
              (session) =>
                session.company ===
                  company
            );

          const completedExtras =
            companyExtras.filter(
              (session) =>
                session.status ===
                "completed"
            );

          const allCompletedTypes = [
            ...completedSessions.map(
              (session) =>
                session.trainingType
            ),
            ...completedExtras.map(
              (session) =>
                session.trainingType
            ),
          ];

          const byType =
            TRAINING_TYPES.map(
              (type) => ({
                type,
                count:
                  allCompletedTypes.filter(
                    (trainingType) =>
                      trainingType ===
                      type
                  ).length,
              })
            ).filter(
              (item) =>
                item.count > 0
            );

          const plannedTotal =
            sessions.length +
            companyExtras.length;

          return {
            company,
            total:
              completedSessions.length +
              completedExtras.length,
            planned:
              plannedTotal,
            completion:
              plannedTotal > 0
                ? Math.round(
                    (
                      completedSessions.length +
                      completedExtras.length
                    ) /
                      plannedTotal *
                      100
                  )
                : 0,
            byType,
          };
        }
      );
    }, [
      companies,
      companyExecutions,
      companyOnlySessions,
      sessions,
    ]);

  const trainingComparison =
    useMemo(() => {
      const active =
        companySummary.filter(
          (item) =>
            item.planned > 0
        );

      const leader =
        active.length > 0
          ? [...active].sort(
              (a, b) =>
                b.completion -
                a.completion
            )[0]
          : null;

      const lowest =
        active.length > 0
          ? [...active].sort(
              (a, b) =>
                a.completion -
                b.completion
            )[0]
          : null;

      const averageCompletion =
        active.length > 0
          ? Math.round(
              active.reduce(
                (sum, item) =>
                  sum +
                  item.completion,
                0
              ) /
                active.length
            )
          : 0;

      const typeRows =
        TRAINING_TYPES.map(
          (type) => ({
            type,
            counts:
              companySummary.map(
                (item) => ({
                  company:
                    item.company,
                  count:
                    item.byType.find(
                      (row) =>
                        row.type ===
                        type
                    )?.count ??
                    0,
                })
              ),
          })
        ).filter(
          (row) =>
            row.counts.some(
              (item) =>
                item.count > 0
            )
        );

      return {
        leader,
        lowest,
        averageCompletion,
        typeRows,
      };
    }, [
      companySummary,
    ]);

  const cycleTrainingSummary =
    useMemo(() => {
      const totalCompleted =
        companySummary.reduce(
          (sum, item) =>
            sum + item.total,
          0
        );

      const totalPlanned =
        companySummary.reduce(
          (sum, item) =>
            sum + item.planned,
          0
        );

      const overallCompletion =
        totalPlanned > 0
          ? Math.round(
              totalCompleted /
                totalPlanned *
                100
            )
          : 0;

      const totalByType =
        TRAINING_TYPES.map(
          (type) => ({
            type,
            count:
              companySummary.reduce(
                (sum, item) =>
                  sum +
                  (
                    item.byType.find(
                      (row) =>
                        row.type ===
                        type
                    )?.count ??
                    0
                  ),
                0
              ),
          })
        ).filter(
          (item) =>
            item.count > 0
        );

      const weekly =
        weeks.map(
          (weekNumber) => {
            const weekPlan =
              sessions.filter(
                (session) =>
                  session.weekNumber ===
                  weekNumber
              );

            const companyRows =
              companies.map(
                (company) => {
                  const completedFromPlan =
                    weekPlan.filter(
                      (session) =>
                        getCompanyStatus(
                          session.id,
                          company
                        ) ===
                        "completed"
                    ).length;

                  const extras =
                    companyOnlySessions.filter(
                      (session) =>
                        session.company ===
                          company &&
                        session.weekNumber ===
                          weekNumber
                    );

                  const completedExtras =
                    extras.filter(
                      (session) =>
                        session.status ===
                        "completed"
                    ).length;

                  const planned =
                    weekPlan.length +
                    extras.length;

                  const completed =
                    completedFromPlan +
                    completedExtras;

                  return {
                    company,
                    planned,
                    completed,
                    completion:
                      planned > 0
                        ? Math.round(
                            completed /
                              planned *
                              100
                          )
                        : 0,
                  };
                }
              );

            const activeRows =
              companyRows.filter(
                (item) =>
                  item.planned > 0
              );

            const averageCompletion =
              activeRows.length > 0
                ? Math.round(
                    activeRows.reduce(
                      (sum, item) =>
                        sum +
                        item.completion,
                      0
                    ) /
                      activeRows.length
                  )
                : 0;

            return {
              weekNumber,
              averageCompletion,
              companyRows,
            };
          }
        );

      return {
        totalCompleted,
        totalPlanned,
        overallCompletion,
        totalByType,
        weekly,
      };
    }, [
      companySummary,
      companies,
      companyExecutions,
      companyOnlySessions,
      sessions,
      weeks,
    ]);

  async function addCompanyOnlyTraining(
    weekNumber: number
  ) {
    if (
      readOnly ||
      selectedScope ===
        "כלל הגדוד"
    ) {
      return;
    }

    const trainingType =
      selectedCompanyTraining[
        weekNumber
      ] ??
      TRAINING_TYPES[0];

    const {
      data,
      error,
    } =
      await supabase
        .from(
          "commandfit_training_company_sessions"
        )
        .insert({
          cycle_id:
            cycleId,
          battalion:
            battalionName,
          company:
            selectedScope,
          week_number:
            weekNumber,
          training_type:
            trainingType,
          status:
            "planned",
        })
        .select(
          "id,week_number,training_type,company,status"
        )
        .single();

    if (error || !data) {
      setMessage(
        `הוספת אימון לפלוגה נכשלה: ${
          error?.message ??
          "שגיאה"
        }`
      );
      return;
    }

    setCompanyOnlySessions(
      (current) => [
        ...current,
        {
          id: data.id,
          weekNumber:
            data.week_number,
          trainingType:
            data.training_type,
          company:
            data.company,
          status:
            data.status ??
            "planned",
        },
      ]
    );

    setMessage(
      `${trainingType} נוסף ל${selectedScope} בלבד`
    );
  }

  async function setCompanyOnlyStatus(
    session: CompanyOnlySession,
    status: TrainingStatus
  ) {
    if (readOnly) {
      return;
    }

    const { error } =
      await supabase
        .from(
          "commandfit_training_company_sessions"
        )
        .update({
          status,
          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          session.id
        );

    if (error) {
      setMessage(
        `עדכון אימון פלוגתי נכשל: ${error.message}`
      );
      return;
    }

    setCompanyOnlySessions(
      (current) =>
        current.map(
          (item) =>
            item.id ===
            session.id
              ? {
                  ...item,
                  status,
                }
              : item
        )
    );
  }

  async function deleteCompanyOnlyTraining(
    session: CompanyOnlySession
  ) {
    if (readOnly) {
      return;
    }

    const approved =
      window.confirm(
        `למחוק את ${session.trainingType} מ${session.company}?`
      );

    if (!approved) {
      return;
    }

    const { error } =
      await supabase
        .from(
          "commandfit_training_company_sessions"
        )
        .delete()
        .eq(
          "id",
          session.id
        );

    if (error) {
      setMessage(
        `מחיקת אימון פלוגתי נכשלה: ${error.message}`
      );
      return;
    }

    setCompanyOnlySessions(
      (current) =>
        current.filter(
          (item) =>
            item.id !==
            session.id
        )
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

        {!isViewer && (
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
        )}

        {message && (
          <div className="bg-blue-50 border border-blue-100 text-blue-800 rounded-2xl p-4 mb-6">
            {message}
          </div>
        )}

        {totalWeeks > 0 && (
          <>
            {!isViewer && (
            <section className="bg-white rounded-3xl shadow-sm p-5 sm:p-6 mb-6">
              <h2 className="text-xl font-black">
                תצוגת תוכנית
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                {isViewer
                  ? "תצוגת מפקד – ניתן לצפות בהשוואת עומסי האימון בין הפלוגות."
                  : "התוכנית הגדודית היא תוכנית המקור. בכל פלוגה מסמנים בנפרד מה בוצע בפועל."}
              </p>

              {!isViewer && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {[
                    "כלל הגדוד",
                    ...companies,
                  ].map(
                    (scope) => (
                      <button
                        key={scope}
                        type="button"
                        onClick={() =>
                          setSelectedScope(
                            scope
                          )
                        }
                        className={
                          selectedScope ===
                          scope
                            ? "bg-slate-900 text-white rounded-xl px-4 py-2 font-bold"
                            : "bg-slate-100 text-slate-700 rounded-xl px-4 py-2 font-bold"
                        }
                      >
                        {scope}
                      </button>
                    )
                  )}
                </div>
              )}
            </section>
            )}

            <section className="bg-white rounded-3xl shadow-sm p-5 sm:p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black">
                    השוואת עומסי אימון
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    השוואת ביצוע בין הפלוגות לפי התוכנית הגדודית והאימונים הפלוגתיים הנוספים.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setShowComparison(
                      (current) =>
                        !current
                    )
                  }
                  className={
                    showComparison
                      ? "bg-blue-700 text-white rounded-xl px-5 py-3 font-black"
                      : "bg-blue-50 border border-blue-100 text-blue-700 rounded-xl px-5 py-3 font-black"
                  }
                >
                  {showComparison
                    ? "סגור השוואה"
                    : "📊 פתח השוואת פלוגות"}
                </button>
              </div>

              {showComparison && (
                <div className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-green-50 border border-green-100 rounded-2xl p-4">
                      <p className="text-sm font-bold text-green-700">
                        הפלוגה המובילה
                      </p>
                      <p className="text-2xl font-black mt-1">
                        {trainingComparison.leader?.company ?? "—"}
                      </p>
                      <p className="text-sm text-green-700 mt-1">
                        {trainingComparison.leader?.completion ?? 0}% ביצוע
                      </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4">
                      <p className="text-sm font-bold text-blue-700">
                        ממוצע ביצוע גדודי
                      </p>
                      <p className="text-2xl font-black mt-1">
                        {trainingComparison.averageCompletion}%
                      </p>
                    </div>

                    <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4">
                      <p className="text-sm font-bold text-amber-700">
                        דורשת תשומת לב
                      </p>
                      <p className="text-2xl font-black mt-1">
                        {trainingComparison.lowest?.company ?? "—"}
                      </p>
                      <p className="text-sm text-amber-700 mt-1">
                        {trainingComparison.lowest?.completion ?? 0}% ביצוע
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
                    <div className="bg-slate-950 text-white rounded-2xl p-4">
                      <p className="text-sm text-slate-300">
                        סה״כ אימונים שבוצעו במחזור
                      </p>
                      <p className="text-3xl font-black mt-1">
                        {cycleTrainingSummary.totalCompleted}
                      </p>
                    </div>

                    <div className="bg-slate-950 text-white rounded-2xl p-4">
                      <p className="text-sm text-slate-300">
                        סה״כ אימונים מתוכננים
                      </p>
                      <p className="text-3xl font-black mt-1">
                        {cycleTrainingSummary.totalPlanned}
                      </p>
                    </div>

                    <div className="bg-slate-950 text-white rounded-2xl p-4">
                      <p className="text-sm text-slate-300">
                        ביצוע כולל במחזור
                      </p>
                      <p className="text-3xl font-black mt-1">
                        {cycleTrainingSummary.overallCompletion}%
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto mt-6">
                    <table className="w-full min-w-[680px] text-right">
                      <thead className="bg-slate-50 text-slate-600 text-sm">
                        <tr>
                          <th className="p-3">פלוגה</th>
                          <th className="p-3">בוצעו</th>
                          <th className="p-3">מתוכננים</th>
                          <th className="p-3">אחוז ביצוע</th>
                          <th className="p-3">פער מהממוצע</th>
                        </tr>
                      </thead>
                      <tbody>
                        {companySummary.map(
                          (item) => {
                            const delta =
                              item.completion -
                              trainingComparison.averageCompletion;
                            return (
                              <tr
                                key={item.company}
                                className="border-t border-slate-100"
                              >
                                <td className="p-3 font-black">{item.company}</td>
                                <td className="p-3">{item.total}</td>
                                <td className="p-3">{item.planned}</td>
                                <td className="p-3 font-black">{item.completion}%</td>
                                <td className={
                                  delta > 0
                                    ? "p-3 font-bold text-green-700"
                                    : delta < 0
                                    ? "p-3 font-bold text-red-700"
                                    : "p-3 font-bold text-slate-500"
                                }>
                                  {delta > 0 ? "+" : ""}{delta}%
                                </td>
                              </tr>
                            );
                          }
                        )}
                      </tbody>
                    </table>
                  </div>

                  {trainingComparison.typeRows.length > 0 && (
                    <div className="mt-7">
                      <h3 className="text-lg font-black">
                        כמה מכל סוג אימון
                      </h3>
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 mt-4">
                        {trainingComparison.typeRows.map(
                          (row) => (
                            <div
                              key={row.type}
                              className="border border-slate-200 rounded-2xl p-4"
                            >
                              <p className="font-black">{row.type}</p>
                              <div className="space-y-2 mt-3">
                                {row.counts.map(
                                  (item) => (
                                    <div
                                      key={item.company}
                                      className="flex justify-between gap-3 bg-slate-50 rounded-xl px-3 py-2"
                                    >
                                      <span className="font-bold">{item.company}</span>
                                      <strong>{item.count}</strong>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {cycleTrainingSummary.totalByType.length > 0 && (
                    <div className="mt-8 border-t border-slate-100 pt-7">
                      <h3 className="text-lg font-black">
                        סיכום סוגי אימון – כלל המחזור
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">
                        מספר האימונים שבוצעו בפועל בכל הפלוגות יחד.
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mt-4">
                        {cycleTrainingSummary.totalByType.map(
                          (item) => (
                            <div
                              key={item.type}
                              className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between gap-3"
                            >
                              <span className="font-bold">
                                {item.type}
                              </span>
                              <span className="text-2xl font-black text-blue-700">
                                {item.count}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-8 border-t border-slate-100 pt-7">
                    <h3 className="text-lg font-black">
                      מגמת ביצוע לאורך המחזור
                    </h3>
                    <p className="text-sm text-slate-500 mt-1">
                      אחוז הביצוע הממוצע של הפלוגות בכל שבוע.
                    </p>

                    <div className="space-y-3 mt-4">
                      {cycleTrainingSummary.weekly.map(
                        (week) => (
                          <div
                            key={week.weekNumber}
                            className="border border-slate-200 rounded-2xl p-4"
                          >
                            <div className="flex items-center justify-between gap-3">
                              <span className="font-black">
                                שבוע {week.weekNumber}
                              </span>
                              <span className="font-black text-blue-700">
                                {week.averageCompletion}%
                              </span>
                            </div>

                            <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden mt-3">
                              <div
                                className="h-full bg-blue-600 rounded-full"
                                style={{
                                  width: `${Math.max(
                                    0,
                                    Math.min(
                                      100,
                                      week.averageCompletion
                                    )
                                  )}%`,
                                }}
                              />
                            </div>

                            <div className="grid grid-cols-2 lg:grid-cols-5 gap-2 mt-3">
                              {week.companyRows.map(
                                (item) => (
                                  <div
                                    key={item.company}
                                    className="bg-slate-50 rounded-xl px-3 py-2 text-sm"
                                  >
                                    <p className="font-bold">
                                      {item.company}
                                    </p>
                                    <p className="text-slate-500 mt-0.5">
                                      {item.completed}/{item.planned} • {item.completion}%
                                    </p>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              )}
            </section>

            {!isViewer && (
            <section className="bg-white rounded-3xl shadow-sm p-5 sm:p-6 mb-6">
              <h2 className="text-xl font-black">
                סיכום ביצוע לפי פלוגות
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-5">
                {companySummary.map(
                  (item) => (
                    <div
                      key={
                        item.company
                      }
                      className="border border-slate-200 rounded-2xl p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="font-black text-lg">
                          {item.company}
                        </h3>
                        <span className="bg-blue-50 text-blue-700 rounded-lg px-2 py-1 text-sm font-bold">
                          {item.completion}%
                        </span>
                      </div>

                      <p className="mt-2 text-sm">
                        בוצעו{" "}
                        <strong>
                          {item.total}
                        </strong>{" "}
                        מתוך{" "}
                        <strong>
                          {item.planned}
                        </strong>{" "}
                        אימונים מתוכננים
                      </p>

                      <div className="mt-3 space-y-1 text-sm text-slate-600">
                        {item.byType.length >
                        0 ? (
                          item.byType.map(
                            (row) => (
                              <div
                                key={
                                  row.type
                                }
                                className="flex justify-between gap-3"
                              >
                                <span>
                                  {row.type}
                                </span>
                                <strong>
                                  {row.count}
                                </strong>
                              </div>
                            )
                          )
                        ) : (
                          <span className="text-slate-400">
                            טרם סומנו אימונים שבוצעו
                          </span>
                        )}
                      </div>
                    </div>
                  )
                )}
              </div>
            </section>
            )}
          </>
        )}

        {totalWeeks === 0 ? (

          <section className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center text-slate-400">
            טרם הוגדר מספר שבועות בקורס
          </section>

        ) : isViewer ? null : (

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
                      selectedScope ===
                      "כלל הגדוד"
                        ? session.status ===
                          "completed"
                        : getCompanyStatus(
                            session.id,
                            selectedScope
                          ) ===
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

                      {!readOnly &&
                      selectedScope ===
                        "כלל הגדוד" && (
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
                              className="bg-white border border-slate-200 rounded-2xl p-4"
                            >
                              {(() => {
                                const visibleStatus =
                                  selectedScope ===
                                  "כלל הגדוד"
                                    ? session.status
                                    : getCompanyStatus(
                                        session.id,
                                        selectedScope
                                      );

                                const updateStatus = (
                                  status: TrainingStatus
                                ) =>
                                  selectedScope ===
                                  "כלל הגדוד"
                                    ? setStatus(
                                        session,
                                        status
                                      )
                                    : setCompanyStatus(
                                        session,
                                        selectedScope,
                                        status
                                      );

                                return (
                                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                    <div className="min-w-0">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <p className="font-bold text-lg">
                                          {session.trainingType}
                                        </p>

                                        <span
                                          className={
                                            visibleStatus ===
                                            "completed"
                                              ? "bg-green-100 text-green-800 border border-green-200 rounded-lg px-2.5 py-1 text-xs font-black"
                                              : visibleStatus ===
                                                "not_completed"
                                              ? "bg-red-100 text-red-800 border border-red-200 rounded-lg px-2.5 py-1 text-xs font-black"
                                              : "bg-slate-100 text-slate-500 border border-slate-200 rounded-lg px-2.5 py-1 text-xs font-bold"
                                          }
                                        >
                                          {visibleStatus ===
                                          "completed"
                                            ? "✅ בוצע"
                                            : visibleStatus ===
                                              "not_completed"
                                            ? "❌ לא בוצע"
                                            : "◯ טרם סומן"}
                                        </span>
                                      </div>

                                      {selectedScope !==
                                        "כלל הגדוד" && (
                                        <p className="text-xs text-slate-400 mt-1">
                                          סימון ביצוע עבור{" "}
                                          <strong>
                                            {selectedScope}
                                          </strong>
                                        </p>
                                      )}
                                    </div>

                                    {!readOnly && (
                                      <div className="flex flex-wrap items-center gap-2">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            updateStatus(
                                              "completed"
                                            )
                                          }
                                          aria-pressed={
                                            visibleStatus ===
                                            "completed"
                                          }
                                          className={
                                            visibleStatus ===
                                            "completed"
                                              ? "bg-green-600 border border-green-600 text-white shadow-sm ring-2 ring-green-200 rounded-xl px-4 py-2 font-black transition"
                                              : "bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 rounded-xl px-4 py-2 font-bold transition"
                                          }
                                        >
                                          {visibleStatus ===
                                          "completed"
                                            ? "✅ בוצע — מסומן"
                                            : "✅ בוצע"}
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() =>
                                            updateStatus(
                                              "not_completed"
                                            )
                                          }
                                          aria-pressed={
                                            visibleStatus ===
                                            "not_completed"
                                          }
                                          className={
                                            visibleStatus ===
                                            "not_completed"
                                              ? "bg-red-600 border border-red-600 text-white shadow-sm ring-2 ring-red-200 rounded-xl px-4 py-2 font-black transition"
                                              : "bg-red-50 border border-red-200 text-red-700 hover:bg-red-100 rounded-xl px-4 py-2 font-bold transition"
                                          }
                                        >
                                          {visibleStatus ===
                                          "not_completed"
                                            ? "❌ לא בוצע — מסומן"
                                            : "❌ לא בוצע"}
                                        </button>

                                        {visibleStatus !==
                                          "planned" && (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              updateStatus(
                                                "planned"
                                              )
                                            }
                                            className="bg-slate-50 border border-slate-200 text-slate-600 hover:bg-slate-100 rounded-xl px-4 py-2 font-bold transition"
                                          >
                                            ↩️ איפוס סימון
                                          </button>
                                        )}

                                        {selectedScope ===
                                          "כלל הגדוד" &&
                                          session.status !==
                                            "completed" && (
                                            <button
                                              type="button"
                                              onClick={() =>
                                                deleteTraining(
                                                  session
                                                )
                                              }
                                              className="bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-xl px-4 py-2 font-bold transition"
                                            >
                                              מחיקה
                                            </button>
                                          )}
                                      </div>
                                    )}
                                  </div>
                                );
                              })()}
                            </div>

                          )
                        )

                      )}

                    </div>

                    {selectedScope !==
                      "כלל הגדוד" && (
                      <div className="mt-5 border-t border-slate-200 pt-5">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                          <div>
                            <h3 className="font-black text-lg">
                              אימונים נוספים ל{selectedScope}
                            </h3>
                            <p className="text-sm text-slate-500 mt-1">
                              אימונים שלא מופיעים בתוכנית הגדודית ונוספו לפלוגה בלבד.
                            </p>
                          </div>

                          {!readOnly && (
                            <div className="flex flex-col sm:flex-row gap-2">
                              <select
                                value={
                                  selectedCompanyTraining[
                                    weekNumber
                                  ] ??
                                  TRAINING_TYPES[0]
                                }
                                onChange={(
                                  event
                                ) =>
                                  setSelectedCompanyTraining(
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
                                  (type) => (
                                    <option
                                      key={type}
                                      value={type}
                                    >
                                      {type}
                                    </option>
                                  )
                                )}
                              </select>

                              <button
                                type="button"
                                onClick={() =>
                                  addCompanyOnlyTraining(
                                    weekNumber
                                  )
                                }
                                className="bg-blue-700 hover:bg-blue-600 text-white rounded-xl px-5 py-3 font-black"
                              >
                                + אימון לפלוגה בלבד
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="space-y-3 mt-4">
                          {companyOnlySessions.filter(
                            (session) =>
                              session.company ===
                                selectedScope &&
                              session.weekNumber ===
                                weekNumber
                          ).length === 0 ? (
                            <div className="border-2 border-dashed border-blue-100 bg-blue-50/40 rounded-2xl p-5 text-center text-slate-400">
                              אין אימונים נוספים לפלוגה בשבוע זה
                            </div>
                          ) : (
                            companyOnlySessions
                              .filter(
                                (session) =>
                                  session.company ===
                                    selectedScope &&
                                  session.weekNumber ===
                                    weekNumber
                              )
                              .map(
                                (session) => (
                                  <div
                                    key={
                                      `company-${session.id}`
                                    }
                                    className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                                  >
                                    <div>
                                      <div className="flex flex-wrap items-center gap-2">
                                        <p className="font-bold text-lg">
                                          {session.trainingType}
                                        </p>
                                        <span className="bg-blue-100 text-blue-800 rounded-lg px-2 py-1 text-xs font-black">
                                          פלוגתי בלבד
                                        </span>
                                        <span
                                          className={
                                            session.status ===
                                            "completed"
                                              ? "bg-green-100 text-green-800 rounded-lg px-2 py-1 text-xs font-black"
                                              : session.status ===
                                                "not_completed"
                                              ? "bg-red-100 text-red-800 rounded-lg px-2 py-1 text-xs font-black"
                                              : "bg-slate-100 text-slate-600 rounded-lg px-2 py-1 text-xs font-bold"
                                          }
                                        >
                                          {session.status ===
                                          "completed"
                                            ? "✅ בוצע"
                                            : session.status ===
                                              "not_completed"
                                            ? "❌ לא בוצע"
                                            : "◯ טרם סומן"}
                                        </span>
                                      </div>
                                    </div>

                                    {!readOnly && (
                                      <div className="flex flex-wrap gap-2">
                                        <button
                                          type="button"
                                          onClick={() =>
                                            setCompanyOnlyStatus(
                                              session,
                                              "completed"
                                            )
                                          }
                                          className={
                                            session.status ===
                                            "completed"
                                              ? "bg-green-600 text-white ring-2 ring-green-200 rounded-xl px-4 py-2 font-black"
                                              : "bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-2 font-bold"
                                          }
                                        >
                                          ✅ בוצע
                                        </button>

                                        <button
                                          type="button"
                                          onClick={() =>
                                            setCompanyOnlyStatus(
                                              session,
                                              "not_completed"
                                            )
                                          }
                                          className={
                                            session.status ===
                                            "not_completed"
                                              ? "bg-red-600 text-white ring-2 ring-red-200 rounded-xl px-4 py-2 font-black"
                                              : "bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-2 font-bold"
                                          }
                                        >
                                          ❌ לא בוצע
                                        </button>

                                        {session.status !==
                                          "planned" && (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setCompanyOnlyStatus(
                                                session,
                                                "planned"
                                              )
                                            }
                                            className="bg-white border border-slate-200 text-slate-600 rounded-xl px-4 py-2 font-bold"
                                          >
                                            ↩️ איפוס
                                          </button>
                                        )}

                                        <button
                                          type="button"
                                          onClick={() =>
                                            deleteCompanyOnlyTraining(
                                              session
                                            )
                                          }
                                          className="bg-slate-100 text-slate-600 rounded-xl px-4 py-2 font-bold"
                                        >
                                          מחיקה
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                )
                              )
                          )}
                        </div>
                      </div>
                    )}

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