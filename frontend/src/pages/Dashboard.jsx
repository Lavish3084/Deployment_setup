import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ExternalLink, Terminal, Power, RefreshCw, Cpu, Globe, Plus, Activity, GitBranch, Box, Loader2, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

const API_BASE = 'https://panel-api.justlavish.tech/api/admin';

function Dashboard() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApps();
    const interval = setInterval(fetchApps, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchApps = async () => {
    try {
      const res = await axios.get(`${API_BASE}/apps`);
      setApps(res.data);
    } catch (err) {
      console.error('Fetch apps failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleApp = async (id, status) => {
    try {
      if (status === 'running') {
        await axios.post(`${API_BASE}/stop/${id}`);
      } else {
        await axios.post(`${API_BASE}/start/${id}`);
      }
      fetchApps();
    } catch (err) {
      alert('Action failed: ' + err.message);
    }
  };

  if (loading) return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <Loader2 className="animate-spin" size={48} color="var(--primary-color)" />
    </div>
  );

  return (
    <div className="container">
      <header style={{ marginBottom: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Applications
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem' }}>Overview of your cloud infrastructure</p>
        </div>
        <Link to="/create" className="btn btn-primary">
          <Plus size={20} /> Deploy New App
        </Link>
      </header>

      <div className="card-grid">
        {apps.map((app, index) => (
          <motion.div 
            key={app._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card"
            style={{ padding: '1.5rem' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <div style={{ padding: '0.75rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '1rem' }}>
                  <Box size={24} color="var(--primary-color)" />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>{app.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    <GitBranch size={14} /> {app.branch || 'main'}
                  </div>
                </div>
              </div>
              <div className={`status-badge status-${app.status}`}>
                <div className={`badge-dot ${app.status}`} />
                {app.status}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <a 
                href={`https://${app.subdomain}`} 
                target="_blank" 
                rel="noreferrer" 
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem', background: 'rgba(0,0,0,0.2)', padding: '0.6rem 1rem', borderRadius: '0.75rem', width: 'fit-content' }}
              >
                <Globe size={14} />
                {app.subdomain}
                <ExternalLink size={12} />
              </a>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Port</div>
                <div style={{ fontWeight: '600', fontSize: '1rem' }}>{app.port}</div>
              </div>
              <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '0.75rem', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Last Update</div>
                <div style={{ fontWeight: '600', fontSize: '1rem' }}>{new Date(app.lastDeployed || app.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button 
                onClick={() => toggleApp(app._id, app.status)}
                className={`btn ${app.status === 'running' ? 'btn-outline' : 'btn-primary'}`}
                style={{ flex: 1 }}
              >
                <Power size={16} />
                {app.status === 'running' ? 'Stop' : 'Start'}
              </button>
              <Link to={`/app/${app._id}`} className="btn btn-outline" style={{ flex: 1 }}>
                <Terminal size={16} />
                Details
              </Link>
              <button 
                onClick={async () => {
                  if (window.confirm(`Delete ${app.name}?`)) {
                    await axios.delete(`${API_BASE}/app/${app._id}`);
                    fetchApps();
                  }
                }}
                className="btn btn-outline"
                style={{ flex: '0 0 auto', color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.2)' }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          </motion.div>
        ))}

        {apps.length === 0 && (
          <div className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '5rem', color: 'var(--text-secondary)' }}>
            <Activity size={64} style={{ marginBottom: '1.5rem', opacity: 0.2, margin: '0 auto' }} />
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No apps found</h3>
            <p style={{ marginBottom: '2rem' }}>Deploy your first application to get started with the platform.</p>
            <Link to="/create" className="btn btn-primary">
              <Plus size={20} /> Deploy Now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}


export default Dashboard;
