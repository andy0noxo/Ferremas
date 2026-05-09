#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { spawn, spawnSync } = require('child_process');

const backendRoot = path.resolve(__dirname, '..');
const projectRoot = path.resolve(backendRoot, '..');
const composeFile = path.resolve(projectRoot, 'docker-compose.yml');
const zapComposeFile = path.resolve(projectRoot, 'docker-compose.zap.yml');
const reportsDir = path.join(backendRoot, '_informes', 'zap');
const backendHealthUrl = process.env.ZAP_BACKEND_HEALTH_URL || 'http://localhost:3000/api/status';
const targetUrl = process.env.ZAP_TARGET_URL || 'http://backend:3000/';

function resolveComposeRunner() {
  const modernCompose = spawnSync('docker', ['compose', 'version'], { stdio: 'ignore' });

  if (modernCompose.status === 0) {
    return { command: 'docker', args: ['compose'] };
  }

  const legacyCompose = spawnSync('docker-compose', ['version'], { stdio: 'ignore' });

  if (legacyCompose.status === 0) {
    return { command: 'docker-compose', args: [] };
  }

  throw new Error('No se encontró Docker Compose. Instala "docker compose" o "docker-compose" antes de ejecutar el escaneo ZAP.');
}

function ensureDockerAvailable() {
  const dockerInfo = spawnSync('docker', ['info'], { stdio: 'ignore' });

  if (dockerInfo.status === 0) {
    return;
  }

  throw new Error([
    'Docker no está disponible o el daemon está detenido.',
    'Abre Docker Desktop y espera a que el motor Linux esté en ejecución.',
    'Luego vuelve a ejecutar: npm run zap:scan'
  ].join(' '));
}

function run(command, args, options = {}) {
  const allowedExitCodes = options.allowedExitCodes || [0];
  const spawnOptions = { ...options };
  delete spawnOptions.allowedExitCodes;

  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      shell: false,
      ...spawnOptions
    });

    child.on('error', reject);

    child.on('exit', (code, signal) => {
      if (allowedExitCodes.includes(code)) {
        resolve();
        return;
      }

      reject(new Error(`El comando ${command} ${args.join(' ')} finalizó con código ${code}${signal ? ` y señal ${signal}` : ''}.`));
    });
  });
}

async function waitForBackend(url, timeoutMs = 5 * 60 * 1000, pollIntervalMs = 5000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const controller = new AbortController();
      const requestTimeout = setTimeout(() => controller.abort(), 4000);
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(requestTimeout);

      if (response.ok) {
        return;
      }
    } catch (error) {
      // El backend aún no está listo; seguimos reintentando.
    }

    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));
  }

  throw new Error(`El backend no respondió en ${url} dentro del tiempo esperado.`);
}

async function main() {
  fs.mkdirSync(reportsDir, { recursive: true });

  ensureDockerAvailable();
  const composeRunner = resolveComposeRunner();
  const composeBaseArgs = [...composeRunner.args, '-f', composeFile, '-f', zapComposeFile];
  const environment = {
    ...process.env,
    ZAP_TARGET_URL: targetUrl
  };

  console.log('🔎 Levantando backend y base de datos para el escaneo OWASP ZAP...');
  await run(composeRunner.command, [...composeBaseArgs, 'up', '-d', 'db', 'backend'], {
    cwd: projectRoot,
    env: environment
  });

  console.log(`⏳ Esperando que el backend responda en ${backendHealthUrl}...`);
  await waitForBackend(backendHealthUrl);

  try {
    console.log('🛡️ Ejecutando OWASP ZAP baseline scan...');
    await run(composeRunner.command, [...composeBaseArgs, 'up', '--abort-on-container-exit', '--exit-code-from', 'zap-baseline', 'zap-baseline'], {
      cwd: projectRoot,
      env: environment,
      allowedExitCodes: [0, 2]
    });

    console.log(`📄 Reportes generados en ${reportsDir}`);
  } finally {
    console.log('🧹 Deteniendo contenedores del escaneo ZAP...');

    try {
      await run(composeRunner.command, [...composeBaseArgs, 'down', '--remove-orphans'], {
        cwd: projectRoot,
        env: environment
      });
    } catch (cleanupError) {
      console.error(`No fue posible ejecutar la limpieza automática: ${cleanupError.message}`);
    }
  }
}

main().catch((error) => {
  console.error(`Error al ejecutar el escaneo ZAP: ${error.message}`);
  process.exit(1);
});
