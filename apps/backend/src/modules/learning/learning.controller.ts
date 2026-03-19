import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  UseGuards
} from "@nestjs/common";
import type {
  CourseDetail,
  CourseListItem,
  ExamDetail,
  ExamListItem,
  KnowledgeArticleDetail,
  KnowledgeArticleListItem,
  MyProgressOverview,
  SaveExamDraftResponse,
  SaveLessonProgressResponse,
  SubmitExamResponse,
  UserNotificationItem
} from "@logistics/shared";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { SaveExamDraftDto } from "./dto/save-exam-draft.dto";
import { SaveLessonProgressDto } from "./dto/save-lesson-progress.dto";
import { SubmitExamDto } from "./dto/submit-exam.dto";
import { LearningService } from "./learning.service";

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("employee", "admin")
export class LearningController {
  constructor(
    @Inject(LearningService)
    private readonly learningService: LearningService
  ) {}

  @Get("courses")
  async getCourses(@CurrentUser("id") userId: string | null): Promise<CourseListItem[]> {
    return this.learningService.getCourses(userId ?? "");
  }

  @Get("courses/:courseId")
  async getCourse(
    @CurrentUser("id") userId: string | null,
    @Param("courseId") courseId: string
  ): Promise<CourseDetail> {
    return this.learningService.getCourse(userId ?? "", courseId);
  }

  @Get("lessons/:lessonId")
  async getLesson(
    @CurrentUser("id") userId: string | null,
    @Param("lessonId") lessonId: string
  ) {
    return this.learningService.getLesson(userId ?? "", lessonId);
  }

  @Post("lessons/:lessonId/progress")
  async saveLessonProgress(
    @CurrentUser("id") userId: string | null,
    @Param("lessonId") lessonId: string,
    @Body() body: SaveLessonProgressDto
  ): Promise<SaveLessonProgressResponse> {
    return this.learningService.saveLessonProgress(userId ?? "", lessonId, body);
  }

  @Get("exams")
  async getExams(@CurrentUser("id") userId: string | null): Promise<ExamListItem[]> {
    return this.learningService.getExams(userId ?? "");
  }

  @Get("exams/:examId")
  async getExam(
    @CurrentUser("id") userId: string | null,
    @Param("examId") examId: string
  ): Promise<ExamDetail> {
    return this.learningService.getExam(userId ?? "", examId);
  }

  @Post("exams/:examId/draft")
  async saveExamDraft(
    @CurrentUser("id") userId: string | null,
    @Param("examId") examId: string,
    @Body() body: SaveExamDraftDto
  ): Promise<SaveExamDraftResponse> {
    return this.learningService.saveExamDraft(userId ?? "", examId, body);
  }

  @Post("exams/:examId/submit")
  @HttpCode(200)
  async submitExam(
    @CurrentUser("id") userId: string | null,
    @Param("examId") examId: string,
    @Body() body: SubmitExamDto
  ): Promise<SubmitExamResponse> {
    return this.learningService.submitExam(userId ?? "", examId, body);
  }

  @Get("knowledge-articles")
  async getKnowledgeArticles(): Promise<KnowledgeArticleListItem[]> {
    return this.learningService.getKnowledgeArticles();
  }

  @Get("knowledge-articles/:articleId")
  async getKnowledgeArticle(
    @Param("articleId") articleId: string
  ): Promise<KnowledgeArticleDetail> {
    return this.learningService.getKnowledgeArticle(articleId);
  }

  @Get("notifications")
  async getNotifications(
    @CurrentUser("id") userId: string | null
  ): Promise<UserNotificationItem[]> {
    return this.learningService.getNotifications(userId ?? "");
  }

  @Get("my-progress")
  async getMyProgress(
    @CurrentUser("id") userId: string | null
  ): Promise<MyProgressOverview> {
    return this.learningService.getMyProgress(userId ?? "");
  }
}
