import type { DashboardTask } from "@logistics/shared";

const statusMap: Record<DashboardTask["status"], string> = {
  todo: "待开始",
  in_progress: "进行中",
  completed: "已完成"
};

export function TaskCard({ task }: { task: DashboardTask }) {
  return (
    <div className="rounded-3xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5">
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-500">
          {task.type.toUpperCase()}
        </span>
        <span className="text-sm text-slate-500">{statusMap[task.status]}</span>
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-800">{task.title}</h3>
      <p className="mt-2 text-sm text-slate-500">截止日期：{task.dueDate}</p>
    </div>
  );
}

