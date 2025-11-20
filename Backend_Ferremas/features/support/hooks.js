const { Before, After, setDefaultTimeout, BeforeAll } = require('@cucumber/cucumber');
const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const path = require('path');
const http = require('http');
// NOTE: do NOT require('chromedriver') here. Selenium Manager (bundled in selenium-webdriver >=4)
// will locate and download the matching ChromeDriver for the installed Chrome browser.

setDefaultTimeout(60 * 1000);

Before(async function () {
	// Crear opciones de Chrome para depuración visual (sin headless) y mejorar estabilidad
	const options = new chrome.Options();
	// Desactivar headless para ver el navegador
	options.addArguments('--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu', '--window-size=1920,1080');
	if (process.env.CHROME_BIN) {
		options.setChromeBinaryPath(process.env.CHROME_BIN);
	}

	this.driver = await new Builder()
		.forBrowser('chrome')
		.setChromeOptions(options)
		.build();

	// Aumentar timeout implícito para esperar elementos cargados en páginas lentas
	await this.driver.manage().setTimeouts({ implicit: 10000 });

	this.baseUrl = 'http://127.0.0.1:8000';

	// Borrar usuarios de prueba antes de cada escenario
	try {
		await new Promise((resolve, reject) => {
			http.get('http://127.0.0.1:8000/api/test/usuarios_cleanup/', res => {
				if (res.statusCode === 200) resolve();
				else reject(new Error('No se pudo limpiar usuarios de prueba'));
			}).on('error', reject);
		});
	} catch (e) {
		console.warn('No se pudo limpiar usuarios de prueba:', e.message);
	}
});

BeforeAll(function () {
	const dir = path.join(__dirname, '..', '_debug');
	if (fs.existsSync(dir)) {
		fs.readdirSync(dir).forEach(file => {
			if (file.endsWith('.png') || file.endsWith('.html')) {
				fs.unlinkSync(path.join(dir, file));
			}
		});
	}
});

async function saveScreenshot(driver, featureName, scenarioName) {
	try {
		const dir = path.join(__dirname, '..', '_debug');
		if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
		const now = new Date();
		const dateStr = now.toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0,19);
		const img = await driver.takeScreenshot();
		const fileName = `${featureName}_${scenarioName}_${dateStr}-screenshot.png`.replace(/\s+/g, '_');
		fs.writeFileSync(path.join(dir, fileName), img, 'base64');
	} catch (e) {
		// ignore errors
	}
}

After(async function (scenario) {
	if (this.driver) {
		// Espera extra antes de tomar el screenshot
		await this.driver.sleep(1000);
		// Obtiene el nombre de la funcionalidad y escenario
		const featureName = scenario.gherkinDocument.feature.name;
		const scenarioName = scenario.pickle.name;
		await saveScreenshot(this.driver, featureName, scenarioName);
		await this.driver.quit();
	}
});
