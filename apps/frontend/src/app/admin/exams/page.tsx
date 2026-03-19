import { ExamOperationsPanel } from "@/components/admin/exam-operations-panel";
import { AdminShell } from "@/components/prototype/admin-shell";
import {
  getAdminExams,
  getAdminQuestionBank,
  getAdminUsers
} from "@/lib/api-server";

export default async function AdminExamsPage() {
  const [exams, users, questions] = await Promise.all([
    getAdminExams(),
    getAdminUsers(),
    getAdminQuestionBank()
  ]);

  return (
    <AdminShell
      activeHref="/admin/exams"
      title="组卷与补考"
      subtitle="支持随机组卷发布、定向指派和补考发起，形成考试运营闭环。"
    >
      <ExamOperationsPanel
        initialExams={exams ?? []}
        users={users ?? []}
        questions={questions ?? []}
      />
    </AdminShell>
  );
}
