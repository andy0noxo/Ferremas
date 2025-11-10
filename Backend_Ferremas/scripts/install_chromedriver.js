const { execFileSync, spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function tryExec(cmd, args) {
  try {
    return execFileSync(cmd, args, { encoding: 'utf8' }).trim();
  } catch (e) {
    return null;
  }
}

function findChromePathWindows() {
  const candidates = [
    process.env['PROGRAMFILES'] && path.join(process.env['PROGRAMFILES'], 'Google', 'Chrome', 'Application', 'chrome.exe'),
    process.env['PROGRAMFILES(X86)'] && path.join(process.env['PROGRAMFILES(X86)'], 'Google', 'Chrome', 'Application', 'chrome.exe'),
    path.join(process.env['LOCALAPPDATA'] || '', 'Programs', 'Google', 'Chrome', 'Application', 'chrome.exe')
  ].filter(Boolean);

  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function getChromeVersion() {
  const platform = process.platform;
  if (platform === 'win32') {
    const chromePath = findChromePathWindows();
    if (chromePath) {
      const out = tryExec(chromePath, ['--version']);
      if (out) return out;
    }
    // try where chrome in PATH
    const out2 = tryExec('chrome', ['--version']);
    if (out2) return out2;
    return null;
  }
  return null;
}

function installChromedriverForMajor(major) {
  console.log(`Installing chromedriver@${major} (attempt)`);
  const res = spawnSync('npm', ['install', '--save-dev', `chromedriver@${major}`], { stdio: 'inherit' });
  if (res.status === 0) {
    console.log('chromedriver installed successfully');
    return true;
  }
  console.warn('chromedriver install by major failed, attempting latest');
  const res2 = spawnSync('npm', ['install', '--save-dev', `chromedriver@latest`], { stdio: 'inherit' });
  return res2.status === 0;
}

function main() {
  console.log('Detecting Chrome version...');
  const verStr = getChromeVersion();
  if (!verStr) {
    console.warn('Could not detect Chrome automatically. Installing latest chromedriver as fallback.');
    const ok = installChromedriverForMajor('latest');
    process.exit(ok ? 0 : 1);
  }

  const m = verStr.match(/(\d+)\.(\d+)\.(\d+)\.(\d+)/);
  if (!m) {
    console.warn('Could not parse Chrome version string:', verStr);
    const ok = installChromedriverForMajor('latest');
    process.exit(ok ? 0 : 1);
  }

  const major = m[1];
  console.log('Detected Chrome version:', verStr, 'major:', major);
  const ok = installChromedriverForMajor(major);
  process.exit(ok ? 0 : 1);
}

main();
