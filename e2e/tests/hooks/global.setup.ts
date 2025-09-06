import { test as setup } from "@playwright/test";
import { LoginPage } from "@pages/LoginPage";
import { STORAGE_STATE } from "@pwconfig";

setup("Login", async ({ page }) => {
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.signInWithValidCredentials();
  console.log("Login successful, saving storage state...");
  await page.context().storageState({ path: STORAGE_STATE });
});
