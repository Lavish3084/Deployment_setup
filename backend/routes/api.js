const express = require('express');
const router = express.Router();
const App = require('../models/App');
const pm2Service = require('../services/pm2Service');
const deployService = require('../services/deployService');
const cloudflareService = require('../services/cloudflareService');

// Get all apps
router.get('/apps', async (req, res) => {
  try {
    const apps = await App.find().sort({ createdAt: -1 });
    res.json(apps);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create and deploy app
router.post('/create-app', async (req, res) => {
  const { name, repoUrl, subdomain, branch, buildCommand, startCommand } = req.body;
  
  try {
    // Find next available port (starting from 3000, skipping panel ports)
    const lastApp = await App.findOne().sort({ port: -1 });
    let port = lastApp ? lastApp.port + 1 : 3000;
    
    // Reserved ports for the platform itself
    const reserved = [3005, 5001];
    while (reserved.includes(port)) {
      port++;
    }

    const newApp = new App({
      name,
      repoUrl,
      subdomain,
      port,
      branch: branch || 'main',
      buildCommand: buildCommand || 'npm install',
      startCommand: startCommand || 'npm start',
      status: 'deploying'
    });
    
    await newApp.save();
    
    // Logic for background deploy (not blocking response)
    deployAppTask(newApp);

    res.json(newApp);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const deployAppTask = async (app) => {
  try {
    app.status = 'deploying';
    await app.save();

    const { appPath, logs } = await deployService.deploy(app);
    app.deploymentLogs = logs;
    await app.save();

    await pm2Service.startApp(app, appPath, { ...app.env });
    
    app.status = 'running';
    app.lastDeployed = new Date();
    app.errorLogs = ''; // Clear previous errors
    await app.save();

    // Update Cloudflare
    try {
      await cloudflareService.routeDns(app.subdomain);
      const allApps = await App.find();
      await cloudflareService.updateConfig(allApps);
      await cloudflareService.restartTunnel();
    } catch (cfErr) {
      console.warn('Cloudflare update failed (non-critical):', cfErr);
    }

  } catch (err) {
    console.error('Deployment failed:', err);
    app.status = 'error';
    app.errorLogs = err.message;
    await app.save();
  }
};

// Redeploy route
router.post('/redeploy/:id', async (req, res) => {
  try {
    const app = await App.findById(req.params.id);
    if (!app) return res.status(404).json({ error: 'App not found' });

    deployAppTask(app);
    res.json({ message: 'Redeployment started', app });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Control routes
router.post('/start/:id', async (req, res) => {
  try {
    const app = await App.findById(req.params.id);
    await pm2Service.restartApp(app.name); // Restart if stopped, starts it
    app.status = 'running';
    await app.save();
    res.json({ message: 'App started' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/stop/:id', async (req, res) => {
  try {
    const app = await App.findById(req.params.id);
    await pm2Service.stopApp(app.name);
    app.status = 'stopped';
    await app.save();
    res.json({ message: 'App stopped' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/app/:id', async (req, res) => {
  try {
    const app = await App.findById(req.params.id);
    await pm2Service.deleteApp(app.name);
    await App.findByIdAndDelete(req.params.id);
    res.json({ message: 'App deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Logs
router.get('/logs/:id', async (req, res) => {
  try {
    const app = await App.findById(req.params.id);
    const logs = await pm2Service.getLogs(app.name);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
