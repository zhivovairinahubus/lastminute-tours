import { test, expect } from "@playwright/test";

test.describe("Booking page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/booking");
    await page.waitForLoadState("networkidle");
  });

  test("booking page loads without error", async ({ page }) => {
    await expect(page).not.toHaveTitle(/404|Error/i);
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });

  test("booking page has a main heading", async ({ page }) => {
    const heading = page.locator("h1, h2").first();
    await expect(heading).toBeVisible();
    const text = await heading.textContent();
    expect(text!.length).toBeGreaterThan(3);
  });

  test("booking process steps are shown", async ({ page }) => {
    const content = await page.content();
    const hasSteps = content.includes("Шаг") || content.includes("шаг") ||
      content.includes("Выбирай") || content.includes("Бронируй") ||
      content.includes("step") || content.includes("процесс");
    expect(hasSteps).toBe(true);
  });

  test("partner names are visible", async ({ page }) => {
    const content = await page.content();
    const hasPartners = content.includes("Level.Travel") || content.includes("TUI") ||
      content.includes("Coral") || content.includes("Anex");
    expect(hasPartners).toBe(true);
  });

  test("FAQ section exists on booking page", async ({ page }) => {
    const content = await page.content();
    const hasFaq = content.includes("FAQ") || content.includes("Вопрос") ||
      content.includes("вопрос") || content.includes("Оплата") || content.includes("оплата");
    expect(hasFaq).toBe(true);
  });
});

test.describe("Profile page (unauthenticated)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/profile");
    await page.waitForLoadState("networkidle");
  });

  test("profile page loads without crash", async ({ page }) => {
    await expect(page).not.toHaveTitle(/404|Error/i);
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });

  test("shows login prompt when unauthenticated", async ({ page }) => {
    const loginBtn = page.getByRole("link", { name: /войти/i })
      .or(page.getByRole("button", { name: /войти/i }));
    await expect(loginBtn.first()).toBeVisible({ timeout: 5000 });
  });

  test("does not show saved tours when unauthenticated", async ({ page }) => {
    const content = await page.content();
    const hasNoTourCards = !content.includes("Grand Hotel") && !content.includes("Delphin");
    expect(hasNoTourCards).toBe(true);
  });
});

test.describe("Help page", () => {
  test("help page loads (or 404)", async ({ page }) => {
    const res = await page.goto("/help");
    const status = res?.status() ?? 200;
    expect([200, 404]).toContain(status);
  });

  test("if help page exists, has content", async ({ page }) => {
    const res = await page.goto("/help");
    if (res?.status() === 200) {
      const body = page.locator("body");
      await expect(body).toBeVisible();
      const content = await body.textContent();
      expect(content!.length).toBeGreaterThan(50);
    }
  });
});

test.describe("Admin settings page", () => {
  test("admin settings page loads", async ({ page }) => {
    const res = await page.goto("/admin/settings");
    const status = res?.status() ?? 200;
    if (status === 200) {
      const body = page.locator("body");
      await expect(body).toBeVisible();
    }
  });
});

test.describe("Navigation", () => {
  test("navbar links work - booking", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const bookingLink = page.getByRole("link", { name: /Бронирование/i });
    await bookingLink.click();
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL(/\/booking/);
  });

  test("logo navigates to homepage", async ({ page }) => {
    await page.goto("/booking");
    await page.waitForLoadState("networkidle");

    const logo = page.locator("nav a").first();
    await logo.click();
    await page.waitForLoadState("networkidle");

    const url = page.url();
    const isHome = url.endsWith("/lastminute") || url.endsWith("/lastminute/") || url.endsWith("/");
    expect(isHome).toBe(true);
  });
});
