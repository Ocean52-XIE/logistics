import { EmployeeShell } from "@/components/prototype/employee-shell";
import { StatusBadge } from "@/components/prototype/ui";

export default function CertificationsPage() {
  return (
    <EmployeeShell
      activeHref="/certifications"
      title="岗位认证"
      subtitle="展示认证项完成状态、到期提醒和补训建议。"
      primaryAction="查看认证要求"
    >
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <article className="rounded-3xl border border-[color:var(--line)] bg-white p-5">
          <StatusBadge text="已完成" tone="success" />
          <h2 className="mt-3 text-xl font-semibold text-slate-800">入职基础认证</h2>
          <p className="mt-2 text-sm text-slate-600">通过课程学习 + 入职考试，已达标。</p>
        </article>
        <article className="rounded-3xl border border-[color:var(--line)] bg-white p-5">
          <StatusBadge text="进行中" tone="info" />
          <h2 className="mt-3 text-xl font-semibold text-slate-800">分拣岗位认证</h2>
          <p className="mt-2 text-sm text-slate-600">需完成《异常件识别与处置》并通过专项考试。</p>
        </article>
        <article className="rounded-3xl border border-[color:var(--line)] bg-white p-5">
          <StatusBadge text="待开始" tone="warning" />
          <h2 className="mt-3 text-xl font-semibold text-slate-800">安全操作认证</h2>
          <p className="mt-2 text-sm text-slate-600">建议完成《仓储安全规范》后发起认证申请。</p>
        </article>
      </section>
    </EmployeeShell>
  );
}
