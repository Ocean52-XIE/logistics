import { EmployeeShell } from "@/components/prototype/employee-shell";
import { LessonLearningPanel } from "@/components/prototype/lesson-learning-panel";
import { getLessonDetail } from "@/lib/api";
import type { LessonDetail } from "@logistics/shared";

const fallbackLesson: LessonDetail = {
  id: "L-1004",
  courseId: "C-1024",
  title: "核心 SOP：分拣作业流程",
  contentType: "video",
  content: "视频内容：分拣作业标准流程与注意事项。",
  totalSeconds: 900,
  positionSeconds: 420,
  completed: false,
  autoSaveIntervalSeconds: 30,
  previousLessonId: "L-1003",
  nextLessonId: "L-1005"
};

export default async function LessonPage({
  params
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const lesson = (await getLessonDetail(lessonId)) ?? fallbackLesson;

  return (
    <EmployeeShell
      activeHref="/courses"
      title={`章节学习 · ${lesson.title}`}
      subtitle="统一承载视频、图文和 PDF 章节，支持章节完成打点与连续学习。"
      primaryAction="标记完成"
    >
      <LessonLearningPanel lesson={lesson} />
    </EmployeeShell>
  );
}
