import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  workers: 1,
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry"
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    }
  ],
  webServer: [
    {
      command: "npm run start:test --prefix ../backend",
      url: "http://localhost:4000/api/v1/health",
      reuseExistingServer: false,
      timeout: 120_000
    },
    {
      command: "npm run start",
      url: "http://localhost:3000/login",
      reuseExistingServer: false,
      timeout: 120_000
    }
  ]
});
