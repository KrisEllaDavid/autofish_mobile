import { chromium } from "playwright";
const ACCESS = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzkwMDA2Mjg3LCJpYXQiOjE3OTAwMDI2ODcsImp0aSI6ImY4ZWU3ZjlmZjU2YjRmZGY5ZTMxMmUxZjRlMmVkYjY1IiwidXNlcl9pZCI6MTE1fQ.RFdvlj8c9Y-ya3EtpJ5RzNpNOSDh0Mcs-bi3hbByNW4";
const REFRESH = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc5MTIxMjI4NywiaWF0IjoxNzkwMDAyNjg3LCJqdGkiOiIzZTFiODg3MWQ5NjM0OWQxYmRjOGExY2JkZDNlZTE0NCIsInVzZXJfaWQiOjExNX0.MYxDU-fevrcmRTAE1R64EqXKKPLAkmNmJfyArJPkRIg";
const userData = { id: 115, name: "Preview Tester", email: "uidesignpreview99@example.com", avatar: "", userRole: "client", description: "", country: "Cameroun", code: "+237", address: "Douala", phone: "690000099", registrationComplete: true, is_verified: true, email_verified: true, is_active: true, access_level: "full", status_message: "", selectedCategories: [], myPosts: [] };

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, ignoreHTTPSErrors: true });
const page = await context.newPage();
await page.goto("https://127.0.0.1:5199/", { waitUntil: "domcontentloaded" });
await page.evaluate(({ACCESS,REFRESH,userData}) => {
  localStorage.setItem("access_token", ACCESS);
  localStorage.setItem("refresh_token", REFRESH);
  localStorage.setItem("userData", JSON.stringify(userData));
}, {ACCESS,REFRESH,userData});
await page.reload({ waitUntil: "networkidle" });
await page.waitForSelector(".post-card__image");
await page.waitForFunction(() => {
  const img = document.querySelector(".post-card__image");
  return img && img.complete && img.naturalWidth > 0;
});
await page.waitForTimeout(300);
await page.screenshot({ path: "shots/25-home-loaded.png" });

await page.mouse.move(195, 500);
await page.mouse.wheel(0, 1400);
await page.waitForTimeout(700);
await page.screenshot({ path: "shots/26-home-scrolled.png" });

await browser.close();
console.log("done");
