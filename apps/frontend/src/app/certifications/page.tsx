import { ComingSoonPanel } from "@/components/coming-soon-panel";
import { EmployeeShell } from "@/components/prototype/employee-shell";

export default function CertificationsPage() {
  return (
    <EmployeeShell
      activeHref="/dashboard"
      title="岗位认证"
      subtitle="岗位认证与到期复训将在第二阶段开放，首版聚焦核心学习闭环。"
    >
      <ComingSoonPanel
        title="岗位认证即将上线"
        description="当前版本先保障课程学习、进度保存、考试提交与管理端运营。岗位认证能力将在下一阶段启用。"
      />
    </EmployeeShell>
  );
}
