"use client";
import Link from "next/link";

export default function PersonaGrid({ personas }: { personas: any[] }) {
  return (
    <section>
      <h2 className="text-xl font-bold mb-4">🤖 AI-персоны</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {personas.map((p) => (
          <Link
            key={p.id}
            href={`/personas/${p.id}`}
            className="flex flex-col items-center p-4 rounded-[16px] border border-[var(--border)] bg-[var(--surface)] hover:scale-[1.03] transition-transform cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--accent2)] flex items-center justify-center text-white text-2xl shadow-inner">
              👤
            </div>
            <span className="mt-2 text-sm font-medium text-center">{p.name}</span>
            {p.isVip && <span className="text-[10px] text-amber-500 font-semibold mt-0.5">⭐ Premium</span>}
          </Link>
        ))}
      </div>
    </section>
  );
}