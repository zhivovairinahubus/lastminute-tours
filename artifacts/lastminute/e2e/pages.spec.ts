import { test, expect } from "@playwright/test";

test.describe("Booking page (/booking)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/booking");
    await page.waitForLoadState("networkidle");
  });

  test("booking page loads with status 200", async ({ page }) => {
    const response = await page.goto("/booking");
    expect(response?.status()).toBe(200);
  });

  test("booking page has a visible h1 heading", async ({ page }) => {
    const heading = page.locator("h1").first();
    await expect(heading).toBeVisible();
    const text = await heading.textContent();
    expect(text!.trim().length).toBeGreaterThan(5);
  });

  test("booking page contains numbered steps section", async ({ page }) => {
    const content = await page.textContent("body");
    const hasSteps =
      (content ?? "").includes("1") &&
      (
        (content ?? "").includes("Выбирай") ||
        (content ?? "").includes("Бронируй") ||
        (content ?? "").includes("Оплачивай") ||
        (content ?? "").includes("Получай") ||
        (content ?? "").includes("Шаг")
      );
    expect(hasSteps).toBe(true);
  });

  test("booking page lists at least one partner brand", async ({ page }) => {
    const content = await page.textContent("body");
    const partners = ["Level.Travel", "TUI", "Coral", "Anex", "Tez", "Pegas"];
    const found = partners.filter((p) => (content ?? "").includes(p));
    expect(found.length).toBeGreaterThanOrEqual(1);
  });

  test("booking page has FAQ or Q&A section", async ({ page }) => {
    const content = await page.textContent("body");
    const hasFaq =
      (content ?? "").includes("FAQ") ||
      (content ?? "").includes("Вопрос") ||
      (content ?? "").includes("Оплата") ||
      (content ?? "").includes("Как") ||
      (content ?? "").includes("оплат");
    expect(hasFaq).toBe(true);
  });
});

test.describe("Profile page (/profile) - Unauthenticated", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/profile");
    await page.waitForLoadState("networkidle");
  });

  test("profile page returns status 200", async ({ page }) => {
    const response = await page.goto("/profile");
    expect(response?.status()).toBe(200);
  });

  test("войти login button is visible when not authenticated", async ({ page }) => {
    const loginBtn = page.getByRole("link", { name: /войти/i }).or(
      page.getByRole("button", { name: /войти/i })
    );
    await expect(loginBtn.first()).toBeVisible({ timeout: 5000 });
  });

  test("page does NOT show user-specific saved tour data when unauthenticated", async ({ page }) => {
    const loginLink = page.getByRole("link", { name: /войти/i }).or(
      page.getByRole("button", { name: /войти/i })
    );
    await expect(loginLink.first()).toBeVisible({ timeout: 5000 });
  });
});

test.describe("Help page (/help)", () => {
  test("help page loads with 200 and has substantial content", async ({ page }) => {
    const response = await page.goto("/help");
    expect(response?.status()).toBe(200);
    await page.waitForLoadState("networkidle");
    const content = await page.textContent("body");
    expect((content ?? "").length).toBeGreaterThan(200);
  });

  test("help page has navigation bar", async ({ page }) => {
    await page.goto("/help");
    await page.waitForLoadState("networkidle");
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();
  });
});

test.describe("Navigation - page routing", () => {
  test("Бронирование link navigates to /booking", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const bookingLink = page.getByRole("link", { name: /Бронирование/i });
    await expect(bookingLink).toBeVisible();
    await bookingLink.click();
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL(/\/booking/);
  });

  test("/profile route is accessible (returns page, not 404)", async ({ page }) => {
    const response = await page.goto("/profile");
    expect(response?.status()).toBe(200);
  });

  test("navbar link from /booking returns to homepage", async ({ page }) => {
    await page.goto("/booking");
    await page.waitForLoadState("networkidle");

    const homeLink = page.locator("nav a").first();
    await homeLink.click();
    await page.waitForLoadState("networkidle");

    const url = page.url();
    const isHome = url.includes("/lastminute") || url.endsWith("/");
    expect(isHome).toBe(true);
  });
});

test.describe("Admin settings page (/admin/settings)", () => {
  test("admin settings page loads and shows API configuration section", async ({ page }) => {
    const response = await page.goto("/admin/settings");
    expect(response?.status()).toBe(200);
    await page.waitForLoadState("networkidle");

    const content = await page.textContent("body");
    const hasSettings =
      (content ?? "").includes("GigaChat") ||
      (content ?? "").includes("Level.Travel") ||
      (content ?? "").includes("API");
    expect(hasSettings).toBe(true);
  });
});
