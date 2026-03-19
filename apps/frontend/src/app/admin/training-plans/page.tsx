import { TrainingPlanPanel } from "@/components/admin/training-plan-panel";
import { AdminShell } from "@/components/prototype/admin-shell";
import {
  getAdminCourses,
  getAdminTrainingPlans,
  getAdminUsers
} from "@/lib/api-server";

export default async function AdminTrainingPlansPage() {
  const [plans, users, courses] = await Promise.all([
    getAdminTrainingPlans(),
    getAdminUsers(),
    getAdminCourses()
  ]);

  const assignableUsers = (users ?? []).filter((user) => user.role === "employee");

  return (
    <AdminShell
      activeHref="/admin/training-plans"
      title="培训计划"
      subtitle="支持发布培训计划并按员工批量指派，形成执行闭环。"
    >
      <TrainingPlanPanel
        initialPlans={plans ?? []}
        users={assignableUsers}
        courses={(courses ?? []).filter((course) => course.status === "published")}
      />
    </AdminShell>
  );
}
