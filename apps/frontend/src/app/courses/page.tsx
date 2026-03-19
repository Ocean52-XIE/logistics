import { EmployeeShell } from "@/components/prototype/employee-shell";
import { DataFetchErrorPanel } from "@/components/data-fetch-error-panel";
import { CourseCard, FilterBar } from "@/components/prototype/ui";
import { getCourses } from "@/lib/api-server";

export default async function CoursesPage() {
  const courseData = await getCourses();
  if (!courseData) {
    return (
      <EmployeeShell
        activeHref="/courses"
        title="课程中心"
        subtitle="统一展示必修与选修课程，支持岗位筛选、进度追踪和一键续学。"
        primaryAction="继续课程"
      >
        <DataFetchErrorPanel />
      </EmployeeShell>
    );
  }

  const courses = courseData;

  return (
    <EmployeeShell
      activeHref="/courses"
      title="课程中心"
      subtitle="统一展示必修与选修课程，支持岗位筛选、进度追踪和一键续学。"
      primaryAction="继续课程"
    >
      <FilterBar title="筛选条件" items={["全部课程", "必修", "选修", "本周到期", "进行中"]} />

      <section className="grid gap-4 md:grid-cols-2">
        {courses.length === 0 ? (
          <article className="rounded-3xl border border-[color:var(--line)] bg-white p-6 text-sm text-slate-500">
            暂无课程数据。
          </article>
        ) : (
          courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))
        )}
      </section>

      <section className="rounded-3xl border border-[color:var(--line)] bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-800">推荐复习内容</h2>
        <ul className="mt-3 space-y-2 text-sm text-slate-600">
          <li>高频错题复盘：异常件类型判定（12 题）</li>
          <li>操作要点回看：扫码失败处理流程</li>
          <li>考试冲刺：仓储安全规范重点 10 条</li>
        </ul>
      </section>
    </EmployeeShell>
  );
}
