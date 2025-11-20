import { test, expect } from "@playwright/test";

//PrestaShop demo URL with english language
const DEMO_URL = "https://demo.prestashop.com/#/en/front";

//Testing navigation to the login form
test("Navigation to login", async ({ page }) => {
  await page.goto(DEMO_URL);

  const frame = page.frameLocator('//*[@id="framelive"]');
  await expect(frame.locator('span:has-text("Sign in")')).toBeVisible({
    timeout: 30000,
  });

  await frame.locator('span:has-text("Sign in")').click();

  //Verification  of login form visibility
  await expect(frame.locator('//*[@id="login-form"]')).toBeVisible();
});

//Test login functionality
test("User can login successfully", async ({ page }) => {
  //Navigate to demo site and login page
  await page.goto(DEMO_URL);
  const frame = page.frameLocator('//*[@id="framelive"]');

  await frame.locator('span:has-text("Sign in")').click();

  //First, we need to register a new user
  await frame
    .getByRole("link", { name: "No account? Create one here" })
    .click();

  //Filling in data
  await frame.locator("#field-id_gender-1").check();
  const email = `autotest_${Date.now()}@mail.com`;
  await frame.locator("#field-firstname").fill("AG");
  await frame.locator("#field-lastname").fill("Tester");
  await frame.locator("#field-email").fill(email);
  await frame.locator("#field-password").fill("QATest555!");
  await frame.locator("#field-birthday").fill("01/01/1990");

  //Requirements
  await frame.locator('input[name="psgdpr"]').check();
  await frame.locator('input[name="customer_privacy"]').check();

  //Submitt
  frame.locator('button[data-link-action="save-customer"]').click();

  //Verification of successful registration
  await expect(frame.locator(".user-info .logout")).toBeVisible({
    timeout: 30000,
  });

  //Sign out
  await frame.locator('a:has-text(" Sign out")').click();
  //await frame.locator('//*[@id="_desktop_user_info"]/div/a[1]').click();

  //Now we can test login with the registered user
  await frame.locator('span:has-text("Sign in")').click();
  //Filling in login data
  await frame.locator("#field-email").fill(email);
  await frame.locator("#field-password").fill("QATest555!");
  await frame.locator("#submit-login").click();
  //Verification of successful login
  const logoutLocator = frame.locator(".user-info .logout");
  const accountLocator = frame.locator(".user-info a.account");

  await expect(logoutLocator).toBeVisible({ timeout: 30000 });
  await expect(accountLocator).toBeVisible({ timeout: 30000 });

  //Additional verification of user name
  const userInfo = frame.locator("#_desktop_user_info");
  await expect(userInfo).toBeVisible();
  await expect(userInfo.locator(".user-info")).toContainText(" Sign out ");
  await expect(userInfo.locator(".user-info")).toContainText("AG Tester");
});

//Testing invalid login
test("User cannot login with invalid credentials", async ({ page }) => {
  await page.goto(DEMO_URL);

  const frame = page.frameLocator('//*[@id="framelive"]');

  await frame.locator('span:has-text("Sign in")').click();

  //Filling in non-existing user data
  await frame.locator("#field-email").fill("invalid@gmail.com");
  await frame.locator("#field-password").fill("NoPass111!");
  await frame.locator("#submit-login").click();

  //Verification of error message
  const errorMessage = frame.locator("div.help-block li.alert.alert-danger");
  await expect(errorMessage).toHaveText("Authentication failed.");
});

//Testing forgot password functionality(accepting any valid email)
test("Forgot password recovery success", async ({ page }) => {
  await page.goto(DEMO_URL);

  const frame = page.frameLocator('//*[@id="framelive"]');

  await frame.locator('span:has-text("Sign in")').click();

  //Navigate to forgot password
  const forgotLink = frame.getByRole("link", { name: "Forgot your password?" });
  await expect(forgotLink).toBeVisible({
    timeout: 30000,
  });
  await forgotLink.click();
  const resetButton = frame.getByRole("button", { name: "Send reset link" });
  await expect(resetButton).toBeVisible({
    timeout: 30000,
  });

  //Filling in email and submitting
  frame.locator("#email").fill("rand@mail.com");
  await resetButton.click();

  //Verification of success message
  await expect(frame.locator("#content")).toHaveText(
    "If this email address has been registered in our store, you will receive a link to reset your password at rand@mail.com."
  );
});

//Testing forgot password with invalid email
test("Forgot password ivalid email", async ({ page }) => {
  await page.goto(DEMO_URL);

  const frame = page.frameLocator('//*[@id="framelive"]');

  await frame.locator('span:has-text("Sign in")').click();
  const forgotLink = frame.getByRole("link", { name: "Forgot your password?" });
  await expect(forgotLink).toBeVisible({
    timeout: 30000,
  });
  await forgotLink.click();
  const resetButton = frame.getByRole("button", { name: "Send reset link" });
  await expect(resetButton).toBeVisible({
    timeout: 30000,
  });

  //Filling in invalid email and submitting
  frame.locator("#email").fill("rand@a");
  await resetButton.click();

  //Verification of error message
  const errorLocator = frame.getByText("Invalid email address.", {
    exact: true,
  });
  await expect(errorLocator).toBeVisible();
});
