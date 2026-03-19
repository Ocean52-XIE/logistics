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
      subtitle="当前仅开放已在左侧导航中列出的管理模块，其他能力将在后续阶段逐步上线。"
    >
      <ComingSoonPanel
        title={`模块 /admin/${section} 暂未开放`}
        description="该模块尚未纳入当前交付范围，请先使用已上线的阶段功能。"
      />
    </AdminShell>
  );
}
