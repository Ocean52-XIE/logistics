import { EmployeeShell } from "@/components/prototype/employee-shell";
import { StatusBadge } from "@/components/prototype/ui";
import { getNotifications } from "@/lib/api-server";

export default async function NotificationsPage() {
  const notifications = (await getNotifications()) ?? [];

  return (
    <EmployeeShell
      activeHref="/notifications"
      title="通知中心"
      subtitle="通知数据由后端下发，支持置顶与未读状态。"
      primaryAction="刷新通知"
    >
      <section className="grid gap-4">
        {notifications.length === 0 ? (
          <article className="rounded-3xl border border-[color:var(--line)] bg-white p-6">
            <p className="text-sm text-slate-500">暂无通知。</p>
          </article>
        ) : (
          notifications.map((notice) => (
            <article key={notice.id} className="rounded-3xl border border-[color:var(--line)] bg-white p-6">
              <div className="flex flex-wrap items-center gap-2">
                {notice.pinned ? <StatusBadge text="置顶" tone="warning" /> : null}
                {notice.unread ? (
                  <StatusBadge text="未读" tone="info" />
                ) : (
                  <StatusBadge text="已读" />
                )}
              </div>
              <h2 className="mt-3 text-xl font-semibold text-slate-800">{notice.title}</h2>
              <p className="mt-2 text-sm leading-7 text-slate-600">{notice.content}</p>
              <p className="mt-3 text-xs text-slate-500">
                {new Date(notice.createdAt).toLocaleString("zh-CN")}
              </p>
            </article>
          ))
        )}
      </section>
    </EmployeeShell>
  );
}
