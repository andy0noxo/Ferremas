const { Given, When, Then } = require('@cucumber/cucumber');
const { By, until } = require('selenium-webdriver');
const { performClienteLogin } = require('./common_steps');
// ...existing code...

Given('el usuario accede a la pagina de busqueda como cliente', async function () {
  await performClienteLogin(this.driver, this.baseUrl);
});

When('accede a productos para busqueda', async function () {
  await this.driver.get(this.baseUrl + '/productos/');
  await this.driver.sleep(200);
});

When('escribe {string} en la barra de búsqueda', async function (busqueda) {
  const el = await this.driver.findElement(By.name('busqueda'));
  await el.clear();
  await el.sendKeys(busqueda);
});

When('presiona enter o hace clic en el botón de filtrar', async function () {
  try {
    const btn = await this.driver.findElement(By.css('button[type="submit"], .btn-filtrar'));
    await btn.click();
  } catch (e) {
    // Si no hay botón, intenta presionar Enter
    const el = await this.driver.findElement(By.name('busqueda'));
    await el.sendKeys(require('selenium-webdriver').Key.ENTER);
  }
  await this.driver.sleep(500);
});

When('selecciona categoria para busqueda {string}', async function (categoria) {
  const el = await this.driver.findElement(By.name('categoria'));
  await el.sendKeys(categoria);
  await this.driver.sleep(200);
});

Then('el sistema muestra los productos que coinciden con la búsqueda', async function () {
  const productos = await this.driver.findElements(By.css('.producto-item'));
  if (productos.length === 0) throw new Error('No se muestran productos que coincidan con la búsqueda');
});

Then('el sistema muestra todos los productos', async function () {
  const productos = await this.driver.findElements(By.css('.producto-item'));
  if (productos.length === 0) throw new Error('No se muestran productos en la lista');
});
// ...existing code...
