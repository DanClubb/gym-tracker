import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
    test("should redirect to auth when not logged in", async ({ page }) => {
        await page.goto("/dashboard");

        // Should redirect to auth form
        await expect(page.getByText("Gym Tracker")).toBeVisible();
        await expect(page.getByText("Sign In")).toBeVisible();
    });

    test("should show dashboard when logged in", async ({ page }) => {
        // Mock authentication by setting localStorage
        await page.goto("/");
        await page.evaluate(() => {
            localStorage.setItem("supabase.auth.token", "mock-token");
        });

        await page.goto("/dashboard");

        // Should show dashboard content
        await expect(page.getByText("Welcome back!")).toBeVisible();
        await expect(page.getByText("Start Workout")).toBeVisible();
        await expect(page.getByText("Create Template")).toBeVisible();
    });

    test("should navigate to workout creation", async ({ page }) => {
        // Mock authentication
        await page.goto("/");
        await page.evaluate(() => {
            localStorage.setItem("supabase.auth.token", "mock-token");
        });

        await page.goto("/dashboard");

        // Click start workout button
        await page.getByRole("link", { name: "Start Now" }).click();

        // Should navigate to workout page
        await expect(page.getByText("Start Workout")).toBeVisible();
    });
});
