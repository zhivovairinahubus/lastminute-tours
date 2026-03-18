import { defineConfig, devices } from "@playwright/test";

const BASE_URL = process.env.E2E_BASE_URL ||
  (process.env.REPLIT_DEV_DOMAIN
    ? `https://${process.env.REPLIT_DEV_DOMAIN}/lastminute`
    : "http://localhost:5173");

export default defineConfig({
  testDir: "./e2e",
  timeout: 60000,
  retries: 0,
  reporter: [["list"]],
  use: {
    baseURL: BASE_URL,
    headless: true,
    ignoreHTTPSErrors: true,
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        channel: process.env.PLAYWRIGHT_CHROME_CHANNEL || undefined,
      },
    },
  ],
});
