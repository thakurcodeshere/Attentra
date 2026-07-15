import { useState } from 'react';

export default function AdminPortal({ state, setState, showToast }) {
  const [activeTab, setActiveTab] = useState('admin-fraud');
  const [minChars, setMinChars] = useState(() => Number(localStorage.getItem('attentra_min_chars') || '30'));

  const handlePurgeLogs = () => {
    setState(prev => ({
      ...prev,
      fraudLogs: []
    }));
    showToast('Security Log Purged', 'All historical anti-fraud intercept logs cleared.', 'success');
  };

  const handleSaveParams = () => {
    localStorage.setItem('attentra_min_chars', minChars.toString());
    showToast('Configurations Saved', 'Validation parameters updated successfully.', 'success');
  };

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}
      <aside className="dashboard-sidebar">
        <div>
          <div className="sidebar-header">
            <i className="fa-solid fa-shield-halved"></i> Security Center
          </div>
          <ul className="sidebar-menu">
            <li 
              className={activeTab === 'admin-fraud' ? 'active-tab' : ''}
              onClick={() => setActiveTab('admin-fraud')}
            >
              <i className="fa-solid fa-triangle-exclamation"></i> Fraud Intercepts
            </li>
            <li 
              className={activeTab === 'admin-config' ? 'active-tab' : ''}
              onClick={() => setActiveTab('admin-config')}
            >
              <i className="fa-solid fa-gears"></i> Threshold Configs
            </li>
          </ul>
        </div>

        <div className="sidebar-footer-stat">
          <div className="small muted">System Integrity</div>
          <h4 className="text-success" style={{ fontSize: '1.25rem', marginTop: '3px' }}>100.0%</h4>
        </div>
      </aside>

      {/* DASHBOARD BODY */}
      <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        
        {/* FRAUD INTERCEPTS SUB-TAB */}
        {activeTab === 'admin-fraud' && (
          <div className="sub-tab active-sub-tab">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2>Anti-Fraud Intercept Registry</h2>
                <p className="muted small">Live logs from the Attentra telemetry validation engine.</p>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={handlePurgeLogs}>
                <i className="fa-solid fa-trash-can"></i> Purge Security Logs
              </button>
            </div>

            <div className="card table-card">
              <div className="card-header-row">
                <h3>Intercept Logs Database</h3>
                <span className="badge badge-rose">Real-time telemetry logs</span>
              </div>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Reviewer ID</th>
                      <th>Flag Triggered</th>
                      <th>Severity</th>
                      <th>Consequence</th>
                      <th>Detailed Telemetry Log</th>
                    </tr>
                  </thead>
                  <tbody>
                    {state.fraudLogs.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center muted small" style={{ padding: '2rem' }}>
                          No integrity flags registered. System operating clean.
                        </td>
                      </tr>
                    ) : (
                      state.fraudLogs.map((log, idx) => {
                        let severityClass = 'badge-rose';
                        if (log.severity === 'Medium') severityClass = 'badge-purple';
                        if (log.severity === 'Low') severityClass = 'badge-emerald';

                        return (
                          <tr key={idx}>
                            <td><span className="small muted">{new Date(log.timestamp).toLocaleTimeString()}</span></td>
                            <td><strong>{log.reviewerId}</strong></td>
                            <td className="text-rose">
                              <i className="fa-solid fa-triangle-exclamation"></i> {log.flag}
                            </td>
                            <td><span className={`badge ${severityClass}`}>{log.severity}</span></td>
                            <td className="text-amber"><strong>{log.consequence}</strong></td>
                            <td className="muted small">{log.details}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* THRESHOLD CONFIGS SUB-TAB */}
        {activeTab === 'admin-config' && (
          <div className="sub-tab active-sub-tab">
            <h2 className="margin-bottom-md">Threshold Configurations</h2>
            <div className="card border-glow-indigo" style={{ maxWidth: '600px' }}>
              <h3 className="margin-bottom-md">Quality validation parameters</h3>
              
              <div className="margin-bottom-md">
                <label className="small muted" style={{ display: 'block', marginBottom: '5px' }}>
                  Minimum Feedback Character Length: <strong>{minChars} chars</strong>
                </label>
                <input 
                  type="number" 
                  className="form-input" 
                  min="10" 
                  max="500" 
                  value={minChars} 
                  onChange={(e) => setMinChars(Number(e.target.value))}
                  style={{ background: 'var(--bg-deep)', border: '1px solid var(--border-subtle)', padding: '10px 14px', width: '100%', color: '#fff', borderRadius: '6px' }}
                />
                <span className="small muted margin-top-sm" style={{ display: 'block' }}>
                  Prevents users from typing short placeholders (e.g. "looks good") during audits.
                </span>
              </div>

              <button className="btn btn-indigo" onClick={handleSaveParams}>
                Save Configuration parameters
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
