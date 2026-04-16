const pm2 = require('pm2');

const connect = () => new Promise((resolve, reject) => {
  pm2.connect((err) => {
    if (err) reject(err);
    else resolve();
  });
});

const startApp = async (appName, scriptPath, env = {}) => {
  await connect();
  return new Promise((resolve, reject) => {
    pm2.start({
      name: appName,
      script: scriptPath,
      env: env
    }, (err, apps) => {
      // pm2.disconnect();
      if (err) reject(err);
      else resolve(apps);
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
