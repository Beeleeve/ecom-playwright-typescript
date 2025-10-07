# ecom-playwright-typescript
Sample Web and API automated tests using Playwright and Typescript
* [Sample Website](https://practicesoftwaretesting.com/)

* **Search feature**: Intercepts API calls and compares API and UI search results such as product name and price.
* **Filter**: UI tests to filter by one or more categories.
* **Cart**: UI tests to add product to cart and checkout.

## Overview

This project uses [Playwright](https://playwright.dev/) with TypeScript for robust web and API testing. Playwright’s **projects** feature lets you organize tests for different scenarios, such as logged-in and guest users. Advanced features include storage state for login persistence and API network intercepts for validating and mocking backend calls.

### Playwright Projects

- **e2e tests logged in user**: Simulates authenticated users. Uses storage state to avoid repeated logins.
- **e2e tests guest user**: Covers guest checkout and browsing scenarios.

Projects are defined in `playwright.config.ts` and can be run individually:

```bash
npx playwright test --project "e2e tests logged in user"
npx playwright test --project "e2e tests guest user"
```

### Advanced Features

#### Storage State for Login

Playwright can save authentication state to a file (e.g., `storageState.json`) after login. This state is reused in tests to skip repeated logins:

```ts
// playwright.config.ts
projects: [
  {
    name: 'e2e tests logged in user',
    use: { storageState: 'storageState.json' }
  }
]
```

#### API Network Intercepts

Intercept and validate API requests/responses to ensure UI and backend data match, or to mock responses

## Project Structure

- **pages/**: Page classes and reusable methods
- **.config/.env.*/**: Configuration files for different environments (development, production, testing).
- **tests/**: End-to-end and integration tests using Playwright.

## Configuration

Configuration files are in the `config/` directory. Adjust environment-specific settings by editing files like `config/.env.test` or `config/.env.prod`.

### Environment Variables

URLs and credentials are managed using `.env` files. Create a `.env` file in the project root and set variables like:

```
BASE_URL=https://your-app-url.com
EMAIL=your-email@example.com
PASSWORD=your-password
```

Refer to `.env.example` for required variables.

## Running Tests

To run all tests:

```bash
npx playwright test
```

To run specific projects:

```bash
npx playwright test --project "e2e tests logged in user"
npx playwright test --project "e2e tests guest user" --reporter=allure-playwright
```

### Running tests in Docker container

Powershell:
```ps
docker run --rm -v "${PWD}:/app" -w /app mcr.microsoft.com/playwright:v1.55.0-noble npx playwright test --project "e2e tests logged in user"
```

Bash:
```bash
docker run --rm -v "${PWD}:/app" -w /app mcr.microsoft.com/playwright:v1.55.0-noble npx playwright test --project "e2e tests logged in user"
```

## Show Report

Playwright report automatically opens in a browser when a test fails.
If all the tests pass, then run below:

```bash
npx playwright show-report
```

## GitHub Actions

Automated tests can run on every push or pull request using GitHub Actions. 

This ensures your tests run automatically in CI and reports are available for review.
Example workflow:

```yaml
# .github/workflows/playwright.yml
```

