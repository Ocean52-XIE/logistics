import type {
  CourseDetail,
  CourseListItem,
  DashboardSummary,
  DashboardTask,
  ExamDetail,
  ExamListItem,
  HealthCheckResponse,
  LessonDetail,
  SaveExamDraftRequest,
  SaveExamDraftResponse,
  SaveLessonProgressRequest,
  SaveLessonProgressResponse,
  SubmitExamRequest,
  SubmitExamResponse
} from "@logistics/shared";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000/api/v1";

async function fetchApi<T>(
  path: string,
  init?: RequestInit
): Promise<T | null> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      cache: "no-store",
      ...init
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function postJson<T>(path: string, payload: unknown): Promise<T | null> {
  return fetchApi<T>(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
}

export function getHealthStatus() {
  return fetchApi<HealthCheckResponse>("/health");
}

export function getDashboardSummary() {
  return fetchApi<DashboardSummary>("/dashboard/summary");
}

export function getDashboardTasks() {
  return fetchApi<DashboardTask[]>("/dashboard/tasks");
}

export function getCourses() {
  return fetchApi<CourseListItem[]>("/courses");
}

export function getCourseDetail(courseId: string) {
  return fetchApi<CourseDetail>(`/courses/${courseId}`);
}

export function getLessonDetail(lessonId: string) {
  return fetchApi<LessonDetail>(`/lessons/${lessonId}`);
}

export function saveLessonProgress(
  lessonId: string,
  payload: SaveLessonProgressRequest
) {
  return postJson<SaveLessonProgressResponse>(`/lessons/${lessonId}/progress`, payload);
}

export function getExams() {
  return fetchApi<ExamListItem[]>("/exams");
}

export function getExamDetail(examId: string) {
  return fetchApi<ExamDetail>(`/exams/${examId}`);
}

export function saveExamDraft(examId: string, payload: SaveExamDraftRequest) {
  return postJson<SaveExamDraftResponse>(`/exams/${examId}/draft`, payload);
}

export function submitExam(examId: string, payload: SubmitExamRequest) {
  return postJson<SubmitExamResponse>(`/exams/${examId}/submit`, payload);
}
