const shell = require('shelljs');
const path = require('path');
const fs = require('fs');

const APPS_DIR = path.join(__dirname, '../../apps');

// Ensure apps directory exists
if (!fs.existsSync(APPS_DIR)) {
  fs.mkdirSync(APPS_DIR, { recursive: true });
}

const deploy = async (app) => {
  if (!app.name || !app.repoUrl) {
    throw new Error("App name or repo URL missing");
  }

  const appPath = path.join(APPS_DIR, app.name);
  const targetBranch = app.branch || 'main';

  console.log(`🚀 [${app.name}] Deploying...`);
  console.log(`📦 Repo: ${app.repoUrl} (branch: ${targetBranch})`);

  // -------------------------------
  // CLONE OR PULL
  // -------------------------------
  if (fs.existsSync(appPath)) {
    console.log(`🔄 [${app.name}] Directory exists, updating repository...`);
    
    // Ensure we are on the right branch and pull
    const gitFetch = shell.exec('git fetch', { cwd: appPath });
    if (gitFetch.code !== 0) throw new Error(`Git fetch failed: ${gitFetch.stderr}`);

    const gitCheckout = shell.exec(`git checkout ${targetBranch}`, { cwd: appPath });
    if (gitCheckout.code !== 0) throw new Error(`Git checkout ${targetBranch} failed: ${gitCheckout.stderr}`);

    const gitPull = shell.exec('git pull', { cwd: appPath });
    if (gitPull.code !== 0) throw new Error(`Git pull failed: ${gitPull.stderr}`);

  } else {
    console.log(`📥 [${app.name}] Cloning repository...`);
    
    const cloneCmd = `git clone -b ${targetBranch} "${app.repoUrl}" "${app.name}"`;
    const cloneResult = shell.exec(cloneCmd, { cwd: APPS_DIR });

    if (cloneResult.code !== 0) {
      throw new Error(`Git clone failed: ${cloneResult.stderr}`);
    }
  }

  // -------------------------------
  // ENV FILE
  // -------------------------------
  const envVars = app.env instanceof Map ? Object.fromEntries(app.env) : (app.env || {});
  if (Object.keys(envVars).length > 0) {
    console.log(`⚙️ [${app.name}] Writing .env file...`);

    const envContent = Object.entries(envVars)
      .map(([k, v]) => `${k}=${v}`)
      .join('\n');

    fs.writeFileSync(path.join(appPath, '.env'), envContent);
  }

  // -------------------------------
  // INSTALL & BUILD
  // -------------------------------
  console.log(`📦 [${app.name}] Running build command: ${app.buildCommand || 'npm install'}`);
  const buildCmd = app.buildCommand || 'npm install';
  const buildResult = shell.exec(buildCmd, { cwd: appPath });

  if (buildResult.code !== 0) {
    throw new Error(`Build command failed: ${buildResult.stderr}`);
  }

  console.log(`✅ [${app.name}] Deployment Ready`);

  return appPath;
};

module.exports = {
  deploy
};