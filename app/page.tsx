import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f3f1eb] text-[#20201d]">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-6 sm:px-8 sm:py-8">
        {/* Header */}
        <header className="flex items-center justify-between border-b border-black/[0.08] pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#24463a] text-xs font-semibold text-white">
              O
            </div>

            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black/55">
                OpsPilot
              </p>

              <p className="mt-0.5 text-[10px] uppercase tracking-[0.1em] text-black/30">
                AI Operations
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-emerald-700/15 bg-emerald-700/[0.06] px-3 py-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />

            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-emerald-800">
              Operational
            </span>
          </div>
        </header>

        {/* Hero */}
        <section className="flex flex-1 items-center py-16 sm:py-20">
  <div className="grid w-full items-center gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
    {/* Left: Hero */}
    <div className="max-w-3xl">
      <div className="mb-6 flex items-center gap-3">
        <span className="h-px w-8 bg-[#24463a]" />

        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-black/45">
          Autonomous operations
        </p>
      </div>

      <h1 className="max-w-3xl text-5xl font-semibold tracking-[-0.045em] text-[#20201d] sm:text-6xl lg:text-[4.25rem] lg:leading-[1.02]">
        Turn unresolved customer requests into{" "}
        <span className="text-[#24463a]">verified actions.</span>
      </h1>

      <p className="mt-7 max-w-2xl text-base leading-7 text-black/55 sm:text-lg sm:leading-8">
        OpsPilot understands customer requests, evaluates deterministic
        policies, executes authorized operations, verifies the result,
        and escalates when human approval is required.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-[10px] font-medium uppercase tracking-[0.1em] text-black/45">
        <span>Understand</span>
        <span className="text-black/20">→</span>
        <span>Authorize</span>
        <span className="text-black/20">→</span>
        <span>Execute</span>
        <span className="text-black/20">→</span>
        <span>Verify</span>
      </div>

      <div className="mt-9 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/missions"
          className="inline-flex items-center justify-center gap-3 rounded-lg bg-[#24463a] px-5 py-3.5 text-sm font-medium text-white shadow-sm transition hover:bg-[#1d392f]"
        >
          Start Mission
          <span className="text-white/60">→</span>
        </Link>

        <Link
          href="/inbox"
          className="inline-flex items-center justify-center rounded-lg border border-black/[0.1] bg-white px-5 py-3.5 text-sm font-medium text-[#20201d] transition hover:bg-[#faf9f6]"
        >
          Open Operations
        </Link>
      </div>
    </div>

    {/* Right: Mission Control */}
    <div className="relative">
      <div className="overflow-hidden rounded-2xl border border-black/[0.09] bg-white shadow-[0_20px_60px_rgba(32,32,29,0.07)]">
        {/* Card header */}
        <div className="flex items-center justify-between border-b border-black/[0.07] px-5 py-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-black/35">
              Mission control
            </p>

            <p className="mt-1 text-[13px] font-semibold text-[#20201d]">
              Customer request
            </p>
          </div>

          <span className="flex items-center gap-1.5 rounded-full border border-emerald-700/15 bg-emerald-700/[0.05] px-2.5 py-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-emerald-800">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-600" />
            Running
          </span>
        </div>

        {/* Request */}
        <div className="border-b border-black/[0.07] px-5 py-5">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f3f1eb] text-[11px] font-semibold text-black/55">
              SJ
            </div>

            <div className="min-w-0">
              <p className="text-[12px] font-semibold text-[#20201d]">
                Sarah Johnson
              </p>

              <p className="mt-0.5 text-[10px] text-black/40">
                Reschedule appointment · A2001
              </p>

              <p className="mt-3 rounded-lg bg-[#faf9f6] px-3.5 py-3 text-[11px] leading-5 text-black/55">
                Reschedule my appointment to September 18 at 10:00 AM.
              </p>
            </div>
          </div>
        </div>

        {/* Agent pipeline */}
        <div className="px-5 py-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-black/35">
              Execution pipeline
            </p>

            <span className="font-mono text-[10px] text-black/30">
              04 / 05
            </span>
          </div>

          <div className="space-y-0">
            {/* Step 1 */}
            <div className="relative flex gap-3 pb-5">
              <div className="relative flex w-5 justify-center">
                <span className="z-10 mt-0.5 h-4 w-4 rounded-full border-[3px] border-white bg-[#24463a] shadow-sm" />
                <span className="absolute top-4 h-full w-px bg-black/[0.08]" />
              </div>

              <div className="flex-1">
                <p className="text-[12px] font-medium text-[#20201d]">
                  Understand request
                </p>

                <p className="mt-1 text-[10px] text-black/40">
                  Intent and entities extracted
                </p>
              </div>

              <span className="text-[9px] font-semibold uppercase tracking-[0.08em] text-emerald-700">
                Done
              </span>
            </div>

            {/* Step 2 */}
            <div className="relative flex gap-3 pb-5">
              <div className="relative flex w-5 justify-center">
                <span className="z-10 mt-0.5 h-4 w-4 rounded-full border-[3px] border-white bg-[#24463a] shadow-sm" />
                <span className="absolute top-4 h-full w-px bg-black/[0.08]" />
              </div>

              <div className="flex-1">
                <p className="text-[12px] font-medium text-[#20201d]">
                  Evaluate policy
                </p>

                <p className="mt-1 text-[10px] text-black/40">
                  Deterministic authorization · LOW risk
                </p>
              </div>

              <span className="text-[9px] font-semibold uppercase tracking-[0.08em] text-emerald-700">
                Allowed
              </span>
            </div>

            {/* Step 3 */}
            <div className="relative flex gap-3 pb-5">
              <div className="relative flex w-5 justify-center">
                <span className="z-10 mt-0.5 h-4 w-4 rounded-full border-[3px] border-white bg-[#24463a] shadow-sm" />
                <span className="absolute top-4 h-full w-px bg-black/[0.08]" />
              </div>

              <div className="flex-1">
                <p className="text-[12px] font-medium text-[#20201d]">
                  Execute operation
                </p>

                <p className="mt-1 text-[10px] text-black/40">
                  Registered tool · Reschedule appointment
                </p>
              </div>

              <span className="text-[9px] font-semibold uppercase tracking-[0.08em] text-emerald-700">
                Done
              </span>
            </div>

            {/* Step 4 */}
            <div className="flex gap-3">
              <div className="flex w-5 justify-center">
                <span className="mt-0.5 h-4 w-4 rounded-full border-[3px] border-[#24463a]/20 bg-white" />
              </div>

              <div className="flex-1">
                <p className="text-[12px] font-medium text-[#20201d]">
                  Verify result
                </p>

                <p className="mt-1 text-[10px] text-black/40">
                  Confirm appointment state after execution
                </p>
              </div>

              <span className="text-[9px] font-semibold uppercase tracking-[0.08em] text-black/35">
                Next
              </span>
            </div>
          </div>
        </div>

        {/* Security footer */}
        <div className="flex items-center justify-between border-t border-black/[0.07] bg-[#faf9f6] px-5 py-3.5">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[#24463a]" />

            <span className="text-[9px] font-semibold uppercase tracking-[0.1em] text-black/45">
              Policy engine enforced
            </span>
          </div>

          <span className="font-mono text-[9px] text-black/30">
            AUDIT · ON
          </span>
        </div>
      </div>

      {/* Small floating security marker */}
      <div className="absolute -bottom-4 -left-4 hidden rounded-lg border border-black/[0.08] bg-white px-3 py-2 shadow-[0_8px_25px_rgba(32,32,29,0.08)] sm:block">
        <p className="text-[9px] font-semibold uppercase tracking-[0.1em] text-black/35">
          Security boundary
        </p>

        <p className="mt-1 text-[10px] text-black/60">
          AI proposes · Code authorizes
        </p>
      </div>
    </div>
  </div>
</section>

        {/* Footer */}
        <footer className="flex flex-col gap-2 border-t border-black/[0.08] pt-5 text-[10px] uppercase tracking-[0.1em] text-black/30 sm:flex-row sm:items-center sm:justify-between">
          <span>Security-first AI operations</span>

          <span>Northstar · Internal Operations</span>
        </footer>
      </div>
    </main>
  );
}