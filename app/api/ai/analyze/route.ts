import { NextResponse } from "next/server";
import {
  AnalyzeEmailRequestSchema,
} from "@/lib/ai/schemas";
import { createAgentPlan } from "@/lib/ai/gemini";

export async function POST(request: Request) {
  try {
    const body: unknown = await request.json();

    const input = AnalyzeEmailRequestSchema.parse(body);

    const plan = await createAgentPlan(input);

    return NextResponse.json({
      success: true,
      plan,
    });
  } catch (error) {
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON request body.",
        },
        { status: 400 },
      );
    }

    if (
      error &&
      typeof error === "object" &&
      "name" in error &&
      error.name === "ZodError"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Request validation failed.",
        },
        { status: 400 },
      );
    }

    console.error("AI analysis failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: "AI analysis failed.",
      },
      { status: 500 },
    );
  }
}