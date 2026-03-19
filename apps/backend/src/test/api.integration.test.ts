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
