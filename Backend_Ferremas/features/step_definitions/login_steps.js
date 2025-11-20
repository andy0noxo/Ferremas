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

Given('el usuario accede a la pagina de login', async function () {
  await this.driver.get(this.baseUrl + '/login/');
  // wait for page to stabilise
  await this.driver.sleep(200);
});

When('ingreso email de login {string}', async function (email) {
  const selectors = [
    By.id('id_username'),
    By.name('username'),
    By.name('email'),
    By.css('input[type="email"]'),
    By.css('input[type="text"]')
  ];
  let el = null;
  for (const sel of selectors) {
    try {
      await this.driver.wait(until.elementLocated(sel), 5000);
      el = await this.driver.findElement(sel);
      break;
    } catch (e) {}
  }
  if (!el) throw new Error('No se encontró el campo usuario/email');
  await el.clear();
  await el.sendKeys(email);
});

When('ingreso contraseña de login {string}', async function (password) {
  const selectors = [
    By.id('id_password'),
    By.name('password'),
    By.css('input[type="password"]')
  ];
  let el = null;
  for (const sel of selectors) {
    try {
      await this.driver.wait(until.elementLocated(sel), 5000);
      el = await this.driver.findElement(sel);
      break;
    } catch (e) {}
  }
  if (!el) throw new Error('No se encontró el campo password');
  await el.clear();
  await el.sendKeys(password);
});

When('realizo el envío de los datos de login', async function () {
  const selectors = [
    By.css('button[type="submit"]'),
    By.css('input[type="submit"]'),
    By.css('button.btn-primary'),
    By.css('button[type="button"][onclick*="submit"]')
  ];
  let btn = null;
  for (const sel of selectors) {
    try {
      await this.driver.wait(until.elementLocated(sel), 5000);
      btn = await this.driver.findElement(sel);
      break;
    } catch (e) {}
  }
  if (!btn) throw new Error('No se encontró el botón de envío');
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

Then('aparece un mensaje de datos equivocados', async function () {
  // Espera hasta que aparezca un elemento de error
  const selectors = [
    By.css('.alert-danger'),
    By.css('.error-message'),
    By.css('.invalid-feedback'),
    By.xpath("//*[contains(text(),'equivocado') or contains(text(),'incorrecto')]")
  ];
  let found = false;
  for (const sel of selectors) {
    try {
      await this.driver.wait(until.elementLocated(sel), 3000);
      const el = await this.driver.findElement(sel);
      const texto = await el.getText();
      if (texto && (texto.toLowerCase().includes('equivocado') || texto.toLowerCase().includes('incorrecto'))) {
        found = true;
        break;
      }
    } catch (e) {}
  }
  if (!found) throw new Error('No se encontró el mensaje de error esperado para datos equivocados o incorrectos.');
});
