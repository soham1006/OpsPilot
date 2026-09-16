import { NextResponse } from "next/server";

import {
  createMission,
  addTaskToMission,
} from "@/lib/db/repositories/missions";

import {
  findTaskById,
} from "@/lib/db/repositories/tasks";

import {
  runMission,
} from "@/lib/agent/mission";

export async function POST(
  request: Request,
) {
  try {
    const body = await request.json();

    if (
      !body ||
      typeof body.goal !== "string" ||
      body.goal.trim().length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "goal is required.",
        },
        { status: 400 },
      );
    }

    if (
      !Array.isArray(body.taskIds) ||
      body.taskIds.length === 0
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "taskIds must contain at least one task.",
        },
        { status: 400 },
      );
    }

   const rawTaskIds: unknown[] =
  body.taskIds;

const taskIds: string[] =
  rawTaskIds.filter(
    (taskId): taskId is string =>
      typeof taskId === "string" &&
      taskId.trim().length > 0,
  );

if (
  taskIds.length !== rawTaskIds.length
) {
  return NextResponse.json(
    {
      success: false,
      error:
        "Every taskId must be a non-empty string.",
    },
    { status: 400 },
  );
}

    const uniqueTaskIds =
      [...new Set(taskIds)];

    if (
      uniqueTaskIds.length !== taskIds.length
    ) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Duplicate task IDs are not allowed.",
        },
        { status: 400 },
      );
    }

    // --------------------------------------------------------
    // Validate every task before creating the mission.
    // This prevents partially-created missions.
    // --------------------------------------------------------

    for (const taskId of uniqueTaskIds) {
      const task =
        findTaskById(taskId);

      if (!task) {
        return NextResponse.json(
          {
            success: false,
            error:
              `Task "${taskId}" was not found.`,
          },
          { status: 400 },
        );
      }
    }

    const mission =
      createMission(
        body.goal.trim(),
      );

    for (const taskId of uniqueTaskIds) {
      addTaskToMission(
        mission.id,
        taskId,
      );
    }

    const result =
      await runMission(
        mission.id,
      );

    return NextResponse.json({
      success: true,
      mission: result.mission,
      tasks: result.tasks,
    });
  } catch (error) {
    console.error(
      "Mission execution failed:",
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Mission execution failed.",
      },
      { status: 500 },
    );
  }
}