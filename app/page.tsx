import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#F7F5F0] text-[#171717]">
      <div className="mx-auto max-w-7xl px-8 py-10">
        <header className="flex items-center justify-between border-b border-[#D8D3C9] pb-6">
          <div>
            <p className="text-sm font-medium tracking-[0.18em] text-[#687078] uppercase">
              OpsPilot
            </p>

            <h1 className="mt-2 text-2xl font-semibold">
              Security-First AI Operations
            </h1>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <span className="h-2 w-2 rounded-full bg-[#24463A]" />
            <span>READY</span>
          </div>
        </header>

        <section className="py-16">
          <p className="text-sm font-medium tracking-wide text-[#687078] uppercase">
            Mission
          </p>

          <h2 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight">
            Handle today&apos;s unresolved customer requests.
          </h2>

          <p className="mt-5 max-w-2xl text-lg leading-8 text-[#687078]">
            Understand. Authorize. Execute. Verify.
          </p>

          <div className="mt-10 flex items-center gap-3">
            <button
              type="button"
              className="rounded-md bg-[#24463A] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#1d3920]"
            >
              Start Mission
            </button>

            <Link
              href="/inbox"
              className="inline-flex rounded-md border border-black/15 bg-white px-5 py-3 text-sm font-medium transition hover:bg-black/5"
            >
              Open Northstar Operations
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}