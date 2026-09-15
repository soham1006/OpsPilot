import NorthstarShell from "@/components/northstar/NorthstarShell";
import StatusBadge from "@/components/northstar/StatusBadge";
import { getTasks } from "@/lib/db/northstar";

export default function TasksPage() {
  const tasks = getTasks();

  return (
    <NorthstarShell
      title="Tasks"
      description="Internal work items generated from customer requests."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {tasks.map((task) => (
          <article
            key={task.id}
            data-task-id={task.id}
            className="rounded-xl border border-black/10 bg-white p-5"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-medium text-black/35">
                  {task.id}
                </p>

                <h2 className="mt-1 font-semibold">{task.title}</h2>
              </div>

              <StatusBadge value={task.status} />
            </div>

            <p className="mt-4 text-sm leading-6 text-black/55">
              {task.description}
            </p>

            <div className="mt-5 flex items-center justify-between border-t border-black/8 pt-4 text-xs">
              <span className="text-black/40">
                Priority:{" "}
                <span className="font-medium text-black/65">
                  {task.priority}
                </span>
              </span>

              <span className="text-black/40">
                Source: {task.source_email_id ?? "Manual"}
              </span>
            </div>
          </article>
        ))}
      </div>
    </NorthstarShell>
  );
}