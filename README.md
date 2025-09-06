# ecom-playwright-js
Sample Web and API automated tests using Playwright and Javascript
* search feature: I tests intercept api calls and compare api and ui search results  such as product name and price.
* Filter: UI tests to filter by one or more categories
* Cart: UI tests to add product to cart and checkout
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

To run all tests, use:

```bash
npx playwright test
```

You can also run specific test projects as shown below.
#### Run Logged in user tests
```bash
npx playwright test --project "e2e tests logged in user"
```

#### Run Guest user tests
```bash
npx playwright test --project "e2e tests guest user" --reporter=allure-playwright
```
#### Running tests in Docker container
Powershell
```ps
docker run --rm -v "${PWD}:/app" -w /app mcr.microsoft.com/playwright:v1.55.0-noble npx playwright test --project "e2e tests logged in user"
```


Bash
```bash
docker run --rm -v "${PWD}:/app" -w /app mcr.microsoft.com/playwright:v1.55.0-noble npx playwright test --project "e2e tests logged in user"
```
### Show report
Playwright report automatically opens in a browser when a test fails.
If all the tests pass, then run below:
```bash
npx playwright show-report
```