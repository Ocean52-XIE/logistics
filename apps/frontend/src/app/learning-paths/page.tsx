import { DataFetchErrorPanel } from "@/components/data-fetch-error-panel";
import { EmployeeShell } from "@/components/prototype/employee-shell";
import { getLearningPaths } from "@/lib/api-server";
import { StatusBadge } from "@/components/prototype/ui";

export default async function LearningPathsPage() {
  const learningPaths = await getLearningPaths();

  if (!learningPaths) {
    return (
      <EmployeeShell
        activeHref="/learning-paths"
        title="学习路径"
        subtitle="统一查看当前培训计划、课程完成进度与周期状态。"
      >
        <DataFetchErrorPanel />
      </EmployeeShell>
    );
  }

  return (
    <EmployeeShell
      activeHref="/learning-paths"
      title="学习路径"
      subtitle="统一查看当前培训计划、课程完成进度与周期状态。"
    >
      <section className="grid gap-4">
        {learningPaths.length === 0 ? (
          <article className="rounded-3xl border border-[color:var(--line)] bg-white p-6 text-sm text-slate-500">
            暂无学习路径，请联系培训管理员分配计划。
          </article>
        ) : (
          learningPaths.map((path) => (
            <article key={path.id} className="rounded-3xl border border-[color:var(--line)] bg-white p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-slate-800">{path.name}</h2>
                  <p className="mt-2 text-sm text-slate-600">
                    周期：{new Date(path.startAt).toLocaleDateString("zh-CN")} -{" "}
                    {new Date(path.endAt).toLocaleDateString("zh-CN")}
                  </p>
                </div>
                <StatusBadge text={statusLabel(path.status)} tone={statusTone(path.status)} />
              </div>
              <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-brand-500 to-teal-500"
                  style={{ width: `${path.completionRate}%` }}
                />
              </div>
              <div className="mt-3 text-sm text-slate-600">
                已完成 {path.completedCourseCount}/{path.courseCount} 门课程（{path.completionRate}%）
              </div>
            </article>
          ))
        )}
      </section>
    </EmployeeShell>
  );
}

function statusLabel(status: "pending" | "active" | "completed") {
  if (status === "active") {
    return "进行中";
  }
  if (status === "completed") {
    return "已结束";
  }
  return "待开始";
}

function statusTone(status: "pending" | "active" | "completed") {
  if (status === "active") {
    return "info" as const;
  }
  if (status === "completed") {
    return "success" as const;
  }
  return "warning" as const;
}
