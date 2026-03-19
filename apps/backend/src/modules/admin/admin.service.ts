import { randomUUID } from "crypto";
import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import { Prisma } from "@prisma/client";
import type {
  AdminAuditLogItem,
  AdminCourseListItem,
  AdminExamListItem,
  AdminNotificationItem,
  AdminQuestionBankItem,
  AdminReportOverview,
  AdminTrainingPlanListItem,
  AdminWrongAnswerAnalysisItem,
  CreateAdminCourseRequest,
  CreateAdminExamRequest,
  CreateAdminExamRetakeRequest,
  CreateAdminExamRetakeResponse,
  CreateAdminNotificationRequest,
  CreateAdminQuestionBankRequest,
  CreateAdminTrainingPlanRequest,
  ExamQuestion,
  PublishAdminCourseResponse,
  RunAdminReminderResponse,
  UserProfile
} from "@logistics/shared";
import { PrismaService } from "../database/prisma.service";

type ReportFilter = {
  organizationName?: string;
  positionName?: string;
};

type QuestionBankFilter = {
  type?: "single" | "multiple" | "boolean" | "case";
  knowledgeTag?: string;
  difficulty?: "easy" | "medium" | "hard";
};

type AuditFilter = {
  action?: string;
  entityType?: string;
};

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

  async createCourse(
    payload: CreateAdminCourseRequest,
    actorUserId: string | null
  ): Promise<AdminCourseListItem> {
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

    await this.createAuditLog(actorUserId, {
      action: "course.create",
      entityType: "course",
      entityId: course.id,
      detail: {
        title: course.title,
        category: course.category
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

  async publishCourse(
    courseId: string,
    actorUserId: string | null
  ): Promise<PublishAdminCourseResponse> {
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

    await this.createAuditLog(actorUserId, {
      action: "course.publish",
      entityType: "course",
      entityId: courseId,
      detail: {
        publishedAt: publishedAt.toISOString()
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
    payload: CreateAdminTrainingPlanRequest,
    actorUserId: string | null
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

    await this.createAuditLog(actorUserId, {
      action: "training-plan.create",
      entityType: "trainingPlan",
      entityId: created.id,
      detail: {
        courseCount: courseIds.length,
        assigneeCount: assigneeUserIds.length
      }
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

  async getReportOverview(filters: ReportFilter): Promise<AdminReportOverview> {
    const employees = await this.selectUsersByFilter(filters);
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

  async getWrongAnswerAnalysis(
    filters: ReportFilter
  ): Promise<AdminWrongAnswerAnalysisItem[]> {
    const users = await this.selectUsersByFilter(filters);
    const userIds = users.map((item) => item.id);
    if (userIds.length === 0) {
      return [];
    }

    const attempts = await this.prisma.examAttempt.findMany({
      where: {
        userId: { in: userIds },
        submittedAt: { not: null }
      },
      select: {
        answers: true,
        exam: {
          select: {
            questions: true
          }
        }
      }
    });

    const stats = new Map<string, { wrong: number; total: number }>();
    for (const attempt of attempts) {
      const questions = this.parseExamQuestions(attempt.exam.questions);
      const answers = this.parseAnswerMap(attempt.answers);

      for (const question of questions) {
        const key = question.knowledgeTag || "未分类";
        if (!stats.has(key)) {
          stats.set(key, { wrong: 0, total: 0 });
        }

        const row = stats.get(key);
        if (!row) {
          continue;
        }

        row.total += 1;
        const current = answers[question.id] ?? [];
        if (!this.isSameAnswer(current, question.correctOptionIds)) {
          row.wrong += 1;
        }
      }
    }

    return Array.from(stats.entries())
      .map(([knowledgeTag, row]) => ({
        knowledgeTag,
        wrongCount: row.wrong,
        totalCount: row.total,
        wrongRate: row.total === 0 ? 0 : Math.round((row.wrong / row.total) * 100)
      }))
      .sort((a, b) => {
        if (b.wrongRate !== a.wrongRate) {
          return b.wrongRate - a.wrongRate;
        }
        return b.wrongCount - a.wrongCount;
      })
      .slice(0, 10);
  }

  async getQuestionBank(filters: QuestionBankFilter): Promise<AdminQuestionBankItem[]> {
    const questions = await this.prisma.questionBank.findMany({
      where: {
        type: filters.type,
        knowledgeTag: filters.knowledgeTag,
        difficulty: filters.difficulty
      },
      orderBy: { createdAt: "desc" }
    });

    return questions.map((question) => ({
      id: question.id,
      stem: question.stem,
      type: question.type,
      knowledgeTag: question.knowledgeTag,
      difficulty: question.difficulty,
      isActive: question.isActive,
      optionCount: this.parseOptionList(question.options).length,
      createdAt: question.createdAt.toISOString()
    }));
  }

  async createQuestion(
    payload: CreateAdminQuestionBankRequest,
    actorUserId: string | null
  ): Promise<AdminQuestionBankItem> {
    const options = payload.options.map((label, index) => ({
      id: String.fromCharCode(65 + index),
      label: label.trim()
    }));

    if (options.length < 2) {
      throw new BadRequestException("At least 2 options required");
    }

    const optionIds = new Set(options.map((option) => option.id));
    const correctOptionIds = Array.from(
      new Set(payload.correctOptionIds.map((item) => item.trim()))
    );
    if (correctOptionIds.length === 0) {
      throw new BadRequestException("At least 1 correct option required");
    }
    if (correctOptionIds.some((id) => !optionIds.has(id))) {
      throw new BadRequestException("correctOptionIds contains unknown option id");
    }

    const created = await this.prisma.questionBank.create({
      data: {
        stem: payload.stem.trim(),
        type: payload.type,
        options,
        correctOptionIds,
        knowledgeTag: payload.knowledgeTag.trim(),
        difficulty: payload.difficulty,
        isActive: true,
        createdBy: actorUserId ?? undefined
      }
    });

    await this.createAuditLog(actorUserId, {
      action: "question.create",
      entityType: "question",
      entityId: created.id,
      detail: {
        type: created.type,
        knowledgeTag: created.knowledgeTag
      }
    });

    return {
      id: created.id,
      stem: created.stem,
      type: created.type,
      knowledgeTag: created.knowledgeTag,
      difficulty: created.difficulty,
      isActive: created.isActive,
      optionCount: options.length,
      createdAt: created.createdAt.toISOString()
    };
  }

  async updateQuestionStatus(
    questionId: string,
    isActive: boolean,
    actorUserId: string | null
  ): Promise<AdminQuestionBankItem> {
    const existing = await this.prisma.questionBank.findUnique({
      where: { id: questionId }
    });
    if (!existing) {
      throw new NotFoundException(`Question ${questionId} not found`);
    }

    const updated = await this.prisma.questionBank.update({
      where: { id: questionId },
      data: { isActive }
    });

    await this.createAuditLog(actorUserId, {
      action: "question.status.update",
      entityType: "question",
      entityId: questionId,
      detail: {
        isActive
      }
    });

    return {
      id: updated.id,
      stem: updated.stem,
      type: updated.type,
      knowledgeTag: updated.knowledgeTag,
      difficulty: updated.difficulty,
      isActive: updated.isActive,
      optionCount: this.parseOptionList(updated.options).length,
      createdAt: updated.createdAt.toISOString()
    };
  }

  async getAdminExams(): Promise<AdminExamListItem[]> {
    const exams = await this.prisma.exam.findMany({
      orderBy: { startTime: "desc" },
      include: {
        _count: {
          select: {
            assignments: true
          }
        }
      }
    });

    return exams.map((exam) => ({
      id: exam.id,
      name: exam.name,
      durationMinutes: exam.durationMinutes,
      passScore: exam.passScore,
      questionCount: this.parseExamQuestions(exam.questions).length,
      startTime: exam.startTime.toISOString(),
      assigneeCount: exam._count.assignments,
      isRetake: exam.isRetake,
      sourceExamId: exam.sourceExamId ?? null
    }));
  }

  async createAdminExam(
    payload: CreateAdminExamRequest,
    actorUserId: string | null
  ): Promise<AdminExamListItem> {
    const startTime = new Date(payload.startTime);
    if (Number.isNaN(startTime.getTime())) {
      throw new BadRequestException("Invalid startTime");
    }

    const totalQuestionCount =
      payload.rule.singleCount +
      payload.rule.multipleCount +
      payload.rule.booleanCount +
      payload.rule.caseCount;
    if (totalQuestionCount <= 0) {
      throw new BadRequestException("Question count must be greater than 0");
    }

    const [singlePool, multiplePool, booleanPool, casePool] = await Promise.all([
      this.getQuestionPool("single", payload.rule),
      this.getQuestionPool("multiple", payload.rule),
      this.getQuestionPool("boolean", payload.rule),
      this.getQuestionPool("case", payload.rule)
    ]);

    const selected = [
      ...this.pickRandom(singlePool, payload.rule.singleCount),
      ...this.pickRandom(multiplePool, payload.rule.multipleCount),
      ...this.pickRandom(booleanPool, payload.rule.booleanCount),
      ...this.pickRandom(casePool, payload.rule.caseCount)
    ];

    const assigneeUserIds = Array.from(new Set(payload.assigneeUserIds));
    if (assigneeUserIds.length > 0) {
      const users = await this.prisma.user.findMany({
        where: {
          id: { in: assigneeUserIds },
          role: { in: ["employee", "manager", "trainer"] },
          isActive: true
        },
        select: { id: true }
      });
      if (users.length !== assigneeUserIds.length) {
        throw new BadRequestException("Some assigneeUserIds do not exist");
      }
    }

    const examId = `EX-${randomUUID().slice(0, 8).toUpperCase()}`;
    const snapshotQuestions: ExamQuestion[] = selected.map((question) => ({
      id: `QB-${question.id}`,
      type: question.type,
      stem: question.stem,
      options: this.parseOptionList(question.options),
      correctOptionIds: this.parseStringArray(question.correctOptionIds),
      knowledgeTag: question.knowledgeTag
    }));

    await this.prisma.$transaction(async (tx) => {
      await tx.exam.create({
        data: {
          id: examId,
          name: payload.name.trim(),
          durationMinutes: payload.durationMinutes,
          startTime,
          passScore: payload.passScore,
          instructions: payload.instructions.trim(),
          warnings: payload.warnings,
          questions: snapshotQuestions as unknown as Prisma.InputJsonValue,
          createdBy: actorUserId ?? undefined
        }
      });

      if (assigneeUserIds.length > 0) {
        await tx.examAssignment.createMany({
          data: assigneeUserIds.map((userId) => ({
            examId,
            userId,
            isRetake: false
          }))
        });
      }
    });

    await this.createAuditLog(actorUserId, {
      action: "exam.create",
      entityType: "exam",
      entityId: examId,
      detail: {
        questionCount: snapshotQuestions.length,
        assigneeCount: assigneeUserIds.length
      }
    });

    return {
      id: examId,
      name: payload.name.trim(),
      durationMinutes: payload.durationMinutes,
      passScore: payload.passScore,
      questionCount: snapshotQuestions.length,
      startTime: startTime.toISOString(),
      assigneeCount: assigneeUserIds.length,
      isRetake: false,
      sourceExamId: null
    };
  }

  async createRetakeExam(
    examId: string,
    payload: CreateAdminExamRetakeRequest,
    actorUserId: string | null
  ): Promise<CreateAdminExamRetakeResponse> {
    const sourceExam = await this.prisma.exam.findUnique({
      where: { id: examId }
    });
    if (!sourceExam) {
      throw new NotFoundException(`Exam ${examId} not found`);
    }
    if (sourceExam.isRetake) {
      throw new BadRequestException("Retake exam cannot be used as source exam");
    }

    const userIds = Array.from(new Set(payload.userIds));
    const users = await this.prisma.user.findMany({
      where: {
        id: { in: userIds },
        role: { in: ["employee", "manager", "trainer"] },
        isActive: true
      },
      select: { id: true }
    });
    if (users.length !== userIds.length) {
      throw new BadRequestException("Some userIds do not exist");
    }

    const [submittedAttempts, existingRetakeAssignments] = await Promise.all([
      this.prisma.examAttempt.findMany({
        where: {
          examId: sourceExam.id,
          userId: { in: userIds },
          submittedAt: { not: null }
        },
        select: {
          userId: true,
          score: true
        }
      }),
      this.prisma.examAssignment.findMany({
        where: {
          userId: { in: userIds },
          sourceExamId: sourceExam.id,
          isRetake: true
        },
        select: {
          userId: true
        }
      })
    ]);

    const failedUserIds = new Set(
      submittedAttempts
        .filter((attempt) => attempt.score !== null && attempt.score < sourceExam.passScore)
        .map((attempt) => attempt.userId)
    );
    const ineligibleUserIds = userIds.filter((userId) => !failedUserIds.has(userId));
    if (ineligibleUserIds.length > 0) {
      throw new BadRequestException(
        `Users are not eligible for retake: ${ineligibleUserIds.join(", ")}`
      );
    }

    const duplicatedUserIds = Array.from(
      new Set(existingRetakeAssignments.map((item) => item.userId))
    );
    if (duplicatedUserIds.length > 0) {
      throw new BadRequestException(
        `Users already have retake assignment: ${duplicatedUserIds.join(", ")}`
      );
    }

    const startTime = new Date(payload.startTime);
    if (Number.isNaN(startTime.getTime())) {
      throw new BadRequestException("Invalid startTime");
    }

    const retakeExamId = `EX-R-${randomUUID().slice(0, 8).toUpperCase()}`;
    const retakeName = `${sourceExam.name}（补考）`;

    await this.prisma.$transaction(async (tx) => {
      const warningsJson =
        sourceExam.warnings === null
          ? Prisma.JsonNull
          : (sourceExam.warnings as Prisma.InputJsonValue);
      const questionsJson =
        sourceExam.questions === null
          ? Prisma.JsonNull
          : (sourceExam.questions as Prisma.InputJsonValue);

      await tx.exam.create({
        data: {
          id: retakeExamId,
          name: retakeName,
          durationMinutes: payload.durationMinutes ?? sourceExam.durationMinutes,
          startTime,
          passScore: payload.passScore ?? sourceExam.passScore,
          instructions: sourceExam.instructions,
          warnings: warningsJson,
          questions: questionsJson,
          isRetake: true,
          sourceExamId: sourceExam.id,
          createdBy: actorUserId ?? undefined
        }
      });

      await tx.examAssignment.createMany({
        data: userIds.map((userId) => ({
          examId: retakeExamId,
          userId,
          isRetake: true,
          sourceExamId: sourceExam.id
        }))
      });
    });

    await this.publishNotification(
      {
        title: `补考通知：${retakeName}`,
        content: `请于 ${startTime.toLocaleString("zh-CN", {
          timeZone: "Asia/Shanghai"
        })} 参加补考。`,
        pinned: true,
        userIds
      },
      actorUserId,
      "retake"
    );

    await this.createAuditLog(actorUserId, {
      action: "exam.retake.create",
      entityType: "exam",
      entityId: retakeExamId,
      detail: {
        sourceExamId: sourceExam.id,
        assigneeCount: userIds.length
      }
    });

    return {
      examId: retakeExamId,
      name: retakeName,
      assigneeCount: userIds.length,
      startTime: startTime.toISOString()
    };
  }

  async getAdminNotifications(): Promise<AdminNotificationItem[]> {
    const notifications = await this.prisma.notification.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        userNotifications: {
          select: { readAt: true }
        }
      }
    });

    return notifications.map((notification) => {
      const totalCount = notification.userNotifications.length;
      const readCount = notification.userNotifications.filter((item) => item.readAt).length;
      return {
        id: notification.id,
        title: notification.title,
        content: notification.content,
        pinned: notification.pinned,
        sourceType: notification.sourceType,
        readCount,
        totalCount,
        createdAt: notification.createdAt.toISOString()
      };
    });
  }

  async publishNotification(
    payload: CreateAdminNotificationRequest,
    actorUserId: string | null,
    sourceType = "manual"
  ): Promise<AdminNotificationItem> {
    const targetUserIds =
      payload.userIds.length > 0
        ? Array.from(new Set(payload.userIds))
        : (
            await this.prisma.user.findMany({
              where: {
                isActive: true,
                role: { in: ["employee", "manager", "trainer"] }
              },
              select: { id: true }
            })
          ).map((item) => item.id);

    const users = await this.prisma.user.findMany({
      where: {
        id: { in: targetUserIds },
        isActive: true
      },
      select: { id: true }
    });
    if (users.length === 0) {
      throw new BadRequestException("No target users available");
    }

    const notification = await this.prisma.notification.create({
      data: {
        id: `N-${randomUUID().slice(0, 8).toUpperCase()}`,
        title: payload.title.trim(),
        content: payload.content.trim(),
        pinned: payload.pinned === true,
        sourceType
      }
    });

    await this.deliverNotification(notification.id, users.map((item) => item.id));

    await this.createAuditLog(actorUserId, {
      action: "notification.publish",
      entityType: "notification",
      entityId: notification.id,
      detail: {
        targetCount: users.length,
        sourceType
      }
    });

    return {
      id: notification.id,
      title: notification.title,
      content: notification.content,
      pinned: notification.pinned,
      sourceType: notification.sourceType,
      readCount: 0,
      totalCount: users.length,
      createdAt: notification.createdAt.toISOString()
    };
  }

  async runReminderJobs(actorUserId: string | null): Promise<RunAdminReminderResponse> {
    const now = new Date();
    const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const activeUsers = await this.prisma.user.findMany({
      where: {
        isActive: true,
        role: { in: ["employee", "manager", "trainer"] }
      },
      select: { id: true }
    });
    const userIds = activeUsers.map((user) => user.id);

    let overdueCourseCount = 0;
    let upcomingExamCount = 0;
    let retakeCount = 0;

    const requiredCourses = await this.prisma.course.findMany({
      where: {
        status: "published",
        requirement: "required",
        dueDate: { lt: now }
      },
      select: {
        id: true,
        title: true,
        dueDate: true
      }
    });
    const completionMap = await this.getCourseCompletionMap(
      userIds,
      requiredCourses.map((item) => item.id)
    );

    const dayKey = this.formatDateOnly(now);
    for (const userId of userIds) {
      for (const course of requiredCourses) {
        if (completionMap.has(`${userId}:${course.id}`)) {
          continue;
        }

        const sourceKey = `reminder:overdue:${userId}:${course.id}:${dayKey}`;
        const created = await this.createReminderNotification({
          sourceKey,
          sourceType: "overdue-course",
          userId,
          title: `学习逾期提醒：${course.title}`,
          content: `课程已逾期（截止 ${this.formatDateOnly(course.dueDate)}），请尽快完成学习。`
        });
        if (created) {
          overdueCourseCount += 1;
        }
      }
    }

    const normalExams = await this.prisma.exam.findMany({
      where: {
        isRetake: false,
        startTime: {
          gte: now,
          lte: in24h
        }
      },
      include: {
        assignments: {
          select: { userId: true }
        }
      }
    });
    const submitted = await this.prisma.examAttempt.findMany({
      where: {
        submittedAt: { not: null },
        examId: { in: normalExams.map((exam) => exam.id) },
        userId: { in: userIds }
      },
      select: {
        examId: true,
        userId: true
      }
    });
    const submittedSet = new Set(submitted.map((item) => `${item.userId}:${item.examId}`));

    for (const exam of normalExams) {
      const targetUserIds =
        exam.assignments.length > 0
          ? exam.assignments.map((item) => item.userId)
          : userIds;

      for (const userId of targetUserIds) {
        if (submittedSet.has(`${userId}:${exam.id}`)) {
          continue;
        }
        const sourceKey = `reminder:exam:${userId}:${exam.id}:${this.formatDateOnly(exam.startTime)}`;
        const created = await this.createReminderNotification({
          sourceKey,
          sourceType: "upcoming-exam",
          userId,
          title: `开考提醒：${exam.name}`,
          content: `考试将在 ${exam.startTime.toLocaleString("zh-CN", {
            timeZone: "Asia/Shanghai"
          })} 开始，请提前准备。`
        });
        if (created) {
          upcomingExamCount += 1;
        }
      }
    }

    const retakeExams = await this.prisma.exam.findMany({
      where: {
        isRetake: true,
        startTime: {
          gte: now,
          lte: in24h
        }
      },
      include: {
        assignments: {
          select: {
            userId: true
          }
        }
      }
    });

    for (const exam of retakeExams) {
      for (const assignment of exam.assignments) {
        const sourceKey = `reminder:retake:${assignment.userId}:${exam.id}:${this.formatDateOnly(exam.startTime)}`;
        const created = await this.createReminderNotification({
          sourceKey,
          sourceType: "retake",
          userId: assignment.userId,
          title: `补考提醒：${exam.name}`,
          content: `补考将在 ${exam.startTime.toLocaleString("zh-CN", {
            timeZone: "Asia/Shanghai"
          })} 开始，请准时参加。`
        });
        if (created) {
          retakeCount += 1;
        }
      }
    }

    const generatedCount = overdueCourseCount + upcomingExamCount + retakeCount;
    await this.createAuditLog(actorUserId, {
      action: "reminder.run",
      entityType: "notification",
      entityId: "batch",
      detail: {
        generatedCount,
        overdueCourseCount,
        upcomingExamCount,
        retakeCount
      }
    });

    return {
      generatedCount,
      overdueCourseCount,
      upcomingExamCount,
      retakeCount
    };
  }

  async getAuditLogs(filters: AuditFilter): Promise<AdminAuditLogItem[]> {
    const logs = await this.prisma.auditLog.findMany({
      where: {
        action: filters.action,
        entityType: filters.entityType
      },
      include: {
        actorUser: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 200
    });

    return logs.map((log) => ({
      id: log.id,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId,
      actorUserId: log.actorUser?.id ?? null,
      actorName: log.actorUser?.name ?? null,
      createdAt: log.createdAt.toISOString()
    }));
  }

  private async selectUsersByFilter(filters: ReportFilter) {
    return this.prisma.user.findMany({
      where: {
        role: { in: ["employee", "manager", "trainer"] },
        isActive: true,
        organizationName: filters.organizationName || undefined,
        positionName: filters.positionName || undefined
      },
      select: { id: true }
    });
  }

  private getQuestionPool(
    type: ExamQuestion["type"],
    rule: CreateAdminExamRequest["rule"]
  ) {
    return this.prisma.questionBank.findMany({
      where: {
        isActive: true,
        type,
        difficulty: rule.difficulty || undefined,
        knowledgeTag:
          rule.knowledgeTags && rule.knowledgeTags.length > 0
            ? { in: rule.knowledgeTags }
            : undefined
      }
    });
  }

  private pickRandom<T>(items: T[], count: number): T[] {
    if (count === 0) {
      return [];
    }
    if (items.length < count) {
      throw new BadRequestException("Question pool does not satisfy rule counts");
    }

    const copied = [...items];
    for (let i = copied.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copied[i], copied[j]] = [copied[j], copied[i]];
    }

    return copied.slice(0, count);
  }

  private parseOptionList(raw: unknown): Array<{ id: string; label: string }> {
    if (!Array.isArray(raw)) {
      return [];
    }

    return raw
      .map((item) => {
        if (!item || typeof item !== "object") {
          return null;
        }
        const option = item as { id?: unknown; label?: unknown };
        if (typeof option.id !== "string" || typeof option.label !== "string") {
          return null;
        }
        return {
          id: option.id,
          label: option.label
        };
      })
      .filter((item): item is { id: string; label: string } => item !== null);
  }

  private parseStringArray(raw: unknown): string[] {
    if (!Array.isArray(raw)) {
      return [];
    }

    return raw.filter((item): item is string => typeof item === "string");
  }

  private parseExamQuestions(raw: unknown): ExamQuestion[] {
    if (!Array.isArray(raw)) {
      return [];
    }

    return raw
      .map((item): ExamQuestion | null => {
        if (!item || typeof item !== "object") {
          return null;
        }
        const question = item as Record<string, unknown>;
        if (
          typeof question.id !== "string" ||
          typeof question.type !== "string" ||
          typeof question.stem !== "string" ||
          !Array.isArray(question.options) ||
          !Array.isArray(question.correctOptionIds) ||
          typeof question.knowledgeTag !== "string"
        ) {
          return null;
        }

        return {
          id: question.id,
          type: question.type as ExamQuestion["type"],
          stem: question.stem,
          options: this.parseOptionList(question.options),
          correctOptionIds: this.parseStringArray(question.correctOptionIds),
          knowledgeTag: question.knowledgeTag
        };
      })
      .filter((item): item is ExamQuestion => item !== null);
  }

  private parseAnswerMap(raw: unknown): Record<string, string[]> {
    if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
      return {};
    }

    const result: Record<string, string[]> = {};
    for (const [key, value] of Object.entries(raw)) {
      if (typeof key !== "string" || !Array.isArray(value)) {
        continue;
      }
      result[key] = value.filter((item): item is string => typeof item === "string");
    }

    return result;
  }

  private isSameAnswer(current: string[], correct: string[]): boolean {
    const a = [...current].sort();
    const b = [...correct].sort();
    if (a.length !== b.length) {
      return false;
    }
    return a.every((item, index) => item === b[index]);
  }

  private async deliverNotification(notificationId: string, userIds: string[]) {
    await this.prisma.userNotification.createMany({
      data: userIds.map((userId) => ({
        userId,
        notificationId,
        readAt: null
      })),
      skipDuplicates: true
    });
  }

  private async createReminderNotification(input: {
    sourceKey: string;
    sourceType: string;
    userId: string;
    title: string;
    content: string;
  }): Promise<boolean> {
    const existing = await this.prisma.notification.findUnique({
      where: { sourceKey: input.sourceKey },
      select: { id: true }
    });

    let notificationId = existing?.id;
    if (!notificationId) {
      const created = await this.prisma.notification.create({
        data: {
          id: `N-${randomUUID().slice(0, 8).toUpperCase()}`,
          title: input.title,
          content: input.content,
          pinned: false,
          sourceType: input.sourceType,
          sourceKey: input.sourceKey
        },
        select: { id: true }
      });
      notificationId = created.id;
    }

    await this.deliverNotification(notificationId, [input.userId]);
    return !existing;
  }

  private async createAuditLog(
    actorUserId: string | null,
    input: {
      action: string;
      entityType: string;
      entityId: string;
      detail: Prisma.InputJsonObject;
    }
  ) {
    await this.prisma.auditLog.create({
      data: {
        actorUserId: actorUserId ?? undefined,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId,
        detail: input.detail
      }
    });
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
