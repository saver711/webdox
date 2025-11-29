import { expect, test } from "@playwright/test";

test.describe("Home Page", () => {
	test("should render Next.js logo and Ahmed text", async ({ page }) => {
		// Go to the home page
		await page.goto("http://localhost:3000/");

		// ✅ Check Next.js logo is visible
		const logo = page.getByAltText("Next.js logo");
		await expect(logo).toBeVisible();

		// ✅ Check "Ahmed" heading is visible
		await expect(page.getByRole("heading", { name: "Ahmed" })).toBeVisible();
	});
});
