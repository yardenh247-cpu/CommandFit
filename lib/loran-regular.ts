export type RegularLoranPopulation =
  | "מתמרן"
  | 'חי"ר'
  | "יחידות מובחרות"
  | "לוחמת"
  | "לוחמת מיוחדת";

export type LoranRunningStandard = {
  score: number;
  maxSeconds: number;
};

export type LoranArrayInfo = {
  id: number;
  name: string;
  population: string;
  passingScore: number;
  table: LoranRunningStandard[];
};

/* =========================================================
   HELPERS
========================================================= */

function toSeconds(time: string) {
  const [minutes, seconds] =
    time.split(":").map(Number);

  return minutes * 60 + seconds;
}

function row(
  score: number,
  time: string
): LoranRunningStandard {
  return {
    score,
    maxSeconds: toSeconds(time),
  };
}

/* =========================================================
   מערך 1 - מתמרן
========================================================= */

export const LORAN_ARRAY_1: LoranRunningStandard[] = [
  row(100, "18:35"),
  row(99, "18:40"),
  row(98, "18:45"),
  row(97, "18:50"),
  row(96, "18:55"),
  row(95, "19:00"),
  row(94, "19:05"),
  row(93, "19:10"),
  row(92, "19:15"),
  row(91, "19:20"),
  row(90, "19:25"),

  row(89, "19:32"),
  row(88, "19:39"),
  row(87, "19:46"),
  row(86, "19:53"),
  row(85, "20:00"),
  row(84, "20:07"),
  row(83, "20:14"),
  row(82, "20:21"),
  row(81, "20:28"),
  row(80, "20:35"),

  row(79, "20:42"),
  row(78, "20:49"),
  row(77, "20:56"),
  row(76, "21:03"),
  row(75, "21:10"),
  row(74, "21:17"),
  row(73, "21:24"),
  row(72, "21:31"),
  row(71, "21:38"),
  row(70, "21:45"),

  row(69, "21:53"),
  row(68, "22:01"),
  row(67, "22:09"),
  row(66, "22:17"),
  row(65, "22:26"),
  row(64, "22:38"),
  row(63, "22:47"),
  row(62, "22:57"),
  row(61, "23:07"),
  row(60, "23:15"),
];

/* =========================================================
   מערך 2 - חי"ר
========================================================= */

export const LORAN_ARRAY_2: LoranRunningStandard[] = [
  row(100, "18:35"),
  row(99, "18:39"),
  row(98, "18:43"),
  row(97, "18:47"),
  row(96, "18:51"),
  row(95, "18:55"),
  row(94, "18:59"),
  row(93, "19:03"),
  row(92, "19:07"),
  row(91, "19:11"),
  row(90, "19:15"),

  row(89, "19:20"),
  row(88, "19:25"),
  row(87, "19:30"),
  row(86, "19:35"),
  row(85, "19:40"),
  row(84, "19:45"),
  row(83, "19:50"),
  row(82, "19:55"),
  row(81, "20:00"),
  row(80, "20:05"),

  row(79, "20:11"),
  row(78, "20:17"),
  row(77, "20:23"),
  row(76, "20:29"),
  row(75, "20:35"),
  row(74, "20:41"),
  row(73, "20:47"),
  row(72, "20:53"),
  row(71, "20:59"),
  row(70, "21:05"),

  row(69, "21:11"),
  row(68, "21:17"),
  row(67, "21:23"),
  row(66, "21:30"),
  row(65, "21:37"),
  row(64, "21:44"),
  row(63, "21:51"),
  row(62, "21:59"),
  row(61, "22:07"),
  row(60, "22:15"),
];

/* =========================================================
   מערך 3 - יחידות מובחרות
========================================================= */

export const LORAN_ARRAY_3: LoranRunningStandard[] = [
  row(100, "17:35"),
  row(99, "17:39"),
  row(98, "17:43"),
  row(97, "17:47"),
  row(96, "17:51"),
  row(95, "17:55"),
  row(94, "17:59"),
  row(93, "18:03"),
  row(92, "18:07"),
  row(91, "18:11"),
  row(90, "18:15"),

  row(89, "18:20"),
  row(88, "18:25"),
  row(87, "18:30"),
  row(86, "18:35"),
  row(85, "18:40"),
  row(84, "18:45"),
  row(83, "18:50"),
  row(82, "18:55"),
  row(81, "19:00"),
  row(80, "19:05"),

  row(79, "19:11"),
  row(78, "19:17"),
  row(77, "19:23"),
  row(76, "19:29"),
  row(75, "19:35"),
  row(74, "19:41"),
  row(73, "19:47"),
  row(72, "19:53"),
  row(71, "19:59"),
  row(70, "20:05"),

  row(69, "20:11"),
  row(68, "20:17"),
  row(67, "20:23"),
  row(66, "20:30"),
  row(65, "20:37"),
  row(64, "20:44"),
  row(63, "20:51"),
  row(62, "20:59"),
  row(61, "21:07"),
  row(60, "21:15"),
];

/* =========================================================
   מערך 4 - לוחמות
   לוחמת מיוחדת = אותו מערך
========================================================= */

export const LORAN_ARRAY_4: LoranRunningStandard[] = [
  row(100, "24:05"),
  row(99, "24:09"),
  row(98, "24:13"),
  row(97, "24:17"),
  row(96, "24:21"),
  row(95, "24:25"),
  row(94, "24:30"),
  row(93, "24:35"),
  row(92, "24:40"),
  row(91, "24:45"),
  row(90, "24:50"),

  row(89, "24:56"),
  row(88, "25:02"),
  row(87, "25:08"),
  row(86, "25:14"),
  row(85, "25:20"),
  row(84, "25:26"),
  row(83, "25:32"),
  row(82, "25:38"),
  row(81, "25:44"),
  row(80, "25:50"),

  row(79, "25:56"),
  row(78, "26:02"),
  row(77, "26:08"),
  row(76, "26:14"),
  row(75, "26:20"),
  row(74, "26:27"),
  row(73, "26:34"),
  row(72, "26:41"),
  row(71, "26:48"),
  row(70, "26:55"),

  row(69, "27:02"),
  row(68, "27:09"),
  row(67, "27:16"),
  row(66, "27:23"),
  row(65, "27:30"),
  row(64, "27:37"),
  row(63, "27:44"),
  row(62, "27:52"),
  row(61, "27:59"),
  row(60, "28:08"),
];

/* =========================================================
   מערכים
========================================================= */

export const REGULAR_LORAN_ARRAYS: LoranArrayInfo[] = [
  {
    id: 1,
    name: "מערך 1",
    population: "מתמרן",
    passingScore: 60,
    table: LORAN_ARRAY_1,
  },

  {
    id: 2,
    name: "מערך 2",
    population: 'חי"ר',
    passingScore: 60,
    table: LORAN_ARRAY_2,
  },

  {
    id: 3,
    name: "מערך 3",
    population: "יחידות מובחרות",
    passingScore: 60,
    table: LORAN_ARRAY_3,
  },

  {
    id: 4,
    name: "מערך 4",
    population: "לוחמות",
    passingScore: 60,
    table: LORAN_ARRAY_4,
  },
];

/* =========================================================
   זיהוי מערך
========================================================= */

export function getRegularLoranArray(
  population: string
): LoranArrayInfo | null {
  const value =
    population
      .trim()
      .replace(/״/g, '"');

  if (
    value === "מתמרן" ||
    value === "מתנייע"
  ) {
    return REGULAR_LORAN_ARRAYS[0];
  }

  if (
    value === 'חי"ר' ||
    value === "חיר"
  ) {
    return REGULAR_LORAN_ARRAYS[1];
  }

  if (
    value === "יחידות מובחרות" ||
    value === "יחידות מיוחדות" ||
    value === "מיוחדות"
  ) {
    return REGULAR_LORAN_ARRAYS[2];
  }

  /*
    לוחמת מיוחדת מקבלת
    בדיוק את מערך 4.
  */
  if (
    value === "לוחמת" ||
    value === "לוחמות" ||
    value === "צוערות" ||
    value === "לוחמת מיוחדת" ||
    value === "לוחמות מיוחדות"
  ) {
    return REGULAR_LORAN_ARRAYS[3];
  }

  return null;
}

/* =========================================================
   PARSE TIME
========================================================= */

export function parseRunTime(
  value: string
): number | null {
  const clean =
    value.trim();

  if (!clean) {
    return null;
  }

  const parts =
    clean
      .split(":")
      .map(Number);

  if (
    parts.some(
      (part) =>
        Number.isNaN(part)
    )
  ) {
    return null;
  }

  if (parts.length === 2) {
    const [
      minutes,
      seconds,
    ] = parts;

    if (
      minutes < 0 ||
      seconds < 0 ||
      seconds > 59
    ) {
      return null;
    }

    return (
      minutes * 60 +
      seconds
    );
  }

  if (parts.length === 3) {
    const [
      hours,
      minutes,
      seconds,
    ] = parts;

    if (
      hours < 0 ||
      minutes < 0 ||
      minutes > 59 ||
      seconds < 0 ||
      seconds > 59
    ) {
      return null;
    }

    return (
      hours * 3600 +
      minutes * 60 +
      seconds
    );
  }

  return null;
}

/* =========================================================
   חישוב ציון
========================================================= */

export function calculateRegularLoranRunningScore(
  runTime: string,
  population: string
): number | null {
  const array =
    getRegularLoranArray(
      population
    );

  if (!array) {
    return null;
  }

  const seconds =
    parseRunTime(
      runTime
    );

  if (seconds === null) {
    return null;
  }

  const result =
    array.table.find(
      (standard) =>
        seconds <=
        standard.maxSeconds
    );

  return (
    result?.score ??
    null
  );
}

/* =========================================================
   סף מעבר
========================================================= */

export function getRegularLoranPassingTime(
  population: string
): number | null {
  const array =
    getRegularLoranArray(
      population
    );

  if (!array) {
    return null;
  }

  const passing =
    array.table.find(
      (item) =>
        item.score === 60
    );

  return (
    passing?.maxSeconds ??
    null
  );
}

/* =========================================================
   ציון 100
========================================================= */

export function getRegularLoranExcellenceTime(
  population: string
): number | null {
  const array =
    getRegularLoranArray(
      population
    );

  if (!array) {
    return null;
  }

  return (
    array.table.find(
      (item) =>
        item.score === 100
    )?.maxSeconds ??
    null
  );
}

/* =========================================================
   עבר ריצה?
========================================================= */

export function passedRegularLoranRun(
  runTime: string,
  population: string
): boolean | null {
  const actual =
    parseRunTime(
      runTime
    );

  const passing =
    getRegularLoranPassingTime(
      population
    );

  if (
    actual === null ||
    passing === null
  ) {
    return null;
  }

  return (
    actual <= passing
  );
}

/* =========================================================
   תצוגת זמן
========================================================= */

export function formatLoranTime(
  seconds: number | null
) {
  if (seconds === null) {
    return "—";
  }

  const minutes =
    Math.floor(
      seconds / 60
    );

  const remaining =
    seconds % 60;

  return `${minutes}:${String(
    remaining
  ).padStart(2, "0")}`;
}