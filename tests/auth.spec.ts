import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
    test("should show auth form when not logged in", async ({ page }) => {
        await page.goto("/");

        // Should show auth form
        await expect(page.getByText("Gym Tracker")).toBeVisible();
        await expect(page.getByText("Sign In")).toBeVisible();
        await expect(page.getByText("Sign Up")).toBeVisible();
    });

    test("should allow switching between sign in and sign up", async ({
        page,
    }) => {
        await page.goto("/");

        // Start on sign in tab
        await expect(page.getByText("Sign In")).toBeVisible();

        // Switch to sign up
        await page.getByRole("tab", { name: "Sign Up" }).click();
        await expect(page.getByText("Create Account")).toBeVisible();

        // Switch back to sign in
        await page.getByRole("tab", { name: "Sign In" }).click();
        await expect(page.getByText("Sign In")).toBeVisible();
    });

    test("should show validation errors for invalid input", async ({
        page,
    }) => {
        await page.goto("/");

        // Try to submit without filling fields
        await page.getByRole("button", { name: "Sign In" }).click();

        // Should show validation errors
        await expect(
            page.getByText("Please fill in all required fields")
        ).toBeVisible();
    });
});
