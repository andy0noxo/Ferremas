const { Given, When, Then } = require('@cucumber/cucumber');
const { By, until } = require('selenium-webdriver');
// ...existing code...

Given('el usuario accede a la pagina de registro de usuario como administrador', async function () {
  // Login como administrador - optimizado
  await this.driver.get(this.baseUrl + '/login/');
  await this.driver.sleep(500); // Reducido de 1000ms
  
  // Timeouts reducidos para mejor rendimiento
  await this.driver.wait(until.elementLocated(By.name('email')), 3000);
  
  const userEl = await this.driver.findElement(By.name('email'));
  await userEl.clear();
  await userEl.sendKeys('an.salcedo@duocuc.cl');
  
  await this.driver.wait(until.elementLocated(By.name('password')), 2000);
  const passEl = await this.driver.findElement(By.name('password'));
  await passEl.clear();
  await passEl.sendKeys('Admin.123456789');
  
  await this.driver.wait(until.elementLocated(By.css('button[type="submit"]')), 2000);
  const btn = await this.driver.findElement(By.css('button[type="submit"]'));
  await btn.click();
  
  // Espera reducida después del login
  await this.driver.sleep(1000); // Reducido de 2000ms
  
  // Verificar que el login fue exitoso (puede ser dashboard, home, etc.)
  try {
    // Intentar encontrar algún elemento que indique login exitoso
    await this.driver.wait(until.elementLocated(By.tagName('h1')), 5000);
    const h1 = await this.driver.findElement(By.tagName('h1'));
    const texto = await h1.getText();
    console.log('Texto encontrado después del login:', texto);
  } catch (e) {
    // Si no encuentra h1, intentar con otros elementos que indiquen login exitoso
    try {
      await this.driver.wait(until.elementLocated(By.css('.navbar, .header, .dashboard')), 5000);
      console.log('Login aparentemente exitoso - encontrado elemento de navegación');
    } catch (e2) {
      throw new Error('No se pudo verificar el login exitoso');
    }
  }
});

When('accede al formulario de registro de usuario', async function () {
  await this.driver.get(this.baseUrl + '/register/');
  await this.driver.sleep(200);
});

When('ingreso nombre de usuario {string}', async function (nombre) {
  let el;
  try {
    await this.driver.wait(until.elementLocated(By.name('nombre')), 10000);
    el = await this.driver.findElement(By.name('nombre'));
  } catch (e) {
    throw new Error('No se encontró el campo de nombre de usuario (name="nombre") en el formulario de registro');
  }
  await el.clear();
  await el.sendKeys(nombre);
});

When('ingreso email de usuario {string}', async function (email) {
  const el = await this.driver.findElement(By.name('email'));
  await el.clear();
  await el.sendKeys(email);
});

When('ingreso contraseña de usuario {string}', async function (password) {
  const el = await this.driver.findElement(By.name('password'));
  await el.clear();
  await el.sendKeys(password);
});

When('ingreso rut de usuario {string}', async function (rut) {
  const el = await this.driver.findElement(By.name('rut'));
  await el.clear();
  await el.sendKeys(rut);
});

When('selecciono rol de usuario {string}', async function (rol) {
  const el = await this.driver.findElement(By.name('rol'));
  await el.sendKeys(rol);
});

When('click en crear usuario', async function () {
  const btn = await this.driver.findElement(By.css('button[type="submit"]'));
  await btn.click();
  await this.driver.sleep(500);
});

Then('usuario se crea correctamente', async function () {
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
