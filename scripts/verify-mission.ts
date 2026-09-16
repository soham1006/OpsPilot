import {
  addTaskToMission,
  createMission,
  findMissionById,
  findMissionTasks,
  updateMissionStatus,
} from "@/lib/db/repositories/missions";

import {
  createTask,
  findTaskById,
} from "@/lib/db/repositories/tasks";

function assert(
  condition: unknown,
  message: string,
): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const mission = createMission(
  "Handle today's unresolved customer requests",
);

assert(
  mission.id.startsWith("M-"),
  "Mission ID was not generated correctly.",
);

assert(
  mission.status === "PENDING",
  "Mission should start as PENDING.",
);

const task = createTask({
  title: "Mission verification task",
  description: "Temporary task for mission persistence verification.",
  priority: "LOW",
});

assert(
  findTaskById(task.id) !== null,
  "Created task could not be found.",
);

const missionTask = addTaskToMission(
  mission.id,
  task.id,
);

assert(
  missionTask.missionId === mission.id,
  "Mission-task relation has incorrect mission ID.",
);

assert(
  missionTask.taskId === task.id,
  "Mission-task relation has incorrect task ID.",
);

const linkedTasks = findMissionTasks(
  mission.id,
);

assert(
  linkedTasks.length === 1,
  "Mission should contain exactly one task.",
);

assert(
  linkedTasks[0].taskId === task.id,
  "Mission task was not persisted correctly.",
);

const runningMission = updateMissionStatus(
  mission.id,
  "RUNNING",
);

assert(
  runningMission?.status === "RUNNING",
  "Mission did not transition to RUNNING.",
);

assert(
  runningMission?.startedAt !== null,
  "Mission startedAt was not recorded.",
);

const completedMission = updateMissionStatus(
  mission.id,
  "COMPLETED",
);

assert(
  completedMission?.status === "COMPLETED",
  "Mission did not transition to COMPLETED.",
);

assert(
  completedMission?.completedAt !== null,
  "Mission completedAt was not recorded.",
);

const persistedMission = findMissionById(
  mission.id,
);

assert(
  persistedMission?.status === "COMPLETED",
  "Mission status was not persisted.",
);

console.log(
  "Mission persistence verification completed successfully.",
);