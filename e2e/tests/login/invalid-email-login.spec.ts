// @ts-check
import { test, expect } from "@playwright/test";
import { LoginPage } from "@pages/LoginPage.js";

test.describe("Invalid Email Login", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test("login fails with invalid email format", async () => {
    await loginPage.signIn("invalidemail", "pass123");
    await expect(loginPage.getEmailError()).resolves.toContainText("Email format is invalid");
  });

  test("login fails with non-existent email", async () => {
    await loginPage.signIn("nonexistent@example.com", "pass123");
    await expect(loginPage.getErrorMessage()).resolves.toContainText("Invalid email or password");
  });

  test("login fails with empty email", async () => {
    await loginPage.signIn("", "pass123");
    await expect(loginPage.getEmailError()).resolves.toContainText("Email is required");
  });
});
