"use client";

import Link from "next/link";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  getBattalionTests,
} from "@/lib/battalion-tests";

import {
  useAuth,
} from "@/lib/use-auth";

import {
  supabase,
} from "@/lib/supabase";

/* =========================================================
   CONFIG
========================================================= */

const FIGHTERS = [
  "גפן",
  "רימון",
  "דקל",
  "הדס",
  "דולב",
];

const STAFF = [
  "ארז",
  "ברוש",
  "חרוב",
  "אלון",
];

const ALL_BATTALIONS = [
  ...FIGHTERS,
  ...STAFF,
];

const WEEKDAYS = [
  "א׳",
  "ב׳",
  "ג׳",
  "ד׳",
  "ה׳",
  "ו׳",
  "ש׳",
];

/* =========================================================
   TYPES
========================================================= */

type CalendarEvent = {
  id: string;

  track: string;

  battalion: string;

  test_name: string;

  attempt: number;

  test_date: string;

  briefing_time: string;

  start_time: string;

  end_time: string;

  threshold_week: boolean;

  notes:
    | string
    | null;

  status:
    | "scheduled"
    | "completed"
    | "cancelled";
};

type LoadLevel =
  | "normal"
  | "warning"
  | "critical";

type OverlapInfo = {
  level: LoadLevel;

  maxConcurrent: number;

  windowText:
    | string
    | null;
};

/* =========================================================
   HELPERS
========================================================= */

function attemptLabel(
  attempt: number
) {
  const values:
    Record<
      number,
      string
    > = {
    1: "מועד א׳",
    2: "מועד ב׳",
    3: "מועד ג׳",
    4: "מועד ד׳",
    5: "מועד ה׳",
  };

  return (
    values[attempt] ??
    `מועד ${attempt}`
  );
}

function getTrack(
  battalion: string
) {
  return FIGHTERS.includes(
    battalion
  )
    ? "מגמת לוחמים"
    : "מגמת מטה";
}

function isMajorTest(
  event:
    CalendarEvent
) {
  const name =
    event.test_name;

  const isImprovedLoran =
    name.includes(
      "לורן משופר"
    );

  const isFitness =
    name.includes(
      'כש"ג'
    ) ||
    name.includes(
      "כש״ג"
    );

  return (
    isImprovedLoran ||
    (
      isFitness &&
      event.threshold_week
    )
  );
}

function toMinutes(
  value: string
) {
  const [
    hour,
    minute,
  ] =
    value
      .slice(
        0,
        5
      )
      .split(":")
      .map(Number);

  return (
    hour * 60 +
    minute
  );
}

function overlap(
  first:
    CalendarEvent,
  second:
    CalendarEvent
) {
  const firstStart =
    toMinutes(
      first.start_time
    );

  const firstEnd =
    toMinutes(
      first.end_time
    );

  const secondStart =
    toMinutes(
      second.start_time
    );

  const secondEnd =
    toMinutes(
      second.end_time
    );

  return (
    firstStart <
      secondEnd &&
    secondStart <
      firstEnd
  );
}

/* =========================================================
   LOAD ANALYSIS
========================================================= */

function analyzeDayLoad(
  events:
    CalendarEvent[]
):
  OverlapInfo {
  if (
    events.length ===
    0
  ) {
    return {
      level:
        "normal",

      maxConcurrent:
        0,

      windowText:
        null,
    };
  }

  const points =
    new Set<number>();

  for (
    const event of
    events
  ) {
    points.add(
      toMinutes(
        event.start_time
      )
    );

    points.add(
      toMinutes(
        event.end_time
      )
    );
  }

  const sorted =
    [...points].sort(
      (a, b) =>
        a - b
    );

  let maxConcurrent =
    0;

  let critical =
    false;

  let busiestStart:
    | number
    | null =
    null;

  let busiestEnd:
    | number
    | null =
    null;

  for (
    let index = 0;
    index <
    sorted.length - 1;
    index++
  ) {
    const start =
      sorted[index];

    const end =
      sorted[
        index + 1
      ];

    if (
      start === end
    ) {
      continue;
    }

    const active =
      events.filter(
        (event) => {
          const eventStart =
            toMinutes(
              event.start_time
            );

          const eventEnd =
            toMinutes(
              event.end_time
            );

          return (
            eventStart <
              end &&
            eventEnd >
              start
          );
        }
      );

    if (
      active.length >
      maxConcurrent
    ) {
      maxConcurrent =
        active.length;

      busiestStart =
        start;

      busiestEnd =
        end;
    }

    if (
      active.length >=
        2 &&
      active.some(
        isMajorTest
      )
    ) {
      critical =
        true;
    }
  }

  const hasMajor =
    events.some(
      isMajorTest
    );

  let level:
    LoadLevel =
    "normal";

  if (
    critical ||
    hasMajor
  ) {
    level =
      "critical";
  } else if (
    maxConcurrent >
    2
  ) {
    level =
      "warning";
  }

  function minuteLabel(
    value: number
  ) {
    const h =
      Math.floor(
        value / 60
      );

    const m =
      value % 60;

    return `${String(
      h
    ).padStart(
      2,
      "0"
    )}:${String(
      m
    ).padStart(
      2,
      "0"
    )}`;
  }

  return {
    level,

    maxConcurrent,

    windowText:
      busiestStart !==
        null &&
      busiestEnd !==
        null &&
      maxConcurrent >
        1
        ? `${minuteLabel(
            busiestStart
          )}–${minuteLabel(
            busiestEnd
          )}`
        : null,
  };
}

/* =========================================================
   DATE HELPERS
========================================================= */

function dateKey(
  year: number,
  month: number,
  day: number
) {
  return `${year}-${String(
    month + 1
  ).padStart(
    2,
    "0"
  )}-${String(
    day
  ).padStart(
    2,
    "0"
  )}`;
}

function monthTitle(
  date: Date
) {
  return new Intl.DateTimeFormat(
    "he-IL",
    {
      month:
        "long",
      year:
        "numeric",
    }
  ).format(
    date
  );
}


function downloadTextFile(
  filename: string,
  content: string,
  mimeType: string
) {
  const blob = new Blob(
    [content],
    { type: mimeType }
  );

  const url = URL.createObjectURL(
    blob
  );

  const anchor = document.createElement(
    "a"
  );

  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(
    anchor
  );
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(
    url
  );
}

function csvEscape(
  value: string | number | boolean | null | undefined
) {
  const text = String(
    value ?? ""
  );

  if (
    text.includes(",") ||
    text.includes('"') ||
    text.includes("\n")
  ) {
    return `"${text.replace(
      /"/g,
      '""'
    )}"`;
  }

  return text;
}

function icsEscape(
  value: string
) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function localDateTimeForIcs(
  date: string,
  time: string
) {
  const cleanTime = time
    .slice(0, 5)
    .replace(":", "");

  return `${date.replace(
    /-/g,
    ""
  )}T${cleanTime}00`;
}

function utcStampForIcs() {
  const now = new Date();

  const pad = (value: number) =>
    String(value).padStart(2, "0");

  return `${now.getUTCFullYear()}${pad(
    now.getUTCMonth() + 1
  )}${pad(now.getUTCDate())}T${pad(
    now.getUTCHours()
  )}${pad(now.getUTCMinutes())}${pad(
    now.getUTCSeconds()
  )}Z`;
}

/* =========================================================
   PAGE
========================================================= */

export default function CalendarPage() {
  const {
    isAdmin,
    isViewer,
  } =
    useAuth();

  const [
    currentMonth,
    setCurrentMonth,
  ] =
    useState(
      () =>
        new Date()
    );

  const [
    events,
    setEvents,
  ] =
    useState<
      CalendarEvent[]
    >([]);

  const [
    loading,
    setLoading,
  ] =
    useState(
      true
    );

  const [
    message,
    setMessage,
  ] =
    useState(
      ""
    );

  const [
    showForm,
    setShowForm,
  ] =
    useState(
      false
    );

  const formSectionRef =
    useRef<HTMLElement | null>(
      null
    );

  const [
    trackFilter,
    setTrackFilter,
  ] =
    useState(
      "הכול"
    );

  const [
    battalionFilter,
    setBattalionFilter,
  ] =
    useState(
      "הכול"
    );

  /* =======================================================
     FORM
  ======================================================= */

  const [
    formTrack,
    setFormTrack,
  ] =
    useState(
      "מגמת לוחמים"
    );

  const [
    selectedBattalions,
    setSelectedBattalions,
  ] =
    useState<
      string[]
    >([]);

  const [
    formTest,
    setFormTest,
  ] =
    useState(
      ""
    );

  const [
    formAttempt,
    setFormAttempt,
  ] =
    useState(
      1
    );

  const [
    formDate,
    setFormDate,
  ] =
    useState(
      ""
    );

  const [
    briefingTime,
    setBriefingTime,
  ] =
    useState(
      "04:45"
    );

  const [
    startTime,
    setStartTime,
  ] =
    useState(
      "05:00"
    );

  const [
    endTime,
    setEndTime,
  ] =
    useState(
      "06:30"
    );

  const [
    thresholdWeek,
    setThresholdWeek,
  ] =
    useState(
      false
    );

  const [
    notes,
    setNotes,
  ] =
    useState(
      ""
    );

  const availableBattalions =
    formTrack ===
    "מגמת לוחמים"
      ? FIGHTERS
      : STAFF;

  const availableTests =
    useMemo(
      () => {
        const names =
          new Set<string>();

        for (
          const battalion of
          selectedBattalions
        ) {
          for (
            const test of
            getBattalionTests(
              battalion
            )
          ) {
            names.add(
              test.name
            );
          }
        }

        return [
          ...names,
        ];
      },
      [
        selectedBattalions,
      ]
    );

  /* =======================================================
     LOAD
  ======================================================= */

  async function loadEvents() {
    setLoading(
      true
    );

    const {
      data,
      error,
    } =
      await supabase
        .from(
          "commandfit_test_calendar"
        )
        .select(
          "*"
        )
        .neq(
          "status",
          "cancelled"
        )
        .order(
          "test_date",
          {
            ascending:
              true,
          }
        )
        .order(
          "start_time",
          {
            ascending:
              true,
          }
        );

    if (error) {
      console.error(
        error
      );

      setMessage(
        "לא ניתן היה לטעון את לוח הבחנים"
      );

      setEvents(
        []
      );
    } else {
      setEvents(
        (
          data ??
          []
        ) as CalendarEvent[]
      );
    }

    setLoading(
      false
    );
  }

  useEffect(() => {
    loadEvents();
  }, []);

  /* =======================================================
     FILTER
  ======================================================= */

  const filteredEvents =
    useMemo(
      () =>
        events.filter(
          (
            event
          ) => {
            if (
              trackFilter !==
                "הכול" &&
              event.track !==
                trackFilter
            ) {
              return false;
            }

            if (
              battalionFilter !==
                "הכול" &&
              event.battalion !==
                battalionFilter
            ) {
              return false;
            }

            return true;
          }
        ),
      [
        events,
        trackFilter,
        battalionFilter,
      ]
    );

  /* =======================================================
     EXPORTS
  ======================================================= */

  function exportToExcel() {
    if (filteredEvents.length === 0) {
      setMessage(
        "אין בחנים לייצוא לפי הסינון הנוכחי"
      );
      return;
    }

    const headers = [
      "מגמה",
      "גדוד",
      "בוחן",
      "מועד",
      "תאריך",
      "תדריך",
      "התחלה",
      "סיום",
      "שבוע סף",
      "הערות",
    ];

    const rows = filteredEvents.map(
      (event) => [
        event.track,
        event.battalion,
        event.test_name,
        attemptLabel(
          event.attempt
        ),
        event.test_date,
        event.briefing_time.slice(
          0,
          5
        ),
        event.start_time.slice(
          0,
          5
        ),
        event.end_time.slice(
          0,
          5
        ),
        event.threshold_week
          ? "כן"
          : "לא",
        event.notes ?? "",
      ]
    );

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map(csvEscape)
          .join(",")
      )
      .join("\n");

    downloadTextFile(
      `commandfit-tests-${new Date()
        .toISOString()
        .slice(0, 10)}.csv`,
      `\uFEFF${csv}`,
      "text/csv;charset=utf-8"
    );

    setMessage(
      "קובץ האקסל הורד בהצלחה"
    );
  }

  function exportToCalendar() {
    if (filteredEvents.length === 0) {
      setMessage(
        "אין בחנים לייצוא לפי הסינון הנוכחי"
      );
      return;
    }

    const stamp =
      utcStampForIcs();

    const calendarEvents =
      filteredEvents.map(
        (event) => {
          const title =
            `${event.battalion} • ${event.test_name} • ${attemptLabel(
              event.attempt
            )}`;

          const descriptionParts = [
            `מגמה: ${event.track}`,
            `גדוד: ${event.battalion}`,
            `מועד: ${attemptLabel(
              event.attempt
            )}`,
            `תדריך: ${event.briefing_time.slice(
              0,
              5
            )}`,
            event.threshold_week
              ? "שבוע סף: כן"
              : "שבוע סף: לא",
            event.notes
              ? `הערות: ${event.notes}`
              : "",
          ].filter(Boolean);

          return [
            "BEGIN:VEVENT",
            `UID:${icsEscape(
              `${event.id}@commandfit`
            )}`,
            `DTSTAMP:${stamp}`,
            `DTSTART;TZID=Asia/Jerusalem:${localDateTimeForIcs(
              event.test_date,
              event.start_time
            )}`,
            `DTEND;TZID=Asia/Jerusalem:${localDateTimeForIcs(
              event.test_date,
              event.end_time
            )}`,
            `SUMMARY:${icsEscape(
              title
            )}`,
            `DESCRIPTION:${icsEscape(
              descriptionParts.join(
                "\n"
              )
            )}`,
            "STATUS:CONFIRMED",
            "END:VEVENT",
          ].join("\r\n");
        }
      );

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//CommandFit//Test Calendar//HE",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "X-WR-CALNAME:CommandFit - לוח בחנים",
      "X-WR-TIMEZONE:Asia/Jerusalem",
      ...calendarEvents,
      "END:VCALENDAR",
      "",
    ].join("\r\n");

    downloadTextFile(
      `commandfit-calendar-${new Date()
        .toISOString()
        .slice(0, 10)}.ics`,
      ics,
      "text/calendar;charset=utf-8"
    );

    setMessage(
      "קובץ היומן הורד. פתח אותו בפלאפון ובחר הוספה ליומן."
    );
  }

  /* =======================================================
     MONTH GRID
  ======================================================= */

  const year =
    currentMonth.getFullYear();

  const month =
    currentMonth.getMonth();

  const firstDay =
    new Date(
      year,
      month,
      1
    );

  const daysInMonth =
    new Date(
      year,
      month + 1,
      0
    ).getDate();

  const leading =
    firstDay.getDay();

  const calendarCells =
    [
      ...Array(
        leading
      ).fill(
        null
      ),

      ...Array.from(
        {
          length:
            daysInMonth,
        },
        (
          _,
          index
        ) =>
          index + 1
      ),
    ];

  while (
    calendarCells.length %
      7 !==
    0
  ) {
    calendarCells.push(
      null
    );
  }

  /* =======================================================
     QUICK ADD FROM CALENDAR DAY
  ======================================================= */

  function openQuickAdd(
    selectedDate: string
  ) {
    if (!isAdmin) {
      return;
    }

    setFormDate(
      selectedDate
    );

    setShowForm(
      true
    );

    setMessage(
      `תיאום מהיר ל־${selectedDate}`
    );

    window.setTimeout(
      () => {
        formSectionRef.current
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
      },
      80
    );
  }

  /* =======================================================
     SAVE EVENT
  ======================================================= */

  async function saveEvents() {
    if (
      !isAdmin
    ) {
      return;
    }

    if (
      selectedBattalions.length ===
        0 ||
      !formTest ||
      !formDate
    ) {
      setMessage(
        "יש לבחור גדוד, בוחן ותאריך"
      );

      return;
    }

    const rows =
      selectedBattalions.map(
        (
          battalion
        ) => ({
          track:
            getTrack(
              battalion
            ),

          battalion,

          test_name:
            formTest,

          attempt:
            formAttempt,

          test_date:
            formDate,

          briefing_time:
            briefingTime,

          start_time:
            startTime,

          end_time:
            endTime,

          threshold_week:
            thresholdWeek,

          notes:
            notes ||
            null,

          status:
            "scheduled",
        })
      );

    const {
      error,
    } =
      await supabase
        .from(
          "commandfit_test_calendar"
        )
        .insert(
          rows
        );

    if (error) {
      setMessage(
        `השמירה נכשלה: ${error.message}`
      );

      return;
    }

    setMessage(
      "הבחנים נוספו ללוח בהצלחה"
    );

    setShowForm(
      false
    );

    setSelectedBattalions(
      []
    );

    setFormTest(
      ""
    );

    setNotes(
      ""
    );

    await loadEvents();
  }

  /* =======================================================
     DELETE
  ======================================================= */

  async function deleteEvent(
    id: string
  ) {
    if (
      !isAdmin
    ) {
      return;
    }

    const {
      error,
    } =
      await supabase
        .from(
          "commandfit_test_calendar"
        )
        .delete()
        .eq(
          "id",
          id
        );

    if (!error) {
      setEvents(
        (
          current
        ) =>
          current.filter(
            (
              item
            ) =>
              item.id !==
              id
          )
      );
    }
  }

  /* =======================================================
     UI
  ======================================================= */

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-100 text-slate-900"
    >

      <header className="bg-slate-950 text-white px-4 sm:px-6 lg:px-8 py-6">

        <div className="max-w-[1600px] mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-4">

          <div>

            <p className="text-slate-400 text-sm">
              CommandFit
            </p>

            <h1 className="text-3xl font-black mt-1">
              📅 לוח בחנים אחוד
            </h1>

            <p className="text-slate-300 mt-2">
              כלל הגדודים והבחנים בלוח אחד
            </p>

          </div>

          <div className="flex flex-col sm:flex-row gap-2">

            {isAdmin && (
              <button
                type="button"
                onClick={() =>
                  setShowForm(
                    (
                      value
                    ) =>
                      !value
                  )
                }
                className="bg-blue-600 hover:bg-blue-500 px-5 py-3 rounded-xl font-bold"
              >
                + הוסף בוחן
              </button>
            )}

            <Link
              href="/"
              className="bg-white/10 hover:bg-white/20 px-5 py-3 rounded-xl text-center"
            >
              חזרה לדף הבית
            </Link>

          </div>

        </div>

      </header>

      <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8">

        {/* LEGEND */}

        <section className="bg-white rounded-2xl shadow-sm p-4 mb-5">

          <div className="flex flex-wrap gap-4 text-sm">

            <span>
              🟢 עד 2 בחנים במקביל
            </span>

            <span className="text-amber-700 font-bold">
              🟡 3+ במקביל
            </span>

            <span className="text-red-700 font-bold">
              🔴 בוחן גדול / עומס קריטי
            </span>

          </div>

        </section>

        {/* ADD FORM */}

        {showForm &&
          isAdmin && (
          <section
            ref={formSectionRef}
            className="bg-white rounded-3xl shadow-sm p-5 sm:p-6 mb-6 scroll-mt-4"
          >

            <h2 className="text-2xl font-black">
              הוספת בחנים
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-5">

              <label>

                <span className="text-sm font-bold">
                  מגמה
                </span>

                <select
                  value={
                    formTrack
                  }
                  onChange={(
                    event
                  ) => {
                    setFormTrack(
                      event
                        .target
                        .value
                    );

                    setSelectedBattalions(
                      []
                    );

                    setFormTest(
                      ""
                    );
                  }}
                  className="w-full border rounded-xl px-4 py-3 mt-2 bg-white"
                >
                  <option>
                    מגמת לוחמים
                  </option>

                  <option>
                    מגמת מטה
                  </option>
                </select>

              </label>

              <div>

                <p className="text-sm font-bold">
                  גדוד / גדודים
                </p>

                <div className="flex flex-wrap gap-2 mt-2">

                  {availableBattalions.map(
                    (
                      battalion
                    ) => {
                      const selected =
                        selectedBattalions.includes(
                          battalion
                        );

                      return (
                        <button
                          key={
                            battalion
                          }
                          type="button"
                          onClick={() =>
                            setSelectedBattalions(
                              (
                                current
                              ) =>
                                selected
                                  ? current.filter(
                                      (
                                        item
                                      ) =>
                                        item !==
                                        battalion
                                    )
                                  : [
                                      ...current,
                                      battalion,
                                    ]
                            )
                          }
                          className={
                            selected
                              ? "bg-slate-900 text-white rounded-xl px-3 py-2 font-bold"
                              : "bg-slate-100 rounded-xl px-3 py-2"
                          }
                        >
                          {
                            battalion
                          }
                        </button>
                      );
                    }
                  )}

                </div>

              </div>

              <label>

                <span className="text-sm font-bold">
                  בוחן
                </span>

                <select
                  value={
                    formTest
                  }
                  onChange={(
                    event
                  ) =>
                    setFormTest(
                      event
                        .target
                        .value
                    )
                  }
                  className="w-full border rounded-xl px-4 py-3 mt-2 bg-white"
                >

                  <option value="">
                    בחר בוחן
                  </option>

                  {availableTests.map(
                    (
                      test
                    ) => (
                      <option
                        key={
                          test
                        }
                        value={
                          test
                        }
                      >
                        {
                          test
                        }
                      </option>
                    )
                  )}

                </select>

              </label>

              <label>

                <span className="text-sm font-bold">
                  מועד
                </span>

                <select
                  value={
                    formAttempt
                  }
                  onChange={(
                    event
                  ) =>
                    setFormAttempt(
                      Number(
                        event
                          .target
                          .value
                      )
                    )
                  }
                  className="w-full border rounded-xl px-4 py-3 mt-2 bg-white"
                >

                  {[1, 2, 3, 4, 5].map(
                    (
                      attempt
                    ) => (
                      <option
                        key={
                          attempt
                        }
                        value={
                          attempt
                        }
                      >
                        {
                          attemptLabel(
                            attempt
                          )
                        }
                      </option>
                    )
                  )}

                </select>

              </label>

              <label>

                <span className="text-sm font-bold">
                  תאריך הבוחן
                </span>

                <input
                  type="date"
                  value={
                    formDate
                  }
                  onChange={(
                    event
                  ) =>
                    setFormDate(
                      event
                        .target
                        .value
                    )
                  }
                  className="w-full border rounded-xl px-4 py-3 mt-2 bg-white"
                />

              </label>

              <TimeField
                title="תדריך"
                value={
                  briefingTime
                }
                onChange={
                  setBriefingTime
                }
              />

              <TimeField
                title="התחלה"
                value={
                  startTime
                }
                onChange={
                  setStartTime
                }
              />

              <TimeField
                title="סיום"
                value={
                  endTime
                }
                onChange={
                  setEndTime
                }
              />

            </div>

            <div className="flex flex-col sm:flex-row gap-4 mt-5">

              <label className="flex items-center gap-2 bg-red-50 border border-red-100 rounded-xl px-4 py-3">

                <input
                  type="checkbox"
                  checked={
                    thresholdWeek
                  }
                  onChange={(
                    event
                  ) =>
                    setThresholdWeek(
                      event
                        .target
                        .checked
                    )
                  }
                />

                <span className="font-bold text-red-800">
                  שבוע סף
                </span>

              </label>

              <input
                type="text"
                value={
                  notes
                }
                onChange={(
                  event
                ) =>
                  setNotes(
                    event
                      .target
                      .value
                  )
                }
                placeholder="הערה אופציונלית"
                className="flex-1 border rounded-xl px-4 py-3"
              />

            </div>

            <button
              type="button"
              onClick={
                saveEvents
              }
              className="w-full sm:w-auto bg-slate-900 text-white rounded-xl px-7 py-3 font-black mt-5"
            >
              שמירת הבחנים
            </button>

          </section>
        )}

        {/* FILTERS */}

        <section className="bg-white rounded-2xl shadow-sm p-4 mb-5">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">

            <select
              value={
                trackFilter
              }
              onChange={(
                event
              ) =>
                setTrackFilter(
                  event
                    .target
                    .value
                )
              }
              className="border rounded-xl px-4 py-3 bg-white"
            >
              <option>
                הכול
              </option>

              <option>
                מגמת לוחמים
              </option>

              <option>
                מגמת מטה
              </option>
            </select>

            <select
              value={
                battalionFilter
              }
              onChange={(
                event
              ) =>
                setBattalionFilter(
                  event
                    .target
                    .value
                )
              }
              className="border rounded-xl px-4 py-3 bg-white"
            >

              <option>
                הכול
              </option>

              {ALL_BATTALIONS.map(
                (
                  battalion
                ) => (
                  <option
                    key={
                      battalion
                    }
                  >
                    {
                      battalion
                    }
                  </option>
                )
              )}

            </select>

            <button
              type="button"
              onClick={
                exportToExcel
              }
              className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl px-4 py-3 font-black"
            >
              📊 ייצוא לאקסל
            </button>

            <button
              type="button"
              onClick={
                exportToCalendar
              }
              className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl px-4 py-3 font-black"
            >
              📱 ייצוא לקלנדר
            </button>

          </div>

          <p className="text-xs text-slate-500 mt-3">
            הייצוא מתבצע לפי הסינון הנוכחי של מגמה וגדוד. קובץ הקלנדר מתאים ל-Google Calendar, Apple Calendar ו-Outlook.
          </p>

        </section>

        {/* MONTH HEADER */}

        <section className="bg-white rounded-2xl shadow-sm p-4 mb-4">

          <div className="flex items-center justify-between gap-3">

            <button
              type="button"
              onClick={() =>
                setCurrentMonth(
                  new Date(
                    year,
                    month - 1,
                    1
                  )
                )
              }
              className="bg-slate-100 rounded-xl px-4 py-2"
            >
              →
            </button>

            <h2 className="text-xl sm:text-2xl font-black">
              {monthTitle(
                currentMonth
              )}
            </h2>

            <button
              type="button"
              onClick={() =>
                setCurrentMonth(
                  new Date(
                    year,
                    month + 1,
                    1
                  )
                )
              }
              className="bg-slate-100 rounded-xl px-4 py-2"
            >
              ←
            </button>

          </div>

        </section>

        {/* CALENDAR */}

        <section className="bg-white rounded-3xl shadow-sm overflow-hidden">

          <div className="grid grid-cols-7 border-b">

            {WEEKDAYS.map(
              (
                day
              ) => (
                <div
                  key={
                    day
                  }
                  className="p-2 sm:p-3 text-center text-xs sm:text-sm font-bold bg-slate-50"
                >
                  {day}
                </div>
              )
            )}

          </div>

          <div className="grid grid-cols-7">

            {calendarCells.map(
              (
                day,
                index
              ) => {
                if (
                  day ===
                  null
                ) {
                  return (
                    <div
                      key={
                        `empty-${index}`
                      }
                      className="min-h-[105px] sm:min-h-[150px] border-b border-l bg-slate-50/50"
                    />
                  );
                }

                const key =
                  dateKey(
                    year,
                    month,
                    day
                  );

                const dayEvents =
                  filteredEvents.filter(
                    (
                      event
                    ) =>
                      event.test_date ===
                      key
                  );

                const load =
                  analyzeDayLoad(
                    dayEvents
                  );

                const dayStyle =
  load.level === "critical"
    ? "bg-red-50 border-red-200"
    : load.level === "warning"
    ? "bg-amber-50 border-amber-200"
    : dayEvents.length > 0
    ? "bg-green-50 border-green-200"
    : "bg-white border-slate-200";

                return (
                  <div
                    key={
                      key
                    }
                    role={
                      isAdmin
                        ? "button"
                        : undefined
                    }
                    tabIndex={
                      isAdmin
                        ? 0
                        : undefined
                    }
                    title={
                      isAdmin
                        ? "לחץ לתיאום בוחן בתאריך זה"
                        : undefined
                    }
                    onClick={() =>
                      openQuickAdd(
                        key
                      )
                    }
                    onKeyDown={(event) => {
                      if (
                        event.key ===
                          "Enter" ||
                        event.key ===
                          " "
                      ) {
                        event.preventDefault();
                        openQuickAdd(
                          key
                        );
                      }
                    }}
                    className={`min-h-[105px] sm:min-h-[150px] border-b border-l p-1.5 sm:p-2 ${dayStyle} ${
                      isAdmin
                        ? "cursor-pointer hover:ring-2 hover:ring-inset hover:ring-blue-400 transition focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                        : ""
                    }`}
                  >

                    <div className="flex items-center justify-between">

                      <div className="flex items-center gap-1.5">
                        <span className="text-xs sm:text-sm font-black">
                          {day}
                        </span>

                        {isAdmin && (
                          <span
                            className="text-[10px] sm:text-xs text-blue-600 font-black"
                            aria-hidden="true"
                          >
                            ＋
                          </span>
                        )}
                      </div>

                      {load.maxConcurrent >
                        2 && (
                        <span className="text-[9px] sm:text-[10px] font-bold">
                          {load.maxConcurrent} במקביל
                        </span>
                      )}

                    </div>

                    {load.windowText && (
                      <p className="hidden sm:block text-[10px] text-slate-500 mt-1">
                        עומס{" "}
                        {
                          load.windowText
                        }
                      </p>
                    )}

                    <div className="space-y-1 mt-2">

                      {dayEvents.map(
                        (
                          event
                        ) => {

                          const major =
                            isMajorTest(
                              event
                            );

                          return (
                            <div
                              key={
                                event.id
                              }
                              onClick={(clickEvent) =>
                                clickEvent.stopPropagation()
                              }
                              onKeyDown={(keyEvent) =>
                                keyEvent.stopPropagation()
                              }
                              className={
                                major
                                  ? "bg-red-600 text-white rounded-lg p-1.5 text-[9px] sm:text-xs"
                                  : load.level ===
                                    "warning"
                                  ? "bg-amber-200 text-amber-950 rounded-lg p-1.5 text-[9px] sm:text-xs"
                                  : "bg-slate-900 text-white rounded-lg p-1.5 text-[9px] sm:text-xs"
                              }
                            >

                              <p className="font-black truncate">
                                {
                                  event.battalion
                                }{" "}
                                •{" "}
                                {
                                  event.test_name
                                }
                              </p>

                              <p className="opacity-80 mt-0.5">
                                {event.start_time.slice(
                                  0,
                                  5
                                )}
                                –
                                {event.end_time.slice(
                                  0,
                                  5
                                )}
                              </p>

                              <p className="hidden sm:block opacity-80">
                                {attemptLabel(
                                  event.attempt
                                )}
                              </p>

                              {isAdmin && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    deleteEvent(
                                      event.id
                                    )
                                  }
                                  className="text-[9px] underline mt-1 opacity-80"
                                >
                                  מחיקה
                                </button>
                              )}

                            </div>
                          );
                        }
                      )}

                    </div>

                  </div>
                );
              }
            )}

          </div>

        </section>

        {loading && (
          <p className="text-center text-slate-400 mt-6">
            טוען לוח...
          </p>
        )}

        {message && (
          <div className="bg-blue-50 border border-blue-100 text-blue-700 rounded-xl p-4 mt-5">
            {message}
          </div>
        )}

      </div>

    </main>
  );
}

/* =========================================================
   TIME FIELD
========================================================= */

function TimeField({
  title,
  value,
  onChange,
}: {
  title: string;

  value: string;

  onChange:
    (
      value: string
    ) => void;
}) {
  return (
    <label>

      <span className="text-sm font-bold">
        {title}
      </span>

      <input
        type="time"
        value={
          value
        }
        onChange={(
          event
        ) =>
          onChange(
            event
              .target
              .value
          )
        }
        className="w-full border rounded-xl px-4 py-3 mt-2 bg-white"
      />

    </label>
  );
}