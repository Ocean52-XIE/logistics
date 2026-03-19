import { EmployeeShell } from "@/components/prototype/employee-shell";
import { DataFetchErrorPanel } from "@/components/data-fetch-error-panel";
import { NotificationListPanel } from "@/components/notifications/notification-list-panel";
import { getNotifications } from "@/lib/api-server";

export default async function NotificationsPage() {
  const notifications = await getNotifications();

  if (!notifications) {
    return (
      <EmployeeShell
        activeHref="/notifications"
        title="通知中心"
        subtitle="通知数据由后端下发，支持置顶与未读状态。"
        primaryAction="刷新通知"
      >
        <DataFetchErrorPanel />
      </EmployeeShell>
    );
  }

  return (
    <EmployeeShell
      activeHref="/notifications"
      title="通知中心"
      subtitle="通知数据由后端下发，支持置顶与未读状态。"
      primaryAction="刷新通知"
    >
      <NotificationListPanel initialNotifications={notifications} />
    </EmployeeShell>
  );
}
