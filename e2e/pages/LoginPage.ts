import { Page, Locator } from '@playwright/test';
import config from '@config/environment'; // default export from your TS config file

export class LoginPage {
  private readonly page: Page;
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly loginButton: Locator;
  private readonly errorMessage: Locator;
  private readonly emailError: Locator;
  private readonly passwordError: Locator;
  private readonly accountTitle: Locator;
  private readonly accountDescription: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel("Email address *");
    this.passwordInput = page.getByLabel("Password *");
    this.loginButton = page.getByRole("button", {name:"Login"});
    this.errorMessage = page.locator('.alert.alert-danger');
    this.emailError = page.getByTestId('email-error');
    this.passwordError = page.getByTestId('password-error');
    this.accountTitle = page.getByRole("heading", {level:1});
    this.accountDescription = page.getByText(
      'Here you can manage your profile, favorites and orders'
    );
  }
    
  async getAccountTitle(): Promise<string> {
      return (await this.accountTitle.textContent())?.trim()||'';
  }

  async getAccountDescription(): Promise<string> {
    return (await this.accountDescription.textContent())?.trim()||'';
  }

  async getErrorMessage(): Promise<string> {
    return (await this.errorMessage.textContent())?.trim()||'';
  }

  async getEmailError(): Promise<string> {
    return (await this.emailError.textContent())?.trim()||'';
  }

  async getPasswordError(): Promise<string> {
    return (await this.passwordError.textContent())?.trim()||'';
  }

  /**
   * Navigate to the login page
   */
  async goto() {
    await this.page.waitForLoadState('domcontentloaded');
    await this.page.waitForLoadState('networkidle');
    console.log('Navigating to login page...');
    console.log(`Base URL:${config.baseUrl}`);
    if (!config.baseUrl) {
      throw new Error('BASE_URL is not configured in environment variables');
    }
    await this.page.goto(`${config.baseUrl}/auth/login`);
  }

  /**
   * Sign in with provided credentials
   */
  async signIn(email: string, password: string){
    await this.page.waitForLoadState('domcontentloaded');
    await this.emailInput.isVisible({ timeout: 180000 });
    await this.emailInput.clear();
    await this.emailInput.fill(email);
    await this.passwordInput.clear();
    await this.passwordInput.fill(password);
    await this.loginButton.click();

    // Wait for either success or error
    await Promise.race([
      this.page.waitForURL('**/account', { timeout: 5000 }).catch(() => {}),
      this.errorMessage
        .waitFor({ state: 'visible', timeout: 5000 })
        .catch(() => {}),
    ]);
  }

  /**
   * Sign in with default credentials from environment
   */
  async signInWithValidCredentials() {
    if (!config.user?.email || !config.user?.password) {
      throw new Error(
        'EMAIL and PASSWORD must be configured in environment variables'
      );
    }
    await this.signIn(config.user.email, config.user.password);
  }
}

export default LoginPage;