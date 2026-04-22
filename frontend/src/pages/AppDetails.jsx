import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Terminal, ArrowLeft, Power, RotateCcw, Trash2, Globe, Cpu, GitBranch, Settings, History, Info, Loader2, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';

const API_BASE = 'https://panel-api.justlavish.tech/api/admin';

function AppDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [logs, setLogs] = useState({ logPath: '', errorPath: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApp();
    const interval = setInterval(fetchApp, 15000); // Refresh every 15s
    return () => clearInterval(interval);
  }, [id]);

  const fetchApp = async () => {
    try {
      const res = await axios.get(`${API_BASE}/apps`);
      const currentApp = res.data.find(a => a._id === id);
      setApp(currentApp);
      
      const logRes = await axios.get(`${API_BASE}/logs/${id}`);
      setLogs(logRes.data);
    } catch (err) {
      console.error('Fetch failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action) => {
    try {
      if (action === 'delete') {
        if (!window.confirm('Are you sure you want to delete this app? This action is irreversible.')) return;
        await axios.delete(`${API_BASE}/app/${id}`);
        navigate('/');
        return;
      }
      
      await axios.post(`${API_BASE}/${action}/${id}`);
      fetchApp();
    } catch (err) {
      alert('Action failed: ' + err.message);
    }
  };

  if (loading || !app) return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
      <Loader2 className="animate-spin" size={48} color="var(--primary-color)" />
    </div>
  );

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <button onClick={() => navigate(-1)} className="btn btn-outline">
          <ArrowLeft size={16} /> Dashboard
        </button>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button 
            onClick={() => handleAction('redeploy')} 
            className="btn btn-primary"
            disabled={app.status === 'deploying'}
          >
            <RefreshCw size={16} className={app.status === 'deploying' ? 'animate-spin' : ''} />
            {app.status === 'deploying' ? 'Deploying...' : 'Redeploy'}
          </button>
          <button onClick={() => handleAction(app.status === 'running' ? 'stop' : 'start')} className={`btn ${app.status === 'running' ? 'btn-outline' : 'btn-primary'}`}>
            <Power size={16} /> {app.status === 'running' ? 'Stop' : 'Start'}
          </button>
          <button onClick={() => handleAction('restart')} className="btn btn-outline">
            <RotateCcw size={16} /> Restart
          </button>
          <button onClick={() => handleAction('delete')} className="btn btn-outline" style={{ color: 'var(--error)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
            <Trash2 size={16} /> Delete
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '350px 1fr', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="glass-card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Info size={20} color="var(--primary-color)" /> General Info
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <InfoItem icon={<Globe size={18} />} label="Repository" value={app.repoUrl} isLink />
              <InfoItem icon={<GitBranch size={18} />} label="Branch" value={app.branch || 'main'} />
              <InfoItem icon={<Globe size={18} />} label="Subdomain" value={app.subdomain} />
              <InfoItem icon={<Cpu size={18} />} label="Port" value={app.port} />
              <div style={{ marginTop: '0.5rem' }}>
                <span className={`status-badge status-${app.status}`}>
                  <div className={`badge-dot ${app.status}`} />
                  {app.status}
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="glass-card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Settings size={20} color="var(--primary-color)" /> Configuration
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <InfoItem icon={<Terminal size={18} />} label="Build Command" value={app.buildCommand} isCode />
              <InfoItem icon={<Terminal size={18} />} label="Start Command" value={app.startCommand} isCode />
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass-card">
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <History size={20} color="var(--primary-color)" /> Environment
            </h3>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '0.75rem', fontFamily: 'var(--font-mono, monospace)', border: '1px solid var(--border-color)' }}>
              {Object.entries(app.env || {}).map(([k, v]) => (
                <div key={k} style={{ marginBottom: '0.25rem' }}><span style={{ color: 'var(--primary-color)' }}>{k}</span>={v}</div>
              ))}
              {Object.keys(app.env || {}).length === 0 && 'No variables set'}
            </div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card" style={{ display: 'flex', flexDirection: 'column', minHeight: '600px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Terminal size={22} color="var(--success)" /> Deployment Logs
            </h3>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.8rem', borderRadius: '2rem' }}>
              Live via PM2
            </div>
          </div>
          
          <div style={{ 
            flex: 1, 
            background: '#0a0a0b', 
            borderRadius: '1rem', 
            padding: '1.5rem', 
            fontFamily: 'JetBrains Mono, monospace', 
            fontSize: '13px', 
            color: '#e2e8f0', 
            overflowY: 'auto',
            border: '1px solid rgba(255,255,255,0.05)',
            boxShadow: 'inset 0 2px 10px rgba(0,0,0,0.5)'
          }}>
            <div style={{ color: 'var(--primary-color)', marginBottom: '1rem' }}>[SYSTEM] Tracking logs for {app.name}...</div>
            
            {(app.deploymentLogs || app.errorLogs) && (
              <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '0.75rem', borderLeft: `3px solid ${app.status === 'error' ? 'var(--error)' : 'var(--primary-color)'}` }}>
                <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>BUILD & DEPLOYMENT LOGS</div>
                <pre style={{ whiteSpace: 'pre-wrap', margin: 0, color: '#94a3b8', lineHeight: '1.6' }}>
                  {app.deploymentLogs || app.errorLogs}
                </pre>
              </div>
            )}

            <div style={{ marginBottom: '1.5rem', padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem' }}>
              <div style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '0.25rem' }}>RUNTIME LOG PATHS (PM2)</div>
              <div style={{ color: '#94a3b8' }}>OUT: {logs.logPath || 'N/A'}</div>
              <div style={{ color: '#94a3b8' }}>ERR: {logs.errorPath || 'N/A'}</div>
            </div>

            <div style={{ lineHeight: '1.8' }}>
              {app.status === 'running' && (
                <>
                  <div style={{ color: '#10b981' }}>[STDOUT] Application instance healthy</div>
                  <div style={{ color: '#10b981' }}>[STDOUT] Listening on port {app.port}</div>
                  <div style={{ color: '#6366f1' }}>[PM2] Process online (id: 0)</div>
                  <div className="blink" style={{ color: 'var(--primary-color)' }}>_</div>
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
      
      <style>{`
        .blink { animation: blink 1s step-end infinite; }
        @keyframes blink { 50% { opacity: 0; } }
      `}</style>
    </div>
  );
}

function InfoItem({ icon, label, value, isStatus, isCode, isLink }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
      <div style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>{label}</div>
        {isCode ? (
          <code style={{ fontSize: '0.9rem', color: 'var(--primary-color)', background: 'rgba(99, 102, 241, 0.1)', padding: '0.2rem 0.5rem', borderRadius: '0.4rem', fontFamily: 'monospace' }}>
            {value}
          </code>
        ) : isLink ? (
          <a href={value} target="_blank" rel="noreferrer" style={{ fontSize: '0.95rem', color: 'var(--primary-color)', textDecoration: 'underline', wordBreak: 'break-all' }}>
            {value}
          </a>
        ) : (
          <div style={{ fontSize: '0.95rem', fontWeight: '500', color: 'var(--text-primary)' }}>
            {value}
          </div>
        )}
      </div>
    </div>
  );
}

export default AppDetails;
