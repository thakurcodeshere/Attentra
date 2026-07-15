import { useState, useEffect, useRef } from 'react';

const getNowTimestamp = () => new Date().getTime();

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

        <div className="sidebar-footer-stat">
          <div className="small muted">Auditor Wallet</div>
          <h4 className="text-success" id="reviewer-sidebar-earnings" style={{ fontSize: '1.25rem', marginTop: '3px' }}>
            ${state.currentUser.balance.toFixed(2)}
          </h4>
        </div>
      </aside>

      {/* VIEW PANEL */}
      <div style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
        
        {/* TASK FEED LIST */}
        {activeTab === 'reviewer-tasks' && (
          <div className="sub-tab active-sub-tab">
            <h2 className="margin-bottom-md">Available Audit Tasks</h2>
            
            {/* Stats Roster */}
            <div className="stats-grid margin-bottom-md">
              <div className="stat-card">
                <div className="stat-icon"><i className="fa-solid fa-wallet text-success"></i></div>
                <div className="stat-info">
                  <h4>Account Wallet</h4>
                  <div className="value">${state.currentUser.balance.toFixed(2)}</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><i className="fa-solid fa-award text-indigo"></i></div>
                <div className="stat-info">
                  <h4>Reputation Score</h4>
                  <div className="value">{state.currentUser.reputation}%</div>
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon"><i className="fa-solid fa-shield-halved text-rose"></i></div>
                <div className="stat-info">
                  <h4>Integrity Rank</h4>
                  <div className="value">Elite Auditor</div>
                </div>
              </div>
            </div>

            {/* Campaign Grid Cards */}
            <div className="campaign-grid">
              {state.campaigns
                .filter(c => c.status === 'active' && !state.currentUser.completedCampaigns.includes(c.id))
                .map(camp => {
                  return (
                    <div key={camp.id} className="job-card">
                      <div className="job-header-row">
                        <span className="job-type-pill">{camp.type}</span>
                        <span className="job-match-score">98% Match</span>
                      </div>
                      <h3>{camp.title}</h3>
                      <p className="job-desc">{camp.objective}</p>
                      
                      <div className="job-meta-row">
                        <div className="job-payout">${camp.payoutPerReview.toFixed(2)}</div>
                        <button className="btn btn-indigo btn-sm" onClick={() => handleAcceptTask(camp.id)}>
                          <i className="fa-solid fa-lock-open"></i> Accept & Audit
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* ACTIVE WORKSPACE SANDBOX */}
        {activeTab === 'reviewer-sandbox' && activeTask && (
          <div className="sub-tab active-sub-tab">
            <h2 className="margin-bottom-md">Active Telemetry Sandbox</h2>
            
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
                      <span>Telemetry playback tracking active...</span>
                      <span>Playback time: <strong>{sandboxTime}s</strong></span>
                    </div>
                  </div>

                  <div className="card comment-wizard-field">
                    <div className="timestamp-stamp">Logged timestamp mark: @ {sandboxTime}s</div>
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
                      Add Comment Mark
                    </button>
                  </div>
                </div>

                <div className="card">
                  <h4>Recorded Comments Checklist</h4>
                  <ul className="added-comments-log" style={{ listStyle: 'none', paddingLeft: 0 }}>
                    {mockCommentsList.map(c => (
                      <li key={c.id}>
                        <span><strong>@{c.videoTime}s:</strong> {c.text}</span>
                        <button className="btn-remove" onClick={() => setMockCommentsList(prev => prev.filter(item => item.id !== c.id))}>
                          Remove
                        </button>
                      </li>
                    ))}
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
                  <h4>Capture hotzone coordinate remarks</h4>
                  {clickCoords ? (
                    <div className="small text-success">Captured Pin coordinates: X:{clickCoords.x}, Y:{clickCoords.y}</div>
                  ) : (
                    <div className="small text-rose">Click coordinates on prototype mockup canvas to set focal point...</div>
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
                  <h4>Explain comparison reasoning</h4>
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
            <div className="card workspace-footer-card margin-top-md" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-subtle)' }}>
              <div className="workspace-fraud-indicators">
                <span className="indicator-pill text-indigo"><i className="fa-solid fa-circle"></i> Keystrokes dynamics scanner active</span>
                <span className="indicator-pill text-success"><i className="fa-solid fa-circle"></i> Tab focus intercept active</span>
                <span className="indicator-pill text-rose"><i className="fa-solid fa-circle"></i> Minimum speed limit check: 15s</span>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="btn btn-secondary" onClick={() => { setActiveTaskId(null); setActiveTab('reviewer-tasks'); }}>
                  Abort Audit
                </button>
                <button className="btn btn-indigo" onClick={handleSubmitTask}>
                  Submit Verification
                </button>
              </div>
            </div>
          </div>
        )}

        {/* REPUTATION ROSTER PANEL */}
        {activeTab === 'reviewer-profile' && (
          <div className="sub-tab active-sub-tab">
            <h2 className="margin-bottom-md">Reviewer Profile & Integrity Roster</h2>
            <div className="reputation-grid">
              <div className="rep-card">
                <h5>Integrity Index</h5>
                <div className="rep-circle-container">
                  <svg className="rep-progress-svg" viewBox="0 0 100 100">
                    <circle className="bg-circle" cx="50" cy="50" r="40" />
                    <circle 
                      className="fill-circle" 
                      cx="50" 
                      cy="50" 
                      r="40" 
                      style={{ strokeDashoffset: 251.2 - (251.2 * (state.currentUser.reputation / 100)) }}
                    />
                  </svg>
                  <div className="rep-score-number">{state.currentUser.reputation}%</div>
                </div>
                <div className="rep-meta-footer text-indigo font-rose">Elite Auditor Rank</div>
              </div>

              <div className="card stat-sub-card">
                <h3 className="margin-bottom-md">Account Metrics</h3>
                <div className="metric-row">
                  <span className="muted">Total payouts collected:</span>
                  <strong className="text-success">${(state.currentUser.balance - 145.50 + 32.50).toFixed(2)}</strong>
                </div>
                <div className="metric-row">
                  <span className="muted">Completed campaign audits:</span>
                  <strong>{state.currentUser.completedCampaigns.length}</strong>
                </div>
                <div className="metric-row">
                  <span className="muted">Trust score index:</span>
                  <strong className="text-indigo">99.2% Rating</strong>
                </div>

                <h4 className="margin-top-md margin-bottom-sm">Achievement Badges</h4>
                <div className="badges-flex">
                  {state.currentUser.badges.map((badge, idx) => (
                    <span key={idx} className="credential-badge">
                      <i className="fa-solid fa-ribbon"></i> {badge}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
