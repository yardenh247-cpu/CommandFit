"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  useAuth,
} from "@/lib/use-auth";

const fighters = [
  "גפן",
  "רימון",
  "דקל",
  "הדס",
  "דולב",
];

const staff = [
  "ארז",
  "ברוש",
  "חרוב",
  "אלון",
];

export default function Home() {
  const router =
    useRouter();

  const {
    user,
    loading,
    isAdmin,
    isViewer,
  } = useAuth();

  async function logout() {
    try {
      await fetch(
        "/api/auth/logout",
        {
          method: "POST",
        }
      );
    } finally {
      router.push(
        "/login"
      );

      router.refresh();
    }
  }

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-100"
    >
      {/* ===================================================
          HEADER
      =================================================== */}

      <header className="bg-slate-950 text-white px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-5">

          <div>
            <div className="flex items-center gap-3">

              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-lg sm:text-xl shadow-lg">
                CF
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-black">
                  CommandFit
                </h1>

                <p className="text-slate-400 text-sm mt-1">
                  מערכת ניהול ובקרת הכשירות הגופנית
                </p>
              </div>

            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">

            {!loading && user && (
              <div className="bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-sm">

                <span className="text-slate-400">
                  מחובר כ־
                </span>

                <strong>
                  {isAdmin
                    ? "מנהל"
                    : isViewer
                    ? "צפייה בלבד"
                    : user.username}
                </strong>

              </div>
            )}

            <button
              type="button"
              onClick={
                logout
              }
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 border border-white/10 px-5 py-3 rounded-xl font-medium transition"
            >
              התנתקות
            </button>

          </div>

        </div>
      </header>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">

        {/* =================================================
            TITLE
        ================================================= */}

        <section className="mb-7 sm:mb-10">

          <h2 className="text-2xl sm:text-3xl font-bold">
            לוח בקרה
          </h2>

          <p className="text-slate-500 mt-2">
            תמונת מצב מרכזית של הכשירות הגופנית
          </p>

        </section>

        {/* =================================================
            DASHBOARD CARDS
        ================================================= */}

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-8 sm:mb-10">

          <DashboardCard
            title='סה"כ צוערים'
            value="0"
          />

          <DashboardCard
            title="עוברים"
            value="0"
          />

          <DashboardCard
            title="מצטיינים"
            value="0"
          />

          <DashboardCard
            title="נכשלים"
            value="0"
          />

        </section>

        {/* =================================================
            FIGHTERS
        ================================================= */}

        <section className="bg-white rounded-3xl shadow-sm p-4 sm:p-6 mb-6 sm:mb-8">

          <div className="mb-5">

            <p className="text-xs font-bold text-blue-700 uppercase tracking-wide">
              מגמה
            </p>

            <h2 className="text-xl sm:text-2xl font-bold mt-1">
              מגמת לוחמים
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              כניסה לגדוד, בחנים, צוערים וסיכום נתונים
            </p>

          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">

            {fighters.map(
              (
                battalion
              ) => (

                <BattalionCard
                  key={
                    battalion
                  }
                  battalion={
                    battalion
                  }
                  variant="dark"
                />

              )
            )}

          </div>

        </section>

        {/* =================================================
            STAFF
        ================================================= */}

        <section className="bg-white rounded-3xl shadow-sm p-4 sm:p-6">

          <div className="mb-5">

            <p className="text-xs font-bold text-violet-700 uppercase tracking-wide">
              מגמה
            </p>

            <h2 className="text-xl sm:text-2xl font-bold mt-1">
              מגמת מטה
            </h2>

            <p className="text-sm text-slate-500 mt-1">
              כניסה לנתוני הגדודים ובחני הכשירות
            </p>

          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">

            {staff.map(
              (
                battalion
              ) => (

                <BattalionCard
                  key={
                    battalion
                  }
                  battalion={
                    battalion
                  }
                  variant="light"
                />

              )
            )}

          </div>

        </section>

      </div>
    </main>
  );
}

/* =========================================================
   BATTALION CARD
========================================================= */

function BattalionCard({
  battalion,
  variant,
}: {
  battalion: string;
  variant:
    | "dark"
    | "light";
}) {
  const dark =
    variant ===
    "dark";

  return (
    <Link
      href={`/battalions/${encodeURIComponent(
        battalion
      )}`}
      className={
        dark
          ? "group min-h-[110px] sm:min-h-[125px] rounded-2xl bg-slate-900 px-4 sm:px-6 py-5 flex flex-col items-center justify-center text-center text-white transition hover:bg-slate-700 active:scale-[0.98]"
          : "group min-h-[110px] sm:min-h-[125px] rounded-2xl border-2 border-slate-200 bg-white px-4 sm:px-6 py-5 flex flex-col items-center justify-center text-center transition hover:bg-slate-50 hover:border-violet-200 active:scale-[0.98]"
      }
    >

      <span
        className={
          dark
            ? "text-2xl sm:text-3xl font-black"
            : "text-2xl sm:text-3xl font-black text-slate-900"
        }
      >
        {battalion}
      </span>

      <span
        className={
          dark
            ? "text-xs sm:text-sm text-slate-400 mt-2 group-hover:text-slate-300"
            : "text-xs sm:text-sm text-slate-400 mt-2"
        }
      >
        כניסה לגדוד ←
      </span>

    </Link>
  );
}

/* =========================================================
   DASHBOARD CARD
========================================================= */

function DashboardCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6">

      <p className="text-xs sm:text-sm text-slate-500">
        {title}
      </p>

      <p className="text-2xl sm:text-4xl font-black mt-2">
        {value}
      </p>

    </div>
  );
}
