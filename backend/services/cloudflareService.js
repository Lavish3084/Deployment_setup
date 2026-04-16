const fs = require('fs');
const yaml = require('js-yaml');
const shell = require('shelljs');
const path = require('path');
require('dotenv').config();

const CONFIG_PATH = process.env.CLOUDFLARE_CONFIG_PATH || '/root/.cloudflared/config.yml';
const TUNNEL_ID = process.env.CLOUDFLARE_TUNNEL_ID;

const updateConfig = async (apps) => {
  if (!TUNNEL_ID) {
    console.warn('CLOUDFLARE_TUNNEL_ID not set, skipping config update');
    return;
  }

  const baseConfig = {
    tunnel: TUNNEL_ID,
    'credentials-file': `/root/.cloudflared/${TUNNEL_ID}.json`,
    ingress: []
  };

  // Add ingress rules for each app
  apps.forEach(app => {
    if (app.status === 'running') {
      baseConfig.ingress.push({
        hostname: app.subdomain,
        service: `http://localhost:${app.port}`
      });
    }
  });

  // Add catch-all 404
  baseConfig.ingress.push({
    service: 'http_status:404'
  });

  const yamlContent = yaml.dump(baseConfig);
  
  try {
    // In production, this might need sudo or specific permissions
    // We'll write to a temp file first if needed, but for now direct write
    fs.writeFileSync(CONFIG_PATH, yamlContent);
    console.log('Cloudflare config updated');
  } catch (err) {
    console.error('Failed to write Cloudflare config:', err);
    throw err;
  }
};

const routeDns = async (subdomain) => {
  if (!TUNNEL_ID) return;
  
  const cmd = `cloudflared tunnel route dns ${TUNNEL_ID} ${subdomain}`;
  const result = shell.exec(cmd);
  if (result.code !== 0) {
    console.error('Cloudflare DNS routing failed:', result.stderr);
    // Don't throw here as the DNS might already exist
  }
};

const restartTunnel = async () => {
  // Usually done via systemctl or pm2 if tunnel is managed there
  // For now, let's assume it's managed by a command like 'pm2 restart tunnel-name'
  // Or it might be a systemd service.
  const restartCmd = process.env.CLOUDFLARE_RESTART_CMD || 'pm2 restart cloudflared';
  shell.exec(restartCmd);
};

module.exports = {
  updateConfig,
  routeDns,
  restartTunnel
};
