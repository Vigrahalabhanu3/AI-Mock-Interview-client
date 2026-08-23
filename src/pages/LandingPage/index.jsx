import { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import {
  BsCameraVideoFill,
  BsMicFill,
  BsFileEarmarkTextFill,
  BsCodeSlash,
  BsBarChartFill,
  BsStars,
  BsArrowRightShort,
  BsShieldCheck,
  BsCheckCircleFill,
  BsCheck2Circle,
  BsCpuFill,
  BsAwardFill,
  BsLightningChargeFill,
  BsLaptop,
  BsPersonBadgeFill,
} from 'react-icons/bs';
import './index.css';

function LandingPage() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // If user is already logged in, redirect directly to dashboard
  if (user) {
    navigate('/', { replace: true });
    return null;
  }

  return (
    <div className="landing-page">
      {/* ---- Public Navbar ---- */}
      <nav className="landing-nav glass-card">
        <div className="landing-nav-brand">
          <div className="landing-logo-box">
            <BsCameraVideoFill className="landing-logo-icon" />
          </div>
          <div className="landing-brand-text">
            <span className="landing-brand-title">AI Mock Interview</span>
            <span className="landing-brand-tag">Pro Platform</span>
          </div>
        </div>

        <div className="landing-nav-actions">
          <button
            className="landing-btn-login"
            onClick={() => navigate('/login?mode=login')}
          >
            Sign In
          </button>
          <button
            className="landing-btn-signup"
            onClick={() => navigate('/login?mode=signup')}
          >
            <span>Get Started Free</span>
            <BsArrowRightShort className="btn-arrow" />
          </button>
        </div>
      </nav>

      {/* ---- Hero Section ---- */}
      <section className="landing-hero">
        <div className="hero-pill-badge">
          <BsStars className="pill-star-icon" />
          <span>Powered by Gemini AI • Real-Time Voice & Code Evaluation</span>
        </div>

        <h1 className="landing-hero-title">
          Master Technical Interviews with Your <span className="hero-gradient-text">Personal AI Coach</span>
        </h1>

        <p className="landing-hero-subtitle">
          Simulate realistic voice interviews, parse your PDF resume for targeted questions, execute live code solutions, and get instant performance scorecards.
        </p>

        <div className="landing-cta-group">
          <button
            className="landing-primary-cta"
            onClick={() => navigate('/login?mode=signup')}
          >
            <BsLightningChargeFill className="cta-icon" />
            <span>Create Free Account</span>
            <BsArrowRightShort className="cta-arrow" />
          </button>
          <button
            className="landing-secondary-cta"
            onClick={() => navigate('/login?mode=login')}
          >
            <span>Already have an account? Log In</span>
          </button>
        </div>

        {/* Hero Mock UI Visual Card */}
        <div className="landing-preview-frame glass-card shadow-2xl">
          <div className="frame-header-bar">
            <div className="frame-dots">
              <span className="dot red" />
              <span className="dot yellow" />
              <span className="dot green" />
            </div>
            <span className="frame-title">AI Interview Room Preview • Live Session</span>
          </div>

          <div className="frame-body">
            <div className="preview-panel-left">
              <div className="preview-ai-avatar">
                <div className="avatar-icon-circle">
                  <BsPersonBadgeFill className="avatar-icon" />
                </div>
                <div className="avatar-details">
                  <span className="avatar-name">Natalie</span>
                  <span className="avatar-status">AI Senior Technical Interviewer</span>
                </div>
              </div>

              <div className="preview-question-box">
                <span className="preview-badge">Question 1 of 5 • Technical</span>
                <p className="preview-q-text">
                  "Explain how React's virtual DOM reconciliation works under the hood, and how key props optimize list rendering."
                </p>
              </div>
            </div>

            <div className="preview-panel-right">
              <div className="preview-code-header">
                <BsCodeSlash className="code-icon" />
                <span>JavaScript Code Editor</span>
              </div>
              <pre className="preview-code-box">
{`function reconcileList(prevList, nextList) {
  // AI evaluating code syntax & time complexity...
  const keyMap = new Map();
  prevList.forEach((item) => keyMap.set(item.key, item));
  return nextList.map(item => keyMap.get(item.key) || item);
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* ---- Features Grid ---- */}
      <section className="landing-features-section">
        <div className="section-header text-center">
          <span className="section-kicker">Platform Capabilities</span>
          <h2 className="section-title">Everything You Need to Win Offers</h2>
          <p className="section-desc">
            Designed to bridge the gap between technical knowledge and real-time interview pressure.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card glass-card">
            <div className="feature-icon-box blue">
              <BsMicFill />
            </div>
            <h3 className="feature-title">Interactive Voice Engine</h3>
            <p className="feature-text">
              Natural speech synthesis and voice recognition lets you converse with your interviewer hands-free.
            </p>
          </div>

          <div className="feature-card glass-card">
            <div className="feature-icon-box green">
              <BsFileEarmarkTextFill />
            </div>
            <h3 className="feature-title">PDF Resume Skill Parsing</h3>
            <p className="feature-text">
              Upload your PDF resume to generate targeted technical & behavioral questions matching your exact background.
            </p>
          </div>

          <div className="feature-card glass-card">
            <div className="feature-icon-box purple">
              <BsCodeSlash />
            </div>
            <h3 className="feature-title">Live Code Evaluation</h3>
            <p className="feature-text">
              Solve algorithm & bug-fix questions directly in the browser across JavaScript, Python, Java, and C++.
            </p>
          </div>

          <div className="feature-card glass-card">
            <div className="feature-icon-box amber">
              <BsBarChartFill />
            </div>
            <h3 className="feature-title">Instant AI Scorecard</h3>
            <p className="feature-text">
              Receive detailed feedback broken down into technical accuracy, communication, and problem solving.
            </p>
          </div>
        </div>
      </section>

      {/* ---- How It Works 3 Steps ---- */}
      <section className="landing-steps-section">
        <div className="section-header text-center">
          <span className="section-kicker">Simple 3-Step Process</span>
          <h2 className="section-title">How It Works</h2>
        </div>

        <div className="steps-row">
          <div className="step-card glass-card">
            <div className="step-number">01</div>
            <h3 className="step-title">Configure Target Role</h3>
            <p className="step-text">Choose your target position, difficulty level, and upload your PDF resume.</p>
          </div>

          <div className="step-card glass-card">
            <div className="step-number">02</div>
            <h3 className="step-title">Conduct Mock Session</h3>
            <p className="step-text">Answer voice questions and complete live coding challenges with instant AI responses.</p>
          </div>

          <div className="step-card glass-card">
            <div className="step-number">03</div>
            <h3 className="step-title">Review Scorecard</h3>
            <p className="step-text">Analyze overall readiness scores, strengths, and targeted improvement suggestions.</p>
          </div>
        </div>
      </section>

      {/* ---- Footer ---- */}
      <footer className="landing-footer glass-card">
        <div className="footer-content">
          <div className="footer-brand">
            <BsCameraVideoFill className="footer-logo" />
            <span>AI Mock Interview Platform</span>
          </div>
          <div className="footer-badge">
            <BsShieldCheck className="shield-icon" />
            <span>Encrypted • Private • Gemini AI Powered</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
