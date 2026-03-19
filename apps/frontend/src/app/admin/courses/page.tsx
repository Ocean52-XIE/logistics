import { CourseManagementPanel } from "@/components/admin/course-management-panel";
import { AdminShell } from "@/components/prototype/admin-shell";
import { getAdminCourses } from "@/lib/api-server";

export default async function AdminCoursesPage() {
  const courses = (await getAdminCourses()) ?? [];

  return (
    <AdminShell
      activeHref="/admin/courses"
      title="课程管理"
      subtitle="支持课程列表、新建课程与发布操作，形成管理端最小闭环。"
    >
      <CourseManagementPanel initialCourses={courses} />
    </AdminShell>
  );
}
