import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException
} from "@nestjs/common";
import type { CourseRequirement, Prisma } from "@prisma/client";
import type {
  CourseDetail,
  CourseListItem,
  DashboardSummary,
  DashboardTask,
  ExamDetail,
  ExamListItem,
  ExamQuestion,
  ExamReviewItem,
  KnowledgeArticleDetail,
  KnowledgeArticleListItem,
  LearningPathListItem,
  LessonDetail,
  MarkAllNotificationsReadResponse,
  MarkNotificationReadResponse,
  MyProgressOverview,
  SaveExamDraftRequest,
  SaveExamDraftResponse,
  SaveLessonProgressRequest,
  SaveLessonProgressResponse,
  SubmitExamRequest,
  SubmitExamResponse,
  UserNotificationItem
} from "@logistics/shared";
import { PrismaService } from "../database/prisma.service";

type LessonWithUserProgress = {
  id: string;
  title: string;
  courseId: string;
  contentType: LessonDetail["contentType"];
  content: string;
  totalSeconds: number;
  sortOrder: number;
  learningProgress: Array<{
    positionSeconds: number;
    completed: boolean;
  }>;
};

type CourseWithLessons = {
  id: string;
  title: string;
  category: string;
  durationMinutes: number;
  requirement: CourseRequirement;
  dueDate: Date;
  description: string;
  roles: Prisma.JsonValue;
  completionRule: string;
  attachments: Prisma.JsonValue;
  lessons: LessonWithUserProgress[];
};

@Injectable()
export class LearningService {
  constructor(
    @Inject(PrismaService)
    private readonly prisma: PrismaService
  ) {}

  async getDashboardSummary(userId: string): Promise<DashboardSummary> {
    const courses = await this.getCoursesWithUserProgress(userId);

    const requiredCourses = courses.filter(
      (course) => course.requirement === "required"
    );
    const completedRequired = requiredCourses.filter(
      (course) => this.getCourseProgressFromLessons(course.lessons) >= 100
    ).length;
    const pendingCourses = requiredCourses.length - completedRequired;
    const pendingExams = (await this.getExams(userId)).filter(
      (exam) => exam.status === "pending"
    ).length;

    return {
      completionRate:
        requiredCourses.length === 0
          ? 0
          : Math.round((completedRequired / requiredCourses.length) * 100),
      pendingCourses,
      pendingExams,
      completedCourses: courses.filter(
        (course) => this.getCourseProgressFromLessons(course.lessons) >= 100
      ).length
    };
  }

  async getDashboardTasks(userId: string): Promise<DashboardTask[]> {
    const tasks: DashboardTask[] = [];

    const requiredCourses = (await this.getCoursesWithUserProgress(userId))
      .filter((course) => course.requirement === "required")
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());

    const nextCourse = requiredCourses.find(
      (course) => this.getCourseProgressFromLessons(course.lessons) < 100
    );
    if (nextCourse) {
      const nextCourseProgress = this.getCourseProgressFromLessons(nextCourse.lessons);
      tasks.push({
        id: `task-${nextCourse.id}`,
        title: nextCourse.title,
        type: "course",
        status: this.progressToStatus(nextCourseProgress),
        dueDate: this.formatDateOnly(nextCourse.dueDate)
      });
    }

    const pendingExam = (await this.getExams(userId))
      .filter((exam) => exam.status === "pending")
      .sort(
        (a, b) =>
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      )[0];
    if (pendingExam) {
      tasks.push({
        id: `task-${pendingExam.id}`,
        title: pendingExam.name,
        type: "exam",
        status: "todo",
        dueDate: this.formatDateOnly(new Date(pendingExam.startTime))
      });
    }

    tasks.push({
      id: "task-sop-1",
      title: "复习《异常件闭环处理流程》",
      type: "sop",
      status: "todo",
      dueDate: "2026-03-24"
    });

    return tasks;
  }

  async getCourses(userId: string): Promise<CourseListItem[]> {
    const courses = await this.getCoursesWithUserProgress(userId);
    return courses.map((course) => ({
      id: course.id,
      title: course.title,
      category: course.category,
      durationMinutes: course.durationMinutes,
      progress: this.getCourseProgressFromLessons(course.lessons),
      requirement: course.requirement,
      dueDate: this.formatDateOnly(course.dueDate)
    }));
  }

  async getCourse(userId: string, courseId: string): Promise<CourseDetail> {
    const course = await this.getCourseWithUserProgress(userId, courseId);

    return {
      id: course.id,
      title: course.title,
      category: course.category,
      durationMinutes: course.durationMinutes,
      progress: this.getCourseProgressFromLessons(course.lessons),
      requirement: course.requirement,
      dueDate: this.formatDateOnly(course.dueDate),
      description: course.description,
      roles: this.toStringArray(course.roles),
      completionRule: course.completionRule,
      attachments: this.toStringArray(course.attachments),
      chapters: course.lessons
        .sort((a, b) => a.sortOrder - b.sortOrder)
        .map((lesson) => {
          const progress = this.getLessonProgressFromRow(
            lesson.totalSeconds,
            lesson.learningProgress[0]
          );
          return {
            lessonId: lesson.id,
            title: lesson.title,
            contentType: lesson.contentType,
            progress,
            status: this.progressToStatus(progress)
          };
        })
    };
  }

  async getLesson(userId: string, lessonId: string): Promise<LessonDetail> {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: {
          select: {
            lessons: {
              select: { id: true },
              orderBy: { sortOrder: "asc" }
            }
          }
        },
        learningProgress: {
          where: { userId },
          take: 1,
          select: { positionSeconds: true, completed: true }
        }
      }
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson ${lessonId} not found`);
    }

    const progress = lesson.learningProgress[0];
    const positionSeconds = progress
      ? Math.min(progress.positionSeconds, lesson.totalSeconds)
      : 0;
    const completed = progress ? progress.completed : false;
    const lessonIds = lesson.course.lessons.map((item) => item.id);
    const currentIndex = lessonIds.findIndex((id) => id === lesson.id);

    return {
      id: lesson.id,
      courseId: lesson.courseId,
      title: lesson.title,
      contentType: lesson.contentType,
      content: lesson.content,
      totalSeconds: lesson.totalSeconds,
      positionSeconds,
      completed,
      autoSaveIntervalSeconds: 30,
      previousLessonId: currentIndex > 0 ? lessonIds[currentIndex - 1] : null,
      nextLessonId:
        currentIndex >= 0 && currentIndex < lessonIds.length - 1
          ? lessonIds[currentIndex + 1]
          : null
    };
  }

  async saveLessonProgress(
    userId: string,
    lessonId: string,
    payload: SaveLessonProgressRequest
  ): Promise<SaveLessonProgressResponse> {
    const lesson = await this.prisma.lesson.findUnique({
      where: { id: lessonId },
      select: { id: true, courseId: true, totalSeconds: true }
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson ${lessonId} not found`);
    }

    const positionSeconds = Math.min(
      Math.max(0, payload.positionSeconds),
      lesson.totalSeconds
    );
    const completed =
      payload.completed === true || positionSeconds >= lesson.totalSeconds;

    const saved = await this.prisma.learningProgress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId
        }
      },
      create: {
        userId,
        lessonId,
        courseId: lesson.courseId,
        positionSeconds: completed ? lesson.totalSeconds : positionSeconds,
        completed,
        lastLearnedAt: new Date()
      },
      update: {
        courseId: lesson.courseId,
        positionSeconds: completed ? lesson.totalSeconds : positionSeconds,
        completed,
        lastLearnedAt: new Date()
      }
    });

    return {
      positionSeconds: saved.positionSeconds,
      completed: saved.completed,
      courseProgress: await this.getCourseProgress(userId, lesson.courseId),
      savedAt: saved.updatedAt.toISOString()
    };
  }

  async getExams(userId: string): Promise<ExamListItem[]> {
    const exams = await this.prisma.exam.findMany({
      where: {
        OR: [
          {
            assignments: {
              none: {}
            }
          },
          {
            assignments: {
              some: { userId }
            }
          }
        ]
      },
      orderBy: { startTime: "asc" }
    });
    const attempts = await this.prisma.examAttempt.findMany({
      where: { userId }
    });
    const attemptByExamId = new Map(
      attempts.map((attempt) => [attempt.examId, attempt])
    );

    return exams.map((exam) => {
      const attempt = attemptByExamId.get(exam.id);
      return {
        id: exam.id,
        name: exam.name,
        durationMinutes: exam.durationMinutes,
        questionCount: this.parseQuestions(exam.questions).length,
        startTime: exam.startTime.toISOString(),
        status: attempt?.submittedAt ? "completed" : "pending",
        score: attempt?.score ?? null
      };
    });
  }

  async getKnowledgeArticles(): Promise<KnowledgeArticleListItem[]> {
    const articles = await this.prisma.knowledgeArticle.findMany({
      orderBy: [{ isHot: "desc" }, { updatedAt: "desc" }]
    });

    return articles.map((article) => ({
      id: article.id,
      title: article.title,
      category: article.category,
      summary: article.summary,
      updatedAt: article.updatedAt.toISOString(),
      isHot: article.isHot
    }));
  }

  async getKnowledgeArticle(articleId: string): Promise<KnowledgeArticleDetail> {
    const article = await this.prisma.knowledgeArticle.findUnique({
      where: { id: articleId }
    });

    if (!article) {
      throw new NotFoundException(`Knowledge article ${articleId} not found`);
    }

    return {
      id: article.id,
      title: article.title,
      category: article.category,
      summary: article.summary,
      content: article.content,
      tags: this.toStringArray(article.tags),
      relatedCourseIds: this.toStringArray(article.relatedCourseIds),
      updatedAt: article.updatedAt.toISOString(),
      isHot: article.isHot
    };
  }

  async getNotifications(userId: string): Promise<UserNotificationItem[]> {
    const notifications = await this.prisma.notification.findMany({
      where: {
        userNotifications: {
          some: { userId }
        }
      },
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
      include: {
        userNotifications: {
          where: { userId },
          select: { readAt: true },
          take: 1
        }
      }
    });

    return notifications.map((notification) => ({
      id: notification.id,
      title: notification.title,
      content: notification.content,
      createdAt: notification.createdAt.toISOString(),
      pinned: notification.pinned,
      unread: notification.userNotifications[0]?.readAt ? false : true
    }));
  }

  async markNotificationRead(
    userId: string,
    notificationId: string
  ): Promise<MarkNotificationReadResponse> {
    const existing = await this.prisma.userNotification.findUnique({
      where: {
        userId_notificationId: {
          userId,
          notificationId
        }
      },
      select: {
        readAt: true
      }
    });

    if (!existing) {
      throw new NotFoundException(
        `Notification ${notificationId} not found for user ${userId}`
      );
    }

    if (existing.readAt) {
      return {
        notificationId,
        readAt: existing.readAt.toISOString()
      };
    }

    const readAt = new Date();
    await this.prisma.userNotification.update({
      where: {
        userId_notificationId: {
          userId,
          notificationId
        }
      },
      data: {
        readAt
      }
    });

    return {
      notificationId,
      readAt: readAt.toISOString()
    };
  }

  async markAllNotificationsRead(
    userId: string
  ): Promise<MarkAllNotificationsReadResponse> {
    const readAt = new Date();
    const updated = await this.prisma.userNotification.updateMany({
      where: {
        userId,
        readAt: null
      },
      data: {
        readAt
      }
    });

    return {
      updatedCount: updated.count,
      readAt: readAt.toISOString()
    };
  }

  async getLearningPaths(userId: string): Promise<LearningPathListItem[]> {
    const plans = await this.prisma.trainingPlan.findMany({
      where: {
        assignments: {
          some: { userId }
        }
      },
      orderBy: [{ startAt: "asc" }, { createdAt: "asc" }],
      include: {
        courses: {
          select: {
            courseId: true
          }
        }
      }
    });

    if (plans.length === 0) {
      return [];
    }

    const uniqueCourseIds = Array.from(
      new Set(plans.flatMap((plan) => plan.courses.map((course) => course.courseId)))
    );
    const completedCourseIds = await this.getCompletedCourseIdSetByUser(
      userId,
      uniqueCourseIds
    );

    const now = Date.now();
    return plans.map((plan) => {
      const courseIds = plan.courses.map((course) => course.courseId);
      const completedCourseCount = courseIds.filter((courseId) =>
        completedCourseIds.has(courseId)
      ).length;
      const courseCount = courseIds.length;

      return {
        id: plan.id,
        name: plan.name,
        startAt: plan.startAt.toISOString(),
        endAt: plan.endAt.toISOString(),
        courseCount,
        completedCourseCount,
        completionRate:
          courseCount === 0
            ? 0
            : Math.round((completedCourseCount / courseCount) * 100),
        status: this.resolvePlanStatus(
          now,
          plan.startAt.getTime(),
          plan.endAt.getTime()
        )
      };
    });
  }

  async getMyProgress(userId: string): Promise<MyProgressOverview> {
    const courses = await this.getCoursesWithUserProgress(userId);
    const requiredCourses = courses.filter(
      (course) => course.requirement === "required"
    );
    const completedRequiredCourses = requiredCourses.filter(
      (course) => this.getCourseProgressFromLessons(course.lessons) >= 100
    ).length;

    const [progressRows, attempts] = await Promise.all([
      this.prisma.learningProgress.findMany({
        where: { userId },
        select: { positionSeconds: true }
      }),
      this.prisma.examAttempt.findMany({
        where: {
          userId,
          submittedAt: { not: null }
        },
        include: {
          exam: {
            select: { passScore: true }
          }
        }
      })
    ]);

    const totalLearnSeconds = progressRows.reduce(
      (sum, row) => sum + row.positionSeconds,
      0
    );
    const validScores = attempts
      .map((attempt) => attempt.score)
      .filter((score): score is number => score !== null);
    const averageExamScore =
      validScores.length === 0
        ? null
        : Math.round(
            validScores.reduce((sum, score) => sum + score, 0) / validScores.length
          );
    const passedExamCount = attempts.filter((attempt) => {
      if (attempt.score === null) {
        return false;
      }
      return attempt.score >= attempt.exam.passScore;
    }).length;

    return {
      totalLearnSeconds,
      completedCourseCount: courses.filter(
        (course) => this.getCourseProgressFromLessons(course.lessons) >= 100
      ).length,
      requiredCourseCount: requiredCourses.length,
      completionRate:
        requiredCourses.length === 0
          ? 0
          : Math.round((completedRequiredCourses / requiredCourses.length) * 100),
      averageExamScore,
      passedExamCount,
      totalExamCount: attempts.length
    };
  }

  async getExam(userId: string, examId: string): Promise<ExamDetail> {
    const exam = await this.getExamEntity(examId, userId);
    const attempt = await this.getOrCreateAttempt(userId, examId, exam.durationMinutes);
    const questions = this.parseQuestions(exam.questions);

    return {
      id: exam.id,
      name: exam.name,
      durationMinutes: exam.durationMinutes,
      questionCount: questions.length,
      startTime: exam.startTime.toISOString(),
      status: attempt.submittedAt ? "completed" : "pending",
      score: attempt.score,
      passScore: exam.passScore,
      instructions: exam.instructions,
      warnings: this.toStringArray(exam.warnings),
      attempt: {
        answers: this.parseAnswers(attempt.answers),
        currentQuestion: attempt.currentQuestion,
        remainingSeconds: attempt.remainingSeconds,
        savedAt: attempt.savedAt ? attempt.savedAt.toISOString() : null,
        submittedAt: attempt.submittedAt ? attempt.submittedAt.toISOString() : null,
        score: attempt.score
      },
      questions
    };
  }

  async saveExamDraft(
    userId: string,
    examId: string,
    payload: SaveExamDraftRequest
  ): Promise<SaveExamDraftResponse> {
    const exam = await this.getExamEntity(examId, userId);
    const questions = this.parseQuestions(exam.questions);
    const attempt = await this.getOrCreateAttempt(userId, exam.id, exam.durationMinutes);

    if (attempt.submittedAt) {
      throw new BadRequestException("Exam already submitted");
    }

    const normalizedAnswers = this.normalizeAnswers(payload.answers, questions);
    const now = new Date();
    const updatedAttempt = await this.prisma.examAttempt.update({
      where: { id: attempt.id },
      data: {
        answers: normalizedAnswers,
        currentQuestion: Math.min(
          Math.max(1, payload.currentQuestion),
          Math.max(1, questions.length)
        ),
        remainingSeconds: Math.min(
          Math.max(0, payload.remainingSeconds),
          exam.durationMinutes * 60
        ),
        savedAt: now
      }
    });

    return {
      savedAt: (updatedAttempt.savedAt ?? now).toISOString()
    };
  }

  async submitExam(
    userId: string,
    examId: string,
    payload: SubmitExamRequest
  ): Promise<SubmitExamResponse> {
    const exam = await this.getExamEntity(examId, userId);
    const questions = this.parseQuestions(exam.questions);
    const attempt = await this.getOrCreateAttempt(userId, exam.id, exam.durationMinutes);

    if (attempt.submittedAt) {
      throw new BadRequestException("Exam already submitted");
    }

    const answers = this.normalizeAnswers(payload.answers, questions);
    const wrongQuestions: ExamReviewItem[] = [];
    let correctCount = 0;

    for (const question of questions) {
      const currentAnswer = answers[question.id] ?? [];
      if (this.isSameAnswer(currentAnswer, question.correctOptionIds)) {
        correctCount += 1;
      } else {
        wrongQuestions.push({
          questionId: question.id,
          stem: question.stem,
          knowledgeTag: question.knowledgeTag,
          yourAnswerIds: currentAnswer,
          correctAnswerIds: question.correctOptionIds
        });
      }
    }

    const totalQuestions = questions.length;
    const score = totalQuestions === 0 ? 0 : Math.round((correctCount / totalQuestions) * 100);
    const submittedAt = new Date();
    const suggestedReviews = Array.from(
      new Set(wrongQuestions.map((item) => item.knowledgeTag))
    ).slice(0, 3);

    const updateResult = await this.prisma.examAttempt.updateMany({
      where: {
        id: attempt.id,
        submittedAt: null
      },
      data: {
        answers,
        currentQuestion: Math.max(1, totalQuestions),
        remainingSeconds: 0,
        savedAt: submittedAt,
        submittedAt,
        score
      }
    });

    if (updateResult.count === 0) {
      throw new BadRequestException("Exam already submitted");
    }

    return {
      score,
      passed: score >= exam.passScore,
      correctCount,
      totalQuestions,
      wrongQuestions,
      suggestedReviews,
      submittedAt: submittedAt.toISOString()
    };
  }

  private async getCoursesWithUserProgress(userId: string): Promise<CourseWithLessons[]> {
    const courses = await this.prisma.course.findMany({
      where: { status: "published" },
      orderBy: { id: "asc" },
      include: {
        lessons: {
          orderBy: { sortOrder: "asc" },
          include: {
            learningProgress: {
              where: { userId },
              select: {
                positionSeconds: true,
                completed: true
              },
              take: 1
            }
          }
        }
      }
    });

    return courses as CourseWithLessons[];
  }

  private async getCourseWithUserProgress(
    userId: string,
    courseId: string
  ): Promise<CourseWithLessons> {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        lessons: {
          orderBy: { sortOrder: "asc" },
          include: {
            learningProgress: {
              where: { userId },
              select: {
                positionSeconds: true,
                completed: true
              },
              take: 1
            }
          }
        }
      }
    });

    if (!course) {
      throw new NotFoundException(`Course ${courseId} not found`);
    }
    if (course.status !== "published") {
      throw new NotFoundException(`Course ${courseId} not found`);
    }

    return course as CourseWithLessons;
  }

  private getCourseProgressFromLessons(lessons: LessonWithUserProgress[]): number {
    if (lessons.length === 0) {
      return 0;
    }

    const totalProgress = lessons.reduce((sum, lesson) => {
      const lessonProgress = this.getLessonProgressFromRow(
        lesson.totalSeconds,
        lesson.learningProgress[0]
      );
      return sum + lessonProgress;
    }, 0);

    return Math.round(totalProgress / lessons.length);
  }

  private getLessonProgressFromRow(
    totalSeconds: number,
    progressRow?: { positionSeconds: number; completed: boolean }
  ): number {
    if (!progressRow) {
      return 0;
    }
    if (progressRow.completed) {
      return 100;
    }
    if (totalSeconds <= 0) {
      return 0;
    }
    return Math.round((progressRow.positionSeconds / totalSeconds) * 100);
  }

  private async getCourseProgress(userId: string, courseId: string): Promise<number> {
    const course = await this.getCourseWithUserProgress(userId, courseId);
    return this.getCourseProgressFromLessons(course.lessons);
  }

  private async getExamEntity(examId: string, userId: string) {
    const exam = await this.prisma.exam.findUnique({
      where: { id: examId },
      include: {
        assignments: {
          where: { userId },
          select: { userId: true },
          take: 1
        },
        _count: {
          select: {
            assignments: true
          }
        }
      }
    });

    if (!exam) {
      throw new NotFoundException(`Exam ${examId} not found`);
    }
    if (exam._count.assignments > 0 && exam.assignments.length === 0) {
      throw new NotFoundException(`Exam ${examId} not found`);
    }
    return exam;
  }

  private async getOrCreateAttempt(
    userId: string,
    examId: string,
    durationMinutes: number
  ) {
    const existing = await this.prisma.examAttempt.findUnique({
      where: {
        examId_userId: {
          examId,
          userId
        }
      }
    });
    if (existing) {
      return existing;
    }

    return this.prisma.examAttempt.create({
      data: {
        examId,
        userId,
        answers: {},
        currentQuestion: 1,
        remainingSeconds: durationMinutes * 60
      }
    });
  }

  private async getCompletedCourseIdSetByUser(
    userId: string,
    courseIds: string[]
  ): Promise<Set<string>> {
    if (courseIds.length === 0) {
      return new Set<string>();
    }

    const [courseLessons, completedRows] = await Promise.all([
      this.prisma.lesson.findMany({
        where: {
          courseId: { in: courseIds }
        },
        select: {
          courseId: true,
          id: true
        }
      }),
      this.prisma.learningProgress.findMany({
        where: {
          userId,
          courseId: { in: courseIds },
          completed: true
        },
        select: {
          courseId: true,
          lessonId: true
        }
      })
    ]);

    const requiredLessonCount = new Map<string, number>();
    for (const row of courseLessons) {
      requiredLessonCount.set(
        row.courseId,
        (requiredLessonCount.get(row.courseId) ?? 0) + 1
      );
    }

    const completedLessonMap = new Map<string, Set<string>>();
    for (const row of completedRows) {
      if (!completedLessonMap.has(row.courseId)) {
        completedLessonMap.set(row.courseId, new Set<string>());
      }
      completedLessonMap.get(row.courseId)?.add(row.lessonId);
    }

    const completedCourseIds = new Set<string>();
    for (const [courseId, completedLessons] of completedLessonMap.entries()) {
      const expected = requiredLessonCount.get(courseId) ?? 0;
      if (expected > 0 && completedLessons.size >= expected) {
        completedCourseIds.add(courseId);
      }
    }

    return completedCourseIds;
  }

  private normalizeAnswers(
    payload: Record<string, string[]>,
    questions: ExamQuestion[]
  ): Record<string, string[]> {
    const allowedQuestionIds = new Set(questions.map((question) => question.id));
    const allowedOptionIds = new Map(
      questions.map((question) => [
        question.id,
        new Set(question.options.map((option) => option.id))
      ])
    );

    const normalized: Record<string, string[]> = {};
    for (const [questionId, rawAnswer] of Object.entries(payload ?? {})) {
      if (!allowedQuestionIds.has(questionId)) {
        continue;
      }

      const options = allowedOptionIds.get(questionId);
      if (!options) {
        continue;
      }

      const answerList = Array.isArray(rawAnswer) ? rawAnswer : [];
      normalized[questionId] = Array.from(
        new Set(answerList.filter((answer) => options.has(answer)))
      ).sort();
    }

    return normalized;
  }

  private parseQuestions(raw: Prisma.JsonValue): ExamQuestion[] {
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

        const options = question.options
          .map((option): { id: string; label: string } | null => {
            if (!option || typeof option !== "object") {
              return null;
            }

            const rawOption = option as Record<string, unknown>;
            if (
              typeof rawOption.id !== "string" ||
              typeof rawOption.label !== "string"
            ) {
              return null;
            }

            return {
              id: rawOption.id,
              label: rawOption.label
            };
          })
          .filter(
            (option): option is { id: string; label: string } => option !== null
          );

        const correctOptionIds = question.correctOptionIds.filter(
          (value): value is string => typeof value === "string"
        );

        return {
          id: question.id,
          type: question.type as ExamQuestion["type"],
          stem: question.stem,
          options,
          correctOptionIds,
          knowledgeTag: question.knowledgeTag
        };
      })
      .filter((question): question is ExamQuestion => question !== null);
  }

  private parseAnswers(raw: Prisma.JsonValue): Record<string, string[]> {
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
    return a.every((value, index) => value === b[index]);
  }

  private progressToStatus(progress: number): "todo" | "in_progress" | "completed" {
    if (progress >= 100) {
      return "completed";
    }
    if (progress > 0) {
      return "in_progress";
    }
    return "todo";
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

  private toStringArray(value: Prisma.JsonValue): string[] {
    if (!Array.isArray(value)) {
      return [];
    }
    return value.filter((item): item is string => typeof item === "string");
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
