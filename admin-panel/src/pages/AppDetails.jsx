import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Terminal, ArrowLeft, Power, RotateCcw, Trash2, Github, Globe, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

const API_BASE = 'http://localhost:5000/api/admin';

function AppDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [app, setApp] = useState(null);
  const [logs, setLogs] = useState({ logPath: '', errorPath: '' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApp();
  }, [id]);

  const fetchApp = async () => {
    try {
      const res = await axios.get(`${API_BASE}/apps`);
      const currentApp = res.data.find(a => a._id === id);
      setApp(currentApp);
      
      const logRes = await axios.get(`${API_BASE}/logs/${id}`);
      setLogs(logRes.data);
      
      setLoading(false);
    } catch (err) {
      console.error('Fetch failed:', err);
    }
  };

  const handleAction = async (action) => {
    try {
      if (action === 'delete') {
        if (!window.confirm('Are you sure you want to delete this app?')) return;
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

  if (loading || !app) return <div style={{ padding: '2rem', color: 'var(--text-secondary)' }}>Loading...</div>;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <button onClick={() => navigate(-1)} className="btn btn-outline">
          <ArrowLeft size={16} /> Dashboard
        </button>
        <div style={{ display: 'flex', gap: '1rem' }}>
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

      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Application Info</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <InfoItem icon={<Github size={16} />} label="Repository" value={app.name} />
              <InfoItem icon={<Globe size={16} />} label="Subdomain" value={app.subdomain} />
              <InfoItem icon={<Cpu size={16} />} label="Port" value={app.port} />
              <InfoItem icon={<Terminal size={16} />} label="Status" value={app.status} isStatus />
            </div>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>Environment</h3>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', background: 'var(--bg-color)', padding: '1rem', borderRadius: '0.5rem', fontFamily: 'monospace' }}>
              {Object.entries(app.env || {}).map(([k, v]) => (
                <div key={k}>{k}={v}</div>
              ))}
              {Object.keys(app.env || {}).length === 0 && 'No variables set'}
            </div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', minHeight: '500px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Terminal size={18} /> Implementation Logs
            </h3>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Live updates via PM2</div>
          </div>
          
          <div style={{ 
            flex: 1, 
            background: '#000', 
            borderRadius: '0.75rem', 
            padding: '1.5rem', 
            fontFamily: 'JetBrains Mono, monospace', 
            fontSize: '13px', 
            color: '#10b981', 
            overflowY: 'auto',
            border: '1px solid #111'
          }}>
            <div>[SYSTEM] Reading logs for {app.name}...</div>
            <div style={{ color: '#94a3b8', marginTop: '10px' }}>Log File: {logs.logPath || 'N/A'}</div>
            <div style={{ color: '#94a3b8' }}>Error File: {logs.errorPath || 'N/A'}</div>
            <div style={{ marginTop: '20px' }}>
              {app.errorLogs ? (
                <div style={{ color: 'var(--error)' }}>
                  [ERROR] {app.errorLogs}
                </div>
              ) : (
                <>
                  <div>[STDOUT] Application started on port {app.port}</div>
                  <div>[STDOUT] Connected to database...</div>
                  {app.status === 'running' && <div className="blink">|</div>}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        .blink { animation: blink 1s step-end infinite; }
        @keyframes blink { 50% { opacity: 0; } }
      `}</style>
    </div>
  );
}

function InfoItem({ icon, label, value, isStatus }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <div style={{ color: 'var(--text-secondary)' }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{label}</div>
        <div style={{ fontSize: '0.95rem', fontWeight: '500' }} className={isStatus ? `status-${value}` : ''}>
          {value}
        </div>
      </div>
    </div>
  );
}

export default AppDetails;
