import { AdminShell } from "@/components/prototype/admin-shell";
import { StatMetricCard } from "@/components/prototype/ui";
import {
  getAdminReportOverviewWithFilter,
  getAdminWrongAnswerAnalysis
} from "@/lib/api-server";

export default async function AdminReportsPage({
  searchParams
}: {
  searchParams: Promise<{
    organizationName?: string;
    positionName?: string;
  }>;
}) {
  const params = await searchParams;
  const organizationName =
    typeof params.organizationName === "string" &&
    params.organizationName.trim().length > 0
      ? params.organizationName.trim()
      : undefined;
  const positionName =
    typeof params.positionName === "string" && params.positionName.trim().length > 0
      ? params.positionName.trim()
      : undefined;

  const [report, wrongAnswers] = await Promise.all([
    getAdminReportOverviewWithFilter({ organizationName, positionName }),
    getAdminWrongAnswerAnalysis({ organizationName, positionName })
  ]);

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
      hint: "有学习或考试行为的员工",
      tone: "info" as const
    }
  ];

  return (
    <AdminShell
      activeHref="/admin/reports"
      title="报表概览"
      subtitle="支持按组织/岗位筛选结果，并查看知识点失分热点。"
    >
      <article className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
        <h2 className="text-2xl font-semibold text-white">筛选条件</h2>
        <form className="mt-4 grid gap-3 md:grid-cols-3" method="GET">
          <label className="block">
            <span className="mb-1 block text-xs text-slate-400">组织</span>
            <input
              data-testid="admin-report-filter-organization"
              name="organizationName"
              defaultValue={organizationName ?? ""}
              placeholder="如 华东仓"
              className="w-full rounded-xl border border-white/20 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-brand-500"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-slate-400">岗位</span>
            <input
              data-testid="admin-report-filter-position"
              name="positionName"
              defaultValue={positionName ?? ""}
              placeholder="如 分拣员"
              className="w-full rounded-xl border border-white/20 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-brand-500"
            />
          </label>
          <div className="flex items-end gap-2">
            <button
              data-testid="admin-report-filter-submit"
              type="submit"
              className="rounded-xl border border-brand-400 px-4 py-2 text-sm font-semibold text-brand-300 hover:bg-brand-500/20"
            >
              查询
            </button>
            <a
              href="/admin/reports"
              className="rounded-xl border border-white/20 px-4 py-2 text-sm text-slate-300 hover:bg-white/10"
            >
              清空
            </a>
          </div>
        </form>
      </article>

      <section className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <StatMetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <article className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
        <h3 className="text-xl font-semibold text-white">失分分析（Top 10）</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-sm text-slate-300">
            <thead className="text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="pb-2">知识点</th>
                <th className="pb-2">失分次数</th>
                <th className="pb-2">题目总数</th>
                <th className="pb-2">失分率</th>
              </tr>
            </thead>
            <tbody>
              {(wrongAnswers ?? []).map((item) => (
                <tr key={item.knowledgeTag} className="border-t border-white/10">
                  <td className="py-2">{item.knowledgeTag}</td>
                  <td className="py-2">{item.wrongCount}</td>
                  <td className="py-2">{item.totalCount}</td>
                  <td className="py-2">{item.wrongRate}%</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!wrongAnswers || wrongAnswers.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">当前筛选条件下暂无失分数据。</p>
          ) : null}
        </div>
      </article>
    </AdminShell>
  );
}
