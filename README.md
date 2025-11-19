# Playwright Prestashop Demo Tests

This repository contains automated end-to-end tests written using Playwright and TypeScript for validating user registration and login flows on PrestaShop site.

The tests focus on user authentication and form validation for registration, sign-out, and error handling.

## Getting Started

Prerequisit: Node.js: Version 18 or higher.

### Installation

Clone the repository and ensure you are in the project root directory.

Install dependencies: This command installs Playwright and its necessary browser drivers.

``` npm install ```
or
``` npx playwright install ```

### Running Tests
All test files are located in the tests/ directory.

#### Run All Tests

To run all tests in the tests/ directory:

``` npx playwright test ```

#### Run Specific Test Files or Folders

You can specify a file path or a folder to run a subset of tests:

``` npx playwright test tests/register.spec.ts ```


## Test Reporting

After a test run, Playwright automatically generates an HTML report.

### View the HTML Report

To open the detailed report in your web browser:

``` npx playwright show-report ```

This report will show the status of all tests, including traces for failed tests, which allows you to inspect screenshots, logs, and a video of the execution.
