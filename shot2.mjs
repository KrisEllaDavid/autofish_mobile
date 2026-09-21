import { chromium } from "playwright";
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, ignoreHTTPSErrors: true });
const page = await context.newPage();
page.on("response", (res) => {
  if (res.status() >= 400) console.log(res.status(), res.url());
});
await page.goto("https://127.0.0.1:5199/", { waitUntil: "networkidle" });
await page.waitForTimeout(1000);
const img = page.locator(".splash__bg");
console.log("splash img count:", await img.count());
console.log("naturalWidth:", await img.evaluate(el => el.naturalWidth).catch(e => "ERR " + e.message));
console.log("src:", await img.getAttribute("src").catch(e => "ERR"));
await browser.close();
