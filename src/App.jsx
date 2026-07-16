import { useState, useEffect } from 'react';
import { loadAppState, saveAppState } from './data/mockData';
import LandingPage from './pages/LandingPage';
import ClientPortal from './pages/ClientPortal';
import ReviewerPortal from './pages/ReviewerPortal';
import AdminPortal from './pages/AdminPortal';

export default function App() {
  const [state, setState] = useState(() => loadAppState());
  const [activeView, setActiveView] = useState('landing');
  const [toasts, setToasts] = useState([]);
  const [theme, setTheme] = useState(() => localStorage.getItem('attentra_theme') || 'light');

  // Sync state changes to localStorage
  useEffect(() => {
    saveAppState(state);
  }, [state]);

  // Sync theme changes to html node
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('attentra_theme', theme);
  }, [theme]);

  // Toast Notification Engine helper
  const showToast = (title, message, iconType = 'info') => {
    const id = Date.now() + Math.random().toString(36).substr(2, 5);
    const newToast = { id, title, message, iconType, removing: false };
    
    setToasts((prev) => [...prev, newToast]);

    // Schedule removing state
    setTimeout(() => {
      setToasts((prev) =>
        prev.map((t) => (t.id === id ? { ...t, removing: true } : t))
      );
    }, 3700);

    // Schedule full cleanup
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Slow Background simulated notifications
  useEffect(() => {
    const simulatedEvents = [
      { title: "Escrow Deposited", text: "Client 'FinTech Startup' created campaign ($450 escrowed)", type: "success" },
      { title: "Campaign Completed", text: "Thumbnail study 'A/B Theme' reached target audience quota.", type: "success" },
      { title: "Auditor Warning", text: "Reviewer profile 'rev-903' failed keystroke timing checks.", type: "warning" },
      { title: "Fraud Trigger Blocked", text: "Intercepted bot spoofing general demographic filters.", type: "fraud" },
      { title: "Fast Match", text: "15 developers matched and accepted 'Usability Testing' campaign.", type: "info" }
    ];

    const interval = setInterval(() => {
      // Do not interrupt reviewer workspace sandbox testing
      const sandboxActive = document.getElementById('tab-reviewer-sandbox')?.classList.contains('active-sub-tab');
      if (Math.random() < 0.2 && !sandboxActive && activeView !== 'reviewer') {
        const ev = simulatedEvents[Math.floor(Math.random() * simulatedEvents.length)];
        showToast(ev.title, ev.text, ev.type);
      }
    }, 12000);

    return () => clearInterval(interval);
  }, [activeView]);

  const handleRoleChange = (role) => {
    setActiveView(role);
    setState(prev => ({
      ...prev,
      currentUser: { ...prev.currentUser, role }
    }));
  };

  return (
    <div className="app-wrapper">
      {/* Dynamic Background Glow Elements */}
      <div className="bg-glow bg-glow-1"></div>
      <div className="bg-glow bg-glow-2"></div>

      {/* GLOBAL NAVBAR */}
      <header className="global-navbar">
        <div className="navbar-logo" onClick={() => handleRoleChange('landing')}>
          <div className="logo-circle">
            <i className="fa-solid fa-signature"></i>
          </div>
          Attentra
        </div>

        <nav className="navbar-menu-links">
          <a href="#platform" className="nav-link" onClick={() => handleRoleChange('landing')}>Platform</a>
          <a href="#solutions" className="nav-link" onClick={() => handleRoleChange('landing')}>Solutions</a>
          <a href="#pricing" className="nav-link" onClick={() => handleRoleChange('landing')}>Pricing</a>
          <a href="#docs" className="nav-link" onClick={() => handleRoleChange('landing')}>Documentation</a>
        </nav>

        {/* Dynamic User Panel & Role Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          {/* Theme Selector */}
          <div className="nav-dropdown" style={{ zIndex: 101 }}>
            <button className="dropdown-trigger theme-btn" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--border-subtle)', padding: '6px 14px', borderRadius: '20px', fontSize: '0.8rem', color: 'var(--text-white)', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <i className={`fa-solid ${
                theme === 'light' ? 'fa-sun text-amber' : 
                theme === 'dark' ? 'fa-moon text-indigo' : 
                'fa-cloud-sun text-rose'
              }`}></i>
              <span className="capitalize">{theme} Theme</span>
              <i className="fa-solid fa-chevron-down" style={{ fontSize: '0.65rem', marginLeft: '2px' }}></i>
            </button>
            <div className="dropdown-content theme-dropdown-content" style={{ minWidth: '160px', right: 0, left: 'auto' }}>
              <a href="#" onClick={(e) => { e.preventDefault(); setTheme('light'); showToast('Theme Changed', 'Switched to Light Theme', 'success'); }}>
                <i className="fa-solid fa-sun text-amber"></i> Light Theme
              </a>
              <a href="#" onClick={(e) => { e.preventDefault(); setTheme('dark'); showToast('Theme Changed', 'Switched to Dark Theme', 'success'); }}>
                <i className="fa-solid fa-moon text-indigo"></i> Dark Theme
              </a>
              <a href="#" onClick={(e) => { e.preventDefault(); setTheme('sunset'); showToast('Theme Changed', 'Switched to Sunset Theme', 'success'); }}>
                <i className="fa-solid fa-cloud-sun text-rose"></i> Sunset Warmth
              </a>
            </div>
          </div>

          <div className="role-nav">
            <button 
              className={`nav-role-btn ${activeView === 'landing' ? 'active' : ''}`}
              onClick={() => handleRoleChange('landing')}
            >
              <i className="fa-solid fa-globe"></i> Landing
            </button>
            <button 
              className={`nav-role-btn ${activeView === 'client' ? 'active' : ''}`}
              onClick={() => handleRoleChange('client')}
            >
              <i className="fa-solid fa-briefcase"></i> Client Hub
            </button>
            <button 
              className={`nav-role-btn ${activeView === 'reviewer' ? 'active' : ''}`}
              onClick={() => handleRoleChange('reviewer')}
            >
              <i className="fa-solid fa-user-ninja"></i> Reviewer Hub
            </button>
            <button 
              className={`nav-role-btn ${activeView === 'admin' ? 'active' : ''}`}
              onClick={() => handleRoleChange('admin')}
            >
              <i className="fa-solid fa-shield-halved"></i> Admin
            </button>
          </div>

          {/* User Header Widget */}
          {activeView !== 'landing' && (
            <div className="header-user-status" id="header-profile-widget">
              <div className="status-avatar">
                <i className={`fa-solid ${activeView === 'client' ? 'fa-building' : activeView === 'admin' ? 'fa-user-gear' : 'fa-user'}`}></i>
              </div>
              <div className="status-details">
                <span className="user-name">
                  {activeView === 'client' && 'Stripe Channel'}
                  {activeView === 'reviewer' && state.currentUser.name}
                  {activeView === 'admin' && 'Sentinel Admin'}
                </span>
                <div className="user-meta-scores">
                  <span className="meta-score text-success">
                    <i className="fa-solid fa-coins"></i>
                    <span id="header-wallet">
                      {activeView === 'client' && '1,080.00'}
                      {activeView === 'reviewer' && state.currentUser.balance.toFixed(2)}
                      {activeView === 'admin' && '64,200.00'}
                    </span>
                  </span>
                  <span className="meta-score text-indigo">
                    <i className="fa-solid fa-star"></i>
                    <span id="header-reputation">
                      {activeView === 'client' && '99.9'}
                      {activeView === 'reviewer' && state.currentUser.reputation.toFixed(1)}
                      {activeView === 'admin' && '100.0'}
                    </span>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* VIEWPORT ROUTER CONTENT */}
      <main className="main-content">
        {activeView === 'landing' && (
          <LandingPage 
            state={state} 
            setView={handleRoleChange} 
            showToast={showToast} 
          />
        )}
        {activeView === 'client' && (
          <ClientPortal 
            state={state} 
            setState={setState} 
            showToast={showToast} 
          />
        )}
        {activeView === 'reviewer' && (
          <ReviewerPortal 
            state={state} 
            setState={setState} 
            showToast={showToast} 
          />
        )}
        {activeView === 'admin' && (
          <AdminPortal 
            state={state} 
            setState={setState} 
            showToast={showToast} 
          />
        )}
      </main>

      {/* TOAST CONTAINER */}
      <div className="toast-container" id="toast-container">
        {toasts.map((t) => {
          let iconClass = 'fa-info-circle text-indigo';
          if (t.iconType === 'success') iconClass = 'fa-check-circle text-emerald';
          if (t.iconType === 'warning') iconClass = 'fa-exclamation-triangle text-amber';
          if (t.iconType === 'error') iconClass = 'fa-times-circle text-rose';
          if (t.iconType === 'fraud') iconClass = 'fa-user-ninja text-rose';

          return (
            <div key={t.id} className={`toast ${t.removing ? 'removing' : ''}`}>
              <div className="toast-icon">
                <i className={`fa-solid ${iconClass}`}></i>
              </div>
              <div className="toast-body">
                <h5>{t.title}</h5>
                <p>{t.message}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
