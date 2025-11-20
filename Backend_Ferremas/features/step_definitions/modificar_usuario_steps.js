const { Given, When, Then } = require('@cucumber/cucumber');
const { By, until } = require('selenium-webdriver');
const { performLogin } = require('./common_steps');
// ...existing code...

Given('el usuario accede a la pagina de modificar usuario como administrador', async function () {
  await performLogin(this.driver, this.baseUrl);
});

When('accede al listado de usuario para modificar', async function () {
  await this.driver.get(this.baseUrl + '/usuarios/');
  await this.driver.sleep(200);
});

When('click en modificar usuario {string}', async function (nombreUsuario) {
  const btn = await this.driver.findElement(By.xpath(`//tr[td[contains(text(),"${nombreUsuario}")]]//button[contains(@class,'modificar')]`));
  await btn.click();
  await this.driver.sleep(200);
});

When('ingreso nombre de usuario modificado {string}', async function (nombre) {
  const el = await this.driver.findElement(By.name('nombre'));
  await el.clear();
  await el.sendKeys(nombre);
});

When('ingreso contraseña de usuario modificado {string}', async function (password) {
  const el = await this.driver.findElement(By.name('password'));
  await el.clear();
  await el.sendKeys(password);
});

When('ingreso rut de usuario modificado {string}', async function (rut) {
  const el = await this.driver.findElement(By.name('rut'));
  await el.clear();
  await el.sendKeys(rut);
});

When('ingreso email de usuario modificado {string}', async function (email) {
  const el = await this.driver.findElement(By.name('email'));
  await el.clear();
  await el.sendKeys(email);
});

When('selecciono rol de usuario modificado {string}', async function (rol) {
  const el = await this.driver.findElement(By.name('rol'));
  await el.sendKeys(rol);
});

When('selecciono sucursal de usuario modificado {string}', async function (sucursal) {
  const el = await this.driver.findElement(By.name('sucursal'));
  await el.sendKeys(sucursal);
});

When('click en crear usuario modificado', async function () {
  const btn = await this.driver.findElement(By.css('button[type="submit"]'));
  await btn.click();
  await this.driver.sleep(500);
});

Then('aparece mensaje de que usuario modificado exitosamente', async function () {
  const el = await this.driver.findElement(By.css('.alert-success'));
  const texto = await el.getText();
  if (!texto.toLowerCase().includes('modificado exitosamente')) throw new Error('No se encontró el mensaje de usuario modificado exitosamente');
});

Then('muestra lista de usuarios modificados', async function () {
  await this.driver.get(this.baseUrl + '/usuarios/');
  const usuarios = await this.driver.findElements(By.css('.usuario-item'));
  if (usuarios.length === 0) throw new Error('No se muestra la lista de usuarios');
});

Then('aparece mensaje de que el rut ya esta registrado en usuario modificado', async function () {
  const el = await this.driver.findElement(By.css('.alert-danger'));
  const texto = await el.getText();
  if (!texto.toLowerCase().includes('rut ya esta registrado')) throw new Error('No se encontró el mensaje de rut ya está registrado');
});

Then('aparece mensaje de que falta ingresar el rut en usuario modificado', async function () {
  const el = await this.driver.findElement(By.css('.alert-danger'));
  const texto = await el.getText();
  if (!texto.toLowerCase().includes('falta ingresar el rut')) throw new Error('No se encontró el mensaje de que falta ingresar el rut');
});

Then('aparece mensaje de que el email ya esta registrado en usuario modificado', async function () {
  const el = await this.driver.findElement(By.css('.alert-danger'));
  const texto = await el.getText();
  if (!texto.toLowerCase().includes('email ya esta registrado')) throw new Error('No se encontró el mensaje de email ya está registrado');
});

Then('aparece mensaje de que falta ingresar el email en usuario modificado', async function () {
  const el = await this.driver.findElement(By.css('.alert-danger'));
  const texto = await el.getText();
  if (!texto.toLowerCase().includes('falta ingresar el email')) throw new Error('No se encontró el mensaje de que falta ingresar el email');
});
// ...existing code...
