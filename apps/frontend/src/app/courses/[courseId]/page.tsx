import Link from "next/link";
import type { Route } from "next";
import { EmployeeShell } from "@/components/prototype/employee-shell";
import { DataFetchErrorPanel } from "@/components/data-fetch-error-panel";
import { ProgressCard, RoleTag, StatusBadge } from "@/components/prototype/ui";
import { getCourseDetail } from "@/lib/api-server";
import type { CourseDetail } from "@logistics/shared";

export default async function CourseDetailPage({
  params
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const course = await getCourseDetail(courseId);

  if (!course) {
    return (
      <EmployeeShell
        activeHref="/courses"
        title="课程详情"
        subtitle="覆盖课程封面、适用岗位、章节目录、学习进度、附件下载和答疑入口。"
        primaryAction="继续学习"
      >
        <DataFetchErrorPanel />
      </EmployeeShell>
    );
  }

  return (
    <EmployeeShell
      activeHref="/courses"
      title={`课程详情 · ${course.title}`}
      subtitle="覆盖课程封面、适用岗位、章节目录、学习进度、附件下载和答疑入口。"
      primaryAction="继续学习"
    >
      <section className="rounded-3xl border border-[color:var(--line)] bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge
            text={course.requirement === "required" ? "必修课程" : "选修课程"}
            tone={course.requirement === "required" ? "warning" : "default"}
          />
          {course.roles.map((role) => (
            <RoleTag key={role} role={role} />
          ))}
        </div>
        <h2 className="mt-4 text-3xl font-semibold text-slate-800">{course.title}</h2>
        <p className="mt-3 max-w-4xl text-sm leading-7 text-slate-600">
          {course.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm text-slate-600">
          <span className="rounded-full bg-slate-100 px-3 py-1.5">预计时长：{course.durationMinutes} 分钟</span>
          <span className="rounded-full bg-slate-100 px-3 py-1.5">完成规则：{course.completionRule}</span>
          <span className="rounded-full bg-slate-100 px-3 py-1.5">到期时间：{course.dueDate}</span>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.25fr_0.75fr]">
        <article className="rounded-3xl border border-[color:var(--line)] bg-white p-6">
          <h3 className="text-xl font-semibold text-slate-800">章节目录</h3>
          <div className="mt-4 grid gap-3">
            {course.chapters.map((chapter) => (
              <Link
                key={chapter.lessonId}
                href={`/lessons/${chapter.lessonId}` as Route}
                className="rounded-2xl border border-slate-200 p-4 transition hover:border-brand-200 hover:bg-brand-50/30"
              >
                <ProgressCard
                  title={chapter.title}
                  detail={`章节编号 ${chapter.lessonId} · ${contentTypeLabel(chapter.contentType)}`}
                  progress={chapter.progress}
                  status={statusLabel(chapter.status)}
                />
              </Link>
            ))}
          </div>
        </article>

        <div className="space-y-5">
          <article className="rounded-3xl border border-[color:var(--line)] bg-white p-6">
            <h3 className="text-xl font-semibold text-slate-800">附件下载</h3>
            <div className="mt-3 space-y-2 text-sm text-slate-600">
              {course.attachments.map((attachment) => (
                <button
                  key={attachment}
                  type="button"
                  className="block w-full rounded-xl bg-slate-50 px-3 py-2 text-left hover:bg-slate-100"
                >
                  {attachment}
                </button>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border border-[color:var(--line)] bg-white p-6">
            <h3 className="text-xl font-semibold text-slate-800">讨论与答疑</h3>
            <p className="mt-2 text-sm text-slate-600">提交问题后将由培训讲师在 24 小时内回复。</p>
            <button
              type="button"
              className="mt-4 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
            >
              发起提问
            </button>
          </article>
        </div>
      </section>
    </EmployeeShell>
  );
}

function contentTypeLabel(type: CourseDetail["chapters"][number]["contentType"]) {
  if (type === "video") {
    return "视频";
  }
  if (type === "article") {
    return "图文";
  }
  if (type === "pdf") {
    return "PDF";
  }
  return "测验";
}

function statusLabel(status: CourseDetail["chapters"][number]["status"]) {
  if (status === "completed") {
    return "已完成";
  }
  if (status === "in_progress") {
    return "进行中";
  }
  return "未开始";
}
