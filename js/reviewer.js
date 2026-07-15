/* ==========================================================================
   ATTENTRA REVIEWER HUB CONTROLLER (TASKS & FRAUD SIMULATION)
   ========================================================================== */

// --- STATE VARIABLES FOR ACTIVE TASK SESSION ---
let activeCampaign = null;
let activeTaskStart = 0;
let focusLosses = 0;
let temporaryVideoComments = [];
let temporaryUsabilityPins = [];
let keystrokeCounter = 0;
let typingAnomalies = false;

// --- INITIALIZE REVIEWER HUB ---
window.initializeReviewerPortal = function() {
  renderReviewerProfile();
  renderReviewerTasks();
};

// --- RENDER PROFILE SCORECARD & HISTORY ---
window.renderReviewerProfile = function() {
  // Update Profile Stats
  document.getElementById("profile-rep-score").innerText = gState.currentUser.reputation.toFixed(1);
  document.getElementById("rep-score-ring").style.strokeDashoffset = 251.2 - (251.2 * (gState.currentUser.reputation / 100));

  // Render Badges
  const badgesList = document.getElementById("reviewer-badges-list");
  if (badgesList) {
    badgesList.innerHTML = "";
    gState.currentUser.badges.forEach(b => {
      const pill = document.createElement("div");
      pill.className = "credential-badge";
      pill.innerHTML = `<i class="fa-solid fa-certificate"></i> ${b}`;
      badgesList.appendChild(pill);
    });
  }

  // Render History Table
  const historyTable = document.getElementById("reviewer-history-table");
  if (historyTable) {
    historyTable.innerHTML = "";
    
    // Reverse sort campaigns completed (if any)
    const completedIds = gState.currentUser.completedCampaigns;
    if (completedIds.length <= 1) {
      // Pre-populate mock history details if empty
      historyTable.innerHTML = `
        <tr>
          <td>2026-07-14</td>
          <td><strong>Logistics Homepage Design</strong></td>
          <td><span class="text-success">$5.00</span></td>
          <td><span class="badge badge-emerald">A+ (98%)</span></td>
          <td><span class="badge badge-emerald"><i class="fa-solid fa-circle-check"></i> Escrow Released</span></td>
        </tr>
        <tr>
          <td>2026-07-13</td>
          <td><strong>Tech Blog SEO Layout</strong></td>
          <td><span class="text-success">$3.00</span></td>
          <td><span class="badge badge-purple">B (88%)</span></td>
          <td><span class="badge badge-emerald"><i class="fa-solid fa-circle-check"></i> Escrow Released</span></td>
        </tr>
      `;
      return;
    }

    completedIds.forEach(id => {
      if (id === "camp-999") return; // skip base placeholder
      const camp = gState.campaigns.find(c => c.id === id);
      if (!camp) return;

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${new Date().toLocaleDateString()}</td>
        <td><strong>${camp.title}</strong></td>
        <td><span class="text-success">$${camp.payoutPerReview.toFixed(2)}</span></td>
        <td><span class="badge badge-emerald">A (95%)</span></td>
        <td><span class="badge badge-emerald"><i class="fa-solid fa-circle-check"></i> Escrow Released</span></td>
      `;
      historyTable.appendChild(tr);
    });
  }
};

// --- RENDER AVAILABLE PROJECTS FEED ---
window.renderReviewerTasks = function() {
  const jobsList = document.getElementById("reviewer-available-tasks-list");
  if (!jobsList) return;
  jobsList.innerHTML = "";

  // Filter active campaigns that the reviewer has NOT completed yet
  const availableCamps = gState.campaigns.filter(camp => {
    return camp.status === "active" && !gState.currentUser.completedCampaigns.includes(camp.id);
  });

  if (availableCamps.length === 0) {
    jobsList.innerHTML = `
      <div class="card glass-card text-center" style="grid-column: 1 / -1; padding: 3rem;">
        <i class="fa-regular fa-folder-open" style="font-size:3rem; color:var(--text-muted); margin-bottom:1rem;"></i>
        <h3>No Matched Campaigns Available</h3>
        <p class="muted">You have completed all campaigns corresponding to your profile tags. Check back later or adjust parameters in the Admin Panel.</p>
      </div>
    `;
    return;
  }

  availableCamps.forEach(camp => {
    const card = document.createElement("div");
    card.className = "job-card";

    let matchPct = 95;
    if (camp.targetAudience.occupation === "Developers" && !gState.currentUser.badges.includes("Software Engineer")) {
      matchPct = 60; // Lower match if demographics mismatch
    } else if (camp.targetAudience.occupation === "Developers") {
      matchPct = 99;
    }

    let typeLabel = "Video Review";
    if (camp.type === "website") typeLabel = "UI/UX Usability";
    if (camp.type === "thumbnail") typeLabel = "A/B Comparison";

    card.innerHTML = `
      <div>
        <div class="job-header-row">
          <span class="job-type-pill">${typeLabel}</span>
          <span class="job-match-score"><i class="fa-solid fa-bolt"></i> ${matchPct}% Match</span>
        </div>
        <h3>${camp.title}</h3>
        <p class="job-desc">${camp.objective}</p>
        <p class="muted small margin-bottom-md">
          Target: <strong>${camp.targetAudience.occupation}</strong> | Device: <strong>${camp.targetAudience.device || 'Any'}</strong>
        </p>
      </div>
      <div class="job-meta-row">
        <div class="job-payout">$${camp.payoutPerReview.toFixed(2)}</div>
        <button class="btn btn-primary btn-sm" onclick="acceptCampaignJob('${camp.id}')">Accept & Start</button>
      </div>
    `;
    jobsList.appendChild(card);
  });
};

// --- ACCEPT CAMPAIGN / OPEN WORKSPACE SANDBOX ---
window.acceptCampaignJob = function(campId) {
  const camp = gState.campaigns.find(c => c.id === campId);
  if (!camp) return;

  // Initialize workspace variables
  activeCampaign = camp;
  activeTaskStart = Date.now();
  focusLosses = 0;
  temporaryVideoComments = [];
  temporaryUsabilityPins = [];
  keystrokeCounter = 0;
  typingAnomalies = false;

  // Setup workspace UI headers
  let typeLabel = "Video Hook Test";
  if (camp.type === "website") typeLabel = "UI/UX Usability Canvas";
  if (camp.type === "thumbnail") typeLabel = "Thumbnail Preference Vote";

  document.getElementById("task-badge-type").innerText = typeLabel;
  document.getElementById("task-detail-title").innerText = camp.title;
  document.getElementById("task-detail-instructions").innerText = camp.objective;
  document.getElementById("task-detail-payout").innerText = `$${camp.payoutPerReview.toFixed(2)}`;

  // Show the workspace sub-tab navigation
  const workspaceTabNav = document.getElementById("reviewer-workspace-tab");
  workspaceTabNav.classList.remove("hidden-tab-nav");

  // Toggle active workspace templates
  const videoWorkspace = document.getElementById("workspace-type-video");
  const webWorkspace = document.getElementById("workspace-type-website");
  const thumbWorkspace = document.getElementById("workspace-type-thumbnail");

  videoWorkspace.classList.add("hidden");
  webWorkspace.classList.add("hidden");
  thumbWorkspace.classList.add("hidden");

  // Reset inputs
  document.getElementById("reviewer-video-comment-input").value = "";
  document.getElementById("reviewer-added-comments-list").innerHTML = "";
  document.getElementById("reviewer-added-pins-list").innerHTML = "";
  document.getElementById("usability-clickmap-pins-container").innerHTML = "";
  document.getElementById("reviewer-coordinate-comment-input").value = "";
  document.getElementById("reviewer-coordinate-comment-input").disabled = true;
  document.getElementById("add-coordinate-comment-btn").disabled = true;
  document.getElementById("reviewer-thumbnail-comment-input").value = "";

  if (camp.type === "video") {
    videoWorkspace.classList.remove("hidden");
    // Load Video player
    const video = document.getElementById("reviewer-video-player");
    if (video) {
      video.load();
      video.play().catch(e => console.log("Auto-play blocked by browser. User interaction needed."));
    }
  } else if (camp.type === "website") {
    webWorkspace.classList.remove("hidden");
  } else if (camp.type === "thumbnail") {
    thumbWorkspace.classList.remove("hidden");
  }

  // Set active indicators
  updateFraudIndicators();

  // Jump to workspace view
  activateTab("reviewer", "reviewer-sandbox");
  showToast("Task Accepted", " Escrow locked. Anti-fraud surveillance is active. Maintain tab focus.", "info");
};

// --- VIDEO PLAYER INTERACTIONS ---
const videoPlayer = document.getElementById("reviewer-video-player");
const timeBadge = document.getElementById("player-time-badge");
const commentTimeBadge = document.getElementById("current-comment-timestamp");

if (videoPlayer) {
  videoPlayer.addEventListener("timeupdate", () => {
    const curTime = Math.floor(videoPlayer.currentTime);
    timeBadge.innerText = formatTimeSeconds(curTime);
    commentTimeBadge.innerText = `@ ${formatTimeSeconds(curTime)}`;
  });
  
  videoPlayer.addEventListener("pause", () => {
    // Show visual indicator dot on the video player frame just for aesthetic micro-animation
    const dot = document.getElementById("attention-dot");
    if (dot) {
      dot.style.opacity = "1";
      setTimeout(() => dot.style.opacity = "0", 800);
    }
  });
}

document.getElementById("add-video-comment-btn")?.addEventListener("click", () => {
  const commentInput = document.getElementById("reviewer-video-comment-input");
  const commentText = commentInput.value.trim();
  if (!commentText) return;

  const currentSecs = Math.floor(videoPlayer.currentTime);

  // Add to local temp list
  temporaryVideoComments.push({
    time: currentSecs,
    text: commentText
  });

  // Render to list
  const list = document.getElementById("reviewer-added-comments-list");
  const li = document.createElement("li");
  li.innerHTML = `
    <div><strong>@ ${formatTimeSeconds(currentSecs)}</strong>: "${commentText}"</div>
    <button class="btn-remove" onclick="removeTempVideoComment(${temporaryVideoComments.length - 1})"><i class="fa-solid fa-trash-can"></i></button>
  `;
  list.appendChild(li);

  // Clear & notify
  commentInput.value = "";
  showToast("Comment Saved", `Remark added at timestamp ${formatTimeSeconds(currentSecs)}.`, "success");
});

window.removeTempVideoComment = function(index) {
  temporaryVideoComments.splice(index, 1);
  // Re-render list
  const list = document.getElementById("reviewer-added-comments-list");
  list.innerHTML = "";
  temporaryVideoComments.forEach((c, idx) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <div><strong>@ ${formatTimeSeconds(c.time)}</strong>: "${c.text}"</div>
      <button class="btn-remove" onclick="removeTempVideoComment(${idx})"><i class="fa-solid fa-trash-can"></i></button>
    `;
    list.appendChild(li);
  });
};

// --- WEBPAGE USABILITY INTERACTIONS (CLICK TO MARK PINS) ---
const usabilityArea = document.getElementById("usability-interactive-area");
let selectedCoords = null;

usabilityArea?.addEventListener("click", (e) => {
  const rect = usabilityArea.getBoundingClientRect();
  const x = Math.round(e.clientX - rect.left);
  const y = Math.round(e.clientY - rect.top);
  
  // Normalized coordinates matching our 600x400 default schema
  const normalizedX = Math.round((x / rect.width) * 600);
  const normalizedY = Math.round((y / rect.height) * 400);

  selectedCoords = { x: normalizedX, y: normalizedY };

  // Drop temporary visual pin marker in coordinates
  let container = document.getElementById("usability-clickmap-pins-container");
  
  // Clear any unsaved temporary pin (we only configure one unsaved pin at a time)
  const unsavedPin = document.getElementById("temp-unsaved-pin");
  if (unsavedPin) unsavedPin.remove();

  const pin = document.createElement("div");
  pin.id = "temp-unsaved-pin";
  pin.className = "clickmap-pin";
  pin.style.left = `${(x / rect.width) * 100}%`;
  pin.style.top = `${(y / rect.height) * 100}%`;
  pin.style.background = "var(--rose)"; // Red for unsaved coordinate
  pin.innerText = "?";
  
  container.appendChild(pin);

  // Enable comment input
  document.getElementById("current-coordinate-stamp").innerText = `Dropped Pin Coordinates: (${normalizedX}, ${normalizedY})`;
  const commentInput = document.getElementById("reviewer-coordinate-comment-input");
  commentInput.disabled = false;
  commentInput.focus();
  document.getElementById("add-coordinate-comment-btn").disabled = false;
});

document.getElementById("add-coordinate-comment-btn")?.addEventListener("click", () => {
  if (!selectedCoords) return;

  const commentInput = document.getElementById("reviewer-coordinate-comment-input");
  const commentText = commentInput.value.trim();
  if (!commentText) return;

  // Save pin details to list
  const newPin = {
    x: selectedCoords.x,
    y: selectedCoords.y,
    text: commentText
  };
  temporaryUsabilityPins.push(newPin);

  // Convert temporary red pin to permanent purple pin on mockup
  const tempPin = document.getElementById("temp-unsaved-pin");
  if (tempPin) {
    tempPin.id = `pin-${temporaryUsabilityPins.length}`;
    tempPin.style.background = "var(--primary)"; // Purple for saved coordinate
    tempPin.innerText = temporaryUsabilityPins.length;
  }

  // Render to list
  const list = document.getElementById("reviewer-added-pins-list");
  const li = document.createElement("li");
  li.innerHTML = `
    <div><strong>Pin #${temporaryUsabilityPins.length} (${newPin.x}, ${newPin.y})</strong>: "${commentText}"</div>
    <button class="btn-remove" onclick="removeTempPin(${temporaryUsabilityPins.length - 1})"><i class="fa-solid fa-trash-can"></i></button>
  `;
  list.appendChild(li);

  // Reset inputs
  commentInput.value = "";
  commentInput.disabled = true;
  document.getElementById("add-coordinate-comment-btn").disabled = true;
  document.getElementById("current-coordinate-stamp").innerText = "Pin Coordinates: Select point...";
  selectedCoords = null;
  
  showToast("Pin Feedback Logged", "Click coordinate comments saved to checklist.", "success");
});

window.removeTempPin = function(index) {
  temporaryUsabilityPins.splice(index, 1);
  // Re-render pins list and mockup pin nodes
  const list = document.getElementById("reviewer-added-pins-list");
  list.innerHTML = "";

  const container = document.getElementById("usability-clickmap-pins-container");
  container.innerHTML = "";

  const rect = usabilityArea.getBoundingClientRect();

  temporaryUsabilityPins.forEach((pin, idx) => {
    // Add back mockup pin Node
    const pNode = document.createElement("div");
    pNode.id = `pin-${idx + 1}`;
    pNode.className = "clickmap-pin";
    // Scale normalized coordinates back to rect width
    pNode.style.left = `${(pin.x / 600) * 100}%`;
    pNode.style.top = `${(pin.y / 400) * 100}%`;
    pNode.innerText = idx + 1;
    container.appendChild(pNode);

    // Add back to checklist
    const li = document.createElement("li");
    li.innerHTML = `
      <div><strong>Pin #${idx + 1} (${pin.x}, ${pin.y})</strong>: "${pin.text}"</div>
      <button class="btn-remove" onclick="removeTempPin(${idx})"><i class="fa-solid fa-trash-can"></i></button>
    `;
    list.appendChild(li);
  });
};

// ================= ANTI-FRAUD SIMULATION ENGINE =================

// 1. Tab Focus Loss Audit Listener
document.addEventListener("visibilitychange", () => {
  // Only trigger if reviewer is currently inside the active workspace
  const workspaceActive = document.getElementById("tab-reviewer-sandbox").classList.contains("active-sub-tab");
  if (workspaceActive && document.hidden) {
    focusLosses++;
    
    // Pause video
    const video = document.getElementById("reviewer-video-player");
    if (video) video.pause();

    // Trigger Warning Overlay UI
    const overlay = document.getElementById("fraud-warning-overlay");
    overlay.classList.remove("hidden");

    // Trigger System logs & Notification toasts
    showToast("Attention Audit Triggered", "Document visibility lost. Focus monitored.", "warning");
    updateFraudIndicators();

    // Log to admin fraud logs state
    gState.fraudLogs.unshift({
      timestamp: new Date().toISOString(),
      reviewerId: "rev-alex (You)",
      flag: "Tab Focus Loss (Attention Bypass)",
      severity: "Medium",
      consequence: "Focus Warned",
      details: `Switched tabs while completing '${activeCampaign.title}' research task.`
    });
    saveAppState(gState);
  }
});

// Resume task button handler
document.getElementById("resume-task-btn")?.addEventListener("click", () => {
  const overlay = document.getElementById("fraud-warning-overlay");
  overlay.classList.add("hidden");
  
  const video = document.getElementById("reviewer-video-player");
  if (video && activeCampaign.type === "video") {
    video.play().catch(e => console.log(e));
  }
});

// 2. Keystroke Dynamics Logging
const commentInputs = [
  document.getElementById("reviewer-video-comment-input"),
  document.getElementById("reviewer-coordinate-comment-input"),
  document.getElementById("reviewer-thumbnail-comment-input")
];

commentInputs.forEach(input => {
  input?.addEventListener("keypress", () => {
    keystrokeCounter++;
  });
});

// Check typing dynamics speed limit every 2.5 seconds
setInterval(() => {
  const workspaceActive = document.getElementById("tab-reviewer-sandbox").classList.contains("active-sub-tab");
  if (workspaceActive && keystrokeCounter > 0) {
    // If characters typed in 2.5 seconds exceeds 40 characters (equivalent to ~16 chars/sec or 960 CPM)
    // this is a high indication of machine spoofing or rapid copy-pasting
    if (keystrokeCounter > 40) {
      typingAnomalies = true;
      updateFraudIndicators();
      showToast("Typing Speed Alert", "Anomaly detected in character insertion velocity.", "warning");
      
      gState.fraudLogs.unshift({
        timestamp: new Date().toISOString(),
        reviewerId: "rev-alex (You)",
        flag: "Keystroke Velocity Anomaly",
        severity: "High",
        consequence: "Friction Prompts Enabled",
        details: `Typed at excessive speed (${Math.round(keystrokeCounter/2.5)} chars/sec). Suspicious copy-paste pattern.`
      });
      saveAppState(gState);
    }
    keystrokeCounter = 0;
  }
}, 2500);

// Update visual indicators in task workspace footer
function updateFraudIndicators() {
  const focusPill = document.getElementById("indicator-focus");
  const timerPill = document.getElementById("indicator-timer");
  const keyPill = document.getElementById("indicator-keystroke");

  // Focus
  if (focusLosses === 0) {
    focusPill.className = "indicator-pill text-success";
    focusPill.innerHTML = `<i class="fa-solid fa-circle"></i> Active Focus Monitor`;
  } else {
    focusPill.className = "indicator-pill text-rose";
    focusPill.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> Focus Lost (${focusLosses})`;
  }

  // Keystrokes
  if (!typingAnomalies) {
    keyPill.className = "indicator-pill text-success";
    keyPill.innerHTML = `<i class="fa-solid fa-keyboard"></i> Keystrokes Normal`;
  } else {
    keyPill.className = "indicator-pill text-rose";
    keyPill.innerHTML = `<i class="fa-solid fa-fingerprint"></i> Input Speed Flagged`;
  }
}

// ================= TASK SUBMISSION & QUALITY VALIDATION =================

document.getElementById("submit-review-task-btn")?.addEventListener("click", () => {
  if (!activeCampaign) return;

  // 1. Gather written comment text elements
  let finalFeedbackText = "";
  let feedbackReviewObj = null;

  if (activeCampaign.type === "video") {
    if (temporaryVideoComments.length === 0) {
      showToast("Submissions Blocked", "Please add at least one timestamp comment to proceed.", "warning");
      return;
    }
    
    // Concat comment texts for semantic validation check
    finalFeedbackText = temporaryVideoComments.map(c => c.text).join(". ");
    
    // Gather details object
    feedbackReviewObj = {
      id: `rev-${Date.now().toString().slice(-4)}`,
      reviewerName: gState.currentUser.name,
      rating: 4.5,
      timestamp: new Date().toISOString(),
      feedbackText: temporaryVideoComments[0].text,
      details: { videoTime: temporaryVideoComments[0].time },
      fraudCheck: { score: 100, status: "passed" }
    };
  } else if (activeCampaign.type === "website") {
    if (temporaryUsabilityPins.length === 0) {
      showToast("Submissions Blocked", "Please click the mockup to add at least one pin with feedback.", "warning");
      return;
    }
    
    finalFeedbackText = temporaryUsabilityPins.map(p => p.text).join(". ");
    
    feedbackReviewObj = {
      id: `rev-${Date.now().toString().slice(-4)}`,
      reviewerName: gState.currentUser.name,
      rating: 4.2,
      timestamp: new Date().toISOString(),
      feedbackText: temporaryUsabilityPins[0].text,
      details: { clickX: temporaryUsabilityPins[0].x, clickY: temporaryUsabilityPins[0].y },
      fraudCheck: { score: 100, status: "passed" }
    };
  } else if (activeCampaign.type === "thumbnail") {
    const commentVal = document.getElementById("reviewer-thumbnail-comment-input").value.trim();
    if (!commentVal) {
      showToast("Submissions Blocked", "Please justify your thumbnail preference with a detailed description.", "warning");
      return;
    }
    
    finalFeedbackText = commentVal;
    const voteChoice = document.querySelector('input[name="thumbnail-vote"]:checked').value;
    
    feedbackReviewObj = {
      id: `rev-${Date.now().toString().slice(-4)}`,
      reviewerName: gState.currentUser.name,
      rating: 4.8,
      timestamp: new Date().toISOString(),
      feedbackText: commentVal,
      details: { votedFor: voteChoice },
      fraudCheck: { score: 100, status: "passed" }
    };
  }

  // Get Admin Min Char parameters from localStorage
  const minCharsLimit = parseInt(localStorage.getItem("attentra_min_chars")) || 30;

  // 2. Perform Audit checks
  // A. Speed-run check (minimum duration must be 10 seconds of active work)
  const durationSecs = Math.round((Date.now() - activeTaskStart) / 1000);
  if (durationSecs < 10) {
    showToast("Audit Failed", "Task rejected. Speed-running metrics detected (Task completed too fast).", "error");
    
    // Penalize reputation score
    gState.currentUser.reputation = Math.max(gState.currentUser.reputation - 5.0, 50.0);
    
    gState.fraudLogs.unshift({
      timestamp: new Date().toISOString(),
      reviewerId: "rev-alex (You)",
      flag: "Speed-running Survey",
      severity: "High",
      consequence: "Task Auto-Rejected & Rep -5.0",
      details: `Completed task in ${durationSecs}s. Speed threshold violated.`
    });
    
    saveAppState(gState);
    updateHeaderWidgets();
    
    // Hide workspace and redirect to dashboard
    closeWorkspaceSession();
    return;
  }

  // B. Content spam checks (character limit check)
  if (finalFeedbackText.length < minCharsLimit) {
    showToast("Audit Failed", `Your feedback details are too short (min ${minCharsLimit} chars required). Explain your findings in more detail.`, "warning");
    return;
  }

  // C. Focus Loss penalties
  let auditScore = 100;
  if (focusLosses > 0) {
    auditScore -= Math.min(focusLosses * 15, 60);
  }
  if (typingAnomalies) {
    auditScore -= 20;
  }

  // Adjust rating of reviewer profile based on focus score
  feedbackReviewObj.fraudCheck.score = auditScore;

  // Trigger Simulated Neural Net validation check modal
  const submitBtn = document.getElementById("submit-review-task-btn");
  const oldText = submitBtn.innerHTML;
  submitBtn.disabled = true;
  submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> AI Scanning Quality...`;

  setTimeout(() => {
    // Escrow payout released!
    const rewardVal = activeCampaign.payoutPerReview;
    
    // Update local state database variables
    gState.currentUser.balance += rewardVal;
    // Deduct or adjust reputation based on focus losses
    if (auditScore < 80) {
      gState.currentUser.reputation = Math.max(gState.currentUser.reputation - 1.2, 50.0);
      showToast("Quality Audited", "Payout released. Mild reputation penalty due to focus loss alerts.", "warning");
    } else {
      gState.currentUser.reputation = Math.min(gState.currentUser.reputation + 0.5, 100.0);
      showToast("AI Audit Approved", "Insights verified! Escrow rewards released to your wallet.", "success");
    }

    // Push review to campaign object reviews
    const campInState = gState.campaigns.find(c => c.id === activeCampaign.id);
    if (campInState) {
      campInState.reviews.push(feedbackReviewObj);
      campInState.submissionsCount++;
      
      // Update Client campaign metrics simulations
      if (campInState.type === "video") {
        campInState.attentionScore = Math.round((campInState.attentionScore * 5 + auditScore) / 6);
      }
    }

    // Save campaign to user completed checklist
    gState.currentUser.completedCampaigns.push(activeCampaign.id);
    saveAppState(gState);

    // Reset button
    submitBtn.disabled = false;
    submitBtn.innerHTML = oldText;

    // Reset Header widgets
    updateHeaderWidgets();

    // Close workspace session
    closeWorkspaceSession();
  }, 1800);
});

function closeWorkspaceSession() {
  // Hide active workspace sidebar tab nav
  const workspaceTabNav = document.getElementById("reviewer-workspace-tab");
  workspaceTabNav.classList.add("hidden-tab-nav");

  // Pause video if active
  const video = document.getElementById("reviewer-video-player");
  if (video) video.pause();

  activeCampaign = null;

  // Switch back to Profile scorecard
  activateTab("reviewer", "reviewer-profile");
}

function formatTimeSeconds(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}
