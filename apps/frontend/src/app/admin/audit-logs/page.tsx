import { AdminShell } from "@/components/prototype/admin-shell";
import { getAdminAuditLogs } from "@/lib/api-server";

export default async function AdminAuditLogsPage({
  searchParams
}: {
  searchParams: Promise<{
    action?: string;
    entityType?: string;
  }>;
}) {
  const params = await searchParams;
  const action =
    typeof params.action === "string" && params.action.trim().length > 0
      ? params.action.trim()
      : undefined;
  const entityType =
    typeof params.entityType === "string" && params.entityType.trim().length > 0
      ? params.entityType.trim()
      : undefined;
  const logs = (await getAdminAuditLogs({ action, entityType })) ?? [];

  return (
    <AdminShell
      activeHref="/admin/audit-logs"
      title="审计日志"
      subtitle="记录关键管理动作，支持按动作和实体类型筛选查询。"
    >
      <article className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
        <h2 className="text-2xl font-semibold text-white">筛选条件</h2>
        <form className="mt-4 grid gap-3 md:grid-cols-3" method="GET">
          <label className="block">
            <span className="mb-1 block text-xs text-slate-400">动作</span>
            <input
              data-testid="admin-audit-filter-action"
              name="action"
              defaultValue={action ?? ""}
              placeholder="如 exam.create"
              className="w-full rounded-xl border border-white/20 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-brand-500"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-slate-400">实体类型</span>
            <input
              data-testid="admin-audit-filter-entity-type"
              name="entityType"
              defaultValue={entityType ?? ""}
              placeholder="如 exam / notification"
              className="w-full rounded-xl border border-white/20 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-brand-500"
            />
          </label>
          <div className="flex items-end">
            <button
              data-testid="admin-audit-filter-submit"
              type="submit"
              className="rounded-xl border border-brand-400 px-4 py-2 text-sm font-semibold text-brand-300 hover:bg-brand-500/20"
            >
              查询
            </button>
          </div>
        </form>
      </article>

      <article className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
        <h3 className="text-xl font-semibold text-white">日志列表</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm text-slate-300">
            <thead className="text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="pb-2">时间</th>
                <th className="pb-2">动作</th>
                <th className="pb-2">实体</th>
                <th className="pb-2">实体 ID</th>
                <th className="pb-2">操作者</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t border-white/10">
                  <td className="py-2">{new Date(log.createdAt).toLocaleString("zh-CN")}</td>
                  <td className="py-2">{log.action}</td>
                  <td className="py-2">{log.entityType}</td>
                  <td className="py-2">{log.entityId}</td>
                  <td className="py-2">
                    {log.actorName ?? "系统"} {log.actorUserId ? `(${log.actorUserId})` : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {logs.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">当前条件下暂无日志。</p>
          ) : null}
        </div>
      </article>
    </AdminShell>
  );
}
