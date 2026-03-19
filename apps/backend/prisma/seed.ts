import { hash } from "bcryptjs";
import {
  CourseStatus,
  CourseRequirement,
  LearningContentType,
  QuestionDifficulty,
  QuestionType,
  PrismaClient,
  UserRole
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const defaultPasswordHash = await hash("123456", 10);

  await prisma.userNotification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.examAssignment.deleteMany();
  await prisma.questionBank.deleteMany();
  await prisma.trainingPlanAssignment.deleteMany();
  await prisma.trainingPlanCourse.deleteMany();
  await prisma.trainingPlan.deleteMany();
  await prisma.learningProgress.deleteMany();
  await prisma.examAttempt.deleteMany();
  await prisma.knowledgeArticle.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.course.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.createMany({
    data: [
      {
        id: "U-EMP-1001",
        username: "employee1",
        passwordHash: defaultPasswordHash,
        name: "李晨",
        role: UserRole.employee,
        organizationName: "华东仓",
        positionName: "分拣员",
        isActive: true
      },
      {
        id: "U-ADM-0001",
        username: "admin1",
        passwordHash: defaultPasswordHash,
        name: "系统管理员",
        role: UserRole.admin,
        organizationName: "总部",
        positionName: "系统管理员",
        isActive: true
      },
      {
        id: "U-EMP-1002",
        username: "employee2",
        passwordHash: defaultPasswordHash,
        name: "王敏",
        role: UserRole.employee,
        organizationName: "华南仓",
        positionName: "收货员",
        isActive: true
      },
      {
        id: "U-MGR-2001",
        username: "manager1",
        passwordHash: defaultPasswordHash,
        name: "周航",
        role: UserRole.manager,
        organizationName: "华东仓",
        positionName: "站点主管",
        isActive: true
      },
      {
        id: "U-TRN-3001",
        username: "trainer1",
        passwordHash: defaultPasswordHash,
        name: "吴昕",
        role: UserRole.trainer,
        organizationName: "培训中心",
        positionName: "培训师",
        isActive: true
      }
    ]
  });

  await prisma.course.createMany({
    data: [
      {
        id: "C-1001",
        title: "新员工通用入职流程",
        category: "入职必修",
        durationMinutes: 45,
        requirement: CourseRequirement.required,
        dueDate: new Date("2026-03-22T00:00:00+08:00"),
        description: "帮助新员工建立统一认知，熟悉公司制度、岗位职责和基础协作方式。",
        roles: ["新员工"],
        completionRule: "完成全部章节并通过随堂测验",
        attachments: ["入职流程手册.pdf", "制度速查表.xlsx"],
        status: CourseStatus.published,
        publishedAt: new Date("2026-03-15T10:00:00+08:00")
      },
      {
        id: "C-1024",
        title: "仓配一体全链路基础",
        category: "岗位核心",
        durationMinutes: 90,
        requirement: CourseRequirement.required,
        dueDate: new Date("2026-03-24T00:00:00+08:00"),
        description: "覆盖入库、分拣、出库与异常处理关键节点，建立端到端履约视角。",
        roles: ["新员工", "分拣员"],
        completionRule: "章节全部打点 + 随堂测验通过",
        attachments: ["仓储安全检查清单.pdf", "异常件判定速查表.xlsx"],
        status: CourseStatus.published,
        publishedAt: new Date("2026-03-16T10:00:00+08:00")
      },
      {
        id: "C-1088",
        title: "异常件识别与处置 SOP",
        category: "风险控制",
        durationMinutes: 55,
        requirement: CourseRequirement.required,
        dueDate: new Date("2026-03-27T00:00:00+08:00"),
        description: "聚焦高频异常场景，标准化异常判定、升级与闭环追踪。",
        roles: ["分拣员", "客服"],
        completionRule: "完成全部章节并提交案例题",
        attachments: ["异常件处置流程图.pdf"],
        status: CourseStatus.published,
        publishedAt: new Date("2026-03-17T10:00:00+08:00")
      },
      {
        id: "C-1203",
        title: "装卸设备操作规范",
        category: "设备安全",
        durationMinutes: 40,
        requirement: CourseRequirement.optional,
        dueDate: new Date("2026-03-31T00:00:00+08:00"),
        description: "规范常见设备安全使用，降低误操作风险。",
        roles: ["分拣员"],
        completionRule: "完成视频学习并勾选安全确认",
        attachments: ["设备操作指引.pdf"],
        status: CourseStatus.published,
        publishedAt: new Date("2026-03-18T10:00:00+08:00")
      }
    ]
  });

  await prisma.lesson.createMany({
    data: [
      {
        id: "L-1001",
        courseId: "C-1001",
        title: "课程导入：入职流程总览",
        contentType: LearningContentType.video,
        content: "本章节介绍入职阶段关键节点与协作角色。",
        totalSeconds: 600,
        sortOrder: 1
      },
      {
        id: "L-1002",
        courseId: "C-1001",
        title: "岗位协作与制度说明",
        contentType: LearningContentType.article,
        content: "图文内容：职责边界、班次交接、异常上报路径。",
        totalSeconds: 540,
        sortOrder: 2
      },
      {
        id: "L-1003",
        courseId: "C-1024",
        title: "仓配链路概览",
        contentType: LearningContentType.video,
        content: "从订单创建到妥投全链路讲解。",
        totalSeconds: 780,
        sortOrder: 1
      },
      {
        id: "L-1004",
        courseId: "C-1024",
        title: "核心 SOP：分拣作业流程",
        contentType: LearningContentType.video,
        content: "视频内容：分拣作业标准流程与注意事项。",
        totalSeconds: 900,
        sortOrder: 2
      },
      {
        id: "L-1005",
        courseId: "C-1024",
        title: "高风险场景：异常件处理",
        contentType: LearningContentType.article,
        content: "图文内容：异常件判定标准和升级处理流程。",
        totalSeconds: 660,
        sortOrder: 3
      },
      {
        id: "L-1006",
        courseId: "C-1024",
        title: "随堂测验与复盘",
        contentType: LearningContentType.quiz,
        content: "章节测验：覆盖仓配链路关键知识点。",
        totalSeconds: 420,
        sortOrder: 4
      },
      {
        id: "L-1007",
        courseId: "C-1088",
        title: "异常件识别规则",
        contentType: LearningContentType.pdf,
        content: "PDF 内容：异常件分类和处理优先级。",
        totalSeconds: 540,
        sortOrder: 1
      },
      {
        id: "L-1008",
        courseId: "C-1088",
        title: "处置闭环案例",
        contentType: LearningContentType.quiz,
        content: "案例题训练。",
        totalSeconds: 480,
        sortOrder: 2
      },
      {
        id: "L-1009",
        courseId: "C-1203",
        title: "设备安全基础",
        contentType: LearningContentType.video,
        content: "设备上机前检查和风险防控要点。",
        totalSeconds: 720,
        sortOrder: 1
      }
    ]
  });

  await prisma.questionBank.createMany({
    data: [
      {
        stem: "遇到扫描异常且条码不清晰时，优先执行哪一步？",
        type: QuestionType.single,
        options: [
          { id: "A", label: "人工录入单号后继续流转" },
          { id: "B", label: "按 SOP 拍照留档并转异常件流程" },
          { id: "C", label: "先搁置，班后处理" }
        ],
        correctOptionIds: ["B"],
        knowledgeTag: "异常处理",
        difficulty: QuestionDifficulty.medium,
        isActive: true,
        createdBy: "U-ADM-0001"
      },
      {
        stem: "以下哪些属于装卸安全隐患？",
        type: QuestionType.multiple,
        options: [
          { id: "A", label: "未佩戴防护装备" },
          { id: "B", label: "湿滑地面未做警示" },
          { id: "C", label: "按规定执行设备点检" },
          { id: "D", label: "超载操作" }
        ],
        correctOptionIds: ["A", "B", "D"],
        knowledgeTag: "安全生产",
        difficulty: QuestionDifficulty.medium,
        isActive: true,
        createdBy: "U-ADM-0001"
      },
      {
        stem: "判断：异常件处理完成后可不回写系统。",
        type: QuestionType.boolean,
        options: [
          { id: "T", label: "正确" },
          { id: "F", label: "错误" }
        ],
        correctOptionIds: ["F"],
        knowledgeTag: "流程闭环",
        difficulty: QuestionDifficulty.easy,
        isActive: true,
        createdBy: "U-ADM-0001"
      },
      {
        stem: "现场发现温控异常并伴随客户催单，以下处置哪项最合理？",
        type: QuestionType.case,
        options: [
          { id: "A", label: "先忽略温控异常优先派送" },
          { id: "B", label: "按异常流程升级并同步客服解释" },
          { id: "C", label: "下班后统一处理" }
        ],
        correctOptionIds: ["B"],
        knowledgeTag: "异常升级",
        difficulty: QuestionDifficulty.hard,
        isActive: true,
        createdBy: "U-ADM-0001"
      },
      {
        stem: "签收争议工单应在多久内升级？",
        type: QuestionType.single,
        options: [
          { id: "A", label: "30 分钟内" },
          { id: "B", label: "2 小时内" },
          { id: "C", label: "24 小时内" }
        ],
        correctOptionIds: ["A"],
        knowledgeTag: "客服协同",
        difficulty: QuestionDifficulty.easy,
        isActive: true,
        createdBy: "U-ADM-0001"
      }
    ]
  });

  await prisma.exam.createMany({
    data: [
      {
        id: "EX-301",
        name: "仓储安全规范考试",
        durationMinutes: 40,
        startTime: new Date("2026-03-23T16:30:00+08:00"),
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
        startTime: new Date("2026-03-16T10:00:00+08:00"),
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
    ]
  });

  await prisma.learningProgress.createMany({
    data: [
      {
        userId: "U-EMP-1001",
        courseId: "C-1001",
        lessonId: "L-1001",
        positionSeconds: 600,
        completed: true,
        lastLearnedAt: new Date("2026-03-16T09:10:00+08:00")
      },
      {
        userId: "U-EMP-1001",
        courseId: "C-1001",
        lessonId: "L-1002",
        positionSeconds: 540,
        completed: true,
        lastLearnedAt: new Date("2026-03-16T09:45:00+08:00")
      },
      {
        userId: "U-EMP-1001",
        courseId: "C-1024",
        lessonId: "L-1003",
        positionSeconds: 780,
        completed: true,
        lastLearnedAt: new Date("2026-03-17T11:00:00+08:00")
      },
      {
        userId: "U-EMP-1001",
        courseId: "C-1024",
        lessonId: "L-1004",
        positionSeconds: 420,
        completed: false,
        lastLearnedAt: new Date("2026-03-18T10:20:00+08:00")
      },
      {
        userId: "U-EMP-1001",
        courseId: "C-1024",
        lessonId: "L-1005",
        positionSeconds: 120,
        completed: false,
        lastLearnedAt: new Date("2026-03-18T10:28:00+08:00")
      },
      {
        userId: "U-EMP-1001",
        courseId: "C-1024",
        lessonId: "L-1006",
        positionSeconds: 0,
        completed: false,
        lastLearnedAt: null
      },
      {
        userId: "U-EMP-1001",
        courseId: "C-1088",
        lessonId: "L-1007",
        positionSeconds: 120,
        completed: false,
        lastLearnedAt: new Date("2026-03-18T20:30:00+08:00")
      },
      {
        userId: "U-EMP-1001",
        courseId: "C-1088",
        lessonId: "L-1008",
        positionSeconds: 0,
        completed: false,
        lastLearnedAt: null
      }
    ]
  });

  await prisma.examAttempt.createMany({
    data: [
      {
        examId: "EX-301",
        userId: "U-EMP-1001",
        answers: {},
        currentQuestion: 1,
        remainingSeconds: 40 * 60,
        savedAt: null,
        submittedAt: null,
        score: null
      },
      {
        examId: "EX-284",
        userId: "U-EMP-1001",
        answers: { "Q-101": ["B"] },
        currentQuestion: 1,
        remainingSeconds: 0,
        savedAt: new Date("2026-03-16T10:19:20+08:00"),
        submittedAt: new Date("2026-03-16T10:20:00+08:00"),
        score: 88
      }
    ]
  });

  await prisma.knowledgeArticle.createMany({
    data: [
      {
        id: "KB-1001",
        title: "到仓异常件闭环处理流程",
        category: "异常处理",
        summary: "5 分钟内完成判定、留档、流转与回写，确保异常件处理可追溯。",
        content:
          "当包裹出现破损、条码模糊或信息不一致时，必须在 5 分钟内完成异常判定并进入闭环处理。关键步骤包括登记、拍照、系统标记、流转复核与结果回填。",
        tags: ["异常处理", "流程闭环", "SOP"],
        relatedCourseIds: ["C-1088", "C-1024"],
        isHot: true
      },
      {
        id: "KB-1002",
        title: "签收争议工单处理指引",
        category: "客服协同",
        summary: "签收争议工单需在 30 分钟内升级并同步客服与仓配协同。",
        content:
          "签收争议场景需优先核验签收凭证与配送轨迹，明确责任归属后触发补偿或复派流程。",
        tags: ["客服", "争议处理"],
        relatedCourseIds: ["C-1024"],
        isHot: true
      },
      {
        id: "KB-1003",
        title: "仓储安全巡检清单",
        category: "安全生产",
        summary: "班前、班中、班后三阶段巡检项及异常处置标准。",
        content:
          "巡检涵盖消防、通道、设备、温控、人员防护五大类，发现异常需即时上报并闭环。",
        tags: ["安全生产", "巡检"],
        relatedCourseIds: ["C-1203", "C-1024"],
        isHot: false
      }
    ]
  });

  await prisma.notification.createMany({
    data: [
      {
        id: "N-1001",
        title: "【重要】仓储安全规范考试安排",
        content: "03-23 16:30 开考，请提前 10 分钟进入考试页面并完成设备检查。",
        pinned: true,
        createdAt: new Date("2026-03-19T09:20:00+08:00")
      },
      {
        id: "N-1002",
        title: "培训计划更新：分拣岗位补充课程",
        content: "新增《异常件识别与处置 SOP》必修要求，请在本周内完成。",
        pinned: false,
        createdAt: new Date("2026-03-18T18:40:00+08:00")
      },
      {
        id: "N-1003",
        title: "系统提示：学习进度已同步",
        content: "最近一次学习记录保存成功，可在“我的进度”查看明细。",
        pinned: false,
        createdAt: new Date("2026-03-18T11:03:00+08:00")
      }
    ]
  });

  await prisma.userNotification.createMany({
    data: [
      {
        userId: "U-EMP-1001",
        notificationId: "N-1001",
        readAt: null
      },
      {
        userId: "U-EMP-1001",
        notificationId: "N-1002",
        readAt: null
      },
      {
        userId: "U-EMP-1001",
        notificationId: "N-1003",
        readAt: new Date("2026-03-18T12:00:00+08:00")
      }
    ]
  });

  const onboardingPlan = await prisma.trainingPlan.create({
    data: {
      name: "2026Q1 新员工入职计划",
      startAt: new Date("2026-03-15T00:00:00+08:00"),
      endAt: new Date("2026-03-31T23:59:59+08:00")
    }
  });

  await prisma.trainingPlanCourse.createMany({
    data: [
      { planId: onboardingPlan.id, courseId: "C-1001" },
      { planId: onboardingPlan.id, courseId: "C-1024" },
      { planId: onboardingPlan.id, courseId: "C-1088" }
    ]
  });

  await prisma.trainingPlanAssignment.createMany({
    data: [
      {
        planId: onboardingPlan.id,
        userId: "U-EMP-1001",
        assignedAt: new Date("2026-03-15T09:00:00+08:00")
      },
      {
        planId: onboardingPlan.id,
        userId: "U-EMP-1002",
        assignedAt: new Date("2026-03-16T09:00:00+08:00")
      }
    ]
  });
}

void main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seed completed");
  })
  .catch(async (error) => {
    await prisma.$disconnect();
    console.error(error);
    process.exit(1);
  });
