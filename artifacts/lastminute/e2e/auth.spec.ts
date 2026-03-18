import { test, expect } from "@playwright/test";

/**
 * Authenticated E2E tests using the dev-only /api/testing/login GET endpoint.
 *
 * NOTE on routing: The app BASE_PATH is "/" (not "/lastminute"). The proxy strips
 * the /lastminute prefix before serving from Vite, so the SPA routes are at /.
 * - Homepage: / (rendered at proxy domain root)
 * - Profile: /profile
 * - Booking: /booking
 *
 * The testing/login redirect should go to "/" or "/profile" (not "/lastminute/").
 *
 * The playwright.config.ts baseURL is set to https://REPLIT_DEV_DOMAIN/lastminute
 * so paths like "/" in goto() resolve to /lastminute/ in the browser.
 * BUT the proxy strips /lastminute, so Vite sees "/" which renders the homepage.
 */

test.describe("Authentication - /api/testing/login browser flow", () => {
  test("GET /api/testing/login sets session cookie and /api/auth/me returns user", async ({ page }) => {
    const sub = `e2e-verify-${Date.now()}`;

    const response = await page.goto(
      `../api/testing/login?sub=${sub}&email=${sub}%40e2e.test&first_name=Verif&last_name=Test&redirect=/`,
      { waitUntil: "networkidle" }
    );

    if (!response || response.status() === 404) {
      test.skip();
      return;
    }

    const meRes = await page.request.get("../api/auth/me");
    expect(meRes.status()).toBe(200);
    const meBody = await meRes.json();
    expect(meBody.user).not.toBeNull();
    expect(meBody.user.id).toBe(sub);
    expect(meBody.user.firstName).toBe("Verif");
  });

  test("authenticated user profile page shows user content (no войти button)", async ({ page }) => {
    const sub = `e2e-profile-${Date.now()}`;

    const response = await page.goto(
      `../api/testing/login?sub=${sub}&email=${sub}%40e2e.test&first_name=Profile&last_name=Test&redirect=/profile`,
      { waitUntil: "networkidle" }
    );

    if (!response || response.status() === 404) { test.skip(); return; }

    await page.waitForTimeout(1000);

    const loginLink = page.getByRole("link", { name: /войти/i }).or(
      page.getByRole("button", { name: /войти/i })
    );
    const loginLinkVisible = await loginLink.first().isVisible({ timeout: 2000 }).catch(() => false);
    expect(loginLinkVisible).toBe(false);

    const content = await page.textContent("body");
    const isLoggedInState =
      (content ?? "").includes("Сохранённые туры") ||
      (content ?? "").includes("История") ||
      (content ?? "").includes("Выйти") ||
      (content ?? "").includes("Profile") ||
      (content ?? "").includes("Verif");
    expect(isLoggedInState).toBe(true);
  });
});

test.describe("Search + Save tour - Authenticated flow", () => {
  test("search results show bookmark-btn for authenticated user", async ({ page }) => {
    const sub = `e2e-save-${Date.now()}`;

    const loginRes = await page.goto(
      `../api/testing/login?sub=${sub}&email=${sub}%40e2e.test&first_name=Save&last_name=Test&redirect=/`,
      { waitUntil: "networkidle" }
    );

    if (!loginRes || loginRes.status() === 404) { test.skip(); return; }

    const searchForm = page.locator("[data-testid='search-form']");
    await expect(searchForm).toBeVisible({ timeout: 5000 });

    await page.locator("[data-testid='city-select']").selectOption("Москва");
    await page.locator("[data-testid='budget-input']").fill("80000");
    await page.locator("[data-testid='adults-select']").selectOption("2");
    await page.locator("[data-testid='search-btn']").click();

    const firstCard = page.locator("[data-testid='tour-card']").first();
    await expect(firstCard).toBeVisible({ timeout: 30000 });

    const bookmarkBtn = page.locator("[data-testid='bookmark-btn']").first();
    await expect(bookmarkBtn).toBeVisible();
    await expect(bookmarkBtn).toBeEnabled();

    const savedBefore = await bookmarkBtn.getAttribute("data-saved");
    expect(savedBefore).toBe("false");
  });

  test("clicking bookmark-btn sets data-saved=true", async ({ page }) => {
    const sub = `e2e-bm-${Date.now()}`;

    const loginRes = await page.goto(
      `../api/testing/login?sub=${sub}&email=${sub}%40e2e.test&first_name=BM&last_name=Test&redirect=/`,
      { waitUntil: "networkidle" }
    );
    if (!loginRes || loginRes.status() === 404) { test.skip(); return; }

    await expect(page.locator("[data-testid='search-form']")).toBeVisible({ timeout: 5000 });
    await page.locator("[data-testid='city-select']").selectOption("Москва");
    await page.locator("[data-testid='budget-input']").fill("80000");
    await page.locator("[data-testid='search-btn']").click();

    const firstCard = page.locator("[data-testid='tour-card']").first();
    await expect(firstCard).toBeVisible({ timeout: 30000 });

    const bookmarkBtn = page.locator("[data-testid='bookmark-btn']").first();
    await expect(bookmarkBtn).toBeVisible();
    expect(await bookmarkBtn.getAttribute("data-saved")).toBe("false");
    await bookmarkBtn.click();
    await page.waitForTimeout(2000);
    expect(await bookmarkBtn.getAttribute("data-saved")).toBe("true");
  });

  test("saved tour appears in /profile Сохранённые туры section", async ({ page }) => {
    const sub = `e2e-prof-${Date.now()}`;

    const loginRes = await page.goto(
      `../api/testing/login?sub=${sub}&email=${sub}%40e2e.test&first_name=ProfTest&last_name=User&redirect=/`,
      { waitUntil: "networkidle" }
    );
    if (!loginRes || loginRes.status() === 404) { test.skip(); return; }

    await expect(page.locator("[data-testid='search-form']")).toBeVisible({ timeout: 5000 });
    await page.locator("[data-testid='city-select']").selectOption("Москва");
    await page.locator("[data-testid='budget-input']").fill("80000");
    await page.locator("[data-testid='search-btn']").click();

    const firstCard = page.locator("[data-testid='tour-card']").first();
    await expect(firstCard).toBeVisible({ timeout: 30000 });

    const bookmarkBtn = page.locator("[data-testid='bookmark-btn']").first();
    await bookmarkBtn.click();
    await page.waitForTimeout(2000);
    expect(await bookmarkBtn.getAttribute("data-saved")).toBe("true");

    await page.goto("/profile");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(1000);

    const savedSection = page.locator("text=Сохранённые туры");
    await expect(savedSection).toBeVisible();

    const content = await page.textContent("body");
    const hasTourInProfile =
      (content ?? "").includes("₽") ||
      (content ?? "").includes("ночей") ||
      (content ?? "").includes("Смотреть");
    expect(hasTourInProfile).toBe(true);
  });
});
