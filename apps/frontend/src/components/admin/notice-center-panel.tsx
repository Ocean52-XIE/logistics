"use client";

import { useState, type FormEvent } from "react";
import type { AdminNotificationItem, UserProfile } from "@logistics/shared";
import { publishAdminNotification, runAdminReminderJobs } from "@/lib/api";

interface NoticeCenterPanelProps {
  initialNotifications: AdminNotificationItem[];
  users: UserProfile[];
}

export function NoticeCenterPanel({
  initialNotifications,
  users
}: NoticeCenterPanelProps) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [pinned, setPinned] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isRunningReminders, setIsRunningReminders] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const targetUsers = users.filter((user) => user.role !== "admin");

  const onPublish = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isPublishing) {
      return;
    }

    setIsPublishing(true);
    setMessage(null);
    const created = await publishAdminNotification({
      title: title.trim(),
      content: content.trim(),
      pinned,
      userIds: selectedUserIds
    });
    setIsPublishing(false);

    if (!created) {
      setMessage("通知发布失败，请重试。");
      return;
    }

    setNotifications((prev) => [created, ...prev]);
    setTitle("");
    setContent("");
    setPinned(false);
    setSelectedUserIds([]);
    setMessage(`通知 ${created.id} 发布成功。`);
  };

  const onRunReminders = async () => {
    if (isRunningReminders) {
      return;
    }
    setIsRunningReminders(true);
    setMessage(null);
    const result = await runAdminReminderJobs();
    setIsRunningReminders(false);

    if (!result) {
      setMessage("提醒任务执行失败，请稍后重试。");
      return;
    }

    setMessage(
      `提醒任务已执行：新增 ${result.generatedCount} 条（开考 ${result.upcomingExamCount}，逾期 ${result.overdueCourseCount}，补考 ${result.retakeCount}）。`
    );
  };

  return (
    <section className="space-y-5">
      <article className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-semibold text-white">发布通知</h2>
          <button
            data-testid="admin-run-reminders"
            type="button"
            onClick={() => void onRunReminders()}
            disabled={isRunningReminders}
            className="rounded-xl border border-brand-400 px-4 py-2 text-sm font-semibold text-brand-300 hover:bg-brand-500/20 disabled:opacity-60"
          >
            {isRunningReminders ? "执行中..." : "执行提醒任务"}
          </button>
        </div>

        <form className="mt-4 space-y-4" onSubmit={onPublish}>
          <div className="grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs text-slate-400">标题</span>
              <input
                data-testid="admin-notice-title"
                className="w-full rounded-xl border border-white/20 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-brand-500"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
            </label>
            <label className="flex items-center gap-2 pt-6 text-sm text-slate-300">
              <input
                data-testid="admin-notice-pinned"
                type="checkbox"
                checked={pinned}
                onChange={(event) => setPinned(event.target.checked)}
              />
              置顶通知
            </label>
            <label className="block md:col-span-2">
              <span className="mb-1 block text-xs text-slate-400">内容</span>
              <textarea
                data-testid="admin-notice-content"
                rows={3}
                className="w-full rounded-xl border border-white/20 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-brand-500"
                value={content}
                onChange={(event) => setContent(event.target.value)}
                required
              />
            </label>
          </div>

          <div className="rounded-2xl border border-white/10 p-4">
            <p className="text-sm font-medium text-slate-200">
              定向人员（可选，不选则默认发送给员工端全员）
            </p>
            <div className="mt-2 max-h-44 space-y-2 overflow-auto pr-2 text-sm text-slate-300">
              {targetUsers.map((user) => (
                <label key={user.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedUserIds.includes(user.id)}
                    onChange={(event) => {
                      setSelectedUserIds((prev) =>
                        event.target.checked
                          ? [...prev, user.id]
                          : prev.filter((id) => id !== user.id)
                      );
                    }}
                  />
                  <span>
                    {user.name} · {user.organizationName} · {user.role}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <button
            data-testid="admin-notice-publish"
            type="submit"
            disabled={isPublishing}
            className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-60"
          >
            {isPublishing ? "发布中..." : "发布通知"}
          </button>
          {message ? <p className="text-sm text-slate-300">{message}</p> : null}
        </form>
      </article>

      <article className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
        <h3 className="text-xl font-semibold text-white">通知历史</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-sm text-slate-300">
            <thead className="text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="pb-2">标题</th>
                <th className="pb-2">来源</th>
                <th className="pb-2">置顶</th>
                <th className="pb-2">已读/总数</th>
                <th className="pb-2">发布时间</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((item) => (
                <tr key={item.id} className="border-t border-white/10">
                  <td className="py-2">
                    <p className="font-medium text-white">{item.title}</p>
                    <p className="text-xs text-slate-400">{item.id}</p>
                    <p className="mt-1 text-xs text-slate-400">{item.content}</p>
                  </td>
                  <td className="py-2">{item.sourceType ?? "manual"}</td>
                  <td className="py-2">{item.pinned ? "是" : "否"}</td>
                  <td className="py-2">
                    {item.readCount}/{item.totalCount}
                  </td>
                  <td className="py-2">{new Date(item.createdAt).toLocaleString("zh-CN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {notifications.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">暂无通知。</p>
          ) : null}
        </div>
      </article>
    </section>
  );
}
