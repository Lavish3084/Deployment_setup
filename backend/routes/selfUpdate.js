const express = require('express');
const { exec } = require('child_process');

const router = express.Router();

router.post('/self-update', (req, res) => {
  console.log("🔄 Platform update triggered");

  exec(`
    cd /workspace/tmpdisk/Deployment/Deployment_setup &&
    git pull origin main &&
    cd frontend && npm install && npm run build &&
    pm2 restart panel-backend panel-frontend
  `, (err, stdout, stderr) => {
    if (err) {
      console.error("❌ Update failed:", err);
      return res.status(500).send('Update failed');
    }

    console.log("✅ Platform updated:\n", stdout);
    res.send('Platform updated');
  });
});

module.exports = router;
