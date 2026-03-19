import type { APIRequestContext, Page, Response } from "@playwright/test";
import { expect, test } from "@playwright/test";

test("admin smoke flow: login -> create/publish course -> create training plan -> view reports", async ({
  page,
  request
}) => {
  await loginAs(page, request, "admin1", "123456");
  await page.goto("/admin");
  await expect(page).toHaveURL(/\/admin$/);

  await page.goto("/admin/courses");

  const suffix = Date.now().toString().slice(-6);
  const courseTitle = `E2E Course ${suffix}`;
  const createResponsePromise = page.waitForResponse((response) => {
    return (
      response.url().includes("/api/v1/admin/courses") &&
      response.request().method() === "POST"
    );
  });

  await page.getByTestId("admin-course-title").fill(courseTitle);
  await page.getByTestId("admin-course-category").fill("E2E Category");
  await page.getByTestId("admin-course-duration").fill("45");
  await page.getByTestId("admin-course-requirement").selectOption("required");
  await page.getByTestId("admin-course-due-date").fill("2026-12-31");
  await page.getByTestId("admin-course-description").fill("Created by Playwright E2E.");
  await page.getByTestId("admin-course-create").click();

  const createResponse = await createResponsePromise;
  expect(createResponse.status()).toBeLessThan(400);
  const createdCourse = (await createResponse.json()) as { id: string; title: string };
  expect(createdCourse.title).toBe(courseTitle);

  let publishResponse: Response | null = null;
  await Promise.all([
    page
      .waitForResponse((response) => {
        return (
          response.url().includes(`/api/v1/admin/courses/${createdCourse.id}/publish`) &&
          response.request().method() === "POST"
        );
      })
      .then((response) => {
        publishResponse = response;
      }),
    page.getByTestId(`admin-course-publish-${createdCourse.id}`).click()
  ]);
  expect(publishResponse).not.toBeNull();
  expect(publishResponse!.status()).toBeLessThan(400);

  await page.goto("/admin/training-plans");
  const planName = `E2E Plan ${suffix}`;
  await page.getByTestId("training-plan-name").fill(planName);
  await page.getByTestId("training-plan-start").fill("2026-03-20");
  await page.getByTestId("training-plan-end").fill("2026-03-31");
  await page.getByTestId(`training-plan-course-${createdCourse.id}`).check();
  await page.getByTestId("training-plan-user-U-EMP-1001").check();

  let trainingPlanResponse: Response | null = null;
  await Promise.all([
    page
      .waitForResponse((response) => {
        return (
          response.url().includes("/api/v1/admin/training-plans") &&
          response.request().method() === "POST"
        );
      })
      .then((response) => {
        trainingPlanResponse = response;
      }),
    page.getByTestId("training-plan-submit").click()
  ]);
  expect(trainingPlanResponse).not.toBeNull();
  expect(trainingPlanResponse!.status()).toBeLessThan(400);

  await expect(page.getByText(planName, { exact: true })).toBeVisible();

  await page.goto("/admin/reports");
  await expect(page.getByRole("heading", { name: "报表概览" })).toBeVisible();
});

async function loginAs(
  page: Page,
  request: APIRequestContext,
  username: string,
  password: string
) {
  const response = await request.post("http://localhost:4000/api/v1/auth/login", {
    data: {
      username,
      password
    }
  });
  expect(response.ok()).toBeTruthy();

  const payload = (await response.json()) as {
    accessToken: string;
  };

  await page.context().addCookies([
    {
      name: "ltp_access_token",
      value: payload.accessToken,
      url: "http://localhost:3000"
    }
  ]);
  await page.goto("http://localhost:3000/");
  await page.evaluate((token) => {
    window.localStorage.setItem("ltp_access_token", token);
  }, payload.accessToken);
}
