const { Given, When, Then } = require('@cucumber/cucumber');
const { By, until } = require('selenium-webdriver');
const fs = require('fs');
const path = require('path');

async function ensureDebugDir() {
  const dir = path.join(__dirname, '..', '_debug');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
}

async function saveDebugSnapshot(driver, namePrefix = 'debug') {
  try {
    const dir = await ensureDebugDir();
    const ts = Date.now();
    // screenshot
    const img = await driver.takeScreenshot();
    fs.writeFileSync(path.join(dir, `${ts}-${namePrefix}-screenshot.png`), img, 'base64');
    // page source
    const src = await driver.getPageSource();
    fs.writeFileSync(path.join(dir, `${ts}-${namePrefix}-page.html`), src, 'utf8');
  } catch (e) {
    // ignore debug failures
  }
}

async function findElementWithFallback(driver, selectors, timeout = 5000) {
  for (const sel of selectors) {
    try {
      await driver.wait(until.elementLocated(sel), timeout);
      const el = await driver.findElement(sel);
      return el;
    } catch (e) {
      // try next selector
    }
  }
  // if none found, capture debug snapshot
  try {
    await saveDebugSnapshot(driver, 'not-found');
  } catch (e) {
    // ignore
  }
  return null;
}

Given('que puedo acceder a la pagina', async function () {
  await this.driver.get(this.baseUrl + '/');
});

When('puedo acceder al login', async function () {
  await this.driver.get(this.baseUrl + '/login/');
  // wait for page to stabilise
  await this.driver.sleep(200);
});

When('ingreso como usuario {string}', async function (username) {
  const selectors = [
    By.id('id_username'),
    By.name('username'),
    By.name('email'),
    By.css('input[type="email"]'),
    By.css('input[type="text"]')
  ];

  const el = await findElementWithFallback(this.driver, selectors, 5000);
  if (!el) {
    const url = await this.driver.getCurrentUrl();
    throw new Error(`No se encontró el campo usuario en ${url}. Buscados: id=id_username, name=username, name=email, input[type=email], input[type=text]. Capturé snapshot en features/_debug/`);
  }
  await el.clear();
  await el.sendKeys(username);
});

When('ingreso como clave {string}', async function (password) {
  const selectors = [
    By.id('id_password'),
    By.name('password'),
    By.css('input[type="password"]')
  ];

  const el = await findElementWithFallback(this.driver, selectors, 5000);
  if (!el) {
    const url = await this.driver.getCurrentUrl();
    throw new Error(`No se encontró el campo password en ${url}. Buscados: id=id_password, name=password, input[type=password]. Capturé snapshot en features/_debug/`);
  }
  await el.clear();
  await el.sendKeys(password);
});

When('realizo el envío de los datos', async function () {
  const selectors = [
    By.css('button[type="submit"]'),
    By.css('input[type="submit"]'),
    By.css('button.btn-primary'),
    By.css('button[type="button"][onclick*="submit"]')
  ];

  const btn = await findElementWithFallback(this.driver, selectors, 5000);
  if (!btn) {
    const url = await this.driver.getCurrentUrl();
    throw new Error(`No se encontró el botón de envío en ${url}. Capturé snapshot en features/_debug/`);
  }
  await btn.click();
  // espera breve para que la navegación ocurra
  await this.driver.sleep(500);
});

Then('aparece un mensaje de ingreso correcto', async function () {
  // espera hasta que aparezca un h1 o hasta timeout
  await this.driver.wait(until.elementLocated(By.tagName('h1')), 5000);
  const texto = await this.driver.findElement(By.tagName('h1')).getText();
  if (texto !== 'Bienvenido') throw new Error(`Se esperaba "Bienvenido", se obtuvo "${texto}"`);
});
