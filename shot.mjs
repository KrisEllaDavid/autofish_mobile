import { chromium } from "playwright";
import fs from "fs";

const OUT = "shots";
fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch({ ignoreDefaultArgs: ["--hide-scrollbars"] });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  ignoreHTTPSErrors: true,
});
const page = await context.newPage();
page.on("console", (msg) => {
  if (msg.type() === "error") console.log("PAGE ERROR:", msg.text());
});
page.on("pageerror", (err) => console.log("PAGE EXCEPTION:", err.message));

await page.goto("https://127.0.0.1:5199/", { waitUntil: "networkidle" });

// 1. Splash (first ~2s)
await page.waitForTimeout(600);
await page.screenshot({ path: `${OUT}/01-splash.png` });

// Wait out the splash timer (2000ms) to reach onboarding
await page.waitForTimeout(1800);
await page.screenshot({ path: `${OUT}/02-onboarding1.png` });

// Advance onboarding via the visible next button
const nextBtn = page.locator(".af-fab");
if (await nextBtn.count()) {
  await nextBtn.click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/03-onboarding2.png` });

  const continueBtn = page.locator("button", { hasText: "Poursuivre" });
  if (await continueBtn.count()) {
    await continueBtn.first().click();
    await page.waitForTimeout(400);
  }
}

await page.screenshot({ path: `${OUT}/04-login.png` });

// Try signup
const signupLink = page.locator("text=Créer un compte");
if (await signupLink.count()) {
  await signupLink.first().click();
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/05-signup.png`, fullPage: true });
}

await browser.close();
console.log("done");
