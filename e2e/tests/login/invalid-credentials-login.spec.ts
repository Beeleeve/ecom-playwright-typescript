// @ts-check
import { test, expect } from "@playwright/test";
// import LoginPage from "../../pages/LoginPage.js";
import { LoginPage } from "@pages/LoginPage";

test.describe("Invalid Credentials Login", () => {
  let loginPage: LoginPage;
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test("login fails with both invalid email and password", async () => {
    await loginPage.signIn("wrong@example.com", "wrongpassword");
    await expect(loginPage.getErrorMessage()).resolves.toContainText('Invalid email or password');
  });

  test("login fails with empty credentials", async () => {
    await loginPage.signIn("", "");
    await expect(loginPage.getEmailError()).resolves.toContainText("Email is required");
    await expect(loginPage.getPasswordError()).resolves.toContainText("Password is required");
  });

  test("login fails with malformed email and invalid password", async () => {
    await loginPage.signIn("notanemail", "wrongpass");
    await expect(loginPage.getEmailError()).resolves.toContainText("Email format is invalid");
  });
});
