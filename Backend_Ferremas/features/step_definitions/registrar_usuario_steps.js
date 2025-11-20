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

When('accede al formulario de registro de usuario', async function () {
  await this.driver.get(this.baseUrl + '/usuarios/registrar/');
  await this.driver.sleep(200);
});

When('ingreso nombre {string}', async function (nombre) {
  const el = await this.driver.findElement(By.name('nombre'));
  await el.clear();
  await el.sendKeys(nombre);
});

When('ingreso email {string}', async function (email) {
  const el = await this.driver.findElement(By.name('email'));
  await el.clear();
  await el.sendKeys(email);
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

When('selecciono rol {string}', async function (rol) {
  const el = await this.driver.findElement(By.name('rol'));
  await el.sendKeys(rol);
});

When('click en crear', async function () {
  const btn = await this.driver.findElement(By.css('button[type="submit"]'));
  await btn.click();
  await this.driver.sleep(500);
});

Then('usuario se crea', async function () {
  // Verifica que el usuario aparece en la lista (cliente o bodeguero)
  await this.driver.get(this.baseUrl + '/usuarios/');
  const correos = ['cliente@cliente.com', 'bodeguero@bodeguero.com'];
  let found = false;
  for (const correo of correos) {
    const usuarios = await this.driver.findElements(By.xpath(`//tr[td[contains(text(),'${correo}')]]`));
    if (usuarios.length > 0) {
      found = true;
      break;
    }
  }
  if (!found) throw new Error('El usuario no aparece en la lista');
});

Then('aparece en la lista de usuarios', async function () {
  await this.driver.get(this.baseUrl + '/usuarios/');
  const correos = ['cliente@cliente.com', 'bodeguero@bodeguero.com'];
  let found = false;
  for (const correo of correos) {
    const usuarios = await this.driver.findElements(By.xpath(`//tr[td[contains(text(),'${correo}')]]`));
    if (usuarios.length > 0) {
      found = true;
      break;
    }
  }
  if (!found) throw new Error('El usuario no aparece en la lista');
});

Then('aparece mensaje de mail ya registrado', async function () {
  const el = await this.driver.findElement(By.css('.alert-danger'));
  const texto = await el.getText();
  if (!texto.toLowerCase().includes('mail ya registrado')) throw new Error('No se encontró el mensaje de mail ya registrado');
});

Then('aparece mensaje de que falta ingresar email', async function () {
  const el = await this.driver.findElement(By.css('.alert-danger'));
  const texto = await el.getText();
  if (!texto.toLowerCase().includes('falta ingresar email')) throw new Error('No se encontró el mensaje de que falta ingresar email');
});

Then('aparece mensaje de que el rut ya esta registrado', async function () {
  const el = await this.driver.findElement(By.css('.alert-danger'));
  const texto = await el.getText();
  if (!texto.toLowerCase().includes('rut ya esta registrado')) throw new Error('No se encontró el mensaje de que el rut ya está registrado');
});

Then('aparece mensaje de que falta ingresar el rut', async function () {
  const el = await this.driver.findElement(By.css('.alert-danger'));
  const texto = await el.getText();
  if (!texto.toLowerCase().includes('falta ingresar el rut')) throw new Error('No se encontró el mensaje de que falta ingresar el rut');
});
// ...existing code...
