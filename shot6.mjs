import { chromium } from "playwright";
const ACCESS = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzkwMDA2Mjg3LCJpYXQiOjE3OTAwMDI2ODcsImp0aSI6ImY4ZWU3ZjlmZjU2YjRmZGY5ZTMxMmUxZjRlMmVkYjY1IiwidXNlcl9pZCI6MTE1fQ.RFdvlj8c9Y-ya3EtpJ5RzNpNOSDh0Mcs-bi3hbByNW4";
const REFRESH = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoicmVmcmVzaCIsImV4cCI6MTc5MTIxMjI4NywiaWF0IjoxNzkwMDAyNjg3LCJqdGkiOiIzZTFiODg3MWQ5NjM0OWQxYmRjOGExY2JkZDNlZTE0NCIsInVzZXJfaWQiOjExNX0.MYxDU-fevrcmRTAE1R64EqXKKPLAkmNmJfyArJPkRIg";
const userData = { id: 115, name: "Preview Tester", email: "uidesignpreview99@example.com", avatar: "", userRole: "client", description: "", country: "Cameroun", code: "+237", address: "Douala", phone: "690000099", registrationComplete: true, is_verified: true, email_verified: true, is_active: true, access_level: "full", status_message: "", selectedCategories: [], myPosts: [] };

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, ignoreHTTPSErrors: true });
const page = await context.newPage();
const failed = [];
page.on("response", (res) => { if (res.url().includes("image-proxy") && res.status() >= 400) failed.push(res.status() + " " + res.url()); });
page.on("requestfailed", (req) => { if (req.url().includes("image")) console.log("REQUEST FAILED:", req.url(), req.failure()?.errorText); });

await page.goto("https://127.0.0.1:5199/", { waitUntil: "domcontentloaded" });
await page.evaluate(({ACCESS,REFRESH,userData}) => {
  localStorage.setItem("access_token", ACCESS);
  localStorage.setItem("refresh_token", REFRESH);
  localStorage.setItem("userData", JSON.stringify(userData));
}, {ACCESS,REFRESH,userData});
await page.reload({ waitUntil: "networkidle" });
await page.waitForSelector(".post-card", { timeout: 15000 }).catch(() => console.log("no .post-card appeared"));
await page.waitForTimeout(1500);

const info = await page.evaluate(() => {
  const img = document.querySelector(".post-card__image");
  return img ? {
    src: img.src,
    naturalWidth: img.naturalWidth,
    naturalHeight: img.naturalHeight,
    complete: img.complete,
    clientWidth: img.clientWidth,
    clientHeight: img.clientHeight,
  } : "NOT FOUND";
});
console.log("img info:", JSON.stringify(info, null, 2));
console.log("failed image-proxy requests:", failed);
await browser.close();
