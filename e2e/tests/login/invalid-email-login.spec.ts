// @ts-check
import { test, expect } from "@playwright/test";
import { LoginPage } from "@pages/LoginPage.js";

test.describe("Invalid Email Login", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await page.goto('/', {waitUntil:'domcontentloaded'});
  });

  test("login fails with invalid email format", async () => {
    await loginPage.signIn("invalidemail", "pass123");
    expect(loginPage.getEmailError()).toEqual("Email format is invalid");
  });

  test("login fails with non-existent email", async () => {
    await loginPage.signIn("nonexistent@example.com", "pass123");
    expect(loginPage.getErrorMessage()).toEqual("Invalid email or password");
  });

  test("login fails with empty email", async () => {
    await loginPage.signIn("", "pass123");
    expect(loginPage.getEmailError()).toEqual("Email is required");
  });
});
