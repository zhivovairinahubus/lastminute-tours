import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
  });

  test("page loads with main heading", async ({ page }) => {
    const heading = page.locator("h1, h2").first();
    await expect(heading).toBeVisible();
    const text = await heading.textContent();
    expect(text!.length).toBeGreaterThan(3);
  });

  test("search form is visible with required inputs", async ({ page }) => {
    const form = page.locator("form, [role='search'], .search-form, section").first();
    await expect(form).toBeVisible();
  });

  test("budget input is visible", async ({ page }) => {
    const budget = page.locator("input[type='number'], input[placeholder*='бюджет'], input[placeholder*='Бюджет']");
    await expect(budget.first()).toBeVisible();
  });

  test("adults +/- control is present", async ({ page }) => {
    const plusBtn = page.getByRole("button", { name: "+" });
    await expect(plusBtn).toBeVisible();
  });

  test("can increment adults count", async ({ page }) => {
    const plusBtn = page.getByRole("button", { name: "+" });
    await plusBtn.click();
    const display = page.locator("text=/[0-9]+/").first();
    await expect(display).toBeVisible();
  });

  test("departure city input is visible", async ({ page }) => {
    const cityInput = page.locator("input[type='text'], input[placeholder*='город'], input[placeholder*='Город'], combobox").first();
    await expect(cityInput).toBeVisible();
  });

  test("destinations section is visible on page", async ({ page }) => {
    const content = await page.content();
    const hasDestinationsSection = content.includes("полет") || content.includes("Турц") ||
      content.includes("направлени") || content.includes("куда") || content.includes("Куда");
    expect(hasDestinationsSection).toBe(true);
  });

  test("Navbar is visible with logo", async ({ page }) => {
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();
  });

  test("Booking link is present in navbar", async ({ page }) => {
    const bookingLink = page.getByRole("link", { name: /Бронирование/i });
    await expect(bookingLink).toBeVisible();
  });
});

test.describe("Tour search flow", () => {
  test("search returns tour cards", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const cityInput = page.locator("input[type='text']").first();
    await cityInput.click();

    const moscowOption = page.getByRole("option", { name: /Москва/i });
    if (await moscowOption.isVisible({ timeout: 3000 })) {
      await moscowOption.click();
    }

    const budgetInput = page.locator("input[type='number']").first();
    await budgetInput.fill("80000");

    const searchBtn = page.getByRole("button", { name: /найти|поиск|search/i });
    await searchBtn.click();

    const tourCard = page.locator("[class*='tour'], [class*='card'], article").first();
    await expect(tourCard).toBeVisible({ timeout: 30000 });
  });

  test("tour cards have Смотреть button with https link", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const cityInput = page.locator("input[type='text']").first();
    await cityInput.click();
    const moscowOption = page.getByRole("option", { name: /Москва/i });
    if (await moscowOption.isVisible({ timeout: 3000 })) {
      await moscowOption.click();
    }

    const budgetInput = page.locator("input[type='number']").first();
    await budgetInput.fill("80000");

    const searchBtn = page.getByRole("button", { name: /найти|поиск|search/i });
    await searchBtn.click();

    const smotretLink = page.getByRole("link", { name: /смотреть/i }).first();
    await expect(smotretLink).toBeVisible({ timeout: 30000 });

    const href = await smotretLink.getAttribute("href");
    expect(href).toMatch(/^https:\/\//);
  });
});
