# Bank of Canada API Automation Framework

This lightweight API automation framework is built using Cypress and JavaScript. It is designed to test the Bank of Canada Valet API by automating the following scenarios:

- **Positive Scenario:** Calculate the average Forex conversion rate (e.g., CAD to USD) over the recent 10 weeks.
- **Negative Scenario:** Validate that the API returns an error for invalid series codes.

## Table of Contents

- [Overview](#overview)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Tests](#running-the-tests)
- [Custom Commands](#custom-commands)
- [API Test Scenarios](#api-test-scenarios)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)

## Overview

This project demonstrates how to build a modular and efficient API automation framework using Cypress. It covers both a positive and a negative test cases for the Bank of Canada Valet API, ensuring the API response's accuracy and reliability. 
Initial Commit - Being new to Cypress, just ran the tests without using any functions/methods for increased usability.
2nd Commit - Added a fucntion getObservations and used it for positive and negative scenario. Also, added the HTML report using reporting library Mochawesome.
3rd Commit - Added more series for positive scenarios and added other negatice scenarios. Also, added the schema response validation code using chai library (Chai-json-schema provides a convenient way to integrate JSON schema validation directly into your Chai assertions, making your tests cleaner and more maintainable.)


## Project Structure

```plaintext
bank-of-canada-api-tests/
├── package.json
├── cypress.config.js
└── cypress
    ├── e2e
    │   └── apiTests.cy.js
    └── support
        ├── commands.js
        └── e2e.js
package.json: Contains project dependencies and scripts.

cypress.config.js: Configures Cypress settings including the base URL.

cypress/e2e/apiTests.cy.js: Contains API test specifications.

cypress/support/commands.js: Defines custom commands (e.g., getObservations).

cypress/support/index.js: Imports custom commands into Cypress.

# Prerequisites
Node.js (v14 or later is recommended)

npm (Node Package Manager)

Internet connection for API testing

Installation
Clone the Repository:

bash
Copy
git clone <repository-url>
Navigate to the Project Directory:

bash
Copy
cd bank-of-canada-api-tests
Install Dependencies:

bash
Copy
npm install
Running the Tests
Open Cypress Test Runner
To launch the interactive Cypress Test Runner, run:

bash
Copy
npx cypress open
This opens a GUI where you can select and run your tests interactively.

Run Tests in Headless Mode
To run tests in headless mode (useful for CI/CD pipelines), execute:

bash
Copy
npx cypress run

For running the reports
bash
npm install --save-dev mochawesome mochawesome-merge mochawesome-report-generator cypress-mochawesome-reporter

For checking the Schema of the response , used chai and to run the script with chai run:
npm install chai-json-schema --save-dev

Custom Commands
The custom command getObservations is defined in cypress/support/commands.js and is used to fetch observations from the Bank of Canada Valet API. It embeds the series code in the URL path and appends /json, while passing recent_weeks as a query parameter.

Example usage in a test:

javascript
Copy
cy.getObservations('FXEURCAD', 10);
API Test Scenarios
Positive Scenario
Objective: Fetch and calculate the average CAD to USD rate for the recent 10 weeks.

Validation:

Confirms the HTTP status is 200.

Checks the response structure.

Calculates the average conversion rate across all returned observations.

Asserts the average rate is within a realistic range.

Negative Scenario
Objective: Ensure that an invalid series code returns an appropriate error.

Validation:

Verifies that the API  return 404 status.

Checks for an error message in the response.

Troubleshooting
If you experience issues while running Cypress:

Verify Installation:
Ensure Cypress is installed correctly by running:

bash
Copy
npx cypress verify
Working Directory:
Make sure you're in the project root when running commands.

Permission Issues:
On Windows, try running your terminal as an administrator or check for antivirus restrictions.

Debug Logs:
Run with debug logs enabled:

bash
Copy
DEBUG=cypress:* npx cypress open


