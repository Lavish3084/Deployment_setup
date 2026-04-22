const pm2 = require('pm2');

const connect = () => new Promise((resolve, reject) => {
  pm2.connect((err) => {
    if (err) reject(err);
    else resolve();
  });
});

const startApp = async (app, appPath, env = {}) => {
  await connect();
  
  let startCommand = app.startCommand;
  const fs = require('fs');
  const path = require('path');

  // Intelligent fallback if no start command provided
  if (!startCommand || startCommand === 'npm start') {
    if (fs.existsSync(path.join(appPath, 'package.json'))) {
      const pkg = JSON.parse(fs.readFileSync(path.join(appPath, 'package.json'), 'utf8'));
      
      if (pkg.scripts && pkg.scripts.start) {
        startCommand = 'npm start';
      } else if (pkg.main) {
        startCommand = `node ${pkg.main}`;
      } else if (fs.existsSync(path.join(appPath, 'index.js'))) {
        startCommand = 'node index.js';
      } else if (fs.existsSync(path.join(appPath, 'server.js'))) {
        startCommand = 'node server.js';
      }
    } else if (fs.existsSync(path.join(appPath, 'index.js'))) {
      startCommand = 'node index.js';
    }
  }

  // Final fallback
  if (!startCommand) startCommand = 'node index.js';

  console.log(`🚀 [${app.name}] Starting app with command: ${startCommand}`);

  const parts = startCommand.split(' ');
  const cmd = parts[0];
  const args = parts.slice(1);

  let options = {
    name: app.name,
    cwd: appPath,
    env: { ...env, PORT: app.port },
    autorestart: true,
    max_memory_restart: '300M'
  };

  if (cmd === 'npm') {
    options.script = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    options.args = args;
  } else if (cmd === 'node') {
    options.script = args[0];
    options.args = args.slice(1);
    options.interpreter = 'node';
  } else {
    options.script = cmd;
    options.args = args;
  }

  return new Promise((resolve, reject) => {
    pm2.start(options, (err, apps) => {
      if (err) {
        console.error(`PM2 start failed for ${app.name}:`, err);
        reject(err);
      } else {
        console.log(`✅ [${app.name}] Process started via PM2`);
        resolve(apps);
      }
    });
  });
};

const stopApp = async (appName) => {
  await connect();
  return new Promise((resolve, reject) => {
    pm2.stop(appName, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

const restartApp = async (appName) => {
  await connect();
  return new Promise((resolve, reject) => {
    pm2.restart(appName, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

const deleteApp = async (appName) => {
  await connect();
  return new Promise((resolve, reject) => {
    pm2.delete(appName, (err) => {
      if (err) reject(err);
      else resolve();
    });
  });
};

const getStatus = async (appName) => {
  await connect();
  return new Promise((resolve, reject) => {
    pm2.describe(appName, (err, processDescription) => {
      if (err) reject(err);
      else resolve(processDescription && processDescription[0] ? processDescription[0].pm2_env.status : 'stopped');
    });
  });
};

const getLogs = async (appName) => {
  // PM2 logs are usually in ~/.pm2/logs
  // For simplicity, we might just use 'pm2 logs appName --lines 100 --nostream' or similar
  // But programmatically, it's easier to read the log files if we know where they are.
  await connect();
  return new Promise((resolve, reject) => {
    pm2.describe(appName, (err, processDescription) => {
      if (err || !processDescription[0]) return reject(err || new Error('App not found'));
      const logPath = processDescription[0].pm2_env.pm_out_log_path;
      const errorPath = processDescription[0].pm2_env.pm_err_log_path;
      // In a real system, you'd read these files.
      // For now, let's just return the paths or a status.
      resolve({ logPath, errorPath });
    });
  });
};

module.exports = {
  startApp,
  stopApp,
  restartApp,
  deleteApp,
  getStatus,
  getLogs
};
