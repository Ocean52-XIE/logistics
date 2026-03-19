import { EmployeeShell } from "@/components/prototype/employee-shell";
import { StatusBadge } from "@/components/prototype/ui";
import { notifications } from "@/lib/prototype-data";

export default function NotificationsPage() {
  return (
    <EmployeeShell
      activeHref="/notifications"
      title="通知中心"
      subtitle="支持重要通知置顶、已读状态和考试提醒聚合。"
      primaryAction="全部标记已读"
    >
      <section className="grid gap-4">
        {notifications.map((notice) => (
          <article key={notice.id} className="rounded-3xl border border-[color:var(--line)] bg-white p-6">
            <div className="flex flex-wrap items-center gap-2">
              {notice.pinned ? <StatusBadge text="置顶" tone="warning" /> : null}
              {notice.unread ? <StatusBadge text="未读" tone="info" /> : <StatusBadge text="已读" />}
            </div>
            <h2 className="mt-3 text-xl font-semibold text-slate-800">{notice.title}</h2>
            <p className="mt-2 text-sm leading-7 text-slate-600">{notice.content}</p>
            <p className="mt-3 text-xs text-slate-500">{notice.time}</p>
          </article>
        ))}
      </section>
    </EmployeeShell>
  );
}
