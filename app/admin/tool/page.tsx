"use client";

import Link from "next/link";
import {
  useMemo,
  useState,
} from "react";

import {
  useAuth,
} from "@/lib/use-auth";

/* =========================================================
   HELPERS
========================================================= */

function safeInt(
  value: number
) {
  if (
    !Number.isFinite(
      value
    )
  ) {
    return 0;
  }

  return Math.max(
    0,
    Math.round(
      value
    )
  );
}

function percent(
  part: number,
  total: number
) {
  if (
    total <= 0
  ) {
    return null;
  }

  return (
    Math.round(
      (
        part /
        total
      ) *
        1000
    ) / 10
  );
}

function showPercent(
  value:
    | number
    | null
) {
  if (
    value === null
  ) {
    return "—";
  }

  return `${value}%`;
}

/* =========================================================
   PAGE
========================================================= */

export default function AdminToolPage() {
  const {
    isAdmin,
    loading,
  } =
    useAuth();

  const [
    openingStrength,
    setOpeningStrength,
  ] =
    useState(0);

  const [
    currentStrength,
    setCurrentStrength,
  ] =
    useState(0);

  const [
    tested,
    setTested,
  ] =
    useState(0);

  const [
    passed,
    setPassed,
  ] =
    useState(0);

  const [
    excellent,
    setExcellent,
  ] =
    useState(0);

  const [
    absent,
    setAbsent,
  ] =
    useState(0);

  const [
    dismissed,
    setDismissed,
  ] =
    useState(0);

  const [
    previousCumulativePassed,
    setPreviousCumulativePassed,
  ] =
    useState(0);

  const calc =
    useMemo(
      () => {
        const opening =
          safeInt(
            openingStrength
          );

        const current =
          safeInt(
            currentStrength
          );

        const testedNow =
          safeInt(
            tested
          );

        const passedNow =
          safeInt(
            passed
          );

        const excellentNow =
          safeInt(
            excellent
          );

        const absentNow =
          safeInt(
            absent
          );

        const dismissedNow =
          safeInt(
            dismissed
          );

        const previousPassed =
          safeInt(
            previousCumulativePassed
          );

        const failedNow =
          Math.max(
            0,
            testedNow -
              passedNow
          );

        const cumulativePassed =
          previousPassed +
          passedNow;

        const passPercent =
          percent(
            passedNow,
            testedNow
          );

        const failPercent =
          percent(
            failedNow,
            testedNow
          );

        const excellentPercent =
          percent(
            excellentNow,
            testedNow
          );

        const remainingPercent =
          percent(
            current,
            opening
          );

        const dismissedPercent =
          percent(
            dismissedNow,
            opening
          );

        const cumulativePassPercent =
          percent(
            cumulativePassed,
            opening
          );

        const notPassedYet =
          Math.max(
            0,
            current -
              cumulativePassed
          );

        const notPassedYetPercent =
          percent(
            notPassedYet,
            current
          );

        const participationPercent =
          percent(
            testedNow,
            testedNow +
              absentNow
          );

        return {
          failedNow,

          cumulativePassed,

          notPassedYet,

          passPercent,

          failPercent,

          excellentPercent,

          remainingPercent,

          dismissedPercent,

          cumulativePassPercent,

          notPassedYetPercent,

          participationPercent,

          validPassed:
            passedNow <=
            testedNow,

          validExcellent:
            excellentNow <=
            passedNow,

          validCurrent:
            current <=
            opening,

          validCumulative:
            cumulativePassed <=
            opening,

          validAttendance:
            testedNow +
              absentNow <=
            current,

          validDismissed:
            dismissedNow <=
            opening,
        };
      },
      [
        openingStrength,
        currentStrength,
        tested,
        passed,
        excellent,
        absent,
        dismissed,
        previousCumulativePassed,
      ]
    );

  const allValid =
    calc.validPassed &&
    calc.validExcellent &&
    calc.validCurrent &&
    calc.validCumulative &&
    calc.validAttendance &&
    calc.validDismissed;

  if (loading) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-slate-100 flex items-center justify-center"
      >
        טוען...
      </main>
    );
  }

 if (!isAdmin) {
    return (
      <main
        dir="rtl"
        className="min-h-screen bg-slate-100 p-6"
      >

        <div className="max-w-xl mx-auto bg-white rounded-3xl shadow-sm p-8 text-center">

          <h1 className="text-2xl font-black">
            אין הרשאת גישה
          </h1>

          <p className="text-slate-500 mt-2">
            המחשבון זמין למשתמש Admin בלבד.
          </p>

          <Link
            href="/"
            className="inline-block bg-slate-900 text-white rounded-xl px-5 py-3 mt-5"
          >
            חזרה לדף הבית
          </Link>

        </div>

      </main>
    );
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-100 text-slate-900"
    >

      {/* HEADER */}

      <header className="bg-slate-950 text-white px-4 sm:px-6 lg:px-8 py-6">

        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">

          <div>

            <p className="text-slate-400 text-sm">
              CommandFit Admin
            </p>

            <h1 className="text-3xl font-black mt-1">
              🧮 מחשבון מצבה ובחנים
            </h1>

            <p className="text-slate-300 mt-2">
              כלי פנימי לחישוב נתוני המועד והמחזור
            </p>

          </div>

          <Link
            href="/"
            className="bg-white/10 hover:bg-white/20 rounded-xl px-5 py-3 text-center"
          >
            חזרה לדף הבית
          </Link>

        </div>

      </header>

      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">

        {/* GUIDE */}

        <section className="bg-blue-50 border border-blue-100 rounded-3xl p-5 sm:p-6 mb-6">

          <h2 className="text-xl font-black text-blue-900">
            💡 הידעת למדריכים?
          </h2>

          <div className="text-sm text-blue-800 leading-7 mt-3">

            <p>
              במועד א׳ יש להזין את כל מי שניגשו בפועל.
            </p>

            <p>
              במועד ב׳ וג׳ יש להזין רק את הנבחנים של אותו מועד — לא את מי שכבר עברו.
            </p>

            <p>
              מספר הנכשלים מחושב אוטומטית לפי: ניגשו פחות עברו.
            </p>

            <p>
              מצטיינים הם חלק מתוך העוברים, ולכן לא יכולים להיות יותר ממספר העוברים.
            </p>

            <p>
              מצבה נוכחית היא המצבה הפעילה באותו שלב בקורס, לאחר מודחים או עזיבות.
            </p>

            <p>
              עברו מצטבר לפני המועד הוא מספר הצוערים שכבר עברו במועדים קודמים.
            </p>

          </div>

        </section>

        {/* INPUT */}

        <section className="bg-white rounded-3xl shadow-sm p-5 sm:p-6 mb-6">

          <h2 className="text-2xl font-bold">
            הזנת נתונים
          </h2>

          <p className="text-slate-500 mt-1">
            הזן כמויות בלבד. כל האחוזים יחושבו אוטומטית.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">

            <NumberField
              title="מצבת פתיחת קורס"
              value={
                openingStrength
              }
              onChange={
                setOpeningStrength
              }
            />

            <NumberField
              title="מצבה נוכחית"
              value={
                currentStrength
              }
              onChange={
                setCurrentStrength
              }
            />

            <NumberField
              title="ניגשו למועד"
              value={
                tested
              }
              onChange={
                setTested
              }
            />

            <NumberField
              title="עברו במועד"
              value={
                passed
              }
              onChange={
                setPassed
              }
            />

            <NumberField
              title="מצטיינים במועד"
              value={
                excellent
              }
              onChange={
                setExcellent
              }
            />

            <NumberField
              title="לא ניגשו"
              value={
                absent
              }
              onChange={
                setAbsent
              }
            />

            <NumberField
              title="מודחים / עזבו"
              value={
                dismissed
              }
              onChange={
                setDismissed
              }
            />

            <NumberField
              title="עברו מצטבר לפני המועד"
              value={
                previousCumulativePassed
              }
              onChange={
                setPreviousCumulativePassed
              }
            />

          </div>

        </section>

        {/* AUTO COUNTS */}

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">

          <CountCard
            title="נכשלו במועד"
            value={
              calc.failedNow
            }
          />

          <CountCard
            title="עברו מצטבר"
            value={
              calc.cumulativePassed
            }
          />

          <CountCard
            title="טרם עברו"
            value={
              calc.notPassedYet
            }
          />

        </section>

        {/* VALIDATION */}

        <section className="bg-white rounded-3xl shadow-sm p-5 sm:p-6 mb-6">

          <h2 className="text-xl font-bold">
            בדיקת תקינות
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-5">

            <ValidationCard
              valid={
                calc.validPassed
              }
              text="עברו ≤ ניגשו"
            />

            <ValidationCard
              valid={
                calc.validExcellent
              }
              text="מצטיינים ≤ עברו"
            />

            <ValidationCard
              valid={
                calc.validCurrent
              }
              text="מצבה נוכחית ≤ מצבת פתיחה"
            />

            <ValidationCard
              valid={
                calc.validCumulative
              }
              text="עברו מצטבר ≤ מצבת פתיחה"
            />

            <ValidationCard
              valid={
                calc.validAttendance
              }
              text="ניגשו + לא ניגשו ≤ מצבה נוכחית"
            />

            <ValidationCard
              valid={
                calc.validDismissed
              }
              text="מודחים ≤ מצבת פתיחה"
            />

          </div>

          <div
            className={
              allValid
                ? "bg-green-50 border border-green-100 text-green-700 rounded-xl p-4 mt-5 font-bold"
                : "bg-red-50 border border-red-100 text-red-700 rounded-xl p-4 mt-5 font-bold"
            }
          >
            {allValid
              ? "✅ הנתונים תקינים לחישוב"
              : "⚠️ יש נתון שאינו מסתדר. בדוק את ההזנה לפני שימוש בתוצאות."}
          </div>

        </section>

        {/* RESULTS */}

        <section className="bg-white rounded-3xl shadow-sm p-5 sm:p-6">

          <h2 className="text-2xl font-bold">
            תמונת מצב מחושבת
          </h2>

          <p className="text-slate-500 mt-1">
            אלו הנתונים שניתן להעביר בהמשך לדשבורד המפקדים.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">

            <ResultCard
              title="אחוז מעבר במועד"
              value={
                showPercent(
                  calc.passPercent
                )
              }
            />

            <ResultCard
              title="אחוז כישלון במועד"
              value={
                showPercent(
                  calc.failPercent
                )
              }
            />

            <ResultCard
              title="אחוז מצטיינים"
              value={
                showPercent(
                  calc.excellentPercent
                )
              }
            />

            <ResultCard
              title="אחוז השתתפות במועד"
              value={
                showPercent(
                  calc.participationPercent
                )
              }
            />

            <ResultCard
              title="% שנותרו במחזור"
              value={
                showPercent(
                  calc.remainingPercent
                )
              }
            />

            <ResultCard
              title="% מעבר מצטבר מהמחזור המקורי"
              value={
                showPercent(
                  calc.cumulativePassPercent
                )
              }
            />

            <ResultCard
              title="% מודחים מהמחזור המקורי"
              value={
                showPercent(
                  calc.dismissedPercent
                )
              }
            />

            <ResultCard
              title="% טרם עברו מהמצבה הנוכחית"
              value={
                showPercent(
                  calc.notPassedYetPercent
                )
              }
            />

          </div>

        </section>

      </div>

    </main>
  );
}

/* =========================================================
   COMPONENTS
========================================================= */

function NumberField({
  title,
  value,
  onChange,
}: {
  title: string;
  value: number;
  onChange:
    (value: number) =>
      void;
}) {
  return (
    <label className="bg-slate-50 border border-slate-200 rounded-2xl p-5">

      <span className="block text-sm font-bold">
        {title}
      </span>

      <input
        type="number"
        min={0}
        step={1}
        value={
          value
        }
        onChange={(
          event
        ) =>
          onChange(
            safeInt(
              Number(
                event.target.value
              )
            )
          )
        }
        className="w-full border border-slate-300 rounded-xl px-4 py-3 mt-3 text-2xl font-black bg-white"
      />

    </label>
  );
}

function CountCard({
  title,
  value,
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="bg-slate-900 text-white rounded-2xl p-5">

      <p className="text-sm text-slate-300">
        {title}
      </p>

      <p className="text-3xl font-black mt-2">
        {value}
      </p>

    </div>
  );
}

function ResultCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5">

      <p className="text-sm text-slate-500">
        {title}
      </p>

      <p className="text-3xl font-black mt-2">
        {value}
      </p>

    </div>
  );
}

function ValidationCard({
  valid,
  text,
}: {
  valid: boolean;
  text: string;
}) {
  return (
    <div
      className={
        valid
          ? "bg-green-50 border border-green-100 text-green-700 rounded-xl p-4"
          : "bg-red-50 border border-red-100 text-red-700 rounded-xl p-4"
      }
    >
      <p className="font-bold">
        {valid
          ? "✅"
          : "⚠️"}{" "}
        {text}
      </p>
    </div>
  );
}