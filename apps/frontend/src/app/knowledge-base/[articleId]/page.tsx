import Link from "next/link";
import { notFound } from "next/navigation";
import { EmployeeShell } from "@/components/prototype/employee-shell";
import { StatusBadge } from "@/components/prototype/ui";
import { getKnowledgeArticleDetail } from "@/lib/api-server";

export default async function KnowledgeArticlePage({
  params
}: {
  params: Promise<{ articleId: string }>;
}) {
  const { articleId } = await params;
  const article = await getKnowledgeArticleDetail(articleId);

  if (!article) {
    notFound();
  }

  return (
    <EmployeeShell
      activeHref="/knowledge-base"
      title={`SOP 详情 · ${article.title}`}
      subtitle="内容由后端知识库实时返回，支持关联课程查看。"
      primaryAction="返回列表"
    >
      <section className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
        <article className="rounded-3xl border border-[color:var(--line)] bg-white p-6">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge text={article.category} tone="warning" />
            {article.isHot ? <StatusBadge text="热门" tone="info" /> : null}
          </div>
          <h2 className="mt-3 text-3xl font-semibold text-slate-800">{article.title}</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">{article.summary}</p>
          <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm leading-7 text-slate-700">
            {article.content}
          </div>
          {article.tags.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
        </article>

        <div className="space-y-5">
          <article className="rounded-3xl border border-[color:var(--line)] bg-white p-6">
            <h3 className="text-xl font-semibold text-slate-800">关联课程</h3>
            <div className="mt-3 space-y-2 text-sm">
              {article.relatedCourseIds.length === 0 ? (
                <p className="rounded-xl bg-slate-50 px-3 py-2 text-slate-500">暂无关联课程</p>
              ) : (
                article.relatedCourseIds.map((courseId) => (
                  <Link
                    key={courseId}
                    href={`/courses/${courseId}`}
                    className="block rounded-xl border border-slate-200 px-3 py-2 text-slate-700 hover:bg-slate-50"
                  >
                    {courseId}
                  </Link>
                ))
              )}
            </div>
          </article>
          <article className="rounded-3xl border border-[color:var(--line)] bg-white p-6">
            <h3 className="text-xl font-semibold text-slate-800">更新时间</h3>
            <p className="mt-2 text-sm text-slate-600">
              {new Date(article.updatedAt).toLocaleString("zh-CN")}
            </p>
          </article>
        </div>
      </section>
    </EmployeeShell>
  );
}
