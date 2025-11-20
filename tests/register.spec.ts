import { test, expect, Locator, FrameLocator } from "@playwright/test";

//PrestaShop demo URL with english language
const DEMO_URL = "https://demo.prestashop.com/#/en/front";

//Helper function to get error locator for a specific field
function getFieldErrorLocator(
  iframeLocator: FrameLocator,
  fieldId: string
): Locator {
  const inputElement = iframeLocator.locator(fieldId);

  //Finding the nearest common ancestor
  const fieldContainer = inputElement.locator(
    'xpath=ancestor::div[contains(@class, "form-group row")]'
  );

  //Finding the error message within that ancestor
  return fieldContainer.locator(".help-block li.alert-danger");
}

//Testing redirect to registration page from login
test("Redirect to registration page and back to login works", async ({
  page,
}) => {
  await page.goto(DEMO_URL);

  const frame = page.frameLocator('//*[@id="framelive"]');
  await expect(frame.locator('span:has-text("Sign in")')).toBeVisible({
    timeout: 30000,
  });

  await frame.locator('span:has-text("Sign in")').click();
  //await frame.locator('//*[@id="_desktop_user_info"]/div/a').click();

  //Click on create account link
  frame.getByRole("link", { name: "No account? Create one here" }).click();

  //Verification of redirection to registration page
  /*   await expect(frame.locator('//*[@id="main"]/header/h1')).toHaveText(
    "Create an account"
  ); */
  await expect(frame.locator('//*[@id="customer-form"]')).toBeVisible();

  //Now test redirection back to login page
  frame.getByRole("link", { name: "Log in instead!" }).click();

  //Verification of redirection to login page
  await expect(frame.locator('//*[@id="login-form"]')).toBeVisible();
});

//Test successful registration
test("User can register successfully", async ({ page }) => {
  await page.goto(DEMO_URL);
  const frame = page.frameLocator('//*[@id="framelive"]');

  //Navigate to registration page
  await frame.locator('span:has-text("Sign in")').click();

  await frame
    .getByRole("link", { name: "No account? Create one here" })
    .click();

  //Creating a new user
  await frame.locator("#field-id_gender-1").check();

  const email = `autotest_${Date.now()}@mail.com`;

  await frame.locator("#field-firstname").fill("Novi");
  await frame.locator("#field-lastname").fill("Korisnik");
  await frame.locator("#field-email").fill(email);
  await frame.locator("#field-password").fill("QATest555!");
  await frame.locator("#field-birthday").fill("01/01/1990");

  await frame.locator('input[name="psgdpr"]').check();
  await frame.locator('input[name="customer_privacy"]').check();

  frame.locator('button[data-link-action="save-customer"]').click();

  await expect(frame.locator(".user-info .logout")).toBeVisible({
    timeout: 30000,
  });

  //Verification of successful registration
  const logoutLocator = frame.locator(".user-info .logout");
  const accountLocator = frame.locator(".user-info a.account");

  await expect(logoutLocator).toBeVisible({ timeout: 20000 });
  await expect(accountLocator).toBeVisible({ timeout: 20000 });

  const userInfo = frame.locator("#_desktop_user_info");
  await expect(userInfo).toBeVisible({ timeout: 30000 });
  await expect(userInfo.locator(".user-info")).toContainText(" Sign out ");
  await expect(userInfo.locator(".user-info")).toContainText("Novi Korisnik");
});

//Test registration with existing email
test("User cannot register with the same email", async ({ page }) => {
  await page.goto(DEMO_URL);
  const frame = page.frameLocator('//*[@id="framelive"]');

  //await frame.locator('//*[@id="_desktop_user_info"]/div/a[1]').click();

  await frame.locator('span:has-text("Sign in")').click();

  await frame
    .getByRole("link", { name: "No account? Create one here" })
    .click();

  //Creating a new user
  await frame.locator("#field-id_gender-1").check();

  const email = `autotest_${Date.now()}@mail.com`;

  await frame.locator("#field-firstname").fill("Novi");
  await frame.locator("#field-lastname").fill("Korisnik");
  await frame.locator("#field-email").fill(email);
  await frame.locator("#field-password").fill("QATest555!");
  await frame.locator("#field-birthday").fill("02/02/1990");

  await frame.locator('input[name="psgdpr"]').check();
  await frame.locator('input[name="customer_privacy"]').check();

  frame.locator('button[data-link-action="save-customer"]').click();

  //await frame.getByRole('link', { name: 'Sign out' }).click();
  await frame.locator('a:has-text(" Sign out")').click();
  //await frame.locator('//*[@id="_desktop_user_info"]/div/a[1]').click();
  await expect(frame.locator('span:has-text("Sign in")')).toBeVisible({
    timeout: 30000,
  });

  await frame.locator('span:has-text("Sign in")').click();

  await frame
    .getByRole("link", { name: "No account? Create one here" })
    .click();

  //Trying to register with the same email
  await frame.locator("#field-id_gender-1").check();

  await frame.locator("#field-firstname").fill("Novi");
  await frame.locator("#field-lastname").fill("Korisnik");
  await frame.locator("#field-email").fill(email);
  await frame.locator("#field-password").fill("QATest555!");
  await frame.locator("#field-birthday").fill("02/02/1990");

  await frame.locator('input[name="psgdpr"]').check();
  await frame.locator('input[name="customer_privacy"]').check();

  frame.locator('button[data-link-action="save-customer"]').click();

  //Verification of error message
  const emailError = getFieldErrorLocator(frame, "#field-email");

  await expect(emailError).toBeVisible({ timeout: 40000 });
  await expect(emailError).toHaveText(
    "The email is already used, please choose another one or sign in"
  );

  //User is not signed in
  const userInfo = frame.locator("#_desktop_user_info");
  await expect(userInfo.locator(".user-info")).toContainText(" Sign in ");
});

//Testing ivalid registration data
test("User cannot register with invalid data", async ({ page }) => {
  await page.goto(DEMO_URL);
  const frame = page.frameLocator('//*[@id="framelive"]');

  await frame.locator('span:has-text("Sign in")').click();

  await frame
    .getByRole("link", { name: "No account? Create one here" })
    .click();

  //Filling in invalid data
  await frame.locator("#field-id_gender-1").check();
  await frame.locator("#field-firstname").fill("1");
  await frame.locator("#field-lastname").fill("2");
  await frame.locator("#field-email").fill("random@mail.rs");
  await frame.locator("#field-password").fill("QATest555!");
  await frame.locator("#field-birthday").fill("3");

  await frame.locator('input[name="psgdpr"]').check();
  await frame.locator('input[name="customer_privacy"]').check();

  frame.locator('button[data-link-action="save-customer"]').click();

  //Verification of error messages
  const firstNameError = getFieldErrorLocator(frame, "#field-firstname");
  const lastNameError = getFieldErrorLocator(frame, "#field-lastname");
  const birthdayError = getFieldErrorLocator(frame, "#field-birthday");

  await expect(firstNameError).toBeVisible({ timeout: 30000 });
  await expect(firstNameError).toHaveText("Invalid format.");
  await expect(lastNameError).toHaveText("Invalid format.");
  await expect(birthdayError).toHaveText("Format should be 05/31/1970.");

  //User is not signed in
  const userInfo = frame.locator("#_desktop_user_info");
  await expect(userInfo.locator(".user-info")).toContainText(" Sign in ");
});
