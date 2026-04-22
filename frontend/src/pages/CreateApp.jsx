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
    startCommand: 'npm start'
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
                  placeholder="npm install && npm run build"
                  style={{ paddingLeft: '3rem' }}
                  value={formData.buildCommand}
                  onChange={(e) => setFormData({...formData, buildCommand: e.target.value})}
                />
              </div>
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
            </div>
          </div>

          <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(99, 102, 241, 0.05)', borderRadius: '1rem', border: '1px solid rgba(99, 102, 241, 0.1)' }}>
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
