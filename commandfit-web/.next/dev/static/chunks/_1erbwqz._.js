(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/battalions/[name]/tests/[test]/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>TestPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$cycles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/cycles.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$use$2d$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/use-auth.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$notifications$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/notifications.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
;
;
;
;
/* =========================================================
   CONFIG
========================================================= */ const STAFF_BATTALIONS = new Set([
    "ארז",
    "ברוש",
    "חרוב",
    "אלון"
]);
const LORAN_METRICS = [
    {
        key: "run",
        title: "ריצה",
        averageLabel: "ממוצע ריצה",
        averagePlaceholder: "לדוגמה 21:45",
        failedLabel: "% נכשלי ריצה"
    },
    {
        key: "facilities",
        title: "מתקנים",
        failedLabel: "% לא עוברים מתקנים",
        failureOnly: true
    },
    {
        key: "ylm",
        title: 'יל"מ',
        averageLabel: 'ממוצע יל"מ',
        averagePlaceholder: "הזן ממוצע",
        failedLabel: ' % נכשלי יל"מ'
    }
];
const COMBAT_FITNESS_METRICS = [
    {
        key: "run",
        title: "ריצה",
        averageLabel: "ממוצע ריצה",
        averagePlaceholder: "לדוגמה 12:35",
        failedLabel: "% נכשלי ריצה"
    },
    {
        key: "sprints",
        title: "ספרינטים",
        averageLabel: "ממוצע ספרינטים",
        averagePlaceholder: "לדוגמה 48.5",
        failedLabel: "% נכשלי ספרינטים"
    },
    {
        key: "pullups",
        title: "מתח",
        averageLabel: "ממוצע מתח",
        averagePlaceholder: "לדוגמה 11.2",
        failedLabel: "% נכשלי מתח"
    },
    {
        key: "push",
        title: "לחיצת חזה / מקבילים",
        averageLabel: "ממוצע",
        averagePlaceholder: "לדוגמה 13.4",
        failedLabel: "% נכשלי לחיצת חזה / מקבילים"
    },
    {
        key: "floorLift",
        title: "הרמה מהרצפה",
        averageLabel: "ממוצע הרמה מהרצפה",
        averagePlaceholder: "לדוגמה 9.8",
        failedLabel: "% נכשלי הרמה מהרצפה"
    }
];
const STAFF_FITNESS_METRICS = [
    {
        key: "run",
        title: "ריצה",
        averageLabel: "ממוצע ריצה",
        averagePlaceholder: "לדוגמה 15:10",
        failedLabel: "% נכשלי ריצה"
    },
    {
        key: "pushups",
        title: "שכיבות סמיכה",
        averageLabel: "ממוצע שכיבות סמיכה",
        averagePlaceholder: "לדוגמה 32.5",
        failedLabel: "% נכשלי שכיבות סמיכה"
    }
];
/* =========================================================
   HELPERS
========================================================= */ function getAttemptLabel(attempt) {
    const letters = {
        1: "א׳",
        2: "ב׳",
        3: "ג׳",
        4: "ד׳",
        5: "ה׳",
        6: "ו׳",
        7: "ז׳",
        8: "ח׳",
        9: "ט׳",
        10: "י׳"
    };
    return `מועד ${letters[attempt] ?? attempt}`;
}
function clampPercent(value) {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
        return 0;
    }
    return Math.min(100, Math.max(0, Math.round(parsed * 10) / 10));
}
function formatPercent(value) {
    return `${Math.round(value * 10) / 10}%`;
}
function roundOne(value) {
    return Math.round(value * 10) / 10;
}
function calculateCumulativePass(attempts, currentAttempt, currentPassedPercent) {
    const previous = attempts.filter((item)=>item.attempt < currentAttempt).sort((a, b)=>b.attempt - a.attempt)[0];
    const previousCumulative = previous?.cumulativePassPercent ?? 0;
    return roundOne(previousCumulative + (100 - previousCumulative) * (currentPassedPercent / 100));
}
function cohortAdjustedPassIndex(cumulativePassPercent, remainingCohortPercent) {
    return roundOne(cumulativePassPercent * remainingCohortPercent / 100);
}
function showAverageTime(testName) {
    return testName.includes("לורן") || testName.includes('כש"ג') || testName.includes("כש״ג");
}
function showAverageShooting(testName) {
    return testName.includes("לורן") || testName.includes("ירי");
}
function getMetricDefinitions(battalionName, testName) {
    const isLoran = testName.includes("לורן");
    if (isLoran) {
        return LORAN_METRICS;
    }
    const isFitness = testName.includes('כש"ג') || testName.includes("כש״ג");
    if (isFitness) {
        return STAFF_BATTALIONS.has(battalionName) ? STAFF_FITNESS_METRICS : COMBAT_FITNESS_METRICS;
    }
    return [];
}
function createEmptyMetrics(definitions) {
    return Object.fromEntries(definitions.map((metric)=>[
            metric.key,
            {
                average: metric.failureOnly ? undefined : "",
                failedPercent: 0
            }
        ]));
}
function normalizeMetrics(source, definitions) {
    const empty = createEmptyMetrics(definitions);
    for (const definition of definitions){
        const current = source?.[definition.key];
        if (!current) {
            continue;
        }
        empty[definition.key] = {
            average: definition.failureOnly ? undefined : String(current.average ?? ""),
            failedPercent: clampPercent(String(current.failedPercent ?? 0))
        };
    }
    return empty;
}
function createEmptyResult(attempt, definitions) {
    return {
        attempt,
        passedPercent: 0,
        failedPercent: 100,
        excellentPercent: 0,
        averageTime: "",
        averageShooting: null,
        remainingCohortPercent: 100,
        cumulativePassPercent: 0,
        metrics: createEmptyMetrics(definitions)
    };
}
function TestPage() {
    _s();
    const { isViewer } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$use$2d$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const params = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"])();
    const router = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"])();
    const battalionName = decodeURIComponent(params.name);
    const testName = decodeURIComponent(params.test);
    const metricDefinitions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "TestPage.useMemo[metricDefinitions]": ()=>getMetricDefinitions(battalionName, testName)
    }["TestPage.useMemo[metricDefinitions]"], [
        battalionName,
        testName
    ]);
    const [activeCycle, setActiveCycle] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [attempts, setAttempts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [selectedAttempt, setSelectedAttempt] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(1);
    const [result, setResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "TestPage.useState": ()=>createEmptyResult(1, metricDefinitions)
    }["TestPage.useState"]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [message, setMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const cycleId = activeCycle?.id ?? `legacy-${battalionName}`;
    const isReadOnly = isViewer || activeCycle?.status === "closed";
    /* =======================================================
     ACTIVE CYCLE
  ======================================================= */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TestPage.useEffect": ()=>{
            setActiveCycle((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$cycles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getActiveCycle"])(battalionName));
        }
    }["TestPage.useEffect"], [
        battalionName
    ]);
    /* =======================================================
     LOAD
  ======================================================= */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TestPage.useEffect": ()=>{
            let cancelled = false;
            async function load() {
                setLoading(true);
                setMessage("");
                const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("percentage_test_results").select(`
              attempt,
              passed_percent,
              failed_percent,
              excellent_percent,
              average_time,
              average_shooting,
              remaining_cohort_percent,
              cumulative_pass_percent,
              metrics
            `).eq("cycle_id", cycleId).eq("battalion", battalionName).eq("test_name", testName).order("attempt", {
                    ascending: true
                });
                if (cancelled) {
                    return;
                }
                if (error) {
                    console.error("Percentage test load error:", error);
                    const empty = createEmptyResult(1, metricDefinitions);
                    setAttempts([]);
                    setSelectedAttempt(1);
                    setResult(empty);
                    setMessage("לא ניתן היה לטעון את נתוני האחוזים מהענן");
                    setLoading(false);
                    return;
                }
                const loaded = (data ?? []).map({
                    "TestPage.useEffect.load.loaded": (row)=>({
                            attempt: row.attempt ?? 1,
                            passedPercent: Number(row.passed_percent ?? 0),
                            failedPercent: Number(row.failed_percent ?? 100),
                            excellentPercent: Number(row.excellent_percent ?? 0),
                            averageTime: String(row.average_time ?? ""),
                            averageShooting: row.average_shooting === null ? null : Math.round(Number(row.average_shooting)),
                            remainingCohortPercent: Number(row.remaining_cohort_percent ?? 100),
                            cumulativePassPercent: Number(row.cumulative_pass_percent ?? row.passed_percent ?? 0),
                            metrics: normalizeMetrics(row.metrics, metricDefinitions)
                        })
                }["TestPage.useEffect.load.loaded"]);
                setAttempts(loaded);
                const latest = loaded.length > 0 ? loaded[loaded.length - 1] : createEmptyResult(1, metricDefinitions);
                setSelectedAttempt(latest.attempt);
                setResult(latest);
                setLoading(false);
            }
            load();
            return ({
                "TestPage.useEffect": ()=>{
                    cancelled = true;
                }
            })["TestPage.useEffect"];
        }
    }["TestPage.useEffect"], [
        battalionName,
        cycleId,
        metricDefinitions,
        testName
    ]);
    /* =======================================================
     VALIDATION
  ======================================================= */ const validation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "TestPage.useMemo[validation]": ()=>{
            if (result.excellentPercent > result.passedPercent) {
                return {
                    valid: false,
                    text: "אחוז המצטיינים לא יכול להיות גבוה מאחוז העוברים."
                };
            }
            for (const metric of metricDefinitions){
                const failed = result.metrics[metric.key]?.failedPercent ?? 0;
                if (failed < 0 || failed > 100) {
                    return {
                        valid: false,
                        text: `אחוז הנכשלים ב${metric.title} חייב להיות בין 0% ל־100%.`
                    };
                }
            }
            return {
                valid: true,
                text: "הנתונים תקינים ומוכנים לשמירה."
            };
        }
    }["TestPage.useMemo[validation]"], [
        metricDefinitions,
        result
    ]);
    /* =======================================================
     UPDATE OVERALL
  ======================================================= */ function updatePassed(value) {
        if (isReadOnly) {
            return;
        }
        const passed = clampPercent(value);
        const failed = Math.round((100 - passed) * 10) / 10;
        const cumulative = calculateCumulativePass(attempts, result.attempt, passed);
        setResult((current)=>({
                ...current,
                passedPercent: passed,
                failedPercent: failed,
                excellentPercent: Math.min(current.excellentPercent, passed),
                cumulativePassPercent: cumulative
            }));
    }
    function updateExcellent(value) {
        if (isReadOnly) {
            return;
        }
        setResult((current)=>({
                ...current,
                excellentPercent: clampPercent(value)
            }));
    }
    function updateAverageTime(value) {
        if (isReadOnly) return;
        setResult((current)=>({
                ...current,
                averageTime: value
            }));
    }
    function updateAverageShooting(value) {
        if (isReadOnly) return;
        const parsed = Number(value);
        setResult((current)=>({
                ...current,
                averageShooting: value === "" ? null : Math.max(0, Math.round(Number.isFinite(parsed) ? parsed : 0))
            }));
    }
    function updateRemainingCohort(value) {
        if (isReadOnly) return;
        setResult((current)=>({
                ...current,
                remainingCohortPercent: clampPercent(value)
            }));
    }
    /* =======================================================
     UPDATE METRICS
  ======================================================= */ function updateMetricAverage(key, value) {
        if (isReadOnly) {
            return;
        }
        setResult((current)=>({
                ...current,
                metrics: {
                    ...current.metrics,
                    [key]: {
                        ...current.metrics[key],
                        average: value
                    }
                }
            }));
    }
    function updateMetricFailed(key, value) {
        if (isReadOnly) {
            return;
        }
        setResult((current)=>({
                ...current,
                metrics: {
                    ...current.metrics,
                    [key]: {
                        ...current.metrics[key],
                        failedPercent: clampPercent(value)
                    }
                }
            }));
    }
    /* =======================================================
     ATTEMPTS
  ======================================================= */ function selectAttempt(attempt) {
        setSelectedAttempt(attempt);
        const existing = attempts.find((item)=>item.attempt === attempt);
        setResult(existing ?? createEmptyResult(attempt, metricDefinitions));
        setMessage("");
    }
    function addAttempt() {
        if (isReadOnly) {
            return;
        }
        const highest = attempts.reduce((max, item)=>Math.max(max, item.attempt), 0);
        const next = Math.max(highest + 1, selectedAttempt + 1);
        setSelectedAttempt(next);
        setResult(createEmptyResult(next, metricDefinitions));
        setMessage("");
    }
    /* =======================================================
     SAVE
  ======================================================= */ async function saveResult() {
        if (isReadOnly || !validation.valid) {
            return;
        }
        setSaving(true);
        setMessage("שומר לענן...");
        const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("percentage_test_results").upsert({
            cycle_id: cycleId,
            battalion: battalionName,
            test_name: testName,
            attempt: result.attempt,
            passed_percent: result.passedPercent,
            failed_percent: result.failedPercent,
            excellent_percent: result.excellentPercent,
            average_time: result.averageTime || null,
            average_shooting: result.averageShooting,
            remaining_cohort_percent: result.remainingCohortPercent,
            cumulative_pass_percent: result.cumulativePassPercent,
            metrics: result.metrics,
            updated_at: new Date().toISOString()
        }, {
            onConflict: "cycle_id,battalion,test_name,attempt"
        });
        if (error) {
            console.error("Percentage test save error:", error);
            setMessage(`השמירה נכשלה: ${error.message}`);
            setSaving(false);
            return;
        }
        setAttempts((current)=>{
            const rest = current.filter((item)=>item.attempt !== result.attempt);
            return [
                ...rest,
                result
            ].sort((a, b)=>a.attempt - b.attempt);
        });
        setMessage("הנתונים נשמרו בענן בהצלחה");
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$notifications$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["publishNotification"])({
            cycleId,
            battalion: battalionName,
            eventType: "test_update",
            severity: "success",
            title: `גדוד ${battalionName} – ${testName}`,
            message: `${getAttemptLabel(result.attempt)} עודכן. לחץ לצפייה בבוחן ובפירוט הנתונים.`,
            href: `/battalions/${encodeURIComponent(battalionName)}/tests/${encodeURIComponent(testName)}`,
            dedupeKey: `test-update:${cycleId}:${battalionName}:${testName}:attempt-${result.attempt}`
        });
        setSaving(false);
    }
    /* =======================================================
     LOADING
  ======================================================= */ if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
            dir: "rtl",
            className: "min-h-screen bg-slate-100 flex items-center justify-center p-4",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white rounded-2xl p-8 shadow-sm text-slate-700",
                children: "טוען נתוני בוחן..."
            }, void 0, false, {
                fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                lineNumber: 1202,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
            lineNumber: 1198,
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
                className: "bg-slate-900 text-white px-4 sm:px-6 lg:px-8 py-5 sm:py-6",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "max-w-[1500px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-slate-300",
                                    children: [
                                        "גדוד",
                                        " ",
                                        battalionName
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                                    lineNumber: 1225,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-slate-400 text-sm mt-1",
                                    children: [
                                        "מחזור:",
                                        " ",
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                            className: "text-white",
                                            children: activeCycle?.name ?? "נתונים קיימים"
                                        }, void 0, false, {
                                            fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                                            lineNumber: 1232,
                                            columnNumber: 15
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                                    lineNumber: 1230,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                    className: "text-2xl sm:text-3xl font-bold mt-1",
                                    children: testName
                                }, void 0, false, {
                                    fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                                    lineNumber: 1238,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-slate-300 mt-1",
                                    children: "אחוזי ביצוע וממוצעים לפי פרמטר"
                                }, void 0, false, {
                                    fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                                    lineNumber: 1242,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                            lineNumber: 1223,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "button",
                            onClick: ()=>router.push(`/battalions/${encodeURIComponent(battalionName)}`),
                            className: "w-full md:w-auto bg-white/10 hover:bg-white/20 px-5 py-3 rounded-xl",
                            children: "חזרה לגדוד"
                        }, void 0, false, {
                            fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                            lineNumber: 1248,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                    lineNumber: 1221,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                lineNumber: 1219,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "max-w-[1500px] mx-auto p-4 sm:p-6 lg:p-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "bg-blue-50 border border-blue-100 rounded-2xl p-4 sm:p-5 mb-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "font-bold text-blue-900",
                                children: "🔒 נתונים מצרפיים בלבד"
                            }, void 0, false, {
                                fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                                lineNumber: 1270,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-blue-800 mt-1",
                                children: "אין שמות, כמויות או תוצאות אישיות. נתוני האוכלוסייה נשמרים באחוזים בלבד."
                            }, void 0, false, {
                                fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                                lineNumber: 1274,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                        lineNumber: 1268,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "bg-white rounded-2xl shadow-sm p-5 mb-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col lg:flex-row lg:items-center justify-between gap-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                className: "font-bold text-lg",
                                                children: "מועד הבוחן"
                                            }, void 0, false, {
                                                fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                                                lineNumber: 1287,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm text-slate-500 mt-1",
                                                children: "לכל מועד נשמרת תמונת מצב נפרדת."
                                            }, void 0, false, {
                                                fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                                                lineNumber: 1291,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                                        lineNumber: 1286,
                                        columnNumber: 13
                                    }, this),
                                    !isReadOnly && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: addAttempt,
                                        className: "bg-blue-50 border border-blue-100 text-blue-700 rounded-xl px-5 py-3 font-bold",
                                        children: "+ מועד נוסף"
                                    }, void 0, false, {
                                        fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                                        lineNumber: 1297,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                                lineNumber: 1284,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-wrap gap-2 mt-5",
                                children: [
                                    attempts.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            type: "button",
                                            onClick: ()=>selectAttempt(item.attempt),
                                            className: selectedAttempt === item.attempt ? "rounded-xl bg-slate-900 text-white px-5 py-3 font-bold" : "rounded-xl border border-slate-200 bg-white text-slate-700 px-5 py-3 font-bold",
                                            children: getAttemptLabel(item.attempt)
                                        }, item.attempt, false, {
                                            fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                                            lineNumber: 1315,
                                            columnNumber: 17
                                        }, this)),
                                    !attempts.some((item)=>item.attempt === selectedAttempt) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        className: "rounded-xl bg-slate-900 text-white px-5 py-3 font-bold",
                                        children: getAttemptLabel(selectedAttempt)
                                    }, void 0, false, {
                                        fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                                        lineNumber: 1345,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                                lineNumber: 1310,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                        lineNumber: 1282,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "bg-white rounded-3xl shadow-sm p-5 sm:p-6 mb-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-xl sm:text-2xl font-bold",
                                children: "תמונת מצב כללית"
                            }, void 0, false, {
                                fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                                lineNumber: 1363,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-slate-500 mt-1",
                                children: getAttemptLabel(result.attempt)
                            }, void 0, false, {
                                fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                                lineNumber: 1367,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PercentInput, {
                                        title: "% עברו",
                                        value: result.passedPercent,
                                        disabled: isReadOnly,
                                        onChange: updatePassed
                                    }, void 0, false, {
                                        fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                                        lineNumber: 1375,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(ReadOnlyPercent, {
                                        title: "% נכשלו",
                                        value: result.failedPercent
                                    }, void 0, false, {
                                        fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                                        lineNumber: 1388,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PercentInput, {
                                        title: "% מצטיינים",
                                        value: result.excellentPercent,
                                        disabled: isReadOnly,
                                        onChange: updateExcellent
                                    }, void 0, false, {
                                        fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                                        lineNumber: 1395,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                                lineNumber: 1373,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                        lineNumber: 1361,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "bg-white rounded-3xl shadow-sm p-5 sm:p-6 mb-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-xl sm:text-2xl font-bold",
                                children: "ממוצעים והתקדמות"
                            }, void 0, false, {
                                fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                                lineNumber: 1416,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-slate-500 mt-1",
                                children: "נתונים מצרפיים בלבד — ללא שמות וללא כמות נבחנים."
                            }, void 0, false, {
                                fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                                lineNumber: 1420,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mt-6",
                                children: [
                                    showAverageTime(testName) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "bg-slate-50 border border-slate-200 rounded-2xl p-5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "block text-sm font-bold",
                                                children: "זמן ממוצע"
                                            }, void 0, false, {
                                                fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                                                lineNumber: 1428,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "text",
                                                disabled: isReadOnly,
                                                value: result.averageTime,
                                                onChange: (event)=>updateAverageTime(event.target.value),
                                                placeholder: "לדוגמה 18:42",
                                                className: "w-full border border-slate-300 rounded-xl px-4 py-3 mt-3 text-xl font-bold bg-white"
                                            }, void 0, false, {
                                                fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                                                lineNumber: 1432,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                                        lineNumber: 1427,
                                        columnNumber: 15
                                    }, this),
                                    showAverageShooting(testName) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "bg-slate-50 border border-slate-200 rounded-2xl p-5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "block text-sm font-bold",
                                                children: "ממוצע ירי"
                                            }, void 0, false, {
                                                fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                                                lineNumber: 1447,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "number",
                                                min: 0,
                                                step: 1,
                                                disabled: isReadOnly,
                                                value: result.averageShooting ?? "",
                                                onChange: (event)=>updateAverageShooting(event.target.value),
                                                placeholder: "מספר שלם",
                                                className: "w-full border border-slate-300 rounded-xl px-4 py-3 mt-3 text-xl font-bold bg-white"
                                            }, void 0, false, {
                                                fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                                                lineNumber: 1451,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "block text-xs text-slate-500 mt-2",
                                                children: "מספר שלם, ללא סימן %."
                                            }, void 0, false, {
                                                fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                                                lineNumber: 1464,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                                        lineNumber: 1446,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                        className: "bg-slate-50 border border-slate-200 rounded-2xl p-5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "block text-sm font-bold",
                                                children: "% שנותרו במחזור"
                                            }, void 0, false, {
                                                fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                                                lineNumber: 1471,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                type: "number",
                                                min: 0,
                                                max: 100,
                                                step: 0.1,
                                                disabled: isReadOnly,
                                                value: result.remainingCohortPercent,
                                                onChange: (event)=>updateRemainingCohort(event.target.value),
                                                className: "w-full border border-slate-300 rounded-xl px-4 py-3 mt-3 text-xl font-bold bg-white"
                                            }, void 0, false, {
                                                fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                                                lineNumber: 1475,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                                        lineNumber: 1470,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "bg-blue-50 border border-blue-100 rounded-2xl p-5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm font-bold text-blue-800",
                                                children: "מעבר מצטבר בבוחן"
                                            }, void 0, false, {
                                                fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                                                lineNumber: 1490,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-3xl font-black text-blue-900 mt-3",
                                                children: formatPercent(result.cumulativePassPercent)
                                            }, void 0, false, {
                                                fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                                                lineNumber: 1494,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                                        lineNumber: 1489,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                                lineNumber: 1424,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-violet-50 border border-violet-100 rounded-2xl p-4 mt-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm font-bold text-violet-900",
                                        children: "מדד מעבר ביחס למחזור המקורי"
                                    }, void 0, false, {
                                        fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                                        lineNumber: 1502,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-2xl font-black text-violet-900 mt-1",
                                        children: formatPercent(cohortAdjustedPassIndex(result.cumulativePassPercent, result.remainingCohortPercent))
                                    }, void 0, false, {
                                        fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                                        lineNumber: 1506,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-violet-700 mt-2",
                                        children: "מדד משוקלל שמביא בחשבון את אחוז הנותרים במחזור."
                                    }, void 0, false, {
                                        fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                                        lineNumber: 1515,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                                lineNumber: 1501,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                        lineNumber: 1414,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "bg-white rounded-3xl shadow-sm p-5 sm:p-6 mb-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-xl sm:text-2xl font-bold",
                                        children: "חלוקה לפי פרמטר"
                                    }, void 0, false, {
                                        fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                                        lineNumber: 1528,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-slate-500 mt-1",
                                        children: "ממוצע ואחוז נכשלים בכל מרכיב בהתאם לסוג הבוחן."
                                    }, void 0, false, {
                                        fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                                        lineNumber: 1532,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                                lineNumber: 1526,
                                columnNumber: 11
                            }, this),
                            metricDefinitions.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center text-slate-400 mt-6",
                                children: "טרם הוגדרה חלוקת פרמטרים לבוחן זה."
                            }, void 0, false, {
                                fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                                lineNumber: 1541,
                                columnNumber: 13
                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-6",
                                children: metricDefinitions.map((metric)=>{
                                    const metricValue = result.metrics[metric.key] ?? {
                                        average: "",
                                        failedPercent: 0
                                    };
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MetricCard, {
                                        definition: metric,
                                        value: metricValue,
                                        disabled: isReadOnly,
                                        onAverageChange: (value)=>updateMetricAverage(metric.key, value),
                                        onFailedChange: (value)=>updateMetricFailed(metric.key, value)
                                    }, metric.key, false, {
                                        fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                                        lineNumber: 1562,
                                        columnNumber: 21
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                                lineNumber: 1547,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                        lineNumber: 1524,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "bg-white rounded-3xl shadow-sm p-5 sm:p-6 mb-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-xl sm:text-2xl font-bold",
                                children: "אחוזי אי־עמידה לפי מרכיב"
                            }, void 0, false, {
                                fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                                lineNumber: 1606,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "space-y-4 mt-6",
                                children: metricDefinitions.map((metric)=>{
                                    const failed = result.metrics[metric.key]?.failedPercent ?? 0;
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex justify-between gap-3 text-sm",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "font-bold",
                                                        children: metric.title
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                                                        lineNumber: 1630,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "text-red-700 font-bold",
                                                        children: formatPercent(failed)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                                                        lineNumber: 1634,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                                                lineNumber: 1628,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "h-3 bg-slate-100 rounded-full overflow-hidden mt-2",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "h-full bg-red-500",
                                                    style: {
                                                        width: `${failed}%`
                                                    }
                                                }, void 0, false, {
                                                    fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                                                    lineNumber: 1644,
                                                    columnNumber: 23
                                                }, this)
                                            }, void 0, false, {
                                                fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                                                lineNumber: 1642,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, metric.key, true, {
                                        fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                                        lineNumber: 1622,
                                        columnNumber: 19
                                    }, this);
                                })
                            }, void 0, false, {
                                fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                                lineNumber: 1610,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                        lineNumber: 1604,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "bg-white rounded-2xl shadow-sm p-5 sm:p-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: validation.valid ? "bg-green-50 border border-green-100 text-green-700 rounded-xl p-4" : "bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4",
                                children: validation.text
                            }, void 0, false, {
                                fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                                lineNumber: 1667,
                                columnNumber: 11
                            }, this),
                            message && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-blue-50 border border-blue-100 text-blue-700 rounded-xl p-4 mt-4",
                                children: message
                            }, void 0, false, {
                                fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                                lineNumber: 1678,
                                columnNumber: 13
                            }, this),
                            !isReadOnly && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                type: "button",
                                disabled: saving || !validation.valid,
                                onClick: saveResult,
                                className: "w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-6 py-3 font-bold mt-5 disabled:opacity-40",
                                children: saving ? "שומר..." : "שמירת נתוני הבוחן"
                            }, void 0, false, {
                                fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                                lineNumber: 1684,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                        lineNumber: 1665,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                lineNumber: 1266,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
        lineNumber: 1214,
        columnNumber: 5
    }, this);
}
_s(TestPage, "0xttB5MR2WUFZFLqrxIur9x7Rec=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$use$2d$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRouter"]
    ];
});
_c = TestPage;
/* =========================================================
   COMPONENTS
========================================================= */ function PercentInput({ title, value, disabled, onChange }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-slate-50 border border-slate-200 rounded-2xl p-5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                className: "block text-sm font-bold mb-3",
                children: title
            }, void 0, false, {
                fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                lineNumber: 1729,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                type: "number",
                min: 0,
                max: 100,
                step: 0.1,
                disabled: disabled,
                value: value,
                onChange: (event)=>onChange(event.target.value),
                className: "w-full border border-slate-300 rounded-xl px-4 py-3 text-2xl font-bold bg-white"
            }, void 0, false, {
                fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                lineNumber: 1733,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
        lineNumber: 1727,
        columnNumber: 5
    }, this);
}
_c1 = PercentInput;
function ReadOnlyPercent({ title, value }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-slate-50 border border-slate-200 rounded-2xl p-5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm font-bold mb-3",
                children: title
            }, void 0, false, {
                fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                lineNumber: 1768,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-3xl font-bold",
                children: formatPercent(value)
            }, void 0, false, {
                fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                lineNumber: 1772,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs text-slate-500 mt-2",
                children: "מחושב אוטומטית"
            }, void 0, false, {
                fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                lineNumber: 1778,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
        lineNumber: 1766,
        columnNumber: 5
    }, this);
}
_c2 = ReadOnlyPercent;
function MetricCard({ definition, value, disabled, onAverageChange, onFailedChange }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "border border-slate-200 rounded-2xl p-5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                className: "text-lg font-bold",
                children: definition.title
            }, void 0, false, {
                fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                lineNumber: 1813,
                columnNumber: 7
            }, this),
            !definition.failureOnly && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                className: "block mt-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "block text-xs font-bold text-slate-500 mb-2",
                        children: definition.averageLabel
                    }, void 0, false, {
                        fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                        lineNumber: 1820,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        type: "text",
                        disabled: disabled,
                        value: value.average ?? "",
                        onChange: (event)=>onAverageChange(event.target.value),
                        placeholder: definition.averagePlaceholder,
                        className: "w-full border border-slate-300 rounded-xl px-4 py-3 bg-white"
                    }, void 0, false, {
                        fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                        lineNumber: 1824,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                lineNumber: 1818,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                className: "block mt-4",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "block text-xs font-bold text-red-700 mb-2",
                        children: definition.failedLabel
                    }, void 0, false, {
                        fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                        lineNumber: 1851,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "relative",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                type: "number",
                                min: 0,
                                max: 100,
                                step: 0.1,
                                disabled: disabled,
                                value: value.failedPercent,
                                onChange: (event)=>onFailedChange(event.target.value),
                                className: "w-full border border-red-200 rounded-xl px-4 py-3 pl-10 bg-white font-bold"
                            }, void 0, false, {
                                fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                                lineNumber: 1857,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "absolute left-4 top-1/2 -translate-y-1/2 text-red-600 font-bold",
                                children: "%"
                            }, void 0, false, {
                                fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                                lineNumber: 1878,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                        lineNumber: 1855,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                lineNumber: 1849,
                columnNumber: 7
            }, this),
            definition.failureOnly && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs text-slate-500 mt-3",
                children: "בפרמטר זה נשמר אחוז אי־עמידה בלבד, ללא ממוצע."
            }, void 0, false, {
                fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
                lineNumber: 1887,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/battalions/[name]/tests/[test]/page.tsx",
        lineNumber: 1811,
        columnNumber: 5
    }, this);
}
_c3 = MetricCard;
var _c, _c1, _c2, _c3;
__turbopack_context__.k.register(_c, "TestPage");
__turbopack_context__.k.register(_c1, "PercentInput");
__turbopack_context__.k.register(_c2, "ReadOnlyPercent");
__turbopack_context__.k.register(_c3, "MetricCard");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/lib/cycles.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
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
    "hydrateCyclesFromCloud",
    ()=>hydrateCyclesFromCloud,
    "migrateLegacyDataToCycle",
    ()=>migrateLegacyDataToCycle,
    "reopenCycle",
    ()=>reopenCycle,
    "setActiveCycle",
    ()=>setActiveCycle
]);
/* =========================================================
   COMMAND FIT
   ניהול מחזורים — Local cache + Supabase sync
========================================================= */ var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase.ts [app-client] (ecmascript)");
;
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
function toCloudRow(cycle) {
    return {
        id: cycle.id,
        name: cycle.name,
        battalion: cycle.battalion,
        status: cycle.status,
        start_date: cycle.startDate,
        end_date: cycle.endDate ?? null,
        source_cycles: cycle.sourceCycles ?? null,
        created_at: cycle.createdAt,
        closed_at: cycle.closedAt ?? null
    };
}
function fromCloudRow(row) {
    return {
        id: row.id,
        name: row.name,
        battalion: row.battalion,
        status: row.status,
        startDate: row.start_date,
        endDate: row.end_date ?? undefined,
        sourceCycles: row.source_cycles ?? undefined,
        createdAt: row.created_at,
        closedAt: row.closed_at ?? undefined
    };
}
function getAllCycles() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const saved = localStorage.getItem(CYCLES_STORAGE_KEY);
    return sortCycles(safeParse(saved, []));
}
/* =========================================================
   SAVE LOCAL CACHE
========================================================= */ function saveAllCycles(cycles) {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    localStorage.setItem(CYCLES_STORAGE_KEY, JSON.stringify(sortCycles(cycles)));
}
async function hydrateCyclesFromCloud() {
    if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
    ;
    const localCycles = getAllCycles();
    const { data: cloudData, error: cloudError } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("commandfit_cycles").select(`
          id,
          name,
          battalion,
          status,
          start_date,
          end_date,
          source_cycles,
          created_at,
          closed_at
        `).order("created_at", {
        ascending: false
    });
    if (cloudError) {
        console.error("Cycles cloud load error:", cloudError);
        return localCycles;
    }
    const existingIds = new Set((cloudData ?? []).map((row)=>row.id));
    const missingLocal = localCycles.filter((cycle)=>!existingIds.has(cycle.id));
    /*
    מעלים רק מחזורים מקומיים שחסרים בענן.
    כך לא דורסים מידע שכבר עודכן ממחשב אחר.
  */ for (const cycle of missingLocal){
        if (cycle.status === "active") {
            await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("commandfit_cycles").update({
                status: "closed",
                closed_at: new Date().toISOString()
            }).eq("battalion", cycle.battalion).eq("status", "active");
        }
        const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("commandfit_cycles").upsert(toCloudRow(cycle), {
            onConflict: "id"
        });
        if (error) {
            console.error("Legacy cycle cloud migration error:", error);
        }
    }
    const { data: refreshed, error: refreshError } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("commandfit_cycles").select(`
          id,
          name,
          battalion,
          status,
          start_date,
          end_date,
          source_cycles,
          created_at,
          closed_at
        `).order("created_at", {
        ascending: false
    });
    if (refreshError) {
        console.error("Cycles cloud refresh error:", refreshError);
        return localCycles;
    }
    const cycles = (refreshed ?? []).map(fromCloudRow);
    saveAllCycles(cycles);
    /*
    אם אין בחירה מקומית לגדוד אבל יש מחזור פעיל בענן,
    בוחרים אותו אוטומטית.
  */ const activeByBattalion = new Map();
    for (const cycle of cycles){
        if (cycle.status === "active" && !activeByBattalion.has(cycle.battalion)) {
            activeByBattalion.set(cycle.battalion, cycle);
        }
    }
    for (const [battalion, cycle] of activeByBattalion){
        const localActiveId = getActiveCycleId(battalion);
        if (!localActiveId || !cycles.some((item)=>item.id === localActiveId && item.battalion === battalion)) {
            setActiveCycle(battalion, cycle.id);
        }
    }
    return cycles;
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
        /*
      fallback: אם אין בחירה מקומית,
      נחזיר את המחזור הפעיל האחרון שיש ב-cache.
    */ return getCyclesByBattalion(battalion).find((cycle)=>cycle.status === "active") ?? null;
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
/* =========================================================
   CLOUD MUTATIONS
========================================================= */ async function createCycleInCloud(cycle) {
    /*
    סוגרים קודם מחזור פעיל קיים כדי לא להפר
    את ה-unique index של מחזור פעיל אחד לגדוד.
  */ const now = new Date().toISOString();
    const { error: closeError } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("commandfit_cycles").update({
        status: "closed",
        closed_at: now
    }).eq("battalion", cycle.battalion).eq("status", "active");
    if (closeError) {
        console.error("Close previous active cycle in cloud failed:", closeError);
    }
    const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("commandfit_cycles").upsert(toCloudRow(cycle), {
        onConflict: "id"
    });
    if (error) {
        console.error("Create cycle in cloud failed:", error);
    }
}
async function closeCycleInCloud(cycle) {
    const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("commandfit_cycles").update({
        status: cycle.status,
        end_date: cycle.endDate ?? null,
        closed_at: cycle.closedAt ?? null
    }).eq("id", cycle.id);
    if (error) {
        console.error("Close cycle in cloud failed:", error);
    }
}
async function reopenCycleInCloud(cycle) {
    const now = new Date().toISOString();
    const { error: closeError } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("commandfit_cycles").update({
        status: "closed",
        closed_at: now
    }).eq("battalion", cycle.battalion).eq("status", "active").neq("id", cycle.id);
    if (closeError) {
        console.error("Close other active cycles in cloud failed:", closeError);
    }
    const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("commandfit_cycles").update({
        status: "active",
        end_date: null,
        closed_at: null
    }).eq("id", cycle.id);
    if (error) {
        console.error("Reopen cycle in cloud failed:", error);
    }
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
    const updated = cycles.map((item)=>{
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
    void createCycleInCloud(cycle);
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
    void closeCycleInCloud(updatedCycle);
    return updatedCycle;
}
function reopenCycle(cycleId) {
    const cycles = getAllCycles();
    const current = cycles.find((cycle)=>cycle.id === cycleId);
    if (!current) {
        return null;
    }
    const updated = cycles.map((cycle)=>{
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
    const reopened = updated.find((cycle)=>cycle.id === cycleId) ?? null;
    if (reopened) {
        void reopenCycleInCloud(reopened);
    }
    return reopened;
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
    /*
    שמירה לעתיד בלבד — אם נשתמש במחיקה בפועל,
    היא תימחק גם מהענן.
  */ void __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("commandfit_cycles").delete().eq("id", cycleId).then(({ error })=>{
        if (error) {
            console.error("Delete cycle from cloud failed:", error);
        }
    });
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
    const legacyCadetsKey = getLegacyCadetsStorageKey(battalion);
    const newCadetsKey = getCadetsStorageKey(battalion, cycleId);
    const existingNewCadets = localStorage.getItem(newCadetsKey);
    if (!existingNewCadets) {
        const legacyCadets = localStorage.getItem(legacyCadetsKey);
        if (legacyCadets) {
            localStorage.setItem(newCadetsKey, legacyCadets);
        }
    }
    testNames.forEach((testName)=>{
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

//# sourceMappingURL=_1erbwqz._.js.map