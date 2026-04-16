const express = require('express');
const router = express.Router();
const App = require('../models/App');
const pm2Service = require('../services/pm2Service');
const deployService = require('../services/deployService');

// GitHub Webhook listener
router.post('/github', async (req, res) => {
  const { repository } = req.body;
  if (!repository) return res.status(400).send('No repository info');

  const repoUrl = repository.clone_url;
  
  try {
    const apps = await App.find({ repoUrl });
    
    for (const app of apps) {
      console.log(`Auto-deploying app: ${app.name}`);
      app.status = 'deploying';
      await app.save();
      
      try {
        const entryPoint = await deployService.deploy(app);
        await pm2Service.restartApp(app.name);
        app.status = 'running';
        app.lastDeployed = new Date();
      } catch (err) {
        console.error(`Auto-deploy failed for ${app.name}:`, err);
        app.status = 'error';
        app.errorLogs = err.message;
      }
      await app.save();
    }
    
    res.status(200).send('Webhook received');
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).send('Internal server error');
  }
});

module.exports = router;
