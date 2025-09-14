// @ts-check
import { test, expect } from "@playwright/test";
import { LoginPage } from "@pages/LoginPage";

test.describe("Valid Login", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await page.goto('/', {waitUntil:'domcontentloaded'});
  });

  test("successful login with valid credentials from env file", async () => {
    await loginPage.signInWithValidCredentials();

    // Verify successful login

  expect(loginPage.getAccountTitle()).toEqual("My account");
  expect(loginPage.getAccountDescription()).toEqual("Here you can manage your profile, favorites and orders.");
  });
});
