import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  UseGuards
} from "@nestjs/common";
import type {
  AdminCourseListItem,
  AdminReportOverview,
  AdminTrainingPlanListItem,
  PublishAdminCourseResponse,
  UserProfile
} from "@logistics/shared";
import { Roles } from "../auth/decorators/roles.decorator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { CreateAdminCourseDto } from "./dto/create-admin-course.dto";
import { CreateTrainingPlanDto } from "./dto/create-training-plan.dto";
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
    @Body() body: CreateAdminCourseDto
  ): Promise<AdminCourseListItem> {
    return this.adminService.createCourse(body);
  }

  @Post("courses/:courseId/publish")
  async publishCourse(
    @Param("courseId") courseId: string
  ): Promise<PublishAdminCourseResponse> {
    return this.adminService.publishCourse(courseId);
  }

  @Get("training-plans")
  async getTrainingPlans(): Promise<AdminTrainingPlanListItem[]> {
    return this.adminService.getTrainingPlans();
  }

  @Post("training-plans")
  async createTrainingPlan(
    @Body() body: CreateTrainingPlanDto
  ): Promise<AdminTrainingPlanListItem> {
    return this.adminService.createTrainingPlan(body);
  }

  @Get("reports/overview")
  async getReportOverview(): Promise<AdminReportOverview> {
    return this.adminService.getReportOverview();
  }
}
