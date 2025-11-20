const { Before, After, setDefaultTimeout } = require('@cucumber/cucumber');
const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const path = require('path');
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

async function saveScreenshot(driver, featureName, scenarioName) {
  try {
    const dir = path.join(__dirname, '..', '_debug');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const now = new Date();
    const dateStr = now.toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0,19);
    const img = await driver.takeScreenshot();
    const fileName = `${featureName}_${scenarioName}_${dateStr}-screenshot.png`.replace(/\s+/g, '_');
    fs.writeFileSync(path.join(dir, fileName), img, 'base64');
  } catch (e) {
    // ignore errors
  }
}

After(async function (scenario) {
  if (this.driver) {
    // Obtiene el nombre de la funcionalidad y escenario
    const featureName = scenario.gherkinDocument.feature.name;
    const scenarioName = scenario.pickle.name;
    await saveScreenshot(this.driver, featureName, scenarioName);
    await this.driver.quit();
  }
});
