import { expect, test } from "@playwright/test";

test("admin smoke flow: login -> create/publish course -> create training plan -> view reports", async ({
  page
}) => {
  await page.goto("/login");
  await page.getByTestId("login-username").fill("admin1");
  await page.getByTestId("login-password").fill("123456");
  await page.getByTestId("login-submit").click();
  await expect(page).toHaveURL(/\/admin$/);

  await page.goto("/admin/courses");

  const suffix = Date.now().toString().slice(-6);
  const courseTitle = `E2E Course ${suffix}`;
  const createResponsePromise = page.waitForResponse((response) => {
    return (
      response.url().includes("/api/v1/admin/courses") &&
      response.request().method() === "POST" &&
      response.status() < 400
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
  const createdCourse = (await createResponse.json()) as { id: string; title: string };
  expect(createdCourse.title).toBe(courseTitle);

  await Promise.all([
    page.waitForResponse((response) => {
      return (
        response.url().includes(`/api/v1/admin/courses/${createdCourse.id}/publish`) &&
        response.request().method() === "POST" &&
        response.status() < 400
      );
    }),
    page.getByTestId(`admin-course-publish-${createdCourse.id}`).click()
  ]);

  await page.goto("/admin/training-plans");
  const planName = `E2E Plan ${suffix}`;
  await page.getByTestId("training-plan-name").fill(planName);
  await page.getByTestId("training-plan-start").fill("2026-03-20");
  await page.getByTestId("training-plan-end").fill("2026-03-31");
  await page.getByTestId(`training-plan-course-${createdCourse.id}`).check();
  await page.getByTestId("training-plan-user-U-EMP-1001").check();

  await Promise.all([
    page.waitForResponse((response) => {
      return (
        response.url().includes("/api/v1/admin/training-plans") &&
        response.request().method() === "POST" &&
        response.status() < 400
      );
    }),
    page.getByTestId("training-plan-submit").click()
  ]);

  await expect(page.getByText(planName)).toBeVisible();

  await page.goto("/admin/reports");
  await expect(page.getByRole("heading", { name: "Report Overview" })).toBeVisible();
});
