// @ts-check
import { test, expect } from "@playwright/test";
import { LoginPage } from "@pages/LoginPage.js";
import config from "@config/environment";

test.describe("Invalid Password Login", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test("login fails with wrong password", async () => {
    // Using valid email from env but wrong password
    if (!config.user?.email) {
      throw new Error(
        'EMAIL must be configured in environment variables'
      );
    }
    await loginPage.signIn(config.user.email, "wrongpassword");
    await expect(loginPage.getErrorMessage()).resolves.toContainText("Invalid email or password");
  });

  test("login fails with empty email", async () => {
    await loginPage.signIn("", "pass123");
    await expect(loginPage.getEmailError()).resolves.toContainText("Email is required");
  });
});
