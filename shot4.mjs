import { chromium } from "playwright";

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
const context = await browser.newContext({ viewport: { width: 390, height: 844 }, ignoreHTTPSErrors: true });
const page = await context.newPage();
await page.goto("https://127.0.0.1:5199/", { waitUntil: "domcontentloaded" });
await page.evaluate(({ACCESS,REFRESH,userData}) => {
  localStorage.setItem("access_token", ACCESS);
  localStorage.setItem("refresh_token", REFRESH);
  localStorage.setItem("userData", JSON.stringify(userData));
}, {ACCESS,REFRESH,userData});
await page.reload({ waitUntil: "networkidle" });
await page.waitForTimeout(2600);

const info = await page.evaluate(() => {
  const scroller = document.querySelector(".home-scroll");
  const body = document.body;
  const html = document.documentElement;
  const root = document.getElementById("root");
  const app = document.querySelector(".home-container");
  const out = {};
  if (scroller) {
    out.scroller = {
      scrollHeight: scroller.scrollHeight,
      clientHeight: scroller.clientHeight,
      offsetHeight: scroller.offsetHeight,
      overflowY: getComputedStyle(scroller).overflowY,
      position: getComputedStyle(scroller).position,
      touchAction: getComputedStyle(scroller).touchAction,
      flexBasis: getComputedStyle(scroller).flexBasis,
      minHeight: getComputedStyle(scroller).minHeight,
      display: getComputedStyle(scroller).display,
    };
    scroller.scrollTop = 400;
    out.scrollTopAfterSet = scroller.scrollTop;
  } else {
    out.scroller = "NOT FOUND";
  }
  out.bodyOverflow = getComputedStyle(body).overflow;
  out.htmlOverflow = getComputedStyle(html).overflow;
  out.rootHeight = root ? root.getBoundingClientRect().height : null;
  out.appHeight = app ? app.getBoundingClientRect().height : null;
  out.windowInnerHeight = window.innerHeight;
  return out;
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
