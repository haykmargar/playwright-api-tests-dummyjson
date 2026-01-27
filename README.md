# Products API Test Suite

This repository contains an automated API test suite for the [DummyJSON Products API](https://dummyjson.com/docs/products), built using Playwright and TypeScript.

## 🚀 Getting Started

**Prerequisites**

- Node.js (v16 or higher)
- npm

**Installation**

- Clone the repository.
- Install dependencies:

`npm install
`

**Running Tests**

To run the full suite in parallel:

`npm test`

**Linting & Formatting**

To check for linting errors:

`npm run lint`

To automatically fix linting errors:

`npm run lint:fix`

To format the code using Prettier:

`npm run format`

**Viewing Reports**

Playwright generates an HTML report after execution. To view it:

`npm run report`

## ⚙️ Configuration

### Environment Variables

This project uses `dotenv` to manage environment variables. Create an `.env` file in the project root to store sensitive information or configuration specific to your local environment. An `EXAMPLE.env` file is provided as a template.

## 🤖 CI/CD

This project uses **GitHub Actions** for Continuous Integration. The workflow is defined in `.github/workflows/ci.yml` and performs the following checks on every push and pull request to the main branch:

1.  **Linting**: Runs ESLint to ensure code quality and consistency.
2.  **Testing**: Executes the Playwright test suite.
3.  **Reporting**: Uploads the Playwright test report as an artifact for easy debugging of failures.

## 🏗 Design Decisions & Trade-offs

To ensure the test suite is maintainable and scalable, I implemented the Controller pattern. Instead of embedding raw HTTP requests directly into the test files, I abstracted the API interactions into a dedicated `ProductsController` class. This separation of concerns means that if endpoint paths or HTTP methods change in the future, updates are centralized in one file rather than scattered across the entire suite. Additionally, I chose TypeScript to enforce strict typing on API responses.

**Schema Validation with Zod**: To further enhance type safety and ensure API contract adherence, `Zod` is integrated for runtime schema validation of API responses. This helps catch unexpected response structures and data type mismatches early in the testing cycle.

Reliability and speed were key considerations for the configuration. I enabled fully parallel execution in Playwright, which significantly reduces the total feedback time. Since the DummyJSON API is a mock service that does not persist state between requests, running tests concurrently is safe and efficient. I also utilized soft assertions for validating complex JSON responses. This approach allows the test to verify multiple fields (like ID, title, and price) and report all failures found in a single run, rather than stopping immediately at the first error, providing a more complete picture of the API's health.

Regarding trade-offs, I prioritized a lightweight implementation over exhaustive strictness for this assignment. In a production environment, I would integrate a schema validation library like Zod or AJV to rigorously validate the entire JSON contract at runtime. For this scope, I relied on TypeScript interfaces and Playwright assertions to balance speed with sufficient coverage. Furthermore, because the System Under Test (SUT) does not actually persist data (writes are faked), I mostly used hardcoded IDs for retrieval tests. In a real-world scenario with a persistent database, I would implement dynamic data seeding (creating a product in a `beforeAll` hook and deleting created data in a `afterAll` hook) to ensure true test isolation.
