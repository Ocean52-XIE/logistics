interface ComingSoonPanelProps {
  title: string;
  description: string;
}

export function ComingSoonPanel({ title, description }: ComingSoonPanelProps) {
  return (
    <section className="rounded-3xl border border-[color:var(--line)] bg-white p-6 shadow-sm">
      <p className="text-xs uppercase tracking-[0.16em] text-slate-400">MVP Scope</p>
      <h2 className="mt-2 text-2xl font-semibold text-slate-800">{title}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">{description}</p>
      <p className="mt-4 inline-flex rounded-full bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-700">
        即将上线
      </p>
    </section>
  );
}
