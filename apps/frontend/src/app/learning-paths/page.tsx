import { ComingSoonPanel } from "@/components/coming-soon-panel";
import { EmployeeShell } from "@/components/prototype/employee-shell";

export default function LearningPathsPage() {
  return (
    <EmployeeShell
      activeHref="/dashboard"
      title="学习路径"
      subtitle="首版先确保登录、学习、考试和管理闭环稳定，复杂路径编排暂缓。"
    >
      <ComingSoonPanel
        title="学习路径功能即将上线"
        description="MVP 阶段先聚焦课程学习、考试提交和管理运营闭环。学习路径编排能力将在下一阶段开放。"
      />
    </EmployeeShell>
  );
}
