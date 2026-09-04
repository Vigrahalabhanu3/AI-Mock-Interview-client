import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import AudioWaveformVisualizer from '../../components/AudioWaveformVisualizer';
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
  BsCpuFill,
  BsAwardFill,
  BsLightningChargeFill,
  BsPlayFill,
  BsVolumeUpFill,
  BsCheck2Circle,
} from 'react-icons/bs';
import './index.css';

function LandingPage() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [demoPlaying, setDemoPlaying] = useState(false);
  const [demoCodeRan, setDemoCodeRan] = useState(false);

  // If user is already logged in, redirect directly to dashboard
  if (user) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const handleTestVoice = () => {
    if (demoPlaying) {
      setDemoPlaying(false);
      window.speechSynthesis?.cancel();
      return;
    }

    setDemoPlaying(true);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(
        "Hi there! Welcome to your AI mock interview. Can you explain how you design high-throughput event-driven microservices?"
      );
      utterance.rate = 1.0;
      utterance.pitch = 1.05;
      utterance.onend = () => setDemoPlaying(false);
      utterance.onerror = () => setDemoPlaying(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setTimeout(() => setDemoPlaying(false), 4000);
    }
  };

  const handleTestRunCode = () => {
    setDemoCodeRan(true);
  };

  return (
    <div className="landing-page">
      {/* ---- Public Navbar ---- */}
      <nav className="landing-nav glass-card">
        <div className="landing-nav-brand">
          <div className="landing-logo-box">
            <BsCameraVideoFill className="landing-logo-icon" />
          </div>
          <div className="landing-brand-text">
            <span className="landing-brand-title">MockAI Studio</span>
            <span className="landing-brand-tag">Principal Copilot</span>
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
            className="landing-btn-signup btn-primary"
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
          <span>Next-Gen AI Interview Cockpit • Real-Time Voice & Video Telepresence</span>
        </div>

        <h1 className="landing-hero-title">
          Conquer Tech Screenings with Your <span className="hero-gradient-text">Personal AI Evaluator</span>
        </h1>

        <p className="landing-hero-subtitle">
          Experience hyper-realistic voice interviews, upload your resume for tailored technical deep-dives, write live code solutions, and get instant senior engineering feedback scorecards.
        </p>

        <div className="landing-cta-group">
          <button
            className="landing-primary-cta btn-primary-lg"
            onClick={() => navigate('/login?mode=signup')}
          >
            <BsLightningChargeFill className="cta-icon" />
            <span>Create Free Account</span>
            <BsArrowRightShort className="cta-arrow" />
          </button>
          <button
            className="landing-secondary-cta btn-outline"
            onClick={() => navigate('/login?mode=login')}
          >
            <span>Sign In to Existing Account</span>
          </button>
        </div>

        {/* Interactive Hero Cockpit Simulator */}
        <div className="landing-cockpit-frame glass-card">
          <div className="frame-header-bar">
            <div className="frame-dots">
              <span className="dot red" />
              <span className="dot yellow" />
              <span className="dot green" />
            </div>
            <span className="frame-title">Interactive AI Interview Cockpit • Live Simulation</span>
            <div className="frame-status-live">
              <span className="live-dot" /> LIVE ENGINE
            </div>
          </div>

          <div className="frame-body-grid">
            {/* Left Simulator: AI Interviewer */}
            <div className="simulator-interviewer-pane">
              <div className="sim-avatar-header">
                <div className={`sim-avatar-orb ${demoPlaying ? 'is-active' : ''}`}>
                  <span>AI</span>
                </div>
                <div className="sim-avatar-meta">
                  <span className="sim-avatar-name">Natalie</span>
                  <span className="sim-avatar-role">Principal Tech Evaluator</span>
                </div>
              </div>

              <div className="sim-waveform-box">
                <AudioWaveformVisualizer
                  mode="ai"
                  isActive={demoPlaying}
                  height={44}
                />
              </div>

              <div className="sim-question-card">
                <span className="sim-q-badge">Question 1 • System Architecture</span>
                <p className="sim-q-text">
                  "Can you explain how you design high-throughput event-driven microservices, and how you handle idempotent consumers during network partitions?"
                </p>
              </div>

              <button
                type="button"
                className={`sim-voice-test-btn ${demoPlaying ? 'btn-playing' : ''}`}
                onClick={handleTestVoice}
              >
                <BsVolumeUpFill />
                <span>{demoPlaying ? 'Stop AI Voice Sample' : 'Click to Hear AI Interviewer'}</span>
              </button>
            </div>

            {/* Right Simulator: Code Studio */}
            <div className="simulator-code-pane">
              <div className="sim-code-header">
                <div className="sim-code-tab">
                  <BsCodeSlash className="tab-code-icon" />
                  <span>consumerHandler.js</span>
                </div>
                <button
                  type="button"
                  className="sim-run-code-btn"
                  onClick={handleTestRunCode}
                >
                  <BsPlayFill /> {demoCodeRan ? 'Evaluated (100/100)' : 'Run & Test Code'}
                </button>
              </div>

              <pre className="sim-code-editor">
{`// Idempotent Kafka / SQS consumer handler
async function handleOrderEvent(event, db) {
  const { eventId, orderId, payload } = event;
  const exists = await db.processedEvents.findOne({ eventId });
  if (exists) return { status: 'deduplicated' };

  await db.orders.updateOne({ orderId }, { $set: payload }, { upsert: true });
  await db.processedEvents.insertOne({ eventId, processedAt: new Date() });
  return { status: 'success' };
}`}
              </pre>

              {demoCodeRan && (
                <div className="sim-code-feedback-toast">
                  <BsCheck2Circle className="feedback-check" />
                  <span>Passed all 3 unit assertions! Idempotency key checked before state mutation.</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ---- Platform Capabilities Grid ---- */}
      <section className="landing-features-section">
        <div className="section-header text-center">
          <span className="section-kicker">Engineered For Offers</span>
          <h2 className="section-title">Everything You Need to Win Top-Tier Roles</h2>
          <p className="section-desc">
            Bridges the divide between isolated practice and the real pressure of technical interview loops.
          </p>
        </div>

        <div className="features-grid">
          <div className="feature-card glass-card">
            <div className="feature-icon-box cyan-glow">
              <BsMicFill />
            </div>
            <h3 className="feature-title">Real-Time Voice & Waveforms</h3>
            <p className="feature-text">
              Natural speech synthesis and reactive frequency spectrums simulate a conversational phone or video screen.
            </p>
          </div>

          <div className="feature-card glass-card">
            <div className="feature-icon-box emerald-glow">
              <BsCameraVideoFill />
            </div>
            <h3 className="feature-title">Candidate Telepresence Mirror</h3>
            <p className="feature-text">
              Toggle your webcam for a realistic video conference experience to master posture, pacing, and eye contact.
            </p>
          </div>

          <div className="feature-card glass-card">
            <div className="feature-icon-box indigo-glow">
              <BsFileEarmarkTextFill />
            </div>
            <h3 className="feature-title">PDF Resume Experience Parsing</h3>
            <p className="feature-text">
              Upload your resume to receive role-tailored questions focusing on your real past projects and stack.
            </p>
          </div>

          <div className="feature-card glass-card">
            <div className="feature-icon-box violet-glow">
              <BsCodeSlash />
            </div>
            <h3 className="feature-title">In-Browser Code Evaluation</h3>
            <p className="feature-text">
              Write solutions in JavaScript, Python, Java, or C++ with automated algorithmic scoring and complexity review.
            </p>
          </div>

          <div className="feature-card glass-card">
            <div className="feature-icon-box amber-glow">
              <BsBarChartFill />
            </div>
            <h3 className="feature-title">Executive Scorecard & Rewind</h3>
            <p className="feature-text">
              Inspect question-by-question coach debriefs, hireability verdicts, and comparative senior engineer answers.
            </p>
          </div>

          <div className="feature-card glass-card">
            <div className="feature-icon-box blue-glow">
              <BsAwardFill />
            </div>
            <h3 className="feature-title">Daily Practice Streak</h3>
            <p className="feature-text">
              Stay accountable with habit tracking, readiness metrics, and 1-click role launchpads.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
