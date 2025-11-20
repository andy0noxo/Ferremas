const { Given, When, Then } = require('@cucumber/cucumber');
const { By, until } = require('selenium-webdriver');
const { performClienteLogin } = require('./common_steps');
// ...existing code...

Given('el usuario accede a la pagina de carrito compras como cliente', async function () {
  await performClienteLogin(this.driver, this.baseUrl);
});

When('accede a productos para carrito', async function () {
  await this.driver.get(this.baseUrl + '/productos/');
  await this.driver.sleep(200);
});

When('selecciona un producto {string}', async function (nombreProducto) {
  const btn = await this.driver.findElement(By.xpath(`//tr[td[contains(text(),"${nombreProducto}")]]//button[contains(@class,'agregar-carrito')]`));
  await btn.click();
  await this.driver.sleep(200);
});

When('lo agrega al carrito', async function () {
  // Asume que el botón anterior ya lo agregó, o busca el botón de agregar al carrito
  // Si hay un modal, lo cierra
  try {
    const closeBtn = await this.driver.findElement(By.css('.modal-close'));
    await closeBtn.click();
  } catch (e) {}
  await this.driver.sleep(200);
});

When('accede a mi pedido', async function () {
  await this.driver.get(this.baseUrl + '/carrito/');
  await this.driver.sleep(200);
});

When('selecciona metodo de pago {string}', async function (metodo) {
  const el = await this.driver.findElement(By.name('metodo_pago'));
  await el.sendKeys(metodo);
  await this.driver.sleep(200);
});

When('selecciona sucursal para carrito {string}', async function (sucursal) {
  const el = await this.driver.findElement(By.name('sucursal'));
  await el.sendKeys(sucursal);
  await this.driver.sleep(200);
});

Then('el sistema actualiza el carrito con el producto', async function () {
  const productos = await this.driver.findElements(By.xpath("//tr[td[contains(text(),'Taladro X200')]]"));
  if (productos.length === 0) throw new Error('El producto no está en el carrito');
});

Then('el sistema actualiza el carrito con el producto y subtotal', async function () {
  const productos = await this.driver.findElements(By.xpath("//tr[td[contains(text(),'Taladro X200')]]"));
  if (productos.length === 0) throw new Error('El producto no está en el carrito');
  const subtotal = await this.driver.findElement(By.css('.carrito-subtotal'));
  const texto = await subtotal.getText();
  if (!texto || isNaN(Number(texto.replace(/[^\d]/g, '')))) throw new Error('No se muestra el subtotal correctamente');
});
// ...existing code...
