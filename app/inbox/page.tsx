import Link from "next/link";
import NorthstarShell from "@/components/northstar/NorthstarShell";
import StatusBadge from "@/components/northstar/StatusBadge";
import { getEmails } from "@/lib/db/northstar";

export const dynamic = "force-dynamic";

export default function InboxPage() {
  const emails = getEmails();

  return (
    <NorthstarShell
      title="Inbox"
      description="Customer requests and operational correspondence."
    >
      <div className="overflow-hidden rounded-xl border border-black/[0.08] bg-white">
        <div className="border-b border-black/[0.08] px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[14px] font-semibold text-[#20201d]">
                Customer requests
              </p>

              <p className="mt-1 text-[11px] uppercase tracking-[0.1em] text-black/40">
                {emails.length} messages
              </p>
            </div>

            <StatusBadge value="unresolved" />
          </div>
        </div>

        <div>
          {emails.map((email) => (
            <Link
              key={email.id}
              href={`/inbox?email=${email.id}`}
              className="group block border-b border-black/[0.07] px-5 py-4 transition last:border-b-0 hover:bg-[#faf9f6]"
            >
              <div className="flex items-start justify-between gap-6">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2">
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                        email.status === "unread"
                          ? "bg-emerald-500"
                          : "bg-black/20"
                      }`}
                    />

                    <span className="text-[10px] font-medium uppercase tracking-[0.12em] text-black/40">
                      {email.id}
                    </span>
                  </div>

                  <h2 className="truncate text-[14px] font-semibold text-[#20201d] transition group-hover:text-black">
                    {email.subject}
                  </h2>

                  <p className="mt-1 text-[12px] text-black/50">
                    {email.sender}
                  </p>

                  <p className="mt-2 max-w-3xl truncate text-[13px] leading-5 text-black/55">
                    {email.body}
                  </p>
                </div>

                <div className="shrink-0 pt-1">
                  <StatusBadge value={email.status} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </NorthstarShell>
  );
}