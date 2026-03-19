import { ComingSoonPanel } from "@/components/coming-soon-panel";
import { EmployeeShell } from "@/components/prototype/employee-shell";

export default function ProfilePage() {
  return (
    <EmployeeShell
      activeHref="/dashboard"
      title="个人中心"
      subtitle="个人配置能力暂不纳入 MVP，先确保学习与考试链路稳定。"
    >
      <ComingSoonPanel
        title="个人中心即将上线"
        description="首版优先实现登录、学习、考试与管理查看闭环。个人偏好与通知细粒度设置会在后续版本开放。"
      />
    </EmployeeShell>
  );
}
