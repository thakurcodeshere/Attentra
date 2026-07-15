import { useState, useEffect, useRef } from 'react';

const generateCampId = () => `camp-${Math.floor(1000 + Math.random() * 9000)}`;

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
    if (!wTitle || !wUrl) {
      showToast('Fields Empty', 'Please provide a campaign title and asset link.', 'warning');
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
      <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        
        {/* OVERVIEW SUB-TAB */}
        {activeTab === 'client-overview' && (
          <div className="sub-tab active-sub-tab">
            <h2 className="margin-bottom-md">Client Dashboard Overview</h2>
            <div className="stats-grid margin-bottom-md">
              <div className="stat-card">
                <div className="stat-icon"><i className="fa-solid fa-chart-line text-indigo"></i></div>
                <div className="stat-info">
                  <h4>Active Campaigns</h4>
                  <div className="value">{state.campaigns.filter(c => c.status === 'active').length}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><i className="fa-solid fa-brain text-emerald"></i></div>
                <div className="stat-info">
                  <h4>Total Insights Cluster</h4>
                  <div className="value">42 Topics</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><i className="fa-solid fa-user-ninja text-rose"></i></div>
                <div className="stat-info">
                  <h4>Fraud Attempts Intercepted</h4>
                  <div className="value">{state.systemStats.fraudAttemptsBlocked}</div>
                </div>
              </div>
            </div>

            <div className="card table-card">
              <div className="card-header-row">
                <h3>Campaign Registry</h3>
                <span className="badge badge-emerald">Audits Active</span>
              </div>
              <div className="table-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Campaign Title</th>
                      <th>Type</th>
                      <th>Target Demographic</th>
                      <th>Quota Progress</th>
                      <th>Locked Budget</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...state.campaigns].reverse().map(camp => {
                      let typeIcon = 'fa-circle-play text-indigo';
                      if (camp.type === 'website') typeIcon = 'fa-window-restore text-pink';
                      if (camp.type === 'thumbnail') typeIcon = 'fa-images text-emerald';

                      return (
                        <tr key={camp.id}>
                          <td><strong>{camp.title}</strong></td>
                          <td><span className="small"><i className={`fa-solid ${typeIcon}`}></i> {camp.type}</span></td>
                          <td><span className="small muted">{camp.targetAudience.occupation} ({camp.targetAudience.geo})</span></td>
                          <td><strong>{camp.submissionsCount}</strong> responses</td>
                          <td><span className="text-emerald"><strong>${camp.budget.toFixed(2)}</strong></span></td>
                          <td>
                            <span className={`badge ${camp.status === 'completed' ? 'badge-purple' : 'badge-emerald'}`}>
                              {camp.status}
                            </span>
                          </td>
                          <td>
                            <button 
                              className="btn btn-indigo btn-sm"
                              onClick={() => {
                                setSelectedCampId(camp.id);
                                setActiveTab('client-analytics');
                              }}
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
            <h2 className="margin-bottom-md">Create Campaign</h2>
            <div className="card">
              {/* Wizard Steps Stepper */}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
                <span style={{ fontWeight: wizardStep === 1 ? '700' : '400', color: wizardStep === 1 ? 'var(--primary)' : 'var(--text-muted)' }}>1. Campaign Details</span>
                <span style={{ fontWeight: wizardStep === 2 ? '700' : '400', color: wizardStep === 2 ? 'var(--primary)' : 'var(--text-muted)' }}>2. Demographics</span>
                <span style={{ fontWeight: wizardStep === 3 ? '700' : '400', color: wizardStep === 3 ? 'var(--primary)' : 'var(--text-muted)' }}>3. Budget & Launch</span>
              </div>

              {/* Wizard Step 1 */}
              {wizardStep === 1 && (
                <div className="wizard-step-panel active-step-panel">
                  <div className="margin-bottom-md">
                    <label className="small muted" style={{ display: 'block', marginBottom: '5px' }}>Campaign Title</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. Fintech Dashboard Usability Mapping" 
                      value={wTitle} 
                      onChange={(e) => setWTitle(e.target.value)}
                      style={{ background: 'var(--bg-deep)', border: '1px solid var(--border-subtle)', padding: '10px 14px', width: '100%', color: '#fff', borderRadius: '6px' }}
                    />
                  </div>
                  <div className="margin-bottom-md">
                    <label className="small muted" style={{ display: 'block', marginBottom: '5px' }}>Asset URL Link</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="e.g. https://commondatastorage.googleapis.com/...mp4" 
                      value={wUrl} 
                      onChange={(e) => setWUrl(e.target.value)}
                      style={{ background: 'var(--bg-deep)', border: '1px solid var(--border-subtle)', padding: '10px 14px', width: '100%', color: '#fff', borderRadius: '6px' }}
                    />
                  </div>
                  <div className="margin-bottom-md">
                    <label className="small muted" style={{ display: 'block', marginBottom: '5px' }}>Campaign Type</label>
                    <div style={{ display: 'flex', gap: '20px' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input type="radio" name="w-type" checked={wType === 'website'} onChange={() => setWType('website')} />
                        Website Hotspot
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input type="radio" name="w-type" checked={wType === 'video'} onChange={() => setWType('video')} />
                        Video Retention
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                        <input type="radio" name="w-type" checked={wType === 'thumbnail'} onChange={() => setWType('thumbnail')} />
                        Thumbnail A/B Split
                      </label>
                    </div>
                  </div>
                  <div className="margin-bottom-md">
                    <label className="small muted" style={{ display: 'block', marginBottom: '5px' }}>Instructions for Reviewers</label>
                    <textarea 
                      className="form-input" 
                      rows="3" 
                      placeholder="e.g. Identify click bottlenecks or where pacing falls off..." 
                      value={wInstructions} 
                      onChange={(e) => setWInstructions(e.target.value)}
                      style={{ background: 'var(--bg-deep)', border: '1px solid var(--border-subtle)', padding: '10px 14px', width: '100%', color: '#fff', borderRadius: '6px' }}
                    ></textarea>
                  </div>
                  <button className="btn btn-primary" onClick={() => setWizardStep(2)}>Next: Demographics</button>
                </div>
              )}

              {/* Wizard Step 2 */}
              {wizardStep === 2 && (
                <div className="wizard-step-panel active-step-panel">
                  <div className="grid-2 margin-bottom-md">
                    <div>
                      <label className="small muted" style={{ display: 'block', marginBottom: '5px' }}>Target Geo Region</label>
                      <select className="form-input" value={wGeo} onChange={(e) => setWGeo(e.target.value)} style={{ background: 'var(--bg-deep)', border: '1px solid var(--border-subtle)', padding: '10px 14px', width: '100%', color: '#fff', borderRadius: '6px' }}>
                        <option value="Global Reach">Global Reach</option>
                        <option value="North America (US & Canada)">US & Canada</option>
                        <option value="European Union">European Union</option>
                      </select>
                    </div>
                    <div>
                      <label className="small muted" style={{ display: 'block', marginBottom: '5px' }}>Occupation Target</label>
                      <select className="form-input" value={wOccupation} onChange={(e) => setWOccupation(e.target.value)} style={{ background: 'var(--bg-deep)', border: '1px solid var(--border-subtle)', padding: '10px 14px', width: '100%', color: '#fff', borderRadius: '6px' }}>
                        <option value="General Public">General Public</option>
                        <option value="Developers">Developers</option>
                        <option value="Gamers">Gamers</option>
                        <option value="Professionals">Professionals</option>
                        <option value="Students">Students</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid-2 margin-bottom-md">
                    <div>
                      <label className="small muted" style={{ display: 'block', marginBottom: '5px' }}>Age Demographic</label>
                      <select className="form-input" value={wAge} onChange={(e) => setWAge(e.target.value)} style={{ background: 'var(--bg-deep)', border: '1px solid var(--border-subtle)', padding: '10px 14px', width: '100%', color: '#fff', borderRadius: '6px' }}>
                        <option value="Any">Any</option>
                        <option value="18-24">18-24</option>
                        <option value="25-34">25-34</option>
                        <option value="35+">35+</option>
                      </select>
                    </div>
                    <div>
                      <label className="small muted" style={{ display: 'block', marginBottom: '5px' }}>Target Device</label>
                      <select className="form-input" value={wDevice} onChange={(e) => setWDevice(e.target.value)} style={{ background: 'var(--bg-deep)', border: '1px solid var(--border-subtle)', padding: '10px 14px', width: '100%', color: '#fff', borderRadius: '6px' }}>
                        <option value="Any Device">Any Device</option>
                        <option value="Desktop Browser">Desktop Browser</option>
                        <option value="Mobile Device">Mobile Device</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <button className="btn btn-secondary" onClick={() => setWizardStep(1)}>Back</button>
                    <button className="btn btn-primary" onClick={() => setWizardStep(3)}>Next: Budget</button>
                  </div>
                </div>
              )}

              {/* Wizard Step 3 */}
              {wizardStep === 3 && (
                <div className="wizard-step-panel active-step-panel">
                  <div className="grid-2 margin-bottom-md">
                    <div>
                      <label className="small muted" style={{ display: 'block', marginBottom: '5px' }}>
                        Reviewer Sample Quota: <strong>{wSampleSize}</strong>
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
                      <div className="margin-top-sm">
                        <span className="small muted">Estimated matched testers: <strong>{wOnlineMatch}</strong> online</span>
                        <div className="est-reach-bar">
                          <div className="reach-bar-inner" style={{ width: `${Math.min((wOnlineMatch/1500)*100, 100)}%` }}></div>
                        </div>
                      </div>
                    </div>

                    <div style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '1.2rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <span className="small muted">Reviewer Payout Rate:</span>
                        <strong className="text-success">${wBaseRate.toFixed(2)}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                        <span className="small muted">Platform Audit Fee:</span>
                        <strong className="text-indigo">${wPlatformFee.toFixed(2)}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-subtle)', paddingTop: '6px' }}>
                        <span className="small muted"><strong>Locked Escrow Budget:</strong></span>
                        <strong className="text-success" style={{ fontSize: '1.2rem' }}>${wTotalBudget.toFixed(2)}</strong>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '15px' }}>
                    <button className="btn btn-secondary" onClick={() => setWizardStep(2)}>Back</button>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h2>Campaign Analytics Hub</h2>
                <p className="muted small" id="analytics-campaign-title" style={{ fontSize: '1.1rem', color: 'var(--primary)' }}>
                  {activeCamp?.title}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <select 
                  className="form-input" 
                  id="analytics-campaign-selector"
                  value={selectedCampId}
                  onChange={(e) => setSelectedCampId(e.target.value)}
                  style={{ background: 'var(--bg-deep)', color: '#fff', border: '1px solid var(--border-subtle)', padding: '6px 12px', borderRadius: '6px' }}
                >
                  {state.campaigns.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
                <button className="btn btn-secondary btn-sm" onClick={handleExportJSON}>
                  <i className="fa-solid fa-download"></i> Export JSON
                </button>
              </div>
            </div>

            {/* Performance radial grids */}
            <div className="stats-grid margin-bottom-md">
              <div className="card text-center" style={{ padding: '1rem' }}>
                <span className="small muted">Overall Attention Score</span>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: 'var(--primary)', marginTop: '5px' }}>
                  {activeCamp?.attentionScore || 85}%
                </div>
              </div>
              <div className="card text-center" style={{ padding: '1rem' }}>
                <span className="small muted">Net Sentiment Index</span>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: activeCamp?.netSentiment === 'Positive' ? 'var(--emerald)' : 'var(--amber)', marginTop: '5px' }}>
                  {activeCamp?.netSentiment || 'Neutral'}
                </div>
              </div>
              <div className="card text-center" style={{ padding: '1rem' }}>
                <span className="small muted">Sample Coverage Quota</span>
                <div style={{ fontSize: '2rem', fontWeight: '700', color: '#fff', marginTop: '5px' }}>
                  {activeCamp?.submissionsCount} / {Math.ceil(activeCamp?.budget / activeCamp?.payoutPerReview)}
                </div>
              </div>
            </div>

            {/* Render video retention canvas visual */}
            {activeCamp?.type === 'video' && (
              <div className="card grid-2 border-glow-indigo margin-bottom-md" style={{ padding: '1.5rem' }}>
                <div>
                  <h4 className="margin-bottom-md">Second-by-Second Telemetry</h4>
                  <div style={{ position: 'relative', width: '100%', height: '220px', background: '#090a0e', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                    <canvas ref={videoCanvasRef} width="480" height="220" style={{ width: '100%', height: '100%' }}></canvas>
                  </div>
                  <p className="small muted margin-top-sm" style={{ fontStyle: 'italic' }}>
                    Click dots on timeline grid to filter comments near that timestamp.
                  </p>
                </div>
                <div>
                  <h4 className="margin-bottom-md">Timeline Comments logs</h4>
                  <ul className="added-comments-log" id="retention-comments-list" style={{ listStyle: 'none', paddingLeft: 0, maxHeight: '200px', overflowY: 'auto' }}>
                    {activeCamp.reviews.length === 0 ? (
                      <li className="muted small">No reviewer logs recorded yet.</li>
                    ) : (
                      activeCamp.reviews.map(r => (
                        <li key={r.id} style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px', marginBottom: '6px' }}>
                          <span className="text-indigo"><strong>@{r.details?.videoTime}s</strong></span>: "{r.feedbackText}"
                          <div className="small muted">Reviewer: {r.reviewerName} | Fraud Scan: {r.fraudCheck?.score}% Passed</div>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>
            )}

            {/* Render website clickmap coordinates visual */}
            {activeCamp?.type === 'website' && (
              <div className="card grid-2 border-glow-indigo margin-bottom-md" style={{ padding: '1.5rem' }}>
                <div>
                  <h4 className="margin-bottom-md">Prototype Click coordinate Hotspots</h4>
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
                  <h4 className="margin-bottom-md">Interactive Clicks Remarks</h4>
                  <ul className="added-comments-log" style={{ listStyle: 'none', paddingLeft: 0, maxHeight: '340px', overflowY: 'auto' }}>
                    {activeCamp.reviews.length === 0 ? (
                      <li className="muted small">No clicks recorded.</li>
                    ) : (
                      activeCamp.reviews.map((r, idx) => (
                        <li key={r.id} style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '8px', marginBottom: '8px' }}>
                          <span className="text-pink"><strong>Pin #{idx + 1} (X:{r.details?.clickX}, Y:{r.details?.clickY})</strong></span>: "{r.feedbackText}"
                          <div className="small muted">Reviewer: {r.reviewerName} | Fraud scan: {r.fraudCheck?.score}%</div>
                        </li>
                      ))
                    )}
                  </ul>
                </div>
              </div>
            )}

            {/* Render Thumbnail A/B Split visual */}
            {activeCamp?.type === 'thumbnail' && (
              <div className="card margin-bottom-md" style={{ padding: '1.5rem' }}>
                <h4 className="margin-bottom-md">Thumbnail Preference Split</h4>
                <div className="grid-2 margin-bottom-md">
                  <div className="card text-center">
                    <h5>Option A (Indigo Concept)</h5>
                    <img src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=400&auto=format&fit=crop" style={{ width: '100%', borderRadius: '8px', marginTop: '10px' }} alt="option A"/>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary)', marginTop: '8px' }}>65% Preference</div>
                  </div>
                  <div className="card text-center">
                    <h5>Option B (Warm Orange)</h5>
                    <img src="https://images.unsplash.com/photo-1542744094-3a31f103e35f?q=80&w=400&auto=format&fit=crop" style={{ width: '100%', borderRadius: '8px', marginTop: '10px' }} alt="option B"/>
                    <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--amber)', marginTop: '8px' }}>35% Preference</div>
                  </div>
                </div>
                <div>
                  <h4 className="margin-bottom-md">A/B Feedback logs</h4>
                  <ul className="added-comments-log" style={{ listStyle: 'none', paddingLeft: 0, maxHeight: '200px', overflowY: 'auto' }}>
                    {activeCamp.reviews.map(r => (
                      <li key={r.id} style={{ borderBottom: '1px solid var(--border-subtle)', paddingBottom: '6px', marginBottom: '6px' }}>
                        <span className="text-emerald"><strong>Voted for: Option {r.details?.votedFor}</strong></span>: "{r.feedbackText}"
                        <div className="small muted">Reviewer: {r.reviewerName} | Fraud check: {r.fraudCheck?.score}% Passed</div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* AI Summary and Action Items */}
            <div className="grid-2">
              <div className="card">
                <h4 className="margin-bottom-md"><i className="fa-solid fa-wand-magic-sparkles text-indigo"></i> Clustered AI Analytics</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div>
                    <span className="badge badge-emerald">Key focal points (Positives)</span>
                    <p className="small muted margin-top-sm">{activeCamp?.aiSummary?.positives}</p>
                  </div>
                  <div>
                    <span className="badge badge-rose">Usability bottlenecks (Warnings)</span>
                    <p className="small muted margin-top-sm">{activeCamp?.aiSummary?.negatives}</p>
                  </div>
                </div>
              </div>

              <div className="card table-card">
                <div className="card-header-row">
                  <h4>Priority Action checklist</h4>
                  <span className="badge badge-rose">Audit recommendations</span>
                </div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Task Recommendation</th>
                      <th>Area</th>
                      <th>Impact Priority</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeCamp?.actionItems && activeCamp.actionItems.length > 0 ? (
                      activeCamp.actionItems.map((item, idx) => (
                        <tr key={idx}>
                          <td><strong>{item.task}</strong></td>
                          <td><span className="small">{item.area}</span></td>
                          <td><span className="badge badge-emerald">{item.impact}</span></td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center muted small" style={{ padding: '1.5rem' }}>
                          Telemetry matches pending... Action checklist will build dynamically.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* API KEYS SUB-TAB */}
        {activeTab === 'client-apikeys' && (
          <div className="sub-tab active-sub-tab">
            <h2 className="margin-bottom-md">Developer Credentials</h2>
            <div className="card margin-bottom-md border-glow-indigo">
              <h3 className="margin-bottom-md">REST API Settings</h3>
              <div className="margin-bottom-md">
                <label className="small muted" style={{ display: 'block', marginBottom: '5px' }}>Workspace Access Token</label>
                <div className="flex-input-row">
                  <input 
                    type="text" 
                    className="form-input fira-code" 
                    readOnly 
                    value={state.developerSettings?.apiKey}
                    style={{ background: 'var(--bg-deep)', border: '1px solid var(--border-subtle)', padding: '10px 14px', flex: 1, color: '#fff', borderRadius: '6px' }}
                  />
                  <button className="btn btn-secondary" onClick={handleRollApiKey}>
                    <i className="fa-solid fa-arrows-rotate"></i> Roll key
                  </button>
                </div>
              </div>
            </div>

            <div className="card border-glow-indigo">
              <h3 className="margin-bottom-md">Webhook Event Receiver</h3>
              <p className="small muted margin-bottom-md">
                Configure Attentra to fire POST payloads to your server endpoints on campaign completion or quality intercepts.
              </p>
              <div className="margin-bottom-md">
                <label className="small muted" style={{ display: 'block', marginBottom: '5px' }}>Webhook URL Endpoint</label>
                <div className="flex-input-row">
                  <input 
                    type="text" 
                    className="form-input" 
                    value={webhookInput} 
                    onChange={(e) => setWebhookInput(e.target.value)}
                    placeholder="https://your-api.com/webhooks/attentra" 
                    style={{ background: 'var(--bg-deep)', border: '1px solid var(--border-subtle)', padding: '10px 14px', flex: 1, color: '#fff', borderRadius: '6px' }}
                  />
                  <button className="btn btn-indigo" onClick={handleSaveWebhook}>Save URL</button>
                  <button className="btn btn-secondary" onClick={handleSendTestWebhook} disabled={testingWebhook}>
                    {testingWebhook ? (
                      <><i className="fa-solid fa-spinner fa-spin"></i> Triggering...</>
                    ) : (
                      <><i className="fa-solid fa-paper-plane"></i> Send Test Event</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TEAM ROSTER SUB-TAB */}
        {activeTab === 'client-team' && (
          <div className="sub-tab active-sub-tab">
            <h2 className="margin-bottom-md">Team Workspace settings</h2>
            <div className="card grid-2 margin-bottom-md">
              <div>
                <h3 className="margin-bottom-md">Invite Collaborator</h3>
                <div className="margin-bottom-md">
                  <label className="small muted" style={{ display: 'block', marginBottom: '5px' }}>Email Address</label>
                  <input 
                    type="email" 
                    className="form-input" 
                    placeholder="coworker@company.com" 
                    value={inviteEmail} 
                    onChange={(e) => setInviteEmail(e.target.value)}
                    style={{ background: 'var(--bg-deep)', border: '1px solid var(--border-subtle)', padding: '10px 14px', width: '100%', color: '#fff', borderRadius: '6px' }}
                  />
                </div>
                <div className="margin-bottom-md">
                  <label className="small muted" style={{ display: 'block', marginBottom: '5px' }}>Workspace Access Role</label>
                  <select 
                    className="form-input" 
                    value={inviteRole} 
                    onChange={(e) => setInviteRole(e.target.value)}
                    style={{ background: 'var(--bg-deep)', border: '1px solid var(--border-subtle)', padding: '10px 14px', width: '100%', color: '#fff', borderRadius: '6px' }}
                  >
                    <option value="Owner">Owner</option>
                    <option value="Admin">Admin</option>
                    <option value="Analyst">Analyst</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                </div>
                <button className="btn btn-indigo" onClick={handleInviteTeam}>
                  <i className="fa-solid fa-paper-plane"></i> Send Workspace Invitation
                </button>
              </div>

              <div>
                <h3 className="margin-bottom-md">Active Coworkers</h3>
                <div className="table-card" style={{ border: '1px solid var(--border-subtle)' }}>
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Coworker</th>
                        <th>Role</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {state.teamRoster.map((member, idx) => (
                        <tr key={idx}>
                          <td><strong>{member.email}</strong></td>
                          <td><span className="badge badge-purple">{member.role}</span></td>
                          <td>
                            <span className={`badge ${member.status === 'Joined' ? 'badge-emerald' : 'badge-rose'}`}>
                              {member.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* BILLING SUB-TAB */}
        {activeTab === 'client-billing' && (
          <div className="sub-tab active-sub-tab">
            <h2 className="margin-bottom-md">Subscriptions & Billing Workspace</h2>
            <div className="card grid-2 margin-bottom-md border-glow-emerald">
              <div>
                <h3 className="margin-bottom-md">Active Subscription</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                  <div className="logo-circle" style={{ background: 'var(--emerald)' }}><i className="fa-solid fa-gem"></i></div>
                  <div>
                    <h4 id="active-billing-plan-label">{billingTier} Plan</h4>
                    <span className="small muted">Renewing automatically on August 15, 2026</span>
                  </div>
                </div>
                
                <div>
                  <label className="small muted" style={{ display: 'block', marginBottom: '5px' }}>Migrate Subscription Tier:</label>
                  <select 
                    className="form-input" 
                    value={billingTier} 
                    onChange={(e) => handleChangeBillingTier(e.target.value)}
                    style={{ background: 'var(--bg-deep)', border: '1px solid var(--border-subtle)', padding: '10px 14px', width: '220px', color: '#fff', borderRadius: '6px' }}
                  >
                    <option value="Growth">Growth Plan ($149 / mo)</option>
                    <option value="Scale">Scale Plan ($499 / mo)</option>
                    <option value="Enterprise">Enterprise Plan ($1,200 / mo)</option>
                  </select>
                </div>
              </div>

              <div>
                <h3 className="margin-bottom-md">Payment History</h3>
                <div className="table-card" style={{ border: '1px solid var(--border-subtle)' }}>
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
                          <td><strong className="text-success">${inv.amount.toFixed(2)}</strong></td>
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
