// @ts-check
import { test, expect } from "@playwright/test";
// import LoginPage from "../../pages/LoginPage.js";
import { LoginPage } from "@pages/LoginPage";

test.describe("Invalid Credentials Login", () => {
  let loginPage: LoginPage;
  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await loginPage.goto();
    expect(await loginPage.getLoginPageHeading()).toBe("Login");
  });

  test("login fails with both invalid email and password", async () => {
    await loginPage.signIn("wrong@example.com", "wrongpassword");
    expect(await loginPage.getErrorMessage()).toEqual('Invalid email or password');
  });

  test("login fails with empty credentials", async () => {
    await loginPage.signIn("", "");
    expect(await loginPage.getEmailError()).toEqual("Email is required");
    expect(await loginPage.getPasswordError()).toEqual("Password is required");
  });

  test("login fails with malformed email and invalid password", async () => {
    await loginPage.signIn("notanemail", "wrongpass");
    expect(await loginPage.getEmailError()).toEqual("Email format is invalid");
  });
});
