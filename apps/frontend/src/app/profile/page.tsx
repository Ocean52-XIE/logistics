import { EmployeeShell } from "@/components/prototype/employee-shell";
import { RoleTag } from "@/components/prototype/ui";

export default function ProfilePage() {
  return (
    <EmployeeShell
      activeHref="/profile"
      title="个人中心"
      subtitle="查看个人信息、岗位标签、学习偏好和通知设置。"
      primaryAction="保存设置"
    >
      <section className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <article className="rounded-3xl border border-[color:var(--line)] bg-white p-6">
          <div className="h-20 w-20 rounded-full bg-brand-100" />
          <h2 className="mt-4 text-2xl font-semibold text-slate-800">李晨</h2>
          <p className="mt-1 text-sm text-slate-500">工号 EMP-10029 · 华东仓</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <RoleTag role="分拣员" />
            <RoleTag role="新员工" />
          </div>
        </article>
        <article className="rounded-3xl border border-[color:var(--line)] bg-white p-6">
          <h3 className="text-xl font-semibold text-slate-800">学习偏好设置</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-sm text-slate-600">通知方式</span>
              <select className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none">
                <option>站内 + 短信</option>
                <option>仅站内</option>
                <option>仅短信</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-600">学习提醒时间</span>
              <select className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none">
                <option>每天 19:00</option>
                <option>每天 20:00</option>
                <option>每天 21:00</option>
              </select>
            </label>
          </div>
          <label className="mt-4 block">
            <span className="mb-2 block text-sm text-slate-600">备注</span>
            <textarea
              rows={4}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none"
              defaultValue="希望优先推荐分拣岗位相关课程和实操内容。"
            />
          </label>
        </article>
      </section>
    </EmployeeShell>
  );
}
