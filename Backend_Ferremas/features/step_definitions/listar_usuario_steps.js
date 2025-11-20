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
  // Verifica que hay usuarios listados
  const usuarios = await this.driver.findElements(By.css('.usuario-item'));
  if (usuarios.length === 0) throw new Error('No se muestran usuarios en la lista');
});
