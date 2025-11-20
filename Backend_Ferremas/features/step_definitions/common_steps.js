const { By, until } = require('selenium-webdriver');

// Función de login reutilizable para administrador
async function performLogin(driver, baseUrl) {
  await driver.get(baseUrl + '/login/');
  await driver.sleep(1000);
  
  // Esperar a que el formulario de login esté presente
  await driver.wait(until.elementLocated(By.name('email')), 10000);
  
  const userEl = await driver.findElement(By.name('email'));
  await userEl.clear();
  await userEl.sendKeys('an.salcedo@duocuc.cl');
  
  await driver.wait(until.elementLocated(By.name('password')), 5000);
  const passEl = await driver.findElement(By.name('password'));
  await passEl.clear();
  await passEl.sendKeys('Admin.123456789');
  
  await driver.wait(until.elementLocated(By.css('button[type="submit"]')), 5000);
  const btn = await driver.findElement(By.css('button[type="submit"]'));
  await btn.click();
  
  // Esperar a que la página se redirija después del login
  await driver.sleep(2000);
  
  // Verificar que el login fue exitoso
  try {
    await driver.wait(until.elementLocated(By.tagName('h1')), 5000);
    const h1 = await driver.findElement(By.tagName('h1'));
    const texto = await h1.getText();
    console.log('Login exitoso - Texto encontrado:', texto);
  } catch (e) {
    try {
      await driver.wait(until.elementLocated(By.css('.navbar, .header, .dashboard')), 5000);
      console.log('Login exitoso - Encontrado elemento de navegación');
    } catch (e2) {
      throw new Error('No se pudo verificar el login exitoso');
    }
  }
}

// Función de login para bodeguero
async function performBodegueroLogin(driver, baseUrl) {
  await driver.get(baseUrl + '/login/');
  await driver.sleep(1000);
  
  // Esperar a que el formulario de login esté presente
  await driver.wait(until.elementLocated(By.name('email')), 10000);
  
  const userEl = await driver.findElement(By.name('email'));
  await userEl.clear();
  await userEl.sendKeys('bodeguero@bodeguero.com');
  
  await driver.wait(until.elementLocated(By.name('password')), 5000);
  const passEl = await driver.findElement(By.name('password'));
  await passEl.clear();
  await passEl.sendKeys('Bodeguero.1234');
  
  await driver.wait(until.elementLocated(By.css('button[type="submit"]')), 5000);
  const btn = await driver.findElement(By.css('button[type="submit"]'));
  await btn.click();
  
  // Esperar a que la página se redirija después del login
  await driver.sleep(2000);
  
  // Verificar que el login fue exitoso
  try {
    await driver.wait(until.elementLocated(By.tagName('h1')), 5000);
    const h1 = await driver.findElement(By.tagName('h1'));
    const texto = await h1.getText();
    console.log('Login bodeguero exitoso - Texto encontrado:', texto);
  } catch (e) {
    try {
      await driver.wait(until.elementLocated(By.css('.navbar, .header, .dashboard')), 5000);
      console.log('Login bodeguero exitoso - Encontrado elemento de navegación');
    } catch (e2) {
      throw new Error('No se pudo verificar el login exitoso del bodeguero');
    }
  }
}

// Función de login para cliente
async function performClienteLogin(driver, baseUrl) {
  await driver.get(baseUrl + '/login/');
  await driver.sleep(1000);
  
  // Esperar a que el formulario de login esté presente
  await driver.wait(until.elementLocated(By.name('email')), 10000);
  
  const userEl = await driver.findElement(By.name('email'));
  await userEl.clear();
  await userEl.sendKeys('cliente@cliente.com');
  
  await driver.wait(until.elementLocated(By.name('password')), 5000);
  const passEl = await driver.findElement(By.name('password'));
  await passEl.clear();
  await passEl.sendKeys('Cliente.1234');
  
  await driver.wait(until.elementLocated(By.css('button[type="submit"]')), 5000);
  const btn = await driver.findElement(By.css('button[type="submit"]'));
  await btn.click();
  
  // Esperar a que la página se redirija después del login
  await driver.sleep(2000);
  
  // Verificar que el login fue exitoso
  try {
    await driver.wait(until.elementLocated(By.tagName('h1')), 5000);
    const h1 = await driver.findElement(By.tagName('h1'));
    const texto = await h1.getText();
    console.log('Login cliente exitoso - Texto encontrado:', texto);
  } catch (e) {
    try {
      await driver.wait(until.elementLocated(By.css('.navbar, .header, .dashboard')), 5000);
      console.log('Login cliente exitoso - Encontrado elemento de navegación');
    } catch (e2) {
      throw new Error('No se pudo verificar el login exitoso del cliente');
    }
  }
}

module.exports = { performLogin, performBodegueroLogin, performClienteLogin };
