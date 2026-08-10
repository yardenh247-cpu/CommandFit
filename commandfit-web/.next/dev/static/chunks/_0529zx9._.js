(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/app/battalions/[name]/cadets/page.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PercentageResultsPage
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/client/app-dir/link.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$battalion$2d$tests$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/battalion-tests.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$cycles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/cycles.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$use$2d$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/use-auth.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/lib/supabase.ts [app-client] (ecmascript)");
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
const COMPANY_COUNTS = {
    "דקל": 4,
    "רימון": 4,
    "גפן": 4,
    "דולב": 2,
    "חרוב": 4
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
const GENERAL_COMPANY = "כלל הגדוד";
const STAFF_BATTALIONS = new Set([
    "ארז",
    "ברוש",
    "חרוב",
    "אלון"
]);
const LORAN_METRICS = [
    {
        key: "run",
        title: "ריצה"
    },
    {
        key: "facilities",
        title: "מתקנים",
        failureOnly: true
    },
    {
        key: "ylm",
        title: 'יל"מ'
    }
];
const COMBAT_FITNESS_METRICS = [
    {
        key: "run",
        title: "ריצה"
    },
    {
        key: "sprints",
        title: "ספרינטים"
    },
    {
        key: "pullups",
        title: "מתח"
    },
    {
        key: "push",
        title: "לחיצת חזה / מקבילים"
    },
    {
        key: "floorLift",
        title: "הרמה מהרצפה"
    }
];
const STAFF_FITNESS_METRICS = [
    {
        key: "run",
        title: "ריצה"
    },
    {
        key: "pushups",
        title: "שכיבות סמיכה"
    }
];
function getMetricDefinitions(battalionName, testName) {
    if (testName.includes("לורן")) {
        return LORAN_METRICS;
    }
    const isFitness = testName.includes('כש"ג') || testName.includes("כש״ג");
    if (isFitness) {
        return STAFF_BATTALIONS.has(battalionName) ? STAFF_FITNESS_METRICS : COMBAT_FITNESS_METRICS;
    }
    return [];
}
function formatAverage(value) {
    const clean = String(value ?? "").trim();
    return clean || "אין נתון";
}
function formatMetricFailed(value) {
    if (value === undefined || value === null || Number.isNaN(value)) {
        return "אין נתון";
    }
    return formatPercent(value);
}
function metricFailedPercent(value, testedCount) {
    if (value?.failedCount !== undefined && testedCount > 0) {
        return percentFromCounts(value.failedCount, testedCount);
    }
    // נתונים ישנים: אם נשמר failedPercent, עדיין נציג אותו.
    return value?.failedPercent;
}
function formatMetricFailureSummary(value, testedCount) {
    const percent = metricFailedPercent(value, testedCount);
    if (value?.failedCount === undefined) {
        return percent === undefined ? "אין נתון" : formatPercent(percent);
    }
    return testedCount > 0 ? `${value.failedCount} (${formatPercent(percent ?? null)})` : `${value.failedCount}`;
}
function emptyResult(testName, attempt = 1, company = GENERAL_COMPANY) {
    return {
        testName,
        attempt,
        company,
        passedPercent: 0,
        failedPercent: 0,
        excellentPercent: 0,
        testDate: "",
        metrics: {}
    };
}
function clampPercent(value) {
    const n = Number(value);
    if (Number.isNaN(n)) return 0;
    return Math.min(100, Math.max(0, Math.round(n * 10) / 10));
}
function formatPercent(value) {
    if (value === null || Number.isNaN(value)) return "—";
    return `${Math.round(value * 10) / 10}%`;
}
function safeInt(value) {
    if (!Number.isFinite(value)) return 0;
    return Math.max(0, Math.round(value));
}
function percentFromCounts(part, total) {
    if (total <= 0) return null;
    return Math.round(part / total * 1000) / 10;
}
function attemptLabel(attempt) {
    const labels = {
        1: "מועד א׳",
        2: "מועד ב׳",
        3: "מועד ג׳",
        4: "מועד ד׳",
        5: "מועד ה׳"
    };
    return labels[attempt] ?? `מועד ${attempt}`;
}
function PercentageResultsPage() {
    _s();
    const { isViewer } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$use$2d$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"])();
    const params = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"])();
    const battalionName = decodeURIComponent(params.name);
    const [activeCycle, setActiveCycle] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const tests = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "PercentageResultsPage.useMemo[tests]": ()=>(0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$battalion$2d$tests$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getBattalionTests"])(battalionName)
    }["PercentageResultsPage.useMemo[tests]"], [
        battalionName
    ]);
    const [selectedTest, setSelectedTest] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [selectedCompany, setSelectedCompany] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(GENERAL_COMPANY);
    const companies = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "PercentageResultsPage.useMemo[companies]": ()=>getCompanies(battalionName)
    }["PercentageResultsPage.useMemo[companies]"], [
        battalionName
    ]);
    const [result, setResult] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [attempts, setAttempts] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(true);
    const [saving, setSaving] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [message, setMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [openingStrength, setOpeningStrength] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [currentStrength, setCurrentStrength] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [tested, setTested] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [passedCount, setPassedCount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [excellentCount, setExcellentCount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [absentCount, setAbsentCount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [dismissedCount, setDismissedCount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const [previousCumulativePassed, setPreviousCumulativePassed] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(0);
    const cycleId = activeCycle?.id ?? `legacy-${battalionName}`;
    const isReadOnly = isViewer || activeCycle?.status === "closed";
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PercentageResultsPage.useEffect": ()=>{
            setActiveCycle((0, __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$cycles$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getActiveCycle"])(battalionName));
        }
    }["PercentageResultsPage.useEffect"], [
        battalionName
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PercentageResultsPage.useEffect": ()=>{
            if (!tests.length) {
                setSelectedTest(null);
                setResult(null);
                return;
            }
            setSelectedTest({
                "PercentageResultsPage.useEffect": (current)=>current && tests.some({
                        "PercentageResultsPage.useEffect": (test)=>test.name === current.name
                    }["PercentageResultsPage.useEffect"]) ? current : tests[0]
            }["PercentageResultsPage.useEffect"]);
        }
    }["PercentageResultsPage.useEffect"], [
        tests
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PercentageResultsPage.useEffect": ()=>{
            let cancelled = false;
            async function load() {
                if (!selectedTest) {
                    setAttempts([]);
                    setResult(null);
                    setLoading(false);
                    return;
                }
                setLoading(true);
                setMessage("");
                const { data, error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("percentage_test_results").select("test_name,attempt,company,passed_percent,failed_percent,excellent_percent,test_date,metrics").eq("cycle_id", cycleId).eq("battalion", battalionName).eq("test_name", selectedTest.name).eq("company", selectedCompany).order("attempt", {
                    ascending: true
                });
                if (cancelled) return;
                if (error) {
                    console.error(error);
                    setAttempts([]);
                    setResult(emptyResult(selectedTest.name, 1, selectedCompany));
                    setMessage("לא ניתן היה לטעון את נתוני האחוזים מהענן");
                    setLoading(false);
                    return;
                }
                const loaded = (data ?? []).map({
                    "PercentageResultsPage.useEffect.load.loaded": (row)=>({
                            testName: row.test_name,
                            attempt: row.attempt ?? 1,
                            company: row.company ?? GENERAL_COMPANY,
                            passedPercent: Number(row.passed_percent ?? 0),
                            failedPercent: Number(row.failed_percent ?? 100),
                            excellentPercent: Number(row.excellent_percent ?? 0),
                            testDate: row.test_date ?? "",
                            metrics: row.metrics ?? {}
                        })
                }["PercentageResultsPage.useEffect.load.loaded"]);
                setAttempts(loaded);
                setResult(loaded.length ? loaded[loaded.length - 1] : emptyResult(selectedTest.name, 1, selectedCompany));
                setLoading(false);
            }
            load();
            return ({
                "PercentageResultsPage.useEffect": ()=>{
                    cancelled = true;
                }
            })["PercentageResultsPage.useEffect"];
        }
    }["PercentageResultsPage.useEffect"], [
        battalionName,
        cycleId,
        selectedTest,
        selectedCompany
    ]);
    const calculator = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "PercentageResultsPage.useMemo[calculator]": ()=>{
            const opening = safeInt(openingStrength);
            const current = safeInt(currentStrength);
            const testedNow = safeInt(tested);
            const passedNow = safeInt(passedCount);
            const excellentNow = safeInt(excellentCount);
            const absentNow = safeInt(absentCount);
            const dismissedNow = safeInt(dismissedCount);
            const previousPassed = safeInt(previousCumulativePassed);
            const failedNow = Math.max(0, testedNow - passedNow);
            const cumulativePassed = previousPassed + passedNow;
            const attendancePercent = percentFromCounts(testedNow, current);
            const passOfTestedPercent = percentFromCounts(passedNow, testedNow);
            const failOfTestedPercent = percentFromCounts(failedNow, testedNow);
            const excellentOfTestedPercent = percentFromCounts(excellentNow, testedNow);
            const remainingCohortPercent = percentFromCounts(current, opening);
            const cumulativePassOfOpeningPercent = percentFromCounts(cumulativePassed, opening);
            const valid = opening > 0 && current > 0 && testedNow > 0 && passedNow <= testedNow && excellentNow <= passedNow && current <= opening && testedNow + absentNow <= current && dismissedNow <= opening && cumulativePassed <= opening;
            return {
                failedNow,
                cumulativePassed,
                attendancePercent,
                passOfTestedPercent,
                failOfTestedPercent,
                excellentOfTestedPercent,
                remainingCohortPercent,
                cumulativePassOfOpeningPercent,
                valid
            };
        }
    }["PercentageResultsPage.useMemo[calculator]"], [
        openingStrength,
        currentStrength,
        tested,
        passedCount,
        excellentCount,
        absentCount,
        dismissedCount,
        previousCumulativePassed
    ]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PercentageResultsPage.useEffect": ()=>{
            if (isReadOnly || !result) return;
            setResult({
                "PercentageResultsPage.useEffect": (current)=>{
                    if (!current) return current;
                    return {
                        ...current,
                        passedPercent: calculator.passOfTestedPercent ?? 0,
                        failedPercent: calculator.failOfTestedPercent ?? 0,
                        excellentPercent: calculator.excellentOfTestedPercent ?? 0
                    };
                }
            }["PercentageResultsPage.useEffect"]);
        }
    }["PercentageResultsPage.useEffect"], [
        calculator.passOfTestedPercent,
        calculator.failOfTestedPercent,
        calculator.excellentOfTestedPercent,
        isReadOnly,
        result?.attempt
    ]);
    const metricDefinitions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "PercentageResultsPage.useMemo[metricDefinitions]": ()=>selectedTest ? getMetricDefinitions(battalionName, selectedTest.name) : []
    }["PercentageResultsPage.useMemo[metricDefinitions]"], [
        battalionName,
        selectedTest
    ]);
    const validation = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "PercentageResultsPage.useMemo[validation]": ()=>{
            if (!result) return {
                valid: false,
                text: ""
            };
            if (!result.testDate) {
                return {
                    valid: false,
                    text: "יש להזין תאריך ביצוע לבוחן."
                };
            }
            if (result.passedPercent < 0 || result.passedPercent > 100 || result.failedPercent < 0 || result.failedPercent > 100 || result.excellentPercent < 0 || result.excellentPercent > 100) {
                return {
                    valid: false,
                    text: "כל אחוז חייב להיות בין 0% ל־100%."
                };
            }
            if (Math.abs(result.passedPercent + result.failedPercent - 100) > 0.11) {
                return {
                    valid: false,
                    text: "אחוז העוברים והנכשלים חייב להסתכם ל־100%."
                };
            }
            if (result.excellentPercent > result.passedPercent) {
                return {
                    valid: false,
                    text: "אחוז המצטיינים לא יכול להיות גבוה מאחוז העוברים."
                };
            }
            return {
                valid: true,
                text: "הנתונים תקינים ומוכנים לשמירה."
            };
        }
    }["PercentageResultsPage.useMemo[validation]"], [
        result
    ]);
    function updatePassed(value) {
        if (isReadOnly || !result) return;
        const passed = clampPercent(value);
        const failed = Math.round((100 - passed) * 10) / 10;
        setResult({
            ...result,
            passedPercent: passed,
            failedPercent: failed,
            excellentPercent: Math.min(result.excellentPercent, passed)
        });
        setMessage("");
    }
    function updateExcellent(value) {
        if (isReadOnly || !result) return;
        setResult({
            ...result,
            excellentPercent: clampPercent(value)
        });
        setMessage("");
    }
    function selectAttempt(attempt) {
        const existing = attempts.find((item)=>item.attempt === attempt);
        if (existing) setResult(existing);
    }
    function createNextAttempt() {
        if (isReadOnly || !selectedTest) return;
        const highest = attempts.reduce((max, item)=>Math.max(max, item.attempt), 0);
        setResult(emptyResult(selectedTest.name, highest + 1, selectedCompany));
        setMessage("");
    }
    function updateMetricAverage(key, value) {
        if (isReadOnly || !result) {
            return;
        }
        setResult({
            ...result,
            metrics: {
                ...result.metrics,
                [key]: {
                    ...result.metrics[key],
                    average: value
                }
            }
        });
        setMessage("");
    }
    function updateMetricFailedCount(key, value) {
        if (isReadOnly || !result) {
            return;
        }
        const clean = value.trim();
        const failedCount = clean === "" ? undefined : Math.max(0, Math.min(safeInt(tested), safeInt(Number(clean))));
        setResult({
            ...result,
            metrics: {
                ...result.metrics,
                [key]: {
                    ...result.metrics[key],
                    failedCount,
                    // ברגע שמזינים כמות חדשה, לא משתמשים יותר באחוז הישן.
                    failedPercent: undefined
                }
            }
        });
        setMessage("");
    }
    async function saveResult() {
        if (isReadOnly || !result || !selectedTest || !validation.valid) return;
        setSaving(true);
        setMessage("שומר לענן...");
        const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("percentage_test_results").upsert({
            cycle_id: cycleId,
            battalion: battalionName,
            test_name: selectedTest.name,
            attempt: result.attempt,
            company: selectedCompany,
            passed_percent: result.passedPercent,
            failed_percent: result.failedPercent,
            excellent_percent: result.excellentPercent,
            test_date: result.testDate,
            metrics: result.metrics,
            updated_at: new Date().toISOString()
        }, {
            onConflict: "cycle_id,battalion,test_name,attempt,company"
        });
        if (error) {
            console.error(error);
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
        setMessage("האחוזים נשמרו בענן בהצלחה");
        setSaving(false);
    }
    async function deleteCurrentAttempt() {
        if (isReadOnly || !result || !selectedTest) {
            return;
        }
        const exists = attempts.some((item)=>item.attempt === result.attempt);
        if (!exists) {
            setMessage("המועד עדיין לא נשמר ולכן אין מה למחוק.");
            return;
        }
        const approved = window.confirm(`למחוק את ${attemptLabel(result.attempt)} של ${selectedTest.name}?\n\nהתוצאות והתאריך של המועד יימחקו לצמיתות.`);
        if (!approved) {
            return;
        }
        setSaving(true);
        setMessage("מוחק את המועד...");
        const { error } = await __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$supabase$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["supabase"].from("percentage_test_results").delete().eq("cycle_id", cycleId).eq("battalion", battalionName).eq("test_name", selectedTest.name).eq("attempt", result.attempt).eq("company", selectedCompany);
        if (error) {
            console.error(error);
            setMessage(`מחיקת המועד נכשלה: ${error.message}`);
            setSaving(false);
            return;
        }
        const remaining = attempts.filter((item)=>item.attempt !== result.attempt).sort((a, b)=>a.attempt - b.attempt);
        setAttempts(remaining);
        setResult(remaining.length > 0 ? remaining[remaining.length - 1] : emptyResult(selectedTest.name, 1, selectedCompany));
        setMessage("המועד נמחק בהצלחה");
        setSaving(false);
    }
    if (loading && !result) {
        return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
            dir: "rtl",
            className: "min-h-screen bg-slate-100 flex items-center justify-center p-4",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "bg-white rounded-2xl p-8 shadow-sm text-slate-700",
                children: "טוען נתוני ביצוע..."
            }, void 0, false, {
                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                lineNumber: 806,
                columnNumber: 9
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
            lineNumber: 805,
            columnNumber: 7
        }, this);
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("main", {
        dir: "rtl",
        className: "min-h-screen bg-slate-100 text-slate-900",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("header", {
                className: "bg-slate-900 text-white px-4 sm:px-6 lg:px-8 py-5 sm:py-7",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "max-w-[1500px] mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-5",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-slate-300 text-sm",
                                    children: "CommandFit"
                                }, void 0, false, {
                                    fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                    lineNumber: 818,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                    className: "text-2xl sm:text-3xl font-bold mt-1",
                                    children: [
                                        "תמונת מצב באחוזים – גדוד ",
                                        battalionName
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                    lineNumber: 819,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-slate-300 mt-2",
                                    children: "ללא שמות צוערים וללא נתוני כוח אדם מספריים"
                                }, void 0, false, {
                                    fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                    lineNumber: 822,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                            lineNumber: 817,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$client$2f$app$2d$dir$2f$link$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
                            href: `/battalions/${encodeURIComponent(battalionName)}`,
                            className: "w-full lg:w-auto bg-white/10 hover:bg-white/20 rounded-xl px-5 py-3 text-center",
                            children: "חזרה לגדוד"
                        }, void 0, false, {
                            fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                            lineNumber: 827,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                    lineNumber: 816,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                lineNumber: 815,
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
                                children: "🔒 תצוגה מצרפית בלבד"
                            }, void 0, false, {
                                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                lineNumber: 838,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-blue-800 mt-1 leading-6",
                                children: "נשמרים אחוזי ביצוע בלבד. ניתן לעבוד ברמת כלל הגדוד או פלוגה נבחרת, ללא שמות צוערים."
                            }, void 0, false, {
                                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                lineNumber: 839,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                        lineNumber: 837,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                        className: "bg-white rounded-3xl shadow-sm p-5 sm:p-6 mb-6",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col lg:flex-row lg:items-end justify-between gap-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "block text-sm font-bold text-slate-900 mb-2",
                                                children: "בוחן"
                                            }, void 0, false, {
                                                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                lineNumber: 847,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                value: selectedTest?.name ?? "",
                                                onChange: (event)=>{
                                                    const next = tests.find((test)=>test.name === event.target.value);
                                                    setSelectedTest(next ?? null);
                                                },
                                                className: "w-full border border-slate-300 rounded-xl px-4 py-3 bg-white text-slate-900",
                                                children: tests.map((test)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: test.name,
                                                        children: test.name
                                                    }, test.id, false, {
                                                        fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                        lineNumber: 857,
                                                        columnNumber: 19
                                                    }, this))
                                            }, void 0, false, {
                                                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                lineNumber: 848,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                        lineNumber: 846,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                className: "block text-sm font-bold text-slate-900 mb-2",
                                                children: "תצוגה / הזנה"
                                            }, void 0, false, {
                                                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                lineNumber: 865,
                                                columnNumber: 15
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("select", {
                                                value: selectedCompany,
                                                onChange: (event)=>{
                                                    setSelectedCompany(event.target.value);
                                                    setMessage("");
                                                },
                                                className: "w-full border border-slate-300 rounded-xl px-4 py-3 bg-white text-slate-900",
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                        value: GENERAL_COMPANY,
                                                        children: "כלל הגדוד"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                        lineNumber: 879,
                                                        columnNumber: 17
                                                    }, this),
                                                    companies.map((company)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("option", {
                                                            value: company,
                                                            children: company
                                                        }, company, false, {
                                                            fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                            lineNumber: 885,
                                                            columnNumber: 21
                                                        }, this))
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                lineNumber: 869,
                                                columnNumber: 15
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                        lineNumber: 864,
                                        columnNumber: 13
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        disabled: isReadOnly,
                                        onClick: createNextAttempt,
                                        className: "bg-blue-50 text-blue-700 border border-blue-100 rounded-xl px-5 py-3 font-bold disabled:opacity-50",
                                        children: "+ מועד נוסף"
                                    }, void 0, false, {
                                        fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                        lineNumber: 896,
                                        columnNumber: 13
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                lineNumber: 845,
                                columnNumber: 11
                            }, this),
                            !!attempts.length && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-wrap gap-2 mt-5",
                                children: attempts.map((item)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        onClick: ()=>selectAttempt(item.attempt),
                                        className: result?.attempt === item.attempt ? "bg-slate-900 text-white rounded-xl px-4 py-2 font-bold" : "bg-slate-100 text-slate-700 rounded-xl px-4 py-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: attemptLabel(item.attempt)
                                            }, void 0, false, {
                                                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                lineNumber: 919,
                                                columnNumber: 19
                                            }, this),
                                            item.testDate && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "block text-[11px] opacity-75 mt-0.5",
                                                children: new Date(`${item.testDate}T00:00:00`).toLocaleDateString("he-IL")
                                            }, void 0, false, {
                                                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                lineNumber: 921,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, item.attempt, true, {
                                        fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                        lineNumber: 909,
                                        columnNumber: 17
                                    }, this))
                            }, void 0, false, {
                                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                lineNumber: 907,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                        lineNumber: 844,
                        columnNumber: 9
                    }, this),
                    result && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                className: "bg-white rounded-3xl shadow-sm p-4 sm:p-5 mb-4 border border-slate-200",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex flex-col sm:flex-row sm:items-center justify-between gap-3",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-xs text-slate-500",
                                                    children: "מועד נבחר"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                    lineNumber: 936,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                    className: "text-lg sm:text-xl font-black mt-1",
                                                    children: [
                                                        selectedTest?.name,
                                                        " • ",
                                                        attemptLabel(result.attempt)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                    lineNumber: 937,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-sm font-bold text-blue-700 mt-1",
                                                    children: selectedCompany
                                                }, void 0, false, {
                                                    fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                    lineNumber: 941,
                                                    columnNumber: 19
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                            lineNumber: 935,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-full sm:w-auto",
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                    className: "block text-xs font-bold text-slate-600 mb-1",
                                                    children: "תאריך ביצוע הבוחן"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                    lineNumber: 947,
                                                    columnNumber: 19
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                    type: "date",
                                                    value: result.testDate,
                                                    disabled: isReadOnly,
                                                    onChange: (event)=>{
                                                        setResult({
                                                            ...result,
                                                            testDate: event.target.value
                                                        });
                                                        setMessage("");
                                                    },
                                                    className: "w-full sm:w-auto border border-slate-300 rounded-xl px-4 py-3 bg-white text-slate-900 disabled:bg-slate-100"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                    lineNumber: 950,
                                                    columnNumber: 19
                                                }, this),
                                                !!attempts.find((item)=>item.attempt === result.attempt) && !isReadOnly && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    className: "text-[11px] text-blue-700 font-bold mt-1",
                                                    children: "✏️ ניתן לשנות את התאריך ולשמור מחדש את המועד"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                    lineNumber: 964,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                            lineNumber: 946,
                                            columnNumber: 17
                                        }, this),
                                        !isReadOnly && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "hidden sm:flex items-center gap-2",
                                            children: [
                                                attempts.some((item)=>item.attempt === result.attempt) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    disabled: saving,
                                                    onClick: deleteCurrentAttempt,
                                                    className: "bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl px-4 py-3 font-bold disabled:opacity-40",
                                                    children: "🗑️ מחיקת מועד"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                    lineNumber: 977,
                                                    columnNumber: 23
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                    type: "button",
                                                    disabled: saving || !validation.valid || !calculator.valid,
                                                    onClick: saveResult,
                                                    className: "bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-5 py-3 font-bold disabled:opacity-40",
                                                    children: saving ? "שומר..." : attempts.some((item)=>item.attempt === result.attempt) ? "💾 שמירת שינויים במועד" : "💾 שמירת תוצאות המועד"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                    lineNumber: 989,
                                                    columnNumber: 21
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                            lineNumber: 971,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                    lineNumber: 934,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                lineNumber: 933,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("details", {
                                className: "bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("summary", {
                                        className: "font-black text-blue-900 cursor-pointer",
                                        children: "💡 איך מזינים נכון?"
                                    }, void 0, false, {
                                        fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                        lineNumber: 1007,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "text-sm text-blue-800 leading-7 mt-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                children: "במועד א׳ מזינים את כל מי שניגשו בפועל לבוחן."
                                            }, void 0, false, {
                                                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                lineNumber: 1011,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                children: "במועד ב׳/ג׳ מזינים רק את מי שניגשו לאותו מועד חוזר."
                                            }, void 0, false, {
                                                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                lineNumber: 1012,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                children: "אין להזין נכשלים — המערכת מחשבת ניגשו פחות עברו."
                                            }, void 0, false, {
                                                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                lineNumber: 1013,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                children: "מצטיינים חייבים להיות חלק מתוך העוברים."
                                            }, void 0, false, {
                                                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                lineNumber: 1014,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                children: "מצבה נוכחית היא המצבה הפעילה בשלב הנוכחי בקורס."
                                            }, void 0, false, {
                                                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                lineNumber: 1015,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                        lineNumber: 1010,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                lineNumber: 1006,
                                columnNumber: 13
                            }, this),
                            !isReadOnly && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                className: "bg-white rounded-3xl shadow-sm p-4 sm:p-5 mb-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                className: "text-lg sm:text-xl font-black",
                                                children: "🧮 הזנת כמויות"
                                            }, void 0, false, {
                                                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                lineNumber: 1022,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                className: "text-xs sm:text-sm text-slate-500 mt-1",
                                                children: "האחוזים מחושבים ומתעדכנים אוטומטית בזמן ההזנה."
                                            }, void 0, false, {
                                                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                lineNumber: 1025,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                        lineNumber: 1021,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 mt-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CompactNumberField, {
                                                title: "מצבת פתיחה",
                                                value: openingStrength,
                                                onChange: setOpeningStrength
                                            }, void 0, false, {
                                                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                lineNumber: 1031,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CompactNumberField, {
                                                title: "מצבה נוכחית",
                                                value: currentStrength,
                                                onChange: setCurrentStrength
                                            }, void 0, false, {
                                                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                lineNumber: 1032,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CompactNumberField, {
                                                title: "ניגשו",
                                                value: tested,
                                                onChange: setTested
                                            }, void 0, false, {
                                                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                lineNumber: 1033,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CompactNumberField, {
                                                title: "עברו",
                                                value: passedCount,
                                                onChange: setPassedCount
                                            }, void 0, false, {
                                                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                lineNumber: 1034,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CompactNumberField, {
                                                title: "מצטיינים",
                                                value: excellentCount,
                                                onChange: setExcellentCount
                                            }, void 0, false, {
                                                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                lineNumber: 1035,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CompactNumberField, {
                                                title: "לא ניגשו",
                                                value: absentCount,
                                                onChange: setAbsentCount
                                            }, void 0, false, {
                                                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                lineNumber: 1036,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CompactNumberField, {
                                                title: "מודחים / עזבו",
                                                value: dismissedCount,
                                                onChange: setDismissedCount
                                            }, void 0, false, {
                                                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                lineNumber: 1037,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CompactNumberField, {
                                                title: "עברו קודם",
                                                value: previousCumulativePassed,
                                                onChange: setPreviousCumulativePassed
                                            }, void 0, false, {
                                                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                lineNumber: 1038,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                        lineNumber: 1030,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 mt-4",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CompactResultCard, {
                                                title: "% ניגשו מהמצבה",
                                                value: formatPercent(calculator.attendancePercent),
                                                tone: "neutral"
                                            }, void 0, false, {
                                                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                lineNumber: 1042,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CompactResultCard, {
                                                title: "% עברו מהניגשים",
                                                value: formatPercent(calculator.passOfTestedPercent),
                                                tone: "success"
                                            }, void 0, false, {
                                                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                lineNumber: 1043,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CompactResultCard, {
                                                title: "% נכשלו מהניגשים",
                                                value: formatPercent(calculator.failOfTestedPercent),
                                                tone: "danger"
                                            }, void 0, false, {
                                                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                lineNumber: 1044,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CompactResultCard, {
                                                title: "% מצטיינים מהניגשים",
                                                value: formatPercent(calculator.excellentOfTestedPercent),
                                                tone: "excellent"
                                            }, void 0, false, {
                                                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                lineNumber: 1045,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CompactResultCard, {
                                                title: "% שנותרו במחזור",
                                                value: formatPercent(calculator.remainingCohortPercent),
                                                tone: "neutral"
                                            }, void 0, false, {
                                                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                lineNumber: 1046,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CompactResultCard, {
                                                title: "% מעבר מצטבר מהפתיחה",
                                                value: formatPercent(calculator.cumulativePassOfOpeningPercent),
                                                tone: "neutral"
                                            }, void 0, false, {
                                                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                lineNumber: 1047,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                        lineNumber: 1041,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: calculator.valid ? "bg-green-50 border border-green-100 text-green-700 rounded-xl p-3 mt-4 text-sm font-bold" : "bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3 mt-4 text-sm font-bold",
                                        children: calculator.valid ? `✅ החישוב תקין. נכשלו במועד: ${calculator.failedNow}` : "⚠️ ודא שיש מצבת פתיחה, מצבה נוכחית וניגשים, ושכל הכמויות מסתדרות."
                                    }, void 0, false, {
                                        fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                        lineNumber: 1050,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                lineNumber: 1020,
                                columnNumber: 15
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                className: "bg-white rounded-3xl shadow-sm p-4 sm:p-5 mb-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex flex-col lg:flex-row lg:items-end justify-between gap-3",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                                        className: "text-lg sm:text-xl font-black",
                                                        children: "סיכום המועד – אחוזים ומרכיבי הבוחן"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                        lineNumber: 1067,
                                                        columnNumber: 19
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs sm:text-sm text-slate-500 mt-1",
                                                        children: "כל נתוני המועד מרוכזים במקום אחד: מעבר, כישלון, מצטיינים והממוצע / אחוז הכשל בכל מרכיב."
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                        lineNumber: 1071,
                                                        columnNumber: 19
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                lineNumber: 1066,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "text-sm font-bold text-slate-600",
                                                children: [
                                                    selectedTest?.name,
                                                    " • ",
                                                    attemptLabel(result.attempt),
                                                    result.testDate && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                        className: "mr-2",
                                                        children: [
                                                            "•",
                                                            " ",
                                                            new Date(`${result.testDate}T00:00:00`).toLocaleDateString("he-IL")
                                                        ]
                                                    }, void 0, true, {
                                                        fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                        lineNumber: 1079,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                lineNumber: 1076,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                        lineNumber: 1065,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "grid grid-cols-3 gap-2 sm:gap-3 mt-5",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CompactPercentCard, {
                                                title: "עברו",
                                                value: result.passedPercent,
                                                tone: "success"
                                            }, void 0, false, {
                                                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                lineNumber: 1092,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CompactPercentCard, {
                                                title: "נכשלו",
                                                value: result.failedPercent,
                                                tone: "danger"
                                            }, void 0, false, {
                                                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                lineNumber: 1097,
                                                columnNumber: 17
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(CompactPercentCard, {
                                                title: "מצטיינים",
                                                value: result.excellentPercent,
                                                tone: "excellent"
                                            }, void 0, false, {
                                                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                lineNumber: 1102,
                                                columnNumber: 17
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                        lineNumber: 1091,
                                        columnNumber: 15
                                    }, this),
                                    metricDefinitions.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-6 border-t border-slate-100 pt-6",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                                                        className: "text-lg font-black",
                                                        children: "פירוט לפי מרכיבי הבוחן"
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                        lineNumber: 1112,
                                                        columnNumber: 21
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                        className: "text-xs sm:text-sm text-slate-500 mt-1",
                                                        children: "הזן את ממוצע המרכיב ואת מספר הנכשלים בו. אחוז הנכשלים יחושב אוטומטית מתוך מספר הניגשים במחשבון. אם אין פילוח אמיתי, השאר ריק."
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                        lineNumber: 1116,
                                                        columnNumber: 21
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                lineNumber: 1111,
                                                columnNumber: 19
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                className: "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mt-4",
                                                children: metricDefinitions.map((metric)=>{
                                                    const value = result.metrics[metric.key];
                                                    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        className: "border border-slate-200 rounded-2xl p-4 bg-slate-50",
                                                        children: [
                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: "flex items-center justify-between gap-3",
                                                                children: [
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                                                                        className: "font-black text-lg",
                                                                        children: metric.title
                                                                    }, void 0, false, {
                                                                        fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                                        lineNumber: 1137,
                                                                        columnNumber: 31
                                                                    }, this),
                                                                    (value?.failedCount !== undefined || value?.failedPercent !== undefined) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                        className: "bg-red-50 border border-red-100 text-red-700 rounded-lg px-2 py-1 text-xs font-black",
                                                                        children: [
                                                                            formatMetricFailureSummary(value, safeInt(tested)),
                                                                            " ",
                                                                            "נכשלים"
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                                        lineNumber: 1145,
                                                                        columnNumber: 33
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                                lineNumber: 1136,
                                                                columnNumber: 29
                                                            }, this),
                                                            !isReadOnly ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: `grid ${metric.failureOnly ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"} gap-3 mt-4`,
                                                                children: [
                                                                    !metric.failureOnly && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                        className: "bg-white border border-slate-200 rounded-xl p-3",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "block text-xs font-bold text-slate-600",
                                                                                children: "ממוצע"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                                                lineNumber: 1165,
                                                                                columnNumber: 37
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                type: "text",
                                                                                value: value?.average ?? "",
                                                                                onChange: (event)=>updateMetricAverage(metric.key, event.target.value),
                                                                                placeholder: "לדוגמה 12:21 / 48 / 10",
                                                                                className: "w-full border border-slate-300 rounded-lg px-3 py-2 mt-2 bg-white font-bold"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                                                lineNumber: 1169,
                                                                                columnNumber: 37
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                                        lineNumber: 1164,
                                                                        columnNumber: 35
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                                                                        className: "bg-red-50 border border-red-100 rounded-xl p-3",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                                className: "block text-xs font-bold text-red-700",
                                                                                children: "מספר נכשלים"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                                                lineNumber: 1190,
                                                                                columnNumber: 35
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                                                                type: "number",
                                                                                min: 0,
                                                                                max: safeInt(tested),
                                                                                step: 1,
                                                                                value: value?.failedCount ?? "",
                                                                                onChange: (event)=>updateMetricFailedCount(metric.key, event.target.value),
                                                                                placeholder: "לדוגמה 6",
                                                                                className: "w-full border border-red-200 rounded-lg px-3 py-2 mt-2 bg-white font-black text-red-700"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                                                lineNumber: 1194,
                                                                                columnNumber: 35
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                                        lineNumber: 1189,
                                                                        columnNumber: 33
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                                lineNumber: 1156,
                                                                columnNumber: 31
                                                            }, this) : /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                className: `grid ${metric.failureOnly ? "grid-cols-1" : "grid-cols-2"} gap-3 mt-4`,
                                                                children: [
                                                                    !metric.failureOnly && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "bg-white border border-slate-200 rounded-xl p-3",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                className: "text-xs text-slate-500",
                                                                                children: "ממוצע"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                                                lineNumber: 1226,
                                                                                columnNumber: 37
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                className: "text-xl font-black mt-1",
                                                                                children: formatAverage(value?.average)
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                                                lineNumber: 1229,
                                                                                columnNumber: 37
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                                        lineNumber: 1225,
                                                                        columnNumber: 35
                                                                    }, this),
                                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                        className: "bg-red-50 border border-red-100 rounded-xl p-3",
                                                                        children: [
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                className: "text-xs text-red-600",
                                                                                children: "נכשלים"
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                                                lineNumber: 1238,
                                                                                columnNumber: 35
                                                                            }, this),
                                                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                                className: "text-xl font-black text-red-700 mt-1",
                                                                                children: formatMetricFailureSummary(value, safeInt(tested))
                                                                            }, void 0, false, {
                                                                                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                                                lineNumber: 1241,
                                                                                columnNumber: 35
                                                                            }, this)
                                                                        ]
                                                                    }, void 0, true, {
                                                                        fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                                        lineNumber: 1237,
                                                                        columnNumber: 33
                                                                    }, this)
                                                                ]
                                                            }, void 0, true, {
                                                                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                                lineNumber: 1217,
                                                                columnNumber: 31
                                                            }, this)
                                                        ]
                                                    }, metric.key, true, {
                                                        fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                        lineNumber: 1130,
                                                        columnNumber: 27
                                                    }, this);
                                                })
                                            }, void 0, false, {
                                                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                lineNumber: 1121,
                                                columnNumber: 19
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                        lineNumber: 1110,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: validation.valid && calculator.valid ? "bg-green-50 border border-green-100 text-green-700 rounded-xl p-3 mt-5 text-sm" : "bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3 mt-5 text-sm",
                                        children: calculator.valid ? validation.text : "השלם הזנת כמויות תקינה לפני השמירה."
                                    }, void 0, false, {
                                        fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                        lineNumber: 1258,
                                        columnNumber: 15
                                    }, this),
                                    message && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "bg-blue-50 border border-blue-100 text-blue-700 rounded-xl p-3 mt-3 text-sm",
                                        children: message
                                    }, void 0, false, {
                                        fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                        lineNumber: 1272,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                lineNumber: 1064,
                                columnNumber: 13
                            }, this),
                            !!attempts.length && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("section", {
                                className: "bg-white rounded-3xl shadow-sm p-4 sm:p-5 mb-4",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                        className: "text-lg sm:text-xl font-black",
                                        children: "היסטוריית מועדים"
                                    }, void 0, false, {
                                        fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                        lineNumber: 1280,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "space-y-3 mt-4",
                                        children: attempts.map((attempt)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                                type: "button",
                                                onClick: ()=>selectAttempt(attempt.attempt),
                                                className: "w-full text-right bg-slate-50 hover:bg-slate-100 border border-slate-100 rounded-2xl p-4",
                                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                    className: "flex flex-col lg:flex-row lg:items-center justify-between gap-3",
                                                    children: [
                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: [
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                                    className: "font-black",
                                                                    children: [
                                                                        attemptLabel(attempt.attempt),
                                                                        attempt.testDate && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "text-slate-400 font-medium mr-2",
                                                                            children: [
                                                                                "•",
                                                                                " ",
                                                                                new Date(`${attempt.testDate}T00:00:00`).toLocaleDateString("he-IL")
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                                            lineNumber: 1306,
                                                                            columnNumber: 33
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                                    lineNumber: 1301,
                                                                    columnNumber: 29
                                                                }, this),
                                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                                    className: "flex flex-wrap gap-3 mt-2 text-sm",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "text-green-700 font-bold",
                                                                            children: [
                                                                                "עברו",
                                                                                " ",
                                                                                formatPercent(attempt.passedPercent)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                                            lineNumber: 1318,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "text-red-700 font-bold",
                                                                            children: [
                                                                                "נכשלו",
                                                                                " ",
                                                                                formatPercent(attempt.failedPercent)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                                            lineNumber: 1325,
                                                                            columnNumber: 31
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "text-sky-700 font-bold",
                                                                            children: [
                                                                                "מצטיינים",
                                                                                " ",
                                                                                formatPercent(attempt.excellentPercent)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                                            lineNumber: 1332,
                                                                            columnNumber: 31
                                                                        }, this)
                                                                    ]
                                                                }, void 0, true, {
                                                                    fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                                    lineNumber: 1317,
                                                                    columnNumber: 29
                                                                }, this)
                                                            ]
                                                        }, void 0, true, {
                                                            fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                            lineNumber: 1300,
                                                            columnNumber: 27
                                                        }, this),
                                                        metricDefinitions.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            className: "flex flex-wrap gap-2",
                                                            children: metricDefinitions.map((metric)=>{
                                                                const metricValue = attempt.metrics[metric.key];
                                                                return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                    className: "bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs",
                                                                    children: [
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                                                            children: metric.title
                                                                        }, void 0, false, {
                                                                            fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                                            lineNumber: 1358,
                                                                            columnNumber: 39
                                                                        }, this),
                                                                        !metric.failureOnly && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "text-slate-500 mr-1",
                                                                            children: [
                                                                                " ",
                                                                                formatAverage(metricValue?.average)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                                            lineNumber: 1362,
                                                                            columnNumber: 41
                                                                        }, this),
                                                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                                            className: "text-red-700 font-bold mr-1",
                                                                            children: [
                                                                                " ",
                                                                                "כשל",
                                                                                " ",
                                                                                metricValue?.failedCount !== undefined ? `${metricValue.failedCount}` : formatMetricFailed(metricValue?.failedPercent)
                                                                            ]
                                                                        }, void 0, true, {
                                                                            fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                                            lineNumber: 1369,
                                                                            columnNumber: 39
                                                                        }, this)
                                                                    ]
                                                                }, metric.key, true, {
                                                                    fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                                    lineNumber: 1352,
                                                                    columnNumber: 37
                                                                }, this);
                                                            })
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                            lineNumber: 1343,
                                                            columnNumber: 29
                                                        }, this)
                                                    ]
                                                }, void 0, true, {
                                                    fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                    lineNumber: 1299,
                                                    columnNumber: 25
                                                }, this)
                                            }, attempt.attempt, false, {
                                                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                                lineNumber: 1287,
                                                columnNumber: 23
                                            }, this))
                                    }, void 0, false, {
                                        fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                        lineNumber: 1284,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                lineNumber: 1279,
                                columnNumber: 15
                            }, this),
                            !isReadOnly && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "sticky bottom-3 z-30 sm:hidden flex gap-2",
                                children: [
                                    attempts.some((item)=>item.attempt === result.attempt) && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        disabled: saving,
                                        onClick: deleteCurrentAttempt,
                                        className: "bg-red-600 text-white rounded-2xl px-4 py-4 font-black shadow-xl disabled:opacity-40",
                                        children: "🗑️"
                                    }, void 0, false, {
                                        fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                        lineNumber: 1400,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        type: "button",
                                        disabled: saving || !validation.valid || !calculator.valid,
                                        onClick: saveResult,
                                        className: "flex-1 bg-slate-950 text-white rounded-2xl px-5 py-4 font-black shadow-xl disabled:opacity-40",
                                        children: saving ? "שומר..." : attempts.some((item)=>item.attempt === result.attempt) ? "💾 שמירת שינויים במועד" : "💾 שמירת תוצאות המועד"
                                    }, void 0, false, {
                                        fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                        lineNumber: 1412,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                                lineNumber: 1394,
                                columnNumber: 15
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                        lineNumber: 932,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                lineNumber: 836,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
        lineNumber: 814,
        columnNumber: 5
    }, this);
}
_s(PercentageResultsPage, "JyrbnMtoVlUbkcfC8iH+jgeWUVQ=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$lib$2f$use$2d$auth$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useAuth"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"]
    ];
});
_c = PercentageResultsPage;
function CompactNumberField({ title, value, onChange }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
        className: "bg-slate-50 border border-slate-200 rounded-xl p-3",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                className: "block text-[11px] sm:text-xs font-bold text-slate-600",
                children: title
            }, void 0, false, {
                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                lineNumber: 1444,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                type: "number",
                min: 0,
                step: 1,
                value: value,
                onChange: (event)=>onChange(safeInt(Number(event.target.value))),
                className: "w-full border border-slate-300 rounded-lg px-2 py-2 mt-2 text-xl sm:text-2xl font-black bg-white text-center"
            }, void 0, false, {
                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                lineNumber: 1448,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
        lineNumber: 1443,
        columnNumber: 5
    }, this);
}
_c1 = CompactNumberField;
function CompactResultCard({ title, value, tone }) {
    const styles = {
        success: "bg-green-50 border-green-100 text-green-700",
        danger: "bg-red-50 border-red-100 text-red-700",
        excellent: "bg-sky-50 border-sky-100 text-sky-700",
        neutral: "bg-slate-50 border-slate-200 text-slate-800"
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `border rounded-xl p-3 text-center ${styles[tone]}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-[10px] sm:text-xs font-bold leading-4",
                children: title
            }, void 0, false, {
                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                lineNumber: 1480,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xl sm:text-2xl font-black mt-1",
                children: value
            }, void 0, false, {
                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                lineNumber: 1481,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
        lineNumber: 1479,
        columnNumber: 5
    }, this);
}
_c2 = CompactResultCard;
function CompactPercentCard({ title, value, tone }) {
    const styles = {
        success: "bg-green-50 border-green-100 text-green-700",
        danger: "bg-red-50 border-red-100 text-red-700",
        excellent: "bg-sky-50 border-sky-100 text-sky-700"
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `border rounded-xl p-3 text-center ${styles[tone]}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-[10px] sm:text-xs font-bold",
                children: title
            }, void 0, false, {
                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                lineNumber: 1503,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-2xl sm:text-3xl font-black mt-1",
                children: formatPercent(value)
            }, void 0, false, {
                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                lineNumber: 1504,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
        lineNumber: 1502,
        columnNumber: 5
    }, this);
}
_c3 = CompactPercentCard;
function PercentInput({ title, value, disabled, onChange, helper }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-white rounded-2xl shadow-sm p-5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                className: "block text-sm font-bold text-slate-900 mb-3",
                children: title
            }, void 0, false, {
                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                lineNumber: 1526,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        disabled: disabled,
                        type: "number",
                        min: 0,
                        max: 100,
                        step: 0.1,
                        value: value,
                        onChange: (event)=>onChange(event.target.value),
                        className: "w-full border border-slate-300 rounded-xl pr-4 pl-12 py-3 text-2xl font-bold text-slate-900 bg-white disabled:bg-slate-50"
                    }, void 0, false, {
                        fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                        lineNumber: 1528,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                        className: "absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold",
                        children: "%"
                    }, void 0, false, {
                        fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                        lineNumber: 1538,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                lineNumber: 1527,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs text-slate-500 mt-3",
                children: helper
            }, void 0, false, {
                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                lineNumber: 1540,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
        lineNumber: 1525,
        columnNumber: 5
    }, this);
}
_c4 = PercentInput;
function ReadOnlyPercent({ title, value, helper }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-slate-50 border border-slate-200 rounded-2xl p-5",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm font-bold text-slate-900 mb-3",
                children: title
            }, void 0, false, {
                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                lineNumber: 1556,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-3xl font-bold text-slate-900",
                children: formatPercent(value)
            }, void 0, false, {
                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                lineNumber: 1557,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-xs text-slate-500 mt-3",
                children: helper
            }, void 0, false, {
                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                lineNumber: 1558,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
        lineNumber: 1555,
        columnNumber: 5
    }, this);
}
_c5 = ReadOnlyPercent;
function SummaryCard({ title, value, tone }) {
    const styles = {
        success: "bg-green-50 border-green-100 text-green-700",
        danger: "bg-red-50 border-red-100 text-red-700",
        excellent: "bg-sky-50 border-sky-200 text-sky-700"
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: `border rounded-2xl p-5 ${styles[tone]}`,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-sm font-bold",
                children: title
            }, void 0, false, {
                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                lineNumber: 1580,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                className: "text-4xl font-bold mt-2",
                children: formatPercent(value)
            }, void 0, false, {
                fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
                lineNumber: 1581,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/battalions/[name]/cadets/page.tsx",
        lineNumber: 1579,
        columnNumber: 5
    }, this);
}
_c6 = SummaryCard;
var _c, _c1, _c2, _c3, _c4, _c5, _c6;
__turbopack_context__.k.register(_c, "PercentageResultsPage");
__turbopack_context__.k.register(_c1, "CompactNumberField");
__turbopack_context__.k.register(_c2, "CompactResultCard");
__turbopack_context__.k.register(_c3, "CompactPercentCard");
__turbopack_context__.k.register(_c4, "PercentInput");
__turbopack_context__.k.register(_c5, "ReadOnlyPercent");
__turbopack_context__.k.register(_c6, "SummaryCard");
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
   דקל / רימון
   כש"ג פתיחה → לורן → כש"ג סוף → לורן משופר
========================================================= */ const FIGHTER_FULL_TESTS = [
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
/* =========================================================
   הדס / דולב
   נשמר לפי ההגדרה שכבר הייתה קיימת באתר:
   כש"ג פתיחה → לורן → כש"ג סוף → לורן מסכם
========================================================= */ const HADAR_DOLAV_TESTS = [
    {
        id: "fitness-opening",
        name: 'כש"ג פתיחה',
        type: "fitness",
        order: 1,
        description: "בוחן כשירות פתיחה"
    },
    {
        id: "loran-regular",
        name: "לורן",
        type: "loran",
        order: 2,
        description: "בוחן לורן"
    },
    {
        id: "fitness-final",
        name: 'כש"ג סוף',
        type: "fitness",
        order: 3,
        description: "בוחן כשירות סוף"
    },
    {
        id: "loran-improved",
        name: "לורן מסכם",
        type: "improved-loran",
        order: 4,
        description: "בוחן לורן מסכם"
    }
];
/* =========================================================
   מגמת מטה
   ארז / ברוש / חרוב / אלון
========================================================= */ const STAFF_TESTS = [
    {
        id: "run-3000",
        name: "ריצת 3000 מטר",
        type: "fitness",
        order: 1,
        description: "ריצת 3000 מטר"
    },
    {
        id: "push-ups",
        name: "שכיבות סמיכה",
        type: "fitness",
        order: 2,
        description: "בוחן שכיבות סמיכה"
    }
];
const BATTALION_TESTS = {
    דקל: FIGHTER_FULL_TESTS,
    רימון: FIGHTER_FULL_TESTS,
    גפן: GEFEN_TESTS,
    הדס: HADAR_DOLAV_TESTS,
    דולב: HADAR_DOLAV_TESTS,
    ארז: STAFF_TESTS,
    ברוש: STAFF_TESTS,
    חרוב: STAFF_TESTS,
    אלון: STAFF_TESTS
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

//# sourceMappingURL=_0529zx9._.js.map