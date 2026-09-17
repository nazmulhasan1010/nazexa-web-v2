const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/auth');
  await page.screenshot({ path: 'auth.png' });
  await browser.close();
})();
