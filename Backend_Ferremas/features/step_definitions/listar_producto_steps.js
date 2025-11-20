const { Given, When, Then } = require('@cucumber/cucumber');
const { By, until } = require('selenium-webdriver');
// ...existing code...

Given('el usuario accede a la pagina como administrador', async function () {
  // Login como administrador
  await this.driver.get(this.baseUrl + '/login/');
  await this.driver.sleep(200);
  const userEl = await this.driver.findElement(By.name('username'));
  await userEl.clear();
  await userEl.sendKeys('an.salcedo@duocuc.cl');
  const passEl = await this.driver.findElement(By.name('password'));
  await passEl.clear();
  await passEl.sendKeys('Admin.123456789');
  const btn = await this.driver.findElement(By.css('button[type="submit"]'));
  await btn.click();
  await this.driver.sleep(500);
  const h1 = await this.driver.findElement(By.tagName('h1'));
  const texto = await h1.getText();
  if (texto !== 'Bienvenido') throw new Error('No se logró el login como administrador');
});

When('accede a productos', async function () {
  await this.driver.get(this.baseUrl + '/productos/');
  await this.driver.sleep(200);
});

When('selecciona categoria {string}', async function (categoria) {
  const el = await this.driver.findElement(By.name('categoria'));
  await el.sendKeys(categoria);
});

When('selecciona sucursal {string}', async function (sucursal) {
  const el = await this.driver.findElement(By.name('sucursal'));
  await el.sendKeys(sucursal);
});

When('Click en Filtrar', async function () {
  const btn = await this.driver.findElement(By.css('button[type="submit"]'));
  await btn.click();
  await this.driver.sleep(500);
});

Then('el sistema muestra los productos correspondientes', async function () {
  // Verifica que hay productos listados
  const productos = await this.driver.findElements(By.css('.producto-item'));
  if (productos.length === 0) throw new Error('No se muestran productos en la lista');
});
// ...existing code...
