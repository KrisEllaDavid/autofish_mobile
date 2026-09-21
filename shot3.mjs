import { chromium } from "playwright";
import fs from "fs";

const OUT = "shots";
fs.mkdirSync(OUT, { recursive: true });

const ACCESS = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzkwMDA2Mjg3LCJpYXQiOjE3OTAwMDI2ODcsImp0aSI6ImY4ZWU3ZjlmZjU2YjRmZGY5ZTMxMmUxZjRlMmVkYjY1IiwidXNlcl9pZCI6MTE1fQ.RFdvlj8c9Y-ya3EtpJ5RzNpNOSDh0Mcs-bi3hbByNW4";
const REFRESH = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc5MTIxMjI4NywiaWF0IjoxNzkwMDAyNjg3LCJqdGkiOiIzZTFiODg3MWQ5NjM0OWQxYmRjOGExY2JkZDNlZTE0NCIsInVzZXJfaWQiOjExNX0.MYxDU-fevrcmRTAE1R64EqXKKPLAkmNmJfyArJPkRIg";

const userData = {
  id: 115,
  name: "Preview Tester",
  email: "uidesignpreview99@example.com",
  avatar: "",
  userRole: "client",
  description: "",
  country: "Cameroun",
  code: "+237",
  address: "Douala",
  phone: "690000099",
  registrationComplete: true,
  is_verified: true,
  email_verified: true,
  is_active: true,
  access_level: "full",
  status_message: "",
  selectedCategories: [],
  myPosts: [],
};

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  ignoreHTTPSErrors: true,
});
const page = await context.newPage();
page.on("console", (msg) => {
  if (msg.type() === "error") console.log("PAGE ERROR:", msg.text());
});

// Load once to establish origin, then inject auth state.
await page.goto("https://127.0.0.1:5199/", { waitUntil: "domcontentloaded" });
await page.evaluate(
  ({ ACCESS, REFRESH, userData }) => {
    localStorage.setItem("access_token", ACCESS);
    localStorage.setItem("refresh_token", REFRESH);
    localStorage.setItem("userData", JSON.stringify(userData));
  },
  { ACCESS, REFRESH, userData }
);
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(2600); // splash timer

await page.screenshot({ path: `${OUT}/10-home-feed.png` });

// Scroll down a bit to see more cards
await page.mouse.wheel(0, 900);
await page.waitForTimeout(500);
await page.screenshot({ path: `${OUT}/11-home-feed-scrolled.png` });

// Bottom nav — Producers tab
const producersTab = page.locator('button[aria-label="Producteurs"]');
if (await producersTab.count()) {
  await producersTab.click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/12-producers.png` });
}

// Profile tab
const profileTab = page.locator('button[aria-label="Profil"]');
if (await profileTab.count()) {
  await profileTab.click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/13-my-account.png` });
}

// Messages tab
const msgTab = page.locator('button[aria-label="Messages"]');
if (await msgTab.count()) {
  await msgTab.click();
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}/14-messages.png` });
}

await browser.close();
console.log("done");
