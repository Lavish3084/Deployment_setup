import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, NavLink } from 'react-router-dom';
import { LayoutDashboard, PlusCircle, Terminal, Settings, Activity, ExternalLink, Power, RotateCcw, Trash2 } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import CreateApp from './pages/CreateApp';
import AppDetails from './pages/AppDetails';

function App() {
  return (
    <Router>
      <div className="sidebar" style={{
        width: '260px',
        borderRight: '1px solid var(--border-color)',
        padding: '2rem 1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem',
        backgroundColor: 'var(--surface-color)'
      }}>
        <div className="logo" style={{
          fontSize: '1.5rem',
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: 'var(--primary-color)'
        }}>
          <Activity size={32} />
          <span>MiniPaaS</span>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <SidebarLink to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" />
          <SidebarLink to="/create" icon={<PlusCircle size={20} />} label="Deploy App" />
        </nav>

        <div style={{ marginTop: 'auto', padding: '1rem', background: 'var(--surface-lighter)', borderRadius: '0.75rem' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Status</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }}></div>
            <span>System Active</span>
          </div>
        </div>
      </div>

      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/create" element={<CreateApp />} />
          <Route path="/app/:id" element={<AppDetails />} />
        </Routes>
      </main>
    </Router>
  );
}

function SidebarLink({ to, icon, label }) {
  return (
    <NavLink 
      to={to} 
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.75rem 1rem',
        borderRadius: '0.75rem',
        color: isActive ? 'white' : 'var(--text-secondary)',
        background: isActive ? 'var(--primary-color)' : 'transparent',
        transition: 'all 0.2s'
      })}
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}

export default App;
