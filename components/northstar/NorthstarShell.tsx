import Link from "next/link";
import type { ReactNode } from "react";
import NorthstarNav from "./NorthstarNav";

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
    <div className="min-h-screen bg-[#f3f1eb] text-[#20201d]">
      <header className="sticky top-0 z-20 border-b border-black/10 bg-[#faf9f6]/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 sm:px-6">
          <Link
            href="/inbox"
            className="group rounded-sm focus-visible:outline-none"
            aria-label="Northstar Operations home"
          >
            <div className="flex items-baseline gap-2">
              <span className="text-[10px] font-semibold uppercase tracking-[0.24em] text-black/40">
                Northstar
              </span>

              <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-black/25">
                / Internal
              </span>
            </div>

            <div className="mt-0.5 text-lg font-semibold tracking-[-0.02em] text-black/85 transition group-hover:text-black">
              Operations
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-black/30">
                Workspace
              </div>

              <div className="text-xs font-medium text-black/60">
                Internal operations
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600/70" />

              <span className="text-[11px] font-medium text-black/55">
                Operational
              </span>
            </div>
          </div>
        </div>

        <NorthstarNav />
      </header>

      <main className="mx-auto max-w-7xl px-5 py-8 sm:px-6 sm:py-10">
        <div className="mb-8 border-b border-black/10 pb-7">
          <div className="mb-2 flex items-center gap-2">
            <span className="h-px w-5 bg-black/25" />

            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-black/40">
              Northstar Operations
            </p>
          </div>

          <h1 className="text-[30px] font-semibold leading-tight tracking-[-0.035em] text-black/90 sm:text-[34px]">
            {title}
          </h1>

          {description && (
            <p className="mt-2 max-w-2xl text-[14px] leading-6 text-black/50">
              {description}
            </p>
          )}
        </div>

        {children}
      </main>
    </div>
  );
}