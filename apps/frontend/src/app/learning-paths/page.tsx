import { EmployeeShell } from "@/components/prototype/employee-shell";
import { ProgressCard } from "@/components/prototype/ui";
import { learningPaths } from "@/lib/prototype-data";

export default function LearningPathsPage() {
  return (
    <EmployeeShell
      activeHref="/learning-paths"
      title="学习路径"
      subtitle="按照岗位能力要求分阶段学习，减少选择成本，保证训练节奏。"
      primaryAction="继续上次学习"
    >
      <section className="rounded-3xl border border-[color:var(--line)] bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold text-slate-800">当前学习路径</h2>
        <p className="mt-2 text-sm text-slate-600">
          首页优先推荐与你岗位相关的路径，支持自动续学与里程碑提示。
        </p>
        <div className="mt-5 grid gap-4">
          {learningPaths.map((item) => (
            <ProgressCard
              key={item.id}
              title={item.title}
              detail={item.detail}
              progress={item.progress}
              status={item.status}
            />
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <article className="rounded-3xl border border-[color:var(--line)] bg-white p-5">
          <p className="text-sm text-slate-500">阶段 1</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-800">入职基础</h3>
          <p className="mt-2 text-sm text-slate-600">制度认知、流程总览、基础操作规范。</p>
        </article>
        <article className="rounded-3xl border border-[color:var(--line)] bg-white p-5">
          <p className="text-sm text-slate-500">阶段 2</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-800">岗位实操</h3>
          <p className="mt-2 text-sm text-slate-600">SOP 演练、异常处理、协同流程训练。</p>
        </article>
        <article className="rounded-3xl border border-[color:var(--line)] bg-white p-5">
          <p className="text-sm text-slate-500">阶段 3</p>
          <h3 className="mt-2 text-lg font-semibold text-slate-800">考核认证</h3>
          <p className="mt-2 text-sm text-slate-600">在线考试、错题复盘、岗位认证达标。</p>
        </article>
      </section>
    </EmployeeShell>
  );
}
