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

When('accede al formulario de modificar producto', async function () {
  await this.driver.get(this.baseUrl + '/productos/modificar/');
  await this.driver.sleep(200);
});

When('ingreso nombre {string}', async function (nombre) {
  const el = await this.driver.findElement(By.name('nombre'));
  await el.clear();
  await el.sendKeys(nombre);
});

When('ingreso descripción {string}', async function (descripcion) {
  const el = await this.driver.findElement(By.name('descripcion'));
  await el.clear();
  await el.sendKeys(descripcion);
});

When('ingreso precio {string}', async function (precio) {
  const el = await this.driver.findElement(By.name('precio'));
  await el.clear();
  await el.sendKeys(precio);
});

When('selecciono marca {string}', async function (marca) {
  const el = await this.driver.findElement(By.name('marca'));
  await el.sendKeys(marca);
});

When('selecciono categoria {string}', async function (categoria) {
  const el = await this.driver.findElement(By.name('categoria'));
  await el.sendKeys(categoria);
});

Then('el sistema guarda la modificación del producto', async function () {
  const btn = await this.driver.findElement(By.css('button[type="submit"]'));
  await btn.click();
  await this.driver.sleep(500);
});

Then('lo muestra en el catálogo', async function () {
  await this.driver.get(this.baseUrl + '/productos/');
  const productos = await this.driver.findElements(By.xpath("//*[contains(text(),'Producto4')]"));
  if (productos.length === 0) throw new Error('El producto modificado no aparece en el catálogo');
});

Then('aparece mensaje de datos faltantes', async function () {
  const el = await this.driver.findElement(By.css('.alert-danger'));
  const texto = await el.getText();
  if (!texto.toLowerCase().includes('faltantes')) throw new Error('No se encontró el mensaje de datos faltantes');
});

Then('aparece mensaje de valor debe ser mayor a 0', async function () {
  const el = await this.driver.findElement(By.css('.alert-danger'));
  const texto = await el.getText();
  if (!texto.toLowerCase().includes('mayor a 0')) throw new Error('No se encontró el mensaje de valor debe ser mayor a 0');
});
// ...existing code...
