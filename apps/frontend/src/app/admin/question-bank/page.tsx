import { QuestionBankPanel } from "@/components/admin/question-bank-panel";
import { AdminShell } from "@/components/prototype/admin-shell";
import { getAdminQuestionBank } from "@/lib/api-server";

export default async function AdminQuestionBankPage() {
  const questions = (await getAdminQuestionBank()) ?? [];

  return (
    <AdminShell
      activeHref="/admin/question-bank"
      title="题库管理"
      subtitle="按题型、知识点、难度维护题库，并作为随机组卷的稳定题源。"
    >
      <QuestionBankPanel initialQuestions={questions} />
    </AdminShell>
  );
}
