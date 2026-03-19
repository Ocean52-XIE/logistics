import type { APIRequestContext, Page, Response } from "@playwright/test";
import { expect, test } from "@playwright/test";

test("employee smoke flow: login -> learn -> submit exam", async ({ page, request }) => {
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

  await page.goto("/exams/EX-301");
  await page.getByTestId("exam-option-Q-1-B").click();

  let submitResponse: Response | null = null;
  await Promise.all([
    page
      .waitForResponse((response) => {
        return (
          response.url().includes("/api/v1/exams/EX-301/submit") &&
          response.request().method() === "POST" &&
          Boolean(response.request().postData()?.includes("Q-1"))
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
