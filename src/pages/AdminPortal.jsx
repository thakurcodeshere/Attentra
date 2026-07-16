import { useState } from 'react';

// Helper: Score Ring SVG Component
function ScoreRing({ value, max = 100, color = 'var(--primary)', size = 120, label = 'Score' }) {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const percent = Math.min(value / max, 1);
  const offset = circumference - (percent * circumference);

  return (
    <div className="analytics-score-ring" style={{ width: size, height: size, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} viewBox="0 0 120 120" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="60" cy="60" r={radius} strokeWidth="8" fill="transparent" stroke="rgba(255, 255, 255, 0.03)" />
        <circle
          cx="60" cy="60" r={radius}
          strokeWidth="8"
          fill="transparent"
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
        />
      </svg>
      <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <span style={{ fontSize: '1.4rem', fontWeight: '700', fontFamily: "'Space Grotesk', sans-serif", color: '#fff' }}>{value}{max === 100 ? '%' : ''}</span>
        <span style={{ fontSize: '0.62rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: '2px' }}>{label}</span>
      </div>
    </div>
  );
}

export default function AdminPortal({ state, setState, showToast }) {
  const [activeTab, setActiveTab] = useState('admin-overview');

  // Search & Filter state for Client Hub
  const [searchQuery, setSearchQuery] = useState('');
  const [campFilter, setCampFilter] = useState('all');

  // Webhook simulator state
  const [selectedWebhookCampId, setSelectedWebhookCampId] = useState(state.campaigns[0]?.id || '');
  const [isSimulatingWebhook, setIsSimulatingWebhook] = useState(false);
  const [webhookLogs, setWebhookLogs] = useState([]);

  // Fraud table filter state
  const [fraudSeverityFilter, setFraudSeverityFilter] = useState('All');
  const [expandedFraudLog, setExpandedFraudLog] = useState(null);
  const [isSimulatingFraud, setIsSimulatingFraud] = useState(false);
  const [simulatedFraudType, setSimulatedFraudType] = useState('bot');

  // Client audit detail card
  const [activeAuditCampId, setActiveAuditCampId] = useState(null);

  // Configuration parameter inputs
  const [minChars, setMinChars] = useState(() => Number(localStorage.getItem('attentra_min_chars') || '30'));
  const [botThreshold, setBotThreshold] = useState(() => Number(localStorage.getItem('attentra_bot_threshold') || '85'));
  const [keystrokeMin, setKeystrokeMin] = useState(() => Number(localStorage.getItem('attentra_keystroke_min') || '30'));
  const [payoutMultiplier, setPayoutMultiplier] = useState(() => Number(localStorage.getItem('attentra_payout_mult') || '1.0'));
  const [isSavingConfigs, setIsSavingConfigs] = useState(false);

  // Operations activity feed
  const [activityFeed, setActivityFeed] = useState([
    { id: 1, time: '12:15:30', text: "Telemetry check passed for reviewer 'rev-102'.", type: 'teal' },
    { id: 2, time: '12:12:04', text: "Stripe Escrow deposited $450.00 for campaign camp-001.", type: 'indigo' },
    { id: 3, time: '11:44:12', text: "Auditor 'rev-903' triggered Tab Focus Loss warning.", type: 'amber' },
    { id: 4, time: '11:02:18', text: "Bot attack spoofing demographics blocked.", type: 'rose' }
  ]);

  // Actions
  const handlePurgeLogs = () => {
    setState(prev => ({
      ...prev,
      fraudLogs: []
    }));
    showToast('Security Log Purged', 'All historical anti-fraud intercept logs cleared.', 'success');
  };

  const handleSaveParams = () => {
    setIsSavingConfigs(true);
    setTimeout(() => {
      localStorage.setItem('attentra_min_chars', minChars.toString());
      localStorage.setItem('attentra_bot_threshold', botThreshold.toString());
      localStorage.setItem('attentra_keystroke_min', keystrokeMin.toString());
      localStorage.setItem('attentra_payout_mult', payoutMultiplier.toString());
      
      // Update global parameters if needed or log
      setActivityFeed(prev => [
        { id: Date.now(), time: new Date().toTimeString().split(' ')[0], text: "System variables updated. New validation rules loaded.", type: 'amber' },
        ...prev
      ]);
      setIsSavingConfigs(false);
      showToast('Parameters Locked', 'Validation thresholds and payouts successfully re-calibrated.', 'success');
    }, 800);
  };

  // Add demo credits to Client escrow in Admin view
  const handleAddDemoCredits = (campId) => {
    setState(prev => {
      const updatedCampaigns = prev.campaigns.map(camp => {
        if (camp.id === campId) {
          return {
            ...camp,
            budget: camp.budget + 150.00
          };
        }
        return camp;
      });
      return {
        ...prev,
        campaigns: updatedCampaigns
      };
    });

    setActivityFeed(prev => [
      { id: Date.now(), time: new Date().toTimeString().split(' ')[0], text: `Deposited $150.00 Admin Credits into escrow for campaign ${campId}.`, type: 'teal' },
      ...prev
    ]);

    showToast('Credits Injected', 'Workspace campaign budget increased by $150.00.', 'success');
  };

  // Pause / Resume campaign
  const handleToggleCampaignStatus = (campId, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'paused' : 'active';
    setState(prev => {
      const updatedCampaigns = prev.campaigns.map(camp => {
        if (camp.id === campId) {
          return { ...camp, status: nextStatus };
        }
        return camp;
      });
      return {
        ...prev,
        campaigns: updatedCampaigns
      };
    });

    setActivityFeed(prev => [
      { id: Date.now(), time: new Date().toTimeString().split(' ')[0], text: `Campaign '${campId}' state toggled to '${nextStatus}'.`, type: 'indigo' },
      ...prev
    ]);

    showToast('Campaign Status Changed', `Campaign ${campId} is now ${nextStatus}.`, 'info');
  };

  // Release Escrow & Complete campaign
  const handleReleaseEscrow = (campId) => {
    setState(prev => {
      const updatedCampaigns = prev.campaigns.map(camp => {
        if (camp.id === campId) {
          return { ...camp, status: 'completed' };
        }
        return camp;
      });
      return {
        ...prev,
        campaigns: updatedCampaigns
      };
    });

    setActivityFeed(prev => [
      { id: Date.now(), time: new Date().toTimeString().split(' ')[0], text: `Released escrow budget for campaign ${campId}. Quota locked.`, type: 'teal' },
      ...prev
    ]);

    showToast('Escrow Released', `Settled reviewer payouts for campaign ${campId}.`, 'success');
  };

  // Webhook dispatcher simulator
  const handleTriggerWebhook = () => {
    const camp = state.campaigns.find(c => c.id === selectedWebhookCampId);
    if (!camp) return;

    setIsSimulatingWebhook(true);
    setWebhookLogs([`Connecting to server callback at stripe.com webhook endpoint...`]);

    setTimeout(() => {
      setWebhookLogs(prev => [
        ...prev,
        `> Connected. Initiating HTTP POST request...`,
        `> Dispatching secure payload...`
      ]);
    }, 400);

    setTimeout(() => {
      const headers = {
        "POST": "/attentra-hook HTTP/1.1",
        "Host": "api.stripe.com",
        "Content-Type": "application/json",
        "X-Attentra-Signature": `sha256=${Array.from({ length: 48 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        "User-Agent": "Attentra-Security-Engine/2.4.0"
      };

      const payload = {
        event: "campaign.telemetry_milestone",
        timestamp: new Date().toISOString(),
        data: {
          campaign_id: camp.id,
          title: camp.title,
          type: camp.type,
          attention_score: camp.attentionScore || 90,
          net_sentiment: camp.netSentiment || "Positive",
          submissions_captured: camp.submissionsCount,
          escrow_budget: camp.budget,
          payout_rate: camp.payoutPerReview
        }
      };

      setWebhookLogs(prev => [
        ...prev,
        `\n[HTTP REQUEST HEADERS]\n${Object.entries(headers).map(([k, v]) => `${k}: ${v}`).join('\n')}`,
        `\n[PAYLOAD BODY]\n${JSON.stringify(payload, null, 2)}`,
        `\n> Dispatching webhook packet... Success.`,
        `> Connection closed. Status 200 OK. Response: { "status": "acknowledged", "processed": true }`
      ]);

      setActivityFeed(prev => [
        { id: Date.now(), time: new Date().toTimeString().split(' ')[0], text: `Webhook dispatch event fired for campaign ${camp.id} (Status 200).`, type: 'indigo' },
        ...prev
      ]);

      setIsSimulatingWebhook(false);
      showToast('Webhook Fired', 'Telemetry milestone event dispatched successfully.', 'success');
    }, 1200);
  };

  // Simulated fraud log generator
  const handleSimulateFraud = () => {
    setIsSimulatingFraud(true);
    showToast('Telemetry Sweeper Active', 'Simulating telemetry scanner analysis...', 'info');

    setTimeout(() => {
      let logItem = {};
      if (simulatedFraudType === 'bot') {
        logItem = {
          timestamp: new Date().toISOString(),
          reviewerId: `rev-${Math.floor(100 + Math.random() * 900)}`,
          flag: "Automated Selenium/Playwright Bot Bypass",
          severity: "Critical",
          consequence: "Account Permanently Banned",
          details: "Zero click coordinate variances detected. Keystroke timing patterns match automated headless browser input script (interval delta = 0ms)."
        };
      } else if (simulatedFraudType === 'speed') {
        logItem = {
          timestamp: new Date().toISOString(),
          reviewerId: `rev-${Math.floor(100 + Math.random() * 900)}`,
          flag: "Speed-running Survey Bypass",
          severity: "High",
          consequence: "Task Rejected & Rep -4.5",
          details: "Completed 5-minute telemetry assessment within 6.4 seconds of task assignment. Attention rating score computed at 0%."
        };
      } else if (simulatedFraudType === 'geo') {
        logItem = {
          timestamp: new Date().toISOString(),
          reviewerId: `rev-${Math.floor(100 + Math.random() * 900)}`,
          flag: "VPN/Proxy Geo-Spoofing Intercept",
          severity: "Medium",
          consequence: "Audit Suspended (Awaiting Check)",
          details: "Header request location IP (Germany) mismatches device telemetry timezone clock offsets (America/New_York)."
        };
      }

      setState(prev => ({
        ...prev,
        fraudLogs: [logItem, ...prev.fraudLogs]
      }));

      setActivityFeed(prev => [
        { id: Date.now(), time: new Date().toTimeString().split(' ')[0], text: `Telemetry system flagged security threat: ${logItem.reviewerId} (${logItem.severity}).`, type: 'rose' },
        ...prev
      ]);

      setIsSimulatingFraud(false);
      showToast('Integrity Alert Lock', 'Anti-fraud telemetry logged a mock intercept event.', 'fraud');
    }, 1500);
  };

  // Filtering calculations
  const filteredCampaigns = state.campaigns.filter(camp => {
    const matchesSearch = camp.title.toLowerCase().includes(searchQuery.toLowerCase()) || camp.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = campFilter === 'all' || camp.type === campFilter;
    return matchesSearch && matchesType;
  });

  const filteredFraudLogs = state.fraudLogs.filter(log => {
    if (fraudSeverityFilter === 'All') return true;
    return log.severity.toLowerCase() === fraudSeverityFilter.toLowerCase();
  });

  const activeCampaigns = state.campaigns.filter(c => c.status === 'active').length;
  const totalVolume = state.campaigns.reduce((acc, c) => acc + c.budget, 0);

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}
      <aside className="dashboard-sidebar">
        <div>
          <div className="sidebar-header">
            <i className="fa-solid fa-shield-halved rotating-gear" style={{ marginRight: '6px' }}></i> Sentinel Control
          </div>
          
          <ul className="sidebar-menu">
            <li 
              className={activeTab === 'admin-overview' ? 'active-tab' : ''}
              onClick={() => setActiveTab('admin-overview')}
            >
              <i className="fa-solid fa-chart-line"></i> Telemetry Overview
            </li>
            <li 
              className={activeTab === 'admin-clients' ? 'active-tab' : ''}
              onClick={() => setActiveTab('admin-clients')}
            >
              <i className="fa-solid fa-briefcase"></i> Client Hub
            </li>
            <li 
              className={activeTab === 'admin-fraud' ? 'active-tab' : ''}
              onClick={() => setActiveTab('admin-fraud')}
            >
              <i className="fa-solid fa-triangle-exclamation"></i> Security Intercepts
            </li>
            <li 
              className={activeTab === 'admin-config' ? 'active-tab' : ''}
              onClick={() => setActiveTab('admin-config')}
            >
              <i className="fa-solid fa-sliders"></i> System Parameters
            </li>
          </ul>
        </div>

        <div>
          <div className="sidebar-status-pill">
            <span className="status-bulb pulse-green"></span>
            <span>Security Engine Live</span>
          </div>
          
          <div className="sidebar-footer-stat" style={{ marginTop: '15px' }}>
            <div className="small muted">Admin Active Credit</div>
            <h4 className="text-success" style={{ fontSize: '1.25rem', marginTop: '3px' }}>$64,200.00</h4>
          </div>
        </div>
      </aside>

      {/* DASHBOARD BODY */}
      <div style={{ flex: 1, padding: '0 2.2rem 2.2rem 2.2rem', overflowY: 'auto' }}>
        
        {/* PAGE HEADER WITH GRADIENT ORBS */}
        <div className="admin-page-header">
          <div className="aph-glow-orb aph-orb-1"></div>
          <div className="aph-glow-orb aph-orb-2"></div>
          
          <div className="admin-header-content">
            <div className="header-breadcrumb" style={{ padding: 0, margin: 0, marginBottom: '6px' }}>
              <span className="muted small">Control Panel</span>
              <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.55rem', margin: '0 8px', color: 'var(--text-muted)' }}></i>
              <span className="active-crumb text-indigo small" style={{ fontWeight: 600 }}>
                {activeTab === 'admin-overview' && 'System Telemetry'}
                {activeTab === 'admin-clients' && 'Client Hub & Escrows'}
                {activeTab === 'admin-fraud' && 'Fraud Intercept Database'}
                {activeTab === 'admin-config' && 'Threshold configurations'}
              </span>
            </div>
            
            <h2 className="gradient-text" style={{ fontSize: '2rem', fontWeight: 700 }}>
              {activeTab === 'admin-overview' && 'Sentinel System Dashboard'}
              {activeTab === 'admin-clients' && 'Client Campaign Hub'}
              {activeTab === 'admin-fraud' && 'Telemetry Threat database'}
              {activeTab === 'admin-config' && 'Threshold Configurations'}
            </h2>
            <p className="muted small">
              {activeTab === 'admin-overview' && 'Real-time telemetry feeds, validation engines, and system integrity indexes.'}
              {activeTab === 'admin-clients' && 'Audit client study campaigns, release escrow payouts, and manage webhook callbacks.'}
              {activeTab === 'admin-fraud' && 'Browse, inspect, and simulate anti-fraud security filters and database logs.'}
              {activeTab === 'admin-config' && 'Fine-tune validation filters, minimum quality checks, and billing multipliers.'}
            </p>
          </div>
        </div>

        {/* 1. OVERVIEW & TELEMETRY SUB-TAB */}
        {activeTab === 'admin-overview' && (
          <div className="sub-tab active-sub-tab fade-in-up">
            
            {/* KPI METRICS ROW */}
            <div className="admin-stats-grid">
              <div className="admin-stat-card card-volume fade-in-up stagger-1">
                <div className="admin-stat-icon-wrapper">
                  <i className="fa-solid fa-coins"></i>
                </div>
                <div className="admin-stat-label">Total Escrow Volume</div>
                <div className="admin-stat-val">${totalVolume.toFixed(2)}</div>
                <div className="admin-stat-meta text-emerald">
                  <i className="fa-solid fa-arrow-trend-up"></i> +12% this month
                </div>
              </div>

              <div className="admin-stat-card card-active fade-in-up stagger-2">
                <div className="admin-stat-icon-wrapper">
                  <i className="fa-solid fa-layer-group"></i>
                </div>
                <div className="admin-stat-label">Active Campaigns</div>
                <div className="admin-stat-val">{activeCampaigns} studies</div>
                <div className="admin-stat-meta text-indigo">
                  <i className="fa-solid fa-wave-square"></i> Real-time tracking
                </div>
              </div>

              <div className="admin-stat-card card-fraud fade-in-up stagger-3">
                <div className="admin-stat-icon-wrapper">
                  <i className="fa-solid fa-user-ninja"></i>
                </div>
                <div className="admin-stat-label">Fraud Telemetry Blocks</div>
                <div className="admin-stat-val">{state.systemStats.fraudAttemptsBlocked}</div>
                <div className="admin-stat-meta text-rose">
                  <i className="fa-solid fa-shield-virus"></i> 99.8% bot block accuracy
                </div>
              </div>

              <div className="admin-stat-card card-roster fade-in-up stagger-4">
                <div className="admin-stat-icon-wrapper">
                  <i className="fa-solid fa-users"></i>
                </div>
                <div className="admin-stat-label">Active Reviewers</div>
                <div className="admin-stat-val">{state.systemStats.totalReviewers.toLocaleString()}</div>
                <div className="admin-stat-meta text-amber">
                  <i className="fa-solid fa-user-check"></i> 142 matched today
                </div>
              </div>
            </div>

            {/* CHARTS AND ACTIVITY ROW */}
            <div className="grid-2-1">
              <div className="card border-glow-indigo">
                <div className="card-header-row" style={{ border: 'none', background: 'transparent', padding: '0 0 1rem 0' }}>
                  <h3>System Status & Activity Feed</h3>
                  <span className="badge badge-emerald">Live Updates</span>
                </div>
                
                <ul className="live-activity-list">
                  {activityFeed.map((act) => (
                    <li key={act.id} className="live-activity-item">
                      <span className={`activity-badge color-${act.type}`}></span>
                      <span className="activity-time">{act.time}</span>
                      <span style={{ color: '#fff' }}>{act.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="card admin-score-card">
                <h3 className="margin-bottom-md">System Integrity INDEX</h3>
                <ScoreRing value={100} label="Integrity" color="var(--emerald)" size={130} />
                <p className="muted small margin-top-sm" style={{ padding: '0 10px' }}>
                  All validator servers operating at peak capability. Anti-fraud thresholds are green.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 2. CLIENT HUB SUB-TAB */}
        {activeTab === 'admin-clients' && (
          <div className="sub-tab active-sub-tab fade-in-up">
            
            {/* SEARCH AND TYPE FILTER */}
            <div className="admin-search-bar-row">
              <input 
                type="text" 
                className="admin-search-input" 
                placeholder="Search campaigns by name, client ID or campaign ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <select 
                className="admin-filter-select"
                value={campFilter}
                onChange={(e) => setCampFilter(e.target.value)}
              >
                <option value="all">All Study Types</option>
                <option value="website">Website Hotspot</option>
                <option value="video">Video Retention</option>
                <option value="thumbnail">Thumbnail A/B</option>
              </select>
            </div>

            {/* SEARCH RESULTS CAMPAIGN GRID */}
            <div className="campaign-grid-admin">
              {filteredCampaigns.length === 0 ? (
                <div className="card text-center" style={{ gridColumn: '1 / -1', padding: '3rem' }}>
                  <i className="fa-solid fa-folder-open muted" style={{ fontSize: '2.5rem', marginBottom: '1rem' }}></i>
                  <p className="muted">No client study campaigns matched your filter criteria.</p>
                </div>
              ) : (
                filteredCampaigns.map((camp) => {
                  const quota = Math.ceil(camp.budget / camp.payoutPerReview);
                  const progressPercent = Math.min((camp.submissionsCount / quota) * 100, 100);

                  return (
                    <div 
                      key={camp.id} 
                      className={`campaign-admin-card ${camp.status === 'paused' ? 'paused' : ''} ${activeAuditCampId === camp.id ? 'border-glow-indigo' : ''}`}
                    >
                      <div>
                        <div className="camp-card-top">
                          <span className={`camp-card-type ${camp.type}`}>{camp.type}</span>
                          <span className="small muted"><strong>{camp.id}</strong></span>
                        </div>
                        
                        <div className="camp-card-title">{camp.title}</div>
                        
                        <div className="camp-card-client-name">
                          <i className="fa-solid fa-circle-user"></i>
                          <span>Client: {camp.id === 'camp-999' ? 'Attentra Dev' : 'FinTech Launch'}</span>
                        </div>

                        <div className="camp-card-middle">
                          <div className="camp-card-metric-row">
                            <span className="muted">Quota Progress:</span>
                            <span><strong>{camp.submissionsCount}</strong> / {quota} reviews</span>
                          </div>
                          
                          <div className="camp-card-progress-bar">
                            <div className="camp-card-progress-fill" style={{ width: `${progressPercent}%` }}></div>
                          </div>

                          <div className="camp-card-metric-row" style={{ marginTop: '12px' }}>
                            <span className="muted">Escrow Budget:</span>
                            <span className="text-emerald" style={{ fontWeight: 700 }}>${camp.budget.toFixed(2)}</span>
                          </div>
                          
                          <div className="camp-card-metric-row">
                            <span className="muted">Payout Rate:</span>
                            <span>${camp.payoutPerReview.toFixed(2)} / review</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        {/* Expandable audit metadata button */}
                        {activeAuditCampId === camp.id && (
                          <div className="small" style={{ background: 'rgba(255,255,255,0.02)', padding: '8px', borderRadius: '6px', marginBottom: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div className="margin-bottom-xs"><strong>Audience:</strong> {camp.targetAudience.occupation} ({camp.targetAudience.geo})</div>
                            <div className="margin-bottom-xs"><strong>Score:</strong> {camp.attentionScore || 0}% | <strong>Sentiment:</strong> {camp.netSentiment || 'Neutral'}</div>
                            <div className="muted" style={{ fontSize: '0.72rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}><strong>Obj:</strong> {camp.objective}</div>
                          </div>
                        )}

                        <div className="camp-card-actions">
                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => setActiveAuditCampId(activeAuditCampId === camp.id ? null : camp.id)}
                            style={{ flex: 1 }}
                          >
                            <i className="fa-solid fa-magnifying-glass"></i> {activeAuditCampId === camp.id ? 'Close' : 'Audit'}
                          </button>

                          <button 
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleAddDemoCredits(camp.id)}
                            title="Add $150.00 Credits to Escrow"
                            style={{ flex: 1, color: 'var(--emerald)' }}
                          >
                            <i className="fa-solid fa-plus-circle"></i> +$150
                          </button>
                        </div>

                        <div className="camp-card-actions" style={{ marginTop: '6px' }}>
                          {camp.status !== 'completed' ? (
                            <>
                              <button 
                                className={`btn btn-sm ${camp.status === 'active' ? 'btn-secondary' : 'btn-indigo'}`}
                                onClick={() => handleToggleCampaignStatus(camp.id, camp.status)}
                                style={{ flex: 1 }}
                              >
                                <i className={`fa-solid ${camp.status === 'active' ? 'fa-pause' : 'fa-play'}`}></i>
                                {camp.status === 'active' ? ' Pause' : ' Resume'}
                              </button>

                              <button 
                                className="btn btn-indigo btn-sm"
                                onClick={() => handleReleaseEscrow(camp.id)}
                                style={{ flex: 1, background: 'linear-gradient(135deg, var(--emerald), #06b6d4)' }}
                              >
                                <i className="fa-solid fa-check-double"></i> Complete
                              </button>
                            </>
                          ) : (
                            <span className="small muted text-center" style={{ width: '100%', display: 'block', padding: '6px' }}>
                              <i className="fa-solid fa-archive"></i> Study Archival Settled
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* WEBHOOK SIMULATOR PANEL */}
            <div className="webhook-sandbox-card">
              <h3 style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <i className="fa-solid fa-network-wired text-indigo"></i>
                Client Webhooks Sandbox Simulator
              </h3>
              <p className="muted small">Select an active study campaign and simulate sending a telemetry milestone HTTP request callback.</p>
              
              <div style={{ display: 'flex', gap: '12px', marginTop: '1rem', alignItems: 'center' }}>
                <select 
                  className="admin-filter-select"
                  value={selectedWebhookCampId}
                  onChange={(e) => setSelectedWebhookCampId(e.target.value)}
                  style={{ minWidth: '280px' }}
                >
                  {state.campaigns.map(c => (
                    <option key={c.id} value={c.id}>{c.id} - {c.title.substring(0, 32)}...</option>
                  ))}
                </select>

                <button 
                  className="btn btn-primary"
                  onClick={handleTriggerWebhook}
                  disabled={isSimulatingWebhook}
                  style={{ padding: '10px 16px', fontSize: '0.88rem' }}
                >
                  {isSimulatingWebhook ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin"></i> Dispatching...
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-paper-plane"></i> Dispatch Telemetry Webhook
                    </>
                  )}
                </button>
              </div>

              {/* Console log window */}
              {webhookLogs.length > 0 && (
                <div className="admin-terminal-output fade-in-up">
                  <div className="terminal-header-line">
                    <span>ATTENTRA TELEMETRY CALLBACK DECK</span>
                    <span>REST WEBHOOK LOGS</span>
                  </div>
                  {webhookLogs.map((log, idx) => (
                    <pre key={idx} style={{ whiteSpace: 'pre-wrap', margin: 0 }}>{log}</pre>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3. SECURITY INTERCEPTS TAB */}
        {activeTab === 'admin-fraud' && (
          <div className="sub-tab active-sub-tab fade-in-up">
            
            {/* FRAUD SIMULATION SCANNER AND CONFIGS */}
            <div className="fraud-simulator-grid">
              
              {/* RADAR SCAN GRAPH */}
              <div className="card radar-card border-glow-rose">
                <h3 className="margin-bottom-md">Auditor Telemetry Scanner</h3>
                
                <div className={`radar-scan-container ${isSimulatingFraud ? 'scanning' : ''}`}>
                  <div className="radar-sweep"></div>
                  <div className="radar-crosshair-h"></div>
                  <div className="radar-crosshair-v"></div>
                  <div className="radar-blip blip-1"></div>
                  <div className="radar-blip blip-2"></div>
                </div>

                <div>
                  <h4 className="radar-text" style={{ color: isSimulatingFraud ? 'var(--rose)' : '#fff' }}>
                    {isSimulatingFraud ? 'SCANNING PACKETS...' : 'SYSTEM SECURE'}
                  </h4>
                  <p className="muted small margin-top-sm">
                    {isSimulatingFraud ? 'Parsing browser fingerprints...' : 'Integrity algorithms are tracking telemetry inputs.'}
                  </p>
                </div>
              </div>

              {/* ATTACK SIMULATOR INTERFACE */}
              <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h3 className="margin-bottom-md" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <i className="fa-solid fa-bug-slash text-rose"></i>
                    Bypass Attempt Simulation Room
                  </h3>
                  <p className="muted small">
                    Perform validation audits against the telemetry engine by triggering simulated fraudulent activities. This allows testing of reactive notification components.
                  </p>
                  
                  <div className="campaign-type-selector" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginTop: '1.25rem', gap: '8px' }}>
                    <div 
                      className={`campaign-type-option ${simulatedFraudType === 'bot' ? 'type-selected' : ''}`}
                      onClick={() => setSimulatedFraudType('bot')}
                      style={{ border: simulatedFraudType === 'bot' ? '1px solid var(--rose)' : undefined, background: simulatedFraudType === 'bot' ? 'rgba(244,63,94,0.06)' : undefined, padding: '12px' }}
                    >
                      <i className="fa-solid fa-robot text-rose"></i>
                      <span className="type-name small">Headless Bot</span>
                    </div>

                    <div 
                      className={`campaign-type-option ${simulatedFraudType === 'speed' ? 'type-selected' : ''}`}
                      onClick={() => setSimulatedFraudType('speed')}
                      style={{ border: simulatedFraudType === 'speed' ? '1px solid var(--rose)' : undefined, background: simulatedFraudType === 'speed' ? 'rgba(244,63,94,0.06)' : undefined, padding: '12px' }}
                    >
                      <i className="fa-solid fa-gauge-high text-rose"></i>
                      <span className="type-name small">Speed Run</span>
                    </div>

                    <div 
                      className={`campaign-type-option ${simulatedFraudType === 'geo' ? 'type-selected' : ''}`}
                      onClick={() => setSimulatedFraudType('geo')}
                      style={{ border: simulatedFraudType === 'geo' ? '1px solid var(--rose)' : undefined, background: simulatedFraudType === 'geo' ? 'rgba(244,63,94,0.06)' : undefined, padding: '12px' }}
                    >
                      <i className="fa-solid fa-globe text-rose"></i>
                      <span className="type-name small">Geo Spoof</span>
                    </div>
                  </div>
                </div>

                <div className="margin-top-md">
                  <button 
                    className="btn btn-primary"
                    onClick={handleSimulateFraud}
                    disabled={isSimulatingFraud}
                    style={{ background: 'linear-gradient(135deg, var(--rose), var(--pink))', width: '100%' }}
                  >
                    {isSimulatingFraud ? (
                      <>
                        <i className="fa-solid fa-spinner fa-spin"></i> Analyzing telemetry metrics...
                      </>
                    ) : (
                      <>
                        <i className="fa-solid fa-shield-virus"></i> Inject Simulated Bypass Attempt
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* SEVERITY FILTERS & PURGE */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['All', 'Critical', 'High', 'Medium', 'Low'].map((sev) => (
                  <button
                    key={sev}
                    className={`btn btn-sm ${fraudSeverityFilter === sev ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setFraudSeverityFilter(sev)}
                    style={{
                      background: fraudSeverityFilter === sev ? 'linear-gradient(135deg, var(--rose), var(--pink))' : undefined,
                      boxShadow: fraudSeverityFilter === sev ? '0 4px 12px rgba(244,63,94,0.25)' : undefined
                    }}
                  >
                    {sev} Flags
                  </button>
                ))}
              </div>
              
              <button className="btn btn-secondary btn-sm" onClick={handlePurgeLogs} style={{ color: 'var(--rose)', borderColor: 'rgba(244,63,94,0.2)' }}>
                <i className="fa-solid fa-trash-can"></i> Purge Security Logs
              </button>
            </div>

            {/* FRAUD REGISTRY DATABASE TABLE */}
            <div className="card table-card border-glow-rose">
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
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFraudLogs.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center muted small" style={{ padding: '3rem' }}>
                          <i className="fa-solid fa-user-shield muted" style={{ fontSize: '2rem', display: 'block', marginBottom: '0.8rem' }}></i>
                          No integrity flags registered for "{fraudSeverityFilter}" severity. System operating clean.
                        </td>
                      </tr>
                    ) : (
                      filteredFraudLogs.map((log, idx) => {
                        let severityClass = 'badge-rose';
                        if (log.severity === 'Medium') severityClass = 'badge-purple';
                        if (log.severity === 'Low') severityClass = 'badge-emerald';
                        if (log.severity === 'Critical') severityClass = 'badge-rose'; // glow style

                        const logId = `${log.reviewerId}-${idx}`;
                        const isExpanded = expandedFraudLog === logId;

                        return (
                          <>
                            <tr 
                              key={logId} 
                              style={{ 
                                background: isExpanded ? 'rgba(255, 255, 255, 0.02)' : undefined, 
                                borderBottom: isExpanded ? 'none' : '1px solid var(--border-subtle)' 
                              }}
                            >
                              <td><span className="small muted">{new Date(log.timestamp).toLocaleTimeString()}</span></td>
                              <td><strong>{log.reviewerId}</strong></td>
                              <td className="text-rose">
                                <i className="fa-solid fa-triangle-exclamation"></i> {log.flag}
                              </td>
                              <td>
                                <span className={`badge ${severityClass}`} style={{ boxShadow: log.severity === 'Critical' ? '0 0 10px rgba(244,63,94,0.3)' : undefined }}>
                                  {log.severity}
                                </span>
                              </td>
                              <td className="text-amber"><strong>{log.consequence}</strong></td>
                              <td>
                                <button 
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => setExpandedFraudLog(isExpanded ? null : logId)}
                                  style={{ padding: '3px 8px', fontSize: '0.72rem' }}
                                >
                                  {isExpanded ? 'Hide Payload' : 'View Payload'}
                                </button>
                              </td>
                            </tr>

                            {isExpanded && (
                              <tr key={`${logId}-details`} style={{ background: 'rgba(255, 255, 255, 0.02)' }}>
                                <td colSpan="6" style={{ padding: '0 1rem 1rem 1rem' }}>
                                  <div className="expandable-details-card">
                                    <div className="small" style={{ color: 'var(--rose)', fontWeight: 600, marginBottom: '6px' }}>
                                      <i className="fa-solid fa-code"></i> Telemetry Payload Integrity Report
                                    </div>
                                    <p className="small" style={{ color: '#fff', lineHeight: 1.5, marginBottom: '10px' }}>{log.details}</p>
                                    
                                    <div className="small muted" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '4px' }}>
                                      <div><strong>Action Block Type:</strong> {log.flag.split(' ')[0]}</div>
                                      <div><strong>Validator Server:</strong> Node-04_Attentra</div>
                                      <div><strong>Hash Signature:</strong> sha256_x89a1cd9...</div>
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 4. SYSTEM CONFIGURATIONS TAB */}
        {activeTab === 'admin-config' && (
          <div className="sub-tab active-sub-tab fade-in-up">
            <div className="card border-glow-indigo" style={{ maxWidth: '680px', margin: '0 auto' }}>
              <div className="card-header-row" style={{ border: 'none', background: 'transparent', padding: '0 0 1.25rem 0' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fa-solid fa-sliders text-indigo"></i> System Validation Settings
                </h3>
                <span className="badge badge-purple">Real-time parameters</span>
              </div>
              
              {/* SLIDERS AND INPUT CONTROLS */}
              <div className="margin-bottom-md">
                <label className="small muted" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Minimum Feedback Character Length:</span>
                  <strong style={{ color: 'var(--primary)' }}>{minChars} characters</strong>
                </label>
                
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <input 
                    type="range" 
                    min="10" 
                    max="300" 
                    value={minChars} 
                    onChange={(e) => setMinChars(Number(e.target.value))}
                    style={{ flex: 1, accentColor: 'var(--primary)' }}
                  />
                  <input 
                    type="number"
                    value={minChars}
                    onChange={(e) => setMinChars(Number(e.target.value))}
                    style={{ background: 'var(--bg-deep)', border: '1px solid var(--border-subtle)', padding: '5px 10px', width: '70px', color: '#fff', borderRadius: '6px', textAlign: 'center' }}
                  />
                </div>
                <span className="small muted" style={{ display: 'block', marginTop: '6px' }}>
                  Prevents reviewers from submitting low-quality feedback (e.g. "Nice app", "Good").
                </span>
              </div>

              <div className="margin-bottom-md" style={{ borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '1.25rem' }}>
                <label className="small muted" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Bot Scan Scoring Threshold Sensitivity:</span>
                  <strong style={{ color: 'var(--primary)' }}>{botThreshold}% Confidence</strong>
                </label>
                
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <input 
                    type="range" 
                    min="50" 
                    max="99" 
                    value={botThreshold} 
                    onChange={(e) => setBotThreshold(Number(e.target.value))}
                    style={{ flex: 1, accentColor: 'var(--primary)' }}
                  />
                  <input 
                    type="number"
                    value={botThreshold}
                    onChange={(e) => setBotThreshold(Number(e.target.value))}
                    style={{ background: 'var(--bg-deep)', border: '1px solid var(--border-subtle)', padding: '5px 10px', width: '70px', color: '#fff', borderRadius: '6px', textAlign: 'center' }}
                  />
                </div>
                <span className="small muted" style={{ display: 'block', marginTop: '6px' }}>
                  Sets how aggressively the telemetry engine flags keystroke velocity variances as bots.
                </span>
              </div>

              <div className="margin-bottom-md" style={{ borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '1.25rem' }}>
                <label className="small muted" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Keystroke Speed Anomaly trigger:</span>
                  <strong style={{ color: 'var(--primary)' }}>{keystrokeMin} keystrokes/sec</strong>
                </label>
                
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <input 
                    type="range" 
                    min="10" 
                    max="100" 
                    value={keystrokeMin} 
                    onChange={(e) => setKeystrokeMin(Number(e.target.value))}
                    style={{ flex: 1, accentColor: 'var(--primary)' }}
                  />
                  <input 
                    type="number"
                    value={keystrokeMin}
                    onChange={(e) => setKeystrokeMin(Number(e.target.value))}
                    style={{ background: 'var(--bg-deep)', border: '1px solid var(--border-subtle)', padding: '5px 10px', width: '70px', color: '#fff', borderRadius: '6px', textAlign: 'center' }}
                  />
                </div>
                <span className="small muted" style={{ display: 'block', marginTop: '6px' }}>
                  Trigger a flag if a reviewer types faster than this speed threshold (indicates macro tools).
                </span>
              </div>

              <div className="margin-bottom-md" style={{ borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '1.25rem', paddingBottom: '1rem' }}>
                <label className="small muted" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Reviewer Payout Multiplier rate:</span>
                  <strong style={{ color: 'var(--primary)' }}>{payoutMultiplier.toFixed(1)}x Rate</strong>
                </label>
                
                <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
                  <input 
                    type="range" 
                    min="0.5" 
                    max="3.0" 
                    step="0.1"
                    value={payoutMultiplier} 
                    onChange={(e) => setPayoutMultiplier(Number(e.target.value))}
                    style={{ flex: 1, accentColor: 'var(--primary)' }}
                  />
                  <input 
                    type="number"
                    min="0.5"
                    max="3.0"
                    step="0.1"
                    value={payoutMultiplier}
                    onChange={(e) => setPayoutMultiplier(Number(e.target.value))}
                    style={{ background: 'var(--bg-deep)', border: '1px solid var(--border-subtle)', padding: '5px 10px', width: '70px', color: '#fff', borderRadius: '6px', textAlign: 'center' }}
                  />
                </div>
                <span className="small muted" style={{ display: 'block', marginTop: '6px' }}>
                  Workspace budget adjustment factor applied during high matched campaign demand.
                </span>
              </div>

              <button 
                className="btn btn-indigo" 
                onClick={handleSaveParams}
                disabled={isSavingConfigs}
                style={{ width: '100%', padding: '12px', background: 'linear-gradient(135deg, var(--primary), var(--pink))' }}
              >
                {isSavingConfigs ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i> Locking Parameters...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-lock"></i> Save System parameters
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
