import { randomUUID } from "crypto";
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import type {
  AdminCourseListItem,
  AdminReportOverview,
  AdminTrainingPlanListItem,
  CreateAdminCourseRequest,
  CreateAdminTrainingPlanRequest,
  PublishAdminCourseResponse,
  UserProfile
} from "@logistics/shared";
import { PrismaService } from "../database/prisma.service";

@Injectable()
export class AdminService {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService
  ) {}

  async getUsers(): Promise<UserProfile[]> {
    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: "asc" }
    });

    return users.map((user) => ({
      id: user.id,
      name: user.name,
      role: user.role,
      organizationName: user.organizationName
    }));
  }

  async getCourses(): Promise<AdminCourseListItem[]> {
    const courses = await this.prisma.course.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            lessons: true
          }
        }
      }
    });

    return courses.map((course) => ({
      id: course.id,
      title: course.title,
      category: course.category,
      durationMinutes: course.durationMinutes,
      requirement: course.requirement,
      status: course.status,
      dueDate: this.formatDateOnly(course.dueDate),
      lessonCount: course._count.lessons,
      publishedAt: course.publishedAt?.toISOString() ?? null
    }));
  }

  async createCourse(payload: CreateAdminCourseRequest): Promise<AdminCourseListItem> {
    const parsedDueDate = new Date(payload.dueDate);
    if (Number.isNaN(parsedDueDate.getTime())) {
      throw new BadRequestException("Invalid dueDate");
    }

    const course = await this.prisma.course.create({
      data: {
        id: `C-${randomUUID().slice(0, 8).toUpperCase()}`,
        title: payload.title.trim(),
        category: payload.category.trim(),
        durationMinutes: payload.durationMinutes,
        requirement: payload.requirement,
        dueDate: parsedDueDate,
        description: payload.description.trim(),
        roles: [],
        completionRule: "完成全部章节并通过课程测验",
        attachments: [],
        status: "draft",
        publishedAt: null
      },
      include: {
        _count: {
          select: {
            lessons: true
          }
        }
      }
    });

    return {
      id: course.id,
      title: course.title,
      category: course.category,
      durationMinutes: course.durationMinutes,
      requirement: course.requirement,
      status: course.status,
      dueDate: this.formatDateOnly(course.dueDate),
      lessonCount: course._count.lessons,
      publishedAt: course.publishedAt?.toISOString() ?? null
    };
  }

  async publishCourse(courseId: string): Promise<PublishAdminCourseResponse> {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      select: { id: true }
    });

    if (!course) {
      throw new NotFoundException(`Course ${courseId} not found`);
    }

    const publishedAt = new Date();
    await this.prisma.course.update({
      where: { id: courseId },
      data: {
        status: "published",
        publishedAt
      }
    });

    return {
      id: courseId,
      status: "published",
      publishedAt: publishedAt.toISOString()
    };
  }

  async getTrainingPlans(): Promise<AdminTrainingPlanListItem[]> {
    const plans = await this.prisma.trainingPlan.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        courses: {
          select: {
            courseId: true
          }
        },
        assignments: {
          select: {
            userId: true
          }
        }
      }
    });

    const userIds = Array.from(
      new Set(plans.flatMap((plan) => plan.assignments.map((item) => item.userId)))
    );
    const courseIds = Array.from(
      new Set(plans.flatMap((plan) => plan.courses.map((item) => item.courseId)))
    );
    const completionMap = await this.getCourseCompletionMap(userIds, courseIds);
    const now = Date.now();

    return plans.map((plan) => {
      const assigneeCount = plan.assignments.length;
      const courseCount = plan.courses.length;
      const total = assigneeCount * courseCount;
      let completed = 0;

      for (const assignment of plan.assignments) {
        for (const course of plan.courses) {
          if (completionMap.has(`${assignment.userId}:${course.courseId}`)) {
            completed += 1;
          }
        }
      }

      const completionRate = total === 0 ? 0 : Math.round((completed / total) * 100);
      const status = this.resolvePlanStatus(
        now,
        plan.startAt.getTime(),
        plan.endAt.getTime()
      );

      return {
        id: plan.id,
        name: plan.name,
        startAt: plan.startAt.toISOString(),
        endAt: plan.endAt.toISOString(),
        courseCount,
        assigneeCount,
        completionRate,
        status
      };
    });
  }

  async createTrainingPlan(
    payload: CreateAdminTrainingPlanRequest
  ): Promise<AdminTrainingPlanListItem> {
    const courseIds = Array.from(new Set(payload.courseIds));
    const assigneeUserIds = Array.from(new Set(payload.assigneeUserIds));
    if (courseIds.length === 0) {
      throw new BadRequestException("courseIds cannot be empty");
    }
    if (assigneeUserIds.length === 0) {
      throw new BadRequestException("assigneeUserIds cannot be empty");
    }

    const startAt = new Date(payload.startAt);
    const endAt = new Date(payload.endAt);
    if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
      throw new BadRequestException("Invalid startAt or endAt");
    }
    if (startAt.getTime() >= endAt.getTime()) {
      throw new BadRequestException("startAt must be before endAt");
    }

    const [courses, users] = await Promise.all([
      this.prisma.course.findMany({
        where: { id: { in: courseIds } },
        select: { id: true }
      }),
      this.prisma.user.findMany({
        where: {
          id: { in: assigneeUserIds },
          role: { in: ["employee", "manager", "trainer"] }
        },
        select: { id: true }
      })
    ]);

    if (courses.length !== courseIds.length) {
      throw new BadRequestException("Some courseIds do not exist");
    }
    if (users.length !== assigneeUserIds.length) {
      throw new BadRequestException("Some assigneeUserIds do not exist");
    }

    const created = await this.prisma.$transaction(async (tx) => {
      const plan = await tx.trainingPlan.create({
        data: {
          name: payload.name.trim(),
          startAt,
          endAt
        }
      });

      await tx.trainingPlanCourse.createMany({
        data: courseIds.map((courseId) => ({
          planId: plan.id,
          courseId
        }))
      });

      await tx.trainingPlanAssignment.createMany({
        data: assigneeUserIds.map((userId) => ({
          planId: plan.id,
          userId
        }))
      });

      return plan;
    });

    return {
      id: created.id,
      name: created.name,
      startAt: created.startAt.toISOString(),
      endAt: created.endAt.toISOString(),
      courseCount: courseIds.length,
      assigneeCount: assigneeUserIds.length,
      completionRate: 0,
      status: this.resolvePlanStatus(Date.now(), startAt.getTime(), endAt.getTime())
    };
  }

  async getReportOverview(): Promise<AdminReportOverview> {
    const employees = await this.prisma.user.findMany({
      where: {
        role: { in: ["employee", "manager", "trainer"] },
        isActive: true
      },
      select: { id: true }
    });
    const userIds = employees.map((item) => item.id);

    const [requiredCourses, examAttempts, publishedCourses, trainingPlans] =
      await Promise.all([
        this.prisma.course.findMany({
          where: {
            requirement: "required",
            status: "published"
          },
          select: { id: true }
        }),
        this.prisma.examAttempt.findMany({
          where: {
            submittedAt: { not: null },
            userId: { in: userIds }
          },
          select: {
            score: true,
            exam: {
              select: { passScore: true }
            },
            userId: true
          }
        }),
        this.prisma.course.count({
          where: { status: "published" }
        }),
        this.prisma.trainingPlan.findMany({
          select: { startAt: true, endAt: true }
        })
      ]);

    const requiredCourseIds = requiredCourses.map((course) => course.id);
    const completionMap = await this.getCourseCompletionMap(userIds, requiredCourseIds);
    const totalRequiredAssignments = userIds.length * requiredCourseIds.length;
    const completionRate =
      totalRequiredAssignments === 0
        ? 0
        : Math.round((completionMap.size / totalRequiredAssignments) * 100);

    const passedExamCount = examAttempts.filter((attempt) => {
      if (attempt.score === null) {
        return false;
      }
      return attempt.score >= attempt.exam.passScore;
    }).length;
    const passRate =
      examAttempts.length === 0
        ? 0
        : Math.round((passedExamCount / examAttempts.length) * 100);

    const activeLearnerIds = new Set<string>();
    const [learnerProgress, learnerAttempts] = await Promise.all([
      this.prisma.learningProgress.findMany({
        where: { userId: { in: userIds } },
        select: { userId: true }
      }),
      this.prisma.examAttempt.findMany({
        where: { userId: { in: userIds } },
        select: { userId: true }
      })
    ]);
    for (const row of learnerProgress) {
      activeLearnerIds.add(row.userId);
    }
    for (const row of learnerAttempts) {
      activeLearnerIds.add(row.userId);
    }

    const now = Date.now();
    const activePlans = trainingPlans.filter((plan) => {
      return now >= plan.startAt.getTime() && now <= plan.endAt.getTime();
    }).length;

    return {
      totalUsers: userIds.length,
      activeLearners: activeLearnerIds.size,
      completionRate,
      passRate,
      publishedCourses,
      activePlans
    };
  }

  private async getCourseCompletionMap(
    userIds: string[],
    courseIds: string[]
  ): Promise<Set<string>> {
    if (userIds.length === 0 || courseIds.length === 0) {
      return new Set<string>();
    }

    const [courseLessons, completedRows] = await Promise.all([
      this.prisma.lesson.findMany({
        where: { courseId: { in: courseIds } },
        select: { courseId: true, id: true }
      }),
      this.prisma.learningProgress.findMany({
        where: {
          userId: { in: userIds },
          courseId: { in: courseIds },
          completed: true
        },
        select: { userId: true, courseId: true, lessonId: true }
      })
    ]);

    const requiredLessonCount = new Map<string, number>();
    for (const row of courseLessons) {
      requiredLessonCount.set(
        row.courseId,
        (requiredLessonCount.get(row.courseId) ?? 0) + 1
      );
    }

    const progressCount = new Map<string, Set<string>>();
    for (const row of completedRows) {
      const key = `${row.userId}:${row.courseId}`;
      if (!progressCount.has(key)) {
        progressCount.set(key, new Set<string>());
      }
      progressCount.get(key)?.add(row.lessonId);
    }

    const completedMap = new Set<string>();
    for (const [key, lessons] of progressCount.entries()) {
      const courseId = key.split(":")[1];
      const expected = requiredLessonCount.get(courseId) ?? 0;
      if (expected > 0 && lessons.size >= expected) {
        completedMap.add(key);
      }
    }

    return completedMap;
  }

  private resolvePlanStatus(
    nowMs: number,
    startMs: number,
    endMs: number
  ): "pending" | "active" | "completed" {
    if (nowMs < startMs) {
      return "pending";
    }
    if (nowMs > endMs) {
      return "completed";
    }
    return "active";
  }

  private formatDateOnly(date: Date): string {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Shanghai",
      year: "numeric",
      month: "2-digit",
      day: "2-digit"
    }).formatToParts(date);

    const year = parts.find((part) => part.type === "year")?.value ?? "1970";
    const month = parts.find((part) => part.type === "month")?.value ?? "01";
    const day = parts.find((part) => part.type === "day")?.value ?? "01";
    return `${year}-${month}-${day}`;
  }
}
