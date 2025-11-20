const { Given, When, Then } = require('@cucumber/cucumber');
const { By, until } = require('selenium-webdriver');
const { performLogin } = require('./common_steps');

Given('el usuario accede a la pagina de listar producto como administrador', async function () {
  await performLogin(this.driver, this.baseUrl);
});

When('accede a productos para listar', async function () {
  await this.driver.get(this.baseUrl + '/productos/');
  await this.driver.sleep(200);
});

When('selecciona categoria para listar {string}', async function (categoria) {
  const el = await this.driver.findElement(By.name('categoria'));
  await el.sendKeys(categoria);
});

When('selecciona sucursal para listar {string}', async function (sucursal) {
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
