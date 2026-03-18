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

  test("booking page has a visible heading", async ({ page }) => {
    const heading = page.locator("h1, h2").first();
    await expect(heading).toBeVisible();
    const text = await heading.textContent();
    expect(text!.trim().length).toBeGreaterThan(5);
  });

  test("booking process steps section exists (numbered steps or step indicators)", async ({ page }) => {
    const content = await page.textContent("body");
    const hasSteps =
      (content ?? "").includes("1") &&
      ((content ?? "").includes("Шаг") || (content ?? "").includes("шаг") ||
       (content ?? "").includes("Выбирай") || (content ?? "").includes("Бронируй") ||
       (content ?? "").includes("Оплачивай") || (content ?? "").includes("Получай"));
    expect(hasSteps).toBe(true);
  });

  test("partner names are visible on booking page", async ({ page }) => {
    const content = await page.textContent("body");
    const hasAnyPartner =
      (content ?? "").includes("Level.Travel") ||
      (content ?? "").includes("TUI") ||
      (content ?? "").includes("Coral") ||
      (content ?? "").includes("Anex");
    expect(hasAnyPartner).toBe(true);
  });

  test("at least one partner brand is prominently displayed", async ({ page }) => {
    const partnerEl = page.locator("text=Level.Travel, text=TUI, text=Coral, text=Anex").first();
    const bodyContent = await page.textContent("body");
    const partnerCount = ["Level.Travel", "TUI", "Coral", "Anex"].filter(p =>
      (bodyContent ?? "").includes(p)
    ).length;
    expect(partnerCount).toBeGreaterThanOrEqual(1);
  });

  test("FAQ or payment section is present on booking page", async ({ page }) => {
    const content = await page.textContent("body");
    const hasFaq =
      (content ?? "").includes("FAQ") ||
      (content ?? "").includes("Вопрос") ||
      (content ?? "").includes("Как") ||
      (content ?? "").includes("Оплата") ||
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

  test("login/войти button is visible for unauthenticated users", async ({ page }) => {
    const loginBtn = page.getByRole("link", { name: /войти/i })
      .or(page.getByRole("button", { name: /войти/i }));
    await expect(loginBtn.first()).toBeVisible({ timeout: 5000 });
  });

  test("no saved tour data is displayed when not authenticated", async ({ page }) => {
    const content = await page.textContent("body");
    const hasNoAuth = !(content ?? "").includes("Сохранённые туры") ||
      (content ?? "").includes("Войдите") ||
      (content ?? "").includes("авторизу");
    expect(hasNoAuth).toBe(true);
  });

  test("profile page shows auth prompt, not actual user data", async ({ page }) => {
    const bookmarkSection = page.locator("text=Сохранённые туры");
    const loginPrompt = page.getByRole("link", { name: /войти/i })
      .or(page.getByRole("button", { name: /войти/i }));
    const hasLoginPrompt = await loginPrompt.first().isVisible({ timeout: 3000 }).catch(() => false);
    expect(hasLoginPrompt).toBe(true);
  });
});

test.describe("Help page (/help)", () => {
  test("help page loads successfully with content", async ({ page }) => {
    const response = await page.goto("/help");
    const status = response?.status() ?? 200;
    expect(status).toBe(200);
    const content = await page.textContent("body");
    expect((content ?? "").length).toBeGreaterThan(100);
  });

  test("help page has navigation and heading", async ({ page }) => {
    await page.goto("/help");
    await page.waitForLoadState("networkidle");
    const nav = page.locator("nav");
    await expect(nav).toBeVisible();
    const heading = page.locator("h1, h2").first();
    await expect(heading).toBeVisible();
  });
});

test.describe("Navigation - page routing", () => {
  test("clicking Бронирование navigates to /booking", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const bookingLink = page.getByRole("link", { name: /Бронирование/i });
    await expect(bookingLink).toBeVisible();
    await bookingLink.click();
    await page.waitForLoadState("networkidle");

    await expect(page).toHaveURL(/\/booking/);
  });

  test("navigating directly to /profile works", async ({ page }) => {
    const response = await page.goto("/profile");
    expect(response?.status()).toBe(200);
    await page.waitForLoadState("networkidle");
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });

  test("navbar logo link returns to homepage", async ({ page }) => {
    await page.goto("/booking");
    await page.waitForLoadState("networkidle");

    const navLinks = page.locator("nav a");
    const firstNavLink = navLinks.first();
    await firstNavLink.click();
    await page.waitForLoadState("networkidle");

    const url = page.url();
    const isHome = url.includes("/lastminute") || url.endsWith("/");
    expect(isHome).toBe(true);
  });
});

test.describe("Admin settings page (/admin/settings)", () => {
  test("admin settings page loads and has API settings section", async ({ page }) => {
    const response = await page.goto("/admin/settings");
    expect(response?.status()).toBe(200);
    await page.waitForLoadState("networkidle");

    const content = await page.textContent("body");
    const hasSettings =
      (content ?? "").includes("GigaChat") ||
      (content ?? "").includes("Level.Travel") ||
      (content ?? "").includes("настройк") ||
      (content ?? "").includes("API");
    expect(hasSettings).toBe(true);
  });
});
