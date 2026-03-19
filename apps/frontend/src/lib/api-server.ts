import "server-only";
import { cookies } from "next/headers";
import type {
  AdminCourseListItem,
  AdminReportOverview,
  AdminTrainingPlanListItem,
  CourseDetail,
  CourseListItem,
  DashboardSummary,
  DashboardTask,
  ExamDetail,
  ExamListItem,
  HealthCheckResponse,
  KnowledgeArticleDetail,
  KnowledgeArticleListItem,
  LessonDetail,
  MyProgressOverview,
  UserProfile,
  UserNotificationItem
} from "@logistics/shared";
import { ACCESS_TOKEN_COOKIE_KEY, API_BASE_URL } from "./auth-constants";

const API_ACCESS_TOKEN = process.env.NEXT_PUBLIC_API_ACCESS_TOKEN;

async function fetchApi<T>(
  path: string,
  init?: RequestInit
): Promise<T | null> {
  try {
    const headers = new Headers(init?.headers);
    const cookieStore = await cookies();
    const cookieToken = cookieStore.get(ACCESS_TOKEN_COOKIE_KEY)?.value;
    const token = cookieToken ?? API_ACCESS_TOKEN;
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

export function getExams() {
  return fetchApi<ExamListItem[]>("/exams");
}

export function getExamDetail(examId: string) {
  return fetchApi<ExamDetail>(`/exams/${examId}`);
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

export function getAdminReportOverview() {
  return fetchApi<AdminReportOverview>("/admin/reports/overview");
}

export function getAdminCourses() {
  return fetchApi<AdminCourseListItem[]>("/admin/courses");
}

export function getAdminTrainingPlans() {
  return fetchApi<AdminTrainingPlanListItem[]>("/admin/training-plans");
}

export function getAdminUsers() {
  return fetchApi<UserProfile[]>("/admin/users");
}
