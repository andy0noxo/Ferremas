const { Before, After, setDefaultTimeout } = require('@cucumber/cucumber');
const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
// NOTE: do NOT require('chromedriver') here. Selenium Manager (bundled in selenium-webdriver >=4)
// will locate and download the matching ChromeDriver for the installed Chrome browser.

setDefaultTimeout(60 * 1000);

Before(async function () {
  const options = new chrome.Options();
  // options.addArguments('--headless=new'); // descomenta para headless

  this.driver = await new Builder()
    .forBrowser('chrome')
    .setChromeOptions(options)
    .build();

  // Use 127.0.0.1 to match the Django dev server address
  this.baseUrl = 'http://127.0.0.1:8000';
});

After(async function () {
  if (this.driver) {
    await this.driver.quit();
  }
});
