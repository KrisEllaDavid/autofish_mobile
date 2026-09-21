import { chromium } from "playwright";
import fs from "fs";
fs.mkdirSync("shots", { recursive: true });

const ACCESS = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzkwMDA2Mjg3LCJpYXQiOjE3OTAwMDI2ODcsImp0aSI6ImY4ZWU3ZjlmZjU2YjRmZGY5ZTMxMmUxZjRlMmVkYjY1IiwidXNlcl9pZCI6MTE1fQ.RFdvlj8c9Y-ya3EtpJ5RzNpNOSDh0Mcs-bi3hbByNW4";
const REFRESH = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc5MTIxMjI4NywiaWF0IjoxNzkwMDAyNjg3LCJqdGkiOiIzZTFiODg3MWQ5NjM0OWQxYmRjOGExY2JkZDNlZTE0NCIsInVzZXJfaWQiOjExNX0.MYxDU-fevrcmRTAE1R64EqXKKPLAkmNmJfyArJPkRIg";
const userData = {
  id: 115, name: "Preview Tester", email: "uidesignpreview99@example.com",
  avatar: "", userRole: "client", description: "", country: "Cameroun", code: "+237",
  address: "Douala", phone: "690000099", registrationComplete: true, is_verified: true,
  email_verified: true, is_active: true, access_level: "full", status_message: "",
  selectedCategories: [], myPosts: [],
};

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, ignoreHTTPSErrors: true });
const page = await context.newPage();
page.on("console", (msg) => { if (msg.type() === "error") console.log("PAGE ERROR:", msg.text()); });

await page.goto("https://127.0.0.1:5199/", { waitUntil: "domcontentloaded" });
await page.evaluate(({ACCESS,REFRESH,userData}) => {
  localStorage.setItem("access_token", ACCESS);
  localStorage.setItem("refresh_token", REFRESH);
  localStorage.setItem("userData", JSON.stringify(userData));
}, {ACCESS,REFRESH,userData});
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(2600);

await page.screenshot({ path: "shots/20-home-top.png" });

// Real scroll test via mouse wheel positioned over the feed
await page.mouse.move(195, 500);
await page.mouse.wheel(0, 900);
await page.waitForTimeout(500);
await page.screenshot({ path: "shots/21-home-scrolled.png" });

await page.mouse.wheel(0, 900);
await page.waitForTimeout(500);
await page.screenshot({ path: "shots/22-home-scrolled-more.png" });

// Producers tab
await page.locator('button[aria-label="Producteurs"]').click();
await page.waitForTimeout(600);
await page.screenshot({ path: "shots/23-producers.png" });

// Open a dropdown (category select on TopProducers uses native select, skip)
// Go to signup to test UnifiedDropdown "married" attach behavior
await page.goto("https://127.0.0.1:5199/", { waitUntil: "networkidle" });
await page.evaluate(() => localStorage.clear());
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(2600);
// click through onboarding -> login -> signup
const nextBtn = page.locator(".af-fab");
if (await nextBtn.count()) { await nextBtn.click(); await page.waitForTimeout(300); }
const continueBtn = page.locator("button", { hasText: "Poursuivre" });
if (await continueBtn.count()) { await continueBtn.first().click(); await page.waitForTimeout(300); }
const signupLink = page.locator("text=Créer un compte");
if (await signupLink.count()) { await signupLink.first().click(); await page.waitForTimeout(400); }

// Scroll to country dropdown and open it
await page.evaluate(() => {
  const inputs = document.querySelectorAll('.af-select__trigger');
  inputs[inputs.length - 1]?.scrollIntoView({ block: "center" });
});
await page.waitForTimeout(300);
const trigger = page.locator('.af-select__trigger').last();
await trigger.click();
await page.waitForTimeout(400);
await page.screenshot({ path: "shots/24-dropdown-open.png" });

await browser.close();
console.log("done");
