const shell = require('shelljs');
const path = require('path');
const fs = require('fs');

const APPS_DIR = path.join(__dirname, '../../apps');

if (!fs.existsSync(APPS_DIR)) {
  fs.mkdirSync(APPS_DIR, { recursive: true });
}

const deploy = async (app) => {
  const appPath = path.join(APPS_DIR, app.name);
  
  if (fs.existsSync(appPath)) {
    // Pull latest changes
    shell.cd(appPath);
    const pullResult = shell.exec('git pull');
    if (pullResult.code !== 0) throw new Error('Git pull failed: ' + pullResult.stderr);
  } else {
    // Clone repo
    shell.cd(APPS_DIR);
    const cloneResult = shell.exec(`git clone ${app.repoUrl} ${app.name}`);
    if (cloneResult.code !== 0) throw new Error('Git clone failed: ' + cloneResult.stderr);
    shell.cd(app.name);
  }

  // Install dependencies
  const installResult = shell.exec('npm install');
  if (installResult.code !== 0) throw new Error('NPM install failed: ' + installResult.stderr);

  // Support for custom .env
  if (app.env && Object.keys(app.env).length > 0) {
    const envContent = Object.entries(app.env).map(([k, v]) => `${k}=${v}`).join('\n');
    fs.writeFileSync(path.join(appPath, '.env'), envContent);
  }

  // Find entry point (usually index.js or app.js or from package.json)
  let entryPoint = 'index.js';
  if (fs.existsSync(path.join(appPath, 'package.json'))) {
    const pkg = JSON.parse(fs.readFileSync(path.join(appPath, 'package.json')));
    entryPoint = pkg.main || 'index.js';
  }

  return path.join(appPath, entryPoint);
};

module.exports = {
  deploy
};
