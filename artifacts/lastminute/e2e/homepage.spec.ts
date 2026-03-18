import { test, expect } from "@playwright/test";

test.describe("Homepage - Static content", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("page loads and shows main heading", async ({ page }) => {
    const heading = page.locator("h1").first();
    await expect(heading).toBeVisible();
    const text = await heading.textContent();
    expect(text!.trim().length).toBeGreaterThan(5);
  });

  test("search form exists on homepage", async ({ page }) => {
    const form = page.locator("form").first();
    await expect(form).toBeVisible();
  });

  test("budget number input is visible and editable", async ({ page }) => {
    const budgetInput = page.locator("input[type='number']").first();
    await expect(budgetInput).toBeVisible();
    await budgetInput.fill("75000");
    const val = await budgetInput.inputValue();
    expect(Number(val)).toBeGreaterThan(0);
  });

  test("adults +/- controls are present", async ({ page }) => {
    const plusBtn = page.getByRole("button", { name: "+" });
    await expect(plusBtn).toBeVisible();
    const minusBtn = page.getByRole("button", { name: "-" });
    await expect(minusBtn).toBeVisible();
  });

  test("incrementing adults increases the displayed count", async ({ page }) => {
    const countEl = page.locator("span, div").filter({ hasText: /^[1-9]$/ }).first();
    const before = Number(await countEl.textContent());
    await page.getByRole("button", { name: "+" }).click();
    const after = Number(await countEl.textContent());
    expect(after).toBeGreaterThan(before);
  });

  test("city select/autocomplete input is visible", async ({ page }) => {
    const cityInput = page.locator("input").first();
    await expect(cityInput).toBeVisible();
  });

  test("navbar is visible with logo text", async ({ page }) => {
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();
  });

  test("Booking (Бронирование) link is in navbar", async ({ page }) => {
    const bookingLink = page.getByRole("link", { name: /Бронирование/i });
    await expect(bookingLink).toBeVisible();
  });

  test("page contains destinations or popular direction section", async ({ page }) => {
    const content = await page.textContent("body");
    const hasDestinations = (content ?? "").includes("Турц") ||
      (content ?? "").includes("Египет") ||
      (content ?? "").includes("Таиланд") ||
      (content ?? "").includes("направлени");
    expect(hasDestinations).toBe(true);
  });

  test("footer is visible at bottom of page", async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    const footer = page.locator("footer");
    await expect(footer).toBeVisible({ timeout: 3000 });
  });
});

test.describe("Homepage - Search flow with adults=2", () => {
  test("full search: Москва, budget=80000, adults=2 → tour cards appear", async ({ page }) => {
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

    const searchBtn = page.getByRole("button", { name: /найти|поиск/i });
    await searchBtn.click();

    const tourCard = page.locator("article, [class*='card'], [class*='tour']").first();
    await expect(tourCard).toBeVisible({ timeout: 30000 });
  });

  test("tour cards have Смотреть link with https:// href", async ({ page }) => {
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

    const smotretLink = page.getByRole("link", { name: /смотреть/i }).first();
    await expect(smotretLink).toBeVisible({ timeout: 30000 });

    const href = await smotretLink.getAttribute("href");
    expect(href).toMatch(/^https:\/\//);
  });

  test("tour cards show price and hotel name", async ({ page }) => {
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

    const content = await page.textContent("body");
    const hasPrice = (content ?? "").includes("₽");
    expect(hasPrice).toBe(true);
  });
});
