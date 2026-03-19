"use client";

import { useMemo, useState, type FormEvent } from "react";
import type { AdminCourseListItem } from "@logistics/shared";
import { createAdminCourse, publishAdminCourse } from "@/lib/api";

interface CourseManagementPanelProps {
  initialCourses: AdminCourseListItem[];
}

export function CourseManagementPanel({ initialCourses }: CourseManagementPanelProps) {
  const [courses, setCourses] = useState(initialCourses);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("岗位核心");
  const [durationMinutes, setDurationMinutes] = useState("60");
  const [requirement, setRequirement] = useState<"required" | "optional">("required");
  const [dueDate, setDueDate] = useState("");
  const [description, setDescription] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publishingCourseId, setPublishingCourseId] = useState<string | null>(null);

  const sortedCourses = useMemo(() => {
    return [...courses].sort((a, b) => {
      if (a.status === b.status) {
        return b.id.localeCompare(a.id);
      }
      return a.status === "draft" ? -1 : 1;
    });
  }, [courses]);

  const onCreateCourse = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) {
      return;
    }

    setMessage(null);
    setIsSubmitting(true);
    const created = await createAdminCourse({
      title,
      category,
      durationMinutes: Number(durationMinutes),
      requirement,
      dueDate,
      description
    });
    setIsSubmitting(false);

    if (!created) {
      setMessage("课程创建失败，请检查输入或网络。");
      return;
    }

    setCourses((prev) => [created, ...prev]);
    setTitle("");
    setDescription("");
    setMessage(`课程 ${created.id} 创建成功，当前状态为草稿。`);
  };

  const onPublish = async (courseId: string) => {
    if (publishingCourseId) {
      return;
    }
    setPublishingCourseId(courseId);
    const result = await publishAdminCourse(courseId);
    setPublishingCourseId(null);

    if (!result) {
      setMessage("发布失败，请重试。");
      return;
    }

    setCourses((prev) =>
      prev.map((course) =>
        course.id === courseId
          ? {
              ...course,
              status: "published",
              publishedAt: result.publishedAt
            }
          : course
      )
    );
    setMessage(`课程 ${courseId} 已发布。`);
  };

  return (
    <section className="space-y-5">
      <article className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
        <h2 className="text-2xl font-semibold text-white">新建课程</h2>
        <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={onCreateCourse}>
          <label className="block">
            <span className="mb-1 block text-xs text-slate-400">课程名称</span>
            <input
              data-testid="admin-course-title"
              className="w-full rounded-xl border border-white/20 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-brand-500"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-slate-400">课程分类</span>
            <input
              data-testid="admin-course-category"
              className="w-full rounded-xl border border-white/20 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-brand-500"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-slate-400">时长（分钟）</span>
            <input
              data-testid="admin-course-duration"
              type="number"
              min={1}
              className="w-full rounded-xl border border-white/20 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-brand-500"
              value={durationMinutes}
              onChange={(event) => setDurationMinutes(event.target.value)}
              required
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-slate-400">课程属性</span>
            <select
              data-testid="admin-course-requirement"
              className="w-full rounded-xl border border-white/20 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-brand-500"
              value={requirement}
              onChange={(event) =>
                setRequirement(event.target.value as "required" | "optional")
              }
            >
              <option value="required">必修</option>
              <option value="optional">选修</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs text-slate-400">截止日期</span>
            <input
              data-testid="admin-course-due-date"
              type="date"
              className="w-full rounded-xl border border-white/20 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-brand-500"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              required
            />
          </label>
          <label className="block md:col-span-2">
            <span className="mb-1 block text-xs text-slate-400">课程简介</span>
            <textarea
              data-testid="admin-course-description"
              rows={3}
              className="w-full rounded-xl border border-white/20 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-brand-500"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              required
            />
          </label>
          <div className="md:col-span-2">
            <button
              data-testid="admin-course-create"
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-500 disabled:opacity-60"
            >
              {isSubmitting ? "创建中..." : "创建课程"}
            </button>
            {message ? <p className="mt-2 text-sm text-slate-300">{message}</p> : null}
          </div>
        </form>
      </article>

      <article className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
        <h3 className="text-xl font-semibold text-white">课程列表</h3>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[780px] text-left text-sm text-slate-300">
            <thead className="text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="pb-2">课程</th>
                <th className="pb-2">分类</th>
                <th className="pb-2">属性</th>
                <th className="pb-2">状态</th>
                <th className="pb-2">章节数</th>
                <th className="pb-2">截止日期</th>
                <th className="pb-2">操作</th>
              </tr>
            </thead>
            <tbody>
              {sortedCourses.map((course) => (
                <tr key={course.id} className="border-t border-white/10">
                  <td className="py-2">
                    <p className="font-medium text-white">{course.title}</p>
                    <p className="text-xs text-slate-400">{course.id}</p>
                  </td>
                  <td className="py-2">{course.category}</td>
                  <td className="py-2">{course.requirement === "required" ? "必修" : "选修"}</td>
                  <td className="py-2">
                    {course.status === "published" ? "已发布" : "草稿"}
                  </td>
                  <td className="py-2">{course.lessonCount}</td>
                  <td className="py-2">{course.dueDate}</td>
                  <td className="py-2">
                    {course.status === "draft" ? (
                      <button
                        data-testid={`admin-course-publish-${course.id}`}
                        type="button"
                        className="rounded-lg border border-brand-400 px-2.5 py-1 text-xs text-brand-300 hover:bg-brand-500/20"
                        disabled={publishingCourseId === course.id}
                        onClick={() => void onPublish(course.id)}
                      >
                        {publishingCourseId === course.id ? "发布中..." : "发布"}
                      </button>
                    ) : (
                      <span className="text-xs text-emerald-300">已上线</span>
                    )}
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
