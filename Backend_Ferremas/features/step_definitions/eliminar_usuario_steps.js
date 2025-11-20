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

When('click en eliminar usuario {string}', async function (nombreUsuario) {
  const btn = await this.driver.findElement(By.xpath(`//tr[td[contains(text(),"${nombreUsuario}")]]//button[contains(@class,'eliminar')]`));
  await btn.click();
  await this.driver.sleep(200);
});

When('click en confirmar', async function () {
  // Confirma en el modal o alerta
  try {
    const confirmBtn = await this.driver.findElement(By.css('.modal-confirm, .confirm-eliminar'));
    await confirmBtn.click();
  } catch (e) {
    try {
      await this.driver.switchTo().alert().accept();
    } catch (e2) {}
  }
  await this.driver.sleep(500);
});

When('click en cancelar', async function () {
  // Cancela en el modal o alerta
  try {
    const cancelBtn = await this.driver.findElement(By.css('.modal-cancel, .cancel-eliminar'));
    await cancelBtn.click();
  } catch (e) {
    try {
      await this.driver.switchTo().alert().dismiss();
    } catch (e2) {}
  }
  await this.driver.sleep(500);
});

Then('aparece mensaje de usuario eliminado exitosamente', async function () {
  const el = await this.driver.findElement(By.css('.alert-success'));
  const texto = await el.getText();
  if (!texto.toLowerCase().includes('eliminado exitosamente')) throw new Error('No se encontró el mensaje de usuario eliminado exitosamente');
});

Then('el usuario es eliminado de la lista de usuarios registrados', async function () {
  await this.driver.get(this.baseUrl + '/usuarios/');
  const usuarios = await this.driver.findElements(By.xpath("//tr[td[contains(text(),'Juan Pérez')]]"));
  if (usuarios.length > 0) throw new Error('El usuario no fue eliminado de la lista');
});

Then('muestra lista de usuarios', async function () {
  await this.driver.get(this.baseUrl + '/usuarios/');
  const usuarios = await this.driver.findElements(By.css('.usuario-item'));
  if (usuarios.length === 0) throw new Error('No se muestra la lista de usuarios');
});

Then('el usuario no es eliminado de la lista de usuarios registrados', async function () {
  await this.driver.get(this.baseUrl + '/usuarios/');
  const usuarios = await this.driver.findElements(By.xpath("//tr[td[contains(text(),'Juan Pérez')]]"));
  if (usuarios.length === 0) throw new Error('El usuario fue eliminado, pero no debía eliminarse');
});
// ...existing code...
