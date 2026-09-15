import { NextResponse } from "next/server";

import {
  runAgent,
} from "@/lib/agent/orchestrator";

export async function POST(
  request: Request,
) {
  try {
    const body = await request.json();

    if (
      !body ||
      typeof body.sender !== "string" ||
      typeof body.subject !== "string" ||
      typeof body.body !== "string"
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "sender, subject, and body are required.",
        },
        { status: 400 },
      );
    }

    const state = await runAgent({
      sender: body.sender,
      subject: body.subject,
      body: body.body,
    });

    return NextResponse.json({
      success: true,
      state,
    });
  } catch (error) {
    console.error(
      "Agent execution failed:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Agent execution failed.",
      },
      { status: 500 },
    );
  }
}