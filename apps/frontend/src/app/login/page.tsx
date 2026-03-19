import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="flow-bg flex min-h-screen items-center justify-center px-6 py-10">
      <div className="grid w-full max-w-5xl gap-6 rounded-[34px] border border-[color:var(--line)] bg-white/95 p-6 shadow-panel md:grid-cols-[1.1fr_0.9fr] md:p-8">
        <section className="rounded-3xl bg-gradient-to-br from-brand-600 to-brand-500 p-8 text-white">
          <p className="text-sm uppercase tracking-[0.24em] text-white/70">Employee Login</p>
          <h1 className="mt-3 text-4xl font-semibold">欢迎回到培训中枢</h1>
          <p className="mt-4 max-w-md leading-7 text-white/85">
            继续你的学习路径，系统会自动恢复上次学习进度，并同步考试与通知提醒。
          </p>
          <div className="mt-7 space-y-2 text-sm text-white/85">
            <p>1. 一键继续上次学习内容</p>
            <p>2. 首页首屏展示今日唯一主任务</p>
            <p>3. 考试临近自动风险提醒</p>
          </div>
        </section>

        <section className="rounded-3xl border border-[color:var(--line)] bg-white p-6">
          <h2 className="text-2xl font-semibold text-slate-800">账号登录</h2>
          <p className="mt-2 text-sm text-slate-500">原型阶段仅演示交互，不校验真实账号。</p>

          <form className="mt-6 space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm text-slate-600">工号 / 手机号</span>
              <input
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-brand-500"
                placeholder="例如 EMP-10029 / 138****6688"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-600">密码</span>
              <input
                type="password"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-brand-500"
                placeholder="请输入密码"
              />
            </label>
            <button
              type="button"
              className="w-full rounded-xl bg-brand-500 px-4 py-3 font-semibold text-white transition hover:bg-brand-600"
            >
              登录平台
            </button>
          </form>

          <div className="mt-5 flex gap-3 text-sm">
            <Link className="font-medium text-brand-600 hover:text-brand-700" href="/dashboard">
              员工端快捷体验
            </Link>
            <Link className="font-medium text-brand-600 hover:text-brand-700" href="/admin">
              管理端快捷体验
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
