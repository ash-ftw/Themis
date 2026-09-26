import { test, expect } from "@playwright/test";

test.describe("Themis Legal Aid & Case Management E2E Journeys", () => {
  test.beforeEach(async ({ page }) => {
    // Set local development token in local storage / headers for citizen role
    await page.addInitScript(() => {
      window.localStorage.setItem("themis_token", "dev-citizen");
    });
  });

  test("1. Citizen Dashboard & Nav Rail Rendering", async ({ page }) => {
    await page.goto("/citizen/dashboard");
    await expect(page).toHaveTitle(/Themis/i);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expect(page.getByText("Themis", { exact: false })).toBeVisible();
  });

  test("2. Guided Legal Assessment Flow", async ({ page }) => {
    await page.goto("/citizen/assessments/new");
    await expect(page.getByText(/Guided Legal Assessment/i)).toBeVisible();
  });

  test("3. RTI Draft Generator Flow", async ({ page }) => {
    await page.goto("/citizen/rti/new");
    await expect(page.getByText(/RTI/i)).toBeVisible();
  });

  test("4. Lawyer Assigned Cases & Portal Access", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("themis_token", "dev-lawyer");
    });
    await page.goto("/lawyer/dashboard");
    await expect(page.getByText(/Lawyer/i)).toBeVisible();
  });

  test("5. Admin Verification & Hardening Dashboard", async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem("themis_token", "dev-admin");
    });
    await page.goto("/admin/dashboard");
    await expect(page.getByText(/Admin/i)).toBeVisible();
  });
});
