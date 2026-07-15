/* ==========================================================================
   ATTENTRA CLIENT PORTAL CONTROLLER (WIZARD & ANALYTICS & DEVELOPER WORKSPACES)
   ========================================================================== */

let retentionChart = null;

// --- INITIALIZE CLIENT HUB PANEL ---
window.initializeClientPortal = function() {
  renderClientCampaignsTable();
  populateCampaignSelector();
  window.renderAnalyticsReport();
  
  // Settings dashboards initializers
  renderDeveloperSettings();
  renderTeamRoster();
  renderBillingWorkspace();
};

// --- RENDER ACTIVE CAMPAIGNS LIST TABLE ---
function renderClientCampaignsTable() {
  const tableBody = document.getElementById("client-campaigns-table");
  if (!tableBody) return;
  tableBody.innerHTML = "";

  const sortedCamps = [...gState.campaigns].reverse();

  sortedCamps.forEach(camp => {
    const tr = document.createElement("tr");

    let typeIcon = "fa-circle-play text-indigo";
    if (camp.type === "website") typeIcon = "fa-window-restore text-pink";
    if (camp.type === "thumbnail") typeIcon = "fa-images text-emerald";

    let statusClass = "badge-emerald";
    if (camp.status === "completed") statusClass = "badge-purple";
    if (camp.status === "draft") statusClass = "badge-rose";

    const targetString = `${camp.targetAudience.occupation} (${camp.targetAudience.geo})`;

    tr.innerHTML = `
      <td><strong>${camp.title}</strong></td>
      <td><span class="small"><i class="fa-solid ${typeIcon}"></i> ${camp.type}</span></td>
      <td><span class="small muted">${targetString}</span></td>
      <td><strong>${camp.submissionsCount}</strong> response${camp.submissionsCount !== 1 ? 's' : ''}</td>
      <td><span class="text-emerald"><strong>$${camp.budget.toFixed(2)}</strong></span></td>
      <td><span class="badge ${statusClass}">${camp.status}</span></td>
      <td>
        <button class="btn btn-indigo btn-sm" onclick="viewCampaignAnalytics('${camp.id}')">
          <i class="fa-solid fa-square-poll-vertical"></i> Analyze
        </button>
      </td>
    `;
    tableBody.appendChild(tr);
  });

  if (DOM.clientActiveCount) {
    const activeCount = gState.campaigns.filter(c => c.status === "active").length;
    DOM.clientActiveCount.innerText = activeCount;
  }
}

// --- VIEW CAMPAIGN ANALYTICS HOOK ---
window.viewCampaignAnalytics = function(campId) {
  const selector = document.getElementById("analytics-campaign-selector");
  if (selector) {
    selector.value = campId;
  }
  activateTab("client", "client-analytics");
  window.renderAnalyticsReport();
};

// --- CAMPAIGN SELECTOR POPULATOR (ANALYTICS SCREEN) ---
function populateCampaignSelector() {
  const selector = document.getElementById("analytics-campaign-selector");
  if (!selector) return;
  selector.innerHTML = "";

  gState.campaigns.forEach(camp => {
    const opt = document.createElement("option");
    opt.value = camp.id;
    opt.innerText = camp.title;
    selector.appendChild(opt);
  });

  selector.removeEventListener("change", window.renderAnalyticsReport);
  selector.addEventListener("change", window.renderAnalyticsReport);
}

// --- RENDER DYNAMIC ANALYTICS REPORT ---
window.renderAnalyticsReport = function() {
  const selector = document.getElementById("analytics-campaign-selector");
  if (!selector || !selector.value) return;

  const campId = selector.value;
  const camp = gState.campaigns.find(c => c.id === campId);
  if (!camp) return;

  document.getElementById("analytics-campaign-title").innerText = camp.title;
  document.getElementById("analytics-campaign-type").innerText = camp.type;
  document.getElementById("analytics-campaign-target").innerText = camp.targetAudience.occupation;
  
  document.getElementById("analytics-attention-score").innerText = `${camp.attentionScore || 85}%`;
  document.getElementById("analytics-sentiment-label").innerText = camp.netSentiment || "Neutral";
  
  const sentLabel = document.getElementById("analytics-sentiment-label");
  sentLabel.className = "radial-score-large";
  if (camp.netSentiment === "Positive") sentLabel.classList.add("text-emerald");
  else if (camp.netSentiment === "Negative") sentLabel.classList.add("text-rose");
  else sentLabel.classList.add("text-amber");

  document.getElementById("analytics-sample-coverage").innerText = `${camp.submissionsCount} / ${Math.ceil(camp.budget / camp.payoutPerReview)}`;

  const videoCont = document.getElementById("analytics-type-video-container");
  const webCont = document.getElementById("analytics-type-website-container");
  const thumbCont = document.getElementById("analytics-type-thumbnail-container");

  videoCont.classList.add("hidden");
  webCont.classList.add("hidden");
  thumbCont.classList.add("hidden");

  if (camp.type === "video") {
    videoCont.classList.remove("hidden");
    renderVideoRetentionChart(camp);
  } else if (camp.type === "website") {
    webCont.classList.remove("hidden");
    renderWebsiteClickmap(camp);
  } else if (camp.type === "thumbnail") {
    thumbCont.classList.remove("hidden");
    renderThumbnailABReport(camp);
  }

  document.getElementById("ai-positives-summary").innerText = camp.aiSummary?.positives || "No positive trends captured yet.";
  document.getElementById("ai-negatives-summary").innerText = camp.aiSummary?.negatives || "No usability bottlenecks registered yet.";

  const actionItemsTable = document.getElementById("ai-action-items-table");
  if (actionItemsTable) {
    actionItemsTable.innerHTML = "";
    if (camp.actionItems && camp.actionItems.length > 0) {
      camp.actionItems.forEach(item => {
        const tr = document.createElement("tr");
        let priorityClass = "badge-emerald";
        if (item.priority === "Medium") priorityClass = "badge-purple";
        if (item.priority === "High") priorityClass = "badge-rose";
        
        tr.innerHTML = `
          <td><strong>${item.task}</strong></td>
          <td><span class="small">${item.area}</span></td>
          <td><span class="badge ${priorityClass}">${item.priority}</span></td>
          <td class="text-success"><strong>${item.impact}</strong></td>
        `;
        actionItemsTable.appendChild(tr);
      });
    } else {
      actionItemsTable.innerHTML = `<tr><td colspan="4" class="text-center muted">Insights pending. Launch task to start collecting reviewer feedback.</td></tr>`;
    }
  }
};

// --- CHART 1: VIDEO RETENTION LINE CHART (CHART.JS) ---
function renderVideoRetentionChart(camp) {
  const ctx = document.getElementById("retentionChartCanvas");
  if (!ctx) return;

  if (retentionChart) {
    retentionChart.destroy();
  }

  const labels = ["0s", "5s", "10s", "15s", "20s", "25s", "30s", "35s", "40s", "45s", "50s", "55s", "60s"];
  let dataset = [100, 98, 96, 92, 85, 78, 60, 48, 44, 43, 42, 42, 41];
  if (camp.id !== "camp-002") {
    dataset = [100, 99, 95, 93, 91, 88, 86, 85, 84, 82, 82, 80, 79];
  }

  retentionChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Retention %',
        data: dataset,
        borderColor: '#8250fa',
        backgroundColor: 'rgba(130, 80, 250, 0.05)',
        borderWidth: 3,
        fill: true,
        tension: 0.35,
        pointBackgroundColor: '#8250fa',
        pointBorderColor: '#fff',
        pointHoverRadius: 7,
        pointHoverBackgroundColor: '#10b981',
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          min: 0,
          max: 100,
          grid: { color: 'rgba(255,255,255,0.03)' },
          ticks: { color: '#889', callback: value => value + '%' }
        },
        x: {
          grid: { color: 'rgba(255,255,255,0.03)' },
          ticks: { color: '#889' }
        }
      },
      plugins: {
        legend: { display: false }
      },
      onClick: (e, elements) => {
        if (elements.length > 0) {
          const index = elements[0].index;
          const secondMark = index * 5;
          filterVideoComments(camp, secondMark);
        }
      }
    }
  });

  populateVideoCommentsList(camp.reviews);
}

function populateVideoCommentsList(reviews) {
  const list = document.getElementById("retention-comments-list");
  if (!list) return;
  list.innerHTML = "";

  if (reviews.length === 0) {
    list.innerHTML = `<li class="muted">No timestamp comments logged.</li>`;
    return;
  }

  const videoReviews = reviews.filter(r => r.details && r.details.videoTime !== undefined);

  if (videoReviews.length === 0) {
    list.innerHTML = `<li class="muted">No video timeline remarks.</li>`;
    return;
  }

  videoReviews.forEach(r => {
    const li = document.createElement("li");
    li.className = "sentiment-neutral";
    if (r.rating >= 4.0) li.className = "sentiment-positive";
    if (r.rating <= 3.0) li.className = "sentiment-negative";

    li.innerHTML = `
      <div>
        <strong>@ ${formatTimeSeconds(r.details.videoTime)}</strong>: "${r.feedbackText}"
      </div>
      <div class="comment-meta">
        <span>Reviewer: ${r.reviewerName}</span>
        <span>Spam Scan Grade: <strong class="text-success">${r.fraudCheck.score}%</strong></span>
      </div>
    `;
    list.appendChild(li);
  });
}

function filterVideoComments(camp, secondMark) {
  const matchingReviews = camp.reviews.filter(r => {
    return r.details && r.details.videoTime !== undefined && Math.abs(r.details.videoTime - secondMark) <= 5;
  });

  const list = document.getElementById("retention-comments-list");
  if (!list) return;
  list.innerHTML = "";

  const titleRow = document.createElement("li");
  titleRow.style.background = "var(--primary-glow)";
  titleRow.innerHTML = `<strong>Showing comments near ${formatTimeSeconds(secondMark)}</strong> <button class="btn btn-secondary btn-sm" style="float:right; padding:2px 8px; font-size:0.65rem;" onclick="resetVideoCommentsFilter('${camp.id}')">Show All</button>`;
  list.appendChild(titleRow);

  if (matchingReviews.length === 0) {
    const li = document.createElement("li");
    li.className = "muted";
    li.innerText = "No reviewer comments logged near this timestamp.";
    list.appendChild(li);
    return;
  }

  matchingReviews.forEach(r => {
    const li = document.createElement("li");
    li.className = r.rating >= 4.0 ? "sentiment-positive" : (r.rating <= 3.0 ? "sentiment-negative" : "sentiment-neutral");
    li.innerHTML = `
      <div>
        <strong>@ ${formatTimeSeconds(r.details.videoTime)}</strong>: "${r.feedbackText}"
      </div>
      <div class="comment-meta">
        <span>Reviewer: ${r.reviewerName}</span>
        <span>Audit score: ${r.fraudCheck.score}%</span>
      </div>
    `;
    list.appendChild(li);
  });
}

window.resetVideoCommentsFilter = function(campId) {
  const camp = gState.campaigns.find(c => c.id === campId);
  if (camp) {
    populateVideoCommentsList(camp.reviews);
  }
};

function formatTimeSeconds(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s < 10 ? '0' : ''}${s}`;
}

// --- CHART 2: CLICKMAP / HEATMAP OVERLAY FOR WEBSITES ---
function renderWebsiteClickmap(camp) {
  const canvas = document.getElementById("clickmapCanvas");
  const bgImg = document.getElementById("clickmap-mock-bg");
  if (!canvas || !bgImg) return;

  bgImg.src = "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop";

  const ctx = canvas.getContext("2d");
  
  bgImg.onload = function() {
    canvas.width = bgImg.clientWidth || 500;
    canvas.height = bgImg.clientHeight || 380;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCoordinatesOnCanvas(camp, ctx, canvas);
  };
  
  if (bgImg.complete) {
    canvas.width = bgImg.clientWidth || 500;
    canvas.height = bgImg.clientHeight || 380;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawCoordinatesOnCanvas(camp, ctx, canvas);
  }

  populateClickmapRemarksList(camp);
}

function drawCoordinatesOnCanvas(camp, ctx, canvas) {
  const clickReviews = camp.reviews.filter(r => r.details && r.details.clickX !== undefined);
  
  clickReviews.forEach((r, idx) => {
    const x = (r.details.clickX / 600) * canvas.width;
    const y = (r.details.clickY / 400) * canvas.height;

    const grad = ctx.createRadialGradient(x, y, 2, x, y, 24);
    grad.addColorStop(0, 'rgba(130, 80, 250, 0.7)');
    grad.addColorStop(0.5, 'rgba(244, 63, 94, 0.3)');
    grad.addColorStop(1, 'rgba(244, 63, 94, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, 24, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = "#fff";
    ctx.strokeStyle = "var(--primary)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#fff";
    ctx.font = "bold 9px sans-serif";
    ctx.fillText(idx + 1, x + 8, y - 5);
  });
}

function populateClickmapRemarksList(camp) {
  const list = document.getElementById("click-coordinates-remarks-list");
  if (!list) return;
  list.innerHTML = "";

  const clickReviews = camp.reviews.filter(r => r.details && r.details.clickX !== undefined);

  if (clickReviews.length === 0) {
    list.innerHTML = `<li class="muted">No coordinate comments logged.</li>`;
    return;
  }

  clickReviews.forEach((r, idx) => {
    const li = document.createElement("li");
    li.className = "sentiment-neutral";
    li.innerHTML = `
      <div>
        <strong>Pin #${idx + 1} (X:${r.details.clickX}, Y:${r.details.clickY})</strong>: "${r.feedbackText}"
      </div>
      <div class="comment-meta">
        <span>Reviewer: ${r.reviewerName}</span>
        <span>Validation: <strong class="text-success">${r.fraudCheck.score}% Passed</strong></span>
      </div>
    `;
    list.appendChild(li);
  });
}

// --- CHART 3: THUMBNAIL A/B SPLIT REPORT ---
function renderThumbnailABReport(camp) {
  const imgA = document.getElementById("comparison-img-a");
  const imgB = document.getElementById("comparison-img-b");

  if (imgA && imgB) {
    imgA.src = "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=400&auto=format&fit=crop";
    imgB.src = "https://images.unsplash.com/photo-1542744094-3a31f103e35f?q=80&w=400&auto=format&fit=crop";
  }

  const list = document.getElementById("thumbnail-reasons-list");
  if (!list) return;
  list.innerHTML = "";

  const thumbReviews = camp.reviews.filter(r => r.details && r.details.votedFor !== undefined);

  if (thumbReviews.length === 0) {
    list.innerHTML = `<li class="muted">No comparative comments logged.</li>`;
    return;
  }

  thumbReviews.forEach(r => {
    const li = document.createElement("li");
    li.className = r.details.votedFor === "A" ? "sentiment-positive" : "sentiment-neutral";
    li.innerHTML = `
      <div>
        <strong>Voted Option ${r.details.votedFor}</strong>: "${r.feedbackText}"
      </div>
      <div class="comment-meta">
        <span>Reviewer: ${r.reviewerName}</span>
        <span>Reputation: ${gState.currentUser.reputation}%</span>
      </div>
    `;
    list.appendChild(li);
  });
}

// --- EXPORT ANALYTICS REPORT ---
window.exportAnalyticsReport = function() {
  const selector = document.getElementById("analytics-campaign-selector");
  if (!selector) return;
  const camp = gState.campaigns.find(c => c.id === selector.value);
  if (!camp) return;

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(camp, null, 2));
  const dlAnchorElem = document.createElement('a');
  dlAnchorElem.setAttribute("href", dataStr);
  dlAnchorElem.setAttribute("download", `attentra_analytics_${camp.id}.json`);
  dlAnchorElem.click();

  showToast("Export Initiated", "Structured campaign JSON metrics generated and downloaded.", "success");
};

// ================= DEVELOPER API & WEBHOOKS SETTINGS =================

window.renderDeveloperSettings = function() {
  const keyField = document.getElementById("api-key-display-field");
  const webhookInput = document.getElementById("webhook-url-input");
  
  if (keyField && gState.developerSettings?.apiKey) {
    keyField.value = gState.developerSettings.apiKey;
  }
  if (webhookInput && gState.developerSettings?.webhookUrl) {
    webhookInput.value = gState.developerSettings.webhookUrl;
  }

  // Bind Generate Key Action
  const generateBtn = document.getElementById("btn-generate-apikey");
  if (generateBtn) {
    generateBtn.onclick = () => {
      const randStr = Array.from({length: 32}, () => Math.floor(Math.random()*16).toString(16)).join('');
      const newKey = `sec_att_live_${randStr}`;
      gState.developerSettings.apiKey = newKey;
      saveAppState(gState);
      keyField.value = newKey;
      showToast("API Key Rolled", "Secret credentials token rotated successfully.", "success");
    };
  }

  // Bind Save Webhook Action
  const saveWebhookBtn = document.getElementById("btn-save-webhook");
  if (saveWebhookBtn) {
    saveWebhookBtn.onclick = () => {
      const url = webhookInput.value.trim();
      if (!url) {
        showToast("Field Empty", "Please specify a listener URL endpoint.", "warning");
        return;
      }
      gState.developerSettings.webhookUrl = url;
      saveAppState(gState);
      showToast("Webhook Saved", "Receiver webhook endpoint configured successfully.", "success");
    };
  }

  // Bind Webhook Test Action
  const testWebhookBtn = document.getElementById("btn-send-webhook-test");
  if (testWebhookBtn) {
    testWebhookBtn.onclick = () => {
      const url = webhookInput.value.trim();
      if (!url) {
        showToast("No Webhook configured", "Please register webhook URL before testing.", "warning");
        return;
      }
      testWebhookBtn.disabled = true;
      testWebhookBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Triggering...`;
      
      setTimeout(() => {
        testWebhookBtn.disabled = false;
        testWebhookBtn.innerHTML = `<i class="fa-solid fa-paper-plane"></i> Send Test Event`;
        showToast("Webhook Event Fired", "Test payload successfully dispatched. Status 200 OK.", "success");
      }, 1000);
    };
  }
};

// ================= TEAM & RBAC MANAGEMENT =================

window.renderTeamRoster = function() {
  const table = document.getElementById("client-team-roster-table");
  if (!table) return;
  
  table.innerHTML = "";
  gState.teamRoster.forEach(member => {
    const tr = document.createElement("tr");
    
    let statusClass = "badge-emerald";
    if (member.status === "Pending Invitation") statusClass = "badge-rose";
    
    tr.innerHTML = `
      <td><strong>${member.email}</strong></td>
      <td><span class="badge badge-purple">${member.role}</span></td>
      <td><span class="badge ${statusClass}">${member.status}</span></td>
      <td class="muted small">${member.joinedDate}</td>
    `;
    table.appendChild(tr);
  });

  // Bind Invite Team Action
  const inviteBtn = document.getElementById("btn-invite-team");
  if (inviteBtn) {
    inviteBtn.onclick = () => {
      const email = document.getElementById("invite-email-input").value.trim();
      const role = document.getElementById("invite-role-input").value;
      
      if (!email) {
        showToast("Email Field Empty", "Please specify coworker email to invite.", "warning");
        return;
      }

      gState.teamRoster.push({
        email: email,
        role: role,
        status: "Pending Invitation",
        joinedDate: "N/A"
      });
      saveAppState(gState);
      renderTeamRoster();
      
      document.getElementById("invite-email-input").value = "";
      showToast("Invitation Sent", `Invited ${email} as Workspace ${role}.`, "success");
    };
  }
};

// ================= BILLING & WORKSPACE SUBSCRIPTIONS =================

window.renderBillingWorkspace = function() {
  const invoiceTable = document.getElementById("client-billing-invoices-table");
  if (!invoiceTable) return;

  invoiceTable.innerHTML = "";
  gState.billingInvoices.forEach(inv => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><strong>${inv.id}</strong></td>
      <td><span class="small">${inv.period}</span></td>
      <td><strong class="text-success">$${inv.amount.toFixed(2)}</strong></td>
      <td><span class="badge badge-emerald">${inv.status}</span></td>
      <td>
        <button class="btn btn-secondary btn-sm" onclick="showToast('Receipt Downloaded', 'Receipt document PDF generated.', 'success')">
          <i class="fa-solid fa-file-pdf"></i> Receipt
        </button>
      </td>
    `;
    invoiceTable.appendChild(tr);
  });
};

window.changeSubscriptionPlan = function() {
  const selector = document.getElementById("billing-tier-selector");
  if (!selector) return;
  const newPlan = selector.value;
  
  document.getElementById("active-billing-plan-label").innerText = `${newPlan} Plan`;
  
  // Add mock invoice receipt to database seed
  let amount = 149.00;
  if (newPlan === "Scale") amount = 499.00;
  if (newPlan === "Enterprise") amount = 1200.00;

  gState.billingInvoices.unshift({
    id: `inv-${Math.floor(1000 + Math.random()*9000)}`,
    period: "July 15, 2026 - August 15, 2026",
    amount: amount,
    status: "Paid",
    receiptUrl: "#"
  });
  saveAppState(gState);
  renderBillingWorkspace();

  showToast("Subscription Updated", `Workspace successfully migrated to ${newPlan} Tier.`, "success");
};


// ================= WIZARD CONTROLLER =================

window.wizardNext = function(stepNum) {
  if (stepNum === 2) {
    const title = document.getElementById("camp-title").value.trim();
    const url = document.getElementById("camp-url").value.trim();
    if (!title || !url) {
      showToast("Fields Incomplete", "Please specify a campaign title and target asset link.", "warning");
      return;
    }
  }

  const steps = document.querySelectorAll(".stepper .step");
  steps.forEach(step => {
    const s = parseInt(step.getAttribute("data-step"));
    if (s < stepNum) {
      step.className = "step completed";
    } else if (s === stepNum) {
      step.className = "step active";
    } else {
      step.className = "step";
    }
  });

  const panels = document.querySelectorAll(".wizard-step-panel");
  panels.forEach((p, idx) => {
    if (idx + 1 === stepNum) {
      p.classList.add("active-step-panel");
    } else {
      p.classList.remove("active-step-panel");
    }
  });

  if (stepNum === 3) {
    updateWizardBudget();
  }
};

window.wizardBack = function(stepNum) {
  const steps = document.querySelectorAll(".stepper .step");
  steps.forEach(step => {
    const s = parseInt(step.getAttribute("data-step"));
    if (s < stepNum) {
      step.className = "step completed";
    } else if (s === stepNum) {
      step.className = "step active";
    } else {
      step.className = "step";
    }
  });

  const panels = document.querySelectorAll(".wizard-step-panel");
  panels.forEach((p, idx) => {
    if (idx + 1 === stepNum) {
      p.classList.add("active-step-panel");
    } else {
      p.classList.remove("active-step-panel");
    }
  });
};

window.updateWizardBudget = function() {
  const sampleSize = parseInt(document.getElementById("wizard-sample-size").value);
  document.getElementById("wizard-sample-val").innerText = sampleSize;

  const audience = document.getElementById("target-occupation").value;
  let baseEarning = 1.50;
  
  if (audience === "Gamers") baseEarning = 2.50;
  else if (audience === "Developers" || audience === "Professionals") baseEarning = 5.00;
  else if (audience === "Students") baseEarning = 2.00;

  const platformFee = 0.50;
  const costPerReview = baseEarning + platformFee;
  const totalBudget = sampleSize * costPerReview;

  document.getElementById("wizard-payout-rate").innerText = `$${baseEarning.toFixed(2)} / Review`;
  document.getElementById("wizard-cost-per-review").innerText = `$${costPerReview.toFixed(2)}`;
  document.getElementById("wizard-total-budget").innerText = `$${totalBudget.toFixed(2)}`;

  let matchedOnline = 1420;
  if (audience === "Developers") matchedOnline = 342;
  else if (audience === "Gamers") matchedOnline = 890;
  else if (audience === "Professionals") matchedOnline = 412;
  else if (audience === "Students") matchedOnline = 1105;

  document.getElementById("wizard-online-match").innerText = matchedOnline;
  
  const fillWidth = Math.min((matchedOnline / 1500) * 100, 100);
  document.querySelector(".est-reach-bar .reach-bar-inner").style.width = `${fillWidth}%`;
};

// --- LAUNCH ACTION ---
document.getElementById("wizard-launch-btn")?.addEventListener("click", () => {
  const title = document.getElementById("camp-title").value.trim();
  const url = document.getElementById("camp-url").value.trim();
  const type = document.querySelector('input[name="camp-type"]:checked').value;
  const instructions = document.getElementById("camp-instructions").value.trim();
  
  const geo = document.getElementById("target-geo").value;
  const occupation = document.getElementById("target-occupation").value;
  const age = document.getElementById("target-age").value;
  const device = document.getElementById("target-device").value;

  const sampleSize = parseInt(document.getElementById("wizard-sample-size").value);
  const payoutText = document.getElementById("wizard-payout-rate").innerText;
  const payoutPerReview = parseFloat(payoutText.replace(/[^0-9.]/g, ''));
  const budget = parseFloat(document.getElementById("wizard-total-budget").innerText.replace(/[^0-9.]/g, ''));

  const newCamp = {
    id: `camp-${Date.now().toString().slice(-4)}`,
    title: title,
    type: type,
    status: "active",
    budget: budget,
    payoutPerReview: payoutPerReview,
    objective: instructions || `Evaluate ${type} usability and attention.`,
    url: url,
    targetAudience: {
      occupation: occupation,
      ageRange: age,
      geo: geo,
      device: device
    },
    submissionsCount: 0,
    attentionScore: 0,
    netSentiment: "Neutral",
    reviews: [],
    aiSummary: {
      positives: "Campaign launched successfully. Collecting attention signals...",
      negatives: "Validation scans active. Spam monitors are listening..."
    },
    actionItems: []
  };

  gState.campaigns.push(newCamp);
  saveAppState(gState);

  showToast("Escrow Locked & Launched", `Campaign '${title}' is now live for matching reviewers.`, "success");

  document.getElementById("camp-title").value = "";
  document.getElementById("camp-url").value = "";
  document.getElementById("camp-instructions").value = "";
  wizardBack(1);

  renderClientCampaignsTable();
  populateCampaignSelector();
  activateTab("client", "client-overview");
});
