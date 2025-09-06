// @ts-check
import { test, expect } from "@playwright/test";
import { LoginPage } from "@pages/LoginPage";

test.describe("Valid Login", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test("successful login with valid credentials from env file", async () => {
    await loginPage.signInWithValidCredentials();

    // Verify successful login

  await expect(loginPage.getAccountTitle()).resolves.toHaveText("My account");
  await expect(loginPage.getAccountDescription()).resolves.toHaveText("Here you can manage your profile, favorites and orders.");
  });
});
