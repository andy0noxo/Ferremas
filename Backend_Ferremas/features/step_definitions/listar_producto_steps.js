const { Given, When, Then } = require('@cucumber/cucumber');
const { By, until } = require('selenium-webdriver');
const { performLogin } = require('./common_steps');

Given('el usuario accede a la pagina como administrador', async function () {
  await performLogin(this.driver, this.baseUrl);
});

Given('el usuario accede a la pagina de listar producto como administrador', async function () {
  await performLogin(this.driver, this.baseUrl);
});

When('accede a productos para listar', async function () {
  await this.driver.get(this.baseUrl + '/productos/');
  await this.driver.sleep(200);
});

When('selecciona categoria {string}', async function (categoria) {
  const el = await this.driver.findElement(By.id('categoria_id'));
  await el.sendKeys(categoria);
});

When('selecciona sucursal {string}', async function (sucursal) {
  const el = await this.driver.findElement(By.id('sucursal_id'));
  await el.sendKeys(sucursal);
});

When('selecciona categoria para listar {string}', async function (categoria) {
  const el = await this.driver.findElement(By.id('categoria_id'));
  await el.sendKeys(categoria);
});

When('selecciona sucursal para listar {string}', async function (sucursal) {
  const el = await this.driver.findElement(By.id('sucursal_id'));
  await el.sendKeys(sucursal);
});

When('Click en Filtrar', async function () {
  const btn = await this.driver.findElement(By.css('button[type="submit"]'));
  await btn.click();
  await this.driver.sleep(500);
});

Then('el sistema muestra los productos correspondientes', async function () {
  // Verifica que hay una tabla de productos
  const tabla = await this.driver.findElement(By.css('table'));
  const isDisplayed = await tabla.isDisplayed();
  if (!isDisplayed) throw new Error('No se muestra la tabla de productos');
});
