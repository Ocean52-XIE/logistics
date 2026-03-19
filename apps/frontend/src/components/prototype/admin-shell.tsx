import Link from "next/link";
import clsx from "clsx";
import type { Route } from "next";
import { adminNavGroups } from "@/lib/prototype-data";
import { LogoutButton } from "./logout-button";

interface AdminShellProps {
  activeHref: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

export function AdminShell({
  activeHref,
  title,
  subtitle,
  children
}: AdminShellProps) {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-5 text-slate-100 md:px-8 md:py-7">
      <div className="mx-auto max-w-[1500px]">
        <header className="rounded-[30px] border border-white/10 bg-gradient-to-r from-slate-900 via-slate-900 to-brand-950 px-6 py-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                Admin Operations Hub
              </p>
              <h1 className="mt-2 text-3xl font-semibold lg:text-4xl">{title}</h1>
              <p className="mt-3 max-w-2xl text-sm text-slate-300 lg:text-base">{subtitle}</p>
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                className="rounded-2xl bg-accent-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-accent-600"
              >
                导出周报
              </button>
              <Link
                href="/dashboard"
                className="rounded-2xl border border-white/20 px-4 py-2.5 text-sm font-medium text-slate-100 transition hover:bg-white/10"
              >
                返回员工端
              </Link>
              <LogoutButton
                className="rounded-2xl border border-rose-300/40 px-4 py-2.5 text-sm font-medium text-rose-100 transition hover:bg-rose-400/20"
                label="退出登录"
              />
            </div>
          </div>
        </header>

        <div className="mt-6 grid gap-6 xl:grid-cols-[280px_1fr]">
          <aside className="rounded-[28px] border border-white/10 bg-slate-900/80 p-4">
            {adminNavGroups.map((group) => (
              <section key={group.label} className="mt-3 first:mt-0">
                <p className="mb-2 px-2 text-xs font-medium uppercase tracking-[0.12em] text-slate-500">
                  {group.label}
                </p>
                <div className="space-y-1">
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href as Route}
                      className={clsx(
                        "block rounded-xl px-3 py-2 text-sm transition",
                        item.href === activeHref
                          ? "bg-brand-600 text-white"
                          : "text-slate-300 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </aside>
          <section className="space-y-5">{children}</section>
        </div>
      </div>
    </main>
  );
}
