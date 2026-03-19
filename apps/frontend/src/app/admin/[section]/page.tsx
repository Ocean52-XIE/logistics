import { ComingSoonPanel } from "@/components/coming-soon-panel";
import { AdminShell } from "@/components/prototype/admin-shell";

export default async function AdminSectionPage({
  params
}: {
  params: Promise<{ section: string }>;
}) {
  const { section } = await params;

  return (
    <AdminShell
      activeHref="/admin"
      title="管理功能收口中"
      subtitle="MVP 阶段仅保留课程管理、培训计划、报表概览和人员查看，其余模块后续开放。"
    >
      <ComingSoonPanel
        title={`模块 /admin/${section} 暂未纳入 MVP`}
        description="为避免首版范围失控，当前版本优先保障培训运营主链路。该模块已规划，会在后续阶段逐步上线。"
      />
    </AdminShell>
  );
}
