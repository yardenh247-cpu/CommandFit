(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/battalions/[name]/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TrainingPlanPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$cycles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/cycles.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$use$2d$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/use-auth.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$notifications$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/notifications.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$components$2f$NotificationsPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/components/NotificationsPanel.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
;
;
/* =========================================================
   CONFIG
========================================================= */ const FIGHTER_BATTALIONS = new Set([
    "דקל",
    "רימון",
    "הדס",
    "דולב",
    "גפן"
]);
const COMPANY_COUNTS = {
    "דקל": 4,
    "רימון": 4,
    "גפן": 4,
    "דולב": 2,
    "חרוב": 4,
    "הדס": 5,
    "ארז": 5,
    "ברוש": 5,
    "אלון": 5
};
const COMPANY_NAMES = [
    "פלוגה א׳",
    "פלוגה ב׳",
    "פלוגה ג׳",
    "פלוגה ד׳",
    "פלוגה ה׳"
];
function getCompanies(battalion) {
    return COMPANY_NAMES.slice(0, COMPANY_COUNTS[battalion] ?? 5);
}
function companyScopeLabel(companies) {
    return companies.length ? companies.join(" • ") : "כלל הגדוד";
}
const TRAINING_TYPES = [
    "אימון ריצה",
    "כוח מארז 2",
    "כוח מארז 3",
    "ריצת וסט",
    "אימון שחייה",
    'בוחן כש"ג כוח',
    'בוחן כש"ג ריצה',
    "לורן",
    "לורן משופר"
];
/* =========================================================
   HELPERS
========================================================= */ function getMinimumTrainings(battalion) {
    return FIGHTER_BATTALIONS.has(battalion) ? 4 : 2;
}
function isExemptWeek(weekNumber, totalWeeks) {
    return weekNumber === 1 || weekNumber === totalWeeks;
}
function TrainingPlanPage() {
    _s();
    const params = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"])();
    const battalionName = decodeURIComponent(params.name);
    const { isAdmin, isViewer } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$use$2d$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const activeCycle = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$cycles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getActiveCycle"])(battalionName);
    const cycleId = activeCycle?.id ?? `legacy-${battalionName}`;
    const [totalWeeks, setTotalWeeks] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [weeksInput, setWeeksInput] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("12");
    const [sessions, setSessions] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [selectedTraining, setSelectedTraining] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const [selectedCompanies, setSelectedCompanies] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({});
    const companies = getCompanies(battalionName);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [message, setMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const readOnly = isViewer || !isAdmin;
    const minimumTrainings = getMinimumTrainings(battalionName);
    /* =======================================================
     LOAD
  ======================================================= */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TrainingPlanPage.useEffect": ()=>{
            let cancelled = false;
            async function load() {
                setLoading(true);
                const { data: planData, error: planError } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("commandfit_training_plans").select("total_weeks").eq("cycle_id", cycleId).eq("battalion", battalionName).maybeSingle();
                if (cancelled) {
                    return;
                }
                if (planError) {
                    console.error("Training plan load error:", planError);
                }
                const loadedWeeks = Number(planData?.total_weeks ?? 0);
                setTotalWeeks(loadedWeeks);
                if (loadedWeeks > 0) {
                    setWeeksInput(String(loadedWeeks));
                }
                const { data: sessionData, error: sessionError } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("commandfit_training_sessions").select(`
              id,
              week_number,
              training_type,
              status,
              companies
            `).eq("cycle_id", cycleId).eq("battalion", battalionName).order("week_number", {
                    ascending: true
                }).order("id", {
                    ascending: true
                });
                if (cancelled) {
                    return;
                }
                if (sessionError) {
                    console.error("Training sessions load error:", sessionError);
                    setMessage("לא ניתן היה לטעון את תוכנית האימונים");
                    setLoading(false);
                    return;
                }
                setSessions((sessionData ?? []).map({
                    "TrainingPlanPage.useEffect.load": (row)=>({
                            id: row.id,
                            weekNumber: row.week_number,
                            trainingType: row.training_type,
                            status: row.status ?? "planned",
                            companies: row.companies ?? []
                        })
                }["TrainingPlanPage.useEffect.load"]));
                setLoading(false);
            }
            load();
            return ({
                "TrainingPlanPage.useEffect": ()=>{
                    cancelled = true;
                }
            })["TrainingPlanPage.useEffect"];
        }
    }["TrainingPlanPage.useEffect"], [
        battalionName,
        cycleId
    ]);
    /* =======================================================
     WEEKS
  ======================================================= */ const weeks = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "TrainingPlanPage.useMemo[weeks]": ()=>Array.from({
                length: totalWeeks
            }, {
                "TrainingPlanPage.useMemo[weeks]": (_, index)=>index + 1
            }["TrainingPlanPage.useMemo[weeks]"])
    }["TrainingPlanPage.useMemo[weeks]"], [
        totalWeeks
    ]);
    function sessionsForWeek(weekNumber) {
        return sessions.filter((session)=>session.weekNumber === weekNumber);
    }
    /* =======================================================
     ALERT CHECK
  ======================================================= */ async function updateWeekAlert(weekNumber, nextSessions) {
        if (totalWeeks <= 0) {
            return;
        }
        const alertKey = `low-training:${cycleId}:${battalionName}:week-${weekNumber}`;
        if (isExemptWeek(weekNumber, totalWeeks)) {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$notifications$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clearNotification"])(alertKey);
            return;
        }
        const amount = nextSessions.filter((session)=>session.weekNumber === weekNumber).length;
        if (amount < minimumTrainings) {
            await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$notifications$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["publishNotification"])({
                cycleId,
                battalion: battalionName,
                eventType: "low_training_load",
                severity: "warning",
                title: `גדוד ${battalionName} – שבוע ${weekNumber}`,
                message: `קיימים ${amount} אימונים בלבד בשבוע זה. מומלץ לבדוק את תוכנית האימונים.`,
                href: `/battalions/${encodeURIComponent(battalionName)}/training-plan#week-${weekNumber}`,
                dedupeKey: alertKey
            });
            return;
        }
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$notifications$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clearNotification"])(alertKey);
    }
    /* =======================================================
     CREATE / UPDATE PLAN
  ======================================================= */ async function saveWeeks() {
        if (readOnly) {
            return;
        }
        const amount = Math.round(Number(weeksInput));
        if (!Number.isFinite(amount) || amount < 1 || amount > 52) {
            setMessage("יש להזין מספר שבועות בין 1 ל־52");
            return;
        }
        const hasSessionsAbove = sessions.some((session)=>session.weekNumber > amount);
        if (hasSessionsAbove) {
            setMessage("לא ניתן לקצר את מספר השבועות כל עוד קיימים אימונים בשבועות שמעל המספר החדש");
            return;
        }
        const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("commandfit_training_plans").upsert({
            cycle_id: cycleId,
            battalion: battalionName,
            total_weeks: amount,
            updated_at: new Date().toISOString()
        }, {
            onConflict: "cycle_id,battalion"
        });
        if (error) {
            setMessage(`שמירת התוכנית נכשלה: ${error.message}`);
            return;
        }
        setTotalWeeks(amount);
        setMessage("מספר השבועות נשמר בהצלחה");
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$notifications$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["publishNotification"])({
            cycleId,
            battalion: battalionName,
            eventType: "training_update",
            severity: "info",
            title: `עודכנה תוכנית האימונים – גדוד ${battalionName}`,
            message: "מבנה תוכנית האימונים עודכן.",
            href: `/battalions/${encodeURIComponent(battalionName)}/training-plan`,
            dedupeKey: `training-plan:${cycleId}:${battalionName}`
        });
    }
    /* =======================================================
     ADD TRAINING
  ======================================================= */ async function addTraining(weekNumber) {
        if (readOnly) {
            return;
        }
        const trainingType = selectedTraining[weekNumber] ?? TRAINING_TYPES[0];
        const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("commandfit_training_sessions").insert({
            cycle_id: cycleId,
            battalion: battalionName,
            week_number: weekNumber,
            training_type: trainingType,
            status: "planned",
            companies: selectedCompanies[weekNumber] ?? []
        }).select(`
            id,
            week_number,
            training_type,
            status,
            companies
          `).single();
        if (error || !data) {
            setMessage(`הוספת האימון נכשלה: ${error?.message ?? "שגיאה"}`);
            return;
        }
        const newTraining = {
            id: data.id,
            weekNumber: data.week_number,
            trainingType: data.training_type,
            status: data.status ?? "planned",
            companies: data.companies ?? []
        };
        const nextSessions = [
            ...sessions,
            newTraining
        ];
        setSessions(nextSessions);
        setMessage(`האימון נוסף לשבוע ${weekNumber}`);
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$notifications$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["publishNotification"])({
            cycleId,
            battalion: battalionName,
            eventType: "training_update",
            severity: "info",
            title: `גדוד ${battalionName} – שבוע ${weekNumber}`,
            message: `נוסף ${trainingType} לתוכנית האימונים.`,
            href: `/battalions/${encodeURIComponent(battalionName)}/training-plan#week-${weekNumber}`,
            dedupeKey: `training-update:${cycleId}:${battalionName}:week-${weekNumber}`
        });
        await updateWeekAlert(weekNumber, nextSessions);
    }
    /* =======================================================
     COMPLETE
  ======================================================= */ async function setStatus(session, status) {
        if (readOnly) {
            return;
        }
        const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("commandfit_training_sessions").update({
            status,
            updated_at: new Date().toISOString()
        }).eq("id", session.id);
        if (error) {
            setMessage(`עדכון האימון נכשל: ${error.message}`);
            return;
        }
        setSessions((current)=>current.map((item)=>item.id === session.id ? {
                    ...item,
                    status
                } : item));
        const statusText = status === "completed" ? "בוצע" : status === "not_completed" ? "לא בוצע" : "טרם סומן";
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$notifications$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["publishNotification"])({
            cycleId,
            battalion: battalionName,
            eventType: "training_update",
            severity: status === "completed" ? "success" : status === "not_completed" ? "warning" : "info",
            title: `גדוד ${battalionName} – שבוע ${session.weekNumber}`,
            message: `${session.trainingType} סומן כ־${statusText}.`,
            href: `/battalions/${encodeURIComponent(battalionName)}/training-plan#week-${session.weekNumber}`,
            dedupeKey: `training-status:${cycleId}:${battalionName}:session-${session.id}`
        });
    }
    /* =======================================================
     DELETE
  ======================================================= */ async function deleteTraining(session) {
        if (readOnly || session.status === "completed") {
            return;
        }
        const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("commandfit_training_sessions").delete().eq("id", session.id);
        if (error) {
            setMessage(`מחיקת האימון נכשלה: ${error.message}`);
            return;
        }
        const nextSessions = sessions.filter((item)=>item.id !== session.id);
        setSessions(nextSessions);
        await updateWeekAlert(session.weekNumber, nextSessions);
    }
    /* =======================================================
     LOADING
  ======================================================= */ if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
            dir: "rtl",
            className: "min-h-screen bg-slate-100 flex items-center justify-center",
            children: "טוען תוכנית אימונים..."
        }, void 0, false, {
            fileName: "[project]/app/battalions/[name]/page.tsx",
            lineNumber: 847,
            columnNumber: 7
        }, this);
    }
    /* =======================================================
     UI
  ======================================================= */ return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        dir: "rtl",
        className: "min-h-screen bg-slate-100 text-slate-900",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "bg-slate-900 text-white px-4 sm:px-6 lg:px-8 py-6",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-slate-400 text-sm",
                                    children: [
                                        "גדוד",
                                        " ",
                                        battalionName
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/battalions/[name]/page.tsx",
                                    lineNumber: 872,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                    className: "text-3xl font-black mt-1",
                                    children: "תוכנית אימונים"
                                }, void 0, false, {
                                    fileName: "[project]/app/battalions/[name]/page.tsx",
                                    lineNumber: 877,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-slate-300 mt-2",
                                    children: "תכנון שבועי ומעקב ביצוע"
                                }, void 0, false, {
                                    fileName: "[project]/app/battalions/[name]/page.tsx",
                                    lineNumber: 881,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/battalions/[name]/page.tsx",
                            lineNumber: 870,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            href: `/battalions/${encodeURIComponent(battalionName)}`,
                            className: "bg-white/10 hover:bg-white/20 rounded-xl px-5 py-3 text-center",
                            children: "חזרה לגדוד"
                        }, void 0, false, {
                            fileName: "[project]/app/battalions/[name]/page.tsx",
                            lineNumber: 887,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/battalions/[name]/page.tsx",
                    lineNumber: 868,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/battalions/[name]/page.tsx",
                lineNumber: 866,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "max-w-7xl mx-auto p-4 sm:p-6 lg:p-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$NotificationsPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        battalion: battalionName,
                        compact: true
                    }, void 0, false, {
                        fileName: "[project]/app/battalions/[name]/page.tsx",
                        lineNumber: 902,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "bg-white rounded-3xl shadow-sm p-5 sm:p-6 mb-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-xl font-bold",
                                children: "מספר שבועות בקורס"
                            }, void 0, false, {
                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                lineNumber: 911,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-slate-500 mt-1",
                                children: "הזן את מספר השבועות והמערכת תפתח את התוכנית אוטומטית."
                            }, void 0, false, {
                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                lineNumber: 915,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col sm:flex-row gap-3 mt-5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                        type: "number",
                                        min: 1,
                                        max: 52,
                                        disabled: readOnly,
                                        value: weeksInput,
                                        onChange: (event)=>setWeeksInput(event.target.value),
                                        className: "border border-slate-300 rounded-xl px-4 py-3 text-xl font-bold sm:w-48"
                                    }, void 0, false, {
                                        fileName: "[project]/app/battalions/[name]/page.tsx",
                                        lineNumber: 921,
                                        columnNumber: 13
                                    }, this),
                                    !readOnly && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: saveWeeks,
                                        className: "bg-slate-900 text-white rounded-xl px-6 py-3 font-bold",
                                        children: totalWeeks > 0 ? "עדכון" : "צור תוכנית"
                                    }, void 0, false, {
                                        fileName: "[project]/app/battalions/[name]/page.tsx",
                                        lineNumber: 942,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                lineNumber: 919,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/battalions/[name]/page.tsx",
                        lineNumber: 909,
                        columnNumber: 9
                    }, this),
                    message && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "bg-blue-50 border border-blue-100 text-blue-800 rounded-2xl p-4 mb-6",
                        children: message
                    }, void 0, false, {
                        fileName: "[project]/app/battalions/[name]/page.tsx",
                        lineNumber: 960,
                        columnNumber: 11
                    }, this),
                    totalWeeks === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "bg-white border-2 border-dashed border-slate-200 rounded-3xl p-10 text-center text-slate-400",
                        children: "טרם הוגדר מספר שבועות בקורס"
                    }, void 0, false, {
                        fileName: "[project]/app/battalions/[name]/page.tsx",
                        lineNumber: 967,
                        columnNumber: 11
                    }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "space-y-5",
                        children: weeks.map((weekNumber)=>{
                            const weekSessions = sessionsForWeek(weekNumber);
                            const completed = weekSessions.filter((session)=>session.status === "completed").length;
                            const completion = weekSessions.length > 0 ? Math.round(completed / weekSessions.length * 100) : 0;
                            const exempt = isExemptWeek(weekNumber, totalWeeks);
                            const lowTraining = !exempt && weekSessions.length < minimumTrainings;
                            return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("article", {
                                id: `week-${weekNumber}`,
                                className: lowTraining ? "bg-red-50 border-2 border-red-300 rounded-3xl p-5 sm:p-6" : "bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-sm",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-col lg:flex-row lg:items-center justify-between gap-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex items-center gap-3",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                                className: "text-2xl font-black",
                                                                children: [
                                                                    "שבוע",
                                                                    " ",
                                                                    weekNumber
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                                                lineNumber: 1030,
                                                                columnNumber: 27
                                                            }, this),
                                                            lowTraining && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                className: "bg-red-600 text-white text-xs font-bold rounded-lg px-3 py-1",
                                                                children: "⚠️ מעט אימונים"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                                                lineNumber: 1036,
                                                                columnNumber: 29
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/battalions/[name]/page.tsx",
                                                        lineNumber: 1028,
                                                        columnNumber: 25
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex flex-wrap gap-4 text-sm mt-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                children: [
                                                                    "מתוכננים:",
                                                                    " ",
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                        children: weekSessions.length
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/battalions/[name]/page.tsx",
                                                                        lineNumber: 1047,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                                                lineNumber: 1045,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                children: [
                                                                    "בוצעו:",
                                                                    " ",
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                        children: completed
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/battalions/[name]/page.tsx",
                                                                        lineNumber: 1056,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                                                lineNumber: 1054,
                                                                columnNumber: 27
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                children: [
                                                                    "אחוז ביצוע:",
                                                                    " ",
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                        children: [
                                                                            completion,
                                                                            "%"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/battalions/[name]/page.tsx",
                                                                        lineNumber: 1065,
                                                                        columnNumber: 29
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                                                lineNumber: 1063,
                                                                columnNumber: 27
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/battalions/[name]/page.tsx",
                                                        lineNumber: 1043,
                                                        columnNumber: 25
                                                    }, this),
                                                    lowTraining && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-red-700 font-bold text-sm mt-3",
                                                        children: [
                                                            "נדרש מינימום של",
                                                            " ",
                                                            minimumTrainings,
                                                            " ",
                                                            "אימונים בשבוע."
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/battalions/[name]/page.tsx",
                                                        lineNumber: 1076,
                                                        columnNumber: 27
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                                lineNumber: 1026,
                                                columnNumber: 23
                                            }, this),
                                            !readOnly && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex flex-col sm:flex-row gap-2",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                        value: selectedTraining[weekNumber] ?? TRAINING_TYPES[0],
                                                        onChange: (event)=>setSelectedTraining((current)=>({
                                                                    ...current,
                                                                    [weekNumber]: event.target.value
                                                                })),
                                                        className: "border border-slate-300 rounded-xl px-4 py-3 bg-white",
                                                        children: TRAINING_TYPES.map((type)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                                value: type,
                                                                children: type
                                                            }, type, false, {
                                                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                                                lineNumber: 1120,
                                                                columnNumber: 33
                                                            }, this))
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/battalions/[name]/page.tsx",
                                                        lineNumber: 1090,
                                                        columnNumber: 27
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex flex-wrap items-center gap-2 border border-slate-200 bg-slate-50 rounded-xl p-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                type: "button",
                                                                onClick: ()=>setSelectedCompanies((current)=>({
                                                                            ...current,
                                                                            [weekNumber]: []
                                                                        })),
                                                                className: (selectedCompanies[weekNumber] ?? []).length === 0 ? "bg-slate-900 text-white rounded-lg px-3 py-2 text-sm font-bold" : "bg-white border border-slate-200 text-slate-700 rounded-lg px-3 py-2 text-sm font-bold",
                                                                children: "כלל הגדוד"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                                                lineNumber: 1138,
                                                                columnNumber: 29
                                                            }, this),
                                                            companies.map((company)=>{
                                                                const selected = (selectedCompanies[weekNumber] ?? []).includes(company);
                                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                    type: "button",
                                                                    onClick: ()=>setSelectedCompanies((current)=>{
                                                                            const existing = current[weekNumber] ?? [];
                                                                            return {
                                                                                ...current,
                                                                                [weekNumber]: selected ? existing.filter((item)=>item !== company) : [
                                                                                    ...existing,
                                                                                    company
                                                                                ]
                                                                            };
                                                                        }),
                                                                    className: selected ? "bg-blue-700 text-white rounded-lg px-3 py-2 text-sm font-bold" : "bg-white border border-blue-200 text-blue-800 rounded-lg px-3 py-2 text-sm font-bold hover:bg-blue-50",
                                                                    children: company
                                                                }, company, false, {
                                                                    fileName: "[project]/app/battalions/[name]/page.tsx",
                                                                    lineNumber: 1158,
                                                                    columnNumber: 33
                                                                }, this);
                                                            })
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/battalions/[name]/page.tsx",
                                                        lineNumber: 1137,
                                                        columnNumber: 27
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                        type: "button",
                                                        onClick: ()=>addTraining(weekNumber),
                                                        className: "bg-slate-900 text-white rounded-xl px-5 py-3 font-bold",
                                                        children: "+ הוסף אימון"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/battalions/[name]/page.tsx",
                                                        lineNumber: 1182,
                                                        columnNumber: 27
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                                lineNumber: 1088,
                                                columnNumber: 25
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/battalions/[name]/page.tsx",
                                        lineNumber: 1024,
                                        columnNumber: 21
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-3 mt-5",
                                        children: weekSessions.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center text-slate-400",
                                            children: "טרם הוזנו אימונים"
                                        }, void 0, false, {
                                            fileName: "[project]/app/battalions/[name]/page.tsx",
                                            lineNumber: 1204,
                                            columnNumber: 25
                                        }, this) : weekSessions.map((session)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "font-bold text-lg",
                                                                children: session.trainingType
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                                                lineNumber: 1224,
                                                                columnNumber: 33
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-sm font-bold text-blue-700 mt-1",
                                                                children: companyScopeLabel(session.companies)
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                                                lineNumber: 1230,
                                                                columnNumber: 33
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: session.status === "completed" ? "text-green-700 font-bold text-sm mt-1" : session.status === "not_completed" ? "text-red-700 font-bold text-sm mt-1" : "text-slate-400 text-sm mt-1",
                                                                children: session.status === "completed" ? "✅ בוצע" : session.status === "not_completed" ? "❌ לא בוצע" : "טרם סומן"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                                                lineNumber: 1234,
                                                                columnNumber: 33
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/battalions/[name]/page.tsx",
                                                        lineNumber: 1222,
                                                        columnNumber: 31
                                                    }, this),
                                                    !readOnly && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "flex flex-wrap gap-2",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                type: "button",
                                                                onClick: ()=>setStatus(session, "completed"),
                                                                className: session.status === "completed" ? "bg-green-600 text-white rounded-xl px-4 py-2 font-bold" : "bg-green-50 border border-green-100 text-green-700 rounded-xl px-4 py-2 font-bold",
                                                                children: "✅ בוצע"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                                                lineNumber: 1255,
                                                                columnNumber: 35
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                type: "button",
                                                                onClick: ()=>setStatus(session, "not_completed"),
                                                                className: "bg-red-50 border border-red-100 text-red-700 rounded-xl px-4 py-2 font-bold",
                                                                children: "❌ לא בוצע"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                                                lineNumber: 1272,
                                                                columnNumber: 35
                                                            }, this),
                                                            session.status !== "completed" && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                                type: "button",
                                                                onClick: ()=>deleteTraining(session),
                                                                className: "bg-slate-100 text-slate-600 rounded-xl px-4 py-2 font-bold",
                                                                children: "מחיקה"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                                                lineNumber: 1286,
                                                                columnNumber: 37
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/battalions/[name]/page.tsx",
                                                        lineNumber: 1253,
                                                        columnNumber: 33
                                                    }, this)
                                                ]
                                            }, session.id, true, {
                                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                                lineNumber: 1215,
                                                columnNumber: 29
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/app/battalions/[name]/page.tsx",
                                        lineNumber: 1199,
                                        columnNumber: 21
                                    }, this)
                                ]
                            }, weekNumber, true, {
                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                lineNumber: 1012,
                                columnNumber: 19
                            }, this);
                        })
                    }, void 0, false, {
                        fileName: "[project]/app/battalions/[name]/page.tsx",
                        lineNumber: 973,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/battalions/[name]/page.tsx",
                lineNumber: 900,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/battalions/[name]/page.tsx",
        lineNumber: 861,
        columnNumber: 5
    }, this);
}
_s(TrainingPlanPage, "jhuvtqWaM5qNPz7NO+g2zEXwfD8=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"],
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$use$2d$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"]
    ];
});
_c = TrainingPlanPage;
var _c;
__turbopack_context__.k.register(_c, "TrainingPlanPage");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/components/NotificationsPanel.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>NotificationsPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$use$2d$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/use-auth.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
function timeAgo(value) {
    const diff = Date.now() - new Date(value).getTime();
    const minutes = Math.max(0, Math.floor(diff / 60000));
    if (minutes < 1) {
        return "עכשיו";
    }
    if (minutes < 60) {
        return `לפני ${minutes} דקות`;
    }
    const hours = Math.floor(minutes / 60);
    return `לפני ${hours} שעות`;
}
function NotificationsPanel({ battalion, compact = false }) {
    _s();
    const { isViewer } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$use$2d$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const [items, setItems] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const load = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "NotificationsPanel.useCallback[load]": async ()=>{
            if (!isViewer) {
                setItems([]);
                setLoading(false);
                return;
            }
            let query = __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("commandfit_notifications").select(`
                id,
                battalion,
                severity,
                title,
                message,
                href,
                created_at,
                expires_at
              `).gt("expires_at", new Date().toISOString()).order("created_at", {
                ascending: false
            }).limit(compact ? 5 : 12);
            if (battalion) {
                query = query.eq("battalion", battalion);
            }
            const { data, error } = await query;
            if (error) {
                console.error("Notifications load error:", error);
                setItems([]);
                setLoading(false);
                return;
            }
            setItems(data ?? []);
            setLoading(false);
        }
    }["NotificationsPanel.useCallback[load]"], [
        battalion,
        compact,
        isViewer
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "NotificationsPanel.useEffect": ()=>{
            load();
            if (!isViewer) {
                return;
            }
            const interval = window.setInterval(load, 30000);
            return ({
                "NotificationsPanel.useEffect": ()=>{
                    window.clearInterval(interval);
                }
            })["NotificationsPanel.useEffect"];
        }
    }["NotificationsPanel.useEffect"], [
        isViewer,
        load
    ]);
    if (!isViewer) {
        return null;
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
        className: "bg-white rounded-3xl shadow-sm p-4 sm:p-6 mb-6",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex items-center gap-2",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                        className: "text-xl sm:text-2xl font-bold",
                        children: "🔔 עדכונים"
                    }, void 0, false, {
                        fileName: "[project]/components/NotificationsPanel.tsx",
                        lineNumber: 210,
                        columnNumber: 9
                    }, this),
                    items.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "min-w-6 h-6 rounded-full bg-red-600 text-white text-xs font-black flex items-center justify-center px-1.5",
                        children: items.length
                    }, void 0, false, {
                        fileName: "[project]/components/NotificationsPanel.tsx",
                        lineNumber: 215,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/components/NotificationsPanel.tsx",
                lineNumber: 208,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-slate-500 mt-1",
                children: "עדכונים ודגשים מה־24 שעות האחרונות"
            }, void 0, false, {
                fileName: "[project]/components/NotificationsPanel.tsx",
                lineNumber: 222,
                columnNumber: 7
            }, this),
            loading ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-slate-400 mt-5",
                children: "טוען עדכונים..."
            }, void 0, false, {
                fileName: "[project]/components/NotificationsPanel.tsx",
                lineNumber: 228,
                columnNumber: 9
            }, this) : items.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center text-slate-400 mt-5",
                children: "אין עדכונים חדשים"
            }, void 0, false, {
                fileName: "[project]/components/NotificationsPanel.tsx",
                lineNumber: 234,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "space-y-3 mt-5",
                children: items.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: item.href,
                        className: item.severity === "warning" ? "block border border-red-200 bg-red-50 rounded-2xl p-4 hover:bg-red-100 transition" : item.severity === "success" ? "block border border-green-100 bg-green-50 rounded-2xl p-4 hover:bg-green-100 transition" : "block border border-blue-100 bg-blue-50 rounded-2xl p-4 hover:bg-blue-100 transition",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col sm:flex-row sm:items-start justify-between gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "font-bold text-slate-900",
                                                children: [
                                                    item.severity === "warning" ? "⚠️ " : item.severity === "success" ? "✅ " : "🆕 ",
                                                    item.title
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/components/NotificationsPanel.tsx",
                                                lineNumber: 267,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm text-slate-600 mt-1 leading-6",
                                                children: item.message
                                            }, void 0, false, {
                                                fileName: "[project]/components/NotificationsPanel.tsx",
                                                lineNumber: 281,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/components/NotificationsPanel.tsx",
                                        lineNumber: 265,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "text-xs text-slate-400 shrink-0",
                                        children: timeAgo(item.created_at)
                                    }, void 0, false, {
                                        fileName: "[project]/components/NotificationsPanel.tsx",
                                        lineNumber: 287,
                                        columnNumber: 19
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/components/NotificationsPanel.tsx",
                                lineNumber: 263,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs font-bold text-blue-700 mt-3",
                                children: "לפתיחה ←"
                            }, void 0, false, {
                                fileName: "[project]/components/NotificationsPanel.tsx",
                                lineNumber: 295,
                                columnNumber: 17
                            }, this)
                        ]
                    }, item.id, true, {
                        fileName: "[project]/components/NotificationsPanel.tsx",
                        lineNumber: 245,
                        columnNumber: 15
                    }, this))
            }, void 0, false, {
                fileName: "[project]/components/NotificationsPanel.tsx",
                lineNumber: 240,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/components/NotificationsPanel.tsx",
        lineNumber: 206,
        columnNumber: 5
    }, this);
}
_s(NotificationsPanel, "QfkqXjHQ7YXjxOCQM8dyAwCgnvM=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$use$2d$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"]
    ];
});
_c = NotificationsPanel;
var _c;
__turbopack_context__.k.register(_c, "NotificationsPanel");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/cycles.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* =========================================================
   COMMAND FIT
   ניהול מחזורים
========================================================= */ __turbopack_context__.s([
    "closeCycle",
    ()=>closeCycle,
    "createCycle",
    ()=>createCycle,
    "deleteCycle",
    ()=>deleteCycle,
    "getActiveCycle",
    ()=>getActiveCycle,
    "getActiveCycleId",
    ()=>getActiveCycleId,
    "getAllCycles",
    ()=>getAllCycles,
    "getCadetsStorageKey",
    ()=>getCadetsStorageKey,
    "getCycleById",
    ()=>getCycleById,
    "getCycleStatusLabel",
    ()=>getCycleStatusLabel,
    "getCyclesByBattalion",
    ()=>getCyclesByBattalion,
    "getLegacyCadetsStorageKey",
    ()=>getLegacyCadetsStorageKey,
    "getLegacyResultsStorageKey",
    ()=>getLegacyResultsStorageKey,
    "getResultsStorageKey",
    ()=>getResultsStorageKey,
    "hasLegacyData",
    ()=>hasLegacyData,
    "migrateLegacyDataToCycle",
    ()=>migrateLegacyDataToCycle,
    "reopenCycle",
    ()=>reopenCycle,
    "setActiveCycle",
    ()=>setActiveCycle
]);
/* =========================================================
   STORAGE KEYS
========================================================= */ const CYCLES_STORAGE_KEY = "commandfit-cycles";
const ACTIVE_CYCLE_PREFIX = "commandfit-active-cycle";
/* =========================================================
   HELPERS
========================================================= */ function safeParse(value, fallback) {
    if (!value) {
        return fallback;
    }
    try {
        return JSON.parse(value);
    } catch  {
        return fallback;
    }
}
function sortCycles(cycles) {
    return cycles.slice().sort((a, b)=>new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
function getAllCycles() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const saved = localStorage.getItem(CYCLES_STORAGE_KEY);
    return sortCycles(safeParse(saved, []));
}
/* =========================================================
   SAVE ALL CYCLES
========================================================= */ function saveAllCycles(cycles) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    localStorage.setItem(CYCLES_STORAGE_KEY, JSON.stringify(cycles));
}
function getCyclesByBattalion(battalion) {
    return getAllCycles().filter((cycle)=>cycle.battalion === battalion);
}
function getCycleById(cycleId) {
    return getAllCycles().find((cycle)=>cycle.id === cycleId) ?? null;
}
function getActiveCycleId(battalion) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    return localStorage.getItem(`${ACTIVE_CYCLE_PREFIX}-${battalion}`);
}
function getActiveCycle(battalion) {
    const cycleId = getActiveCycleId(battalion);
    if (!cycleId) {
        return null;
    }
    const cycle = getCycleById(cycleId);
    if (!cycle || cycle.battalion !== battalion) {
        return null;
    }
    return cycle;
}
function setActiveCycle(battalion, cycleId) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const cycle = getCycleById(cycleId);
    if (!cycle || cycle.battalion !== battalion) {
        return;
    }
    localStorage.setItem(`${ACTIVE_CYCLE_PREFIX}-${battalion}`, cycleId);
}
function createCycle({ name, battalion, startDate, sourceCycles }) {
    const now = new Date().toISOString();
    const cycle = {
        id: `cycle-${battalion}-${Date.now()}`,
        name: name.trim(),
        battalion,
        status: "active",
        startDate,
        sourceCycles,
        createdAt: now
    };
    const cycles = getAllCycles();
    /*
    רק מחזור פעיל אחד לכל גדוד
  */ const updated = cycles.map((item)=>{
        if (item.battalion === battalion && item.status === "active") {
            return {
                ...item,
                status: "closed",
                closedAt: now
            };
        }
        return item;
    });
    updated.push(cycle);
    saveAllCycles(updated);
    setActiveCycle(battalion, cycle.id);
    return cycle;
}
function closeCycle(cycleId, endDate) {
    const cycles = getAllCycles();
    const current = cycles.find((cycle)=>cycle.id === cycleId);
    if (!current) {
        return null;
    }
    const closedAt = new Date().toISOString();
    const updatedCycle = {
        ...current,
        status: "closed",
        endDate: endDate || current.endDate,
        closedAt
    };
    saveAllCycles(cycles.map((cycle)=>cycle.id === cycleId ? updatedCycle : cycle));
    const activeId = getActiveCycleId(current.battalion);
    if (activeId === cycleId && ("TURBOPACK compile-time value", "object") !== "undefined") {
        localStorage.removeItem(`${ACTIVE_CYCLE_PREFIX}-${current.battalion}`);
    }
    return updatedCycle;
}
function reopenCycle(cycleId) {
    const cycles = getAllCycles();
    const current = cycles.find((cycle)=>cycle.id === cycleId);
    if (!current) {
        return null;
    }
    /*
    סוגרים כל מחזור פעיל אחר
    של אותו גדוד
  */ const updated = cycles.map((cycle)=>{
        if (cycle.battalion === current.battalion && cycle.id !== cycleId && cycle.status === "active") {
            return {
                ...cycle,
                status: "closed",
                closedAt: new Date().toISOString()
            };
        }
        if (cycle.id === cycleId) {
            return {
                ...cycle,
                status: "active",
                closedAt: undefined,
                endDate: undefined
            };
        }
        return cycle;
    });
    saveAllCycles(updated);
    setActiveCycle(current.battalion, cycleId);
    return updated.find((cycle)=>cycle.id === cycleId) ?? null;
}
function deleteCycle(cycleId) {
    const cycles = getAllCycles();
    const cycle = cycles.find((item)=>item.id === cycleId);
    if (!cycle) {
        return false;
    }
    const updated = cycles.filter((item)=>item.id !== cycleId);
    saveAllCycles(updated);
    const activeId = getActiveCycleId(cycle.battalion);
    if (activeId === cycleId && ("TURBOPACK compile-time value", "object") !== "undefined") {
        localStorage.removeItem(`${ACTIVE_CYCLE_PREFIX}-${cycle.battalion}`);
    }
    return true;
}
function getCadetsStorageKey(battalion, cycleId) {
    return `commandfit-cadets-${battalion}-${cycleId}`;
}
function getResultsStorageKey(battalion, cycleId, testName) {
    return `commandfit-results-${battalion}-${cycleId}-${testName}`;
}
function getLegacyCadetsStorageKey(battalion) {
    return `commandfit-cadets-${battalion}`;
}
function getLegacyResultsStorageKey(battalion, testName) {
    return `commandfit-results-${battalion}-${testName}`;
}
function migrateLegacyDataToCycle(battalion, cycleId, testNames) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    /*
    צוערים
  */ const legacyCadetsKey = getLegacyCadetsStorageKey(battalion);
    const newCadetsKey = getCadetsStorageKey(battalion, cycleId);
    const existingNewCadets = localStorage.getItem(newCadetsKey);
    if (!existingNewCadets) {
        const legacyCadets = localStorage.getItem(legacyCadetsKey);
        if (legacyCadets) {
            localStorage.setItem(newCadetsKey, legacyCadets);
        }
    }
    /*
    תוצאות
  */ testNames.forEach((testName)=>{
        const legacyKey = getLegacyResultsStorageKey(battalion, testName);
        const newKey = getResultsStorageKey(battalion, cycleId, testName);
        const existingNew = localStorage.getItem(newKey);
        if (existingNew) {
            return;
        }
        const legacy = localStorage.getItem(legacyKey);
        if (legacy) {
            localStorage.setItem(newKey, legacy);
        }
    });
}
function hasLegacyData(battalion, testNames) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const cadets = localStorage.getItem(getLegacyCadetsStorageKey(battalion));
    if (cadets) {
        return true;
    }
    return testNames.some((testName)=>Boolean(localStorage.getItem(getLegacyResultsStorageKey(battalion, testName))));
}
function getCycleStatusLabel(status) {
    if (status === "active") {
        return "פעיל";
    }
    return "סגור";
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/notifications.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "clearNotification",
    ()=>clearNotification,
    "publishNotification",
    ()=>publishNotification
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase.ts [app-client] (ecmascript)");
;
async function publishNotification(input) {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("commandfit_notifications").upsert({
        cycle_id: input.cycleId ?? null,
        battalion: input.battalion,
        event_type: input.eventType,
        severity: input.severity ?? "info",
        title: input.title,
        message: input.message,
        href: input.href,
        dedupe_key: input.dedupeKey,
        created_at: now.toISOString(),
        expires_at: expiresAt.toISOString()
    }, {
        onConflict: "dedupe_key"
    });
    if (error) console.error("Notification publish error:", error);
}
async function clearNotification(dedupeKey) {
    const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("commandfit_notifications").delete().eq("dedupe_key", dedupeKey);
    if (error) console.error("Notification clear error:", error);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/supabase.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "supabase",
    ()=>supabase
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = /*#__PURE__*/ __turbopack_context__.i("[project]/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@supabase/supabase-js/dist/index.mjs [app-client] (ecmascript) <locals>");
;
const supabaseUrl = ("TURBOPACK compile-time value", "https://lfgjayktpcyqylpbwtmk.supabase.co");
const supabaseAnonKey = ("TURBOPACK compile-time value", "sb_publishable_-KFdTO7gcOGS7LnclXOKrQ_ipuUNrX_");
if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
;
const supabase = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$supabase$2f$supabase$2d$js$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["createClient"])(supabaseUrl, supabaseAnonKey);
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/use-auth.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "useAuth",
    ()=>useAuth
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
function useAuth() {
    _s();
    const [user, setUser] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useAuth.useEffect": ()=>{
            async function loadUser() {
                try {
                    const response = await fetch("/api/auth/me", {
                        cache: "no-store"
                    });
                    if (!response.ok) {
                        setUser(null);
                        return;
                    }
                    const data = await response.json();
                    setUser(data.user ?? null);
                } catch  {
                    setUser(null);
                } finally{
                    setLoading(false);
                }
            }
            loadUser();
        }
    }["useAuth.useEffect"], []);
    return {
        user,
        loading,
        isAdmin: user?.role === "admin",
        isViewer: user?.role === "viewer"
    };
}
_s(useAuth, "9HrRzss74U5IEws4gTlgxjUJS7M=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=_1kqf9tb._.js.map