"use client";

import { useRouter } from "next/navigation";

interface DataFetchErrorPanelProps {
  retryLabel?: string;
}

export function DataFetchErrorPanel({
  retryLabel = "重试"
}: DataFetchErrorPanelProps) {
  const router = useRouter();

  return (
    <section className="rounded-3xl border border-[color:var(--line)] bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-slate-800">数据加载失败，请稍后重试。</h2>
      <p className="mt-2 text-sm text-slate-600">
        当前页面未返回可用数据，请点击重试重新拉取。
      </p>
      <button
        type="button"
        className="mt-4 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
        onClick={() => router.refresh()}
      >
        {retryLabel}
      </button>
    </section>
  );
}
