/* ==========================================================================
   ATTENTRA SEED DATA (MOCK DATABASE & STATE)
   ========================================================================== */

const ATTENTRA_DEFAULT_STATE = {
  currentUser: {
    name: "Alex Carter",
    role: "reviewer", // active view: landing, client, reviewer, admin
    reputation: 98.4,
    balance: 145.50,
    badges: ["Software Engineer", "Tech Savvy", "Detail Oriented", "Veteran Reviewer"],
    completedCampaigns: ["camp-999"] // Seed history
  },
  
  campaigns: [
    {
      id: "camp-001",
      title: "FinTech Dashboard Usability Mapping",
      type: "website",
      status: "active",
      budget: 600.00,
      payoutPerReview: 5.00,
      objective: "Identify usability bottlenecks, click friction, and confusing labels on our core dashboard.",
      url: "https://fintechlaunch.io/dashboard",
      submissionsCount: 22,
      targetAudience: {
        occupation: "Developers",
        ageRange: "25-34",
        geo: "North America (US & Canada)",
        device: "Desktop Browser"
      },
      attentionScore: 88,
      netSentiment: "Neutral",
      reviews: [
        {
          id: "rev-1",
          reviewerName: "David K.",
          rating: 4.0,
          timestamp: "2026-07-15T08:12:00Z",
          feedbackText: "The 'Invest Now' primary button is green, but the warning overdraft text is red and right above it. It creates visual confusion.",
          details: { clickX: 520, clickY: 260 },
          fraudCheck: { score: 98, status: "passed" }
        },
        {
          id: "rev-2",
          reviewerName: "Sarah M.",
          rating: 3.5,
          timestamp: "2026-07-15T09:44:00Z",
          feedbackText: "I clicked Cancel Request but nothing happened. It is placed too close to the primary call to action, leading to accidental misclicks.",
          details: { clickX: 590, clickY: 260 },
          fraudCheck: { score: 95, status: "passed" }
        },
        {
          id: "rev-3",
          reviewerName: "John D.",
          rating: 4.5,
          timestamp: "2026-07-15T11:02:00Z",
          feedbackText: "The Value metric is very clear, but the small sparkline graph under it doesn't have any axis labels, so I don't know what time range it shows.",
          details: { clickX: 200, clickY: 180 },
          fraudCheck: { score: 99, status: "passed" }
        }
      ],
      aiSummary: {
        positives: "High clarity on financial figures; primary actions are discoverable and located on clean panels.",
        negatives: "High click confusion surrounding the action buttons. Click coordinate logs reveal 60% of testers struggled between the primary 'Invest' and secondary 'Cancel' positions."
      },
      actionItems: [
        { task: "Add margins and visual separation between primary/secondary action buttons.", area: "Actions Layout", priority: "High", impact: "+15% Conversion" },
        { task: "Label the x-axis and y-axis of the portfolio value sparkline graph.", area: "Dashboard UI", priority: "Medium", impact: "-10% User Confusion" },
        { task: "Improve the contrast of the Overdraft warnings.", area: "Alerts Component", priority: "Low", impact: "+5% Readability" }
      ]
    },
    {
      id: "camp-002",
      title: "YouTube Video Hook Retention Test",
      type: "video",
      status: "active",
      budget: 300.00,
      payoutPerReview: 2.50,
      objective: "Analyze why viewers lose interest in our scaling tutorial between 10 seconds and 1 minute.",
      url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
      submissionsCount: 42,
      targetAudience: {
        occupation: "Gamers & Content Creators",
        ageRange: "18-24",
        geo: "Global Reach",
        device: "Any Device"
      },
      attentionScore: 79,
      netSentiment: "Positive",
      reviews: [
        {
          id: "rev-11",
          reviewerName: "Mark L.",
          rating: 4.8,
          timestamp: "2026-07-15T05:01:00Z",
          feedbackText: "The intro animation starts strong. Very flashy.",
          details: { videoTime: 2 },
          fraudCheck: { score: 99, status: "passed" }
        },
        {
          id: "rev-12",
          reviewerName: "Rachel P.",
          rating: 3.2,
          timestamp: "2026-07-15T06:15:00Z",
          feedbackText: "The pacing drops off drastically here. The speaker repeats the same point twice and it becomes boring.",
          details: { videoTime: 12 },
          fraudCheck: { score: 92, status: "passed" }
        },
        {
          id: "rev-13",
          reviewerName: "Ethan T.",
          rating: 4.0,
          timestamp: "2026-07-15T08:33:00Z",
          feedbackText: "Interesting stats shown on screen, but the font size is too small to read on my mobile screen.",
          details: { videoTime: 15 },
          fraudCheck: { score: 97, status: "passed" }
        }
      ],
      aiSummary: {
        positives: "Visual animations and thumbnail expectations align perfectly with the hook during the first 5 seconds.",
        negatives: "Sharp retention drop-off starting at 0:11. Reviewers state that the voiceover loses energy and the screen slides contain too much dense text."
      },
      actionItems: [
        { task: "Cut down the redundant voiceover explanation between seconds 10 and 15.", area: "Content Pacing", priority: "High", impact: "+22% Viewer Retention" },
        { task: "Enlarge the text captions shown at second 15.", area: "Graphic Design", priority: "Medium", impact: "+12% Accessibility" }
      ]
    },
    {
      id: "camp-003",
      title: "Thumbnail Layout A/B Click Study",
      type: "thumbnail",
      status: "active",
      budget: 150.00,
      payoutPerReview: 1.50,
      objective: "Decide which design theme feels more credible and click-worthy for a business scaling channel.",
      url: "Option A vs Option B comparison",
      submissionsCount: 65,
      targetAudience: {
        occupation: "General Public (All professions)",
        ageRange: "Any",
        geo: "Global Reach",
        device: "Any Device"
      },
      attentionScore: 92,
      netSentiment: "Positive",
      reviews: [
        {
          id: "rev-21",
          reviewerName: "Liam G.",
          rating: 5.0,
          timestamp: "2026-07-15T02:00:00Z",
          feedbackText: "Option A is much better. The purple accent looks premium and clean. Option B with the orange background feels cheap and looks like spam clickbait.",
          details: { votedFor: "A" },
          fraudCheck: { score: 98, status: "passed" }
        },
        {
          id: "rev-22",
          reviewerName: "Zoe W.",
          rating: 4.8,
          timestamp: "2026-07-15T03:30:00Z",
          feedbackText: "Option A creates immediate trust. The fonts are legible even when I squint my eyes, which is how it will look on a phone.",
          details: { votedFor: "A" },
          fraudCheck: { score: 96, status: "passed" }
        },
        {
          id: "rev-23",
          reviewerName: "Tyler R.",
          rating: 4.2,
          timestamp: "2026-07-15T04:15:00Z",
          feedbackText: "I prefer Option B because the orange text stands out more against dark background, though Option A has a nicer layout structure.",
          details: { votedFor: "B" },
          fraudCheck: { score: 94, status: "passed" }
        }
      ],
      aiSummary: {
        positives: "Option A has a 65% preference margin. Clean layouts, a cohesive Indigo palette, and legible sans-serif font weights.",
        negatives: "Option B is critiqd for poor branding contrast, and the orange tag was associated with low-quality advertisement sites."
      },
      actionItems: [
        { task: "Select Option A for final video launch.", area: "Thumbnails Production", priority: "High", impact: "+35% Click-Through Rate" },
        { task: "Adjust Option A's white text contrast slightly for small mobile screens.", area: "Graphic Design", priority: "Low", impact: "+4% Legibility" }
      ]
    },
    {
      id: "camp-999",
      title: "Logistics SaaS Homepage Feedback",
      type: "website",
      status: "completed",
      budget: 500.00,
      payoutPerReview: 5.00,
      objective: "Get feedback on logistics software landing page layout.",
      url: "https://mock-saas.attentra.io/logistics",
      submissionsCount: 100,
      targetAudience: { occupation: "Professionals", ageRange: "35-54", geo: "US/Canada", device: "Desktop Browser" },
      attentionScore: 94,
      netSentiment: "Positive",
      reviews: [],
      aiSummary: { positives: "Clean hero banner.", negatives: "Pricing details buried too deep." },
      actionItems: []
    }
  ],
  
  systemStats: {
    totalReviewers: 14205,
    fraudAttemptsBlocked: 843,
    avgCompletionTime: "4.2 mins",
    totalPaidOut: 64200.00
  },

  fraudLogs: [
    {
      timestamp: "2026-07-15T08:15:00Z",
      reviewerId: "rev-402",
      flag: "Speed-running Survey",
      severity: "High",
      consequence: "Task Rejected & Rep -3.5",
      details: "Completed 5-minute video feedback within 8 seconds of task acceptance."
    },
    {
      timestamp: "2026-07-15T09:12:00Z",
      reviewerId: "rev-891",
      flag: "Keystroke Dynamics Anomaly",
      severity: "High",
      consequence: "Account Suspended (Audited)",
      details: "Rapid copy-paste spam detected in the written comments (480 chars/second)."
    },
    {
      timestamp: "2026-07-15T10:44:00Z",
      reviewerId: "rev-112",
      flag: "Tab Focus Loss (Attention Bypass)",
      severity: "Medium",
      consequence: "Rep Penalty -1.5",
      details: "Lost browser tab focus 4 times while watching the video. Inactive attention state."
    },
    {
      timestamp: "2026-07-15T12:02:00Z",
      reviewerId: "rev-663",
      flag: "Multiple Device Spoofing",
      severity: "Critical",
      consequence: "Permanently Banned",
      details: "Identical browser agent and device fingerprints detected across 3 distinct reviewer profiles."
    }
  ],

  // --- UPGRADE SCALING SEEDS ---
  teamRoster: [
    { email: "owner@stripe.com", role: "Owner", status: "Joined", joinedDate: "2026-06-01" },
    { email: "analyst@stripe.com", role: "Analyst", status: "Joined", joinedDate: "2026-06-15" },
    { email: "developer@stripe.com", role: "Admin", status: "Joined", joinedDate: "2026-07-01" },
    { email: "auditor@stripe.com", role: "Viewer", status: "Pending Invitation", joinedDate: "N/A" }
  ],

  billingInvoices: [
    { id: "inv-9831", period: "June 15, 2026 - July 15, 2026", amount: 149.00, status: "Paid", receiptUrl: "#" },
    { id: "inv-9621", period: "May 15, 2026 - June 15, 2026", amount: 149.00, status: "Paid", receiptUrl: "#" },
    { id: "inv-9310", period: "April 15, 2026 - May 15, 2026", amount: 149.00, status: "Paid", receiptUrl: "#" }
  ],

  developerSettings: {
    apiKey: "sec_att_live83h28sdj7193j20akskdh291a",
    webhookUrl: "https://api.stripe.com/attentra-hook"
  }
};

// Retrieve state from localStorage or load defaults
function loadAppState() {
  const stored = localStorage.getItem("attentra_state");
  if (stored) {
    try {
      const state = JSON.parse(stored);
      // Ensure roster, invoices, and developer settings exist in stored state
      if (!state.teamRoster) state.teamRoster = [...ATTENTRA_DEFAULT_STATE.teamRoster];
      if (!state.billingInvoices) state.billingInvoices = [...ATTENTRA_DEFAULT_STATE.billingInvoices];
      if (!state.developerSettings) state.developerSettings = {...ATTENTRA_DEFAULT_STATE.developerSettings};
      return state;
    } catch (e) {
      console.error("Error reading stored state, resetting...", e);
      return JSON.parse(JSON.stringify(ATTENTRA_DEFAULT_STATE));
    }
  }
  return JSON.parse(JSON.stringify(ATTENTRA_DEFAULT_STATE));
}

// Persist state to localStorage
function saveAppState(state) {
  localStorage.setItem("attentra_state", JSON.stringify(state));
}
