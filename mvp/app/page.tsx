import Link from "next/link";

export default function Home() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <header className="mb-12">
        <div className="text-sm font-semibold text-brand tracking-wide">LISTORA</div>
        <h1 className="text-4xl font-bold mt-2 leading-tight">
          Etsy listing SEO + AI copy, built for digital download sellers
        </h1>
        <p className="text-lg text-gray-600 mt-4">
          Run a free listing SEO audit in 10 seconds. Then let AI write titles, tags, and
          descriptions that match how Etsy search actually ranks.
        </p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/audit"
            className="bg-brand text-white px-5 py-3 rounded-lg font-semibold hover:bg-brand-dark"
          >
            Free SEO Audit →
          </Link>
          <Link
            href="/generate"
            className="border border-brand text-brand px-5 py-3 rounded-lg font-semibold hover:bg-brand-light"
          >
            AI Generate
          </Link>
        </div>
      </header>

      <section className="grid sm:grid-cols-3 gap-4">
        {[
          ["Free audit", "Score any listing 0–100 on the 5 signals Etsy rewards."],
          ["AI copy", "Generate a full listing tuned to your product niche."],
          ["Digital-first", "Calibrated for planners, prints, templates, SVGs."],
        ].map(([t, d]) => (
          <div key={t} className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
            <h3 className="font-semibold">{t}</h3>
            <p className="text-sm text-gray-600 mt-1">{d}</p>
          </div>
        ))}
      </section>

      <footer className="mt-16 text-sm text-gray-400">
        Listora — indie tool for Etsy sellers. No account needed for the free audit.
      </footer>
    </main>
  );
}
