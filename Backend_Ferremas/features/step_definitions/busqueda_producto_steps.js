const { Given, When, Then } = require('@cucumber/cucumber');
const { By, until } = require('selenium-webdriver');
const { performClienteLogin } = require('./common_steps');
// ...existing code...

Given('el usuario accede a la pagina como cliente', async function () {
  await performClienteLogin(this.driver, this.baseUrl);
});

Given('el usuario accede a la pagina de busqueda como cliente', async function () {
  await performClienteLogin(this.driver, this.baseUrl);
});

When('accede a productos para busqueda', async function () {
  await this.driver.get(this.baseUrl + '/productos/');
  await this.driver.sleep(200);
});

When('escribe {string} en la barra de búsqueda', async function (busqueda) {
  // Esperar a que la página cargue completamente
  await this.driver.sleep(500);
  // Intentar con name="search" primero, luego con id="search"
  try {
    const el = await this.driver.findElement(By.name('search'));
    await el.clear();
    await el.sendKeys(busqueda);
  } catch (e) {
    const el = await this.driver.findElement(By.id('search'));
    await el.clear();
    await el.sendKeys(busqueda);
  }
});

When('presiona enter o hace clic en el botón de filtrar', async function () {
  try {
    const btn = await this.driver.findElement(By.css('button[type="submit"]'));
    await btn.click();
  } catch (e) {
    // Si no hay botón, intenta presionar Enter usando name="search" primero
    try {
      const el = await this.driver.findElement(By.name('search'));
      await el.sendKeys(require('selenium-webdriver').Key.ENTER);
    } catch (e2) {
      const el = await this.driver.findElement(By.id('search'));
      await el.sendKeys(require('selenium-webdriver').Key.ENTER);
    }
  }
  await this.driver.sleep(500);
});

When('selecciona categoria para busqueda {string}', async function (categoria) {
  const el = await this.driver.findElement(By.id('categoria_id'));
  await el.sendKeys(categoria);
  await this.driver.sleep(200);
});

Then('el sistema muestra los productos que coinciden con la búsqueda', async function () {
  // Verifica que hay una tabla de productos
  const tabla = await this.driver.findElement(By.css('table'));
  const isDisplayed = await tabla.isDisplayed();
  if (!isDisplayed) throw new Error('No se muestra la tabla de productos');
});

Then('el sistema muestra todos los productos', async function () {
  // Verifica que hay una tabla de productos
  const tabla = await this.driver.findElement(By.css('table'));
  const isDisplayed = await tabla.isDisplayed();
  if (!isDisplayed) throw new Error('No se muestra la tabla de productos');
});
// ...existing code...
