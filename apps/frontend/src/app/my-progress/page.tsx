import { EmployeeShell } from "@/components/prototype/employee-shell";
import { StatMetricCard } from "@/components/prototype/ui";

const metrics = [
  { label: "累计学习时长", value: "18.5h", hint: "本周 +3.2h", tone: "info" as const },
  { label: "课程完课率", value: "74%", hint: "目标 85%", tone: "warning" as const },
  { label: "考试平均分", value: "86", hint: "最近一次 88", tone: "success" as const },
  { label: "连续学习天数", value: "9 天", hint: "保持中", tone: "success" as const }
];

export default function MyProgressPage() {
  return (
    <EmployeeShell
      activeHref="/my-progress"
      title="我的进度"
      subtitle="查看学习时长、课程完课率、考试成绩和阶段成长趋势。"
      primaryAction="继续学习"
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <StatMetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <article className="rounded-3xl border border-[color:var(--line)] bg-white p-6">
          <h2 className="text-xl font-semibold text-slate-800">学习趋势（近 4 周）</h2>
          <div className="mt-4 h-56 rounded-2xl bg-slate-50 p-4">
            <div className="grid h-full grid-cols-4 items-end gap-3">
              {[48, 60, 72, 86].map((v, idx) => (
                <div key={v} className="flex flex-col items-center gap-2">
                  <div className="w-full rounded-t-lg bg-brand-500/80" style={{ height: `${v}%` }} />
                  <span className="text-xs text-slate-500">W{idx + 1}</span>
                </div>
              ))}
            </div>
          </div>
        </article>
        <article className="rounded-3xl border border-[color:var(--line)] bg-white p-6">
          <h2 className="text-xl font-semibold text-slate-800">近期里程碑</h2>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li className="rounded-xl bg-slate-50 px-3 py-2">03-18 完成课程《仓配链路基础》</li>
            <li className="rounded-xl bg-slate-50 px-3 py-2">03-16 考试《订单履约流程》88 分</li>
            <li className="rounded-xl bg-slate-50 px-3 py-2">03-14 连续学习达成 7 天</li>
          </ul>
        </article>
      </section>
    </EmployeeShell>
  );
}
