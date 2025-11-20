const { Given, When, Then } = require('@cucumber/cucumber');
const { By, until } = require('selenium-webdriver');
const { performLogin } = require('./common_steps');
// ...existing code...

Given('el usuario accede a la pagina de eliminar usuario como administrador', async function () {
  await performLogin(this.driver, this.baseUrl);
});

When('accede al listado de usuario para eliminar', async function () {
  await this.driver.get(this.baseUrl + '/usuarios/');
  await this.driver.sleep(200);
});

When('click en eliminar usuario {string}', async function (nombreUsuario) {
  const btn = await this.driver.findElement(By.xpath(`//tr[td[contains(text(),"${nombreUsuario}")]]//button[contains(@class,'eliminar')]`));
  await btn.click();
  await this.driver.sleep(200);
});

When('click en confirmar eliminación de usuario', async function () {
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

When('click en cancelar eliminación de usuario', async function () {
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

Then('muestra lista de usuarios tras cancelar eliminación', async function () {
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
