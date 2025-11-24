const { Before, After, setDefaultTimeout, BeforeAll, AfterAll, AfterStep } = require('@cucumber/cucumber');
const { Builder } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs');
const path = require('path');
const http = require('http');
// NOTE: do NOT require('chromedriver') here. Selenium Manager (bundled in selenium-webdriver >=4)
// will locate and download the matching ChromeDriver for the installed Chrome browser.

// Cargar configuración de pruebas si existe
const envTestPath = path.join(__dirname, '..', '..', '.env.test');
if (fs.existsSync(envTestPath)) {
	const envContent = fs.readFileSync(envTestPath, 'utf8');
	const envVars = {};
	
	envContent.split('\n').forEach(line => {
		const trimmed = line.trim();
		if (trimmed && !trimmed.startsWith('#')) {
			const [key, ...valueParts] = trimmed.split('=');
			if (key && valueParts.length > 0) {
				envVars[key] = valueParts.join('=');
			}
		}
	});
	
	// Aplicar variables de entorno si no están ya definidas
	Object.entries(envVars).forEach(([key, value]) => {
		if (!process.env[key]) {
			process.env[key] = value;
		}
	});
	
	console.log('🔧 Configuración de pruebas cargada desde .env.test');
}

// Configurar timeout basado en configuración (por defecto 20s, configurable)
const testTimeout = parseInt(process.env.TEST_TIMEOUT) || 20000;
setDefaultTimeout(testTimeout);
console.log(`⏱️ Timeout de pruebas configurado a: ${testTimeout}ms`);

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
		const dir = path.join(__dirname, '..', '_debug');
		if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
		
		const now = new Date();
		const dateStr = now.toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0,19);
		
		// Limpiar nombres para evitar caracteres problemáticos en archivos
		const cleanFeatureName = featureName.replace(/[^a-zA-Z0-9_-]/g, '_');
		const cleanScenarioName = scenarioName.replace(/[^a-zA-Z0-9_-]/g, '_');
		const cleanStepName = stepName.replace(/[^a-zA-Z0-9_-]/g, '_');
		
		// Capturar screenshot directamente en _debug
		const img = await driver.takeScreenshot();
		const screenshotFileName = `${cleanFeatureName}_${cleanScenarioName}_Step${stepNumber}_${cleanStepName}_${dateStr}.png`;
		fs.writeFileSync(path.join(dir, screenshotFileName), img, 'base64');
		
		console.log(`📸 Evidencias capturadas para paso ${stepNumber}: ${stepName}`);
		
		return {
			screenshot: screenshotFileName,
			pageSource: null
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
	
	// Crear opciones de Chrome optimizadas para velocidad
	const options = new chrome.Options();
	
	// Configurar headless basado en variable de entorno (por defecto headless para velocidad)
	const isHeadless = process.env.HEADLESS !== 'false';
	if (isHeadless) {
		options.addArguments('--headless=new'); // Nuevo headless más rápido
		console.log('🏃‍♂️ Ejecutando en modo headless para máxima velocidad');
	} else {
		console.log('👀 Ejecutando en modo visual para depuración');
	}
	
	// Argumentos optimizados para máximo rendimiento
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
		'--disable-features=TranslateUI,VizDisplayCompositor',
		'--disable-ipc-flooding-protection',
		'--disable-background-networking',
		'--disable-default-apps',
		'--disable-sync',
		'--disable-translate',
		'--hide-scrollbars',
		'--metrics-recording-only',
		'--mute-audio',
		'--no-first-run',
		'--safebrowsing-disable-auto-update',
		'--ignore-certificate-errors',
		'--ignore-ssl-errors',
		'--ignore-certificate-errors-spki-list',
		'--ignore-certificate-errors',
		'--disable-client-side-phishing-detection',
		'--disable-datasaver-prompt',
		'--disable-device-discovery-notifications',
		'--disable-notifications',
		'--disable-popup-blocking',
		'--disable-prompt-on-repost',
		'--disable-hang-monitor',
		'--disable-logging',
		'--disable-permissions-api',
		'--window-size=1366,768', // Tamaño más pequeño para velocidad
		'--force-device-scale-factor=1'
	);
	
	// Configuración adicional para performance
	options.setPageLoadStrategy('normal'); // eager para más velocidad, normal para estabilidad
	if (process.env.CHROME_BIN) {
		options.setChromeBinaryPath(process.env.CHROME_BIN);
	}

	this.driver = await new Builder()
		.forBrowser('chrome')
		.setChromeOptions(options)
		.build();

	// Timeout implícito optimizado para velocidad
	await this.driver.manage().setTimeouts({ 
		implicit: 2000, // Reducido a 2s para mayor velocidad
		pageLoad: 15000, // Timeout de carga de página
		script: 10000 // Timeout para scripts asíncronos
	});

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
	// NO LIMPIAR EVIDENCIAS - Conservar screenshots de features anteriores
	const debugDir = path.join(__dirname, '..', '_debug');
	
	// Solo asegurar que existe el directorio
	if (!fs.existsSync(debugDir)) {
		fs.mkdirSync(debugDir, { recursive: true });
	}
	
	console.log('📁 Manteniendo evidencias anteriores para múltiples features');
	console.log('📁 Las nuevas evidencias se guardarán en: _debug/');
});

// Hook que se ejecuta después de cada paso (optimizado)
AfterStep(async function (step) {
	if (this.driver && this.currentScenarioInfo) {
		stepCounter++;
		
		// Espera mínima solo si es necesario
		const needsWait = process.env.STEP_WAIT !== 'false';
		if (needsWait) {
			await this.driver.sleep(200); // Reducido drásticamente de 1000ms a 200ms
		}
		
		const stepName = step.pickleStep.text;
		const stepNumber = stepCounter.toString().padStart(2, '0');
		
		console.log(`📝 Paso ${stepNumber}: ${stepName}`);
		
		// Capturar evidencias por defecto (cambiar a false solo si hay problemas de performance)
		const captureEvidence = process.env.CAPTURE_EVIDENCE !== 'false';
		let evidence = { screenshot: null, pageSource: null };
		
		if (captureEvidence) {
			evidence = await captureStepEvidence(
				this.driver, 
				this.currentScenarioInfo.featureName, 
				this.currentScenarioInfo.scenarioName, 
				stepName, 
				stepNumber
			);
		}
		
		// Guardar evidencia en el array (siempre para tracking, pero sin archivos si no está habilitado)
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
				console.log(`📁 Evidencias guardadas en: _debug/`);
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
		// Espera optimizada para terminación más rápida
		await new Promise(resolve => setTimeout(resolve, 500)); // Reducido de 2s a 500ms
		
		console.log('✅ Ejecución completada - todos los recursos liberados');
		
		// Terminación más rápida del proceso
		setTimeout(() => {
			console.log('⚠️  Finalizando proceso...');
			process.exit(0);
		}, 1000); // Reducido de 3s a 1s
		
	} catch (error) {
		console.error('Error en limpieza final:', error.message);
		process.exit(1);
	}
});
