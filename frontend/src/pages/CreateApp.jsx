import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {  Globe, Box, Save, ArrowLeft, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const API_BASE = 'https://panel-api.justlavish.tech/api/admin';

function CreateApp() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    repoUrl: '',
    subdomain: ''
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
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} className="btn btn-outline" style={{ marginBottom: '2rem' }}>
        <ArrowLeft size={16} /> Back
      </button>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card"
      >
        <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Box size={24} color="var(--primary-color)" />
          Deploy New Application
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="form-group">
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>App Name</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                placeholder="my-cool-app"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>

          <div className="form-group">
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>GitHub Repo URL</label>
            <div style={{ position: 'relative' }}>
              <Globe  size={18} style={{ position: 'absolute', left: '1rem', top: '1rem', color: 'var(--text-secondary)' }} />
              <input 
                type="url" 
                placeholder="https://github.com/user/repo"
                required
                style={{ paddingLeft: '3rem' }}
                value={formData.repoUrl}
                onChange={(e) => setFormData({...formData, repoUrl: e.target.value})}
              />
            </div>
          </div>

          <div className="form-group">
            <label style={{ display: 'block', fontSize: '0.9rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Subdomain</label>
            <div style={{ position: 'relative' }}>
              <Globe size={18} style={{ position: 'absolute', left: '1rem', top: '1rem', color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                placeholder="app1.justlavish.tech"
                required
                style={{ paddingLeft: '3rem' }}
                value={formData.subdomain}
                onChange={(e) => setFormData({...formData, subdomain: e.target.value})}
              />
            </div>
            <p style={{ fontSize: '0.75rem', marginTop: '0.5rem', color: 'var(--text-secondary)' }}>
              DNS records will be automatically managed via Cloudflare Tunnel.
            </p>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ marginTop: '1rem', padding: '1rem' }}>
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
            {loading ? 'Deploying...' : 'Deploy Application'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

export default CreateApp;
