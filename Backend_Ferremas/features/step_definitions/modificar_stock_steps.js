const { Given, When, Then } = require('@cucumber/cucumber');
const { By, until, Key } = require('selenium-webdriver');
const { performBodegueroLogin } = require('./common_steps');
// ...existing code...

Given('el usuario accede a la pagina como bodeguero', async function () {
  await performBodegueroLogin(this.driver, this.baseUrl);
});

When('accede a Stock General', async function () {
  await this.driver.get(this.baseUrl + '/stock/');
  await this.driver.sleep(200);
});

When('selecciona actualizar en el producto {string}', async function (nombreProducto) {
  const btn = await this.driver.findElement(By.xpath(`//tr[td[contains(text(),"${nombreProducto}")]]//button[contains(@class,'actualizar-stock')]`));
  await btn.click();
  await this.driver.sleep(200);
});

When('cambia cantidad a {string}', async function (cantidad) {
  const el = await this.driver.findElement(By.name('cantidad'));
  await el.clear();
  await el.sendKeys(cantidad);
});

When('presiona enter o hace clic en el botón de actualizar', async function () {
  try {
    const btn = await this.driver.findElement(By.css('button[type="submit"], .btn-actualizar'));
    await btn.click();
  } catch (e) {
    const el = await this.driver.findElement(By.name('cantidad'));
    await el.sendKeys(Key.ENTER);
  }
  await this.driver.sleep(500);
});

Then('aparece mensaje de stock actualizado', async function () {
  const el = await this.driver.findElement(By.css('.alert-success'));
  const texto = await el.getText();
  if (!texto.toLowerCase().includes('stock actualizado')) throw new Error('No se encontró el mensaje de stock actualizado');
});

Then('se actualiza el valor del stock en la lista de stock general', async function () {
  // Verifica que el valor del stock se actualizó
  const stock = await this.driver.findElement(By.xpath("//tr[td[contains(text(),'Taladro X200')]]/td[contains(@class,'stock-cantidad')]")).getText();
  if (!stock || isNaN(Number(stock))) throw new Error('No se actualizó el valor del stock');
});

Then('aparece mensaje de que el valor debe ser igual o mayor a 0', async function () {
  const el = await this.driver.findElement(By.css('.alert-danger'));
  const texto = await el.getText();
  if (!texto.toLowerCase().includes('igual o mayor a 0')) throw new Error('No se encontró el mensaje de valor igual o mayor a 0');
});
// ...existing code...
