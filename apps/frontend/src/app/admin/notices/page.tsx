import { NoticeCenterPanel } from "@/components/admin/notice-center-panel";
import { AdminShell } from "@/components/prototype/admin-shell";
import { getAdminNotifications, getAdminUsers } from "@/lib/api-server";

export default async function AdminNoticesPage() {
  const [notifications, users] = await Promise.all([
    getAdminNotifications(),
    getAdminUsers()
  ]);

  return (
    <AdminShell
      activeHref="/admin/notices"
      title="通知中心"
      subtitle="支持手动发布、定向触达与提醒任务执行，统一管理考试与学习通知。"
    >
      <NoticeCenterPanel
        initialNotifications={notifications ?? []}
        users={users ?? []}
      />
    </AdminShell>
  );
}
