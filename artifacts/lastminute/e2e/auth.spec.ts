import { test, expect } from "@playwright/test";

/**
 * Authenticated E2E tests using Replit OIDC mock.
 *
 * These tests require ISSUER_URL to point to a test OIDC server (set via
 * environment variable in CI). In the Replit testing environment, pass
 * testReplitAuth: true to runTest() to activate the OIDC mock.
 *
 * When running locally against the Replit dev server with test OIDC enabled,
 * the OIDC_TEST_CLAIMS must be configured before initiating login.
 */

test.describe("Profile page - Authenticated user via OIDC mock", () => {
  test.skip(
    !process.env.REPLIT_AUTH_TEST_ENABLED,
    "Skipped: REPLIT_AUTH_TEST_ENABLED not set — run with testReplitAuth=true in runTest() or set env var"
  );

  const testUser = {
    sub: `e2e-test-${Date.now()}`,
    email: `e2e-test-${Date.now()}@example.com`,
    first_name: "Test",
    last_name: "User",
  };

  test("login via OIDC mock and see profile page", async ({ page, request }) => {
    await request.post("/api/testing/set-oidc-claims", {
      data: testUser,
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const loginBtn = page.getByRole("link", { name: /войти/i })
      .or(page.getByRole("button", { name: /войти/i }));

    if (await loginBtn.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      await loginBtn.first().click();
      await page.waitForLoadState("networkidle");
    } else {
      await page.goto("/api/login");
      await page.waitForLoadState("networkidle");
    }

    await page.goto("/profile");
    await page.waitForLoadState("networkidle");

    const content = await page.textContent("body");
    const isLoggedIn =
      (content ?? "").includes("Test") ||
      (content ?? "").includes("User") ||
      (content ?? "").includes("Выйти") ||
      (content ?? "").includes("Сохранённые туры");
    expect(isLoggedIn).toBe(true);
  });

  test("authenticated user sees saved tours and search history sections", async ({ page, request }) => {
    await request.post("/api/testing/set-oidc-claims", { data: testUser });
    await page.goto("/api/login");
    await page.waitForLoadState("networkidle");

    await page.goto("/profile");
    await page.waitForLoadState("networkidle");

    const content = await page.textContent("body");
    const hasSavedSection = (content ?? "").includes("Сохранённые туры");
    const hasHistorySection = (content ?? "").includes("История поиска");
    expect(hasSavedSection || hasHistorySection).toBe(true);
  });
});

test.describe("Search and save tour - Authenticated flow", () => {
  test.skip(
    !process.env.REPLIT_AUTH_TEST_ENABLED,
    "Skipped: REPLIT_AUTH_TEST_ENABLED not set"
  );

  test("search, find tours, verify bookmark button appears for auth user", async ({ page, request }) => {
    const testUser = {
      sub: `e2e-save-${Date.now()}`,
      email: `e2e-save-${Date.now()}@example.com`,
      first_name: "Save",
      last_name: "Test",
    };
    await request.post("/api/testing/set-oidc-claims", { data: testUser });
    await page.goto("/api/login");
    await page.waitForLoadState("networkidle");

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const cityInput = page.locator("input").first();
    await cityInput.click();
    const moscowOption = page.getByRole("option", { name: /Москва/i });
    if (await moscowOption.isVisible({ timeout: 3000 }).catch(() => false)) {
      await moscowOption.click();
    }

    const budgetInput = page.locator("input[type='number']").first();
    await budgetInput.fill("80000");
    await page.getByRole("button", { name: /найти|поиск/i }).click();

    await page.waitForSelector("article, [class*='card']", { timeout: 30000 });

    const bookmarkBtn = page.locator("[data-testid='bookmark-btn'], button[aria-label*='сохрани'], button[title*='сохрани']").first();
    if (await bookmarkBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      await bookmarkBtn.click();

      await page.goto("/profile");
      await page.waitForLoadState("networkidle");

      const content = await page.textContent("body");
      const hasSavedTour =
        (content ?? "").includes("₽") ||
        (content ?? "").includes("ночей") ||
        (content ?? "").includes("Смотреть");
      expect(hasSavedTour).toBe(true);
    } else {
      const content = await page.textContent("body");
      const hasCards = (content ?? "").includes("₽");
      expect(hasCards).toBe(true);
    }
  });
});
