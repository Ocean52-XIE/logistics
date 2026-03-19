import { EmployeeShell } from "@/components/prototype/employee-shell";
import { DataFetchErrorPanel } from "@/components/data-fetch-error-panel";
import { LessonLearningPanel } from "@/components/prototype/lesson-learning-panel";
import { getLessonDetail } from "@/lib/api-server";

export default async function LessonPage({
  params
}: {
  params: Promise<{ lessonId: string }>;
}) {
  const { lessonId } = await params;
  const lesson = await getLessonDetail(lessonId);

  if (!lesson) {
    return (
      <EmployeeShell
        activeHref="/courses"
        title="章节学习"
        subtitle="统一承载视频、图文和 PDF 章节，支持章节完成打点与连续学习。"
        primaryAction="标记完成"
      >
        <DataFetchErrorPanel />
      </EmployeeShell>
    );
  }

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
