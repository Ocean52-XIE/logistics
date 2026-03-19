import { EmployeeShell } from "@/components/prototype/employee-shell";
import { DataFetchErrorPanel } from "@/components/data-fetch-error-panel";
import { ExamSessionPanel } from "@/components/prototype/exam-session-panel";
import { getExamDetail } from "@/lib/api-server";

export default async function ExamDetailPage({
  params
}: {
  params: Promise<{ examId: string }>;
}) {
  const { examId } = await params;
  const exam = await getExamDetail(examId);

  if (!exam) {
    return (
      <EmployeeShell
        activeHref="/exams"
        title="考试详情"
        subtitle="页面包含考试说明、倒计时、答题区、题号导航、暂存状态和交卷确认。"
        primaryAction="提交试卷"
      >
        <DataFetchErrorPanel />
      </EmployeeShell>
    );
  }

  return (
    <EmployeeShell
      activeHref="/exams"
      title={`考试进行中 · ${exam.name}`}
      subtitle="页面包含考试说明、倒计时、答题区、题号导航、暂存状态和交卷确认。"
      primaryAction="提交试卷"
    >
      <ExamSessionPanel exam={exam} />
    </EmployeeShell>
  );
}
