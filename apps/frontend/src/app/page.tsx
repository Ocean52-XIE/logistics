import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flow-bg min-h-screen px-6 py-10 md:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-[36px] border border-[color:var(--line)] bg-white/90 p-8 shadow-panel md:p-10">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Logistics Training Platform</p>
          <h1 className="mt-4 text-4xl font-semibold text-brand-700 md:text-5xl">前端界面原型入口</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 md:text-lg">
            已按设计文档完成员工学习端与管理后台端的原型页面。当前为纯前端 mock 数据版本，不依赖后端接口。
          </p>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          <Link
            href="/dashboard"
            className="rounded-3xl border border-[color:var(--line)] bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-panel"
          >
            <p className="text-sm text-slate-500">Employee</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-800">员工学习端</h2>
            <p className="mt-3 text-sm text-slate-600">覆盖首页、课程、考试、知识库、认证、进度与通知。</p>
          </Link>
          <Link
            href="/admin"
            className="rounded-3xl border border-slate-700 bg-slate-900 p-6 text-white transition hover:-translate-y-0.5"
          >
            <p className="text-sm text-slate-400">Admin</p>
            <h2 className="mt-3 text-2xl font-semibold">管理后台端</h2>
            <p className="mt-3 text-sm text-slate-300">按内容、计划、执行、分析分组的运营驾驶舱原型。</p>
          </Link>
          <Link
            href="/login"
            className="rounded-3xl border border-[color:var(--line)] bg-gradient-to-br from-brand-500 to-brand-700 p-6 text-white transition hover:-translate-y-0.5"
          >
            <p className="text-sm text-white/70">Auth</p>
            <h2 className="mt-3 text-2xl font-semibold">登录页原型</h2>
            <p className="mt-3 text-sm text-white/80">含账号密码、短信登录入口和角色快捷体验入口。</p>
          </Link>
        </section>
      </div>
    </main>
  );
}
