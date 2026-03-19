import Link from "next/link";
import { AdminShell } from "@/components/prototype/admin-shell";
import { StatMetricCard } from "@/components/prototype/ui";
import { getAdminReportOverview } from "@/lib/api-server";

export default async function AdminPage() {
  const report = await getAdminReportOverview();

  const metrics = [
    {
      label: "在册员工",
      value: report ? String(report.totalUsers) : "--",
      hint: "可参与培训人数",
      tone: "default" as const
    },
    {
      label: "在学人数",
      value: report ? String(report.activeLearners) : "--",
      hint: "有学习或考试记录",
      tone: "info" as const
    },
    {
      label: "课程完成率",
      value: report ? `${report.completionRate}%` : "--",
      hint: "必修课程完成情况",
      tone: "success" as const
    },
    {
      label: "首考通过率",
      value: report ? `${report.passRate}%` : "--",
      hint: "已提交考试通过占比",
      tone: "warning" as const
    },
    {
      label: "已发布课程",
      value: report ? String(report.publishedCourses) : "--",
      hint: "当前对员工可见课程",
      tone: "default" as const
    },
    {
      label: "进行中计划",
      value: report ? String(report.activePlans) : "--",
      hint: "当前生效培训计划",
      tone: "info" as const
    }
  ];

  return (
    <AdminShell
      activeHref="/admin"
      title="培训运营驾驶舱"
      subtitle="管理端已切换到真实报表数据，聚焦课程发布、计划指派与效果查看。"
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {metrics.map((metric) => (
          <StatMetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <Link
          href="/admin/courses"
          className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 transition hover:border-brand-500/40"
        >
          <h2 className="text-xl font-semibold text-white">课程管理</h2>
          <p className="mt-2 text-sm text-slate-300">创建课程、查看状态、发布上线。</p>
        </Link>
        <Link
          href="/admin/training-plans"
          className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 transition hover:border-brand-500/40"
        >
          <h2 className="text-xl font-semibold text-white">培训计划</h2>
          <p className="mt-2 text-sm text-slate-300">按员工批量指派课程并跟踪完成率。</p>
        </Link>
        <Link
          href="/admin/reports"
          className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 transition hover:border-brand-500/40"
        >
          <h2 className="text-xl font-semibold text-white">报表概览</h2>
          <p className="mt-2 text-sm text-slate-300">查看课程完成率、考试通过率等核心指标。</p>
        </Link>
        <Link
          href="/admin/question-bank"
          className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 transition hover:border-brand-500/40"
        >
          <h2 className="text-xl font-semibold text-white">题库管理</h2>
          <p className="mt-2 text-sm text-slate-300">维护题型、知识点和难度，支撑随机组卷。</p>
        </Link>
        <Link
          href="/admin/exams"
          className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 transition hover:border-brand-500/40"
        >
          <h2 className="text-xl font-semibold text-white">组卷与补考</h2>
          <p className="mt-2 text-sm text-slate-300">发布考试、定向指派，并发起补考任务。</p>
        </Link>
        <Link
          href="/admin/notices"
          className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 transition hover:border-brand-500/40"
        >
          <h2 className="text-xl font-semibold text-white">通知中心</h2>
          <p className="mt-2 text-sm text-slate-300">发布通知并执行开考/逾期/补考提醒任务。</p>
        </Link>
        <Link
          href="/admin/audit-logs"
          className="rounded-3xl border border-white/10 bg-slate-900/80 p-6 transition hover:border-brand-500/40"
        >
          <h2 className="text-xl font-semibold text-white">审计日志</h2>
          <p className="mt-2 text-sm text-slate-300">追踪关键管理动作，支持筛选查询。</p>
        </Link>
      </section>
    </AdminShell>
  );
}
