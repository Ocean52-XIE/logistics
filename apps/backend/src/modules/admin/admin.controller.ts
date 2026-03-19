import {
  Body,
  Controller,
  Get,
  HttpCode,
  Inject,
  Param,
  Post,
  Query,
  UseGuards
} from "@nestjs/common";
import type {
  AdminCourseListItem,
  AdminExamListItem,
  AdminNotificationItem,
  AdminReportOverview,
  AdminTrainingPlanListItem,
  AdminAuditLogItem,
  AdminQuestionBankItem,
  AdminWrongAnswerAnalysisItem,
  CreateAdminExamRetakeResponse,
  PublishAdminCourseResponse,
  RunAdminReminderResponse,
  UserProfile
} from "@logistics/shared";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CreateAdminExamDto } from "./dto/create-admin-exam.dto";
import { CreateAdminNotificationDto } from "./dto/create-admin-notification.dto";
import { CreateAdminQuestionDto } from "./dto/create-admin-question.dto";
import { CreateAdminRetakeDto } from "./dto/create-admin-retake.dto";
import { CreateAdminCourseDto } from "./dto/create-admin-course.dto";
import { CreateTrainingPlanDto } from "./dto/create-training-plan.dto";
import { UpdateAdminQuestionStatusDto } from "./dto/update-admin-question-status.dto";
import { AdminService } from "./admin.service";

@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin")
export class AdminController {
  constructor(
    @Inject(AdminService)
    private readonly adminService: AdminService
  ) {}

  @Get("users")
  async getUsers(): Promise<UserProfile[]> {
    return this.adminService.getUsers();
  }

  @Get("courses")
  async getCourses(): Promise<AdminCourseListItem[]> {
    return this.adminService.getCourses();
  }

  @Post("courses")
  async createCourse(
    @CurrentUser("id") actorUserId: string | null,
    @Body() body: CreateAdminCourseDto
  ): Promise<AdminCourseListItem> {
    return this.adminService.createCourse(body, actorUserId ?? null);
  }

  @Post("courses/:courseId/publish")
  async publishCourse(
    @CurrentUser("id") actorUserId: string | null,
    @Param("courseId") courseId: string
  ): Promise<PublishAdminCourseResponse> {
    return this.adminService.publishCourse(courseId, actorUserId ?? null);
  }

  @Get("training-plans")
  async getTrainingPlans(): Promise<AdminTrainingPlanListItem[]> {
    return this.adminService.getTrainingPlans();
  }

  @Post("training-plans")
  async createTrainingPlan(
    @CurrentUser("id") actorUserId: string | null,
    @Body() body: CreateTrainingPlanDto
  ): Promise<AdminTrainingPlanListItem> {
    return this.adminService.createTrainingPlan(body, actorUserId ?? null);
  }

  @Get("reports/overview")
  async getReportOverview(
    @Query("organizationName") organizationName?: string,
    @Query("positionName") positionName?: string
  ): Promise<AdminReportOverview> {
    return this.adminService.getReportOverview({
      organizationName,
      positionName
    });
  }

  @Get("reports/wrong-answers")
  async getWrongAnswerAnalysis(
    @Query("organizationName") organizationName?: string,
    @Query("positionName") positionName?: string
  ): Promise<AdminWrongAnswerAnalysisItem[]> {
    return this.adminService.getWrongAnswerAnalysis({
      organizationName,
      positionName
    });
  }

  @Get("question-bank")
  async getQuestionBank(
    @Query("type") type?: "single" | "multiple" | "boolean" | "case",
    @Query("knowledgeTag") knowledgeTag?: string,
    @Query("difficulty") difficulty?: "easy" | "medium" | "hard"
  ): Promise<AdminQuestionBankItem[]> {
    return this.adminService.getQuestionBank({
      type,
      knowledgeTag,
      difficulty
    });
  }

  @Post("question-bank")
  async createQuestion(
    @CurrentUser("id") actorUserId: string | null,
    @Body() body: CreateAdminQuestionDto
  ): Promise<AdminQuestionBankItem> {
    return this.adminService.createQuestion(body, actorUserId ?? null);
  }

  @Post("question-bank/:questionId/status")
  async updateQuestionStatus(
    @CurrentUser("id") actorUserId: string | null,
    @Param("questionId") questionId: string,
    @Body() body: UpdateAdminQuestionStatusDto
  ): Promise<AdminQuestionBankItem> {
    return this.adminService.updateQuestionStatus(
      questionId,
      body.isActive,
      actorUserId ?? null
    );
  }

  @Get("exams")
  async getAdminExams(): Promise<AdminExamListItem[]> {
    return this.adminService.getAdminExams();
  }

  @Post("exams")
  async createAdminExam(
    @CurrentUser("id") actorUserId: string | null,
    @Body() body: CreateAdminExamDto
  ): Promise<AdminExamListItem> {
    return this.adminService.createAdminExam(body, actorUserId ?? null);
  }

  @Post("exams/:examId/retakes")
  async createRetakeExam(
    @CurrentUser("id") actorUserId: string | null,
    @Param("examId") examId: string,
    @Body() body: CreateAdminRetakeDto
  ): Promise<CreateAdminExamRetakeResponse> {
    return this.adminService.createRetakeExam(examId, body, actorUserId ?? null);
  }

  @Get("notifications")
  async getAdminNotifications(): Promise<AdminNotificationItem[]> {
    return this.adminService.getAdminNotifications();
  }

  @Post("notifications/publish")
  async publishNotification(
    @CurrentUser("id") actorUserId: string | null,
    @Body() body: CreateAdminNotificationDto
  ): Promise<AdminNotificationItem> {
    return this.adminService.publishNotification(body, actorUserId ?? null);
  }

  @Post("notifications/reminders/run")
  @HttpCode(200)
  async runReminderJobs(
    @CurrentUser("id") actorUserId: string | null
  ): Promise<RunAdminReminderResponse> {
    return this.adminService.runReminderJobs(actorUserId ?? null);
  }

  @Get("audit-logs")
  async getAuditLogs(
    @Query("action") action?: string,
    @Query("entityType") entityType?: string
  ): Promise<AdminAuditLogItem[]> {
    return this.adminService.getAuditLogs({ action, entityType });
  }
}
