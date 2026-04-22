const shell = require('shelljs');
const path = require('path');
const fs = require('fs');

const APPS_DIR = path.join(__dirname, '../../apps');

// Ensure apps directory exists
if (!fs.existsSync(APPS_DIR)) {
  fs.mkdirSync(APPS_DIR, { recursive: true });
}

const deploy = async (app) => {
  let logs = "";
  const log = (msg) => {
    const time = new Date().toISOString();
    logs += `[${time}] ${msg}\n`;
    console.log(`[${app.name}] ${msg}`);
  };

  if (!app.name || !app.repoUrl) {
    throw new Error("App name or repo URL missing");
  }

  const appPath = path.join(APPS_DIR, app.name);
  const targetBranch = app.branch || 'main';

  log(`🚀 Starting deployment for ${app.name}`);
  log(`📦 Repo: ${app.repoUrl} (branch: ${targetBranch})`);

  // -------------------------------
  // CLONE OR PULL
  // -------------------------------
  if (fs.existsSync(appPath)) {
    log(`🔄 Directory exists, updating repository...`);
    
    const gitFetch = shell.exec('git fetch', { cwd: appPath, silent: true });
    logs += gitFetch.stdout + gitFetch.stderr;
    if (gitFetch.code !== 0) throw new Error(`Git fetch failed: ${gitFetch.stderr}\n\nFull Logs:\n${logs}`);

    const gitCheckout = shell.exec(`git checkout ${targetBranch}`, { cwd: appPath, silent: true });
    logs += gitCheckout.stdout + gitCheckout.stderr;
    if (gitCheckout.code !== 0) throw new Error(`Git checkout ${targetBranch} failed: ${gitCheckout.stderr}\n\nFull Logs:\n${logs}`);

    const gitPull = shell.exec('git pull', { cwd: appPath, silent: true });
    logs += gitPull.stdout + gitPull.stderr;
    if (gitPull.code !== 0) throw new Error(`Git pull failed: ${gitPull.stderr}\n\nFull Logs:\n${logs}`);

  } else {
    log(`📥 Cloning repository...`);
    
    const cloneCmd = `git clone -b ${targetBranch} "${app.repoUrl}" "${app.name}"`;
    const cloneResult = shell.exec(cloneCmd, { cwd: APPS_DIR, silent: true });
    logs += cloneResult.stdout + cloneResult.stderr;

    if (cloneResult.code !== 0) {
      throw new Error(`Git clone failed: ${cloneResult.stderr}\n\nFull Logs:\n${logs}`);
    }
  }

  // -------------------------------
  // ENV FILE
  // -------------------------------
  const envVars = app.env instanceof Map ? Object.fromEntries(app.env) : (app.env || {});
  if (Object.keys(envVars).length > 0) {
    log(`⚙️ Writing .env file...`);
    const envContent = Object.entries(envVars)
      .map(([k, v]) => `${k}=${v}`)
      .join('\n');
    fs.writeFileSync(path.join(appPath, '.env'), envContent);
  }

  // -------------------------------
  // INSTALL & BUILD
  // -------------------------------
  const buildCmd = app.buildCommand || 'npm install';
  log(`📦 Running build command: ${buildCmd}`);
  
  const buildResult = shell.exec(buildCmd, { cwd: appPath, silent: true });
  logs += buildResult.stdout + buildResult.stderr;

  if (buildResult.code !== 0) {
    throw new Error(`Build command failed: ${buildResult.stderr}\n\nFull Logs:\n${logs}`);
  }

  log(`✅ Deployment Ready`);

  return { appPath, logs };
};

module.exports = {
  deploy
};