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
   דקל
   כש"ג פתיחה → לורן רגיל → כש"ג סוף → לורן משופר
========================================================= */

const DEKEL_TESTS: BattalionTest[] = [
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
   רימון
   כש"ג פתיחה → לורן רגיל → כש"ג סוף → לורן משופר
========================================================= */

const RIMON_TESTS: BattalionTest[] = [
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

   אין:
   - כש"ג פתיחה
   - לורן רגיל
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
   מפת הגדודים
========================================================= */

export const BATTALION_TESTS: Record<
  string,
  BattalionTest[]
> = {
  דקל: DEKEL_TESTS,
  רימון: RIMON_TESTS,
  גפן: GEFEN_TESTS,
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