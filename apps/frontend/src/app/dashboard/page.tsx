import Link from "next/link";
import { EmployeeShell } from "@/components/prototype/employee-shell";
import { CourseCard, StatMetricCard, StatusBadge } from "@/components/prototype/ui";
import {
  notifications,
  requiredCourses
} from "@/lib/prototype-data";
import { getCourses, getDashboardSummary, getDashboardTasks } from "@/lib/api";
import type {
  CourseListItem,
  DashboardSummary,
  DashboardTask
} from "@logistics/shared";

const fallbackSummary: DashboardSummary = {
  completionRate: 74,
  pendingCourses: 2,
  pendingExams: 1,
  completedCourses: 2
};

const fallbackTasks: DashboardTask[] = [
  {
    id: "task-C-1024",
    title: "仓配一体全链路基础",
    type: "course",
    status: "in_progress",
    dueDate: "2026-03-24"
  },
  {
    id: "task-EX-301",
    title: "仓储安全规范考试",
    type: "exam",
    status: "todo",
    dueDate: "2026-03-23"
  }
];

export default async function DashboardPage() {
  const [summaryData, taskData, courseData] = await Promise.all([
    getDashboardSummary(),
    getDashboardTasks(),
    getCourses()
  ]);

  const summary = summaryData ?? fallbackSummary;
  const tasks = taskData ?? fallbackTasks;
  const courses =
    courseData?.filter((course) => course.requirement === "required") ?? [];

  const metrics = [
    {
      label: "本周学习完成率",
      value: `${summary.completionRate}%`,
      hint: "实时根据课程完成计算",
      tone: "success" as const
    },
    {
      label: "待完成课程",
      value: String(summary.pendingCourses),
      hint: "必修课程剩余数量",
      tone: "warning" as const
    },
    {
      label: "待参加考试",
      value: String(summary.pendingExams),
      hint: "待参加考试场次",
      tone: "info" as const
    },
    {
      label: "已完成课程",
      value: String(summary.completedCourses),
      hint: "当前已达标课程",
      tone: "default" as const
    }
  ];

  const todayTaskCards = tasks.slice(0, 3);
  const courseCards = (courses.length > 0 ? courses : mapFallbackCourses()).slice(0, 4);

  return (
    <EmployeeShell
      activeHref="/dashboard"
      title="员工学习首页"
      subtitle="10 秒内明确下一步学习动作，围绕“今天学什么、还差多少、最近有什么考试”组织信息。"
      primaryAction="继续学习"
    >
      <section className="grid gap-4 md:grid-cols-2 2xl:grid-cols-4">
        {metrics.map((metric) => (
          <StatMetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <article className="rounded-3xl border border-[color:var(--line)] bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Training Task Banner</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-800">今日待学任务</h2>
            </div>
            <button
              type="button"
              className="rounded-xl bg-accent-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-600"
            >
              进入主任务
            </button>
          </div>
          <div className="mt-5 space-y-3">
            {todayTaskCards.map((task) => (
              <div
                key={task.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <StatusBadge text={task.type.toUpperCase()} tone="info" />
                    <p className="font-medium text-slate-700">{task.title}</p>
                  </div>
                  <StatusBadge
                    text={`${statusLabel(task.status)} · ${task.dueDate}`}
                    tone={task.status === "in_progress" ? "success" : "warning"}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-3xl border border-[color:var(--line)] bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Exam Reminder</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-800">待参加考试</h3>
          <p className="mt-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
            《仓储安全规范考试》将在 03-23 16:30 开始，建议提前 10 分钟进入。
          </p>
          <Link
            href="/exams/EX-301"
            className="mt-4 inline-flex rounded-xl border border-brand-200 px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50"
          >
            查看考试详情
          </Link>

          <div className="mt-6 rounded-2xl bg-[color:var(--surface-muted)] p-4">
            <p className="font-medium text-slate-700">岗位认证状态</p>
            <p className="mt-2 text-sm text-slate-600">分拣岗位认证进行中，已完成 2/3 项。</p>
          </div>
        </article>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]">
        <article className="rounded-3xl border border-[color:var(--line)] bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-semibold text-slate-800">必修课程</h3>
            <Link href="/courses" className="text-sm font-medium text-brand-600 hover:text-brand-700">
              查看全部
            </Link>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {courseCards.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </article>

        <div className="space-y-5">
          <article className="rounded-3xl border border-[color:var(--line)] bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-800">SOP 快捷入口</h3>
            <div className="mt-4 space-y-2 text-sm">
              <Link className="block rounded-xl bg-slate-50 px-3 py-2 text-slate-700 hover:bg-slate-100" href="/knowledge-base/KB-1001">
                异常件闭环处理流程
              </Link>
              <Link className="block rounded-xl bg-slate-50 px-3 py-2 text-slate-700 hover:bg-slate-100" href="/knowledge-base/KB-1002">
                签收争议处理规范
              </Link>
              <Link className="block rounded-xl bg-slate-50 px-3 py-2 text-slate-700 hover:bg-slate-100" href="/knowledge-base/KB-1003">
                仓储安全巡检清单
              </Link>
            </div>
          </article>

          <article className="rounded-3xl border border-[color:var(--line)] bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-slate-800">最新通知</h3>
              <Link href="/notifications" className="text-sm text-brand-600 hover:text-brand-700">
                全部通知
              </Link>
            </div>
            <div className="mt-4 space-y-3">
              {notifications.slice(0, 3).map((notice) => (
                <div key={notice.id} className="rounded-2xl border border-slate-200 px-3 py-2.5">
                  <p className="text-sm font-medium text-slate-800">{notice.title}</p>
                  <p className="mt-1 text-xs text-slate-500">{notice.time}</p>
                </div>
              ))}
            </div>
          </article>
        </div>
      </section>
    </EmployeeShell>
  );
}

function statusLabel(status: DashboardTask["status"]) {
  if (status === "completed") {
    return "已完成";
  }
  if (status === "in_progress") {
    return "进行中";
  }
  return "待开始";
}

function mapFallbackCourses(): CourseListItem[] {
  return requiredCourses.map((course) => ({
    id: course.id,
    title: course.title,
    category: course.category,
    durationMinutes: Number.parseInt(course.duration, 10),
    progress: course.progress,
    requirement: course.status === "必修" ? "required" : "optional",
    dueDate: course.dueDate
  }));
}
