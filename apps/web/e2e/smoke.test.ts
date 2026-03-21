import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test("renders hero headline", async ({ page }) => {
    await page.goto("/");
    await expect(
      page.getByRole("heading", { name: /Hospitality Experience/i }),
    ).toBeVisible();
  });

  test("Find a Hotel CTA is visible and links to /search", async ({ page }) => {
    await page.goto("/");
    const cta = page.getByRole("link", { name: /Find a Hotel/i });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/search");
  });

  test("Hotel Portal link navigates to login", async ({ page }) => {
    await page.goto("/");
    const portalLink = page
      .getByRole("link", { name: /Hotel Portal/i })
      .first();
    await expect(portalLink).toBeVisible();
    await expect(portalLink).toHaveAttribute("href", "/hotel/login");
  });

  test("stats bar shows key metrics", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Hotels")).toBeVisible();
    await expect(page.getByText("AI Agents")).toBeVisible();
  });

  test("page title is set correctly", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/HEO/);
  });
});

test.describe("Navigation", () => {
  test("navigates to hotel login page", async ({ page }) => {
    await page.goto("/hotel/login");
    await expect(page).not.toHaveURL(/error/);
  });
});
