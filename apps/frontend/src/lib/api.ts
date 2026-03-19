import type {
  AdminCourseListItem,
  AdminReportOverview,
  AdminTrainingPlanListItem,
  CourseDetail,
  CourseListItem,
  CreateAdminCourseRequest,
  CreateAdminTrainingPlanRequest,
  DashboardSummary,
  DashboardTask,
  ExamDetail,
  ExamListItem,
  HealthCheckResponse,
  KnowledgeArticleDetail,
  KnowledgeArticleListItem,
  LessonDetail,
  MyProgressOverview,
  PublishAdminCourseResponse,
  SaveExamDraftRequest,
  SaveExamDraftResponse,
  SaveLessonProgressRequest,
  SaveLessonProgressResponse,
  SubmitExamRequest,
  SubmitExamResponse,
  UserNotificationItem
} from "@logistics/shared";
import { API_BASE_URL, getBrowserAccessToken } from "./auth-token";

const API_ACCESS_TOKEN = process.env.NEXT_PUBLIC_API_ACCESS_TOKEN;

async function fetchApi<T>(
  path: string,
  init?: RequestInit
): Promise<T | null> {
  try {
    const headers = new Headers(init?.headers);
    const token =
      (typeof window !== "undefined" ? getBrowserAccessToken() : null) ??
      API_ACCESS_TOKEN;
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      cache: "no-store",
      ...init,
      headers
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

export function getKnowledgeArticles() {
  return fetchApi<KnowledgeArticleListItem[]>("/knowledge-articles");
}

export function getKnowledgeArticleDetail(articleId: string) {
  return fetchApi<KnowledgeArticleDetail>(`/knowledge-articles/${articleId}`);
}

export function getNotifications() {
  return fetchApi<UserNotificationItem[]>("/notifications");
}

export function getMyProgress() {
  return fetchApi<MyProgressOverview>("/my-progress");
}

export function getAdminCourses() {
  return fetchApi<AdminCourseListItem[]>("/admin/courses");
}

export function createAdminCourse(payload: CreateAdminCourseRequest) {
  return postJson<AdminCourseListItem>("/admin/courses", payload);
}

export function publishAdminCourse(courseId: string) {
  return postJson<PublishAdminCourseResponse>(`/admin/courses/${courseId}/publish`, {});
}

export function getAdminTrainingPlans() {
  return fetchApi<AdminTrainingPlanListItem[]>("/admin/training-plans");
}

export function createAdminTrainingPlan(payload: CreateAdminTrainingPlanRequest) {
  return postJson<AdminTrainingPlanListItem>("/admin/training-plans", payload);
}

export function getAdminReportOverview() {
  return fetchApi<AdminReportOverview>("/admin/reports/overview");
}
