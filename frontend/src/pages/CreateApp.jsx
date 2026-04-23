import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Globe, Box, Save, ArrowLeft, Loader2, GitBranch, Terminal, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const API_BASE = 'https://panel-api.justlavish.tech/api/admin';

function CreateApp() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    repoUrl: '',
    subdomain: '',
    branch: 'main',
    buildCommand: 'npm install',
    startCommand: 'npm start',
    env: {}
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(`${API_BASE}/create-app`, formData);
      navigate('/');
    } catch (err) {
      alert('Failed to create app: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: '800px' }}>
      <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ marginBottom: '2rem' }}>
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
      >
        <div style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Zap size={28} color="var(--primary-color)" />
            Deploy New Application
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>Launch your project onto the global edge infrastructure.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>Project Name</label>
              <div style={{ position: 'relative' }}>
                <Box size={18} style={{ position: 'absolute', left: '1rem', top: '0.9rem', color: 'var(--text-secondary)' }} />
                <input 
                  type="text" 
                  placeholder="my-awesome-api"
                  required
                  style={{ paddingLeft: '3rem' }}
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>

            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>GitHub Repository URL</label>
              <div style={{ position: 'relative' }}>
                <Globe size={18} style={{ position: 'absolute', left: '1rem', top: '0.9rem', color: 'var(--text-secondary)' }} />
                <input 
                  type="url" 
                  placeholder="https://github.com/username/repo"
                  required
                  style={{ paddingLeft: '3rem' }}
                  value={formData.repoUrl}
                  onChange={(e) => setFormData({...formData, repoUrl: e.target.value})}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Subdomain</label>
              <div style={{ position: 'relative' }}>
                <Globe size={18} style={{ position: 'absolute', left: '1rem', top: '0.9rem', color: 'var(--text-secondary)' }} />
                <input 
                  type="text" 
                  placeholder="api.example.com"
                  required
                  style={{ paddingLeft: '3rem' }}
                  value={formData.subdomain}
                  onChange={(e) => setFormData({...formData, subdomain: e.target.value})}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Git Branch</label>
              <div style={{ position: 'relative' }}>
                <GitBranch size={18} style={{ position: 'absolute', left: '1rem', top: '0.9rem', color: 'var(--text-secondary)' }} />
                <input 
                  type="text" 
                  placeholder="main"
                  style={{ paddingLeft: '3rem' }}
                  value={formData.branch}
                  onChange={(e) => setFormData({...formData, branch: e.target.value})}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Build Command</label>
              <div style={{ position: 'relative' }}>
                <Terminal size={18} style={{ position: 'absolute', left: '1rem', top: '0.9rem', color: 'var(--text-secondary)' }} />
                <input 
                  type="text" 
                  placeholder="npm install"
                  style={{ paddingLeft: '3rem' }}
                  value={formData.buildCommand}
                  onChange={(e) => setFormData({...formData, buildCommand: e.target.value})}
                />
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                Typically <code>npm install</code> or <code>yarn install</code>.
              </p>
            </div>

            <div className="form-group">
              <label>Start Command</label>
              <div style={{ position: 'relative' }}>
                <Terminal size={18} style={{ position: 'absolute', left: '1rem', top: '0.9rem', color: 'var(--text-secondary)' }} />
                <input 
                  type="text" 
                  placeholder="node index.js"
                  style={{ paddingLeft: '3rem' }}
                  value={formData.startCommand}
                  onChange={(e) => setFormData({...formData, startCommand: e.target.value})}
                />
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                Examples: <code>npm start</code>, <code>node server.js</code>, or <code>python app.py</code>.
              </p>
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', alignSelf: 'center', marginRight: '0.5rem' }}>Presets:</span>
            {['npm start', 'node index.js', 'node server.js', 'python3 app.py'].map(cmd => (
              <button 
                key={cmd}
                type="button"
                onClick={() => setFormData({...formData, startCommand: cmd})}
                style={{ 
                  fontSize: '0.7rem', 
                  padding: '0.3rem 0.7rem', 
                  borderRadius: '2rem', 
                  background: 'rgba(255,255,255,0.05)', 
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  color: 'var(--text-primary)'
                }}
              >
                {cmd}
              </button>
            ))}
          </div>

          <div style={{ marginTop: '2rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Zap size={18} color="var(--primary-color)" />
              Environment Variables
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {Object.entries(formData.env || {}).map(([key, value], idx) => (
                <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <input 
                    type="text" 
                    placeholder="KEY" 
                    value={key} 
                    onChange={(e) => {
                      const newEnv = { ...formData.env };
                      const val = newEnv[key];
                      delete newEnv[key];
                      newEnv[e.target.value] = val;
                      setFormData({ ...formData, env: newEnv });
                    }}
                    style={{ flex: 1 }}
                  />
                  <input 
                    type="text" 
                    placeholder="VALUE" 
                    value={value} 
                    onChange={(e) => {
                      setFormData({ ...formData, env: { ...formData.env, [key]: e.target.value } });
                    }}
                    style={{ flex: 2 }}
                  />
                  <button 
                    type="button" 
                    onClick={() => {
                      const newEnv = { ...formData.env };
                      delete newEnv[key];
                      setFormData({ ...formData, env: newEnv });
                    }}
                    style={{ padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}
                  >
                    ×
                  </button>
                </div>
              ))}
              <button 
                type="button" 
                onClick={() => setFormData({ ...formData, env: { ...formData.env, '': '' } })}
                className="btn btn-outline"
                style={{ width: 'fit-content', fontSize: '0.8rem', padding: '0.5rem 1rem' }}
              >
                + Add Variable
              </button>
            </div>
          </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <strong>Pro Tip:</strong> Your application will be automatically containerized and deployed. We manage SSL and DNS via Cloudflare Tunnel.
            </p>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '2rem', height: '3.5rem' }}>
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {loading ? 'Initializing Deployment...' : 'Launch Application'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default CreateApp;
