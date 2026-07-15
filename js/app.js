/* ==========================================================================
   ATTENTRA GLOBAL CORE CONTROLLER (ROUTER & GENERAL UI)
   ========================================================================== */

// --- GLOBAL APPLICATION STATE ---
let gState = null;

// --- DOM ELEMENT REFERENCES ---
const DOM = {
  // Views
  views: {
    landing: document.getElementById("view-landing"),
    client: document.getElementById("view-client"),
    reviewer: document.getElementById("view-reviewer"),
    admin: document.getElementById("view-admin")
  },
  // Active role nav buttons
  roleBtns: document.querySelectorAll(".role-nav .nav-role-btn"),
  // Status Header
  profileWidget: document.getElementById("header-profile-widget"),
  walletDisplay: document.getElementById("header-wallet"),
  reputationDisplay: document.getElementById("header-reputation"),
  // Toast container
  toastContainer: document.getElementById("toast-container"),
  
  // Landing Pricing calculator elements
  calcReviewers: document.getElementById("calc-reviewers"),
  calcReviewersVal: document.getElementById("calc-reviewers-val"),
  calcAudience: document.getElementById("calc-audience"),
  calcUrgency: document.getElementById("calc-urgency"),
  calcMultistage: document.getElementById("calc-multistage"),
  calcTotalCost: document.getElementById("calc-total-cost"),
  calcPayoutVal: document.getElementById("calc-payout-val"),

  // ROI Yield Calculator Elements
  roiBudgetInput: document.getElementById("roi-budget-input"),
  roiBudgetVal: document.getElementById("roi-budget-val"),
  roiAudienceInput: document.getElementById("roi-audience-input"),
  roiResponsesVal: document.getElementById("roi-res-responses"),
  roiSpeedVal: document.getElementById("roi-res-speed"),
  roiInsightsVal: document.getElementById("roi-res-insights"),
  
  // Admin Elements
  adminFraudTable: document.getElementById("admin-fraud-logs-table"),
  adminMinChars: document.getElementById("admin-min-chars"),
  
  // Client Stats Overview elements
  clientActiveCount: document.getElementById("client-active-camps-count"),
  clientFraudCount: document.getElementById("client-fraud-blocked-count")
};

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
  // Load state
  gState = loadAppState();
  
  // Bind Routing Event Listeners
  DOM.roleBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetRole = btn.getAttribute("data-role");
      switchView(targetRole);
    });
  });

  // Bind Landing Calculator listeners
  if (DOM.calcReviewers) {
    DOM.calcReviewers.addEventListener("input", updateLandingCalculator);
    DOM.calcAudience.addEventListener("change", updateLandingCalculator);
    DOM.calcUrgency.addEventListener("change", updateLandingCalculator);
    DOM.calcMultistage.addEventListener("change", updateLandingCalculator);
    updateLandingCalculator(); // initial run
  }

  // Bind Landing ROI Calculator listeners
  if (DOM.roiBudgetInput) {
    DOM.roiBudgetInput.addEventListener("input", updateROICalculator);
    updateROICalculator(); // initial run
  }

  // Bind FAQ Accordions
  setupFAQAccordions();

  // Bind Developer Code Tabs switcher
  setupDeveloperCodeSwitch();

  // Bind Interactive Demo Playground
  setupInteractiveDemoPlayground();

  // Bind Sidebar Tab Selectors (Client, Reviewer, Admin Panels)
  setupSidebarTabs("client");
  setupSidebarTabs("reviewer");
  setupSidebarTabs("admin");

  // Render initial status bar and UI tables
  updateHeaderWidgets();
  renderAdminFraudLogs();

  // Trigger Landing page counters animation
  animateStatsCounters();

  // Run a slow background notification simulator to mimic network effects
  startDemoBackgroundSimulator();
});

// --- ROUTING & VIEW CONTROLLER ---
function switchView(roleName) {
  // Sync state variable
  gState.currentUser.role = roleName;
  saveAppState(gState);

  // Update navbar role selection indicator active class
  DOM.roleBtns.forEach(btn => {
    if (btn.getAttribute("data-role") === roleName) {
      btn.classList.add("active");
    } else {
      btn.classList.remove("active");
    }
  });

  // Hide all panels, show target panel
  Object.keys(DOM.views).forEach(key => {
    if (key === roleName) {
      DOM.views[key].classList.add("active-view");
    } else {
      DOM.views[key].classList.remove("active-view");
    }
  });

  // Specific role hooks
  updateHeaderWidgets();
  if (roleName === "client") {
    if (window.initializeClientPortal) window.initializeClientPortal();
  } else if (roleName === "reviewer") {
    if (window.initializeReviewerPortal) window.initializeReviewerPortal();
  } else if (roleName === "admin") {
    renderAdminFraudLogs();
  } else if (roleName === "landing") {
    animateStatsCounters();
  }
}

// --- DYNAMIC HEADER METRICS UPDATE ---
function updateHeaderWidgets() {
  if (!DOM.profileWidget) return;
  
  if (gState.currentUser.role === "reviewer") {
    DOM.profileWidget.style.display = "flex";
    DOM.walletDisplay.innerText = gState.currentUser.balance.toFixed(2);
    DOM.reputationDisplay.innerText = gState.currentUser.reputation.toFixed(1);
    document.querySelector(".status-details .user-name").innerText = `${gState.currentUser.name} (Reviewer)`;
    document.getElementById("reviewer-sidebar-earnings").innerText = `$${gState.currentUser.balance.toFixed(2)}`;
  } else if (gState.currentUser.role === "client") {
    DOM.profileWidget.style.display = "flex";
    DOM.walletDisplay.innerText = "1,080.00"; // Synchronized Escrow Balance
    DOM.reputationDisplay.innerText = "99.9"; // Client reputation index
    document.querySelector(".status-details .user-name").innerText = "Stripe Channel (Client)";
  } else if (gState.currentUser.role === "admin") {
    DOM.profileWidget.style.display = "flex";
    DOM.walletDisplay.innerText = "64,200.00"; // Total system turnover
    DOM.reputationDisplay.innerText = "100.0"; // System integrity score
    document.querySelector(".status-details .user-name").innerText = "Sentinel (System Admin)";
  } else {
    DOM.profileWidget.style.display = "none";
  }
}

// --- TAB TRANSITIONS WITHIN CLIENT/REVIEWER PORTALS ---
function setupSidebarTabs(portalName) {
  const sidebar = document.querySelector(`#view-${portalName} .dashboard-sidebar`);
  if (!sidebar) return;

  const tabs = sidebar.querySelectorAll(".sidebar-menu li");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      const tabId = tab.getAttribute("data-tab");
      if (tabId) activateTab(portalName, tabId);
    });
  });
}

function activateTab(portalName, tabId) {
  const portalSection = document.getElementById(`view-${portalName}`);
  if (!portalSection) return;

  // Update active status of sidebar tab button
  const tabs = portalSection.querySelectorAll(".sidebar-menu li");
  tabs.forEach(tab => {
    if (tab.getAttribute("data-tab") === tabId) {
      tab.classList.add("active-tab");
    } else {
      tab.classList.remove("active-tab");
    }
  });

  // Switch display of sub-tabs
  const subTabs = portalSection.querySelectorAll(".sub-tab");
  subTabs.forEach(sub => {
    if (sub.id === `tab-${tabId}`) {
      sub.classList.add("active-sub-tab");
    } else {
      sub.classList.remove("active-sub-tab");
    }
  });

  // Hook for special tab refreshes
  if (tabId === "client-analytics" && window.renderAnalyticsReport) {
    window.renderAnalyticsReport();
  }
  if (tabId === "client-apikeys" && window.renderDeveloperSettings) {
    window.renderDeveloperSettings();
  }
  if (tabId === "client-team" && window.renderTeamRoster) {
    window.renderTeamRoster();
  }
  if (tabId === "client-billing" && window.renderBillingWorkspace) {
    window.renderBillingWorkspace();
  }
  if (tabId === "reviewer-tasks" && window.renderReviewerTasks) {
    window.renderReviewerTasks();
  }
  if (tabId === "reviewer-profile" && window.renderReviewerProfile) {
    window.renderReviewerProfile();
  }
  if (tabId === "admin-fraud") {
    renderAdminFraudLogs();
  }
}

// --- LANDING PAGE CALCULATOR LOGIC ---
function updateLandingCalculator() {
  if (!DOM.calcReviewers) return;

  const sampleSize = parseInt(DOM.calcReviewers.value);
  DOM.calcReviewersVal.innerText = sampleSize;

  const baseCost = parseFloat(DOM.calcAudience.value);
  let premiumAdder = 0;
  
  if (DOM.calcUrgency.checked) premiumAdder += 1.00;
  if (DOM.calcMultistage.checked) premiumAdder += 0.50;
  
  const costPerReview = baseCost + premiumAdder;
  const totalCost = sampleSize * costPerReview;
  const reviewerPayout = baseCost * 0.8;

  DOM.calcTotalCost.innerText = totalCost.toFixed(2);
  DOM.calcPayoutVal.innerText = reviewerPayout.toFixed(2);
}

// --- ROI CALCULATOR MATHS ---
function updateROICalculator() {
  if (!DOM.roiBudgetInput) return;

  const budget = parseInt(DOM.roiBudgetInput.value);
  DOM.roiBudgetVal.innerText = budget;

  const costPerInsight = parseFloat(DOM.roiAudienceInput.value);
  const responses = Math.floor(budget / costPerInsight);
  DOM.roiResponsesVal.innerText = responses;

  // Delivery speed logic based on audience scarcity
  let speedText = "12 Minutes";
  if (costPerInsight === 6.00) speedText = "35 Minutes";
  else if (costPerInsight === 15.00) speedText = "2.2 Hours";
  DOM.roiSpeedVal.innerText = speedText;

  // Expected AI-clustered insights items
  const insights = Math.floor(responses * 0.2) + 5;
  DOM.roiInsightsVal.innerText = `${insights} Topics`;
}

// --- FAQ ACCORDION HANDLERS ---
function setupFAQAccordions() {
  const faqItems = document.querySelectorAll(".faq-accordion-list .faq-item");
  faqItems.forEach(item => {
    const trigger = item.querySelector(".faq-trigger");
    trigger.addEventListener("click", () => {
      // Toggle current item
      const isActive = item.classList.contains("active");
      
      // Close other items
      faqItems.forEach(i => i.classList.remove("active"));
      
      if (!isActive) {
        item.classList.add("active");
      }
    });
  });
}

// --- DEVELOPER CODE SWITCHER ---
const CODE_SNIPPETS = {
  curl: `curl -X POST "https://api.attentra.io/v1/campaigns" \\
  -H "Authorization: Bearer sec_att_live83h2..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "title": "FinTech Signup Flow Usability",
    "type": "website",
    "url": "https://fintechlaunch.io/dashboard",
    "target": { "occupation": "Developers" }
  }'`,
  
  js: `const Attentra = require('@attentra/node-sdk');
const client = new Attentra.Client({ apiKey: 'sec_att_live...' });

(async () => {
  const campaign = await client.campaigns.create({
    title: 'FinTech Signup Flow Usability',
    type: 'website',
    url: 'https://fintechlaunch.io/dashboard',
    target: { occupation: 'Developers' }
  });
  console.log(\`Launched campaign with ID: \${campaign.id}\`);
})();`,

  python: `import attentra

client = attentra.Client(api_key="sec_att_live...")

campaign = client.campaigns.create(
    title="FinTech Signup Flow Usability",
    type="website",
    url="https://fintechlaunch.io/dashboard",
    target={"occupation": "Developers"}
)
print(f"Launched campaign: {campaign.id}")`,

  go: `package main

import (
	"context"
	"fmt"
	"github.com/attentra/attentra-go"
)

func main() {
	client := attentra.NewClient("sec_att_live...")
	camp, _ := client.Campaigns.Create(context.Background(), &attentra.CampaignParams{
		Title: "FinTech Signup Flow Usability",
		Type:  "website",
		URL:   "https://fintechlaunch.io/dashboard",
		Target: attentra.TargetParams{ Occupation: "Developers" },
	})
	fmt.Printf("Campaign live: %s\\n", camp.ID)
}`
};

function setupDeveloperCodeSwitch() {
  const tabs = document.querySelectorAll(".editor-tabs .code-tab");
  const codeBox = document.getElementById("code-playground-box");
  if (!codeBox) return;

  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      // Toggle tab highlight
      tabs.forEach(t => t.classList.remove("active-code-tab"));
      tab.classList.add("active-code-tab");

      const lang = tab.getAttribute("data-lang");
      codeBox.innerText = CODE_SNIPPETS[lang] || "";
    });
  });
}

// --- INTERACTIVE DEMO PLAYGROUND LANDING ---
function setupInteractiveDemoPlayground() {
  const uploadBtn = document.getElementById("demo-mock-upload-btn");
  const runBtn = document.getElementById("demo-mock-run-btn");
  const placeholder = document.getElementById("demo-mock-report-placeholder");
  const actual = document.getElementById("demo-mock-report-actual");

  if (!uploadBtn) return;

  let fileReady = false;

  uploadBtn.addEventListener("click", () => {
    fileReady = true;
    uploadBtn.classList.add("file-ready");
    uploadBtn.innerHTML = `
      <i class="fa-solid fa-file-circle-check" style="font-size: 2.2rem; color: var(--emerald);"></i>
      <h4 class="text-success">fintech_dashboard_mockup.png</h4>
      <p class="small text-muted">Ready to audit. Click run below.</p>
    `;
    showToast("Mock Asset Uploaded", "Asset loaded successfully. Run AI classification check.", "success");
  });

  runBtn.addEventListener("click", () => {
    if (!fileReady) {
      showToast("No Asset Uploaded", "Please click the select mockup area first.", "warning");
      return;
    }

    runBtn.disabled = true;
    const oldHtml = runBtn.innerHTML;
    runBtn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> Classifying coordinates...`;

    setTimeout(() => {
      runBtn.disabled = false;
      runBtn.innerHTML = oldHtml;
      
      placeholder.classList.add("hidden");
      actual.classList.remove("hidden");
      
      showToast("AI Insights Generated", "Simulated analytics summary completed.", "success");
    }, 1200);
  });
}

// --- COUNTERS COUNT-UP ANIMATION ---
function animateStatsCounters() {
  const counters = document.querySelectorAll(".counter-val");
  
  counters.forEach(counter => {
    counter.innerText = "0";
    const target = +counter.getAttribute("data-target");
    const suffix = counter.getAttribute("data-suffix") || "";
    const format = counter.getAttribute("data-format") || "";
    
    let count = 0;
    const increment = target / 30; // speed divider
    
    const updateCount = () => {
      count += increment;
      if (count < target) {
        if (format === "short") {
          counter.innerText = (Math.round(count / 100000) / 10).toFixed(1) + "M";
        } else {
          counter.innerText = Math.round(count).toLocaleString() + suffix;
        }
        setTimeout(updateCount, 15);
      } else {
        if (format === "short") {
          counter.innerText = (target / 1000000).toFixed(1) + "M";
        } else {
          counter.innerText = target.toLocaleString() + suffix;
        }
      }
    };
    
    updateCount();
  });
}

// --- PREMIUM TOAST NOTIFICATION ENGINE ---
function showToast(title, message, iconType = "info") {
  if (!DOM.toastContainer) return;

  const toast = document.createElement("div");
  toast.className = "toast";

  let iconClass = "fa-info-circle text-indigo";
  if (iconType === "success") iconClass = "fa-check-circle text-emerald";
  if (iconType === "warning") iconClass = "fa-exclamation-triangle text-amber";
  if (iconType === "error") iconClass = "fa-times-circle text-rose";
  if (iconType === "fraud") iconClass = "fa-user-ninja text-rose";

  toast.innerHTML = `
    <div class="toast-icon"><i class="fa-solid ${iconClass}"></i></div>
    <div class="toast-body">
      <h5>${title}</h5>
      <p>${message}</p>
    </div>
  `;

  DOM.toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("removing");
    toast.addEventListener("animationend", () => {
      toast.remove();
    });
  }, 4000);
}

// --- ADMIN FRAUD SYSTEM CONTROL ---
function renderAdminFraudLogs() {
  if (!DOM.adminFraudTable) return;
  
  DOM.adminFraudTable.innerHTML = "";
  
  gState.fraudLogs.forEach(log => {
    const tr = document.createElement("tr");
    
    let severityClass = "badge-emerald";
    if (log.severity === "Medium") severityClass = "badge-purple";
    if (log.severity === "High" || log.severity === "Critical") severityClass = "badge-rose";
    
    tr.innerHTML = `
      <td>${new Date(log.timestamp).toLocaleTimeString()}</td>
      <td><strong>${log.reviewerId}</strong></td>
      <td class="text-rose"><i class="fa-solid fa-triangle-exclamation"></i> ${log.flag}</td>
      <td><span class="badge ${severityClass}">${log.severity}</span></td>
      <td class="text-amber"><strong>${log.consequence}</strong></td>
      <td class="muted small">${log.details}</td>
    `;
    DOM.adminFraudTable.appendChild(tr);
  });
}

function clearFraudLogs() {
  gState.fraudLogs = [];
  saveAppState(gState);
  renderAdminFraudLogs();
  showToast("Security Log Purged", "All historical anti-fraud intercept logs cleared.", "success");
}

function updateAdminParams() {
  const minChars = parseInt(DOM.adminMinChars.value) || 30;
  localStorage.setItem("attentra_min_chars", minChars);
  showToast("Configurations Updated", "AI quality validation thresholds updated successfully.", "success");
}

// --- RANDOM NETWORK SIMULATOR DOCK (TOASTS FEED) ---
function startDemoBackgroundSimulator() {
  const simulatedEvents = [
    { title: "Escrow Deposited", text: "Client 'FinTech Startup' created campaign ($450 escrowed)", type: "success" },
    { title: "Campaign Completed", text: "Thumbnail study 'A/B Theme' reached target audience quota.", type: "success" },
    { title: "Auditor Warning", text: "Reviewer profile 'rev-903' failed keystroke timing checks.", type: "warning" },
    { title: "Fraud Trigger Blocked", text: "Intercepted bot spoofing general demographic filters.", type: "fraud" },
    { title: "Fast Match", text: "15 developers matched and accepted 'Usability Testing' campaign.", type: "info" }
  ];

  setInterval(() => {
    if (Math.random() < 0.25 && !document.getElementById("tab-reviewer-sandbox").classList.contains("active-sub-tab")) {
      const idx = Math.floor(Math.random() * simulatedEvents.length);
      const ev = simulatedEvents[idx];
      showToast(ev.title, ev.text, ev.type);
    }
  }, 10000);
}
