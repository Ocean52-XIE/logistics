import Link from "next/link";
import type { Route } from "next";
import { EmployeeShell } from "@/components/prototype/employee-shell";
import { getKnowledgeArticles } from "@/lib/api-server";

export default async function KnowledgeBasePage() {
  const articles = (await getKnowledgeArticles()) ?? [];

  return (
    <EmployeeShell
      activeHref="/knowledge-base"
      title="知识库"
      subtitle="统一查看 SOP 与流程文档，数据由后端实时提供。"
      primaryAction="刷新内容"
    >
      <section className="rounded-3xl border border-[color:var(--line)] bg-white p-6">
        <h2 className="text-2xl font-semibold text-slate-800">最新文档</h2>
        <p className="mt-2 text-sm text-slate-600">
          首版按主链路提供常用 SOP，后续再扩展高级搜索和岗位筛选。
        </p>
        <div className="mt-5 grid gap-3">
          {articles.length === 0 ? (
            <p className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
              暂无知识库内容。
            </p>
          ) : (
            articles.map((article) => (
              <Link
                key={article.id}
                href={`/knowledge-base/${article.id}` as Route}
                className="block rounded-2xl border border-slate-200 px-4 py-3 transition hover:border-brand-200 hover:bg-brand-50/30"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-base font-semibold text-slate-800">{article.title}</p>
                  {article.isHot ? (
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-700">
                      热门
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-slate-600">{article.summary}</p>
                <p className="mt-2 text-xs text-slate-500">
                  {article.category} · 更新于 {new Date(article.updatedAt).toLocaleDateString("zh-CN")}
                </p>
              </Link>
            ))
          )}
        </div>
      </section>
    </EmployeeShell>
  );
}
