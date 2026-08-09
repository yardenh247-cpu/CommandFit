import OpenAI from "openai";
import { NextResponse } from "next/server";

type AnalysisRequest = {
  battalion?: string;
  track?: string;
  testName?: string;
  cycle?: string;

  overall?: {
    passedPercent?: number;
    failedPercent?: number;
    excellentPercent?: number;
  };

  metrics?: Record<
    string,
    {
      average?: string;
      failedPercent?: number;
    }
  >;

  trends?: {
    firstAttempt?: number;
    latestAttempt?: number;

    passedChange?: number;
    failedChange?: number;
    excellentChange?: number;

    metrics?: Record<
      string,
      {
        failedChange?: number;
      }
    >;
  };
};

const analysisSchema = {
  type: "object",
  additionalProperties: false,

  properties: {
    summary: {
      type: "string",
    },

    strengths: {
      type: "array",
      items: {
        type: "string",
      },
    },

    weaknesses: {
      type: "array",
      items: {
        type: "string",
      },
    },

    trends: {
      type: "array",
      items: {
        type: "string",
      },
    },

    recommendations: {
      type: "array",
      items: {
        type: "string",
      },
    },

    commanderMessage: {
      type: "string",
    },
  },

  required: [
    "summary",
    "strengths",
    "weaknesses",
    "trends",
    "recommendations",
    "commanderMessage",
  ],
} as const;

function sanitizePayload(
  body: AnalysisRequest
) {
  return {
    battalion:
      body.battalion ??
      "",

    track:
      body.track ??
      "",

    testName:
      body.testName ??
      "",

    cycle:
      body.cycle ??
      "",

    overall: {
      passedPercent:
        Number(
          body.overall
            ?.passedPercent ??
            0
        ),

      failedPercent:
        Number(
          body.overall
            ?.failedPercent ??
            0
        ),

      excellentPercent:
        Number(
          body.overall
            ?.excellentPercent ??
            0
        ),
    },

    metrics:
      body.metrics ??
      {},

    trends:
      body.trends ??
      {},
  };
}

export async function POST(
  request: Request
) {
  try {
    const apiKey =
      process.env
        .OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "OPENAI_API_KEY is missing",
        },
        {
          status: 500,
        }
      );
    }

    const openai =
      new OpenAI({
        apiKey,
      });

    const body =
      (await request.json()) as
        AnalysisRequest;

    const payload =
      sanitizePayload(
        body
      );

    const response =
      await openai.responses.create({
        model:
          "gpt-5.6",

        instructions: `
אתה מנתח נתוני כשירות גופנית מצרפיים עבור מערכת CommandFit.

כללי עבודה:
1. הנתונים שתקבל הם נתונים מצרפיים בלבד.
2. אין להסיק, לייצר או להמציא שמות, כמויות נבחנים או מידע אישי.
3. אין להמציא נתונים שלא קיימים בקלט.
4. נתח רק אחוזי עוברים, אחוזי נכשלים, אחוזי מצטיינים, ממוצעים ומגמות.
5. אחוז אי-עמידה גבוה יותר מצביע על מוקד חולשה.
6. ירידה באחוז אי-העמידה בין מועדים מצביעה על שיפור.
7. עלייה באחוז אי-העמידה בין מועדים מצביעה על החמרה.
8. תן המלצות אימון פרקטיות, קצרות וישימות.
9. כתוב בעברית ברורה, מקצועית ותמציתית המתאימה להצגה למפקד.
10. אם אין מספיק מידע למסקנה מסוימת, ציין שאין מספיק נתונים.
11. אין להציג נתונים שלא נמסרו בקלט.
        `,

        input: `
נתח את נתוני CommandFit הבאים:

${JSON.stringify(
  payload,
  null,
  2
)}
        `,

        text: {
          format: {
            type:
              "json_schema",

            name:
              "commandfit_analysis",

            strict:
              true,

            schema:
              analysisSchema,
          },
        },
      });

    const output =
      response.output_text;

    if (!output) {
      return NextResponse.json(
        {
          ok: false,
          message:
            "לא התקבלה תשובה מה-AI",
        },
        {
          status: 502,
        }
      );
    }

    const parsed =
      JSON.parse(
        output
      );

    return NextResponse.json({
      ok: true,
      analysis:
        parsed,
    });
  } catch (error) {
    console.error(
      "CommandFit AI analysis error:",
      error
    );

    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof
          Error
            ? error.message
            : "אירעה שגיאה בניתוח AI",
      },
      {
        status: 500,
      }
    );
  }
}