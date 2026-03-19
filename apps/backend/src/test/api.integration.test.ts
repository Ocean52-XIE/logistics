import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { PrismaClient } from "@prisma/client";
import { AppModule } from "../modules/app.module";

let app: INestApplication;
let baseUrl = "";
const prisma = new PrismaClient();

before(async () => {
  await prisma.$connect();

  app = await NestFactory.create(AppModule, { logger: false });
  app.setGlobalPrefix("api/v1");
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true
    })
  );

  await app.listen(0, "127.0.0.1");
  const address = app.getHttpServer().address();
  if (!address || typeof address === "string") {
    throw new Error("Failed to resolve test server port");
  }

  baseUrl = `http://127.0.0.1:${address.port}/api/v1`;
});

after(async () => {
  await app.close();
  await prisma.$disconnect();
});

test("auth + learning progress + exam draft/submit integration flow", async () => {
  const token = await loginAs("employee1", "123456");

  const unauthorizedSummary = await request("/dashboard/summary");
  assert.equal(unauthorizedSummary.status, 401);

  const saveProgressResponse = await request("/lessons/L-1004/progress", {
    method: "POST",
    token,
    body: {
      positionSeconds: 600,
      completed: false
    }
  });
  assert.ok([200, 201].includes(saveProgressResponse.status));
  const saveProgressPayload = await saveProgressResponse.json();
  assert.equal(typeof saveProgressPayload.positionSeconds, "number");
  assert.equal(typeof saveProgressPayload.completed, "boolean");
  assert.equal(typeof saveProgressPayload.courseProgress, "number");
  assert.equal(typeof saveProgressPayload.savedAt, "string");

  const examId = `EX-T-${randomUUID().slice(0, 8).toUpperCase()}`;
  await prisma.exam.create({
    data: {
      id: examId,
      name: "Temporary Integration Exam",
      durationMinutes: 10,
      startTime: new Date(),
      passScore: 60,
      instructions: "Choose one option",
      warnings: [],
      questions: [
        {
          id: "Q-T-1",
          type: "single",
          stem: "What is 1 + 1?",
          options: [
            { id: "A", label: "2" },
            { id: "B", label: "3" }
          ],
          correctOptionIds: ["A"],
          knowledgeTag: "math"
        }
      ]
    }
  });

  try {
    const draftResponse = await request(`/exams/${examId}/draft`, {
      method: "POST",
      token,
      body: {
        answers: { "Q-T-1": ["A"] },
        currentQuestion: 1,
        remainingSeconds: 550
      }
    });
    assert.ok([200, 201].includes(draftResponse.status));
    const draftPayload = await draftResponse.json();
    assert.equal(typeof draftPayload.savedAt, "string");

    const submitResponse = await request(`/exams/${examId}/submit`, {
      method: "POST",
      token,
      body: {
        answers: { "Q-T-1": ["A"] }
      }
    });
    assert.ok([200, 201].includes(submitResponse.status));
    const submitPayload = await submitResponse.json();
    assert.equal(typeof submitPayload.score, "number");
    assert.equal(typeof submitPayload.passed, "boolean");
    assert.equal(typeof submitPayload.submittedAt, "string");
    assert.equal(submitPayload.totalQuestions, 1);

    const duplicateSubmitResponse = await request(`/exams/${examId}/submit`, {
      method: "POST",
      token,
      body: {
        answers: { "Q-T-1": ["A"] }
      }
    });
    assert.equal(duplicateSubmitResponse.status, 400);
  } finally {
    await prisma.exam.delete({ where: { id: examId } });
  }
});

test("employee cannot access admin endpoints", async () => {
  const token = await loginAs("employee1", "123456");

  const adminResponse = await request("/admin/reports/overview", { token });
  assert.equal(adminResponse.status, 403);
});

test("manager and trainer can access employee learning endpoints", async () => {
  const managerToken = await loginAs("manager1", "123456");
  const trainerToken = await loginAs("trainer1", "123456");

  const [managerSummary, managerCourses, trainerSummary, trainerCourses] =
    await Promise.all([
      request("/dashboard/summary", { token: managerToken }),
      request("/courses", { token: managerToken }),
      request("/dashboard/summary", { token: trainerToken }),
      request("/courses", { token: trainerToken })
    ]);

  assert.equal(managerSummary.status, 200);
  assert.equal(managerCourses.status, 200);
  assert.equal(trainerSummary.status, 200);
  assert.equal(trainerCourses.status, 200);
});

test("manager and trainer cannot access admin endpoints", async () => {
  const managerToken = await loginAs("manager1", "123456");
  const trainerToken = await loginAs("trainer1", "123456");

  const [managerAdminResponse, trainerAdminResponse] = await Promise.all([
    request("/admin/reports/overview", { token: managerToken }),
    request("/admin/reports/overview", { token: trainerToken })
  ]);

  assert.equal(managerAdminResponse.status, 403);
  assert.equal(trainerAdminResponse.status, 403);
});

test("admin can access admin endpoints", async () => {
  const token = await loginAs("admin1", "123456");

  const adminResponse = await request("/admin/reports/overview", { token });
  assert.equal(adminResponse.status, 200);
  const payload = await adminResponse.json();
  assert.equal(typeof payload.totalUsers, "number");
  assert.equal(typeof payload.completionRate, "number");
});

test("concurrent submit only succeeds once", async () => {
  const token = await loginAs("employee1", "123456");

  await prisma.examAttempt.update({
    where: {
      examId_userId: {
        examId: "EX-301",
        userId: "U-EMP-1001"
      }
    },
    data: {
      answers: {},
      currentQuestion: 1,
      remainingSeconds: 40 * 60,
      savedAt: null,
      submittedAt: null,
      score: null
    }
  });

  const [responseA, responseB] = await Promise.all([
    request("/exams/EX-301/submit", {
      method: "POST",
      token,
      body: {
        answers: { "Q-1": ["B"] }
      }
    }),
    request("/exams/EX-301/submit", {
      method: "POST",
      token,
      body: {
        answers: { "Q-1": ["B"] }
      }
    })
  ]);

  const statuses = [responseA.status, responseB.status].sort((a, b) => a - b);
  assert.deepEqual(statuses, [200, 400]);
});

test("notification read endpoints are idempotent", async () => {
  const token = await loginAs("employee1", "123456");

  const firstReadResponse = await request("/notifications/N-1001/read", {
    method: "POST",
    token,
    body: {}
  });
  assert.equal(firstReadResponse.status, 200);
  const firstPayload = (await firstReadResponse.json()) as {
    notificationId: string;
    readAt: string;
  };
  assert.equal(firstPayload.notificationId, "N-1001");

  const secondReadResponse = await request("/notifications/N-1001/read", {
    method: "POST",
    token,
    body: {}
  });
  assert.equal(secondReadResponse.status, 200);
  const secondPayload = (await secondReadResponse.json()) as {
    notificationId: string;
    readAt: string;
  };
  assert.equal(secondPayload.notificationId, "N-1001");
  assert.equal(secondPayload.readAt, firstPayload.readAt);

  const readAllResponse = await request("/notifications/read-all", {
    method: "POST",
    token,
    body: {}
  });
  assert.equal(readAllResponse.status, 200);
  const readAllPayload = (await readAllResponse.json()) as {
    updatedCount: number;
    readAt: string;
  };
  assert.ok(readAllPayload.updatedCount >= 0);
  assert.equal(typeof readAllPayload.readAt, "string");

  const readAllAgainResponse = await request("/notifications/read-all", {
    method: "POST",
    token,
    body: {}
  });
  assert.equal(readAllAgainResponse.status, 200);
  const readAllAgainPayload = (await readAllAgainResponse.json()) as {
    updatedCount: number;
  };
  assert.equal(readAllAgainPayload.updatedCount, 0);
});

test("learning paths endpoint returns aggregated plan progress", async () => {
  const token = await loginAs("employee1", "123456");

  const response = await request("/learning-paths", { token });
  assert.equal(response.status, 200);

  const payload = (await response.json()) as Array<{
    id: string;
    name: string;
    courseCount: number;
    completedCourseCount: number;
    completionRate: number;
    status: "pending" | "active" | "completed";
  }>;
  assert.ok(payload.length >= 1);

  const onboardingPath = payload.find((item) =>
    item.name.includes("新员工入职计划")
  );
  assert.ok(onboardingPath);
  assert.equal(typeof onboardingPath?.courseCount, "number");
  assert.equal(typeof onboardingPath?.completedCourseCount, "number");
  assert.equal(typeof onboardingPath?.completionRate, "number");
  assert.ok(
    onboardingPath?.status === "pending" ||
      onboardingPath?.status === "active" ||
      onboardingPath?.status === "completed"
  );
});

test("admin phase2 P0 endpoints work end-to-end", async () => {
  const token = await loginAs("admin1", "123456");
  const suffix = randomUUID().slice(0, 6);
  const cleanup = {
    questionId: "",
    examId: "",
    retakeExamId: "",
    notificationId: ""
  };

  try {
    const questionResponse = await request("/admin/question-bank", {
      method: "POST",
      token,
      body: {
        stem: `P0 自动化题目 ${suffix}`,
        type: "single",
        options: ["选项A", "选项B"],
        correctOptionIds: ["A"],
        knowledgeTag: "自动化测试",
        difficulty: "easy"
      }
    });
    assert.ok([200, 201].includes(questionResponse.status));
    const createdQuestion = (await questionResponse.json()) as { id: string };
    cleanup.questionId = createdQuestion.id;

    const disableQuestionResponse = await request(
      `/admin/question-bank/${cleanup.questionId}/status`,
      {
        method: "POST",
        token,
        body: {
          isActive: false
        }
      }
    );
    assert.ok([200, 201].includes(disableQuestionResponse.status));
    const disabledQuestion = (await disableQuestionResponse.json()) as {
      isActive: boolean;
    };
    assert.equal(disabledQuestion.isActive, false);

    const enableQuestionResponse = await request(
      `/admin/question-bank/${cleanup.questionId}/status`,
      {
        method: "POST",
        token,
        body: {
          isActive: true
        }
      }
    );
    assert.ok([200, 201].includes(enableQuestionResponse.status));
    const enabledQuestion = (await enableQuestionResponse.json()) as {
      isActive: boolean;
    };
    assert.equal(enabledQuestion.isActive, true);

    const examResponse = await request("/admin/exams", {
      method: "POST",
      token,
      body: {
        name: `P0 随机组卷 ${suffix}`,
        durationMinutes: 30,
        startTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        passScore: 60,
        instructions: "自动化用例考试",
        warnings: ["自动化提醒"],
        assigneeUserIds: ["U-EMP-1001"],
        rule: {
          singleCount: 1,
          multipleCount: 0,
          booleanCount: 0,
          caseCount: 0
        }
      }
    });
    assert.ok([200, 201].includes(examResponse.status));
    const createdExam = (await examResponse.json()) as { id: string };
    cleanup.examId = createdExam.id;

    await prisma.examAttempt.create({
      data: {
        examId: cleanup.examId,
        userId: "U-EMP-1001",
        answers: {},
        currentQuestion: 1,
        remainingSeconds: 0,
        savedAt: new Date(),
        submittedAt: new Date(),
        score: 0
      }
    });

    const retakeResponse = await request(`/admin/exams/${cleanup.examId}/retakes`, {
      method: "POST",
      token,
      body: {
        userIds: ["U-EMP-1001"],
        startTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()
      }
    });
    assert.ok([200, 201].includes(retakeResponse.status));
    const createdRetake = (await retakeResponse.json()) as { examId: string };
    cleanup.retakeExamId = createdRetake.examId;

    const publishNotificationResponse = await request("/admin/notifications/publish", {
      method: "POST",
      token,
      body: {
        title: `P0 通知 ${suffix}`,
        content: "自动化通知内容",
        pinned: false,
        userIds: ["U-EMP-1001"]
      }
    });
    assert.ok([200, 201].includes(publishNotificationResponse.status));
    const createdNotification = (await publishNotificationResponse.json()) as {
      id: string;
    };
    cleanup.notificationId = createdNotification.id;

    const runReminderResponse = await request("/admin/notifications/reminders/run", {
      method: "POST",
      token,
      body: {}
    });
    assert.equal(runReminderResponse.status, 200);
    const reminderPayload = (await runReminderResponse.json()) as {
      generatedCount: number;
    };
    assert.equal(typeof reminderPayload.generatedCount, "number");

    const wrongAnswerResponse = await request(
      "/admin/reports/wrong-answers?organizationName=华东仓&positionName=分拣员",
      { token }
    );
    assert.equal(wrongAnswerResponse.status, 200);

    const auditLogResponse = await request("/admin/audit-logs?action=exam.create", {
      token
    });
    assert.equal(auditLogResponse.status, 200);
    const auditLogs = (await auditLogResponse.json()) as Array<{ entityId: string }>;
    assert.ok(auditLogs.some((log) => log.entityId === cleanup.examId));
  } finally {
    await prisma.userNotification.deleteMany({
      where: {
        notificationId: cleanup.notificationId
      }
    });
    await prisma.notification.deleteMany({
      where: {
        id: cleanup.notificationId
      }
    });
    await prisma.exam.deleteMany({
      where: {
        id: { in: [cleanup.examId, cleanup.retakeExamId].filter(Boolean) }
      }
    });
    await prisma.questionBank.deleteMany({
      where: {
        id: cleanup.questionId
      }
    });
  }
});

async function loginAs(username: string, password: string): Promise<string> {
  const loginResponse = await request("/auth/login", {
    method: "POST",
    body: {
      username,
      password
    }
  });
  assert.equal(loginResponse.status, 201);
  const loginPayload = await loginResponse.json();
  assert.equal(typeof loginPayload.accessToken, "string");
  return loginPayload.accessToken as string;
}

function request(
  path: string,
  options?: {
    method?: "GET" | "POST";
    token?: string;
    body?: unknown;
  }
): Promise<Response> {
  const headers: Record<string, string> = {};
  if (options?.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }
  if (options?.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  return fetch(`${baseUrl}${path}`, {
    method: options?.method ?? "GET",
    headers,
    body: options?.body === undefined ? undefined : JSON.stringify(options.body)
  });
}
