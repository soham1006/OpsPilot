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
  className="group rounded-xl border border-black/[0.08] bg-white p-5 transition hover:border-black/[0.14] hover:shadow-[0_8px_30px_rgba(32,32,29,0.05)]"
>
  <div className="flex items-start justify-between gap-4">
    <div className="min-w-0">
      <div className="flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-black/25" />

        <p className="text-[10px] font-medium uppercase tracking-[0.12em] text-black/40">
          {task.id}
        </p>
      </div>

      <h2 className="mt-2 text-[15px] font-semibold text-[#20201d]">
        {task.title}
      </h2>
    </div>

    <div className="shrink-0">
      <StatusBadge value={task.status} />
    </div>
  </div>

  <div className="mt-5 border-t border-black/[0.07] pt-4">
    <p className="text-[13px] leading-6 text-black/60">
      {task.description}
    </p>
  </div>

  <div className="mt-4 grid grid-cols-2 gap-3">
    <div className="rounded-lg bg-[#faf9f6] px-3.5 py-3">
      <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-black/35">
        Priority
      </p>

      <p className="mt-1 text-[12px] font-medium text-black/70">
        {task.priority}
      </p>
    </div>

    <div className="rounded-lg bg-[#faf9f6] px-3.5 py-3">
      <p className="text-[10px] font-medium uppercase tracking-[0.1em] text-black/35">
        Source
      </p>

      <p className="mt-1 truncate text-[12px] font-medium text-black/70">
        {task.source_email_id ?? "Manual"}
      </p>
    </div>
  </div>
</article>
        ))}
      </div>
    </NorthstarShell>
  );
}