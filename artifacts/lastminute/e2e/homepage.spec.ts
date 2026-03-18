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

  test("search form (data-testid='search-form') is visible", async ({ page }) => {
    const form = page.locator("[data-testid='search-form']");
    await expect(form).toBeVisible();
  });

  test("city-select has Москва as an option", async ({ page }) => {
    const citySelect = page.locator("[data-testid='city-select']");
    await expect(citySelect).toBeVisible();
    const options = await citySelect.locator("option").allTextContents();
    expect(options.some((o) => o.includes("Москва"))).toBe(true);
  });

  test("budget-input is visible and accepts numeric value", async ({ page }) => {
    const budgetInput = page.locator("[data-testid='budget-input']");
    await expect(budgetInput).toBeVisible();
    await budgetInput.fill("75000");
    const val = await budgetInput.inputValue();
    expect(Number(val)).toBe(75000);
  });

  test("adults-select has all options 1-10", async ({ page }) => {
    const adultsSelect = page.locator("[data-testid='adults-select']");
    await expect(adultsSelect).toBeVisible();
    const options = await adultsSelect.locator("option").allTextContents();
    expect(options.length).toBe(10);
    for (let i = 1; i <= 10; i++) {
      expect(options.some((o) => o.startsWith(String(i)))).toBe(true);
    }
  });

  test("adults-select: selecting value 5 sets the select to 5", async ({ page }) => {
    const adultsSelect = page.locator("[data-testid='adults-select']");
    await adultsSelect.selectOption("5");
    const val = await adultsSelect.inputValue();
    expect(val).toBe("5");
  });

  test("search-btn is visible and not disabled by default", async ({ page }) => {
    const searchBtn = page.locator("[data-testid='search-btn']");
    await expect(searchBtn).toBeVisible();
    await expect(searchBtn).toBeEnabled();
  });

  test("navbar is visible", async ({ page }) => {
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();
  });

  test("Бронирование link is in navbar", async ({ page }) => {
    const bookingLink = page.getByRole("link", { name: /Бронирование/i });
    await expect(bookingLink).toBeVisible();
  });

  test("page contains popular destinations section", async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
    const content = await page.textContent("body");
    const hasDestinations =
      (content ?? "").includes("Турц") ||
      (content ?? "").includes("Египет") ||
      (content ?? "").includes("Таиланд") ||
      (content ?? "").includes("направлени");
    expect(hasDestinations).toBe(true);
  });

  test("FAQ section exists with accordion items", async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
    const faqList = page.locator("[data-testid='faq-list']");
    await expect(faqList).toBeVisible({ timeout: 5000 });
    const faqItems = faqList.locator("[data-testid='faq-item']");
    const count = await faqItems.count();
    expect(count).toBeGreaterThanOrEqual(4);
  });
});

test.describe("Homepage - FAQ accordion interaction", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(500);
  });

  test("first FAQ item is open by default (openIndex=0)", async ({ page }) => {
    const firstItem = page.locator("[data-testid='faq-item']").first();
    const dataOpen = await firstItem.getAttribute("data-open");
    expect(dataOpen).toBe("true");

    const answer = firstItem.locator("[data-testid='faq-answer']");
    await expect(answer).toBeVisible({ timeout: 3000 });
  });

  test("clicking closed FAQ item opens it (aria-expanded changes to true)", async ({ page }) => {
    const items = page.locator("[data-testid='faq-item']");
    const secondToggle = items.nth(1).locator("[data-testid='faq-toggle']");

    const ariaExpandedBefore = await secondToggle.getAttribute("aria-expanded");
    expect(ariaExpandedBefore).toBe("false");

    await secondToggle.click();
    await page.waitForTimeout(400);

    const ariaExpandedAfter = await secondToggle.getAttribute("aria-expanded");
    expect(ariaExpandedAfter).toBe("true");

    const answer = items.nth(1).locator("[data-testid='faq-answer']");
    await expect(answer).toBeVisible({ timeout: 3000 });
  });

  test("clicking open FAQ item closes it (accordion collapse)", async ({ page }) => {
    const firstItem = page.locator("[data-testid='faq-item']").first();
    const firstToggle = firstItem.locator("[data-testid='faq-toggle']");

    await expect(firstItem.locator("[data-testid='faq-answer']")).toBeVisible({ timeout: 3000 });

    await firstToggle.click();
    await page.waitForTimeout(400);

    const dataOpen = await firstItem.getAttribute("data-open");
    expect(dataOpen).toBe("false");

    const answer = firstItem.locator("[data-testid='faq-answer']");
    await expect(answer).not.toBeVisible({ timeout: 3000 });
  });

  test("only one FAQ item open at a time (opening new collapses previous)", async ({ page }) => {
    const items = page.locator("[data-testid='faq-item']");
    const firstToggle = items.first().locator("[data-testid='faq-toggle']");
    const secondToggle = items.nth(1).locator("[data-testid='faq-toggle']");

    await expect(items.first().getAttribute("data-open")).resolves.toBe("true");

    await secondToggle.click();
    await page.waitForTimeout(400);

    const firstOpen = await items.first().getAttribute("data-open");
    const secondOpen = await items.nth(1).getAttribute("data-open");
    expect(firstOpen).toBe("false");
    expect(secondOpen).toBe("true");
  });
});

test.describe("Homepage - Search flow", () => {
  test("full search: Москва, 80000, adults=2 → tour cards appear", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.locator("[data-testid='city-select']").selectOption("Москва");
    await page.locator("[data-testid='budget-input']").fill("80000");
    await page.locator("[data-testid='adults-select']").selectOption("2");
    await page.locator("[data-testid='search-btn']").click();

    const firstCard = page.locator("[data-testid='tour-card']").first();
    await expect(firstCard).toBeVisible({ timeout: 30000 });
  });

  test("tour cards show ₽ price in title area", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.locator("[data-testid='city-select']").selectOption("Москва");
    await page.locator("[data-testid='budget-input']").fill("80000");
    await page.locator("[data-testid='search-btn']").click();

    await page.locator("[data-testid='tour-card']").first().waitFor({ timeout: 30000 });

    const content = await page.textContent("body");
    expect((content ?? "").includes("₽")).toBe(true);
  });

  test("Смотреть link (data-testid='smotret-link') has https:// href", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    await page.locator("[data-testid='city-select']").selectOption("Москва");
    await page.locator("[data-testid='budget-input']").fill("80000");
    await page.locator("[data-testid='search-btn']").click();

    const smotretLink = page.locator("[data-testid='smotret-link']").first();
    await expect(smotretLink).toBeVisible({ timeout: 30000 });

    const href = await smotretLink.getAttribute("href");
    expect(href).toMatch(/^https:\/\//);
  });
});
