const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:3000/login');
  await page.screenshot({ path: 'login.png' });
  const html = await page.content();
  console.log(html.includes('Sign in to your account') ? 'FOUND' : 'NOT FOUND');
  await browser.close();
})();
