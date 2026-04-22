import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { ExternalLink, Terminal, Power, MoreVertical, RefreshCw, Cpu, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

const API_BASE = 'https://panel-api.justlavish.tech/api/admin';

function Dashboard() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApps();
    const interval = setInterval(fetchApps, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const fetchApps = async () => {
    try {
      const res = await axios.get(`${API_BASE}/apps`);
      setApps(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Fetch apps failed:', err);
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

  if (loading) return <div style={{ color: 'var(--text-secondary)' }}>Loading Dashboard...</div>;

  return (
    <div>
      <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.25rem' }}>Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage and monitor your deployed applications</p>
        </div>
        <Link to="/create" className="btn btn-primary">
          <PlusCircle size={18} /> Deploy New App
        </Link>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
        {apps.map((app, index) => (
          <motion.div 
            key={app._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card"
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{app.name}</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <Globe size={14} />
                  <a href={`https://${app.subdomain}`} target="_blank" rel="noreferrer" style={{ color: 'var(--primary-color)' }}>
                    {app.subdomain}
                  </a>
                </div>
              </div>
              <span className={`status-badge status-${app.status}`}>
                {app.status}
              </span>
            </div>

            <div style={{ display: 'grid', gridCols: 2, gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface-lighter)', padding: '0.75rem', borderRadius: '0.75rem' }}>
                <Cpu size={18} color="var(--text-secondary)" />
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>PORT</div>
                  <div style={{ fontWeight: '600' }}>{app.port}</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface-lighter)', padding: '0.75rem', borderRadius: '0.75rem' }}>
                <RefreshCw size={18} color="var(--text-secondary)" />
                <div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>DEPLOYED</div>
                  <div style={{ fontWeight: '600' }}>{new Date(app.lastDeployed).toLocaleTimeString()}</div>
                </div>
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
                Logs
              </Link>
            </div>
          </motion.div>
        ))}

        {apps.length === 0 && (
          <div className="card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
            <Activity size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p>No applications deployed yet.</p>
            <Link to="/create" style={{ color: 'var(--primary-color)', marginTop: '1rem', display: 'inline-block' }}>Get started</Link>
          </div>
        )}
      </div>
    </div>
  );
}

// Add PlusCircle import if missing in this scope or use Lucide
import { PlusCircle, Activity } from 'lucide-react';

export default Dashboard;
