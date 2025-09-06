import { Page, Locator } from '@playwright/test';
import config from '@config/environment'; // default export from your TS config file

export class LoginPage {
  private page: Page;
  private emailInput: Locator;
  private passwordInput: Locator;
  private loginButton: Locator;
  private errorMessage: Locator;
  private emailError: Locator;
  private passwordError: Locator;
  private accountTitle: Locator;
  private accountDescription: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByTestId('email');
    this.passwordInput = page.getByTestId('password');
    this.loginButton = page.getByTestId('login-submit');
    this.errorMessage = page.locator('.alert.alert-danger');
    this.emailError = page.getByTestId('email-error');
    this.passwordError = page.getByTestId('password-error');
    this.accountTitle = page.getByTestId('page-title');
    this.accountDescription = page.getByText(
      'Here you can manage your profile, favorites and orders'
    );
    }
    
    async getAccountTitle(): Promise<Locator> {
      return await this.accountTitle;
    }

    async getAccountDescription(): Promise<Locator> {
      return await this.accountDescription;
    }

    async getErrorMessage(): Promise<Locator> {
      return await this.errorMessage;
    }

    async getEmailError(): Promise<Locator> {
      return await this.emailError;
    }

    async getPasswordError(): Promise<Locator> {
      return await this.passwordError;
    }

  /**
   * Navigate to the login page
   */
  async goto(): Promise<void> {
    if (!config.baseUrl) {
      throw new Error('BASE_URL is not configured in environment variables');
    }
    await this.page.goto(`${config.baseUrl}/auth/login`);
  }

  /**
   * Sign in with provided credentials
   */
  async signIn(email: string, password: string): Promise<void> {
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
  async signInWithValidCredentials(): Promise<void> {
    if (!config.user?.email || !config.user?.password) {
      throw new Error(
        'EMAIL and PASSWORD must be configured in environment variables'
      );
    }
    await this.signIn(config.user.email, config.user.password);
  }
}

export default LoginPage;