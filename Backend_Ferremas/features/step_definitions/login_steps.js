const { Given, When, Then } = require('@cucumber/cucumber');
const { By, until } = require('selenium-webdriver');

// Función auxiliar optimizada para buscar elementos rápidamente
async function findElementFast(driver, selectors, timeout = 1000) {
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
  // Espera optimizada para carga de página
  await this.driver.wait(until.titleContains(''), 500).catch(() => {});
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
  // Espera optimizada después del click
  await this.driver.sleep(300);
});

Then('aparece un mensaje de ingreso correcto', async function () {
  // Esperar más tiempo para que el redirect después del login se complete
  await this.driver.sleep(1000);
  
  const successTexts = ['Bienvenido', 'Dashboard', 'Inicio', 'Home', 'Ferremas'];
  let found = false;
  let foundText = '';
  
  for (const text of successTexts) {
    try {
      await this.driver.wait(until.elementLocated(By.xpath(`//*[contains(text(), "${text}")]`)), 5000);
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
        await this.driver.wait(until.elementLocated(By.xpath(`//*[contains(text(), "${specificText}")]`)), 2000);
        specificFound = true;
        console.log(`Texto específico encontrado: ${specificText}`);
        break;
      } catch (e) {
        continue;
      }
    }
    
    if (!specificFound) {
      // Imprimir más información para debugging
      const currentUrl = await this.driver.getCurrentUrl();
      const pageSource = await this.driver.getPageSource();
      console.log(`URL actual: ${currentUrl}`);
      console.log(`Buscando textos específicos en la página...`);
      throw new Error(`Se esperaba "Bienvenido", se obtuvo "${foundText}". URL: ${currentUrl}`);
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
    'Este campo es obligatorio',
    'Email y contraseña son requeridos',
    'Ingrese un email válido',
    'La contraseña es obligatoria',
    'El email es obligatorio',
    'Complete este campo'
  ];
  
  let found = false;
  let foundError = '';
  
  // Verificar si hay validación HTML5 activa para campos vacíos
  try {
    const emailField = await this.driver.findElement(By.css('input[name="username"], input[name="email"], input[type="email"], input[type="text"]'));
    const passwordField = await this.driver.findElement(By.css('input[name="password"], input[type="password"]'));
    const emailValue = await emailField.getAttribute('value');
    const passwordValue = await passwordField.getAttribute('value');
    
    // Validación específica para campos individuales vacíos
    const emailRequired = await emailField.getAttribute('required');
    const passwordRequired = await passwordField.getAttribute('required');
    
    // Si solo el email está vacío
    if ((!emailValue || emailValue.trim() === '') && passwordValue && passwordValue.trim() !== '' && emailRequired !== null) {
      console.log('Email vacío con validación HTML5 - considerando como error válido');
      found = true;
      foundError = 'Validación HTML5 - email requerido vacío';
    }
    // Si solo el password está vacío
    else if (emailValue && emailValue.trim() !== '' && (!passwordValue || passwordValue.trim() === '') && passwordRequired !== null) {
      console.log('Password vacío con validación HTML5 - considerando como error válido');
      found = true;
      foundError = 'Validación HTML5 - password requerido vacío';
    }
    // Si ambos campos están vacíos
    else if ((!emailValue || emailValue.trim() === '') && (!passwordValue || passwordValue.trim() === '') && 
        (emailRequired !== null || passwordRequired !== null)) {
      console.log('Campos vacíos con validación HTML5 - considerando como error válido');
      found = true;
      foundError = 'Validación HTML5 - campos requeridos vacíos';
    }
  } catch (e) {
    // Continuar con búsqueda normal de mensajes
    console.log('No se pudo verificar campos HTML5:', e.message);
  }
  
  // Buscar mensajes de error textuales si no se encontró validación HTML5
  if (!found) {
    for (const errorText of errorTexts) {
      try {
        await this.driver.wait(until.elementLocated(By.xpath(`//*[contains(text(), "${errorText}")]`)), 3000);
        found = true;
        foundError = errorText;
        break;
      } catch (e) {
        continue;
      }
    }
  }
  
  // Buscar elementos con clases de error
  if (!found) {
    try {
      const errorElements = await this.driver.findElements(By.css('.error, .alert-danger, .text-danger, .invalid-feedback, .messages .error, .errorlist, .help-block, .form-errors'));
      if (errorElements.length > 0) {
        for (let element of errorElements) {
          const errorText = await element.getText();
          if (errorText && errorText.trim()) {
            found = true; 
            foundError = errorText;
            break;
          }
        }
      }
    } catch (e) {
      // Continuar
    }
  }
  
  // Verificar si estamos aún en la página de login (lo que indica error)
  if (!found) {
    try {
      const currentUrl = await this.driver.getCurrentUrl();
      if (currentUrl.includes('/login/')) {
        // Verificar si hay elementos de formulario de login presentes
        const loginElements = await this.driver.findElements(By.css('input[name="username"], input[name="email"], input[name="password"], button[type="submit"]'));
        if (loginElements.length > 0) {
          found = true;
          foundError = 'Permanece en página de login - indicando error de autenticación';
        }
      }
    } catch (e) {
      // Continuar
    }
  }
  
  if (!found) {
    // Imprimir información de debug
    try {
      const currentUrl = await this.driver.getCurrentUrl();
      console.log(`URL actual: ${currentUrl}`);
      const pageSource = await this.driver.getPageSource();
      console.log(`Buscando mensajes de error en la página...`);
    } catch (e) {
      // Continuar
    }
    throw new Error(`No se encontró el mensaje de error esperado para datos equivocados o incorrectos.`);
  }
  
  console.log(`Mensaje de error encontrado: ${foundError}`);
});
