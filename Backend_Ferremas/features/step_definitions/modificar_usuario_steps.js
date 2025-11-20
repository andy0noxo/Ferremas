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

When('accede al listado de usuario', async function () {
  await this.driver.get(this.baseUrl + '/usuarios/');
  await this.driver.sleep(200);
});

When('click en modificar usuario {string}', async function (nombreUsuario) {
  const btn = await this.driver.findElement(By.xpath(`//tr[td[contains(text(),"${nombreUsuario}")]]//button[contains(@class,'modificar')]`));
  await btn.click();
  await this.driver.sleep(200);
});

When('ingreso nombre {string}', async function (nombre) {
  const el = await this.driver.findElement(By.name('nombre'));
  await el.clear();
  await el.sendKeys(nombre);
});

When('ingreso contraseña {string}', async function (password) {
  const el = await this.driver.findElement(By.name('password'));
  await el.clear();
  await el.sendKeys(password);
});

When('ingreso rut {string}', async function (rut) {
  const el = await this.driver.findElement(By.name('rut'));
  await el.clear();
  await el.sendKeys(rut);
});

When('ingreso email {string}', async function (email) {
  const el = await this.driver.findElement(By.name('email'));
  await el.clear();
  await el.sendKeys(email);
});

When('selecciono rol {string}', async function (rol) {
  const el = await this.driver.findElement(By.name('rol'));
  await el.sendKeys(rol);
});

When('selecciono sucursal {string}', async function (sucursal) {
  const el = await this.driver.findElement(By.name('sucursal'));
  await el.sendKeys(sucursal);
});

When('click en crear', async function () {
  const btn = await this.driver.findElement(By.css('button[type="submit"]'));
  await btn.click();
  await this.driver.sleep(500);
});

Then('aparece mensaje de que usuario modificado exitosamente', async function () {
  const el = await this.driver.findElement(By.css('.alert-success'));
  const texto = await el.getText();
  if (!texto.toLowerCase().includes('modificado exitosamente')) throw new Error('No se encontró el mensaje de usuario modificado exitosamente');
});

Then('muestra lista de usuarios', async function () {
  await this.driver.get(this.baseUrl + '/usuarios/');
  const usuarios = await this.driver.findElements(By.css('.usuario-item'));
  if (usuarios.length === 0) throw new Error('No se muestra la lista de usuarios');
});

Then('aparece mensaje de que el rut ya esta registrado', async function () {
  const el = await this.driver.findElement(By.css('.alert-danger'));
  const texto = await el.getText();
  if (!texto.toLowerCase().includes('rut ya esta registrado')) throw new Error('No se encontró el mensaje de rut ya está registrado');
});

Then('aparece mensaje de que falta ingresar el rut', async function () {
  const el = await this.driver.findElement(By.css('.alert-danger'));
  const texto = await el.getText();
  if (!texto.toLowerCase().includes('falta ingresar el rut')) throw new Error('No se encontró el mensaje de que falta ingresar el rut');
});

Then('aparece mensaje de que el email ya esta registrado', async function () {
  const el = await this.driver.findElement(By.css('.alert-danger'));
  const texto = await el.getText();
  if (!texto.toLowerCase().includes('email ya esta registrado')) throw new Error('No se encontró el mensaje de email ya está registrado');
});

Then('aparece mensaje de que falta ingresar el email', async function () {
  const el = await this.driver.findElement(By.css('.alert-danger'));
  const texto = await el.getText();
  if (!texto.toLowerCase().includes('falta ingresar el email')) throw new Error('No se encontró el mensaje de que falta ingresar el email');
});
// ...existing code...
