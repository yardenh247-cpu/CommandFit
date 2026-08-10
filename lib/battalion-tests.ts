/* =========================================================
   COMMAND FIT
   הגדרת הבחנים לפי גדוד
========================================================= */

export type TestType =
  | "fitness"
  | "loran"
  | "improved-loran"
  | "mm";

export type BattalionTest = {
  id: string;
  name: string;
  type: TestType;
  order: number;
  description: string;
};

/* =========================================================
   דקל / רימון
   כש"ג פתיחה → לורן → כש"ג סוף → לורן משופר
========================================================= */

const FIGHTER_FULL_TESTS: BattalionTest[] = [
  {
    id: "fitness-opening",
    name: 'כש"ג פתיחה',
    type: "fitness",
    order: 1,
    description:
      "בוחן הכשירות הגופנית בתחילת התקופה",
  },
  {
    id: "loran-regular",
    name: "לורן",
    type: "loran",
    order: 2,
    description:
      "בוחן לורן רגיל לפי אוכלוסיית הלורן והמערך האישי",
  },
  {
    id: "fitness-final",
    name: 'כש"ג סוף',
    type: "fitness",
    order: 3,
    description:
      "בוחן הכשירות הגופנית בסיום התקופה",
  },
  {
    id: "loran-improved",
    name: "לורן משופר",
    type: "improved-loran",
    order: 4,
    description:
      "בוחן לורן משופר",
  },
];

/* =========================================================
   גפן
   לורן משופר → כש"ג סוף → בוחן מ"מ
========================================================= */

const GEFEN_TESTS: BattalionTest[] = [
  {
    id: "loran-improved",
    name: "לורן משופר",
    type: "improved-loran",
    order: 1,
    description:
      "בוחן לורן משופר",
  },
  {
    id: "fitness-final",
    name: 'כש"ג סוף',
    type: "fitness",
    order: 2,
    description:
      "בוחן הכשירות הגופנית בסיום תקופת גפן",
  },
  {
    id: "mm-test",
    name: 'בוחן מ"מ',
    type: "mm",
    order: 3,
    description:
      'בוחן מ"מ – מתקיים בגדוד גפן בלבד',
  },
];

/* =========================================================
   הדס / דולב
   נשמר לפי ההגדרה שכבר הייתה קיימת באתר:
   כש"ג פתיחה → לורן → כש"ג סוף → לורן מסכם
========================================================= */

const HADAR_DOLAV_TESTS: BattalionTest[] = [
  {
    id: "fitness-opening",
    name: 'כש"ג פתיחה',
    type: "fitness",
    order: 1,
    description:
      "בוחן כשירות פתיחה",
  },
  {
    id: "loran-regular",
    name: "לורן",
    type: "loran",
    order: 2,
    description:
      "בוחן לורן",
  },
  {
    id: "fitness-final",
    name: 'כש"ג סוף',
    type: "fitness",
    order: 3,
    description:
      "בוחן כשירות סוף",
  },
  {
    id: "loran-improved",
    name: "לורן מסכם",
    type: "improved-loran",
    order: 4,
    description:
      "בוחן לורן מסכם",
  },
];

/* =========================================================
   מגמת מטה
   ארז / ברוש / חרוב / אלון
========================================================= */

const STAFF_TESTS: BattalionTest[] = [
  {
    id: "run-3000",
    name: "ריצת 3000 מטר",
    type: "fitness",
    order: 1,
    description:
      "ריצת 3000 מטר",
  },
  {
    id: "push-ups",
    name: "שכיבות סמיכה",
    type: "fitness",
    order: 2,
    description:
      "בוחן שכיבות סמיכה",
  },
];

/* =========================================================
   מפת הגדודים
========================================================= */

export const BATTALION_TESTS: Record<
  string,
  BattalionTest[]
> = {
  דקל: FIGHTER_FULL_TESTS,
  רימון: FIGHTER_FULL_TESTS,

  גפן: GEFEN_TESTS,

  הדס: HADAR_DOLAV_TESTS,
  דולב: HADAR_DOLAV_TESTS,

  ארז: STAFF_TESTS,
  ברוש: STAFF_TESTS,
  חרוב: STAFF_TESTS,
  אלון: STAFF_TESTS,
};

/* =========================================================
   קבלת בחנים של גדוד
========================================================= */

export function getBattalionTests(
  battalionName: string
): BattalionTest[] {
  return (
    BATTALION_TESTS[battalionName] ?? []
  )
    .slice()
    .sort(
      (a, b) =>
        a.order - b.order
    );
}

/* =========================================================
   האם הבוחן קיים בגדוד?
========================================================= */

export function isTestAllowedForBattalion(
  battalionName: string,
  testName: string
): boolean {
  return getBattalionTests(
    battalionName
  ).some(
    (test) =>
      test.name === testName
  );
}

/* =========================================================
   זיהוי סוג הבוחן
========================================================= */

export function getTestType(
  battalionName: string,
  testName: string
): TestType | null {
  const test =
    getBattalionTests(
      battalionName
    ).find(
      (item) =>
        item.name === testName
    );

  return test?.type ?? null;
}

/* =========================================================
   סדר הבוחן
========================================================= */

export function getTestOrder(
  battalionName: string,
  testName: string
): number | null {
  const test =
    getBattalionTests(
      battalionName
    ).find(
      (item) =>
        item.name === testName
    );

  return test?.order ?? null;
}