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

  let currentConfig = { ingress: [] };
  
  // Try to load existing config to preserve static routes
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      const fileContent = fs.readFileSync(CONFIG_PATH, 'utf8');
      currentConfig = yaml.load(fileContent) || { ingress: [] };
    } catch (err) {
      console.warn('Could not read existing Cloudflare config, starting fresh');
    }
  }

  // Define hostnames managed by this platform (dynamic apps)
  const managedHostnames = new Set(apps.map(app => app.subdomain));

  // 1. Keep static routes (routes not in the database and not the catch-all 404)
  const staticRoutes = (currentConfig.ingress || []).filter(item => {
    // Keep it if it has a hostname and it's NOT one of our managed apps
    return item.hostname && !managedHostnames.has(item.hostname);
  });

  // 2. Build new ingress list
  const newIngress = [...staticRoutes];

  // 3. Add dynamic apps
  apps.forEach(app => {
    if (app.status === 'running') {
      newIngress.push({
        hostname: app.subdomain,
        service: `http://localhost:${app.port}`
      });
    }
  });

  // 4. Add catch-all 404 at the end
  newIngress.push({
    service: 'http_status:404'
  });

  const baseConfig = {
    tunnel: TUNNEL_ID,
    'credentials-file': `/root/.cloudflared/${TUNNEL_ID}.json`,
    ingress: newIngress
  };

  const yamlContent = yaml.dump(baseConfig);
  
  try {
    fs.writeFileSync(CONFIG_PATH, yamlContent);
    console.log('✅ Cloudflare config updated and preserved static routes');
  } catch (err) {
    console.error('❌ Failed to write Cloudflare config:', err);
    throw err;
  }
};

const routeDns = async (subdomain) => {
  if (!TUNNEL_ID) return;
  
  console.log(`📡 Routing DNS for ${subdomain}...`);
  const cmd = `cloudflared tunnel route dns ${TUNNEL_ID} ${subdomain}`;
  const result = shell.exec(cmd);
  if (result.code !== 0) {
    console.warn('⚠️ Cloudflare DNS routing (might already exist):', result.stderr);
  }
};

const restartTunnel = async () => {
  console.log('🔄 Restarting Cloudflare Tunnel via PM2...');
  // Ensure the tunnel is managed by PM2 as 'cloudflared'
  const restartCmd = process.env.CLOUDFLARE_RESTART_CMD || 'pm2 restart cloudflared';
  const result = shell.exec(restartCmd);
  
  if (result.code !== 0) {
    console.error('❌ Failed to restart tunnel via PM2. Ensure "cloudflared" is running in PM2.');
    // Fallback or alert user
  }
};

module.exports = {
  updateConfig,
  routeDns,
  restartTunnel
};
