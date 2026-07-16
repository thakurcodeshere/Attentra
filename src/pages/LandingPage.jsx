import { useState, useEffect } from 'react';

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
  console.log(\`Launched campaign: \${campaign.id}\`);
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
		Title:  "FinTech Signup Flow Usability",
		Type:   "website",
		URL:    "https://fintechlaunch.io/dashboard",
		Target: attentra.TargetParams{ Occupation: "Developers" },
	})
	fmt.Printf("Campaign live: %s\\n", camp.ID)
}`
};

function Counter({ target, suffix = "", format = "" }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const duration = 1000;
    const increment = target / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.round(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target]);

  if (format === 'short') {
    return <span>{(count / 1000000).toFixed(1)}M</span>;
  }
  return <span>{count.toLocaleString()}{suffix}</span>;
}

export default function LandingPage({ setView, showToast }) {

  // ROI budget states
  const [roiBudget, setRoiBudget] = useState(400);
  const [roiAudience, setRoiAudience] = useState(2.00);

  // Playground states
  const [fileReady, setFileReady] = useState(false);
  const [runningAnalysis, setRunningAnalysis] = useState(false);
  const [analysisDone, setAnalysisDone] = useState(false);

  // Active FAQ
  const [activeFaq, setActiveFaq] = useState(null);

  // Active code tab
  const [activeLang, setActiveLang] = useState('curl');



  // Math for ROI calculator
  const roiResponses = Math.floor(roiBudget / roiAudience);
  const roiInsights = Math.floor(roiResponses * 0.2) + 5;
  const roiSpeed = roiAudience === 2.00 ? '12 Minutes' : roiAudience === 6.00 ? '35 Minutes' : '2.2 Hours';

  const handleUploadClick = () => {
    setFileReady(true);
    showToast('Mock Asset Uploaded', 'fintech_dashboard_mockup.png successfully parsed.', 'success');
  };

  const handleRunPlayground = () => {
    if (!fileReady) {
      showToast('No Mockup Uploaded', 'Please upload a mock design first.', 'warning');
      return;
    }
    setRunningAnalysis(true);
    setTimeout(() => {
      setRunningAnalysis(false);
      setAnalysisDone(true);
      showToast('AI Insights Generated', 'Visual coordinates parsed and hotzones identified.', 'success');
    }, 1200);
  };

  const toggleFaq = (index) => {
    setActiveFaq(prev => prev === index ? null : index);
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* 2. HERO SECTION */}
      <section className="hero-section" id="platform">
        <div className="hero-grid-bg"></div>
        <div className="hero-content">
          <div className="pill-badge">
            <div className="pulse-emerald"></div>
            <span>Now Auditing 12,458 Interfaces Globally</span>
          </div>
          <h1 className="hero-title">
            Verified <span className="gradient-text glow-text">Human Intelligence</span> Before You Launch.
          </h1>
          <p className="hero-subtitle">
            Attentra is the largest network of verified human reviewers that helps creators, brands, and developer teams see how real people react, navigate, and make decisions.
          </p>
          <div className="hero-ctas">
            <button className="btn btn-primary btn-lg" onClick={() => setView('client')}>
              <i className="fa-solid fa-bolt"></i> Launch Campaign
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => setView('reviewer')}>
              <i className="fa-solid fa-user-check"></i> Earn as Reviewer
            </button>
          </div>
        </div>
      </section>

      <div className="landing-container">
        {/* 3. LIVE PLATFORM STATISTICS */}
        <div className="card" style={{ padding: 0, marginBottom: '4rem' }}>
          <div className="stats-counter-grid">
            <div className="counter-item">
              <div className="counter-val"><Counter target={12458} /></div>
              <div className="counter-label">Active Reviewers</div>
            </div>
            <div className="counter-item">
              <div className="counter-val"><Counter target={1900000} format="short" /></div>
              <div className="counter-label">Responses Submitted</div>
            </div>
            <div className="counter-item">
              <div className="counter-val"><Counter target={15932} /></div>
              <div className="counter-label">Campaigns Completed</div>
            </div>
            <div className="counter-item">
              <div className="counter-val"><Counter target={96} suffix="%" /></div>
              <div className="counter-label">Fraud Detection Accuracy</div>
            </div>
            <div className="counter-item">
              <div className="counter-val"><Counter target={72} /></div>
              <div className="counter-label">Countries Active</div>
            </div>
            <div className="counter-item">
              <div className="counter-val"><Counter target={4.2} suffix="m" /></div>
              <div className="counter-label">Avg. Review Time</div>
            </div>
          </div>
        </div>

        {/* 4. TRUSTED BY LOGO CLOUD */}
        <div className="text-center" style={{ marginBottom: '5rem' }}>
          <p className="small uppercase muted" style={{ letterSpacing: '0.08em', marginBottom: '1.2rem' }}>
            Trusted by teams at forward-thinking companies
          </p>
          <div className="logo-cloud-grid">
            <span className="logo-text">stripe</span>
            <span className="logo-text">vercel</span>
            <span className="logo-text">linear</span>
            <span className="logo-text">notion</span>
            <span className="logo-text">airbnb</span>
          </div>
        </div>

        {/* 5. HOW IT WORKS WORKFLOW CARDS */}
        <div style={{ marginBottom: '5rem' }}>
          <h2 className="text-center" style={{ marginBottom: '2.5rem', fontSize: '2rem' }}>
            Three Steps to Human Insights
          </h2>
          <div className="workflow-cards-flex">
            <div className="card workflow-card-mini border-glow-indigo">
              <div className="workflow-num">01</div>
              <h4>Upload Asset</h4>
              <p className="small muted">Upload site mockup, YouTube draft, or UI screenshot.</p>
            </div>
            <div className="arrow-indicator"><i className="fa-solid fa-arrow-right-long"></i></div>
            <div className="card workflow-card-mini border-glow-indigo">
              <div className="workflow-num">02</div>
              <h4>Match Testers</h4>
              <p className="small muted">Filter by developers, gamers, or geo demographics.</p>
            </div>
            <div className="arrow-indicator"><i className="fa-solid fa-arrow-right-long"></i></div>
            <div className="card workflow-card-mini border-glow-indigo">
              <div className="workflow-num">03</div>
              <h4>Audit Actions</h4>
              <p className="small muted">Inspect click coordinate maps and second-by-second dropoffs.</p>
            </div>
          </div>
        </div>

        {/* 6. INTERACTIVE PLAYGROUND DEMO */}
        <div className="card grid-2 border-glow-indigo" style={{ marginBottom: '5rem', padding: '2rem' }}>
          <div className="demo-upload-panel">
            <div>
              <span className="pill-badge-indigo">Interactive playground</span>
              <h3 style={{ fontSize: '1.6rem', marginTop: '5px', marginBottom: '8px' }}>Test Attentra's Engine</h3>
              <p className="muted small" style={{ marginBottom: '1.5rem' }}>
                Simulate uploading your dashboard mockup below and trigger our AI clustering engine.
              </p>

              <div 
                className={`mock-upload-area ${fileReady ? 'file-ready' : ''}`}
                onClick={handleUploadClick}
              >
                {!fileReady ? (
                  <>
                    <i className="fa-solid fa-cloud-arrow-up text-indigo" style={{ fontSize: '2rem', marginBottom: '8px' }}></i>
                    <h4>Click to Upload Mockup Design</h4>
                    <p className="small muted">Supports PNG, JPEG, SVG up to 5MB</p>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-file-circle-check text-success" style={{ fontSize: '2rem', marginBottom: '8px' }}></i>
                    <h4 className="text-success">fintech_dashboard_mockup.png</h4>
                    <p className="small muted">Asset loaded successfully. Click Run below.</p>
                  </>
                )}
              </div>
            </div>

            <button 
              className="btn btn-indigo btn-lg margin-top-md"
              onClick={handleRunPlayground}
              disabled={runningAnalysis}
            >
              {runningAnalysis ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin"></i> Classifying Hotspots...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-wand-magic-sparkles"></i> Generate AI Analysis
                </>
              )}
            </button>
          </div>

          <div style={{ background: 'rgba(0,0,0,0.15)', borderRadius: '12px', padding: '1.5rem', minHeight: '260px' }}>
            {!analysisDone ? (
              <div className="demo-report-placeholder">
                <i className="fa-solid fa-hourglass-start" style={{ fontSize: '2rem' }}></i>
                <p>Upload a design and click generate to view coordinate report.</p>
              </div>
            ) : (
              <div className="demo-report-actual">
                <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: '12px' }}>
                  <h4 style={{ color: 'var(--primary)' }}>Simulated Visual Audit</h4>
                  <span className="badge badge-emerald">92% Attention Score</span>
                </div>
                <p className="small muted" style={{ marginBottom: '10px' }}>
                  <strong>Positives:</strong> The primary checkout CTA has high contrast (emerald green) and anchors 80% of initial focal points.
                </p>
                <p className="small muted" style={{ marginBottom: '15px' }}>
                  <strong>Warnings:</strong> Overdraft text warning has low contrast and is bypassed by 65% of test cohort clicks.
                </p>
                <div className="ai-sentiment-visualizer">
                  <span className="small">Focal Heatmap Focus</span>
                  <div className="est-reach-bar">
                    <div className="reach-bar-inner" style={{ width: '85%' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 7. SOLUTIONS GRID */}
        <div id="solutions" style={{ marginBottom: '5rem' }}>
          <h2 className="text-center" style={{ marginBottom: '2.5rem', fontSize: '2rem' }}>
            Built for Modern Digital Products
          </h2>
          <div className="solutions-grid">
            <div className="card solution-card border-glow-rose">
              <i className="fa-solid fa-laptop-code text-rose"></i>
              <h3>UI/UX Audits</h3>
              <p className="small muted text-center">Friction maps & page flow navigation analysis.</p>
            </div>
            <div className="card solution-card border-glow-emerald">
              <i className="fa-solid fa-photo-film text-emerald"></i>
              <h3>YouTube Hooks</h3>
              <p className="small muted text-center">Pinpoint exactly where viewers scroll past or leave.</p>
            </div>
            <div className="card solution-card border-glow-indigo">
              <i className="fa-solid fa-mobile-screen-button text-indigo"></i>
              <h3>Mobile Apps</h3>
              <p className="small muted text-center">Test tap accuracy and swipe navigation on real devices.</p>
            </div>
            <div className="card solution-card border-glow-rose">
              <i className="fa-solid fa-rectangle-ad text-rose"></i>
              <h3>Ad Creatives</h3>
              <p className="small muted text-center">Gauge visual appeal before launching display ads.</p>
            </div>
          </div>
        </div>

        {/* 8. WHY NOT SURVEYS COMPARISON TABLE */}
        <div className="card table-card" style={{ marginBottom: '5rem' }}>
          <div className="card-header-row">
            <h3>Attentra vs. Legacy Surveys</h3>
            <span className="badge badge-purple">Methodology comparison</span>
          </div>
          <div className="table-container">
            <table className="comparison-matrix-table">
              <thead>
                <tr>
                  <th>Friction Metric</th>
                  <th className="table-highlight-col">Attentra Panel</th>
                  <th>Legacy Forms (e.g. SurveyMonkey)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Fraud Prevention</strong></td>
                  <td className="table-highlight-col">98% Keystroke & Tab Focus Intercepts</td>
                  <td>None (High bot & copy-paste spam)</td>
                </tr>
                <tr>
                  <td><strong>Engagement Proof</strong></td>
                  <td className="table-highlight-col">Second-by-second telemetry logs</td>
                  <td>None (Self-reported statements only)</td>
                </tr>
                <tr>
                  <td><strong>Audience Target</strong></td>
                  <td className="table-highlight-col">Verified developers, designers, gamers</td>
                  <td>Generic global panels (low relevance)</td>
                </tr>
                <tr>
                  <td><strong>Report Analytics</strong></td>
                  <td className="table-highlight-col">AI clustered topics & click coordinates</td>
                  <td>Raw spreadsheet columns</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* 13. COMPLIANCE & TRUST */}
        <div className="card" style={{ padding: '2rem', marginBottom: '5rem', textAlign: 'center' }}>
          <h3>Enterprise Security & Integrity</h3>
          <p className="muted small" style={{ marginBottom: '1.5rem' }}>
            We guarantee verified, clean human attention.
          </p>
          <div className="security-steps-flex" style={{ marginBottom: '1.5rem' }}>
            <div className="security-step-card">
              <i className="fa-solid fa-shield-halved text-success"></i>
              <h5>SOC2 Type II</h5>
              <p className="small muted">Fully audited data pipeline practices.</p>
            </div>
            <div className="security-step-card">
              <i className="fa-solid fa-user-shield text-indigo"></i>
              <h5>GDPR compliant</h5>
              <p className="small muted">Tester identity anonymization guards.</p>
            </div>
            <div className="security-step-card">
              <i className="fa-solid fa-fingerprint text-rose"></i>
              <h5>Biometric checks</h5>
              <p className="small muted">Prevents device emulator spoofing.</p>
            </div>
            <div className="security-step-card">
              <i className="fa-solid fa-chart-line text-emerald"></i>
              <h5>Reputation Score</h5>
              <p className="small muted">Continuous testing quality tracking.</p>
            </div>
          </div>
          <div className="compliance-row-logos">
            <span className="logo-text" style={{ fontSize: '0.9rem' }}>ISO 27001 Certified</span>
            <span className="logo-text" style={{ fontSize: '0.9rem' }}>HIPAA Compliant</span>
            <span className="logo-text" style={{ fontSize: '0.9rem' }}>PCI-DSS Level 1</span>
          </div>
        </div>

        {/* 18. ROI CALCULATOR */}
        <div className="card grid-2 border-glow-emerald" style={{ marginBottom: '5rem', padding: '2rem' }}>
          <div>
            <span className="pill-badge">ROI Yield Calculator</span>
            <h3 style={{ fontSize: '1.6rem', marginTop: '5px', marginBottom: '10px' }}>Calculate Expected Yield</h3>
            <p className="muted small" style={{ marginBottom: '1.5rem' }}>
              Set your target budget and audience requirements to preview sample coverage and delivery times.
            </p>

            <div className="margin-bottom-md">
              <label className="small muted" style={{ display: 'block', marginBottom: '5px' }}>
                Monthly Research Budget: <strong>${roiBudget}</strong>
              </label>
              <input 
                type="range" 
                min="100" 
                max="5000" 
                step="50"
                value={roiBudget} 
                onChange={(e) => setRoiBudget(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--primary)' }}
              />
            </div>

            <div>
              <label className="small muted" style={{ display: 'block', marginBottom: '5px' }}>
                Tester Target Cohort:
              </label>
              <select 
                className="form-input" 
                value={roiAudience} 
                onChange={(e) => setRoiAudience(Number(e.target.value))}
                style={{ background: 'var(--bg-deep)', color: '#fff', border: '1px solid var(--border-subtle)', padding: '8px 12px', width: '100%', borderRadius: '6px' }}
              >
                <option value="2.00">General Public ($2.00 / Review)</option>
                <option value="6.00">Software Developers ($6.00 / Review)</option>
                <option value="15.00">Corporate Executives ($15.00 / Review)</option>
              </select>
            </div>
          </div>

          <div className="roi-results-grid grid-3" style={{ alignContent: 'center' }}>
            <div className="roi-res-card">
              <span className="small muted">Expected Responses</span>
              <div className="value text-success">{roiResponses}</div>
            </div>
            <div className="roi-res-card">
              <span className="small muted">Est. Delivery Speed</span>
              <div className="value text-indigo">{roiSpeed}</div>
            </div>
            <div className="roi-res-card">
              <span className="small muted">AI Topics Generated</span>
              <div className="value text-amber">{roiInsights}</div>
            </div>
          </div>
        </div>

        {/* 20. DEVELOPER CODE PLAYGROUND */}
        <div className="card developer-playground-card grid-2" id="docs" style={{ marginBottom: '5rem' }}>
          <div className="code-editor-wrapper">
            <div className="editor-header">
              <div className="editor-tabs">
                <button 
                  className={`code-tab ${activeLang === 'curl' ? 'active-code-tab' : ''}`}
                  onClick={() => setActiveLang('curl')}
                >
                  cURL
                </button>
                <button 
                  className={`code-tab ${activeLang === 'js' ? 'active-code-tab' : ''}`}
                  onClick={() => setActiveLang('js')}
                >
                  Node.js
                </button>
                <button 
                  className={`code-tab ${activeLang === 'python' ? 'active-code-tab' : ''}`}
                  onClick={() => setActiveLang('python')}
                >
                  Python
                </button>
                <button 
                  className={`code-tab ${activeLang === 'go' ? 'active-code-tab' : ''}`}
                  onClick={() => setActiveLang('go')}
                >
                  Go
                </button>
              </div>
              <div className="editor-controls">
                <span className="editor-circle"></span>
                <span className="editor-circle"></span>
                <span className="editor-circle"></span>
              </div>
            </div>
            <pre className="code-body-pre fira-code">
              <code style={{ color: 'var(--text-muted)' }}>
                {CODE_SNIPPETS[activeLang]}
              </code>
            </pre>
          </div>

          <div className="developer-info-text">
            <span className="pill-badge-indigo">Developer first</span>
            <h3 style={{ fontSize: '1.5rem', marginTop: '5px', marginBottom: '8px' }}>Launch Campaigns via API</h3>
            <p className="muted small" style={{ marginBottom: '1.2rem' }}>
              Integrate human intelligence triggers directly into your CI/CD workflows. Trigger user testing pipelines on every deployment push.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <a href="#docs" className="btn btn-secondary btn-sm">
                <i className="fa-solid fa-book"></i> Read SDK Docs
              </a>
              <a href="#docs" className="btn btn-indigo btn-sm">
                <i className="fa-solid fa-key"></i> Get API Key
              </a>
            </div>
          </div>
        </div>

        {/* 17. PRICING TIERS */}
        <div id="pricing" style={{ marginBottom: '5rem' }}>
          <h2 className="text-center" style={{ marginBottom: '2.5rem', fontSize: '2rem' }}>
            Transparent Plans for Every Stage
          </h2>
          <div className="pricing-packages-grid">
            <div className="card pricing-col">
              <div>
                <h5>Starter</h5>
                <div className="price-val">$49<span className="period">/mo</span></div>
                <p className="small muted" style={{ marginBottom: '1.5rem' }}>Ideal for creators and solo developers.</p>
                <ul className="small muted" style={{ listStyle: 'none', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <li><i className="fa-solid fa-check text-success"></i> 25 verified test credits</li>
                  <li><i className="fa-solid fa-check text-success"></i> Access to General Demographic cohort</li>
                  <li><i className="fa-solid fa-check text-success"></i> Video second-by-second dropoffs</li>
                  <li><i className="fa-solid fa-xmark text-rose"></i> API programmatic access</li>
                </ul>
              </div>
              <button className="btn btn-secondary margin-top-md" onClick={() => setView('client')}>Get Started</button>
            </div>

            <div className="card pricing-col" style={{ border: '2.5px solid var(--primary)' }}>
              <span className="pricing-card-badge">Popular</span>
              <div>
                <h5>Growth</h5>
                <div className="price-val">$149<span className="period">/mo</span></div>
                <p className="small muted" style={{ marginBottom: '1.5rem' }}>For growing startups and SaaS teams.</p>
                <ul className="small muted" style={{ listStyle: 'none', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <li><i className="fa-solid fa-check text-success"></i> 100 verified test credits</li>
                  <li><i className="fa-solid fa-check text-success"></i> Access to Developer & Tech cohorts</li>
                  <li><i className="fa-solid fa-check text-success"></i> AI recommendation summaries</li>
                  <li><i className="fa-solid fa-check text-success"></i> Secret API & Webhooks key</li>
                </ul>
              </div>
              <button className="btn btn-primary margin-top-md" onClick={() => setView('client')}>Upgrade to Growth</button>
            </div>

            <div className="card pricing-col">
              <div>
                <h5>Enterprise</h5>
                <div className="price-val">$499<span className="period">/mo</span></div>
                <p className="small muted" style={{ marginBottom: '1.5rem' }}>For product teams and agencies.</p>
                <ul className="small muted" style={{ listStyle: 'none', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <li><i className="fa-solid fa-check text-success"></i> 400 verified test credits</li>
                  <li><i className="fa-solid fa-check text-success"></i> Access to executive target cohorts</li>
                  <li><i className="fa-solid fa-check text-success"></i> Multi-member shared billing</li>
                  <li><i className="fa-solid fa-check text-success"></i> Dedicated account rep</li>
                </ul>
              </div>
              <button className="btn btn-secondary margin-top-md" onClick={() => setView('client')}>Get Enterprise</button>
            </div>
          </div>
        </div>

        {/* 30. FAQ ACCORDION */}
        <div style={{ marginBottom: '5rem' }}>
          <h2 className="text-center" style={{ marginBottom: '2.5rem', fontSize: '2rem' }}>
            Frequently Asked Questions
          </h2>
          <div className="card">
            <div className="faq-accordion-list">
              <div className={`faq-item ${activeFaq === 0 ? 'active' : ''}`}>
                <button className="faq-trigger" onClick={() => toggleFaq(0)}>
                  How do you verify that reviewers are actual humans?
                  <i className="fa-solid fa-chevron-down"></i>
                </button>
                <div className="faq-answer">
                  <p className="small muted">
                    We scan reviewers using tab-focus tracking, keystroke dynamics, and device fingerprint filters. If a reviewer loses focus, uses automated scripts, or speeds through tasks, our AI-intercept system instantly rejects their review and docks their Reputation.
                  </p>
                </div>
              </div>

              <div className={`faq-item ${activeFaq === 1 ? 'active' : ''}`}>
                <button className="faq-trigger" onClick={() => toggleFaq(1)}>
                  What is the difference between Attentra and traditional user surveys?
                  <i className="fa-solid fa-chevron-down"></i>
                </button>
                <div className="faq-answer">
                  <p className="small muted">
                    Traditional surveys rely on checkboxes that users speed through to get paid. Attentra measures actual visual coordinates, click times, and video playback retention, giving you cold telemetry logs of their attention.
                  </p>
                </div>
              </div>

              <div className={`faq-item ${activeFaq === 2 ? 'active' : ''}`}>
                <button className="faq-trigger" onClick={() => toggleFaq(2)}>
                  How long does it take to get campaign responses?
                  <i className="fa-solid fa-chevron-down"></i>
                </button>
                <div className="faq-answer">
                  <p className="small muted">
                    Most general campaigns are completed within 15 minutes of launch. Technical target cohorts (like developers or engineers) take between 30 minutes to 2 hours depending on parameters.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 31. NEWSLETTER */}
        <div className="card text-center border-glow-indigo" style={{ padding: '3rem 1.5rem', marginBottom: '5rem' }}>
          <h3>Get Human Intelligence Reports</h3>
          <p className="muted small" style={{ marginBottom: '1.5rem' }}>
            Join 4,000+ developers getting monthly case studies on UI failure points.
          </p>
          <div className="newsletter-input-box">
            <input 
              type="email" 
              placeholder="Enter your email" 
              style={{ background: 'var(--bg-deep)', border: '1px solid var(--border-subtle)', color: '#fff', padding: '12px 18px', width: '300px', borderRadius: '6px' }}
            />
            <button className="btn btn-indigo btn-lg" onClick={() => showToast('Subscribed', 'Thank you for subscribing!', 'success')}>
              Subscribe
            </button>
          </div>
        </div>
      </div>

      {/* 32. DEEP FOOTER */}
      <footer className="landing-footer">
        <div className="footer-grid">
          <div className="footer-col-logo">
            <div className="navbar-logo">
              <div className="logo-circle">
                <i className="fa-solid fa-signature"></i>
              </div>
              Attentra
            </div>
            <p className="small muted">
              The world's largest platform for verified human attention and digital operations feedback.
            </p>
          </div>
          <div className="footer-col-links">
            <h5>Product</h5>
            <a href="#platform">How it works</a>
            <a href="#solutions">Solutions</a>
            <a href="#pricing">Pricing</a>
            <a href="#docs">Security Shield</a>
          </div>
          <div className="footer-col-links">
            <h5>Ecosystem</h5>
            <a href="#docs">Developer API</a>
            <a href="#platform">Reviewer network</a>
            <a href="#platform">Status updates</a>
            <a href="#platform">Roadmap</a>
          </div>
          <div className="footer-col-links">
            <h5>Legal</h5>
            <a href="#platform">Terms of Service</a>
            <a href="#platform">Privacy Policy</a>
            <a href="#platform">GDPR protection</a>
            <a href="#platform">SOC2 Audit</a>
          </div>
        </div>
        <div className="footer-bottom-row">
          <span className="small muted">&copy; 2026 Attentra Inc. All rights reserved.</span>
          <div className="footer-status-pill">
            <div className="pulse-emerald"></div>
            <span>All Systems Operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
