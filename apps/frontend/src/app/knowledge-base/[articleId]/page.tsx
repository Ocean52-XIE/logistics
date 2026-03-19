import Link from "next/link";
import { EmployeeShell } from "@/components/prototype/employee-shell";
import { StatusBadge } from "@/components/prototype/ui";

export default async function KnowledgeArticlePage({
  params
}: {
  params: Promise<{ articleId: string }>;
}) {
  const { articleId } = await params;

  return (
    <EmployeeShell
      activeHref="/knowledge-base"
      title={`SOP 详情 · ${articleId}`}
      subtitle="支持文章目录、关键词高亮、关联课程跳转。"
      primaryAction="收藏文章"
    >
      <section className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
        <article className="rounded-3xl border border-[color:var(--line)] bg-white p-6">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge text="异常处理" tone="warning" />
            <StatusBadge text="最近更新 03-18" tone="info" />
          </div>
          <h2 className="mt-3 text-3xl font-semibold text-slate-800">到仓异常件闭环处理流程</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            当包裹出现破损、条码模糊或信息不一致时，必须在 5 分钟内完成异常判定并进入闭环处理。
            关键步骤包括登记、拍照、系统标记、流转复核与结果回填。
          </p>
          <div className="mt-5 space-y-3 text-sm leading-7 text-slate-700">
            <p>
              <strong>步骤 1：</strong>收集现场信息，拍摄至少 2 张清晰照片并关联工单。
            </p>
            <p>
              <strong>步骤 2：</strong>按异常类型选择流程模板，进入对应处理分支。
            </p>
            <p>
              <strong>步骤 3：</strong>处理完成后必须回写系统，确保可追溯。
            </p>
          </div>
        </article>

        <div className="space-y-5">
          <article className="rounded-3xl border border-[color:var(--line)] bg-white p-6">
            <h3 className="text-xl font-semibold text-slate-800">文章目录</h3>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li className="rounded-xl bg-slate-50 px-3 py-2">1. 异常件定义</li>
              <li className="rounded-xl bg-slate-50 px-3 py-2">2. 判定标准</li>
              <li className="rounded-xl bg-slate-50 px-3 py-2">3. 处理闭环</li>
              <li className="rounded-xl bg-slate-50 px-3 py-2">4. 常见误区</li>
            </ul>
          </article>
          <article className="rounded-3xl border border-[color:var(--line)] bg-white p-6">
            <h3 className="text-xl font-semibold text-slate-800">关联课程</h3>
            <div className="mt-3 space-y-2 text-sm">
              <Link
                href="/courses/C-1088"
                className="block rounded-xl border border-slate-200 px-3 py-2 text-slate-700 hover:bg-slate-50"
              >
                异常件识别与处置 SOP
              </Link>
              <Link
                href="/courses/C-1024"
                className="block rounded-xl border border-slate-200 px-3 py-2 text-slate-700 hover:bg-slate-50"
              >
                仓配一体全链路基础
              </Link>
            </div>
          </article>
        </div>
      </section>
    </EmployeeShell>
  );
}
