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

When('accede a Informe Ventas Mensual', async function () {
  await this.driver.get(this.baseUrl + '/reportes/ventas-mensual/');
  await this.driver.sleep(200);
});

When('selecciona sucursal {string}', async function (sucursal) {
  const el = await this.driver.findElement(By.name('sucursal'));
  await el.sendKeys(sucursal);
  await this.driver.sleep(200);
});

When('click en crear', async function () {
  const btn = await this.driver.findElement(By.css('button[type="submit"]'));
  await btn.click();
  await this.driver.sleep(500);
});

Then('muestra informe de ventas del mes', async function () {
  // Verifica que se muestra el informe
  const informe = await this.driver.findElement(By.css('.informe-ventas-mensual'));
  const texto = await informe.getText();
  if (!texto || texto.length === 0) throw new Error('No se muestra el informe de ventas del mes');
});
// ...existing code...
