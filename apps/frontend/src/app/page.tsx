import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flow-bg min-h-screen px-6 py-10 md:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <section className="rounded-[36px] border border-[color:var(--line)] bg-white/90 p-8 shadow-panel md:p-10">
          <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Logistics Training Platform</p>
          <h1 className="mt-4 text-4xl font-semibold text-brand-700 md:text-5xl">MVP 运行入口</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-600 md:text-lg">
            当前版本已收口到“登录 -&gt; 学习 -&gt; 考试 -&gt; 管理查看”主链路，并优先接入真实后端数据。
          </p>
        </section>

        <section className="grid gap-5 md:grid-cols-3">
          <Link
            href="/dashboard"
            className="rounded-3xl border border-[color:var(--line)] bg-white p-6 transition hover:-translate-y-0.5 hover:shadow-panel"
          >
            <p className="text-sm text-slate-500">Employee</p>
            <h2 className="mt-3 text-2xl font-semibold text-slate-800">员工学习端</h2>
            <p className="mt-3 text-sm text-slate-600">覆盖首页、课程、考试与结果查看。</p>
          </Link>
          <Link
            href="/admin"
            className="rounded-3xl border border-slate-700 bg-slate-900 p-6 text-white transition hover:-translate-y-0.5"
          >
            <p className="text-sm text-slate-400">Admin</p>
            <h2 className="mt-3 text-2xl font-semibold">管理后台端</h2>
            <p className="mt-3 text-sm text-slate-300">支持课程管理、培训计划发布与报表概览。</p>
          </Link>
          <Link
            href="/login"
            className="rounded-3xl border border-[color:var(--line)] bg-gradient-to-br from-brand-500 to-brand-700 p-6 text-white transition hover:-translate-y-0.5"
          >
            <p className="text-sm text-white/70">Auth</p>
            <h2 className="mt-3 text-2xl font-semibold">登录页</h2>
            <p className="mt-3 text-sm text-white/80">基于后端账号密码鉴权并自动写入登录态。</p>
          </Link>
        </section>
      </div>
    </main>
  );
}
