import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import type {
  CourseDetail,
  CourseListItem,
  DashboardSummary,
  DashboardTask,
  ExamAttemptState,
  ExamDetail,
  ExamListItem,
  ExamQuestion,
  ExamReviewItem,
  LessonDetail,
  SaveExamDraftRequest,
  SaveExamDraftResponse,
  SaveLessonProgressRequest,
  SaveLessonProgressResponse,
  SubmitExamRequest,
  SubmitExamResponse
} from "@logistics/shared";

interface CourseEntity {
  id: string;
  title: string;
  category: string;
  durationMinutes: number;
  requirement: "required" | "optional";
  dueDate: string;
  description: string;
  roles: string[];
  completionRule: string;
  lessonIds: string[];
  attachments: string[];
}

interface LessonEntity {
  id: string;
  courseId: string;
  title: string;
  contentType: "video" | "article" | "pdf" | "quiz";
  content: string;
  totalSeconds: number;
  positionSeconds: number;
  completed: boolean;
}

interface ExamEntity {
  id: string;
  name: string;
  durationMinutes: number;
  startTime: string;
  passScore: number;
  instructions: string;
  warnings: string[];
  questions: ExamQuestion[];
}

interface ExamAttemptEntity extends ExamAttemptState {}

@Injectable()
export class LearningService {
  private readonly courses: CourseEntity[] = [
    {
      id: "C-1001",
      title: "新员工通用入职流程",
      category: "入职必修",
      durationMinutes: 45,
      requirement: "required",
      dueDate: "2026-03-22",
      description: "帮助新员工建立统一认知，熟悉公司制度、岗位职责和基础协作方式。",
      roles: ["新员工"],
      completionRule: "完成全部章节并通过随堂测验",
      lessonIds: ["L-1001", "L-1002"],
      attachments: ["入职流程手册.pdf", "制度速查表.xlsx"]
    },
    {
      id: "C-1024",
      title: "仓配一体全链路基础",
      category: "岗位核心",
      durationMinutes: 90,
      requirement: "required",
      dueDate: "2026-03-24",
      description: "覆盖入库、分拣、出库与异常处理关键节点，建立端到端履约视角。",
      roles: ["新员工", "分拣员"],
      completionRule: "章节全部打点 + 随堂测验通过",
      lessonIds: ["L-1003", "L-1004", "L-1005", "L-1006"],
      attachments: ["仓储安全检查清单.pdf", "异常件判定速查表.xlsx"]
    },
    {
      id: "C-1088",
      title: "异常件识别与处置 SOP",
      category: "风险控制",
      durationMinutes: 55,
      requirement: "required",
      dueDate: "2026-03-27",
      description: "聚焦高频异常场景，标准化异常判定、升级与闭环追踪。",
      roles: ["分拣员", "客服"],
      completionRule: "完成全部章节并提交案例题",
      lessonIds: ["L-1007", "L-1008"],
      attachments: ["异常件处置流程图.pdf"]
    },
    {
      id: "C-1203",
      title: "装卸设备操作规范",
      category: "设备安全",
      durationMinutes: 40,
      requirement: "optional",
      dueDate: "2026-03-31",
      description: "规范常见设备安全使用，降低误操作风险。",
      roles: ["分拣员"],
      completionRule: "完成视频学习并勾选安全确认",
      lessonIds: ["L-1009"],
      attachments: ["设备操作指引.pdf"]
    }
  ];

  private readonly lessons = new Map<string, LessonEntity>([
    [
      "L-1001",
      {
        id: "L-1001",
        courseId: "C-1001",
        title: "课程导入：入职流程总览",
        contentType: "video",
        content: "本章节介绍入职阶段关键节点与协作角色。",
        totalSeconds: 600,
        positionSeconds: 600,
        completed: true
      }
    ],
    [
      "L-1002",
      {
        id: "L-1002",
        courseId: "C-1001",
        title: "岗位协作与制度说明",
        contentType: "article",
        content: "图文内容：职责边界、班次交接、异常上报路径。",
        totalSeconds: 540,
        positionSeconds: 540,
        completed: true
      }
    ],
    [
      "L-1003",
      {
        id: "L-1003",
        courseId: "C-1024",
        title: "仓配链路概览",
        contentType: "video",
        content: "从订单创建到妥投全链路讲解。",
        totalSeconds: 780,
        positionSeconds: 780,
        completed: true
      }
    ],
    [
      "L-1004",
      {
        id: "L-1004",
        courseId: "C-1024",
        title: "核心 SOP：分拣作业流程",
        contentType: "video",
        content: "视频内容：分拣作业标准流程与注意事项。",
        totalSeconds: 900,
        positionSeconds: 420,
        completed: false
      }
    ],
    [
      "L-1005",
      {
        id: "L-1005",
        courseId: "C-1024",
        title: "高风险场景：异常件处理",
        contentType: "article",
        content: "图文内容：异常件判定标准和升级处理流程。",
        totalSeconds: 660,
        positionSeconds: 120,
        completed: false
      }
    ],
    [
      "L-1006",
      {
        id: "L-1006",
        courseId: "C-1024",
        title: "随堂测验与复盘",
        contentType: "quiz",
        content: "章节测验：覆盖仓配链路关键知识点。",
        totalSeconds: 420,
        positionSeconds: 0,
        completed: false
      }
    ],
    [
      "L-1007",
      {
        id: "L-1007",
        courseId: "C-1088",
        title: "异常件识别规则",
        contentType: "pdf",
        content: "PDF 内容：异常件分类和处理优先级。",
        totalSeconds: 540,
        positionSeconds: 120,
        completed: false
      }
    ],
    [
      "L-1008",
      {
        id: "L-1008",
        courseId: "C-1088",
        title: "处置闭环案例",
        contentType: "quiz",
        content: "案例题训练。",
        totalSeconds: 480,
        positionSeconds: 0,
        completed: false
      }
    ],
    [
      "L-1009",
      {
        id: "L-1009",
        courseId: "C-1203",
        title: "设备安全基础",
        contentType: "video",
        content: "设备上机前检查和风险防控要点。",
        totalSeconds: 720,
        positionSeconds: 0,
        completed: false
      }
    ]
  ]);

  private readonly exams: ExamEntity[] = [
    {
      id: "EX-301",
      name: "仓储安全规范考试",
      durationMinutes: 40,
      startTime: "2026-03-23T16:30:00+08:00",
      passScore: 80,
      instructions: "考试包含单选、多选、判断和案例题，请在倒计时结束前提交。",
      warnings: ["网络波动会自动暂存", "距离结束 5 分钟会提示风险"],
      questions: [
        {
          id: "Q-1",
          type: "single",
          stem: "遇到扫描异常且条码不清晰时，优先执行哪一步？",
          options: [
            { id: "A", label: "人工录入单号后继续流转" },
            { id: "B", label: "按 SOP 拍照留档并转异常件流程" },
            { id: "C", label: "先搁置，班后处理" }
          ],
          correctOptionIds: ["B"],
          knowledgeTag: "异常处理"
        },
        {
          id: "Q-2",
          type: "multiple",
          stem: "以下哪些属于装卸安全隐患？",
          options: [
            { id: "A", label: "未佩戴防护装备" },
            { id: "B", label: "湿滑地面未做警示" },
            { id: "C", label: "按规定执行设备点检" },
            { id: "D", label: "超载操作" }
          ],
          correctOptionIds: ["A", "B", "D"],
          knowledgeTag: "安全生产"
        },
        {
          id: "Q-3",
          type: "boolean",
          stem: "判断：异常件处理完成后可不回写系统。",
          options: [
            { id: "T", label: "正确" },
            { id: "F", label: "错误" }
          ],
          correctOptionIds: ["F"],
          knowledgeTag: "流程闭环"
        },
        {
          id: "Q-4",
          type: "single",
          stem: "温控巡检最小频次应为？",
          options: [
            { id: "A", label: "每 4 小时一次" },
            { id: "B", label: "每 2 小时一次" },
            { id: "C", label: "每天一次" }
          ],
          correctOptionIds: ["B"],
          knowledgeTag: "温控巡检"
        },
        {
          id: "Q-5",
          type: "single",
          stem: "签收争议工单应在多久内升级？",
          options: [
            { id: "A", label: "30 分钟内" },
            { id: "B", label: "2 小时内" },
            { id: "C", label: "24 小时内" }
          ],
          correctOptionIds: ["A"],
          knowledgeTag: "客服协同"
        }
      ]
    },
    {
      id: "EX-284",
      name: "订单履约流程考试",
      durationMinutes: 30,
      startTime: "2026-03-16T10:00:00+08:00",
      passScore: 80,
      instructions: "聚焦订单履约流程关键节点与协作规范。",
      warnings: ["可中途暂存，提交后不可修改"],
      questions: [
        {
          id: "Q-101",
          type: "single",
          stem: "订单异常升级的第一责任人是？",
          options: [
            { id: "A", label: "客服" },
            { id: "B", label: "当班班组长" },
            { id: "C", label: "仓储经理" }
          ],
          correctOptionIds: ["B"],
          knowledgeTag: "履约协同"
        }
      ]
    }
  ];

  private readonly examAttempts = new Map<string, ExamAttemptEntity>([
    [
      "EX-301",
      {
        answers: {},
        currentQuestion: 1,
        remainingSeconds: 40 * 60,
        savedAt: null,
        submittedAt: null,
        score: null
      }
    ],
    [
      "EX-284",
      {
        answers: { "Q-101": ["B"] },
        currentQuestion: 1,
        remainingSeconds: 0,
        savedAt: "2026-03-16T10:19:20.000Z",
        submittedAt: "2026-03-16T10:20:00.000Z",
        score: 88
      }
    ]
  ]);

  getDashboardSummary(): DashboardSummary {
    const requiredCourses = this.courses.filter((course) => course.requirement === "required");
    const completedRequired = requiredCourses.filter((course) => this.getCourseProgress(course.id) >= 100).length;
    const pendingCourses = requiredCourses.length - completedRequired;
    const pendingExams = this.getExams().filter((exam) => exam.status === "pending").length;

    return {
      completionRate: requiredCourses.length === 0 ? 0 : Math.round((completedRequired / requiredCourses.length) * 100),
      pendingCourses,
      pendingExams,
      completedCourses: this.courses.filter((course) => this.getCourseProgress(course.id) >= 100).length
    };
  }

  getDashboardTasks(): DashboardTask[] {
    const tasks: DashboardTask[] = [];

    const nextCourse = this.courses
      .filter((course) => course.requirement === "required")
      .find((course) => this.getCourseProgress(course.id) < 100);
    if (nextCourse) {
      tasks.push({
        id: `task-${nextCourse.id}`,
        title: nextCourse.title,
        type: "course",
        status: this.progressToDashboardStatus(this.getCourseProgress(nextCourse.id)),
        dueDate: nextCourse.dueDate
      });
    }

    const pendingExam = this.getExams().find((exam) => exam.status === "pending");
    if (pendingExam) {
      tasks.push({
        id: `task-${pendingExam.id}`,
        title: pendingExam.name,
        type: "exam",
        status: "todo",
        dueDate: pendingExam.startTime.slice(0, 10)
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

  getCourses(): CourseListItem[] {
    return this.courses.map((course) => ({
      id: course.id,
      title: course.title,
      category: course.category,
      durationMinutes: course.durationMinutes,
      progress: this.getCourseProgress(course.id),
      requirement: course.requirement,
      dueDate: course.dueDate
    }));
  }

  getCourse(courseId: string): CourseDetail {
    const course = this.getCourseEntity(courseId);

    return {
      id: course.id,
      title: course.title,
      category: course.category,
      durationMinutes: course.durationMinutes,
      progress: this.getCourseProgress(course.id),
      requirement: course.requirement,
      dueDate: course.dueDate,
      description: course.description,
      roles: course.roles,
      completionRule: course.completionRule,
      attachments: course.attachments,
      chapters: course.lessonIds.map((lessonId) => {
        const lesson = this.getLessonEntity(lessonId);
        const progress = this.getLessonProgress(lesson);

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

  getLesson(lessonId: string): LessonDetail {
    const lesson = this.getLessonEntity(lessonId);
    const course = this.getCourseEntity(lesson.courseId);
    const currentIndex = course.lessonIds.findIndex((id) => id === lesson.id);

    return {
      id: lesson.id,
      courseId: lesson.courseId,
      title: lesson.title,
      contentType: lesson.contentType,
      content: lesson.content,
      totalSeconds: lesson.totalSeconds,
      positionSeconds: lesson.positionSeconds,
      completed: lesson.completed,
      autoSaveIntervalSeconds: 30,
      previousLessonId: currentIndex > 0 ? course.lessonIds[currentIndex - 1] : null,
      nextLessonId: currentIndex >= 0 && currentIndex < course.lessonIds.length - 1 ? course.lessonIds[currentIndex + 1] : null
    };
  }

  saveLessonProgress(
    lessonId: string,
    payload: SaveLessonProgressRequest
  ): SaveLessonProgressResponse {
    const lesson = this.getLessonEntity(lessonId);

    lesson.positionSeconds = Math.min(Math.max(0, payload.positionSeconds), lesson.totalSeconds);
    const shouldComplete = payload.completed === true || lesson.positionSeconds >= lesson.totalSeconds;
    lesson.completed = shouldComplete;

    if (lesson.completed) {
      lesson.positionSeconds = lesson.totalSeconds;
    }

    return {
      positionSeconds: lesson.positionSeconds,
      completed: lesson.completed,
      courseProgress: this.getCourseProgress(lesson.courseId),
      savedAt: new Date().toISOString()
    };
  }

  getExams(): ExamListItem[] {
    return this.exams.map((exam) => {
      const attempt = this.getOrCreateAttempt(exam.id);
      return {
        id: exam.id,
        name: exam.name,
        durationMinutes: exam.durationMinutes,
        questionCount: exam.questions.length,
        startTime: exam.startTime,
        status: attempt.submittedAt ? "completed" : "pending",
        score: attempt.score
      };
    });
  }

  getExam(examId: string): ExamDetail {
    const exam = this.getExamEntity(examId);
    const attempt = this.getOrCreateAttempt(examId);

    return {
      id: exam.id,
      name: exam.name,
      durationMinutes: exam.durationMinutes,
      questionCount: exam.questions.length,
      startTime: exam.startTime,
      status: attempt.submittedAt ? "completed" : "pending",
      score: attempt.score,
      passScore: exam.passScore,
      instructions: exam.instructions,
      warnings: exam.warnings,
      attempt: {
        answers: attempt.answers,
        currentQuestion: attempt.currentQuestion,
        remainingSeconds: attempt.remainingSeconds,
        savedAt: attempt.savedAt,
        submittedAt: attempt.submittedAt,
        score: attempt.score
      },
      questions: exam.questions
    };
  }

  saveExamDraft(
    examId: string,
    payload: SaveExamDraftRequest
  ): SaveExamDraftResponse {
    const exam = this.getExamEntity(examId);
    const attempt = this.getOrCreateAttempt(examId);

    if (attempt.submittedAt) {
      throw new BadRequestException("Exam already submitted");
    }

    attempt.answers = this.normalizeAnswers(payload.answers, exam.questions);
    attempt.currentQuestion = Math.min(
      Math.max(1, payload.currentQuestion),
      exam.questions.length
    );
    attempt.remainingSeconds = Math.min(
      Math.max(0, payload.remainingSeconds),
      exam.durationMinutes * 60
    );

    const savedAt = new Date().toISOString();
    attempt.savedAt = savedAt;

    return { savedAt };
  }

  submitExam(
    examId: string,
    payload: SubmitExamRequest
  ): SubmitExamResponse {
    const exam = this.getExamEntity(examId);
    const attempt = this.getOrCreateAttempt(examId);

    if (attempt.submittedAt) {
      throw new BadRequestException("Exam already submitted");
    }

    const answers = this.normalizeAnswers(payload.answers, exam.questions);
    const wrongQuestions: ExamReviewItem[] = [];
    let correctCount = 0;

    for (const question of exam.questions) {
      const current = answers[question.id] ?? [];
      if (this.isSameAnswer(current, question.correctOptionIds)) {
        correctCount += 1;
      } else {
        wrongQuestions.push({
          questionId: question.id,
          stem: question.stem,
          knowledgeTag: question.knowledgeTag,
          yourAnswerIds: current,
          correctAnswerIds: question.correctOptionIds
        });
      }
    }

    const totalQuestions = exam.questions.length;
    const score = Math.round((correctCount / totalQuestions) * 100);
    const submittedAt = new Date().toISOString();
    const suggestedReviews = Array.from(
      new Set(wrongQuestions.map((item) => item.knowledgeTag))
    ).slice(0, 3);

    attempt.answers = answers;
    attempt.currentQuestion = totalQuestions;
    attempt.remainingSeconds = 0;
    attempt.savedAt = submittedAt;
    attempt.submittedAt = submittedAt;
    attempt.score = score;

    return {
      score,
      passed: score >= exam.passScore,
      correctCount,
      totalQuestions,
      wrongQuestions,
      suggestedReviews,
      submittedAt
    };
  }

  private getCourseEntity(courseId: string): CourseEntity {
    const course = this.courses.find((item) => item.id === courseId);
    if (!course) {
      throw new NotFoundException(`Course ${courseId} not found`);
    }
    return course;
  }

  private getLessonEntity(lessonId: string): LessonEntity {
    const lesson = this.lessons.get(lessonId);
    if (!lesson) {
      throw new NotFoundException(`Lesson ${lessonId} not found`);
    }
    return lesson;
  }

  private getExamEntity(examId: string): ExamEntity {
    const exam = this.exams.find((item) => item.id === examId);
    if (!exam) {
      throw new NotFoundException(`Exam ${examId} not found`);
    }
    return exam;
  }

  private getOrCreateAttempt(examId: string): ExamAttemptEntity {
    const existing = this.examAttempts.get(examId);
    if (existing) {
      return existing;
    }

    const exam = this.getExamEntity(examId);
    const attempt: ExamAttemptEntity = {
      answers: {},
      currentQuestion: 1,
      remainingSeconds: exam.durationMinutes * 60,
      savedAt: null,
      submittedAt: null,
      score: null
    };
    this.examAttempts.set(examId, attempt);
    return attempt;
  }

  private getLessonProgress(lesson: LessonEntity): number {
    if (lesson.completed) {
      return 100;
    }
    if (lesson.totalSeconds <= 0) {
      return 0;
    }
    return Math.round((lesson.positionSeconds / lesson.totalSeconds) * 100);
  }

  private getCourseProgress(courseId: string): number {
    const course = this.getCourseEntity(courseId);
    const progresses = course.lessonIds.map((lessonId) =>
      this.getLessonProgress(this.getLessonEntity(lessonId))
    );

    if (progresses.length === 0) {
      return 0;
    }

    const total = progresses.reduce((sum, item) => sum + item, 0);
    return Math.round(total / progresses.length);
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

  private progressToDashboardStatus(progress: number): "todo" | "in_progress" | "completed" {
    return this.progressToStatus(progress);
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

  private isSameAnswer(current: string[], correct: string[]): boolean {
    const a = [...current].sort();
    const b = [...correct].sort();
    if (a.length !== b.length) {
      return false;
    }
    return a.every((value, index) => value === b[index]);
  }
}
