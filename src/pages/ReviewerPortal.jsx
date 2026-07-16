import { useState, useEffect, useRef } from 'react';

const getNowTimestamp = () => new Date().getTime();

// Animated Score Ring component
function ReviewerScoreRing({ value, max = 100, color = 'var(--primary)', size = 130, label = 'Score' }) {
  const radius = 48;
  const circumference = 2 * Math.PI * radius;
  const percent = Math.min(value / max, 1);
  const offset = circumference - (percent * circumference);

  return (
    <div className="reviewer-score-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 120 120">
        <defs>
          <linearGradient id={`ring-grad-${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} />
            <stop offset="100%" stopColor="var(--pink)" />
          </linearGradient>
        </defs>
        <circle className="ring-bg" cx="60" cy="60" r={radius} strokeWidth="7" />
        <circle
          className="ring-value-animated"
          cx="60" cy="60" r={radius}
          strokeWidth="7"
          stroke={`url(#ring-grad-${label})`}
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

export default function ReviewerPortal({ state, setState, showToast }) {
  const [activeTab, setActiveTab] = useState('reviewer-tasks');
  const [activeTaskId, setActiveTaskId] = useState(null);
  
  // Active sandbox states
  const [sandboxTime, setSandboxTime] = useState(0);
  const [commentText, setCommentText] = useState('');
  const [thumbnailChoice, setThumbnailChoice] = useState('');
  const [mockCommentsList, setMockCommentsList] = useState([]);
  
  // Coordinate clicks
  const [clickCoords, setClickCoords] = useState(null);

  // Time tracker to detect speed-running
  const taskStartTime = useRef(null);
  const keystrokeTimes = useRef([]);

  const activeTask = state.campaigns.find(c => c.id === activeTaskId);

  // Tab focus checker
  useEffect(() => {
    const handleBlur = () => {
      if (activeTaskId && activeTab === 'reviewer-sandbox') {
        setState(prev => {
          const newRep = Math.max(prev.currentUser.reputation - 1.5, 0);
          const newLog = {
            timestamp: new Date().toISOString(),
            reviewerId: 'Alex Carter',
            flag: 'Tab Focus Loss (Attention Bypass)',
            severity: 'Medium',
            consequence: 'Rep Penalty -1.5',
            details: 'Lost browser tab focus while auditing campaign. Active attention warning.'
          };
          return {
            ...prev,
            currentUser: { ...prev.currentUser, reputation: newRep },
            fraudLogs: [newLog, ...prev.fraudLogs]
          };
        });
        showToast('Attention Warning', 'Bypassed active window focus. Reputation docked -1.5.', 'error');
      }
    };
    
    window.addEventListener('blur', handleBlur);
    return () => window.removeEventListener('blur', handleBlur);
  }, [activeTaskId, activeTab, setState, showToast]);

  const handleAcceptTask = (taskId) => {
    setActiveTaskId(taskId);
    setSandboxTime(0);
    setCommentText('');
    setClickCoords(null);
    setThumbnailChoice('');
    setMockCommentsList([]);
    taskStartTime.current = getNowTimestamp();
    keystrokeTimes.current = [];
    
    setActiveTab('reviewer-sandbox');
    showToast('Task Accepted', 'Fraud engines monitoring telemetry. Begin audit.', 'success');
  };

  const handleKeyPress = () => {
    keystrokeTimes.current.push(getNowTimestamp());
  };

  const handleAddVideoComment = () => {
    if (!commentText.trim()) return;

    const minChars = Number(localStorage.getItem('attentra_min_chars') || '30');
    if (commentText.length < minChars) {
      showToast('Validation Error', `Comments must be at least ${minChars} characters.`, 'warning');
      return;
    }

    const newComment = {
      id: Math.random().toString(),
      videoTime: sandboxTime,
      text: commentText
    };
    setMockCommentsList(prev => [...prev, newComment]);
    setCommentText('');
    showToast('Stamp Logged', `Comment logged @ ${sandboxTime}s`, 'success');
  };

  const handleAddClickCoords = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 600);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 400);
    setClickCoords({ x, y });
    showToast('Click Coordinate Captured', `Pin set at coordinates X:${x}, Y:${y}`, 'success');
  };

  const handleSubmitTask = () => {
    if (!activeTask) return;

    const elapsedSeconds = (getNowTimestamp() - taskStartTime.current) / 1000;
    
    // 1. Check for Speed-running (completed too fast)
    if (elapsedSeconds < 15) {
      setState(prev => {
        const newRep = Math.max(prev.currentUser.reputation - 3.5, 0);
        const newLog = {
          timestamp: new Date().toISOString(),
          reviewerId: 'Alex Carter',
          flag: 'Speed-running Intercepted',
          severity: 'High',
          consequence: 'Task Rejected & Rep -3.5',
          details: `Completed ${activeTask.title} within ${Math.round(elapsedSeconds)} seconds. Bypassed minimum validation timers.`
        };
        return {
          ...prev,
          currentUser: { ...prev.currentUser, reputation: newRep },
          fraudLogs: [newLog, ...prev.fraudLogs]
        };
      });
      showToast('Task Rejected', 'Spam monitors flagged speed-running. Credentials docked.', 'fraud');
      setActiveTaskId(null);
      setActiveTab('reviewer-tasks');
      return;
    }

    // 2. Check for Keystroke Dynamics anomalies (copy-paste automation)
    let botTyping = false;
    if (keystrokeTimes.current.length > 5) {
      let intervalSum = 0;
      for (let i = 1; i < keystrokeTimes.current.length; i++) {
        intervalSum += (keystrokeTimes.current[i] - keystrokeTimes.current[i-1]);
      }
      const avgInterval = intervalSum / (keystrokeTimes.current.length - 1);
      // Typing average under 10ms means programmatic text injection (bot copy-paste)
      if (avgInterval < 10) {
        botTyping = true;
      }
    }

    if (botTyping) {
      setState(prev => {
        const newRep = Math.max(prev.currentUser.reputation - 5.0, 0);
        const newLog = {
          timestamp: new Date().toISOString(),
          reviewerId: 'Alex Carter',
          flag: 'Keystroke Dynamics Anomaly',
          severity: 'High',
          consequence: 'Audit Rejected & Rep -5.0',
          details: 'Rapid programmatic characters paste detected during feedback entry. Human credentials check failed.'
        };
        return {
          ...prev,
          currentUser: { ...prev.currentUser, reputation: newRep },
          fraudLogs: [newLog, ...prev.fraudLogs]
        };
      });
      showToast('Automation Intercepted', 'Copy-paste bot behavior detected.', 'fraud');
      setActiveTaskId(null);
      setActiveTab('reviewer-tasks');
      return;
    }

    // Build review object
    let reviewDetails = {};
    let feedback = '';

    if (activeTask.type === 'video') {
      if (mockCommentsList.length === 0) {
        showToast('Workspace Incomplete', 'Please log at least one timeline comment.', 'warning');
        return;
      }
      reviewDetails = { videoTime: mockCommentsList[0].videoTime };
      feedback = mockCommentsList.map(c => `[${c.videoTime}s] ${c.text}`).join(' | ');
    } else if (activeTask.type === 'website') {
      if (!clickCoords || !commentText.trim()) {
        showToast('Workspace Incomplete', 'Please pin a coordinate and provide feedback.', 'warning');
        return;
      }
      reviewDetails = { clickX: clickCoords.x, clickY: clickCoords.y };
      feedback = commentText;
    } else if (activeTask.type === 'thumbnail') {
      if (!thumbnailChoice || !commentText.trim()) {
        showToast('Workspace Incomplete', 'Select thumbnail choice and explain reasoning.', 'warning');
        return;
      }
      reviewDetails = { votedFor: thumbnailChoice };
      feedback = commentText;
    }

    const reviewObject = {
      id: `rev-${getNowTimestamp().toString().slice(-4)}`,
      reviewerName: state.currentUser.name,
      rating: 4.5,
      timestamp: new Date().toISOString(),
      feedbackText: feedback,
      details: reviewDetails,
      fraudCheck: { score: 98, status: 'passed' }
    };

    // Update campaigns state and user wallet balance
    setState(prev => {
      const updatedCampaigns = prev.campaigns.map(c => {
        if (c.id === activeTask.id) {
          return {
            ...c,
            submissionsCount: c.submissionsCount + 1,
            reviews: [...c.reviews, reviewObject]
          };
        }
        return c;
      });

      return {
        ...prev,
        currentUser: {
          ...prev.currentUser,
          balance: prev.currentUser.balance + activeTask.payoutPerReview,
          completedCampaigns: [...prev.currentUser.completedCampaigns, activeTask.id]
        },
        campaigns: updatedCampaigns
      };
    });

    showToast('Task Audited', `Task submitted successfully. +$${activeTask.payoutPerReview.toFixed(2)} credited!`, 'success');
    setActiveTaskId(null);
    setActiveTab('reviewer-tasks');
  };

  // Tab-specific headers
  const tabTitles = {
    'reviewer-tasks': { title: 'Available Audit Tasks', subtitle: 'Browse and accept high-paying review tasks matched to your expertise', crumb: 'Task Feed' },
    'reviewer-sandbox': { title: 'Active Telemetry Sandbox', subtitle: `Auditing: ${activeTask?.title || 'No active task'}`, crumb: 'Workspace' },
    'reviewer-profile': { title: 'Reputation & Profile', subtitle: 'Your integrity metrics, achievements, and auditor credentials', crumb: 'Profile' },
  };

  const currentHeader = tabTitles[activeTab] || tabTitles['reviewer-tasks'];

  // Helper: get task icon
  const getTaskIcon = (type) => {
    if (type === 'video') return 'fa-circle-play';
    if (type === 'website') return 'fa-window-restore';
    return 'fa-images';
  };

  // Helper: get gradient class for task type
  const getTaskGradientClass = (type) => {
    if (type === 'video') return 'task-gradient-violet';
    if (type === 'website') return 'task-gradient-cyan';
    return 'task-gradient-amber';
  };

  const availableTasks = state.campaigns
    .filter(c => c.status === 'active' && !state.currentUser.completedCampaigns.includes(c.id));

  return (
    <div className="dashboard-layout">
      {/* SIDEBAR */}
      <aside className="dashboard-sidebar">
        <div>
          <div className="sidebar-header">
            <i className="fa-solid fa-user-ninja"></i> Reviewer Deck
          </div>
          <ul className="sidebar-menu">
            <li 
              className={activeTab === 'reviewer-tasks' ? 'active-tab' : ''}
              onClick={() => setActiveTab('reviewer-tasks')}
            >
              <i className="fa-solid fa-cubes-stacked"></i> Available Tasks
            </li>
            <li 
              className={activeTab === 'reviewer-sandbox' ? 'active-tab' : ''}
              style={{ pointerEvents: activeTaskId ? 'auto' : 'none', opacity: activeTaskId ? 1 : 0.4 }}
              onClick={() => setActiveTab('reviewer-sandbox')}
              id="tab-reviewer-sandbox"
            >
              <i className="fa-solid fa-laptop-code"></i> Active Workspace
            </li>
            <li 
              className={activeTab === 'reviewer-profile' ? 'active-tab' : ''}
              onClick={() => setActiveTab('reviewer-profile')}
            >
              <i className="fa-solid fa-award"></i> Reputation & Bio
            </li>
          </ul>
        </div>

        {/* Sidebar Wallet Card */}
        <div className="reviewer-sidebar-wallet">
          <div className="wallet-glow-orb"></div>
          <div className="wallet-label">
            <i className="fa-solid fa-wallet"></i> Auditor Wallet
          </div>
          <h4 className="wallet-amount" id="reviewer-sidebar-earnings">
            ${state.currentUser.balance.toFixed(2)}
          </h4>
          <div className="wallet-subtext">
            <span className="wallet-rep-dot"></span>
            Rep: {state.currentUser.reputation}%
          </div>
        </div>
      </aside>

      {/* VIEW PANEL */}
      <div style={{ flex: 1, padding: '0 2rem 2rem 2rem', overflowY: 'auto' }}>
        
        {/* UNIVERSAL PAGE HEADER */}
        <div className="reviewer-page-header">
          <div className="rph-glow-orb rph-orb-1"></div>
          <div className="rph-glow-orb rph-orb-2"></div>
          <div className="header-breadcrumb">
            <span>Reviewer Hub</span>
            <i className="fa-solid fa-chevron-right" style={{ fontSize: '0.6rem' }}></i>
            <span className="active-crumb">{currentHeader.crumb}</span>
          </div>
          <h2>{currentHeader.title}</h2>
          <p className="header-subtitle">{currentHeader.subtitle}</p>
        </div>

        {/* TASK FEED LIST */}
        {activeTab === 'reviewer-tasks' && (
          <div className="sub-tab active-sub-tab">
            
            {/* Enhanced Stats Ribbon */}
            <div className="reviewer-stats-ribbon">
              <div className="reviewer-stat-card fade-in-up stagger-1">
                <div className="rsc-top">
                  <div className="rsc-icon-badge rsc-icon-emerald">
                    <i className="fa-solid fa-wallet"></i>
                  </div>
                  <span className="rsc-trend trend-up">
                    <i className="fa-solid fa-arrow-up" style={{ fontSize: '0.55rem' }}></i> +12%
                  </span>
                </div>
                <div className="rsc-label">Account Wallet</div>
                <div className="rsc-value">${state.currentUser.balance.toFixed(2)}</div>
                <div className="rsc-sparkline">
                  {[35, 42, 38, 55, 48, 62, 58, 70].map((h, i) => (
                    <div key={i} className="rsc-spark-bar" style={{ height: `${h}%` }}></div>
                  ))}
                </div>
              </div>

              <div className="reviewer-stat-card fade-in-up stagger-2">
                <div className="rsc-top">
                  <div className="rsc-icon-badge rsc-icon-violet">
                    <i className="fa-solid fa-award"></i>
                  </div>
                  <span className="rsc-trend trend-up">
                    <i className="fa-solid fa-arrow-up" style={{ fontSize: '0.55rem' }}></i> +2.1
                  </span>
                </div>
                <div className="rsc-label">Reputation Score</div>
                <div className="rsc-value">{state.currentUser.reputation}%</div>
                <div className="rsc-sparkline">
                  {[60, 65, 58, 72, 70, 78, 82, 90].map((h, i) => (
                    <div key={i} className="rsc-spark-bar rsc-bar-violet" style={{ height: `${h}%` }}></div>
                  ))}
                </div>
              </div>

              <div className="reviewer-stat-card fade-in-up stagger-3">
                <div className="rsc-top">
                  <div className="rsc-icon-badge rsc-icon-rose">
                    <i className="fa-solid fa-shield-halved"></i>
                  </div>
                  <span className="rsc-trend trend-up">
                    <i className="fa-solid fa-crown" style={{ fontSize: '0.55rem' }}></i> Top 5%
                  </span>
                </div>
                <div className="rsc-label">Integrity Rank</div>
                <div className="rsc-value">Elite</div>
                <div className="rsc-sparkline">
                  {[80, 82, 85, 88, 90, 92, 94, 98].map((h, i) => (
                    <div key={i} className="rsc-spark-bar rsc-bar-rose" style={{ height: `${h}%` }}></div>
                  ))}
                </div>
              </div>

              <div className="reviewer-stat-card fade-in-up stagger-4">
                <div className="rsc-top">
                  <div className="rsc-icon-badge rsc-icon-amber">
                    <i className="fa-solid fa-bolt-lightning"></i>
                  </div>
                  <span className="rsc-trend trend-up">
                    <i className="fa-solid fa-arrow-up" style={{ fontSize: '0.55rem' }}></i> 3 new
                  </span>
                </div>
                <div className="rsc-label">Available Tasks</div>
                <div className="rsc-value">{availableTasks.length}</div>
                <div className="rsc-sparkline">
                  {[20, 40, 35, 60, 45, 55, 70, 80].map((h, i) => (
                    <div key={i} className="rsc-spark-bar rsc-bar-amber" style={{ height: `${h}%` }}></div>
                  ))}
                </div>
              </div>
            </div>

            {/* Campaign Task Cards */}
            <div className="reviewer-tasks-header fade-in-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
              <h3>
                <i className="fa-solid fa-fire" style={{ fontSize: '0.95rem' }}></i>
                Open Campaigns
              </h3>
              <div className="rth-meta">
                <span className="rth-live-badge">
                  <span className="status-dot dot-active" style={{ marginRight: 0 }}></span>
                  Live Feed
                </span>
                <span className="rth-count">{availableTasks.length} tasks available</span>
              </div>
            </div>

            <div className="reviewer-task-grid fade-in-up" style={{ animationDelay: '0.25s', opacity: 0 }}>
              {availableTasks.map((camp) => (
                <div key={camp.id} className={`reviewer-task-card ${getTaskGradientClass(camp.type)}`}>
                  <div className="rtc-glow-strip"></div>
                  <div className="rtc-header">
                    <div className="rtc-type-badge">
                      <i className={`fa-solid ${getTaskIcon(camp.type)}`}></i>
                      {camp.type}
                    </div>
                    <span className="rtc-match-pill">
                      <i className="fa-solid fa-bullseye"></i> 98% Match
                    </span>
                  </div>
                  <h3 className="rtc-title">{camp.title}</h3>
                  <p className="rtc-desc">{camp.objective}</p>
                  
                  <div className="rtc-meta-chips">
                    <span className="rtc-chip">
                      <i className="fa-solid fa-users"></i> {camp.targetAudience.occupation}
                    </span>
                    <span className="rtc-chip">
                      <i className="fa-solid fa-earth-americas"></i> {camp.targetAudience.geo.split(' ')[0]}
                    </span>
                  </div>

                  <div className="rtc-footer">
                    <div className="rtc-payout">
                      <span className="rtc-payout-label">Payout</span>
                      <span className="rtc-payout-value">${camp.payoutPerReview.toFixed(2)}</span>
                    </div>
                    <button className="btn rtc-accept-btn" onClick={() => handleAcceptTask(camp.id)}>
                      <i className="fa-solid fa-lock-open"></i> Accept & Audit
                    </button>
                  </div>
                </div>
              ))}

              {availableTasks.length === 0 && (
                <div className="reviewer-empty-state">
                  <div className="res-icon-wrap">
                    <i className="fa-solid fa-check-double"></i>
                  </div>
                  <h4>All Tasks Completed</h4>
                  <p>You've audited all available campaigns. New tasks appear as clients launch studies.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ACTIVE WORKSPACE SANDBOX */}
        {activeTab === 'reviewer-sandbox' && activeTask && (
          <div className="sub-tab active-sub-tab">
            
            {/* Video Task workspace */}
            {activeTask.type === 'video' && (
              <div className="grid-2-1">
                <div>
                  <div className="card player-frame margin-bottom-md">
                    <div className="mock-video-wrapper">
                      <video 
                        src={activeTask.url}
                        controls
                        onTimeUpdate={(e) => setSandboxTime(Math.round(e.currentTarget.currentTime))}
                      />
                    </div>
                    <div className="video-helper-pills">
                      <span><i className="fa-solid fa-signal" style={{ color: 'var(--emerald)', marginRight: '6px' }}></i>Telemetry playback tracking active...</span>
                      <span>Playback time: <strong style={{ color: 'var(--primary)' }}>{sandboxTime}s</strong></span>
                    </div>
                  </div>

                  <div className="card comment-wizard-field">
                    <div className="timestamp-stamp">
                      <i className="fa-solid fa-clock" style={{ color: 'var(--amber)', marginRight: '6px' }}></i>
                      Logged timestamp mark: @ {sandboxTime}s
                    </div>
                    <textarea
                      className="form-input"
                      rows="2"
                      placeholder="Input feedback... Minimum characters scanner active."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      onKeyDown={handleKeyPress}
                      style={{ background: 'var(--bg-deep)', border: '1px solid var(--border-subtle)', padding: '10px 14px', width: '100%', color: '#fff', borderRadius: '6px' }}
                    ></textarea>
                    <button className="btn btn-indigo btn-sm margin-top-sm" onClick={handleAddVideoComment}>
                      <i className="fa-solid fa-plus"></i> Add Comment Mark
                    </button>
                  </div>
                </div>

                <div className="card">
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fa-solid fa-list-check text-indigo"></i> Recorded Comments
                  </h4>
                  <ul className="added-comments-log" style={{ listStyle: 'none', paddingLeft: 0 }}>
                    {mockCommentsList.map(c => (
                      <li key={c.id}>
                        <span><strong>@{c.videoTime}s:</strong> {c.text}</span>
                        <button className="btn-remove" onClick={() => setMockCommentsList(prev => prev.filter(item => item.id !== c.id))}>
                          Remove
                        </button>
                      </li>
                    ))}
                    {mockCommentsList.length === 0 && (
                      <div className="sandbox-empty-hint">
                        <i className="fa-solid fa-comment-dots" style={{ fontSize: '1.5rem', opacity: 0.3 }}></i>
                        <p className="small muted">Play video and add timestamped comments...</p>
                      </div>
                    )}
                  </ul>
                </div>
              </div>
            )}

            {/* Mock website clickmap prototype workspace */}
            {activeTask.type === 'website' && (
              <div className="grid-2-1">
                <div>
                  <div className="usability-interactive-area card" style={{ padding: 0 }} onClick={handleAddClickCoords}>
                    <div className="usability-mockup-frame">
                      <div className="mockup-header-bar">
                        <span className="circle-btn"></span>
                        <span className="circle-btn"></span>
                        <span className="circle-btn"></span>
                        <div className="mockup-url-bar">https://fintechlaunch.io/dashboard</div>
                      </div>
                      <div className="mockup-body-wrapper">
                        <div className="mockup-dashboard-layout">
                          <div className="mockup-dash-header">
                            <span className="mockup-logo">FinTech Telemetry OS</span>
                            <span className="mockup-profile-pic"></span>
                          </div>
                          <div className="mockup-dash-grid">
                            <div className="mockup-widget">
                              <h3>Friction Quotient</h3>
                              <div className="mockup-value">4.2%</div>
                              <div className="mockup-sparkline"></div>
                            </div>
                            <div className="mockup-widget">
                              <h3>Active Wallets</h3>
                              <div className="mockup-value">1,080</div>
                            </div>
                            <div className="widget-actions-btn-group">
                              <button className="mockup-btn mockup-secondary">Cancel Request</button>
                              <button className="mockup-btn mockup-primary">Invest Now</button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    {clickCoords && (
                      <div 
                        className="clickmap-pin"
                        style={{ left: `${(clickCoords.x / 600) * 100}%`, top: `${(clickCoords.y / 400) * 100}%` }}
                      >
                        1
                      </div>
                    )}
                  </div>
                </div>

                <div className="card">
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fa-solid fa-crosshairs text-pink"></i> Hotzone Coordinates
                  </h4>
                  {clickCoords ? (
                    <div className="coord-capture-badge">
                      <i className="fa-solid fa-map-pin"></i>
                      Captured: X:{clickCoords.x}, Y:{clickCoords.y}
                    </div>
                  ) : (
                    <div className="sandbox-empty-hint">
                      <i className="fa-solid fa-mouse-pointer" style={{ fontSize: '1.5rem', opacity: 0.3 }}></i>
                      <p className="small text-rose">Click on the mockup to set focal point...</p>
                    </div>
                  )}

                  <textarea
                    className="form-input margin-top-md"
                    rows="3"
                    placeholder="Enter usability comments..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={handleKeyPress}
                    style={{ background: 'var(--bg-deep)', border: '1px solid var(--border-subtle)', padding: '10px 14px', width: '100%', color: '#fff', borderRadius: '6px' }}
                  ></textarea>
                </div>
              </div>
            )}

            {/* Thumbnail A/B preference split workspace */}
            {activeTask.type === 'thumbnail' && (
              <div className="grid-2-1">
                <div className="thumbnail-compare-flex">
                  <label className="compare-selector-label">
                    <input 
                      type="radio" 
                      name="thumb-choice" 
                      value="A" 
                      checked={thumbnailChoice === 'A'} 
                      onChange={() => setThumbnailChoice('A')}
                      style={{ display: 'none' }}
                    />
                    <div className="compare-choice-box">
                      <div className="choice-tag">Option A (Premium Purple)</div>
                      <div className="choice-thumbnail-simulation img-sim-a">
                        <span className="badge-accent">LOGISTICS SYSTEM</span>
                        <h2>The transportation Operating System.</h2>
                        <div className="avatar-overlay avatar-a"></div>
                      </div>
                    </div>
                  </label>

                  <label className="compare-selector-label">
                    <input 
                      type="radio" 
                      name="thumb-choice" 
                      value="B" 
                      checked={thumbnailChoice === 'B'} 
                      onChange={() => setThumbnailChoice('B')}
                      style={{ display: 'none' }}
                    />
                    <div className="compare-choice-box">
                      <div className="choice-tag">Option B (Flashy Orange)</div>
                      <div className="choice-thumbnail-simulation img-sim-b">
                        <span className="badge-accent bg-orange">Dispatch Dashboard</span>
                        <h2>Manage 500K Trucks live coordinates.</h2>
                        <div className="avatar-overlay avatar-b"></div>
                      </div>
                    </div>
                  </label>
                </div>

                <div className="card">
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <i className="fa-solid fa-scale-balanced text-amber"></i> Comparison Reasoning
                  </h4>
                  <textarea
                    className="form-input margin-top-md"
                    rows="3"
                    placeholder="Provide detailed feedback analysis..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={handleKeyPress}
                    style={{ background: 'var(--bg-deep)', border: '1px solid var(--border-subtle)', padding: '10px 14px', width: '100%', color: '#fff', borderRadius: '6px' }}
                  ></textarea>
                </div>
              </div>
            )}

            {/* Submit Verification Controls footer */}
            <div className="reviewer-workspace-footer margin-top-md">
              <div className="rwf-indicators">
                <span className="rwf-indicator-pill">
                  <span className="rwf-dot rwf-dot-violet"></span>
                  Keystroke scanner active
                </span>
                <span className="rwf-indicator-pill">
                  <span className="rwf-dot rwf-dot-emerald"></span>
                  Tab focus intercept
                </span>
                <span className="rwf-indicator-pill">
                  <span className="rwf-dot rwf-dot-rose"></span>
                  Min speed limit: 15s
                </span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-secondary" onClick={() => { setActiveTaskId(null); setActiveTab('reviewer-tasks'); }}>
                  <i className="fa-solid fa-xmark"></i> Abort Audit
                </button>
                <button className="btn rtc-accept-btn" onClick={handleSubmitTask}>
                  <i className="fa-solid fa-paper-plane"></i> Submit Verification
                </button>
              </div>
            </div>
          </div>
        )}

        {/* REPUTATION ROSTER PANEL */}
        {activeTab === 'reviewer-profile' && (
          <div className="sub-tab active-sub-tab">
            
            {/* Profile Header Card */}
            <div className="reviewer-profile-hero fade-in-up">
              <div className="rph-hero-bg-mesh"></div>
              <div className="rph-avatar-section">
                <div className="rph-avatar-ring">
                  <div className="rph-avatar-inner">
                    <i className="fa-solid fa-user-ninja"></i>
                  </div>
                </div>
                <div className="rph-avatar-info">
                  <h3>{state.currentUser.name}</h3>
                  <p className="rph-role-tag">
                    <i className="fa-solid fa-crown"></i> Elite Auditor
                  </p>
                  <div className="rph-badges-inline">
                    {state.currentUser.badges.map((badge, idx) => (
                      <span key={idx} className="rph-mini-badge">
                        <i className="fa-solid fa-ribbon"></i> {badge}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Score Rings Grid */}
            <div className="reviewer-scores-grid fade-in-up" style={{ animationDelay: '0.1s', opacity: 0 }}>
              <div className="reviewer-score-card rsc-glow-violet">
                <div className="rscr-label">Integrity Index</div>
                <ReviewerScoreRing 
                  value={state.currentUser.reputation} 
                  color="var(--primary)" 
                  label="Integrity"
                  size={140}
                />
                <div className="rscr-footer">
                  <span className="text-indigo">Elite Auditor Rank</span>
                </div>
              </div>

              <div className="reviewer-score-card rsc-glow-emerald">
                <div className="rscr-label">Trust Score</div>
                <ReviewerScoreRing 
                  value={99.2} 
                  color="var(--emerald)" 
                  label="Trust"
                  size={140}
                />
                <div className="rscr-footer">
                  <span className="text-success">Verified Human</span>
                </div>
              </div>

              <div className="reviewer-score-card rsc-glow-amber">
                <div className="rscr-label">Response Quality</div>
                <ReviewerScoreRing 
                  value={96} 
                  max={100}
                  color="var(--amber)" 
                  label="Quality"
                  size={140}
                />
                <div className="rscr-footer">
                  <span className="text-amber">A+ Feedback Tier</span>
                </div>
              </div>
            </div>

            {/* Account Metrics Card */}
            <div className="reviewer-metrics-card fade-in-up" style={{ animationDelay: '0.2s', opacity: 0 }}>
              <div className="rmc-header">
                <div className="rmc-header-icon">
                  <i className="fa-solid fa-chart-pie"></i>
                </div>
                <div>
                  <h4>Account Metrics</h4>
                  <p className="small muted">Your comprehensive performance overview</p>
                </div>
              </div>
              <div className="rmc-body">
                <div className="rmc-metric-row">
                  <div className="rmc-metric-item">
                    <span className="rmc-metric-icon text-success"><i className="fa-solid fa-coins"></i></span>
                    <div className="rmc-metric-info">
                      <span className="rmc-metric-label">Total Payouts</span>
                      <strong className="rmc-metric-value text-success">${(state.currentUser.balance - 145.50 + 32.50).toFixed(2)}</strong>
                    </div>
                  </div>
                  <div className="rmc-metric-item">
                    <span className="rmc-metric-icon text-indigo"><i className="fa-solid fa-clipboard-check"></i></span>
                    <div className="rmc-metric-info">
                      <span className="rmc-metric-label">Completed Audits</span>
                      <strong className="rmc-metric-value">{state.currentUser.completedCampaigns.length}</strong>
                    </div>
                  </div>
                  <div className="rmc-metric-item">
                    <span className="rmc-metric-icon text-amber"><i className="fa-solid fa-clock"></i></span>
                    <div className="rmc-metric-info">
                      <span className="rmc-metric-label">Avg Response Time</span>
                      <strong className="rmc-metric-value text-amber">3.8 min</strong>
                    </div>
                  </div>
                  <div className="rmc-metric-item">
                    <span className="rmc-metric-icon text-rose"><i className="fa-solid fa-triangle-exclamation"></i></span>
                    <div className="rmc-metric-info">
                      <span className="rmc-metric-label">Fraud Flags</span>
                      <strong className="rmc-metric-value text-rose">0</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Achievement Badges */}
            <div className="reviewer-badges-card fade-in-up" style={{ animationDelay: '0.3s', opacity: 0 }}>
              <div className="rbc-header">
                <i className="fa-solid fa-trophy text-amber"></i>
                <h4>Achievement Badges</h4>
              </div>
              <div className="rbc-grid">
                {state.currentUser.badges.map((badge, idx) => (
                  <div key={idx} className="rbc-badge-item">
                    <div className={`rbc-badge-icon rbc-badge-color-${idx % 4}`}>
                      <i className={`fa-solid ${idx === 0 ? 'fa-laptop-code' : idx === 1 ? 'fa-microchip' : idx === 2 ? 'fa-magnifying-glass' : 'fa-medal'}`}></i>
                    </div>
                    <span className="rbc-badge-text">{badge}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
