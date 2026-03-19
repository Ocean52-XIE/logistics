import Link from "next/link";
import clsx from "clsx";
import type { Route } from "next";
import { employeeNav } from "@/lib/prototype-data";

interface EmployeeShellProps {
  activeHref: string;
  title: string;
  subtitle: string;
  primaryAction?: string;
  children: React.ReactNode;
}

export function EmployeeShell({
  activeHref,
  title,
  subtitle,
  primaryAction,
  children
}: EmployeeShellProps) {
  return (
    <main className="flow-bg min-h-screen px-4 py-5 md:px-8 md:py-7">
      <div className="mx-auto max-w-[1400px]">
        <header className="rounded-[32px] border border-[color:var(--line)] bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-6 text-white shadow-panel">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-white/70">Employee Learning Workspace</p>
              <h1 className="mt-2 text-3xl font-semibold lg:text-4xl">{title}</h1>
              <p className="mt-3 max-w-2xl text-sm text-white/85 lg:text-base">{subtitle}</p>
            </div>
            <div className="flex items-center gap-3">
              {primaryAction ? (
                <button
                  type="button"
                  className="rounded-2xl bg-accent-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-600"
                >
                  {primaryAction}
                </button>
              ) : null}
              <Link
                href="/login"
                className="rounded-2xl border border-white/30 px-4 py-2.5 text-sm font-medium text-white/95 transition hover:bg-white/10"
              >
                切换账号
              </Link>
            </div>
          </div>
        </header>

        <div className="mt-6 grid gap-6 xl:grid-cols-[250px_1fr]">
          <aside className="rounded-[28px] border border-[color:var(--line)] bg-white/90 p-4 shadow-sm">
            <nav className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-1">
              {employeeNav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href as Route}
                  className={clsx(
                    "rounded-xl px-3 py-2.5 text-sm font-medium transition",
                    item.href === activeHref
                      ? "bg-brand-500 text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-50 hover:text-brand-700"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="mt-5 rounded-2xl bg-[color:var(--surface-muted)] p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-700">今日目标</p>
              <p className="mt-2">完成 1 门必修课 + 1 场随堂测验，保持学习连续性。</p>
            </div>
          </aside>

          <section className="space-y-5">{children}</section>
        </div>
      </div>
    </main>
  );
}
