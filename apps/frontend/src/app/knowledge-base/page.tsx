import Link from "next/link";
import type { Route } from "next";
import { EmployeeShell } from "@/components/prototype/employee-shell";
import { FilterBar } from "@/components/prototype/ui";
import {
  hotSops,
  knowledgeCategories
} from "@/lib/prototype-data";

export default function KnowledgeBasePage() {
  return (
    <EmployeeShell
      activeHref="/knowledge-base"
      title="知识库"
      subtitle="支持关键词检索、岗位筛选、SOP 热门内容与最近更新查看。"
      primaryAction="搜索 SOP"
    >
      <section className="rounded-3xl border border-[color:var(--line)] bg-white p-5">
        <label className="block">
          <span className="mb-2 block text-sm text-slate-600">搜索关键词</span>
          <input
            placeholder="例如：异常件、签收、温控、盘点"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-brand-500"
          />
        </label>
      </section>

      <FilterBar title="分类筛选" items={knowledgeCategories} />

      <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-3xl border border-[color:var(--line)] bg-white p-6">
          <h2 className="text-xl font-semibold text-slate-800">热门 SOP</h2>
          <div className="mt-4 space-y-2">
            {hotSops.map((sop, index) => (
              <Link
                key={sop}
                href={`/knowledge-base/KB-10${index + 1}` as Route}
                className="block rounded-xl bg-slate-50 px-3 py-2.5 text-sm text-slate-700 transition hover:bg-slate-100"
              >
                {sop}
              </Link>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-[color:var(--line)] bg-white p-6">
          <h2 className="text-xl font-semibold text-slate-800">最近更新</h2>
          <div className="mt-4 space-y-3">
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="font-medium text-slate-800">到仓异常件闭环处理（v2.1）</p>
              <p className="mt-1 text-sm text-slate-500">更新时间：03-18 · 关联课程：异常件识别与处置</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="font-medium text-slate-800">生鲜温控巡检规范（v1.5）</p>
              <p className="mt-1 text-sm text-slate-500">更新时间：03-17 · 关联课程：仓储安全规范</p>
            </div>
            <div className="rounded-2xl border border-slate-200 p-4">
              <p className="font-medium text-slate-800">签收争议工单处理（v3.0）</p>
              <p className="mt-1 text-sm text-slate-500">更新时间：03-15 · 关联课程：客服协同处理流程</p>
            </div>
          </div>
        </article>
      </section>
    </EmployeeShell>
  );
}
