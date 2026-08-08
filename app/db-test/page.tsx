import { supabase } from "@/lib/supabase";

export default async function DatabaseTestPage() {
  const { data, error } = await supabase
    .from("cadets")
    .select("*")
    .limit(5);

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-xl rounded-2xl bg-white p-6">
        <h1 className="text-2xl font-bold">
          CommandFit DB Test
        </h1>

        {error ? (
          <pre className="mt-5 text-red-600">
            {JSON.stringify(error, null, 2)}
          </pre>
        ) : (
          <>
            <p className="mt-5 font-bold text-green-700">
              החיבור ל-Supabase עובד ✓
            </p>

            <p className="mt-2">
              מספר רשומות שהתקבלו: {data?.length ?? 0}
            </p>
          </>
        )}
      </div>
    </main>
  );
}