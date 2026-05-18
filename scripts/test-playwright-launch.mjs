import { chromium } from "playwright-core";

const browser = await chromium.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
  args: ["--no-sandbox"],
});
const page = await browser.newPage();
await page.goto("http://127.0.0.1:4011/home", { waitUntil: "domcontentloaded", timeout: 20000 });
console.log(JSON.stringify({
  url: page.url(),
  text: (await page.locator("body").innerText()).slice(0, 300),
}, null, 2));
await browser.close();
