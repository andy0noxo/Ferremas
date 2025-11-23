const { Before, After, setDefaultTimeout, BeforeAll, AfterAll, AfterStep } = require('@cucumber/cucumber');
const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const path = require('path');
const http = require('http');
// NOTE: do NOT require('chromedriver') here. Selenium Manager (bundled in selenium-webdriver >=4)
// will locate and download the matching ChromeDriver for the installed Chrome browser.

setDefaultTimeout(30 * 1000); // Reducido de 60s a 30s

// Variables globales para el sistema de evidencias
let stepCounter = 0;
let currentScenarioInfo = {};

// Función básica para guardar screenshots (mantiene compatibilidad con funcionalidad existente)
async function saveScreenshot(driver, featureName, scenarioName) {
	try {
		const dir = path.join(__dirname, '..', '_debug');
		if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
		const now = new Date();
		const dateStr = now.toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0,19);
		const img = await driver.takeScreenshot();
		const fileName = `${featureName}_${scenarioName}_${dateStr}-screenshot.png`.replace(/\s+/g, '_');
		fs.writeFileSync(path.join(dir, fileName), img, 'base64');
		return fileName;
	} catch (e) {
		// ignore errors
		return null;
	}
}

// Función mejorada para captura automática de evidencias
async function captureStepEvidence(driver, featureName, scenarioName, stepName, stepNumber) {
	try {
		const dir = path.join(__dirname, '..', '_evidencias');
		if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
		
		const now = new Date();
		const dateStr = now.toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0,19);
		
		// Limpiar nombres para evitar caracteres problemáticos en archivos
		const cleanFeatureName = featureName.replace(/[^a-zA-Z0-9_-]/g, '_');
		const cleanScenarioName = scenarioName.replace(/[^a-zA-Z0-9_-]/g, '_');
		const cleanStepName = stepName.replace(/[^a-zA-Z0-9_-]/g, '_');
		
		// Capturar screenshot
		const img = await driver.takeScreenshot();
		const screenshotFileName = `${cleanFeatureName}_${cleanScenarioName}_Step${stepNumber}_${cleanStepName}_${dateStr}.png`;
		fs.writeFileSync(path.join(dir, screenshotFileName), img, 'base64');
		
		// Capturar código fuente de la página
		const pageSource = await driver.getPageSource();
		const pageSourceFileName = `${cleanFeatureName}_${cleanScenarioName}_Step${stepNumber}_${cleanStepName}_${dateStr}.html`;
		fs.writeFileSync(path.join(dir, pageSourceFileName), pageSource, 'utf8');
		
		console.log(`📸 Evidencias capturadas para paso ${stepNumber}: ${stepName}`);
		
		return {
			screenshot: screenshotFileName,
			pageSource: pageSourceFileName
		};
	} catch (e) {
		console.error('Error al capturar evidencias:', e.message);
		return { screenshot: null, pageSource: null };
	}
}

Before(async function (scenario) {
	// Resetear contador de pasos para cada escenario
	stepCounter = 0;
	
	// Capturar timestamp de inicio
	const startTime = Date.now();
	
	// Guardar información del escenario actual
	currentScenarioInfo = {
		featureName: scenario.gherkinDocument.feature.name,
		scenarioName: scenario.pickle.name,
		evidences: [],
		startTime: startTime,
		startTimestamp: new Date().toISOString()
	};
	
	// Crear opciones de Chrome para depuración visual (sin headless) y mejorar estabilidad
	const options = new chrome.Options();
	// Argumentos optimizados para mejor rendimiento y estabilidad
	options.addArguments(
		'--no-sandbox',
		'--disable-dev-shm-usage', 
		'--disable-gpu',
		'--disable-extensions',
		'--disable-plugins',
		'--disable-background-timer-throttling',
		'--disable-backgrounding-occluded-windows',
		'--disable-renderer-backgrounding',
		'--disable-web-security',
		'--disable-features=TranslateUI',
		'--disable-ipc-flooding-protection',
		'--window-size=1920,1080',
		'--force-device-scale-factor=1',
		'--no-first-run',
		'--disable-default-apps'
	);
	if (process.env.CHROME_BIN) {
		options.setChromeBinaryPath(process.env.CHROME_BIN);
	}

	this.driver = await new Builder()
		.forBrowser('chrome')
		.setChromeOptions(options)
		.build();

	// Timeout implícito optimizado para mejor rendimiento
	await this.driver.manage().setTimeouts({ implicit: 3000 }); // Reducido de 10s a 3s

	this.baseUrl = 'http://127.0.0.1:8000';
	
	// Compartir información del escenario con el contexto global
	this.currentScenarioInfo = currentScenarioInfo;

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
	
	console.log(`🚀 Iniciando escenario: ${currentScenarioInfo.scenarioName}`);
	console.log(`⏰ Timestamp inicio: ${currentScenarioInfo.startTimestamp}`);
});

BeforeAll(function () {
	// Limpiar evidencias anteriores
	const evidenceDir = path.join(__dirname, '..', '_evidencias');
	const debugDir = path.join(__dirname, '..', '_debug');
	
	[evidenceDir, debugDir].forEach(dir => {
		if (fs.existsSync(dir)) {
			fs.readdirSync(dir).forEach(file => {
				if (file.endsWith('.png') || file.endsWith('.html')) {
					fs.unlinkSync(path.join(dir, file));
				}
			});
		}
	});
	
	console.log('🧹 Evidencias anteriores limpiadas');
	console.log('📁 Las nuevas evidencias se guardarán en: _evidencias/');
});

// Hook que se ejecuta después de cada paso
AfterStep(async function (step) {
	if (this.driver && this.currentScenarioInfo) {
		stepCounter++;
		
		// Esperar un momento para que la página se estabilice
		await this.driver.sleep(1000);
		
		const stepName = step.pickleStep.text;
		const stepNumber = stepCounter.toString().padStart(2, '0');
		
		console.log(`📝 Paso ${stepNumber}: ${stepName}`);
		
		// Capturar evidencias del paso
		const evidence = await captureStepEvidence(
			this.driver, 
			this.currentScenarioInfo.featureName, 
			this.currentScenarioInfo.scenarioName, 
			stepName, 
			stepNumber
		);
		
		// Guardar evidencia en el array
		this.currentScenarioInfo.evidences.push({
			stepNumber: stepNumber,
			stepName: stepName,
			timestamp: new Date().toLocaleString('es-ES'),
			screenshot: evidence.screenshot,
			pageSource: evidence.pageSource,
			status: step.result?.status || 'passed'
		});
	}
});

After(async function (scenario) {
	if (this.driver) {
		try {
			// Capturar timestamp de fin
			const endTime = Date.now();
			const endTimestamp = new Date().toISOString();
			
			// Calcular duración
			let duration = 'N/D';
			if (this.currentScenarioInfo && this.currentScenarioInfo.startTime) {
				duration = ((endTime - this.currentScenarioInfo.startTime) / 1000).toFixed(2);
			}
			
			// Espera mínima antes de tomar el screenshot final
			await this.driver.sleep(200); // Reducido de 500ms a 200ms
			
			// Captura final del escenario (mantiene compatibilidad con función original)
			const featureName = scenario.gherkinDocument.feature.name;
			const scenarioName = scenario.pickle.name;
			await saveScreenshot(this.driver, featureName, scenarioName);
			
			if (this.currentScenarioInfo && this.currentScenarioInfo.evidences.length > 0) {
				const status = scenario.result?.status || 'unknown';
				const statusEmoji = status === 'PASSED' ? '✅' : status === 'FAILED' ? '❌' : '⚠️';
				
				console.log(`${statusEmoji} Escenario completado: ${scenarioName} (${status})`);
				console.log(`⏱️  Duración: ${duration}s`);
				console.log(`⏰ Timestamp fin: ${endTimestamp}`);
				console.log(`📊 Total de pasos ejecutados: ${this.currentScenarioInfo.evidences.length}`);
				console.log(`📁 Evidencias guardadas en: _evidencias/`);
			}
			
		} catch (error) {
			console.error('Error al procesar evidencias finales:', error.message);
		} finally {
			// Forzar cierre completo del driver
			try {
				await this.driver.quit();
				// Esperar un momento para asegurar que se cierre
				await new Promise(resolve => setTimeout(resolve, 1000));
			} catch (quitError) {
				console.warn('Error al cerrar driver:', quitError.message);
			}
			this.driver = null;
		}
	}
});

AfterAll(async function () {
	console.log('🏁 Finalizando ejecución de todas las pruebas...');
	
	// Forzar limpieza de cualquier proceso residual
	try {
		// Esperar un momento para que todos los procesos terminen
		await new Promise(resolve => setTimeout(resolve, 2000));
		
		console.log('✅ Ejecución completada - todos los recursos liberados');
		
		// Forzar terminación del proceso si es necesario
		setTimeout(() => {
			console.log('⚠️  Forzando terminación del proceso...');
			process.exit(0);
		}, 3000);
		
	} catch (error) {
		console.error('Error en limpieza final:', error.message);
		process.exit(1);
	}
});
