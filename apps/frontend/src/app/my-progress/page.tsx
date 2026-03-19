import { EmployeeShell } from "@/components/prototype/employee-shell";
import { StatMetricCard } from "@/components/prototype/ui";
import { getMyProgress } from "@/lib/api-server";

export default async function MyProgressPage() {
  const data = await getMyProgress();

  const metrics = [
    {
      label: "累计学习时长",
      value: data ? `${(data.totalLearnSeconds / 3600).toFixed(1)}h` : "--",
      hint: "按章节学习进度累计",
      tone: "info" as const
    },
    {
      label: "必修完成率",
      value: data ? `${data.completionRate}%` : "--",
      hint: data
        ? `${data.completedCourseCount}/${data.requiredCourseCount} 门课程已完成`
        : "待拉取",
      tone: "warning" as const
    },
    {
      label: "考试平均分",
      value: data?.averageExamScore !== null && data ? String(data.averageExamScore) : "--",
      hint: data ? `通过 ${data.passedExamCount}/${data.totalExamCount} 场` : "待拉取",
      tone: "success" as const
    }
  ];

  return (
    <EmployeeShell
      activeHref="/my-progress"
      title="我的进度"
      subtitle="学习与考试进度由后端聚合计算，不再使用本地原型数据。"
      primaryAction="继续学习"
    >
      <section className="grid gap-4 md:grid-cols-3">
        {metrics.map((metric) => (
          <StatMetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <section className="rounded-3xl border border-[color:var(--line)] bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-800">进度说明</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          <li>1. 课程完成率按“必修课程全部章节完成”计算。</li>
          <li>2. 考试统计仅包含已提交的考试记录。</li>
          <li>3. 学习时长由章节进度自动保存累计。</li>
        </ul>
      </section>
    </EmployeeShell>
  );
}
