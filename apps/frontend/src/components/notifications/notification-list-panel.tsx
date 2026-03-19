"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { UserNotificationItem } from "@logistics/shared";
import { markAllNotificationsRead, markNotificationRead } from "@/lib/api";
import { StatusBadge } from "@/components/prototype/ui";

interface NotificationListPanelProps {
  initialNotifications: UserNotificationItem[];
}

export function NotificationListPanel({
  initialNotifications
}: NotificationListPanelProps) {
  const router = useRouter();
  const [notifications, setNotifications] = useState(initialNotifications);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const unreadCount = notifications.filter((item) => item.unread).length;

  const onMarkRead = async (notificationId: string) => {
    if (isSubmitting) {
      return;
    }

    setMessage(null);
    setIsSubmitting(true);
    const response = await markNotificationRead(notificationId);
    setIsSubmitting(false);

    if (!response) {
      setMessage("标记已读失败，请稍后重试。");
      return;
    }

    setNotifications((prev) =>
      prev.map((item) =>
        item.id === notificationId
          ? {
              ...item,
              unread: false
            }
          : item
      )
    );
    setMessage("已标记为已读。");
    router.refresh();
  };

  const onMarkAllRead = async () => {
    if (isSubmitting || unreadCount === 0) {
      return;
    }

    setMessage(null);
    setIsSubmitting(true);
    const response = await markAllNotificationsRead();
    setIsSubmitting(false);

    if (!response) {
      setMessage("全部已读操作失败，请稍后重试。");
      return;
    }

    setNotifications((prev) =>
      prev.map((item) => ({
        ...item,
        unread: false
      }))
    );
    setMessage(`已更新 ${response.updatedCount} 条通知。`);
    router.refresh();
  };

  return (
    <section className="space-y-4">
      <article className="rounded-3xl border border-[color:var(--line)] bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">通知列表</h2>
            <p className="mt-2 text-sm text-slate-600">当前未读 {unreadCount} 条</p>
          </div>
          <button
            data-testid="notification-mark-all-read"
            type="button"
            className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-60"
            disabled={isSubmitting || unreadCount === 0}
            onClick={() => void onMarkAllRead()}
          >
            全部标记已读
          </button>
        </div>
        {message ? <p className="mt-3 text-sm text-slate-600">{message}</p> : null}
      </article>

      {notifications.length === 0 ? (
        <article className="rounded-3xl border border-[color:var(--line)] bg-white p-6">
          <p className="text-sm text-slate-500">暂无通知。</p>
        </article>
      ) : (
        notifications.map((notice) => (
          <article
            key={notice.id}
            className="rounded-3xl border border-[color:var(--line)] bg-white p-6"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                {notice.pinned ? <StatusBadge text="置顶" tone="warning" /> : null}
                {notice.unread ? (
                  <span data-testid={`notification-status-${notice.id}`}>
                    <StatusBadge text="未读" tone="info" />
                  </span>
                ) : (
                  <span data-testid={`notification-status-${notice.id}`}>
                    <StatusBadge text="已读" />
                  </span>
                )}
              </div>
              {notice.unread ? (
                <button
                  data-testid={`notification-mark-read-${notice.id}`}
                  type="button"
                  className="rounded-xl border border-brand-200 px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-50 disabled:opacity-60"
                  disabled={isSubmitting}
                  onClick={() => void onMarkRead(notice.id)}
                >
                  标记已读
                </button>
              ) : null}
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
  );
}
