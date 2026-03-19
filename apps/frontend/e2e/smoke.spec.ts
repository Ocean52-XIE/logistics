import type { APIRequestContext, Page, Response } from "@playwright/test";
import { expect, test } from "@playwright/test";

const API_BASE_URL = "http://localhost:4000/api/v1";

test("employee smoke flow: login -> learn -> submit exam", async ({ page, request }) => {
  const adminToken = await apiLogin(request, "admin1", "123456");
  const suffix = Date.now().toString().slice(-6);
  const createExamResponse = await request.post(`${API_BASE_URL}/admin/exams`, {
    headers: {
      Authorization: `Bearer ${adminToken}`
    },
    data: {
      name: `E2E 员工考试 ${suffix}`,
      durationMinutes: 20,
      startTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      passScore: 60,
      instructions: "E2E 自动化考试",
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
  expect(createExamResponse.ok()).toBeTruthy();
  const createdExam = (await createExamResponse.json()) as { id: string };

  await loginAs(page, request, "employee1", "123456");
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/\/dashboard$/);

  await page.goto("/lessons/L-1004");
  let progressResponse: Response | null = null;
  await Promise.all([
    page
      .waitForResponse((response) => {
        return (
          response.url().includes("/api/v1/lessons/L-1004/progress") &&
          response.request().method() === "POST"
        );
      })
      .then((response) => {
        progressResponse = response;
      }),
    page.getByTestId("lesson-mark-complete").click()
  ]);
  expect(progressResponse).not.toBeNull();
  expect(progressResponse!.status()).toBeLessThan(400);

  await page.goto(`/exams/${createdExam.id}`);
  await page.locator('[data-testid^="exam-option-"]').first().click();

  let submitResponse: Response | null = null;
  await Promise.all([
    page
      .waitForResponse((response) => {
        return (
          response.url().includes(`/api/v1/exams/${createdExam.id}/submit`) &&
          response.request().method() === "POST"
        );
      })
      .then((response) => {
        submitResponse = response;
      }),
    page.getByTestId("exam-submit").click()
  ]);
  expect(submitResponse).not.toBeNull();
  expect(submitResponse!.status()).toBeLessThan(400);

  await expect(page.getByTestId("exam-submit-result")).toBeVisible();
});

test("manager session routes to dashboard", async ({ page, request }) => {
  await loginAs(page, request, "manager1", "123456");

  await page.goto("/login");
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByRole("heading", { name: "员工学习首页" })).toBeVisible();
});

test("admin phase2 P0 flow: create question, create exam, publish notice", async ({
  page,
  request
}) => {
  await loginAs(page, request, "admin1", "123456");

  await page.goto("/admin/question-bank");
  await expect(page).toHaveURL(/\/admin\/question-bank$/);
  const suffix = Date.now().toString().slice(-6);
  await page.getByTestId("admin-question-stem").fill(`E2E 题目 ${suffix}`);
  await page.getByTestId("admin-question-knowledge-tag").fill("E2E知识点");

  let createQuestionResponse: Response | null = null;
  await Promise.all([
    page
      .waitForResponse((response) => {
        return (
          response.url().includes("/api/v1/admin/question-bank") &&
          response.request().method() === "POST"
        );
      })
      .then((response) => {
        createQuestionResponse = response;
      }),
    page.getByTestId("admin-question-create").click()
  ]);
  expect(createQuestionResponse).not.toBeNull();
  expect(createQuestionResponse!.status()).toBeLessThan(400);

  await page.goto("/admin/exams");
  await expect(page).toHaveURL(/\/admin\/exams$/);
  await page.getByTestId("admin-exam-name").fill(`E2E 组卷 ${suffix}`);
  await page.getByTestId("admin-exam-start-time").fill("2026-03-31T10:00");

  let createExamResponse: Response | null = null;
  await Promise.all([
    page
      .waitForResponse((response) => {
        return (
          response.url().includes("/api/v1/admin/exams") &&
          response.request().method() === "POST"
        );
      })
      .then((response) => {
        createExamResponse = response;
      }),
    page.getByTestId("admin-exam-create").click()
  ]);
  expect(createExamResponse).not.toBeNull();
  expect(createExamResponse!.status()).toBeLessThan(400);

  await page.goto("/admin/notices");
  await expect(page).toHaveURL(/\/admin\/notices$/);
  await page.getByTestId("admin-notice-title").fill(`E2E 通知 ${suffix}`);
  await page.getByTestId("admin-notice-content").fill("E2E 通知内容");

  let publishNoticeResponse: Response | null = null;
  await Promise.all([
    page
      .waitForResponse((response) => {
        return (
          response.url().includes("/api/v1/admin/notifications/publish") &&
          response.request().method() === "POST"
        );
      })
      .then((response) => {
        publishNoticeResponse = response;
      }),
    page.getByTestId("admin-notice-publish").click()
  ]);
  expect(publishNoticeResponse).not.toBeNull();
  expect(publishNoticeResponse!.status()).toBeLessThan(400);
});

test("employee can mark notification as read and view learning paths", async ({
  page,
  request
}) => {
  const adminToken = await apiLogin(request, "admin1", "123456");
  const suffix = Date.now().toString().slice(-6);
  const publishResponse = await request.post(
    `${API_BASE_URL}/admin/notifications/publish`,
    {
      headers: {
        Authorization: `Bearer ${adminToken}`
      },
      data: {
        title: `E2E 通知 ${suffix}`,
        content: "请阅读此通知并标记已读",
        pinned: false,
        userIds: ["U-EMP-1001"]
      }
    }
  );
  expect(publishResponse.ok()).toBeTruthy();
  const createdNotification = (await publishResponse.json()) as { id: string };

  await loginAs(page, request, "employee1", "123456");

  await page.goto("/notifications");

  let markReadResponse: Response | null = null;
  await Promise.all([
    page
      .waitForResponse((response) => {
        return (
          response
            .url()
            .includes(`/api/v1/notifications/${createdNotification.id}/read`) &&
          response.request().method() === "POST"
        );
      })
      .then((response) => {
        markReadResponse = response;
      }),
    page
      .getByTestId(`notification-mark-read-${createdNotification.id}`)
      .click()
  ]);
  expect(markReadResponse).not.toBeNull();
  expect(markReadResponse!.status()).toBeLessThan(400);
  await expect(
    page.getByTestId(`notification-status-${createdNotification.id}`)
  ).toContainText("已读");

  await page.goto("/learning-paths");
  await expect(
    page.getByRole("heading", { name: "学习路径", exact: true })
  ).toBeVisible();
  await expect(page.getByText("2026Q1 新员工入职计划")).toBeVisible();
});

async function loginAs(
  page: Page,
  request: APIRequestContext,
  username: string,
  password: string
) {
  const accessToken = await apiLogin(request, username, password);

  await page.context().addCookies([
    {
      name: "ltp_access_token",
      value: accessToken,
      url: "http://localhost:3000"
    }
  ]);
  await page.goto("http://localhost:3000/");
  await page.evaluate((token) => {
    window.localStorage.setItem("ltp_access_token", token);
  }, accessToken);

  return accessToken;
}

async function apiLogin(
  request: APIRequestContext,
  username: string,
  password: string
): Promise<string> {
  const response = await request.post(`${API_BASE_URL}/auth/login`, {
    data: {
      username,
      password
    }
  });
  expect(response.ok()).toBeTruthy();

  const payload = (await response.json()) as {
    accessToken: string;
  };
  return payload.accessToken;
}
