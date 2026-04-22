const mongoose = require('mongoose');

const appSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  repoUrl: { type: String, required: true },
  subdomain: { type: String, required: true, unique: true },
  port: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['deploying', 'running', 'stopped', 'error', 'pending'], 
    default: 'pending' 
  },
  branch: { type: String, default: 'main' },
  buildCommand: { type: String, default: 'npm install' },
  startCommand: { type: String, default: 'npm start' },
  env: { type: Map, of: String, default: {} },
  lastDeployed: { type: Date },
  webhookSecret: { type: String },
  errorLogs: { type: String },
  deploymentLogs: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('App', appSchema);
