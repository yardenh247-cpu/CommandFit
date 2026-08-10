(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/battalions/[name]/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>BattalionPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$battalion$2d$tests$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/battalion-tests.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$cycles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/cycles.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase.ts [app-client] (ecmascript)");
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
/* =========================================================
   CONFIG
========================================================= */ const battalionTracks = {
    דקל: "מגמת לוחמים",
    רימון: "מגמת לוחמים",
    גפן: "מגמת לוחמים",
    הדס: "מגמת לוחמים",
    דולב: "מגמת לוחמים",
    ארז: "מגמת מטה",
    ברוש: "מגמת מטה",
    חרוב: "מגמת מטה",
    אלון: "מגמת מטה"
};
/* =========================================================
   HELPERS
========================================================= */ function formatPercent(value) {
    if (value === null || Number.isNaN(value)) {
        return "—";
    }
    const rounded = Math.round(value * 10) / 10;
    return `${rounded}%`;
}
function attemptLabel(attempt) {
    const labels = {
        1: "מועד א׳",
        2: "מועד ב׳",
        3: "מועד ג׳",
        4: "מועד ד׳",
        5: "מועד ה׳",
        6: "מועד ו׳",
        7: "מועד ז׳",
        8: "מועד ח׳",
        9: "מועד ט׳",
        10: "מועד י׳"
    };
    return labels[attempt] ?? `מועד ${attempt}`;
}
function getMetricLabel(key) {
    const labels = {
        run: "ריצה",
        facilities: "מתקנים",
        ylm: 'יל"מ',
        sprints: "ספרינטים",
        pullups: "מתח",
        push: "לחיצת חזה / מקבילים",
        floorLift: "הרמה מהרצפה",
        pushups: "שכיבות סמיכה"
    };
    return labels[key] ?? key;
}
function signedPoints(value) {
    const rounded = Math.round(value * 10) / 10;
    return rounded > 0 ? `+${rounded}` : `${rounded}`;
}
function normalizeRow(row) {
    return {
        testName: row.test_name,
        attempt: row.attempt ?? 1,
        passedPercent: Number(row.passed_percent ?? 0),
        failedPercent: Number(row.failed_percent ?? 0),
        excellentPercent: Number(row.excellent_percent ?? 0),
        metrics: row.metrics ?? {}
    };
}
function BattalionPage() {
    _s();
    const params = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"])();
    const battalionName = decodeURIComponent(params.name);
    const track = battalionTracks[battalionName] ?? "CommandFit";
    const tests = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "BattalionPage.useMemo[tests]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$battalion$2d$tests$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getBattalionTests"])(battalionName)
    }["BattalionPage.useMemo[tests]"], [
        battalionName
    ]);
    const [activeCycle, setActiveCycle] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [rows, setRows] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [message, setMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [aiLoading, setAiLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [aiError, setAiError] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [aiAnalysis, setAiAnalysis] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const cycleId = activeCycle?.id ?? `legacy-${battalionName}`;
    /* =======================================================
     LOAD CYCLE
  ======================================================= */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "BattalionPage.useEffect": ()=>{
            setActiveCycle((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$cycles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getActiveCycle"])(battalionName));
        }
    }["BattalionPage.useEffect"], [
        battalionName
    ]);
    /* =======================================================
     LOAD PERCENTAGES
  ======================================================= */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "BattalionPage.useEffect": ()=>{
            let cancelled = false;
            async function load() {
                setLoading(true);
                setMessage("");
                const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("percentage_test_results").select(`
              test_name,
              attempt,
              passed_percent,
              failed_percent,
              excellent_percent,
              metrics
            `).eq("cycle_id", cycleId).eq("battalion", battalionName).order("test_name", {
                    ascending: true
                }).order("attempt", {
                    ascending: true
                });
                if (cancelled) {
                    return;
                }
                if (error) {
                    console.error("Battalion percentage load error:", error);
                    setRows([]);
                    setMessage("לא ניתן היה לטעון את נתוני האחוזים מהענן");
                    setLoading(false);
                    return;
                }
                setRows((data ?? []).map(normalizeRow));
                setLoading(false);
            }
            load();
            return ({
                "BattalionPage.useEffect": ()=>{
                    cancelled = true;
                }
            })["BattalionPage.useEffect"];
        }
    }["BattalionPage.useEffect"], [
        battalionName,
        cycleId
    ]);
    /* =======================================================
     DERIVED
  ======================================================= */ const testCards = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "BattalionPage.useMemo[testCards]": ()=>{
            return tests.map({
                "BattalionPage.useMemo[testCards]": (test)=>{
                    const attempts = rows.filter({
                        "BattalionPage.useMemo[testCards].attempts": (row)=>row.testName === test.name
                    }["BattalionPage.useMemo[testCards].attempts"]).sort({
                        "BattalionPage.useMemo[testCards].attempts": (a, b)=>a.attempt - b.attempt
                    }["BattalionPage.useMemo[testCards].attempts"]);
                    return {
                        test,
                        attempts,
                        latest: attempts.length > 0 ? attempts[attempts.length - 1] : null
                    };
                }
            }["BattalionPage.useMemo[testCards]"]);
        }
    }["BattalionPage.useMemo[testCards]"], [
        rows,
        tests
    ]);
    const latestResults = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "BattalionPage.useMemo[latestResults]": ()=>testCards.map({
                "BattalionPage.useMemo[latestResults]": (item)=>item.latest
            }["BattalionPage.useMemo[latestResults]"]).filter({
                "BattalionPage.useMemo[latestResults]": (item)=>item !== null
            }["BattalionPage.useMemo[latestResults]"])
    }["BattalionPage.useMemo[latestResults]"], [
        testCards
    ]);
    const averagePassed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "BattalionPage.useMemo[averagePassed]": ()=>{
            if (latestResults.length === 0) {
                return null;
            }
            return latestResults.reduce({
                "BattalionPage.useMemo[averagePassed]": (sum, item)=>sum + item.passedPercent
            }["BattalionPage.useMemo[averagePassed]"], 0) / latestResults.length;
        }
    }["BattalionPage.useMemo[averagePassed]"], [
        latestResults
    ]);
    const averageFailed = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "BattalionPage.useMemo[averageFailed]": ()=>{
            if (latestResults.length === 0) {
                return null;
            }
            return latestResults.reduce({
                "BattalionPage.useMemo[averageFailed]": (sum, item)=>sum + item.failedPercent
            }["BattalionPage.useMemo[averageFailed]"], 0) / latestResults.length;
        }
    }["BattalionPage.useMemo[averageFailed]"], [
        latestResults
    ]);
    const averageExcellent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "BattalionPage.useMemo[averageExcellent]": ()=>{
            if (latestResults.length === 0) {
                return null;
            }
            return latestResults.reduce({
                "BattalionPage.useMemo[averageExcellent]": (sum, item)=>sum + item.excellentPercent
            }["BattalionPage.useMemo[averageExcellent]"], 0) / latestResults.length;
        }
    }["BattalionPage.useMemo[averageExcellent]"], [
        latestResults
    ]);
    const battalionIntelligence = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "BattalionPage.useMemo[battalionIntelligence]": ()=>{
            const trends = testCards.filter({
                "BattalionPage.useMemo[battalionIntelligence].trends": (item)=>item.attempts.length >= 2
            }["BattalionPage.useMemo[battalionIntelligence].trends"]).map({
                "BattalionPage.useMemo[battalionIntelligence].trends": (item)=>{
                    const ordered = [
                        ...item.attempts
                    ].sort({
                        "BattalionPage.useMemo[battalionIntelligence].trends.ordered": (a, b)=>a.attempt - b.attempt
                    }["BattalionPage.useMemo[battalionIntelligence].trends.ordered"]);
                    const first = ordered[0];
                    const latest = ordered[ordered.length - 1];
                    return {
                        testName: item.test.name,
                        firstAttempt: first.attempt,
                        latestAttempt: latest.attempt,
                        passedChange: latest.passedPercent - first.passedPercent,
                        failedChange: latest.failedPercent - first.failedPercent,
                        excellentChange: latest.excellentPercent - first.excellentPercent
                    };
                }
            }["BattalionPage.useMemo[battalionIntelligence].trends"]);
            const weakestTest = latestResults.length > 0 ? [
                ...latestResults
            ].sort({
                "BattalionPage.useMemo[battalionIntelligence]": (a, b)=>b.failedPercent - a.failedPercent
            }["BattalionPage.useMemo[battalionIntelligence]"])[0] : null;
            const strongestTest = latestResults.length > 0 ? [
                ...latestResults
            ].sort({
                "BattalionPage.useMemo[battalionIntelligence]": (a, b)=>b.passedPercent - a.passedPercent
            }["BattalionPage.useMemo[battalionIntelligence]"])[0] : null;
            const biggestImprovement = trends.length > 0 ? [
                ...trends
            ].sort({
                "BattalionPage.useMemo[battalionIntelligence]": (a, b)=>b.passedChange - a.passedChange
            }["BattalionPage.useMemo[battalionIntelligence]"])[0] : null;
            const biggestDecline = trends.filter({
                "BattalionPage.useMemo[battalionIntelligence]": (item)=>item.passedChange < 0
            }["BattalionPage.useMemo[battalionIntelligence]"]).sort({
                "BattalionPage.useMemo[battalionIntelligence]": (a, b)=>a.passedChange - b.passedChange
            }["BattalionPage.useMemo[battalionIntelligence]"])[0] ?? null;
            return {
                trends,
                weakestTest,
                strongestTest,
                biggestImprovement,
                biggestDecline
            };
        }
    }["BattalionPage.useMemo[battalionIntelligence]"], [
        latestResults,
        testCards
    ]);
    const aiMetrics = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "BattalionPage.useMemo[aiMetrics]": ()=>{
            const result = {};
            /*
        1. תמונת מצב של כל בוחן
      */ for (const item of latestResults){
                const card = testCards.find({
                    "BattalionPage.useMemo[aiMetrics].card": (candidate)=>candidate.test.name === item.testName
                }["BattalionPage.useMemo[aiMetrics].card"]);
                const ordered = card ? [
                    ...card.attempts
                ].sort({
                    "BattalionPage.useMemo[aiMetrics]": (a, b)=>a.attempt - b.attempt
                }["BattalionPage.useMemo[aiMetrics]"]) : [];
                const first = ordered[0];
                const change = first && first.attempt !== item.attempt ? item.passedPercent - first.passedPercent : null;
                result[`בוחן: ${item.testName}`] = {
                    failedPercent: item.failedPercent,
                    average: [
                        `${attemptLabel(item.attempt)}: ${formatPercent(item.passedPercent)} עוברים`,
                        `${formatPercent(item.excellentPercent)} מצטיינים`,
                        change !== null ? `שינוי במעבר מהמועד הראשון: ${signedPoints(change)} נק׳` : ""
                    ].filter(Boolean).join(" | ")
                };
            }
            /*
        2. פרמטרים פנימיים — ריצה, מתח,
           ספרינטים וכו׳, אם קיימים בענן
      */ const metricGroups = new Map();
            for (const item of latestResults){
                for (const [key, metric] of Object.entries(item.metrics)){
                    const label = getMetricLabel(key);
                    const current = metricGroups.get(label) ?? {
                        failed: [],
                        averages: []
                    };
                    current.failed.push(Number(metric.failedPercent ?? 0));
                    if (metric.average) {
                        current.averages.push(metric.average);
                    }
                    metricGroups.set(label, current);
                }
            }
            for (const [label, group] of metricGroups.entries()){
                const failedAverage = group.failed.length > 0 ? group.failed.reduce({
                    "BattalionPage.useMemo[aiMetrics]": (sum, value)=>sum + value
                }["BattalionPage.useMemo[aiMetrics]"], 0) / group.failed.length : 0;
                result[`פרמטר: ${label}`] = {
                    failedPercent: failedAverage,
                    average: group.averages.length > 0 ? `ממוצעים שנקלטו: ${group.averages.slice(0, 4).join(" | ")}` : "ניתוח לפי אחוז אי־עמידה"
                };
            }
            /*
        3. מגמות בין מועדים
      */ for (const trend of battalionIntelligence.trends){
                const latest = latestResults.find({
                    "BattalionPage.useMemo[aiMetrics].latest": (item)=>item.testName === trend.testName
                }["BattalionPage.useMemo[aiMetrics].latest"]);
                result[`מגמה: ${trend.testName}`] = {
                    failedPercent: latest?.failedPercent ?? 0,
                    average: `מ${attemptLabel(trend.firstAttempt)} ל${attemptLabel(trend.latestAttempt)}: שינוי בעוברים ${signedPoints(trend.passedChange)} נק׳ | שינוי בנכשלים ${signedPoints(trend.failedChange)} נק׳ | שינוי במצטיינים ${signedPoints(trend.excellentChange)} נק׳`
                };
            }
            return result;
        }
    }["BattalionPage.useMemo[aiMetrics]"], [
        latestResults,
        testCards,
        battalionIntelligence
    ]);
    async function runAiAnalysis() {
        setAiLoading(true);
        setAiError("");
        try {
            const response = await fetch("/api/ai/analysis", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    track: `${track} – גדוד ${battalionName}`,
                    overall: {
                        passedPercent: averagePassed ?? 0,
                        failedPercent: averageFailed ?? 0,
                        excellentPercent: averageExcellent ?? 0
                    },
                    metrics: aiMetrics
                })
            });
            const data = await response.json();
            if (!response.ok || !data?.ok) {
                throw new Error(data?.message ?? "ניתוח AI נכשל");
            }
            setAiAnalysis(data.analysis);
        } catch (error) {
            console.error("Battalion AI analysis error:", error);
            setAiError(error instanceof Error ? error.message : "אירעה שגיאה בניתוח AI");
        } finally{
            setAiLoading(false);
        }
    }
    /* =======================================================
     NOT FOUND
  ======================================================= */ if (tests.length === 0) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
            dir: "rtl",
            className: "min-h-screen bg-slate-100 p-4 sm:p-8",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "max-w-4xl mx-auto bg-white rounded-2xl shadow-sm p-6 sm:p-10",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                        className: "text-2xl sm:text-3xl font-bold",
                        children: "גדוד לא נמצא"
                    }, void 0, false, {
                        fileName: "[project]/app/battalions/[name]/page.tsx",
                        lineNumber: 996,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-slate-500 mt-2",
                        children: [
                            "לא הוגדרה כרגע תכנית בחנים לגדוד",
                            " ",
                            battalionName,
                            "."
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/battalions/[name]/page.tsx",
                        lineNumber: 1000,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        href: "/",
                        className: "inline-block mt-6 bg-slate-900 text-white px-5 py-3 rounded-xl",
                        children: "חזרה לדף הבית"
                    }, void 0, false, {
                        fileName: "[project]/app/battalions/[name]/page.tsx",
                        lineNumber: 1006,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/battalions/[name]/page.tsx",
                lineNumber: 994,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/battalions/[name]/page.tsx",
            lineNumber: 990,
            columnNumber: 7
        }, this);
    }
    /* =======================================================
     LOADING
  ======================================================= */ if (loading) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
            dir: "rtl",
            className: "min-h-screen bg-slate-100 flex items-center justify-center p-4",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white rounded-2xl p-8 shadow-sm text-slate-700",
                children: "טוען נתוני אחוזים..."
            }, void 0, false, {
                fileName: "[project]/app/battalions/[name]/page.tsx",
                lineNumber: 1030,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/battalions/[name]/page.tsx",
            lineNumber: 1026,
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
                className: "bg-slate-900 text-white px-4 sm:px-6 lg:px-8 py-5 sm:py-7",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "max-w-[1500px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-5",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-slate-300",
                                    children: track
                                }, void 0, false, {
                                    fileName: "[project]/app/battalions/[name]/page.tsx",
                                    lineNumber: 1057,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                    className: "text-3xl font-bold mt-1",
                                    children: [
                                        "גדוד",
                                        " ",
                                        battalionName
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/battalions/[name]/page.tsx",
                                    lineNumber: 1061,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-wrap items-center gap-2 mt-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "bg-white/10 border border-white/10 rounded-lg px-3 py-1.5 text-sm",
                                            children: [
                                                "מחזור:",
                                                " ",
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                    children: activeCycle?.name ?? "נתונים קיימים"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/battalions/[name]/page.tsx",
                                                    lineNumber: 1070,
                                                    columnNumber: 17
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/battalions/[name]/page.tsx",
                                            lineNumber: 1068,
                                            columnNumber: 15
                                        }, this),
                                        activeCycle && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: activeCycle.status === "closed" ? "bg-amber-500/20 border border-amber-400/20 text-amber-100 rounded-lg px-3 py-1.5 text-sm" : "bg-green-500/20 border border-green-400/20 text-green-100 rounded-lg px-3 py-1.5 text-sm",
                                            children: activeCycle.status === "closed" ? "🔒 מחזור סגור" : "● מחזור פעיל"
                                        }, void 0, false, {
                                            fileName: "[project]/app/battalions/[name]/page.tsx",
                                            lineNumber: 1077,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/battalions/[name]/page.tsx",
                                    lineNumber: 1066,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-slate-400 text-sm mt-3",
                                    children: "CommandFit – תמונת מצב מצרפית באחוזים בלבד"
                                }, void 0, false, {
                                    fileName: "[project]/app/battalions/[name]/page.tsx",
                                    lineNumber: 1094,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/battalions/[name]/page.tsx",
                            lineNumber: 1055,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 w-full md:w-auto",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    href: `/battalions/${encodeURIComponent(battalionName)}/cadets`,
                                    className: "bg-green-600 hover:bg-green-500 text-white px-5 py-3 rounded-xl font-medium shadow-sm text-center transition",
                                    children: "📈 הזנת אחוזים"
                                }, void 0, false, {
                                    fileName: "[project]/app/battalions/[name]/page.tsx",
                                    lineNumber: 1107,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    href: `/battalions/${encodeURIComponent(battalionName)}/summary`,
                                    className: "bg-blue-600 hover:bg-blue-500 text-white px-5 py-3 rounded-xl font-medium shadow-sm text-center transition",
                                    children: "📊 סיכום באחוזים"
                                }, void 0, false, {
                                    fileName: "[project]/app/battalions/[name]/page.tsx",
                                    lineNumber: 1116,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    href: `/battalions/${encodeURIComponent(battalionName)}/training-plan`,
                                    className: "bg-violet-600 hover:bg-violet-500 text-white px-5 py-3 rounded-xl font-medium shadow-sm text-center transition",
                                    children: "📅 תוכנית אימונים"
                                }, void 0, false, {
                                    fileName: "[project]/app/battalions/[name]/page.tsx",
                                    lineNumber: 1125,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                    href: "/",
                                    className: "bg-white/10 hover:bg-white/20 px-5 py-3 rounded-xl text-center transition",
                                    children: "חזרה לדף הבית"
                                }, void 0, false, {
                                    fileName: "[project]/app/battalions/[name]/page.tsx",
                                    lineNumber: 1134,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/battalions/[name]/page.tsx",
                            lineNumber: 1105,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/battalions/[name]/page.tsx",
                    lineNumber: 1053,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/battalions/[name]/page.tsx",
                lineNumber: 1051,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "max-w-[1500px] mx-auto p-4 sm:p-6 md:p-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "bg-blue-50 border border-blue-100 rounded-2xl p-4 sm:p-5 mb-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "font-bold text-blue-900",
                                children: "🔒 נתונים מצרפיים בלבד"
                            }, void 0, false, {
                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                lineNumber: 1155,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-blue-800 mt-1 leading-6",
                                children: "במסך זה לא מוצגים שמות, מספרי צוערים, מספר נבחנים או תיק אישי. כל הנתונים מוצגים באחוזים בלבד."
                            }, void 0, false, {
                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                lineNumber: 1159,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/battalions/[name]/page.tsx",
                        lineNumber: 1153,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$components$2f$NotificationsPanel$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                        battalion: battalionName,
                        compact: true
                    }, void 0, false, {
                        fileName: "[project]/app/battalions/[name]/page.tsx",
                        lineNumber: 1172,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PercentKpi, {
                                title: "ממוצע עוברים",
                                value: formatPercent(averagePassed),
                                tone: "success"
                            }, void 0, false, {
                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                lineNumber: 1185,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PercentKpi, {
                                title: "ממוצע נכשלים",
                                value: formatPercent(averageFailed),
                                tone: "danger"
                            }, void 0, false, {
                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                lineNumber: 1195,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(PercentKpi, {
                                title: "ממוצע מצטיינים",
                                value: formatPercent(averageExcellent),
                                tone: "excellent"
                            }, void 0, false, {
                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                lineNumber: 1205,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/battalions/[name]/page.tsx",
                        lineNumber: 1183,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CommanderInsightCard, {
                                title: "מוקד מרכזי",
                                value: battalionIntelligence.weakestTest ? battalionIntelligence.weakestTest.testName : "אין מספיק נתונים",
                                subtitle: battalionIntelligence.weakestTest ? `${formatPercent(battalionIntelligence.weakestTest.failedPercent)} נכשלים במועד האחרון` : "נדרש להזין תוצאות",
                                tone: "danger"
                            }, void 0, false, {
                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                lineNumber: 1223,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CommanderInsightCard, {
                                title: "בוחן חזק",
                                value: battalionIntelligence.strongestTest ? battalionIntelligence.strongestTest.testName : "אין מספיק נתונים",
                                subtitle: battalionIntelligence.strongestTest ? `${formatPercent(battalionIntelligence.strongestTest.passedPercent)} עוברים במועד האחרון` : "נדרש להזין תוצאות",
                                tone: "success"
                            }, void 0, false, {
                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                lineNumber: 1246,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CommanderInsightCard, {
                                title: "השיפור הגדול ביותר",
                                value: battalionIntelligence.biggestImprovement ? battalionIntelligence.biggestImprovement.testName : "אין עדיין השוואה",
                                subtitle: battalionIntelligence.biggestImprovement ? `${signedPoints(battalionIntelligence.biggestImprovement.passedChange)} נק׳ באחוז העוברים` : "נדרשים לפחות שני מועדים",
                                tone: "info"
                            }, void 0, false, {
                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                lineNumber: 1269,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CommanderInsightCard, {
                                title: "דורש מעקב",
                                value: battalionIntelligence.biggestDecline ? battalionIntelligence.biggestDecline.testName : "אין ירידה מזוהה",
                                subtitle: battalionIntelligence.biggestDecline ? `${signedPoints(battalionIntelligence.biggestDecline.passedChange)} נק׳ באחוז העוברים` : "המגמות הקיימות יציבות/חיוביות",
                                tone: "warning"
                            }, void 0, false, {
                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                lineNumber: 1292,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/battalions/[name]/page.tsx",
                        lineNumber: 1221,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "bg-gradient-to-l from-indigo-950 to-slate-900 text-white rounded-3xl shadow-sm p-5 sm:p-7 mb-8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col lg:flex-row lg:items-center justify-between gap-5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs font-bold text-indigo-300 uppercase tracking-wide",
                                                children: "CommandFit AI"
                                            }, void 0, false, {
                                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                                lineNumber: 1327,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                className: "text-2xl font-black mt-1",
                                                children: [
                                                    "✨ AI למפקד גדוד ",
                                                    battalionName
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                                lineNumber: 1331,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-slate-300 mt-2 max-w-3xl",
                                                children: [
                                                    "ניתוח ממוקד של גדוד ",
                                                    battalionName,
                                                    " בלבד — השוואה בין מועדים, זיהוי שיפור וירידה, בחנים חלשים, מוקדי אי־עמידה והמלצות ממוקדות להמשך האימונים."
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                                lineNumber: 1335,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/battalions/[name]/page.tsx",
                                        lineNumber: 1325,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: runAiAnalysis,
                                        disabled: aiLoading || latestResults.length === 0,
                                        className: "w-full lg:w-auto bg-white text-slate-950 hover:bg-indigo-50 rounded-xl px-6 py-3 font-black disabled:opacity-40 disabled:cursor-not-allowed",
                                        children: aiLoading ? "מנתח את נתוני הגדוד..." : aiAnalysis ? "🔄 ניתוח מחדש" : "✨ נתח את הגדוד באמצעות AI"
                                    }, void 0, false, {
                                        fileName: "[project]/app/battalions/[name]/page.tsx",
                                        lineNumber: 1341,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                lineNumber: 1323,
                                columnNumber: 11
                            }, this),
                            aiError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-red-500/10 border border-red-400/20 text-red-100 rounded-xl p-4 mt-5",
                                children: aiError
                            }, void 0, false, {
                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                lineNumber: 1362,
                                columnNumber: 13
                            }, this),
                            !aiAnalysis && !aiError && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-white/5 border border-white/10 rounded-2xl p-5 mt-5 text-slate-300 text-sm",
                                children: [
                                    "לחץ על „נתח את הגדוד באמצעות AI” לקבלת תמונת מצב, חוזקות, מוקדי חולשה, מגמות והמלצות לפעולה המבוססות על הנתונים של גדוד ",
                                    battalionName,
                                    "."
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                lineNumber: 1369,
                                columnNumber: 13
                            }, this),
                            aiAnalysis && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-6 space-y-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "bg-white/10 border border-white/10 rounded-2xl p-5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-indigo-200 font-bold",
                                                children: "תמונת מצב גדודית"
                                            }, void 0, false, {
                                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                                lineNumber: 1378,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-lg font-bold mt-2 leading-8",
                                                children: aiAnalysis.summary
                                            }, void 0, false, {
                                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                                lineNumber: 1382,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/battalions/[name]/page.tsx",
                                        lineNumber: 1377,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-1 lg:grid-cols-2 gap-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(BattalionAiListCard, {
                                                title: "חוזקות",
                                                items: aiAnalysis.strengths,
                                                icon: "✅"
                                            }, void 0, false, {
                                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                                lineNumber: 1389,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(BattalionAiListCard, {
                                                title: "מוקדי חולשה",
                                                items: aiAnalysis.weaknesses,
                                                icon: "⚠️"
                                            }, void 0, false, {
                                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                                lineNumber: 1397,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(BattalionAiListCard, {
                                                title: "מגמות",
                                                items: aiAnalysis.trends,
                                                icon: "📈"
                                            }, void 0, false, {
                                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                                lineNumber: 1405,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(BattalionAiListCard, {
                                                title: "המלצות לפעולה",
                                                items: aiAnalysis.recommendations,
                                                icon: "🎯"
                                            }, void 0, false, {
                                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                                lineNumber: 1413,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/battalions/[name]/page.tsx",
                                        lineNumber: 1387,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "bg-indigo-500/10 border border-indigo-300/20 rounded-2xl p-5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs text-indigo-200 font-bold",
                                                children: [
                                                    "מסר למפקד גדוד ",
                                                    battalionName
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                                lineNumber: 1424,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "mt-2 font-bold leading-7",
                                                children: aiAnalysis.commanderMessage
                                            }, void 0, false, {
                                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                                lineNumber: 1428,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/battalions/[name]/page.tsx",
                                        lineNumber: 1423,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                lineNumber: 1375,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/battalions/[name]/page.tsx",
                        lineNumber: 1321,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "bg-gradient-to-l from-slate-900 to-slate-800 text-white rounded-3xl p-5 sm:p-7 mb-8 shadow-sm",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-2xl sm:text-3xl font-bold",
                                        children: "תמונת מצב גדודית"
                                    }, void 0, false, {
                                        fileName: "[project]/app/battalions/[name]/page.tsx",
                                        lineNumber: 1446,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-slate-300 mt-1",
                                        children: "התקדמות בכל בוחן בנפרד לפי מועדים — אחוזי עוברים, נכשלים ומצטיינים."
                                    }, void 0, false, {
                                        fileName: "[project]/app/battalions/[name]/page.tsx",
                                        lineNumber: 1450,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                lineNumber: 1444,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "grid grid-cols-1 xl:grid-cols-2 gap-4 mt-6",
                                children: testCards.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TestProgressChart, {
                                        testName: item.test.name,
                                        attempts: item.attempts
                                    }, item.test.id, false, {
                                        fileName: "[project]/app/battalions/[name]/page.tsx",
                                        lineNumber: 1460,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                lineNumber: 1456,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/battalions/[name]/page.tsx",
                        lineNumber: 1442,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "bg-white rounded-3xl shadow-sm p-4 sm:p-6 mb-8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-2xl font-bold",
                                        children: "מסלול הבחנים"
                                    }, void 0, false, {
                                        fileName: "[project]/app/battalions/[name]/page.tsx",
                                        lineNumber: 1480,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-slate-500 mt-1",
                                        children: "בכל בוחן מוצגים אחוז מעבר, כישלון והצטיינות בלבד."
                                    }, void 0, false, {
                                        fileName: "[project]/app/battalions/[name]/page.tsx",
                                        lineNumber: 1484,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                lineNumber: 1478,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `grid grid-cols-1 md:grid-cols-2 ${tests.length >= 4 ? "xl:grid-cols-4" : "xl:grid-cols-3"} gap-4 mt-6`,
                                children: testCards.map((item, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "border border-slate-200 rounded-2xl p-4 sm:p-5 bg-white",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "flex items-start justify-between gap-3",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                className: "text-sm text-slate-500",
                                                                children: [
                                                                    "שלב",
                                                                    " ",
                                                                    index + 1
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                                                lineNumber: 1518,
                                                                columnNumber: 23
                                                            }, this),
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                                className: "font-bold text-xl mt-1",
                                                                children: item.test.name
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                                                lineNumber: 1524,
                                                                columnNumber: 23
                                                            }, this)
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/battalions/[name]/page.tsx",
                                                        lineNumber: 1516,
                                                        columnNumber: 21
                                                    }, this),
                                                    item.latest && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "bg-slate-100 rounded-lg px-3 py-1 text-xs font-medium",
                                                        children: attemptLabel(item.latest.attempt)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/battalions/[name]/page.tsx",
                                                        lineNumber: 1534,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                                lineNumber: 1514,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-sm text-slate-500 mt-3 min-h-[40px]",
                                                children: item.test.description
                                            }, void 0, false, {
                                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                                lineNumber: 1545,
                                                columnNumber: 19
                                            }, this),
                                            item.latest ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "grid grid-cols-3 gap-2 mt-5",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MiniPercent, {
                                                        title: "עברו",
                                                        value: item.latest.passedPercent,
                                                        tone: "success"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/battalions/[name]/page.tsx",
                                                        lineNumber: 1556,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MiniPercent, {
                                                        title: "נכשלו",
                                                        value: item.latest.failedPercent,
                                                        tone: "danger"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/battalions/[name]/page.tsx",
                                                        lineNumber: 1565,
                                                        columnNumber: 23
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MiniPercent, {
                                                        title: "מצטיינים",
                                                        value: item.latest.excellentPercent,
                                                        tone: "excellent"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/battalions/[name]/page.tsx",
                                                        lineNumber: 1574,
                                                        columnNumber: 23
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                                lineNumber: 1554,
                                                columnNumber: 21
                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "bg-slate-50 border border-slate-100 rounded-xl p-4 text-slate-400 text-sm mt-5 text-center",
                                                children: "טרם הוזנו אחוזים"
                                            }, void 0, false, {
                                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                                lineNumber: 1587,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                                href: `/battalions/${encodeURIComponent(battalionName)}/cadets`,
                                                className: "block mt-5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-4 py-3 text-center font-medium transition",
                                                children: "הזנת / עדכון אחוזים"
                                            }, void 0, false, {
                                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                                lineNumber: 1593,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, item.test.id, true, {
                                        fileName: "[project]/app/battalions/[name]/page.tsx",
                                        lineNumber: 1507,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                lineNumber: 1492,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/battalions/[name]/page.tsx",
                        lineNumber: 1476,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "grid grid-cols-1 md:grid-cols-3 gap-4",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: `/battalions/${encodeURIComponent(battalionName)}/cadets`,
                                className: "bg-green-50 border border-green-100 rounded-3xl p-6 hover:bg-green-100 transition",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-green-700 font-bold",
                                        children: "הזנה"
                                    }, void 0, false, {
                                        fileName: "[project]/app/battalions/[name]/page.tsx",
                                        lineNumber: 1624,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-2xl font-bold text-green-900 mt-1",
                                        children: "הזנת אחוזי ביצוע"
                                    }, void 0, false, {
                                        fileName: "[project]/app/battalions/[name]/page.tsx",
                                        lineNumber: 1628,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-green-800 text-sm mt-2",
                                        children: "הזנת אחוז מעבר ואחוז מצטיינים. אחוז הכישלון מחושב אוטומטית."
                                    }, void 0, false, {
                                        fileName: "[project]/app/battalions/[name]/page.tsx",
                                        lineNumber: 1632,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                lineNumber: 1617,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: `/battalions/${encodeURIComponent(battalionName)}/summary`,
                                className: "bg-blue-50 border border-blue-100 rounded-3xl p-6 hover:bg-blue-100 transition",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-blue-700 font-bold",
                                        children: "ניתוח"
                                    }, void 0, false, {
                                        fileName: "[project]/app/battalions/[name]/page.tsx",
                                        lineNumber: 1647,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-2xl font-bold text-blue-900 mt-1",
                                        children: "סיכום גדודי באחוזים"
                                    }, void 0, false, {
                                        fileName: "[project]/app/battalions/[name]/page.tsx",
                                        lineNumber: 1651,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-blue-800 text-sm mt-2",
                                        children: "צפייה בהיסטוריית המועדים ובמגמות הביצוע ללא מידע אישי."
                                    }, void 0, false, {
                                        fileName: "[project]/app/battalions/[name]/page.tsx",
                                        lineNumber: 1655,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                lineNumber: 1640,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                                href: `/battalions/${encodeURIComponent(battalionName)}/training-plan`,
                                className: "bg-violet-50 border border-violet-100 rounded-3xl p-6 hover:bg-violet-100 transition",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-violet-700 font-bold",
                                        children: "תכנון"
                                    }, void 0, false, {
                                        fileName: "[project]/app/battalions/[name]/page.tsx",
                                        lineNumber: 1670,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-2xl font-bold text-violet-900 mt-1",
                                        children: "📅 תוכנית אימונים"
                                    }, void 0, false, {
                                        fileName: "[project]/app/battalions/[name]/page.tsx",
                                        lineNumber: 1674,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-violet-800 text-sm mt-2",
                                        children: "תכנון האימונים לפי שבועות, מעקב ביצוע והתראות על עומס אימונים נמוך."
                                    }, void 0, false, {
                                        fileName: "[project]/app/battalions/[name]/page.tsx",
                                        lineNumber: 1678,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                lineNumber: 1663,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/battalions/[name]/page.tsx",
                        lineNumber: 1615,
                        columnNumber: 9
                    }, this),
                    message && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl p-4 mt-8",
                        children: message
                    }, void 0, false, {
                        fileName: "[project]/app/battalions/[name]/page.tsx",
                        lineNumber: 1694,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/battalions/[name]/page.tsx",
                lineNumber: 1147,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/battalions/[name]/page.tsx",
        lineNumber: 1042,
        columnNumber: 5
    }, this);
}
_s(BattalionPage, "rOzqlVGOLnU8QVnPuttSnKoD5/E=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"]
    ];
});
_c = BattalionPage;
/* =========================================================
   COMPONENTS
========================================================= */ function CommanderInsightCard({ title, value, subtitle, tone }) {
    const styles = {
        success: "bg-green-50 border-green-100 text-green-950",
        danger: "bg-red-50 border-red-100 text-red-950",
        warning: "bg-amber-50 border-amber-100 text-amber-950",
        info: "bg-blue-50 border-blue-100 text-blue-950"
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `border rounded-2xl p-5 shadow-sm ${styles[tone]}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs font-bold opacity-70",
                children: title
            }, void 0, false, {
                fileName: "[project]/app/battalions/[name]/page.tsx",
                lineNumber: 1739,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xl font-black mt-2",
                children: value
            }, void 0, false, {
                fileName: "[project]/app/battalions/[name]/page.tsx",
                lineNumber: 1743,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm mt-2 opacity-80 leading-6",
                children: subtitle
            }, void 0, false, {
                fileName: "[project]/app/battalions/[name]/page.tsx",
                lineNumber: 1747,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/battalions/[name]/page.tsx",
        lineNumber: 1736,
        columnNumber: 5
    }, this);
}
_c1 = CommanderInsightCard;
function BattalionAiListCard({ title, items, icon }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-white/10 border border-white/10 rounded-2xl p-5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "font-black",
                children: [
                    icon,
                    " ",
                    title
                ]
            }, void 0, true, {
                fileName: "[project]/app/battalions/[name]/page.tsx",
                lineNumber: 1768,
                columnNumber: 7
            }, this),
            items.length > 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                className: "space-y-2 mt-3 text-sm text-slate-200",
                children: items.map((item, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                        className: "leading-6",
                        children: [
                            "• ",
                            item
                        ]
                    }, `${title}-${index}`, true, {
                        fileName: "[project]/app/battalions/[name]/page.tsx",
                        lineNumber: 1780,
                        columnNumber: 15
                    }, this))
            }, void 0, false, {
                fileName: "[project]/app/battalions/[name]/page.tsx",
                lineNumber: 1773,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm text-slate-400 mt-3",
                children: "אין מספיק נתונים."
            }, void 0, false, {
                fileName: "[project]/app/battalions/[name]/page.tsx",
                lineNumber: 1791,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/battalions/[name]/page.tsx",
        lineNumber: 1766,
        columnNumber: 5
    }, this);
}
_c2 = BattalionAiListCard;
function TestProgressChart({ testName, attempts }) {
    const width = 600;
    const height = 260;
    const padding = {
        top: 24,
        right: 24,
        bottom: 52,
        left: 48
    };
    const plotWidth = width - padding.left - padding.right;
    const plotHeight = height - padding.top - padding.bottom;
    const orderedAttempts = [
        ...attempts
    ].sort((a, b)=>a.attempt - b.attempt);
    function xForIndex(index) {
        if (orderedAttempts.length <= 1) {
            return padding.left + plotWidth / 2;
        }
        return padding.left + index / (orderedAttempts.length - 1) * plotWidth;
    }
    function yForPercent(value) {
        const safeValue = Math.max(0, Math.min(100, value));
        return padding.top + (1 - safeValue / 100) * plotHeight;
    }
    function pointsFor(key) {
        return orderedAttempts.map((item, index)=>`${xForIndex(index)},${yForPercent(item[key])}`).join(" ");
    }
    const yTicks = [
        0,
        25,
        50,
        75,
        100
    ];
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-white/10 border border-white/10 rounded-2xl p-4 sm:p-5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-xs text-slate-400",
                                children: "בוחן"
                            }, void 0, false, {
                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                lineNumber: 1919,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                className: "text-xl font-bold mt-1",
                                children: testName
                            }, void 0, false, {
                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                lineNumber: 1923,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/battalions/[name]/page.tsx",
                        lineNumber: 1918,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-wrap gap-3 text-xs",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "flex items-center gap-1.5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "w-3 h-3 rounded-full bg-green-400"
                                    }, void 0, false, {
                                        fileName: "[project]/app/battalions/[name]/page.tsx",
                                        lineNumber: 1931,
                                        columnNumber: 13
                                    }, this),
                                    "עוברים"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                lineNumber: 1930,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "flex items-center gap-1.5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "w-3 h-3 rounded-full bg-red-400"
                                    }, void 0, false, {
                                        fileName: "[project]/app/battalions/[name]/page.tsx",
                                        lineNumber: 1936,
                                        columnNumber: 13
                                    }, this),
                                    "נכשלים"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                lineNumber: 1935,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                className: "flex items-center gap-1.5",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        className: "w-3 h-3 rounded-full bg-sky-400"
                                    }, void 0, false, {
                                        fileName: "[project]/app/battalions/[name]/page.tsx",
                                        lineNumber: 1941,
                                        columnNumber: 13
                                    }, this),
                                    "מצטיינים"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                lineNumber: 1940,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/battalions/[name]/page.tsx",
                        lineNumber: 1928,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/battalions/[name]/page.tsx",
                lineNumber: 1916,
                columnNumber: 7
            }, this),
            orderedAttempts.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "border border-white/10 bg-white/5 rounded-xl p-8 text-center text-slate-400 mt-5",
                children: "טרם הוזנו נתונים לבוחן זה"
            }, void 0, false, {
                fileName: "[project]/app/battalions/[name]/page.tsx",
                lineNumber: 1951,
                columnNumber: 9
            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "w-full overflow-x-auto mt-5",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("svg", {
                            viewBox: `0 0 ${width} ${height}`,
                            className: "w-full min-w-[520px] h-auto",
                            role: "img",
                            "aria-label": `גרף התקדמות ${testName}`,
                            children: [
                                yTicks.map((tick)=>{
                                    const y = yForPercent(tick);
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                                x1: padding.left,
                                                x2: width - padding.right,
                                                y1: y,
                                                y2: y,
                                                stroke: "rgba(255,255,255,0.12)",
                                                strokeWidth: "1"
                                            }, void 0, false, {
                                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                                lineNumber: 1980,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
                                                x: padding.left - 10,
                                                y: y + 4,
                                                textAnchor: "end",
                                                fontSize: "12",
                                                fill: "rgba(226,232,240,0.8)",
                                                children: [
                                                    tick,
                                                    "%"
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                                lineNumber: 1994,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, tick, true, {
                                        fileName: "[project]/app/battalions/[name]/page.tsx",
                                        lineNumber: 1975,
                                        columnNumber: 21
                                    }, this);
                                }),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                    x1: padding.left,
                                    x2: padding.left,
                                    y1: padding.top,
                                    y2: height - padding.bottom,
                                    stroke: "rgba(255,255,255,0.25)",
                                    strokeWidth: "1"
                                }, void 0, false, {
                                    fileName: "[project]/app/battalions/[name]/page.tsx",
                                    lineNumber: 2013,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("line", {
                                    x1: padding.left,
                                    x2: width - padding.right,
                                    y1: height - padding.bottom,
                                    y2: height - padding.bottom,
                                    stroke: "rgba(255,255,255,0.25)",
                                    strokeWidth: "1"
                                }, void 0, false, {
                                    fileName: "[project]/app/battalions/[name]/page.tsx",
                                    lineNumber: 2025,
                                    columnNumber: 15
                                }, this),
                                orderedAttempts.length > 1 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polyline", {
                                            points: pointsFor("passedPercent"),
                                            fill: "none",
                                            stroke: "#4ade80",
                                            strokeWidth: "4",
                                            strokeLinecap: "round",
                                            strokeLinejoin: "round"
                                        }, void 0, false, {
                                            fileName: "[project]/app/battalions/[name]/page.tsx",
                                            lineNumber: 2046,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polyline", {
                                            points: pointsFor("failedPercent"),
                                            fill: "none",
                                            stroke: "#f87171",
                                            strokeWidth: "4",
                                            strokeLinecap: "round",
                                            strokeLinejoin: "round"
                                        }, void 0, false, {
                                            fileName: "[project]/app/battalions/[name]/page.tsx",
                                            lineNumber: 2057,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("polyline", {
                                            points: pointsFor("excellentPercent"),
                                            fill: "none",
                                            stroke: "#38bdf8",
                                            strokeWidth: "4",
                                            strokeLinecap: "round",
                                            strokeLinejoin: "round"
                                        }, void 0, false, {
                                            fileName: "[project]/app/battalions/[name]/page.tsx",
                                            lineNumber: 2068,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/battalions/[name]/page.tsx",
                                    lineNumber: 2045,
                                    columnNumber: 17
                                }, this),
                                orderedAttempts.map((item, index)=>{
                                    const x = xForIndex(index);
                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("g", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                                cx: x,
                                                cy: yForPercent(item.passedPercent),
                                                r: "6",
                                                fill: "#4ade80"
                                            }, void 0, false, {
                                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                                lineNumber: 2097,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                                cx: x,
                                                cy: yForPercent(item.failedPercent),
                                                r: "6",
                                                fill: "#f87171"
                                            }, void 0, false, {
                                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                                lineNumber: 2106,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("circle", {
                                                cx: x,
                                                cy: yForPercent(item.excellentPercent),
                                                r: "6",
                                                fill: "#38bdf8"
                                            }, void 0, false, {
                                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                                lineNumber: 2115,
                                                columnNumber: 23
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("text", {
                                                x: x,
                                                y: height - 20,
                                                textAnchor: "middle",
                                                fontSize: "12",
                                                fill: "rgba(226,232,240,0.9)",
                                                children: attemptLabel(item.attempt)
                                            }, void 0, false, {
                                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                                lineNumber: 2124,
                                                columnNumber: 23
                                            }, this)
                                        ]
                                    }, item.attempt, true, {
                                        fileName: "[project]/app/battalions/[name]/page.tsx",
                                        lineNumber: 2092,
                                        columnNumber: 21
                                    }, this);
                                })
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/battalions/[name]/page.tsx",
                            lineNumber: 1960,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/battalions/[name]/page.tsx",
                        lineNumber: 1958,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-green-400/10 border border-green-400/20 rounded-xl p-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-green-200",
                                        children: "עוברים – מועד אחרון"
                                    }, void 0, false, {
                                        fileName: "[project]/app/battalions/[name]/page.tsx",
                                        lineNumber: 2150,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xl font-bold text-green-300 mt-1",
                                        children: formatPercent(orderedAttempts[orderedAttempts.length - 1].passedPercent)
                                    }, void 0, false, {
                                        fileName: "[project]/app/battalions/[name]/page.tsx",
                                        lineNumber: 2153,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                lineNumber: 2149,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-red-400/10 border border-red-400/20 rounded-xl p-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-red-200",
                                        children: "נכשלים – מועד אחרון"
                                    }, void 0, false, {
                                        fileName: "[project]/app/battalions/[name]/page.tsx",
                                        lineNumber: 2164,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xl font-bold text-red-300 mt-1",
                                        children: formatPercent(orderedAttempts[orderedAttempts.length - 1].failedPercent)
                                    }, void 0, false, {
                                        fileName: "[project]/app/battalions/[name]/page.tsx",
                                        lineNumber: 2167,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                lineNumber: 2163,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-sky-400/10 border border-sky-400/20 rounded-xl p-3",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-sky-200",
                                        children: "מצטיינים – מועד אחרון"
                                    }, void 0, false, {
                                        fileName: "[project]/app/battalions/[name]/page.tsx",
                                        lineNumber: 2178,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xl font-bold text-sky-300 mt-1",
                                        children: formatPercent(orderedAttempts[orderedAttempts.length - 1].excellentPercent)
                                    }, void 0, false, {
                                        fileName: "[project]/app/battalions/[name]/page.tsx",
                                        lineNumber: 2181,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/battalions/[name]/page.tsx",
                                lineNumber: 2177,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/battalions/[name]/page.tsx",
                        lineNumber: 2147,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/battalions/[name]/page.tsx",
                lineNumber: 1957,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/battalions/[name]/page.tsx",
        lineNumber: 1914,
        columnNumber: 5
    }, this);
}
_c3 = TestProgressChart;
function PercentKpi({ title, value, tone }) {
    const styles = {
        success: "bg-green-50 border-green-100 text-green-700",
        danger: "bg-red-50 border-red-100 text-red-700",
        excellent: "bg-sky-50 border-sky-200 text-sky-700"
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `border rounded-3xl p-5 sm:p-6 ${styles[tone]}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm font-bold",
                children: title
            }, void 0, false, {
                fileName: "[project]/app/battalions/[name]/page.tsx",
                lineNumber: 2230,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-4xl sm:text-5xl font-bold mt-2",
                children: value
            }, void 0, false, {
                fileName: "[project]/app/battalions/[name]/page.tsx",
                lineNumber: 2234,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/battalions/[name]/page.tsx",
        lineNumber: 2226,
        columnNumber: 5
    }, this);
}
_c4 = PercentKpi;
function MiniPercent({ title, value, tone }) {
    const styles = {
        success: "bg-green-50 text-green-700",
        danger: "bg-red-50 text-red-700",
        excellent: "bg-sky-50 text-sky-700"
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `rounded-xl p-3 text-center ${styles[tone]}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-[11px] font-bold",
                children: title
            }, void 0, false, {
                fileName: "[project]/app/battalions/[name]/page.tsx",
                lineNumber: 2272,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-lg sm:text-xl font-bold mt-1",
                children: formatPercent(value)
            }, void 0, false, {
                fileName: "[project]/app/battalions/[name]/page.tsx",
                lineNumber: 2276,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/battalions/[name]/page.tsx",
        lineNumber: 2268,
        columnNumber: 5
    }, this);
}
_c5 = MiniPercent;
var _c, _c1, _c2, _c3, _c4, _c5;
__turbopack_context__.k.register(_c, "BattalionPage");
__turbopack_context__.k.register(_c1, "CommanderInsightCard");
__turbopack_context__.k.register(_c2, "BattalionAiListCard");
__turbopack_context__.k.register(_c3, "TestProgressChart");
__turbopack_context__.k.register(_c4, "PercentKpi");
__turbopack_context__.k.register(_c5, "MiniPercent");
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
"[project]/lib/battalion-tests.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

/* =========================================================
   COMMAND FIT
   הגדרת הבחנים לפי גדוד
========================================================= */ __turbopack_context__.s([
    "BATTALION_TESTS",
    ()=>BATTALION_TESTS,
    "getBattalionTests",
    ()=>getBattalionTests,
    "getTestOrder",
    ()=>getTestOrder,
    "getTestType",
    ()=>getTestType,
    "isTestAllowedForBattalion",
    ()=>isTestAllowedForBattalion
]);
/* =========================================================
   דקל
   כש"ג פתיחה → לורן רגיל → כש"ג סוף → לורן משופר
========================================================= */ const DEKEL_TESTS = [
    {
        id: "fitness-opening",
        name: 'כש"ג פתיחה',
        type: "fitness",
        order: 1,
        description: "בוחן הכשירות הגופנית בתחילת התקופה"
    },
    {
        id: "loran-regular",
        name: "לורן",
        type: "loran",
        order: 2,
        description: "בוחן לורן רגיל לפי אוכלוסיית הלורן והמערך האישי"
    },
    {
        id: "fitness-final",
        name: 'כש"ג סוף',
        type: "fitness",
        order: 3,
        description: "בוחן הכשירות הגופנית בסיום התקופה"
    },
    {
        id: "loran-improved",
        name: "לורן משופר",
        type: "improved-loran",
        order: 4,
        description: "בוחן לורן משופר"
    }
];
/* =========================================================
   רימון
   כש"ג פתיחה → לורן רגיל → כש"ג סוף → לורן משופר
========================================================= */ const RIMON_TESTS = [
    {
        id: "fitness-opening",
        name: 'כש"ג פתיחה',
        type: "fitness",
        order: 1,
        description: "בוחן הכשירות הגופנית בתחילת התקופה"
    },
    {
        id: "loran-regular",
        name: "לורן",
        type: "loran",
        order: 2,
        description: "בוחן לורן רגיל לפי אוכלוסיית הלורן והמערך האישי"
    },
    {
        id: "fitness-final",
        name: 'כש"ג סוף',
        type: "fitness",
        order: 3,
        description: "בוחן הכשירות הגופנית בסיום התקופה"
    },
    {
        id: "loran-improved",
        name: "לורן משופר",
        type: "improved-loran",
        order: 4,
        description: "בוחן לורן משופר"
    }
];
/* =========================================================
   גפן
   לורן משופר → כש"ג סוף → בוחן מ"מ

   אין:
   - כש"ג פתיחה
   - לורן רגיל
========================================================= */ const GEFEN_TESTS = [
    {
        id: "loran-improved",
        name: "לורן משופר",
        type: "improved-loran",
        order: 1,
        description: "בוחן לורן משופר"
    },
    {
        id: "fitness-final",
        name: 'כש"ג סוף',
        type: "fitness",
        order: 2,
        description: "בוחן הכשירות הגופנית בסיום תקופת גפן"
    },
    {
        id: "mm-test",
        name: 'בוחן מ"מ',
        type: "mm",
        order: 3,
        description: 'בוחן מ"מ – מתקיים בגדוד גפן בלבד'
    }
];
const BATTALION_TESTS = {
    דקל: DEKEL_TESTS,
    רימון: RIMON_TESTS,
    גפן: GEFEN_TESTS
};
function getBattalionTests(battalionName) {
    return (BATTALION_TESTS[battalionName] ?? []).slice().sort((a, b)=>a.order - b.order);
}
function isTestAllowedForBattalion(battalionName, testName) {
    return getBattalionTests(battalionName).some((test)=>test.name === testName);
}
function getTestType(battalionName, testName) {
    const test = getBattalionTests(battalionName).find((item)=>item.name === testName);
    return test?.type ?? null;
}
function getTestOrder(battalionName, testName) {
    const test = getBattalionTests(battalionName).find((item)=>item.name === testName);
    return test?.order ?? null;
}
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

//# sourceMappingURL=_1lp9j24._.js.map