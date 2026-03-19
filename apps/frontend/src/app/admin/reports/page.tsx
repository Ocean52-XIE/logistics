import { AdminShell } from "@/components/prototype/admin-shell";
import { StatMetricCard } from "@/components/prototype/ui";
import { getAdminReportOverview } from "@/lib/api-server";

export default async function AdminReportsPage() {
  const report = await getAdminReportOverview();

  const metrics = [
    {
      label: "课程完成率",
      value: report ? `${report.completionRate}%` : "--",
      hint: "必修课程完成占比",
      tone: "success" as const
    },
    {
      label: "考试通过率",
      value: report ? `${report.passRate}%` : "--",
      hint: "已提交考试通过占比",
      tone: "warning" as const
    },
    {
      label: "在学人数",
      value: report ? String(report.activeLearners) : "--",
      hint: "有学习/考试行为的员工",
      tone: "info" as const
    }
  ];

  return (
    <AdminShell
      activeHref="/admin/reports"
      title="报表概览"
      subtitle="首版报表先聚焦完成率、通过率与活跃人数等关键指标。"
    >
      <section className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <StatMetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 text-sm text-slate-300">
        <h2 className="text-xl font-semibold text-white">指标口径</h2>
        <ul className="mt-3 space-y-2">
          <li>1. 完成率 = 员工已完成必修课程数 / 员工应完成必修课程数。</li>
          <li>2. 通过率 = 已提交考试中达到及格线的占比。</li>
          <li>3. 在学人数 = 存在学习进度或考试记录的员工数。</li>
        </ul>
      </section>
    </AdminShell>
  );
}
