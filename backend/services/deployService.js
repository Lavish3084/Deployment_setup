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

  console.log("🚀 Deploying:", app.name);
  console.log("📦 Repo:", app.repoUrl);

  // -------------------------------
  // CLONE OR PULL
  // -------------------------------
  if (fs.existsSync(appPath)) {
    console.log("🔄 Pulling latest changes...");
    shell.cd(appPath);

    const pullResult = shell.exec('git pull');

    if (pullResult.code !== 0) {
      throw new Error('Git pull failed: ' + pullResult.stderr);
    }

  } else {
    console.log("📥 Cloning repository...");
    shell.cd(APPS_DIR);

    const cloneCmd = app.branch
      ? `git clone -b ${app.branch} "${app.repoUrl}" "${app.name}"`
      : `git clone "${app.repoUrl}" "${app.name}"`;

    const cloneResult = shell.exec(cloneCmd);

    if (cloneResult.code !== 0) {
      throw new Error('Git clone failed: ' + cloneResult.stderr);
    }

    shell.cd(app.name);
  }

  // -------------------------------
  // ENV FILE
  // -------------------------------
  if (app.env && Object.keys(app.env).length > 0) {
    console.log("⚙️ Writing .env file...");

    const envContent = Object.entries(app.env)
      .map(([k, v]) => `${k}=${v}`)
      .join('\n');

    fs.writeFileSync(path.join(appPath, '.env'), envContent);
  }

  // -------------------------------
  // INSTALL DEPENDENCIES
  // -------------------------------
  console.log("📦 Installing dependencies...");
  const installResult = shell.exec('npm install');

  if (installResult.code !== 0) {
    throw new Error('NPM install failed: ' + installResult.stderr);
  }

  // -------------------------------
  // BUILD (if frontend)
  // -------------------------------
  if (fs.existsSync(path.join(appPath, 'package.json'))) {
    const pkg = JSON.parse(fs.readFileSync(path.join(appPath, 'package.json')));

    if (pkg.scripts && pkg.scripts.build) {
      console.log("🏗️ Running build...");
      const buildResult = shell.exec('npm run build');

      if (buildResult.code !== 0) {
        throw new Error('Build failed: ' + buildResult.stderr);
      }
    }
  }

  // -------------------------------
  // ENTRY POINT DETECTION
  // -------------------------------
  let entryPoint = 'index.js';

  if (fs.existsSync(path.join(appPath, 'package.json'))) {
    const pkg = JSON.parse(fs.readFileSync(path.join(appPath, 'package.json')));
    entryPoint = pkg.main || 'index.js';
  }

  const fullEntry = path.join(appPath, entryPoint);

  console.log("✅ Deployment Ready:", fullEntry);

  return fullEntry;
};

module.exports = {
  deploy
};