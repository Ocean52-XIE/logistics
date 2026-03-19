import { EmployeeShell } from "@/components/prototype/employee-shell";
import { ExamSessionPanel } from "@/components/prototype/exam-session-panel";
import { getExamDetail } from "@/lib/api-server";
import type { ExamDetail } from "@logistics/shared";

const fallbackExam: ExamDetail = {
  id: "EX-301",
  name: "仓储安全规范考试",
  durationMinutes: 40,
  questionCount: 1,
  startTime: "2026-03-23T16:30:00+08:00",
  status: "pending",
  score: null,
  passScore: 80,
  instructions: "考试包含单选、多选、判断和案例题，请在倒计时结束前提交。",
  warnings: ["网络波动会自动暂存"],
  attempt: {
    answers: {},
    currentQuestion: 1,
    remainingSeconds: 40 * 60,
    savedAt: null,
    submittedAt: null,
    score: null
  },
  questions: [
    {
      id: "Q-1",
      type: "single",
      stem: "遇到扫描异常且包裹条码不清晰时，优先执行的操作是？",
      options: [
        { id: "A", label: "直接手动录入单号" },
        { id: "B", label: "按 SOP 拍照留档并转异常件流程" },
        { id: "C", label: "班后统一处理" }
      ],
      correctOptionIds: ["B"],
      knowledgeTag: "异常处理"
    }
  ]
};

export default async function ExamDetailPage({
  params
}: {
  params: Promise<{ examId: string }>;
}) {
  const { examId } = await params;
  const exam = (await getExamDetail(examId)) ?? fallbackExam;

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
