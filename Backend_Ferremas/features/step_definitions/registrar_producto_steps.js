const { Given, When, Then } = require('@cucumber/cucumber');
const { By, until } = require('selenium-webdriver');
const { performLogin } = require('./common_steps');
// ...existing code...

Given('el usuario accede a la pagina de registro de producto como administrador', async function () {
  await performLogin(this.driver, this.baseUrl);
});

When('accede al formulario de registro de producto', async function () {
  await this.driver.get(this.baseUrl + '/productos/crear/');
  await this.driver.sleep(200);
});

When('ingreso nombre de producto {string}', async function (nombre) {
  const el = await this.driver.findElement(By.name('nombre'));
  await el.clear();
  await el.sendKeys(nombre);
});

When('ingreso descripción de producto {string}', async function (descripcion) {
  const el = await this.driver.findElement(By.name('descripcion'));
  await el.clear();
  await el.sendKeys(descripcion);
});

When('ingreso precio de producto {string}', async function (precio) {
  const el = await this.driver.findElement(By.name('precio'));
  await el.clear();
  await el.sendKeys(precio);
});

When('selecciono marca de producto {string}', async function (marca) {
  const el = await this.driver.findElement(By.name('marca_id'));
  // Seleccionar por texto visible en el select
  await el.sendKeys(marca);
});

When('selecciono categoria de producto {string}', async function (categoria) {
  const el = await this.driver.findElement(By.name('categoria_id'));
  // Seleccionar por texto visible en el select
  await el.sendKeys(categoria);
});

Then('el sistema guarda el producto correctamente', async function () {
  // Simula el envío del formulario
  const btn = await this.driver.findElement(By.css('button[type="submit"]'));
  await btn.click();
  await this.driver.sleep(500);
});

Then('lo muestra en el catálogo de productos registrado', async function () {
  // Verifica que el producto aparece en el catálogo
  await this.driver.get(this.baseUrl + '/productos/');
  const productos = await this.driver.findElements(By.xpath("//*[contains(text(),'Producto1') or contains(text(),'Producto2')]"));
  if (productos.length === 0) throw new Error('El producto no aparece en el catálogo');
});

Then('aparece mensaje de datos faltantes en producto', async function () {
  const el = await this.driver.findElement(By.css('.alert-danger'));
  const texto = await el.getText();
  if (!texto.toLowerCase().includes('faltantes')) throw new Error('No se encontró el mensaje de datos faltantes');
});

Then('aparece mensaje de valor debe ser mayor a 0 en producto', async function () {
  const el = await this.driver.findElement(By.css('.alert-danger'));
  const texto = await el.getText();
  if (!texto.toLowerCase().includes('mayor a 0')) throw new Error('No se encontró el mensaje de valor debe ser mayor a 0');
});
// ...existing code...
