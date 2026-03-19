export type UserRole = "employee" | "manager" | "trainer" | "admin";

export interface UserProfile {
  id: string;
  name: string;
  role: UserRole;
  organizationName: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
  user: UserProfile;
}

export interface DashboardTask {
  id: string;
  title: string;
  type: "course" | "exam" | "sop";
  status: "todo" | "in_progress" | "completed";
  dueDate: string;
}

export interface DashboardSummary {
  completionRate: number;
  pendingCourses: number;
  pendingExams: number;
  completedCourses: number;
}

export interface HealthCheckResponse {
  status: "ok";
  service: string;
  timestamp: string;
  version: string;
}

export type CourseRequirement = "required" | "optional";
export type LearningContentType = "video" | "article" | "pdf" | "quiz";
export type ProgressStatus = "todo" | "in_progress" | "completed";

export interface CourseListItem {
  id: string;
  title: string;
  category: string;
  durationMinutes: number;
  progress: number;
  requirement: CourseRequirement;
  dueDate: string;
}

export interface CourseChapter {
  lessonId: string;
  title: string;
  contentType: LearningContentType;
  progress: number;
  status: ProgressStatus;
}

export interface CourseDetail extends CourseListItem {
  description: string;
  roles: string[];
  completionRule: string;
  chapters: CourseChapter[];
  attachments: string[];
}

export interface LessonDetail {
  id: string;
  courseId: string;
  title: string;
  contentType: LearningContentType;
  content: string;
  totalSeconds: number;
  positionSeconds: number;
  completed: boolean;
  autoSaveIntervalSeconds: number;
  previousLessonId: string | null;
  nextLessonId: string | null;
}

export interface SaveLessonProgressRequest {
  positionSeconds: number;
  completed?: boolean;
}

export interface SaveLessonProgressResponse {
  positionSeconds: number;
  completed: boolean;
  courseProgress: number;
  savedAt: string;
}

export type ExamStatus = "pending" | "completed";
export type ExamQuestionType = "single" | "multiple" | "boolean" | "case";

export interface ExamListItem {
  id: string;
  name: string;
  durationMinutes: number;
  questionCount: number;
  startTime: string;
  status: ExamStatus;
  score: number | null;
}

export interface ExamQuestionOption {
  id: string;
  label: string;
}

export interface ExamQuestion {
  id: string;
  type: ExamQuestionType;
  stem: string;
  options: ExamQuestionOption[];
  correctOptionIds: string[];
  knowledgeTag: string;
}

export interface ExamAttemptState {
  answers: Record<string, string[]>;
  currentQuestion: number;
  remainingSeconds: number;
  savedAt: string | null;
  submittedAt: string | null;
  score: number | null;
}

export interface ExamDetail extends ExamListItem {
  instructions: string;
  warnings: string[];
  passScore: number;
  attempt: ExamAttemptState;
  questions: ExamQuestion[];
}

export interface SaveExamDraftRequest {
  answers: Record<string, string[]>;
  currentQuestion: number;
  remainingSeconds: number;
}

export interface SaveExamDraftResponse {
  savedAt: string;
}

export interface SubmitExamRequest {
  answers: Record<string, string[]>;
}

export interface ExamReviewItem {
  questionId: string;
  stem: string;
  knowledgeTag: string;
  yourAnswerIds: string[];
  correctAnswerIds: string[];
}

export interface SubmitExamResponse {
  score: number;
  passed: boolean;
  correctCount: number;
  totalQuestions: number;
  wrongQuestions: ExamReviewItem[];
  suggestedReviews: string[];
  submittedAt: string;
}

export type AdminCourseStatus = "draft" | "published";

export interface AdminCourseListItem {
  id: string;
  title: string;
  category: string;
  durationMinutes: number;
  requirement: CourseRequirement;
  status: AdminCourseStatus;
  dueDate: string;
  lessonCount: number;
  publishedAt: string | null;
}

export interface CreateAdminCourseRequest {
  title: string;
  category: string;
  durationMinutes: number;
  requirement: CourseRequirement;
  dueDate: string;
  description: string;
}

export interface PublishAdminCourseResponse {
  id: string;
  status: AdminCourseStatus;
  publishedAt: string;
}

export interface AdminTrainingPlanListItem {
  id: string;
  name: string;
  startAt: string;
  endAt: string;
  courseCount: number;
  assigneeCount: number;
  completionRate: number;
  status: "pending" | "active" | "completed";
}

export interface CreateAdminTrainingPlanRequest {
  name: string;
  startAt: string;
  endAt: string;
  courseIds: string[];
  assigneeUserIds: string[];
}

export interface AdminReportOverview {
  totalUsers: number;
  activeLearners: number;
  completionRate: number;
  passRate: number;
  publishedCourses: number;
  activePlans: number;
}

export interface KnowledgeArticleListItem {
  id: string;
  title: string;
  category: string;
  summary: string;
  updatedAt: string;
  isHot: boolean;
}

export interface KnowledgeArticleDetail extends KnowledgeArticleListItem {
  content: string;
  tags: string[];
  relatedCourseIds: string[];
}

export interface UserNotificationItem {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  pinned: boolean;
  unread: boolean;
}

export interface MyProgressOverview {
  totalLearnSeconds: number;
  completedCourseCount: number;
  requiredCourseCount: number;
  completionRate: number;
  averageExamScore: number | null;
  passedExamCount: number;
  totalExamCount: number;
}
