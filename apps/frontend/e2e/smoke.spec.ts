import { expect, test } from "@playwright/test";

test("employee smoke flow: login -> learn -> submit exam", async ({ page }) => {
  await page.goto("/login");

  await page.getByTestId("login-username").fill("employee1");
  await page.getByTestId("login-password").fill("123456");
  await page.getByTestId("login-submit").click();

  await expect(page).toHaveURL(/\/dashboard$/);

  await page.goto("/lessons/L-1004");
  await Promise.all([
    page.waitForResponse((response) => {
      return (
        response.url().includes("/api/v1/lessons/L-1004/progress") &&
        response.request().method() === "POST" &&
        response.status() < 400
      );
    }),
    page.getByTestId("lesson-mark-complete").click()
  ]);

  await page.goto("/exams/EX-301");
  await page.getByTestId("exam-option-Q-1-B").click();

  await Promise.all([
    page.waitForResponse((response) => {
      return (
        response.url().includes("/api/v1/exams/EX-301/submit") &&
        response.request().method() === "POST" &&
        response.status() < 400
      );
    }),
    page.getByTestId("exam-submit").click()
  ]);

  await expect(page.getByTestId("exam-submit-result")).toBeVisible();
});
