import Link from "next/link";
import type { Route } from "next";
import clsx from "clsx";
import type { Metric, StatusTone } from "@/lib/prototype-data";

function toneClass(tone: StatusTone = "default") {
  return {
    default: "bg-slate-100 text-slate-700",
    info: "bg-brand-50 text-brand-700",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-rose-100 text-rose-700"
  }[tone];
}

export function StatusBadge({
  text,
  tone = "default"
}: {
  text: string;
  tone?: StatusTone;
}) {
  return (
    <span
      className={clsx(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        toneClass(tone)
      )}
    >
      {text}
    </span>
  );
}

export function StatMetricCard({ metric }: { metric: Metric }) {
  return (
    <article className="rounded-3xl border border-white/70 bg-white/90 p-5 shadow-panel">
      <p className="text-sm text-slate-500">{metric.label}</p>
      <p className="mt-2 text-3xl font-semibold text-brand-700">{metric.value}</p>
      <div className="mt-3">
        <StatusBadge text={metric.hint} tone={metric.tone ?? "default"} />
      </div>
    </article>
  );
}

export function ProgressCard({
  title,
  detail,
  progress,
  status
}: {
  title: string;
  detail: string;
  progress: number;
  status: string;
}) {
  return (
    <article className="rounded-3xl border border-[color:var(--line)] bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
          <p className="mt-1 text-sm text-slate-500">{detail}</p>
        </div>
        <StatusBadge
          text={status}
          tone={status === "已完成" ? "success" : status === "未开始" ? "warning" : "info"}
        />
      </div>
      <div className="mt-5 h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-teal-500 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className="mt-2 text-right text-xs font-medium text-slate-500">{progress}%</p>
    </article>
  );
}

interface CourseCardData {
  id: string;
  title: string;
  category: string;
  progress: number;
  dueDate: string;
  duration?: string;
  durationMinutes?: number;
  status?: "必修" | "选修";
  requirement?: "required" | "optional";
}

export function CourseCard({ course }: { course: CourseCardData }) {
  const requirementLabel =
    course.status ?? (course.requirement === "required" ? "必修" : "选修");
  const durationLabel =
    course.duration ?? `${course.durationMinutes ?? 0} 分钟`;

  return (
    <article className="rounded-3xl border border-[color:var(--line)] bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <StatusBadge
          text={requirementLabel}
          tone={requirementLabel === "必修" ? "warning" : "default"}
        />
        <p className="text-sm text-slate-500">{course.category}</p>
      </div>
      <h3 className="mt-4 text-xl font-semibold text-slate-800">{course.title}</h3>
      <p className="mt-2 text-sm text-slate-500">预计时长 {durationLabel}</p>
      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-brand-500 to-accent-500"
          style={{ width: `${course.progress}%` }}
        />
      </div>
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="text-slate-500">进度 {course.progress}%</span>
        <span className="font-medium text-brand-700">{course.dueDate}</span>
      </div>
      <div className="mt-4">
        <Link
          href={`/courses/${course.id}` as Route}
          className="inline-flex rounded-xl bg-brand-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-brand-600"
        >
          查看课程
        </Link>
      </div>
    </article>
  );
}

export function FilterBar({
  title,
  items
}: {
  title: string;
  items: string[];
}) {
  return (
    <section className="rounded-3xl border border-[color:var(--line)] bg-white px-5 py-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p className="text-sm font-medium text-slate-600">{title}</p>
        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <button
              key={item}
              type="button"
              className="rounded-full border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-brand-300 hover:text-brand-700"
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export function RoleTag({ role }: { role: string }) {
  return (
    <span className="inline-flex items-center rounded-lg bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
      {role}
    </span>
  );
}

export function DataTable({
  columns,
  rows
}: {
  columns: string[];
  rows: string[][];
}) {
  return (
    <div className="overflow-hidden rounded-3xl border border-[color:var(--line)] bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-slate-500">
            <tr>
              {columns.map((col) => (
                <th key={col} className="px-4 py-3 font-medium">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.join("-")} className="border-t border-slate-100">
                {row.map((cell) => (
                  <td key={cell} className="px-4 py-3 text-slate-700">
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
