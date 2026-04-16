require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

const apiRoutes = require('./routes/api');
const webhookRoutes = require('./routes/webhook');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api/admin', apiRoutes);
app.use('/api/webhook', webhookRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Self-Deployment Webhook (Panel Deployment)
app.post("/deploy", (req, res) => {
  const { exec } = require("child_process");
  console.log("🚀 Self-deployment triggered via /deploy");

  // Run the deploy script
  exec("cd /workspace/panel && ./deploy.sh", (err, stdout, stderr) => {
    if (err) {
      console.error("❌ Deploy failed:", err);
      return res.status(500).send("Deploy failed");
    }
    console.log("✅ Deploy stdout:", stdout);
    if (stderr) console.warn("⚠️ Deploy stderr:", stderr);
    res.send("Deploy success");
  });
});

// Database Connection
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/minipaas';
mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

app.listen(PORT, () => {
  console.log(`PaaS Backend running on port ${PORT}`);
});
