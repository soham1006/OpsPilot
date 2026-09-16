import Link from "next/link";
import type { ReactNode } from "react";

const navigation = [
  { href: "/inbox", label: "Inbox" },
  { href: "/customers", label: "Customers" },
  { href: "/appointments", label: "Appointments" },
  { href: "/billing", label: "Billing" },
  { href: "/policies", label: "Policies" },
  { href: "/tasks", label: "Tasks" },
  { href: "/missions", label: "Missions" },
  { href: "/audit", label: "Audit" },
];

export default function NorthstarShell({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f5f3ee] text-[#20201d]">
      <header className="border-b border-black/10 bg-[#faf9f6]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/inbox" className="group">
            <div className="text-xs font-semibold uppercase tracking-[0.2em] text-black/45">
              Northstar
            </div>
            <div className="text-lg font-semibold tracking-tight">
              Operations
            </div>
          </Link>

          <div className="rounded-full border border-black/10 bg-white px-3 py-1.5 text-xs font-medium text-black/55">
            Internal workspace
          </div>
        </div>

        <nav className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-6 pb-3">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap rounded-md px-3 py-2 text-sm text-black/60 transition hover:bg-black/5 hover:text-black"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="mb-7">
          <p className="mb-1 text-xs font-semibold uppercase tracking-[0.18em] text-black/40">
            Northstar Operations
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          {description && (
            <p className="mt-2 max-w-2xl text-sm leading-6 text-black/55">
              {description}
            </p>
          )}
        </div>

        {children}
      </main>
    </div>
  );
}