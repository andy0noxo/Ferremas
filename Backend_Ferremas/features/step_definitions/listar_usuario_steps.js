const { Given, When, Then } = require('@cucumber/cucumber');
const { By, until } = require('selenium-webdriver');
const { performLogin } = require('./common_steps');

Given('el usuario accede a la pagina de listar usuario como administrador', async function () {
  await performLogin(this.driver, this.baseUrl);
});

When('accede al listado de usuario', async function () {
  await this.driver.get(this.baseUrl + '/usuarios/');
  await this.driver.sleep(200);
});

Then('muestra listado de todos los usuarios registrados', async function () {
  // Verifica que hay una tabla de usuarios
  const tabla = await this.driver.findElement(By.css('table'));
  const isDisplayed = await tabla.isDisplayed();
  if (!isDisplayed) throw new Error('No se muestra la tabla de usuarios');
});
