import Link from "next/link";
import type { Route } from "next";
import { EmployeeShell } from "@/components/prototype/employee-shell";
import { FilterBar, StatusBadge } from "@/components/prototype/ui";
import { getExams } from "@/lib/api";
import { examList } from "@/lib/prototype-data";
import type { ExamListItem } from "@logistics/shared";

export default async function ExamsPage() {
  const examData = await getExams();
  const exams = examData && examData.length > 0 ? examData : mapFallbackExams();

  return (
    <EmployeeShell
      activeHref="/exams"
      title="在线考试"
      subtitle="统一考试入口，展示待参加场次、历史成绩与复习建议。"
      primaryAction="开始考试"
    >
      <FilterBar title="考试筛选" items={["全部", "待参加", "已完成", "本周安排"]} />

      <section className="grid gap-4">
        {exams.map((exam) => (
          <article key={exam.id} className="rounded-3xl border border-[color:var(--line)] bg-white p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-semibold text-slate-800">{exam.name}</h2>
                <p className="mt-2 text-sm text-slate-500">
                  场次 {exam.id} · {exam.durationMinutes} 分钟 · {exam.questionCount} 题
                </p>
              </div>
              <StatusBadge
                text={exam.status === "completed" ? `已完成 ${exam.score ?? ""}` : "待参加"}
                tone={exam.status === "completed" ? "success" : "warning"}
              />
            </div>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-600">
                考试时间：{new Date(exam.startTime).toLocaleString("zh-CN")}
              </p>
              <Link
                href={`/exams/${exam.id}` as Route}
                className="rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600"
              >
                进入考试详情
              </Link>
            </div>
          </article>
        ))}
      </section>
    </EmployeeShell>
  );
}

function mapFallbackExams(): ExamListItem[] {
  return examList.map((exam) => ({
    id: exam.id,
    name: exam.name,
    durationMinutes: Number.parseInt(exam.duration, 10),
    questionCount: exam.questions,
    startTime: `2026-03-${exam.id === "EX-301" ? "23" : "16"}T16:30:00+08:00`,
    status: exam.status.includes("已完成") ? "completed" : "pending",
    score: exam.status.includes("已完成")
      ? Number.parseInt(exam.status.replace(/\D/g, ""), 10) || null
      : null
  }));
}
