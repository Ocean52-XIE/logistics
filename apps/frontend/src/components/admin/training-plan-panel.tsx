"use client";

import { useState, type FormEvent } from "react";
import type {
  AdminCourseListItem,
  AdminTrainingPlanListItem,
  UserProfile
} from "@logistics/shared";
import { createAdminTrainingPlan } from "@/lib/api";

interface TrainingPlanPanelProps {
  initialPlans: AdminTrainingPlanListItem[];
  users: UserProfile[];
  courses: AdminCourseListItem[];
}

export function TrainingPlanPanel({
  initialPlans,
  users,
  courses
}: TrainingPlanPanelProps) {
  const [plans, setPlans] = useState(initialPlans);
  const [name, setName] = useState("");
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    setMessage(null);
    setIsSubmitting(true);
    const created = await createAdminTrainingPlan({
      name,
      startAt: new Date(`${startAt}T00:00:00+08:00`).toISOString(),
      endAt: new Date(`${endAt}T23:59:59+08:00`).toISOString(),
      courseIds: selectedCourseIds,
      assigneeUserIds: selectedUserIds
    });
    setIsSubmitting(false);

    if (!created) {
      setMessage("培训计划创建失败，请检查输入。");
      return;
    }

    setPlans((prev) => [created, ...prev]);
    setName("");
    setStartAt("");
    setEndAt("");
    setSelectedCourseIds([]);
    setSelectedUserIds([]);
    setMessage(`计划 ${created.name} 创建成功。`);
  };

  return (
    <section className="space-y-5">
      <article className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
        <h2 className="text-2xl font-semibold text-white">发布培训计划</h2>
        <form className="mt-4 space-y-4" onSubmit={onSubmit}>
          <div className="grid gap-3 md:grid-cols-3">
            <label className="block">
              <span className="mb-1 block text-xs text-slate-400">计划名称</span>
              <input
                className="w-full rounded-xl border border-white/20 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-brand-500"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-slate-400">开始日期</span>
              <input
                type="date"
                className="w-full rounded-xl border border-white/20 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-brand-500"
                value={startAt}
                onChange={(event) => setStartAt(event.target.value)}
                required
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs text-slate-400">结束日期</span>
              <input
                type="date"
                className="w-full rounded-xl border border-white/20 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-brand-500"
                value={endAt}
                onChange={(event) => setEndAt(event.target.value)}
                required
              />
            </label>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 p-4">
              <p className="text-sm font-medium text-slate-200">选择课程</p>
              <div className="mt-2 max-h-48 space-y-2 overflow-auto pr-2 text-sm text-slate-300">
                {courses.map((course) => (
                  <label key={course.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={selectedCourseIds.includes(course.id)}
                      onChange={(event) => {
                        setSelectedCourseIds((prev) =>
                          event.target.checked
                            ? [...prev, course.id]
                            : prev.filter((id) => id !== course.id)
                        );
                      }}
                    />
                    <span>
                      {course.title} ({course.status === "published" ? "已发布" : "草稿"})
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 p-4">
              <p className="text-sm font-medium text-slate-200">选择指派人员</p>
              <div className="mt-2 max-h-48 space-y-2 overflow-auto pr-2 text-sm text-slate-300">
                {users.map((user) => (
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
                      {user.name} · {user.organizationName}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-60"
          >
            {isSubmitting ? "发布中..." : "发布培训计划"}
          </button>
          {message ? <p className="text-sm text-slate-300">{message}</p> : null}
        </form>
      </article>

      <article className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
        <h3 className="text-xl font-semibold text-white">计划列表</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm text-slate-300">
            <thead className="text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="pb-2">计划</th>
                <th className="pb-2">周期</th>
                <th className="pb-2">课程数</th>
                <th className="pb-2">指派人数</th>
                <th className="pb-2">完成率</th>
                <th className="pb-2">状态</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((plan) => (
                <tr key={plan.id} className="border-t border-white/10">
                  <td className="py-2">
                    <p className="font-medium text-white">{plan.name}</p>
                    <p className="text-xs text-slate-400">{plan.id}</p>
                  </td>
                  <td className="py-2">
                    {new Date(plan.startAt).toLocaleDateString("zh-CN")} -{" "}
                    {new Date(plan.endAt).toLocaleDateString("zh-CN")}
                  </td>
                  <td className="py-2">{plan.courseCount}</td>
                  <td className="py-2">{plan.assigneeCount}</td>
                  <td className="py-2">{plan.completionRate}%</td>
                  <td className="py-2">
                    {plan.status === "active"
                      ? "进行中"
                      : plan.status === "pending"
                        ? "待开始"
                        : "已结束"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
