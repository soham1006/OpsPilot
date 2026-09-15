import Link from "next/link";
import NorthstarShell from "@/components/northstar/NorthstarShell";
import StatusBadge from "@/components/northstar/StatusBadge";
import { getEmails } from "@/lib/db/northstar";

export default function InboxPage() {
  const emails = getEmails();

  return (
    <NorthstarShell
      title="Inbox"
      description="Customer requests and operational correspondence."
    >
      <div className="overflow-hidden rounded-xl border border-black/10 bg-white">
        <div className="border-b border-black/10 px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Customer requests</p>
              <p className="mt-1 text-xs text-black/45">
                {emails.length} messages
              </p>
            </div>

            <StatusBadge value="unresolved" />
          </div>
        </div>

        <div className="divide-y divide-black/8">
          {emails.map((email) => (
            <Link
              key={email.id}
              href={`/inbox?email=${email.id}`}
              className="block px-5 py-4 transition hover:bg-[#faf9f6]"
            >
              <div className="flex items-start justify-between gap-6">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{email.subject}</span>
                    <span className="text-xs text-black/35">
                      {email.id}
                    </span>
                  </div>

                  <p className="mt-1 truncate text-sm text-black/55">
                    {email.body}
                  </p>

                  <p className="mt-2 text-xs text-black/40">
                    From {email.sender}
                  </p>
                </div>

                <StatusBadge value={email.status} />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </NorthstarShell>
  );
}