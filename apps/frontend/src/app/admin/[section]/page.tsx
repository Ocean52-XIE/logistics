import { notFound } from "next/navigation";
import { AdminShell } from "@/components/prototype/admin-shell";
import { DataTable, FilterBar } from "@/components/prototype/ui";
import { adminSections } from "@/lib/prototype-data";

export default async function AdminSectionPage({
  params
}: {
  params: Promise<{ section: string }>;
}) {
  const { section: sectionKey } = await params;
  const section = adminSections[sectionKey];

  if (!section) {
    notFound();
  }

  return (
    <AdminShell
      activeHref={`/admin/${sectionKey}`}
      title={section.title}
      subtitle={section.subtitle}
    >
      <FilterBar title="筛选项" items={section.filters} />

      <section className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
        <div className="flex flex-wrap gap-2">
          {section.actions.map((action) => (
            <button
              key={action}
              type="button"
              className="rounded-xl bg-slate-800 px-3 py-2 text-sm text-slate-100 transition hover:bg-slate-700"
            >
              {action}
            </button>
          ))}
        </div>
      </section>

      {sectionKey === "courses" ? (
        <section className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
            <h2 className="text-xl font-semibold text-white">课程目录（左侧）</h2>
            <div className="mt-4 space-y-2 text-sm text-slate-300">
              <div className="rounded-xl bg-slate-800 px-3 py-2">1. 课程封面与简介</div>
              <div className="rounded-xl bg-slate-800 px-3 py-2">2. 章节目录（支持拖拽排序）</div>
              <div className="rounded-xl bg-slate-800 px-3 py-2">3. 完成规则配置</div>
              <div className="rounded-xl bg-slate-800 px-3 py-2">4. 绑定题库与发布预览</div>
            </div>
          </article>
          <article className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
            <h2 className="text-xl font-semibold text-white">编辑区（右侧）</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">
              原型采用“左侧目录 + 右侧编辑区”布局，支持创建章节、配置内容类型、拖拽排序、
              设置必修/选修、绑定题库与预览发布。
            </p>
          </article>
        </section>
      ) : null}

      <DataTable columns={section.tableColumns} rows={section.tableRows} />
    </AdminShell>
  );
}
