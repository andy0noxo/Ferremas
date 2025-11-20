const { Given, When, Then } = require('@cucumber/cucumber');
const { By, until } = require('selenium-webdriver');
const { performLogin } = require('./common_steps');

Given('el usuario accede a la pagina de reportes como administrador', async function () {
  await performLogin(this.driver, this.baseUrl);
});

When('accede a Informe Ventas Mensual', async function () {
  await this.driver.get(this.baseUrl + '/reportes/ventas-mensual/');
  await this.driver.sleep(200);
});

When('selecciona sucursal para reportes {string}', async function (sucursal) {
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
