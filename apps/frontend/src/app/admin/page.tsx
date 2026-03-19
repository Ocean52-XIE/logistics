import { AdminShell } from "@/components/prototype/admin-shell";
import { StatMetricCard } from "@/components/prototype/ui";
import { adminDashboardMetrics } from "@/lib/prototype-data";

export default function AdminPage() {
  return (
    <AdminShell
      activeHref="/admin"
      title="培训运营驾驶舱"
      subtitle="按内容、计划、执行、分析组织后台信息，提升配置效率与管理可控性。"
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {adminDashboardMetrics.map((metric) => (
          <StatMetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
          <h2 className="text-2xl font-semibold text-white">风险组织排行</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="rounded-xl bg-slate-800 px-4 py-3 text-slate-200">1. 华北仓 · 完成率 69% · 逾期 8 人</div>
            <div className="rounded-xl bg-slate-800 px-4 py-3 text-slate-200">2. 华中仓 · 完成率 71% · 逾期 5 人</div>
            <div className="rounded-xl bg-slate-800 px-4 py-3 text-slate-200">3. 西南仓 · 完成率 73% · 逾期 4 人</div>
          </div>
        </article>
        <article className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
          <h2 className="text-2xl font-semibold text-white">高频失分题目</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="rounded-xl bg-slate-800 px-4 py-3 text-slate-200">异常件拍照留档时效要求（答对率 62%）</div>
            <div className="rounded-xl bg-slate-800 px-4 py-3 text-slate-200">温控巡检执行频次（答对率 66%）</div>
            <div className="rounded-xl bg-slate-800 px-4 py-3 text-slate-200">危险作业防护装备标准（答对率 68%）</div>
          </div>
        </article>
      </section>
    </AdminShell>
  );
}
