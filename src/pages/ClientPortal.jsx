import { useState, useEffect, useRef } from 'react';

const generateCampId = () => `camp-${Math.floor(1000 + Math.random() * 9000)}`;

// Helper: Score Ring SVG Component
function ScoreRing({ value, max = 100, color = 'var(--primary)', size = 120, label = 'Score' }) {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const percent = Math.min(value / max, 1);
  const offset = circumference - (percent * circumference);

  return (
    <div className="analytics-score-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 120 120">
        <circle className="ring-bg" cx="60" cy="60" r={radius} strokeWidth="8" />
        <circle
          className="ring-value"
          cx="60" cy="60" r={radius}
          strokeWidth="8"
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="ring-center-text">
        <span className="ring-val">{value}{max === 100 ? '%' : ''}</span>
        <span className="ring-label">{label}</span>
      </div>
    </div>
  );
}

export default function ClientPortal({ state, setState, showToast }) {
  const [activeTab, setActiveTab] = useState('client-overview');
  const [selectedCampId, setSelectedCampId] = useState(state.campaigns[0]?.id || '');

  // Wizard States
  const [wizardStep, setWizardStep] = useState(1);
  const [wTitle, setWTitle] = useState('');
  const [wUrl, setWUrl] = useState('');
  const [wType, setWType] = useState('website');
  const [wInstructions, setWInstructions] = useState('');
  const [wGeo, setWGeo] = useState('Global Reach');
  const [wOccupation, setWOccupation] = useState('General Public');
  const [wAge, setWAge] = useState('Any');
  const [wDevice, setWDevice] = useState('Any Device');
  const [wSampleSize, setWSampleSize] = useState(50);
  const [wTitleError, setWTitleError] = useState(false);
  const [wUrlError, setWUrlError] = useState(false);

  // Settings inputs
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Analyst');
  const [webhookInput, setWebhookInput] = useState(state.developerSettings?.webhookUrl || '');
  const [billingTier, setBillingTier] = useState('Growth');
  const [testingWebhook, setTestingWebhook] = useState(false);

  // Canvas Refs
  const videoCanvasRef = useRef(null);
  const clickmapCanvasRef = useRef(null);

  // Math variables for Wizard Budget
  let wBaseRate = 1.50;
  if (wOccupation === 'Developers' || wOccupation === 'Professionals') wBaseRate = 5.00;
  else if (wOccupation === 'Gamers') wBaseRate = 2.50;
  else if (wOccupation === 'Students') wBaseRate = 2.00;

  const wPlatformFee = 0.50;
  const wCostPerReview = wBaseRate + wPlatformFee;
  const wTotalBudget = wSampleSize * wCostPerReview;

  let wOnlineMatch = 1420;
  if (wOccupation === 'Developers') wOnlineMatch = 342;
  else if (wOccupation === 'Gamers') wOnlineMatch = 890;
  else if (wOccupation === 'Professionals') wOnlineMatch = 412;
  else if (wOccupation === 'Students') wOnlineMatch = 1105;

  // Sync selected campaign when ID changes
  const activeCamp = state.campaigns.find(c => c.id === selectedCampId) || state.campaigns[0];

  // Draw custom high-fidelity line chart on HTML5 Canvas for Video retention
  useEffect(() => {
    if (activeTab === 'client-analytics' && activeCamp?.type === 'video' && videoCanvasRef.current) {
      const canvas = videoCanvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let data = [100, 98, 96, 92, 85, 78, 60, 48, 44, 43, 42, 42, 41];
      if (activeCamp.id !== 'camp-002') {
        data = [100, 99, 95, 93, 91, 88, 86, 85, 84, 82, 82, 80, 79];
      }

      const padding = 40;
      const width = canvas.width - padding * 2;
      const height = canvas.height - padding * 2;

      // Draw Grid Lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 4; i++) {
        const y = padding + (height / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(canvas.width - padding, y);
        ctx.stroke();

        ctx.fillStyle = '#889';
        ctx.font = '9px sans-serif';
        ctx.fillText(`${100 - i * 25}%`, padding - 28, y + 3);
      }

      // Draw Plot Line
      const points = data.map((val, idx) => {
        const x = padding + (width / (data.length - 1)) * idx;
        const y = padding + height - (height * (val / 100));
        return { x, y, val };
      });

      // Fill area under line
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, 'rgba(130, 80, 250, 0.15)');
      gradient.addColorStop(1, 'rgba(130, 80, 250, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(points[0].x, padding + height);
      points.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.lineTo(points[points.length - 1].x, padding + height);
      ctx.closePath();
      ctx.fill();

      // Stroke Line
      ctx.strokeStyle = '#8250fa';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      points.forEach(p => ctx.lineTo(p.x, p.y));
      ctx.stroke();

      // Draw Dots
      points.forEach((p, idx) => {
        ctx.fillStyle = '#8250fa';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
        ctx.fill();

        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, 2 * Math.PI);
        ctx.fill();

        // X Axis label
        if (idx % 2 === 0) {
          ctx.fillStyle = '#889';
          ctx.fillText(`${idx * 5}s`, p.x - 6, padding + height + 16);
        }
      });
    }
  }, [activeTab, selectedCampId, activeCamp]);

  // Draw clickmap coordinates heatmap
  useEffect(() => {
    if (activeTab === 'client-analytics' && activeCamp?.type === 'website' && clickmapCanvasRef.current) {
      const canvas = clickmapCanvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const reviews = activeCamp.reviews.filter(r => r.details?.clickX !== undefined);
      reviews.forEach((r, idx) => {
        const x = (r.details.clickX / 600) * canvas.width;
        const y = (r.details.clickY / 400) * canvas.height;

        // Draw heat radius
        const grad = ctx.createRadialGradient(x, y, 2, x, y, 22);
        grad.addColorStop(0, 'rgba(130, 80, 250, 0.7)');
        grad.addColorStop(0.5, 'rgba(244, 63, 94, 0.35)');
        grad.addColorStop(1, 'rgba(244, 63, 94, 0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(x, y, 22, 0, 2 * Math.PI);
        ctx.fill();

        // Draw center pin dot
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = 'var(--primary)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 9px sans-serif';
        ctx.fillText(idx + 1, x + 6, y - 4);
      });
    }
  }, [activeTab, selectedCampId, activeCamp]);

  // Actions
  const handleLaunchCampaign = () => {
    let hasError = false;
    if (!wTitle) {
      setWTitleError(true);
      hasError = true;
    } else {
      setWTitleError(false);
    }
    if (!wUrl) {
      setWUrlError(true);
      hasError = true;
    } else {
      setWUrlError(false);
    }

    if (hasError) {
      showToast('Validation Error', 'Please fill in all required highlighted fields.', 'warning');
      return;
    }

    const newCamp = {
      id: generateCampId(),
      title: wTitle,
      type: wType,
      status: 'active',
      budget: wTotalBudget,
      payoutPerReview: wBaseRate,
      objective: wInstructions || `Evaluate ${wType} attention structures.`,
      url: wUrl,
      targetAudience: {
        occupation: wOccupation,
        ageRange: wAge,
        geo: wGeo,
        device: wDevice
      },
      submissionsCount: 0,
      attentionScore: 0,
      netSentiment: 'Neutral',
      reviews: [],
      aiSummary: {
        positives: 'Escrow locked successfully. Telemetry engines active.',
        negatives: 'Awaiting first reviewer telemetry inputs...'
      },
      actionItems: []
    };

    setState(prev => ({
      ...prev,
      campaigns: [...prev.campaigns, newCamp]
    }));

    showToast('Escrow locked & launched', `'${wTitle}' is now live for reviewers.`, 'success');

    // Reset form
    setWTitle('');
    setWUrl('');
    setWInstructions('');
    setWizardStep(1);
    setActiveTab('client-overview');
  };

  const handleRollApiKey = () => {
    const randomHex = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const newKey = `sec_att_live_${randomHex}`;
    setState(prev => ({
      ...prev,
      developerSettings: { ...prev.developerSettings, apiKey: newKey }
    }));
    showToast('Credentials Rotated', 'Your active secret API key was rolled successfully.', 'success');
  };

  const handleSaveWebhook = () => {
    setState(prev => ({
      ...prev,
      developerSettings: { ...prev.developerSettings, webhookUrl: webhookInput }
    }));
    showToast('Webhook Saved', 'Webhook endpoint URL updated.', 'success');
  };

  const handleSendTestWebhook = () => {
    if (!webhookInput) {
      showToast('Webhook field empty', 'Please configure webhook endpoint before testing.', 'warning');
      return;
    }
    setTestingWebhook(true);
    setTimeout(() => {
      setTestingWebhook(false);
      showToast('Webhook Event Fired', 'Test payload successfully dispatched (Status 200 OK).', 'success');
    }, 1000);
  };

  const handleInviteTeam = () => {
    if (!inviteEmail) {
      showToast('Email Empty', 'Please specify a coworker email to invite.', 'warning');
      return;
    }
    const newMember = {
      email: inviteEmail,
      role: inviteRole,
      status: 'Pending Invitation',
      joinedDate: 'N/A'
    };
    setState(prev => ({
      ...prev,
      teamRoster: [...prev.teamRoster, newMember]
    }));
    setInviteEmail('');
    showToast('Invitation Dispatched', `Invited ${inviteEmail} as Workspace ${inviteRole}.`, 'success');
  };

  const handleChangeBillingTier = (tier) => {
    setBillingTier(tier);
    let amount = 149.00;
    if (tier === 'Scale') amount = 499.00;
    if (tier === 'Enterprise') amount = 1200.00;

    const newInvoice = {
      id: `inv-${Math.floor(1000 + Math.random() * 9000)}`,
      period: 'July 15, 2026 - August 15, 2026',
      amount: amount,
      status: 'Paid',
      receiptUrl: '#'
    };

    setState(prev => ({
      ...prev,
      billingInvoices: [newInvoice, ...prev.billingInvoices]
    }));

    showToast('Billing Upgraded', `Workspace migrated to ${tier} subscription tier.`, 'success');
  };

  const handleExportJSON = () => {
    if (!activeCamp) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activeCamp, null, 2));
    const dlAnchorElem = document.createElement('a');
    dlAnchorElem.setAttribute('href', dataStr);
    dlAnchorElem.setAttribute('download', `attentra_analytics_${activeCamp.id}.json`);
    dlAnchorElem.click();
    showToast('Export Successful', 'JSON file metrics downloaded.', 'success');
  };

  // Helper for tab-specific headers
  const tabTitles = {
    'client-overview': { title: 'Dashboard Overview', subtitle: 'Real-time campaign metrics and performance insights', crumb: 'Overview' },
    'client-wizard': { title: 'Create Campaign', subtitle: 'Launch a new attention-tracking study in minutes', crumb: 'New Campaign' },
    'client-analytics': { title: 'Campaign Analytics', subtitle: `Deep-dive into ${activeCamp?.title || 'campaign'} telemetry`, crumb: 'Analytics' },
    'client-apikeys': { title: 'Developer Credentials', subtitle: 'Manage REST API keys and webhook integrations', crumb: 'API & Webhooks' },
    'client-team': { title: 'Team Workspace', subtitle: 'Manage collaborators and access roles', crumb: 'Team Members' },
    'client-billing': { title: 'Subscriptions & Billing', subtitle: 'Manage your plan and view payment history', crumb: 'Subscriptions' },
  };

  const currentHeader = tabTitles[activeTab] || tabTitles['client-overview'];



  const activeCampaigns = state.campaigns.filter(c => c.status === 'active');
  const totalSubmissions = state.campaigns.reduce((acc, c) => acc + c.submissionsCount, 0);
  const avgAttention = state.campaigns.length > 0
    ? Math.round(state.campaigns.reduce((acc, c) => acc + (c.attentionScore || 0), 0) / state.campaigns.length)
    : 0;

  // Get initials helper
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Get avatar class for role
  const getAvatarClass = (role) => {
    const r = role.toLowerCase();
    if (r === 'owner') return 'avatar-owner';
    if (r === 'admin') return 'avatar-admin';
    if (r === 'analyst') return 'avatar-analyst';
    return 'avatar-viewer';
  };

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR NAVIGATION */}
      <aside className="dashboard-sidebar">
        <div>
          <div className="sidebar-header">
            <i className="fa-solid fa-folder-tree"></i> Client Console
          </div>
          <ul className="sidebar-menu">
            <li
              className={activeTab === 'client-overview' ? 'active-tab' : ''}
              onClick={() => setActiveTab('client-overview')}
            >
              <i className="fa-solid fa-rectangle-list"></i> Overview
            </li>
            <li
              className={activeTab === 'client-wizard' ? 'active-tab' : ''}
              onClick={() => { setActiveTab('client-wizard'); setWizardStep(1); }}
            >
              <i className="fa-solid fa-circle-plus"></i> New Campaign
            </li>
            <li
              className={activeTab === 'client-analytics' ? 'active-tab' : ''}
              onClick={() => setActiveTab('client-analytics')}
            >
              <i className="fa-solid fa-square-poll-vertical"></i> Analytics
            </li>

            <li className="sidebar-divider">Settings & Scaling</li>

            <li
              className={activeTab === 'client-apikeys' ? 'active-tab' : ''}
              onClick={() => setActiveTab('client-apikeys')}
            >
              <i className="fa-solid fa-key"></i> API & Webhooks
            </li>
            <li
              className={activeTab === 'client-team' ? 'active-tab' : ''}
              onClick={() => setActiveTab('client-team')}
            >
              <i className="fa-solid fa-users-gear"></i> Team Members
            </li>
            <li
              className={activeTab === 'client-billing' ? 'active-tab' : ''}
              onClick={() => setActiveTab('client-billing')}
            >
              <i className="fa-solid fa-credit-card"></i> Subscriptions
            </li>
          </ul>
        </div>

        <div className="sidebar-footer-stat">
          <div className="small muted">Active Escrow Balance</div>
          <h4 className="text-success" style={{ fontSize: '1.25rem', marginTop: '3px' }}>$1,080.00</h4>
        </div>
      </aside>

      {/* DASHBOARD CONTENT BODY */}
      <div style={{ flex: 1, padding: '0 2rem 2rem 2rem', overflowY: 'auto' }}>

        {/* UNIVERSAL PAGE HEADER */}
        <div className="client-page-header">
          <div className="header-breadcrumb">
            <span>Client Hub</span>
            <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.6rem' }}></i>
            <span className="active-crumb">{currentHeader.crumb}</span>
          </div>
          <h2>{currentHeader.title}</h2>
          <p className="header-subtitle">{currentHeader.subtitle}</p>
        </div>

        {/* OVERVIEW SUB-TAB */}
        {activeTab === 'client-overview' && (
          <div className="sub-tab active-sub-tab">
            {/* Enhanced Stat Cards */}
            <div className="client-stats-grid">
              <div className="client-stat-card fade-in-up stagger-1">
                <div className="stat-top-row">
                  <div className="stat-icon-badge indigo-bg">
                    <i className="fa-solid fa-chart-line"></i>
                  </div>
                  <span className="stat-trend trend-up">
                    <i className="fa-solid fa-arrow-up" style={{ fontSize: '0.6rem' }}></i> 12%
                  </span>
                </div>
                <div className="stat-label">Active Campaigns</div>
                <div className="stat-value">{activeCampaigns.length}</div>
                <div className="stat-sparkline">
                  {[30, 45, 25, 60, 50, 70, 55, 80].map((h, i) => (
                    <div key={i} className="spark-bar" style={{ height: `${h}%` }}></div>
                  ))}
                </div>
              </div>

              <div className="client-stat-card fade-in-up stagger-2">
                <div className="stat-top-row">
                  <div className="stat-icon-badge emerald-bg">
                    <i className="fa-solid fa-users"></i>
                  </div>
                  <span className="stat-trend trend-up">
                    <i className="fa-solid fa-arrow-up" style={{ fontSize: '0.6rem' }}></i> 8%
                  </span>
                </div>
                <div className="stat-label">Total Submissions</div>
                <div className="stat-value">{totalSubmissions}</div>
                <div className="stat-sparkline">
                  {[20, 35, 50, 40, 65, 55, 75, 90].map((h, i) => (
                    <div key={i} className="spark-bar" style={{ height: `${h}%`, background: i === 7 ? 'var(--emerald)' : undefined }}></div>
                  ))}
                </div>
              </div>

              <div className="client-stat-card fade-in-up stagger-3">
                <div className="stat-top-row">
                  <div className="stat-icon-badge amber-bg">
                    <i className="fa-solid fa-brain"></i>
                  </div>
                  <span className="stat-trend trend-up">
                    <i className="fa-solid fa-arrow-up" style={{ fontSize: '0.6rem' }}></i> 3%
                  </span>
                </div>
                <div className="stat-label">Avg. Attention Score</div>
                <div className="stat-value">{avgAttention}%</div>
                <div className="stat-sparkline">
                  {[60, 65, 55, 70, 75, 80, 78, 85].map((h, i) => (
                    <div key={i} className="spark-bar" style={{ height: `${h}%`, background: i === 7 ? 'var(--amber)' : undefined }}></div>
                  ))}
                </div>
              </div>

              <div className="client-stat-card fade-in-up stagger-4">
                <div className="stat-top-row">
                  <div className="stat-icon-badge rose-bg">
                    <i className="fa-solid fa-user-ninja"></i>
                  </div>
                  <span className="stat-trend trend-down">
                    <i className="fa-solid fa-arrow-down" style={{ fontSize: '0.6rem' }}></i> 5%
                  </span>
                </div>
                <div className="stat-label">Fraud Intercepted</div>
                <div className="stat-value">{state.systemStats.fraudAttemptsBlocked}</div>
                <div className="stat-sparkline">
                  {[90, 70, 85, 60, 50, 40, 35, 30].map((h, i) => (
                    <div key={i} className="spark-bar" style={{ height: `${h}%`, background: i === 7 ? 'var(--rose)' : undefined }}></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Campaign Registry Table */}
            <div className="campaign-registry-card fade-in-up" style={{ animationDelay: '0.25s', opacity: 0 }}>
              <div className="campaign-registry-header">
                <h3>
                  <i className="fa-solid fa-layer-group text-indigo" style={{ fontSize: '0.95rem' }}></i>
                  Campaign Registry
                </h3>
                <div className="header-actions">
                  <span className="badge badge-emerald" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span className="status-dot dot-active" style={{ marginRight: 0 }}></span>
                    Live Monitoring
                  </span>
                  <button className="btn btn-indigo btn-sm" onClick={() => { setActiveTab('client-wizard'); setWizardStep(1); }}>
                    <i className="fa-solid fa-plus"></i> New
                  </button>
                </div>
              </div>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Campaign</th>
                      <th>Type</th>
                      <th>Audience</th>
                      <th>Progress</th>
                      <th>Budget</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...state.campaigns].reverse().map(camp => {
                      const quota = Math.ceil(camp.budget / camp.payoutPerReview);
                      const progressPercent = Math.min((camp.submissionsCount / quota) * 100, 100);

                      return (
                        <tr key={camp.id}>
                          <td>
                            <strong>{camp.title}</strong>
                            <div className="small muted" style={{ marginTop: '2px' }}>{camp.id}</div>
                          </td>
                          <td>
                            <span className={`campaign-type-pill type-${camp.type}`}>
                              <i className={`fa-solid ${camp.type === 'video' ? 'fa-circle-play' : camp.type === 'website' ? 'fa-window-restore' : 'fa-images'}`}></i>
                              {camp.type}
                            </span>
                          </td>
                          <td>
                            <span className="small">{camp.targetAudience.occupation}</span>
                            <div className="small muted">{camp.targetAudience.geo}</div>
                          </td>
                          <td style={{ minWidth: '120px' }}>
                            <div className="small" style={{ marginBottom: '2px' }}>
                              <strong>{camp.submissionsCount}</strong>
                              <span className="muted"> / {quota}</span>
                            </div>
                            <div className="progress-bar-mini">
                              <div className="progress-fill" style={{ width: `${progressPercent}%` }}></div>
                            </div>
                          </td>
                          <td>
                            <span className="text-emerald" style={{ fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>
                              ${camp.budget.toFixed(2)}
                            </span>
                          </td>
                          <td>
                            <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                              <span className={`status-dot ${camp.status === 'active' ? 'dot-active' : 'dot-completed'}`}></span>
                              <span className="small" style={{ fontWeight: 500, textTransform: 'capitalize' }}>{camp.status}</span>
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => {
                                setSelectedCampId(camp.id);
                                setActiveTab('client-analytics');
                              }}
                              style={{ gap: '5px' }}
                            >
                              <i className="fa-solid fa-chart-bar"></i> Analyze
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* WIZARD CREATOR SUB-TAB */}
        {activeTab === 'client-wizard' && (
          <div className="sub-tab active-sub-tab">
            {/* Premium Wizard Stepper */}
            <div className="wizard-stepper">
              <div className={`wizard-step-item ${wizardStep === 1 ? 'step-active' : wizardStep > 1 ? 'step-done' : ''}`}>
                <div className="wizard-step-circle">
                  {wizardStep > 1 ? <i className="fa-solid fa-check" style={{ fontSize: '0.75rem' }}></i> : '1'}
                </div>
                <span className="wizard-step-label">Campaign Details</span>
              </div>
              <div className={`wizard-step-connector ${wizardStep > 1 ? 'connector-done' : ''} ${wizardStep === 2 ? 'connector-active' : ''}`}></div>
              <div className={`wizard-step-item ${wizardStep === 2 ? 'step-active' : wizardStep > 2 ? 'step-done' : ''}`}>
                <div className="wizard-step-circle">
                  {wizardStep > 2 ? <i className="fa-solid fa-check" style={{ fontSize: '0.75rem' }}></i> : '2'}
                </div>
                <span className="wizard-step-label">Demographics</span>
              </div>
              <div className={`wizard-step-connector ${wizardStep > 2 ? 'connector-done' : ''} ${wizardStep === 3 ? 'connector-active' : ''}`}></div>
              <div className={`wizard-step-item ${wizardStep === 3 ? 'step-active' : ''}`}>
                <div className="wizard-step-circle">3</div>
                <span className="wizard-step-label">Budget & Launch</span>
              </div>
            </div>

            <div className="wizard-form-card">
              {/* Wizard Step 1 */}
              {wizardStep === 1 && (
                <div className="wizard-step-panel active-step-panel">
                  <div className="wizard-form-group">
                    <label>Campaign Title <span style={{ color: 'var(--rose)' }}>*</span></label>
                    <input
                      type="text"
                      className={`wizard-input ${wTitleError ? 'invalid' : wTitle ? 'valid' : ''}`}
                      placeholder="e.g. Fintech Dashboard Usability Mapping"
                      value={wTitle}
                      onChange={(e) => {
                        setWTitle(e.target.value);
                        if (e.target.value) setWTitleError(false);
                      }}
                    />
                    {wTitleError && <span className="input-error-msg"><i className="fa-solid fa-circle-exclamation"></i> Campaign Title is required</span>}
                  </div>
                  <div className="wizard-form-group">
                    <label>Asset URL Link <span style={{ color: 'var(--rose)' }}>*</span></label>
                    <input
                      type="text"
                      className={`wizard-input ${wUrlError ? 'invalid' : wUrl ? 'valid' : ''}`}
                      placeholder="e.g. https://commondatastorage.googleapis.com/...mp4"
                      value={wUrl}
                      onChange={(e) => {
                        setWUrl(e.target.value);
                        if (e.target.value) setWUrlError(false);
                      }}
                    />
                    {wUrlError && <span className="input-error-msg"><i className="fa-solid fa-circle-exclamation"></i> Asset URL Link is required</span>}
                  </div>
                  <div className="wizard-form-group">
                    <label>Campaign Type</label>
                    <div className="campaign-type-selector">
                      <div
                        className={`campaign-type-option ${wType === 'website' ? 'type-selected' : ''}`}
                        onClick={() => setWType('website')}
                      >
                        <i className="fa-solid fa-window-restore"></i>
                        <span className="type-name">Website Hotspot</span>
                        <span className="type-desc">Click heatmaps & UX friction</span>
                      </div>
                      <div
                        className={`campaign-type-option ${wType === 'video' ? 'type-selected' : ''}`}
                        onClick={() => setWType('video')}
                      >
                        <i className="fa-solid fa-circle-play"></i>
                        <span className="type-name">Video Retention</span>
                        <span className="type-desc">Second-by-second telemetry</span>
                      </div>
                      <div
                        className={`campaign-type-option ${wType === 'thumbnail' ? 'type-selected' : ''}`}
                        onClick={() => setWType('thumbnail')}
                      >
                        <i className="fa-solid fa-images"></i>
                        <span className="type-name">Thumbnail A/B</span>
                        <span className="type-desc">Split preference testing</span>
                      </div>
                    </div>
                  </div>
                  <div className="wizard-form-group">
                    <label>Instructions for Reviewers</label>
                    <textarea
                      className="wizard-input"
                      rows="3"
                      placeholder="e.g. Identify click bottlenecks or where pacing falls off..."
                      value={wInstructions}
                      onChange={(e) => setWInstructions(e.target.value)}
                    ></textarea>
                  </div>
                  <button className="btn btn-primary btn-lg" onClick={() => setWizardStep(2)}>
                    Next: Demographics <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.8rem' }}></i>
                  </button>
                </div>
              )}

              {/* Wizard Step 2 */}
              {wizardStep === 2 && (
                <div className="wizard-step-panel active-step-panel">
                  <div className="grid-2 margin-bottom-md">
                    <div className="wizard-form-group">
                      <label>Target Geo Region</label>
                      <select className="wizard-input" value={wGeo} onChange={(e) => setWGeo(e.target.value)}>
                        <option value="Global Reach">Global Reach</option>
                        <option value="North America (US & Canada)">US & Canada</option>
                        <option value="European Union">European Union</option>
                      </select>
                    </div>
                    <div className="wizard-form-group">
                      <label>Occupation Target</label>
                      <select className="wizard-input" value={wOccupation} onChange={(e) => setWOccupation(e.target.value)}>
                        <option value="General Public">General Public</option>
                        <option value="Developers">Developers</option>
                        <option value="Gamers">Gamers</option>
                        <option value="Professionals">Professionals</option>
                        <option value="Students">Students</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid-2 margin-bottom-md">
                    <div className="wizard-form-group">
                      <label>Age Demographic</label>
                      <select className="wizard-input" value={wAge} onChange={(e) => setWAge(e.target.value)}>
                        <option value="Any">Any</option>
                        <option value="18-24">18-24</option>
                        <option value="25-34">25-34</option>
                        <option value="35+">35+</option>
                      </select>
                    </div>
                    <div className="wizard-form-group">
                      <label>Target Device</label>
                      <select className="wizard-input" value={wDevice} onChange={(e) => setWDevice(e.target.value)}>
                        <option value="Any Device">Any Device</option>
                        <option value="Desktop Browser">Desktop Browser</option>
                        <option value="Mobile Device">Mobile Device</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <button className="btn btn-secondary btn-lg" onClick={() => setWizardStep(1)}>
                      <i className="fa-solid fa-arrow-left" style={{ fontSize: '0.8rem' }}></i> Back
                    </button>
                    <button className="btn btn-primary btn-lg" onClick={() => setWizardStep(3)}>
                      Next: Budget <i className="fa-solid fa-arrow-right" style={{ fontSize: '0.8rem' }}></i>
                    </button>
                  </div>
                </div>
              )}

              {/* Wizard Step 3 */}
              {wizardStep === 3 && (
                <div className="wizard-step-panel active-step-panel">
                  <div className="grid-2 margin-bottom-md">
                    <div>
                      <div className="wizard-form-group">
                        <label>
                          Reviewer Sample Quota: <strong style={{ color: 'var(--primary)' }}>{wSampleSize}</strong>
                        </label>
                        <input
                          type="range"
                          min="10"
                          max="200"
                          step="5"
                          value={wSampleSize}
                          onChange={(e) => setWSampleSize(Number(e.target.value))}
                          style={{ width: '100%', accentColor: 'var(--primary)' }}
                        />
                      </div>
                      <div style={{ marginTop: '1rem' }}>
                        <span className="small muted">
                          Estimated matched testers: <strong style={{ color: 'var(--text-white)' }}>{wOnlineMatch}</strong> online
                        </span>
                        <div className="est-reach-bar" style={{ marginTop: '8px' }}>
                          <div className="reach-bar-inner" style={{ width: `${Math.min((wOnlineMatch / 1500) * 100, 100)}%` }}></div>
                        </div>
                      </div>
                    </div>

                    <div className="budget-breakdown-card">
                      <h4 style={{ fontSize: '0.88rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <i className="fa-solid fa-calculator text-indigo"></i> Budget Breakdown
                      </h4>
                      <div className="budget-line-item">
                        <span className="small muted">Reviewer Payout Rate</span>
                        <strong className="text-success">${wBaseRate.toFixed(2)}</strong>
                      </div>
                      <div className="budget-line-item">
                        <span className="small muted">Platform Audit Fee</span>
                        <strong className="text-indigo">${wPlatformFee.toFixed(2)}</strong>
                      </div>
                      <div className="budget-line-item">
                        <span className="small muted">Sample Quota</span>
                        <strong>{wSampleSize} reviewers</strong>
                      </div>
                      <div className="budget-line-item budget-total">
                        <span className="small muted"><strong>Locked Escrow Budget</strong></span>
                        <strong className="text-success" style={{ fontSize: '1.3rem', fontFamily: "'Space Grotesk', sans-serif" }}>
                          ${wTotalBudget.toFixed(2)}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '15px' }}>
                    <button className="btn btn-secondary btn-lg" onClick={() => setWizardStep(2)}>
                      <i className="fa-solid fa-arrow-left" style={{ fontSize: '0.8rem' }}></i> Back
                    </button>
                    <button className="btn btn-indigo btn-lg" onClick={handleLaunchCampaign}>
                      <i className="fa-solid fa-lock"></i> Lock Escrow & Launch Campaign
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CAMPAIGN ANALYTICS SUB-TAB */}
        {activeTab === 'client-analytics' && (
          <div className="sub-tab active-sub-tab">
            {/* Campaign Selector Bar */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
              <select
                className="wizard-input"
                id="analytics-campaign-selector"
                value={selectedCampId}
                onChange={(e) => setSelectedCampId(e.target.value)}
                style={{ width: 'auto', minWidth: '280px', padding: '8px 14px', fontSize: '0.85rem' }}
              >
                {state.campaigns.map(c => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </select>
              <button className="btn btn-secondary btn-sm" onClick={handleExportJSON}>
                <i className="fa-solid fa-download"></i> Export JSON
              </button>
            </div>

            {/* Score Rings Grid */}
            <div className="analytics-scores-grid fade-in-up">
              <div className="analytics-score-card">
                <div className="score-card-label">Overall Attention Score</div>
                <ScoreRing
                  value={activeCamp?.attentionScore || 85}
                  color="var(--primary)"
                  label="Attention"
                />
              </div>
              <div className="analytics-score-card">
                <div className="score-card-label">Net Sentiment Index</div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '120px' }}>
                  <div style={{
                    fontSize: '2.2rem',
                    fontWeight: 700,
                    fontFamily: "'Space Grotesk', sans-serif",
                    color: activeCamp?.netSentiment === 'Positive' ? 'var(--emerald)' : 'var(--amber)'
                  }}>
                    {activeCamp?.netSentiment || 'Neutral'}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                    <i className={`fa-solid ${activeCamp?.netSentiment === 'Positive' ? 'fa-face-smile text-emerald' : 'fa-face-meh text-amber'}`}></i>
                    <span className="small muted">Based on {activeCamp?.reviews?.length || 0} reviews</span>
                  </div>
                </div>
              </div>
              <div className="analytics-score-card">
                <div className="score-card-label">Sample Coverage Quota</div>
                <ScoreRing
                  value={activeCamp?.submissionsCount || 0}
                  max={Math.ceil((activeCamp?.budget || 1) / (activeCamp?.payoutPerReview || 1))}
                  color="var(--emerald)"
                  label="Coverage"
                />
              </div>
            </div>

            {/* Render video retention canvas visual */}
            {activeCamp?.type === 'video' && (
              <div className="card grid-2 border-glow-indigo margin-bottom-md" style={{ padding: '1.5rem' }}>
                <div>
                  <h4 className="margin-bottom-md" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fa-solid fa-wave-square text-indigo" style={{ fontSize: '0.9rem' }}></i>
                    Second-by-Second Telemetry
                  </h4>
                  <div style={{ position: 'relative', width: '100%', height: '220px', background: '#090a0e', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <canvas ref={videoCanvasRef} width="480" height="220" style={{ width: '100%', height: '100%' }}></canvas>
                  </div>
                  <p className="small muted margin-top-sm" style={{ fontStyle: 'italic' }}>
                    Click dots on timeline grid to filter comments near that timestamp.
                  </p>
                </div>
                <div>
                  <h4 className="margin-bottom-md" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fa-solid fa-comments text-indigo" style={{ fontSize: '0.9rem' }}></i>
                    Timeline Comments
                  </h4>
                  <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
                    {activeCamp.reviews.length === 0 ? (
                      <div className="empty-state">
                        <i className="fa-solid fa-inbox"></i>
                        <p>No reviewer logs recorded yet.</p>
                      </div>
                    ) : (
                      activeCamp.reviews.map(r => (
                        <div key={r.id} className="review-log-item">
                          <div className="review-log-avatar">{getInitials(r.reviewerName)}</div>
                          <div className="review-log-content">
                            <span className="reviewer-name">{r.reviewerName}</span>
                            <span className="text-indigo" style={{ marginLeft: '8px', fontSize: '0.72rem', fontWeight: 600 }}>@{r.details?.videoTime}s</span>
                            <div className="review-text">"{r.feedbackText}"</div>
                            <div className="review-meta">
                              <span className="fraud-pass"><i className="fa-solid fa-shield-check" style={{ marginRight: '3px' }}></i>{r.fraudCheck?.score}% Verified</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Render website clickmap coordinates visual */}
            {activeCamp?.type === 'website' && (
              <div className="card grid-2 border-glow-indigo margin-bottom-md" style={{ padding: '1.5rem' }}>
                <div>
                  <h4 className="margin-bottom-md" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fa-solid fa-crosshairs text-pink" style={{ fontSize: '0.9rem' }}></i>
                    Click Coordinate Hotspots
                  </h4>
                  <div style={{ position: 'relative', width: '100%', border: '1px solid var(--border-subtle)', borderRadius: '8px', overflow: 'hidden' }}>
                    <img
                      id="clickmap-mock-bg"
                      src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop"
                      style={{ width: '100%', display: 'block' }}
                      alt="mockup"
                    />
                    <canvas
                      ref={clickmapCanvasRef}
                      width="500"
                      height="380"
                      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
                    ></canvas>
                  </div>
                </div>
                <div>
                  <h4 className="margin-bottom-md" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fa-solid fa-comments text-pink" style={{ fontSize: '0.9rem' }}></i>
                    Click Feedback Remarks
                  </h4>
                  <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                    {activeCamp.reviews.length === 0 ? (
                      <div className="empty-state">
                        <i className="fa-solid fa-inbox"></i>
                        <p>No clicks recorded yet.</p>
                      </div>
                    ) : (
                      activeCamp.reviews.map((r, idx) => (
                        <div key={r.id} className="review-log-item">
                          <div className="review-log-avatar" style={{ background: 'rgba(236, 72, 153, 0.1)', color: 'var(--pink)', borderColor: 'rgba(236, 72, 153, 0.15)' }}>
                            #{idx + 1}
                          </div>
                          <div className="review-log-content">
                            <span className="reviewer-name">{r.reviewerName}</span>
                            <span className="text-pink" style={{ marginLeft: '8px', fontSize: '0.72rem', fontWeight: 600 }}>
                              X:{r.details?.clickX}, Y:{r.details?.clickY}
                            </span>
                            <div className="review-text">"{r.feedbackText}"</div>
                            <div className="review-meta">
                              <span className="fraud-pass"><i className="fa-solid fa-shield-check" style={{ marginRight: '3px' }}></i>{r.fraudCheck?.score}% Verified</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Render Thumbnail A/B Split visual */}
            {activeCamp?.type === 'thumbnail' && (
              <div className="card margin-bottom-md" style={{ padding: '1.5rem' }}>
                <h4 className="margin-bottom-md" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <i className="fa-solid fa-scale-balanced text-emerald" style={{ fontSize: '0.9rem' }}></i>
                  Thumbnail Preference Split
                </h4>
                <div className="grid-2 margin-bottom-md">
                  <div className="card text-center">
                    <h5>Option A (Indigo Concept)</h5>
                    <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=400&auto=format&fit=crop" style={{ width: '100%', borderRadius: '8px', marginTop: '10px' }} alt="option A" />
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)', marginTop: '8px' }}>65% Preference</div>
                  </div>
                  <div className="card text-center">
                    <h5>Option B (Warm Orange)</h5>
                    <img src="https://images.unsplash.com/photo-1542744094-3a31f103e35f?q=80&w=400&auto=format&fit=crop" style={{ width: '100%', borderRadius: '8px', marginTop: '10px' }} alt="option B" />
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--amber)', marginTop: '8px' }}>35% Preference</div>
                  </div>
                </div>
                <div>
                  <h4 className="margin-bottom-md" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fa-solid fa-comments text-emerald" style={{ fontSize: '0.9rem' }}></i>
                    A/B Feedback Logs
                  </h4>
                  <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {activeCamp.reviews.map(r => (
                      <div key={r.id} className="review-log-item">
                        <div className="review-log-avatar" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--emerald)', borderColor: 'rgba(16, 185, 129, 0.15)' }}>
                          {r.details?.votedFor}
                        </div>
                        <div className="review-log-content">
                          <span className="reviewer-name">{r.reviewerName}</span>
                          <span className="text-emerald" style={{ marginLeft: '8px', fontSize: '0.72rem', fontWeight: 600 }}>
                            Voted: Option {r.details?.votedFor}
                          </span>
                          <div className="review-text">"{r.feedbackText}"</div>
                          <div className="review-meta">
                            <span className="fraud-pass"><i className="fa-solid fa-shield-check" style={{ marginRight: '3px' }}></i>{r.fraudCheck?.score}% Verified</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* AI Summary and Action Items */}
            <div className="grid-2">
              <div className="ai-insights-card">
                <div className="ai-insights-header">
                  <div className="ai-sparkle">
                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 600 }}>Clustered AI Analytics</h4>
                    <span className="small muted">Pattern-matched insights from telemetry</span>
                  </div>
                </div>
                <div className="ai-insights-body">
                  <div className="insight-section insight-positive">
                    <div className="insight-icon">
                      <i className="fa-solid fa-arrow-trend-up"></i>
                    </div>
                    <div className="insight-content">
                      <h5 className="text-emerald">Key Focal Points</h5>
                      <p>{activeCamp?.aiSummary?.positives}</p>
                    </div>
                  </div>
                  <div className="insight-section insight-negative">
                    <div className="insight-icon">
                      <i className="fa-solid fa-triangle-exclamation"></i>
                    </div>
                    <div className="insight-content">
                      <h5 className="text-rose">Usability Bottlenecks</h5>
                      <p>{activeCamp?.aiSummary?.negatives}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="settings-section-card">
                <div className="settings-section-header">
                  <div className="settings-icon icon-indigo">
                    <i className="fa-solid fa-clipboard-check"></i>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 600 }}>Priority Action Checklist</h4>
                    <span className="small muted">AI-recommended next steps</span>
                  </div>
                </div>
                <div>
                  {activeCamp?.actionItems && activeCamp.actionItems.length > 0 ? (
                    activeCamp.actionItems.map((item, idx) => (
                      <div key={idx} className="action-item-row">
                        <div className={`action-priority-dot priority-${(item.priority || 'medium').toLowerCase()}`}></div>
                        <div className="action-item-text">
                          <div className="action-task">{item.task}</div>
                          <div className="action-area">{item.area}</div>
                        </div>
                        <div className="action-impact-badge">{item.impact}</div>
                      </div>
                    ))
                  ) : (
                    <div className="empty-state">
                      <i className="fa-solid fa-hourglass-half"></i>
                      <p>Action checklist will build dynamically from telemetry data.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* API KEYS SUB-TAB */}
        {activeTab === 'client-apikeys' && (
          <div className="sub-tab active-sub-tab">
            <div className="settings-section-card margin-bottom-md fade-in-up">
              <div className="settings-section-header">
                <div className="settings-icon icon-indigo">
                  <i className="fa-solid fa-key"></i>
                </div>
                <div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 600 }}>REST API Settings</h4>
                  <span className="small muted">Manage workspace access tokens</span>
                </div>
              </div>
              <div className="settings-section-body">
                <div className="wizard-form-group">
                  <label>Workspace Access Token</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      className="wizard-input fira-code"
                      readOnly
                      value={state.developerSettings?.apiKey}
                      style={{ flex: 1, fontSize: '0.82rem' }}
                    />
                    <button className="btn btn-secondary" onClick={handleRollApiKey}>
                      <i className="fa-solid fa-arrows-rotate"></i> Roll key
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="settings-section-card fade-in-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
              <div className="settings-section-header">
                <div className="settings-icon icon-emerald">
                  <i className="fa-solid fa-satellite-dish"></i>
                </div>
                <div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 600 }}>Webhook Event Receiver</h4>
                  <span className="small muted">POST payloads on campaign events & quality intercepts</span>
                </div>
              </div>
              <div className="settings-section-body">
                <div className="wizard-form-group">
                  <label>Webhook URL Endpoint</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <input
                      type="text"
                      className="wizard-input"
                      value={webhookInput}
                      onChange={(e) => setWebhookInput(e.target.value)}
                      placeholder="https://your-api.com/webhooks/attentra"
                      style={{ flex: 1 }}
                    />
                    <button className="btn btn-indigo" onClick={handleSaveWebhook}>Save URL</button>
                    <button className="btn btn-secondary" onClick={handleSendTestWebhook} disabled={testingWebhook}>
                      {testingWebhook ? (
                        <><i className="fa-solid fa-spinner fa-spin"></i> Triggering...</>
                      ) : (
                        <><i className="fa-solid fa-paper-plane"></i> Send Test</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TEAM ROSTER SUB-TAB */}
        {activeTab === 'client-team' && (
          <div className="sub-tab active-sub-tab">
            <div className="grid-2" style={{ gap: '1.5rem' }}>
              {/* Invite Panel */}
              <div className="settings-section-card fade-in-up">
                <div className="settings-section-header">
                  <div className="settings-icon icon-indigo">
                    <i className="fa-solid fa-user-plus"></i>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 600 }}>Invite Collaborator</h4>
                    <span className="small muted">Add team members to this workspace</span>
                  </div>
                </div>
                <div className="settings-section-body">
                  <div className="wizard-form-group">
                    <label>Email Address</label>
                    <input
                      type="email"
                      className="wizard-input"
                      placeholder="coworker@company.com"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                    />
                  </div>
                  <div className="wizard-form-group">
                    <label>Workspace Access Role</label>
                    <select
                      className="wizard-input"
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                    >
                      <option value="Owner">Owner</option>
                      <option value="Admin">Admin</option>
                      <option value="Analyst">Analyst</option>
                      <option value="Viewer">Viewer</option>
                    </select>
                  </div>
                  <button className="btn btn-indigo btn-lg" onClick={handleInviteTeam}>
                    <i className="fa-solid fa-paper-plane"></i> Send Invitation
                  </button>
                </div>
              </div>

              {/* Team Members List */}
              <div className="settings-section-card fade-in-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
                <div className="settings-section-header">
                  <div className="settings-icon icon-emerald">
                    <i className="fa-solid fa-users"></i>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 600 }}>Active Coworkers</h4>
                    <span className="small muted">{state.teamRoster.length} members</span>
                  </div>
                </div>
                <div className="settings-section-body" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {state.teamRoster.map((member, idx) => (
                    <div key={idx} className="team-member-card">
                      <div className={`team-member-avatar ${getAvatarClass(member.role)}`}>
                        {member.email.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="team-member-info">
                        <div className="member-email">{member.email}</div>
                        <div className="member-joined">
                          {member.status === 'Joined' ? `Joined ${member.joinedDate}` : member.status}
                        </div>
                      </div>
                      <span className={`badge ${member.role === 'Owner' ? 'badge-purple' : member.role === 'Admin' ? 'badge-emerald' : 'badge-rose'}`} style={{ fontSize: '0.7rem' }}>
                        {member.role}
                      </span>
                      <span className={`status-dot ${member.status === 'Joined' ? 'dot-active' : 'dot-completed'}`}></span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BILLING SUB-TAB */}
        {activeTab === 'client-billing' && (
          <div className="sub-tab active-sub-tab">
            <div className="grid-2" style={{ gap: '1.5rem' }}>
              {/* Active Plan */}
              <div className="billing-plan-card fade-in-up">
                <div className="billing-plan-icon">
                  <i className="fa-solid fa-gem"></i>
                </div>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '4px' }} id="active-billing-plan-label">{billingTier} Plan</h3>
                <span className="small muted" style={{ display: 'block', marginBottom: '1.5rem' }}>Renewing automatically on August 15, 2026</span>

                <div className="wizard-form-group">
                  <label>Migrate Subscription Tier</label>
                  <select
                    className="wizard-input"
                    value={billingTier}
                    onChange={(e) => handleChangeBillingTier(e.target.value)}
                    style={{ maxWidth: '300px' }}
                  >
                    <option value="Growth">Growth Plan ($149 / mo)</option>
                    <option value="Scale">Scale Plan ($499 / mo)</option>
                    <option value="Enterprise">Enterprise Plan ($1,200 / mo)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '20px', marginTop: '1rem' }}>
                  <div>
                    <span className="small muted" style={{ display: 'block' }}>Monthly Cost</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: 'var(--emerald)' }}>
                      ${billingTier === 'Growth' ? '149' : billingTier === 'Scale' ? '499' : '1,200'}
                    </span>
                  </div>
                  <div>
                    <span className="small muted" style={{ display: 'block' }}>Total Invoices</span>
                    <span style={{ fontSize: '1.5rem', fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif" }}>
                      {state.billingInvoices.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Payment History */}
              <div className="settings-section-card fade-in-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
                <div className="settings-section-header">
                  <div className="settings-icon icon-amber">
                    <i className="fa-solid fa-receipt"></i>
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 600 }}>Payment History</h4>
                    <span className="small muted">All invoices and receipts</span>
                  </div>
                </div>
                <div>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Invoice</th>
                        <th>Period</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {state.billingInvoices.map((inv, idx) => (
                        <tr key={idx}>
                          <td><strong>{inv.id}</strong></td>
                          <td><span className="small muted">{inv.period}</span></td>
                          <td>
                            <strong className="text-success" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                              ${inv.amount.toFixed(2)}
                            </strong>
                          </td>
                          <td><span className="badge badge-emerald">{inv.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
