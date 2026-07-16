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
          <div className="pill-badge" style={{ background: 'rgba(30, 107, 95, 0.08)', border: '1px solid rgba(30, 107, 95, 0.15)', color: 'var(--primary)', padding: '5px 14px', fontSize: '0.8rem', fontWeight: 600, display: 'inline-block', marginBottom: '1.25rem', borderRadius: '30px' }}>
            Human Intelligence Platform
          </div>
          <h1 className="hero-title" style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--text-white)', lineHeight: 1.15, marginBottom: '1.25rem' }}>
            Understand How People Think, React & Decide
          </h1>
          <p className="hero-subtitle" style={{ fontSize: '1.05rem', color: 'var(--text-muted)', marginBottom: '2rem', maxWidth: '520px', marginLeft: 0 }}>
            Get verified feedback from a global network of human reviewers. Transform raw responses into actionable business insights with AI-powered analysis.
          </p>
          <div className="hero-ctas" style={{ justifyContent: 'flex-start', gap: '15px' }}>
            <button className="btn btn-primary btn-lg" onClick={() => setView('client')} style={{ padding: '12px 26px' }}>
              Start Your Campaign
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => setView('client')} style={{ padding: '12px 26px' }}>
              View Demo
            </button>
          </div>
        </div>

        {/* HERO GRAPHIC RIGHT SIDE */}
        <div className="hero-graphic">
          <div className="interactive-graphic-container">
            {/* Connection lines */}
            <svg className="connections-svg" viewBox="0 0 400 300">
              <line x1="200" y1="160" x2="60" y2="80" className="conn-line" />
              <line x1="200" y1="160" x2="330" y2="80" className="conn-line" />
              <line x1="200" y1="160" x2="60" y2="240" className="conn-line" />
              <line x1="200" y1="160" x2="330" y2="240" className="conn-line" />
              
              <line x1="200" y1="160" x2="110" y2="120" className="conn-line" />
              <line x1="200" y1="160" x2="280" y2="120" className="conn-line" />
              <line x1="200" y1="160" x2="160" y2="200" className="conn-line" />
              <line x1="200" y1="160" x2="250" y2="210" className="conn-line" />
            </svg>

            {/* Central Sphere */}
            <div className="central-sphere-outer">
              <div className="central-sphere-inner"></div>
            </div>

            {/* Floating cards */}
            <div className="floating-element card-1">
              <div className="card-mock-header header-green"></div>
              <div className="card-mock-body">
                <div className="line-1"></div>
                <div className="line-2"></div>
              </div>
            </div>
            
            <div className="floating-element card-2">
              <div className="card-mock-header header-coral"></div>
              <div className="card-mock-body">
                <div className="line-1"></div>
                <div className="line-2"></div>
              </div>
            </div>

            {/* Floating avatars */}
            <div className="floating-element reviewer-avatar avatar-orange">
              <i className="fa-solid fa-face-smile"></i>
            </div>
            <div className="floating-element reviewer-avatar avatar-teal">
              <i className="fa-solid fa-face-laugh"></i>
            </div>
            <div className="floating-element reviewer-avatar avatar-gold">
              <i className="fa-solid fa-face-laugh-beam"></i>
            </div>
            <div className="floating-element reviewer-avatar avatar-blue">
              <i className="fa-solid fa-face-smile-beam"></i>
            </div>
            <div className="floating-element reviewer-avatar avatar-pink">
              <i className="fa-solid fa-face-grin-stars"></i>
            </div>
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
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <span style={{ color: 'var(--primary)', textTransform: 'uppercase', fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', display: 'block', marginBottom: '8px' }}>How it Works</span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-white)' }}>
              From Content to Insights in 4 Steps
            </h2>
            <p className="muted" style={{ maxWidth: '650px', margin: '10px auto 0 auto', fontSize: '0.92rem' }}>
              Our streamlined process transforms your content into actionable business intelligence through verified human feedback and AI analysis.
            </p>
          </div>
          <div className="workflow-cards-flex">
            <div className="card workflow-card-mini">
              <div className="workflow-icon-badge" style={{ background: 'rgba(30, 107, 95, 0.1)', color: 'var(--primary)' }}>
                <i className="fa-solid fa-file-circle-plus"></i>
              </div>
              <div className="workflow-num">01</div>
              <h4>Create Your Campaign</h4>
              <p className="small muted">Upload content, set objectives, and define your target audience with our intuitive campaign builder.</p>
            </div>
            <div className="arrow-indicator"><i className="fa-solid fa-arrow-right-long"></i></div>
            <div className="card workflow-card-mini">
              <div className="workflow-icon-badge" style={{ background: 'rgba(224, 122, 95, 0.1)', color: 'var(--orange)' }}>
                <i className="fa-solid fa-users"></i>
              </div>
              <div className="workflow-num">02</div>
              <h4>Get Human Reviews</h4>
              <p className="small muted">Our global network of verified reviewers provides structured, authentic feedback on your content.</p>
            </div>
            <div className="arrow-indicator"><i className="fa-solid fa-arrow-right-long"></i></div>
            <div className="card workflow-card-mini">
              <div className="workflow-icon-badge" style={{ background: 'rgba(242, 204, 143, 0.2)', color: '#d4a35c' }}>
                <i className="fa-solid fa-link"></i>
              </div>
              <div className="workflow-num">03</div>
              <h4>AI-Powered Analysis</h4>
              <p className="small muted">Advanced AI processes responses to validate quality and extract meaningful patterns from human feedback.</p>
            </div>
            <div className="arrow-indicator"><i className="fa-solid fa-arrow-right-long"></i></div>
            <div className="card workflow-card-mini">
              <div className="workflow-icon-badge" style={{ background: 'rgba(129, 178, 154, 0.2)', color: '#568f74' }}>
                <i className="fa-solid fa-chart-simple"></i>
              </div>
              <div className="workflow-num">04</div>
              <h4>Actionable Insights</h4>
              <p className="small muted">Receive clear, data-driven recommendations to optimize your content and strategy decisions.</p>
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

        {/* 7. EVERYTHING YOU NEED SECTION */}
        <div id="solutions" style={{ marginBottom: '5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-white)' }}>
              Everything You Need for Human Intelligence
            </h2>
            <p className="muted" style={{ maxWidth: '650px', margin: '10px auto 0 auto', fontSize: '0.92rem' }}>
              A complete platform for gathering, analyzing, and acting on verified human feedback at scale.
            </p>
          </div>
          <div className="grid-3" style={{ gap: '24px' }}>
            <div className="card feature-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#ffffff', borderRadius: '20px', border: '1px solid rgba(30, 107, 95, 0.08)', boxShadow: '0 10px 30px rgba(30, 107, 95, 0.03)' }}>
              <div className="feature-icon-badge" style={{ width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(30, 107, 95, 0.08)', color: '#1e6b5f', fontSize: '1.1rem', marginBottom: '1.25rem' }}>
                <i className="fa-solid fa-list-check"></i>
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-white)', marginBottom: '10px' }}>Campaign Management</h4>
              <p className="small muted" style={{ lineHeight: 1.5 }}>Create, launch, and manage campaigns with an intuitive dashboard. Track progress and reviewer engagement in real-time.</p>
            </div>

            <div className="card feature-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#ffffff', borderRadius: '20px', border: '1px solid rgba(30, 107, 95, 0.08)', boxShadow: '0 10px 30px rgba(30, 107, 95, 0.03)' }}>
              <div className="feature-icon-badge" style={{ width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(224, 122, 95, 0.08)', color: '#e07a5f', fontSize: '1.1rem', marginBottom: '1.25rem' }}>
                <i className="fa-solid fa-earth-americas"></i>
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-white)', marginBottom: '10px' }}>Global Reviewer Network</h4>
              <p className="small muted" style={{ lineHeight: 1.5 }}>Access diverse perspectives from 50,000+ verified reviewers across 120+ countries and countless demographics.</p>
            </div>

            <div className="card feature-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#ffffff', borderRadius: '20px', border: '1px solid rgba(30, 107, 95, 0.08)', boxShadow: '0 10px 30px rgba(30, 107, 95, 0.03)' }}>
              <div className="feature-icon-badge" style={{ width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(242, 204, 143, 0.15)', color: '#d4a35c', fontSize: '1.1rem', marginBottom: '1.25rem' }}>
                <i className="fa-solid fa-brain"></i>
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-white)', marginBottom: '10px' }}>AI-Powered Analysis</h4>
              <p className="small muted" style={{ lineHeight: 1.5 }}>Advanced AI models process feedback to generate actionable recommendations, quality scores, and trend analysis.</p>
            </div>

            <div className="card feature-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#ffffff', borderRadius: '20px', border: '1px solid rgba(30, 107, 95, 0.08)', boxShadow: '0 10px 30px rgba(30, 107, 95, 0.03)' }}>
              <div className="feature-icon-badge" style={{ width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(242, 204, 143, 0.15)', color: '#d4a35c', fontSize: '1.1rem', marginBottom: '1.25rem' }}>
                <i className="fa-solid fa-code"></i>
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-white)', marginBottom: '10px' }}>Developer API</h4>
              <p className="small muted" style={{ lineHeight: 1.5 }}>Integrate human intelligence directly into your applications with our comprehensive REST API and SDKs.</p>
            </div>

            <div className="card feature-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#ffffff', borderRadius: '20px', border: '1px solid rgba(30, 107, 95, 0.08)', boxShadow: '0 10px 30px rgba(30, 107, 95, 0.03)' }}>
              <div className="feature-icon-badge" style={{ width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(30, 107, 95, 0.08)', color: '#1e6b5f', fontSize: '1.1rem', marginBottom: '1.25rem' }}>
                <i className="fa-solid fa-shield-halved"></i>
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-white)', marginBottom: '10px' }}>Quality Assurance</h4>
              <p className="small muted" style={{ lineHeight: 1.5 }}>Multi-layer validation with AI scoring, fraud detection, and human audit ensures data integrity at every step.</p>
            </div>

            <div className="card feature-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', background: '#ffffff', borderRadius: '20px', border: '1px solid rgba(30, 107, 95, 0.08)', boxShadow: '0 10px 30px rgba(30, 107, 95, 0.03)' }}>
              <div className="feature-icon-badge" style={{ width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(129, 178, 154, 0.15)', color: '#568f74', fontSize: '1.1rem', marginBottom: '1.25rem' }}>
                <i className="fa-solid fa-chart-line"></i>
              </div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--text-white)', marginBottom: '10px' }}>Real-Time Dashboard</h4>
              <p className="small muted" style={{ lineHeight: 1.5 }}>Visualize campaign performance, reviewer engagement, and insight trends in one unified analytics view.</p>
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

        {/* 31. CTA GRADIENT BANNER CARD */}
        <div className="card text-center cta-gradient-banner" style={{ padding: '4.5rem 2rem', marginBottom: '5rem', background: 'linear-gradient(135deg, #1e6b5f 0%, #113f38 100%)', border: 'none', borderRadius: '24px', color: '#ffffff', boxShadow: '0 20px 40px rgba(30, 107, 95, 0.15)' }}>
          <h2 style={{ fontSize: '2.4rem', fontWeight: 800, color: '#ffffff', marginBottom: '12px' }}>
            Ready to Understand Your Audience?
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '1rem', maxWidth: '600px', margin: '0 auto 2.5rem auto' }}>
            Join thousands of businesses using Attentra to make data-driven decisions powered by real human intelligence.
          </p>
          <div className="hero-ctas" style={{ justifyContent: 'center', gap: '15px' }}>
            <button className="btn btn-secondary btn-lg" onClick={() => setView('client')} style={{ background: '#ffffff', color: '#1e6b5f', border: 'none', padding: '12px 28px', fontWeight: 600 }}>
              Get Started Free
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => setView('client')} style={{ background: 'transparent', color: '#ffffff', border: '1px solid #ffffff', padding: '12px 28px' }}>
              Contact Sales
            </button>
          </div>
        </div>
      </div>

      {/* 32. DEEP FOOTER */}
      <footer className="landing-footer" style={{ background: '#1e3530', borderTop: '1px solid rgba(255, 255, 255, 0.05)', padding: '4rem 2rem 2rem 2rem', marginTop: '5rem' }}>
        <div className="footer-grid">
          <div className="footer-col-logo">
            <div className="navbar-logo" style={{ background: 'none', WebkitTextFillColor: 'initial', fontSize: '1.5rem', fontWeight: 800, cursor: 'default' }}>
              <span style={{ color: '#ffffff' }}>Att</span>
              <span style={{ color: 'var(--orange)' }}>entra</span>
            </div>
            <p className="small" style={{ color: 'rgba(255, 255, 255, 0.6)', marginTop: '12px', maxWidth: '280px', lineHeight: 1.5 }}>
              The global human intelligence platform for understanding how people think, react, and decide.
            </p>
          </div>
          <div className="footer-col-links">
            <h5 style={{ color: '#ffffff', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.2rem' }}>Platform</h5>
            <a href="#platform" onClick={(e) => { e.preventDefault(); setView('client'); }} style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Campaigns</a>
            <a href="#platform" onClick={(e) => { e.preventDefault(); setView('client'); }} style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Insights</a>
            <a href="#platform" onClick={(e) => { e.preventDefault(); setView('client'); }} style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Developer Portal</a>
            <a href="#platform" onClick={(e) => { e.preventDefault(); setView('reviewer'); }} style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Reviewer Dashboard</a>
          </div>
          <div className="footer-col-links">
            <h5 style={{ color: '#ffffff', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.2rem' }}>Account</h5>
            <a href="#platform" onClick={(e) => { e.preventDefault(); setView('client'); }} style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Log In</a>
            <a href="#platform" onClick={(e) => { e.preventDefault(); setView('client'); }} style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Sign Up</a>
            <a href="#platform" onClick={(e) => { e.preventDefault(); setView('client'); }} style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Dashboard</a>
            <a href="#platform" onClick={(e) => { e.preventDefault(); setView('client'); }} style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Billing</a>
          </div>
          <div className="footer-col-links">
            <h5 style={{ color: '#ffffff', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '1.2rem' }}>Admin</h5>
            <a href="#platform" onClick={(e) => { e.preventDefault(); setView('admin'); }} style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Admin Dashboard</a>
            <a href="#platform" onClick={(e) => { e.preventDefault(); setView('admin'); }} style={{ color: 'rgba(255, 255, 255, 0.6)' }}>Task Management</a>
          </div>
        </div>
        <div className="footer-bottom-row" style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '1.5rem', marginTop: '3rem' }}>
          <span className="small" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>&copy; 2026 Attentra Inc. All rights reserved.</span>
          <div className="footer-status-pill" style={{ background: 'rgba(46, 204, 113, 0.1)', border: '1px solid rgba(46, 204, 113, 0.2)', color: '#2ecc71' }}>
            <div className="pulse-emerald" style={{ background: '#2ecc71', boxShadow: '0 0 8px #2ecc71' }}></div>
            <span>All Systems Operational</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
