const { Given, When, Then } = require('@cucumber/cucumber');
const { By, until } = require('selenium-webdriver');

// Función auxiliar optimizada para buscar elementos rápidamente
async function findElementFast(driver, selectors, timeout = 1500) {
  for (const sel of selectors) {
    try {
      await driver.wait(until.elementLocated(sel), timeout);
      return await driver.findElement(sel);
    } catch (e) {
      // Continuar con el siguiente selector
    }
  }
  return null;
}

async function cleanupTestUsers(driver) {
  try {
    console.log('Intentando limpiar usuarios de prueba...');
  } catch (error) {
    console.log('No se pudo limpiar usuarios de prueba:', error.message);
  }
}

Given('el usuario accede a la pagina de login', async function () {
  await cleanupTestUsers(this.driver);
  await this.driver.get(`${this.baseUrl}/login/`);
  // Espera reducida para carga de página
  await this.driver.wait(until.titleContains(''), 1000).catch(() => {});
});

When('ingreso email de login {string}', async function (email) {
  const selectors = [
    By.id('id_username'),
    By.name('username'), 
    By.name('email'),
    By.css('input[type="email"]'),
    By.css('input[type="text"]')
  ];
  
  const el = await findElementFast(this.driver, selectors);
  if (!el) throw new Error('No se encontró el campo usuario/email');
  
  await el.clear();
  await el.sendKeys(email);
});

When('ingreso contraseña de login {string}', async function (password) {
  const selectors = [
    By.id('id_password'),
    By.name('password'),
    By.css('input[type="password"]')
  ];
  
  const el = await findElementFast(this.driver, selectors);
  if (!el) throw new Error('No se encontró el campo password');
  
  await el.clear();
  await el.sendKeys(password);
});

When('realizo el envío de los datos de login', async function () {
  const selectors = [
    By.css('button[type="submit"]'),
    By.css('input[type="submit"]'),
    By.css('button.btn-primary'),
    By.css('button[type="button"][onclick*="submit"]')
  ];
  
  const btn = await findElementFast(this.driver, selectors);
  if (!btn) throw new Error('No se encontró el botón de envío');
  
  await btn.click();
  // Espera reducida después del click
  await this.driver.sleep(800);
});

Then('aparece un mensaje de ingreso correcto', async function () {
  const successTexts = ['Bienvenido', 'Dashboard', 'Inicio', 'Home', 'Ferremas'];
  let found = false;
  let foundText = '';
  
  for (const text of successTexts) {
    try {
      await this.driver.wait(until.elementLocated(By.xpath(`//*[contains(text(), "${text}")]`)), 2000);
      found = true;
      foundText = text;
      break;
    } catch (e) {
      continue;
    }
  }
  
  if (!found) {
    const currentUrl = await this.driver.getCurrentUrl();
    throw new Error(`No se encontró mensaje de login exitoso. URL: ${currentUrl}`);
  }
  
  if (foundText === 'Ferremas') {
    const moreSpecificTexts = ['Bienvenido', 'Dashboard', 'Logout', 'Cerrar sesión'];
    let specificFound = false;
    
    for (const specificText of moreSpecificTexts) {
      try {
        await this.driver.wait(until.elementLocated(By.xpath(`//*[contains(text(), "${specificText}")]`)), 500);
        specificFound = true;
        break;
      } catch (e) {
        continue;
      }
    }
    
    if (!specificFound) {
      throw new Error(`Se esperaba "Bienvenido", se obtuvo "${foundText}"`);
    }
  }
  
  console.log(`Texto encontrado después del login: ${foundText}`);
});

Then('aparece un mensaje de datos equivocados', async function () {
  const errorTexts = [
    'Usuario o contraseña incorrectos',
    'Credenciales inválidas', 
    'Error de autenticación',
    'Login fallido',
    'Datos incorrectos',
    'Invalid credentials',
    'Authentication failed',
    'Por favor, ingrese un nombre de usuario y contraseña válidos',
    'Este campo es obligatorio'
  ];
  
  let found = false;
  let foundError = '';
  
  for (const errorText of errorTexts) {
    try {
      await this.driver.wait(until.elementLocated(By.xpath(`//*[contains(text(), "${errorText}")]`)), 1500);
      found = true;
      foundError = errorText;
      break;
    } catch (e) {
      continue;
    }
  }
  
  if (!found) {
    try {
      const errorElements = await this.driver.findElements(By.css('.error, .alert-danger, .text-danger, .invalid-feedback'));
      if (errorElements.length > 0) {
        const errorText = await errorElements[0].getText();
        if (errorText && errorText.trim()) {
          found = true; 
          foundError = errorText;
        }
      }
    } catch (e) {
      // Continuar
    }
  }
  
  if (!found) {
    throw new Error(`No se encontró el mensaje de error esperado para datos equivocados o incorrectos.`);
  }
  
  console.log(`Mensaje de error encontrado: ${foundError}`);
});
