import React from 'react';
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Activity, ShieldCheck } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import CreateApp from './pages/CreateApp';
import AppDetails from './pages/AppDetails';

function App() {
  return (
    <Router>
      <div style={{ display: 'flex' }}>
        <aside className="sidebar">
          <div className="logo">
            <Activity size={32} color="var(--primary-color)" />
            <span>MiniPaaS</span>
          </div>

          <nav className="sidebar-nav">
            <NavLink to="/" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <LayoutDashboard size={20} />
              <span>Dashboard</span>
            </NavLink>
            <NavLink to="/create" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <PlusCircle size={20} />
              <span>Deploy App</span>
            </NavLink>
          </nav>

          <div style={{ marginTop: 'auto', padding: '1.25rem', background: 'rgba(255,255,255,0.03)', borderRadius: '1rem', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <ShieldCheck size={18} color="var(--success)" />
              <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Secure Node</span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>All connections are end-to-end encrypted via Cloudflare.</p>
          </div>
        </aside>

        <main>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/create" element={<CreateApp />} />
            <Route path="/app/:id" element={<AppDetails />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
