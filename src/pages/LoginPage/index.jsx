// ============================================
// LoginPage - Landing-Page Style Auth
// ============================================
// Top hero banner with value prop + features,
// form card below. Inspired by Pramp/Interviewing.io.
// Reference: useState, useContext, useNavigate - reference-react.md
// Reference: React Icons - reference-react.md
// ============================================

import { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import { register, emailLogin } from '../../services/authService.js';
import { ButtonLoader } from '../../components/common/Loading';
import {
  BsCameraVideo,
  BsMicFill,
  BsFileEarmarkTextFill,
  BsCodeSlash,
  BsBarChartFill,
  BsShieldCheck,
  BsPeopleFill,
  BsStars,
} from 'react-icons/bs';
import toast from 'react-hot-toast';
import './index.css';

function LoginPage() {
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');

  const [isSignUp, setIsSignUp] = useState(mode === 'signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { user, login } = useContext(AuthContext);
  const navigate = useNavigate();

  // If user is already logged in, redirect directly to dashboard
  useEffect(() => {
    if (user) {
      navigate('/', { replace: true });
    }
  }, [user, navigate]);

  // Sync mode search param with tab state
  useEffect(() => {
    if (mode === 'signup') {
      setIsSignUp(true);
    } else if (mode === 'login') {
      setIsSignUp(false);
    }
  }, [mode]);

  // Handle form submission - Reference: async/await - reference-javascript.md
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (isSignUp) {
        result = await register(name, email, password);
        toast.success('Account created successfully!');
      } else {
        result = await emailLogin(email, password);
        toast.success('Welcome back!');
      }

      login(result.token, result.user);
      navigate('/');
    } catch (error) {
      const message =
        error.response?.data?.message || 'Something went wrong';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* ---- Top Nav Bar ---- */}
      <nav className="login-nav">
        <div className="login-nav-brand">
          <div className="brand-icon-box">
            <BsCameraVideo className="login-nav-icon" />
          </div>
          <span className="login-nav-name">AI Mock Interview</span>
        </div>
      </nav>

      {/* ---- Hero Banner ---- */}
      <div className="login-hero">
        <div className="hero-sparkle-pill">
          <BsStars className="sparkle-icon" />
          <span>Gemini AI Practice Engine</span>
        </div>

        <h1 className="login-hero-heading">
          Ace Your Next <span className="login-hero-accent">Technical Interview</span>
        </h1>
        <p className="login-hero-tagline">
          Practice with an interactive AI interviewer that speaks, listens, evaluates code, and provides actionable performance scoring.
        </p>

        {/* Feature pills */}
        <div className="login-hero-features">
          <div className="login-hero-pill">
            <BsMicFill className="login-pill-icon" />
            <span className="login-pill-text">Voice Interviews</span>
          </div>
          <div className="login-hero-pill">
            <BsFileEarmarkTextFill className="login-pill-icon" />
            <span className="login-pill-text">Resume Analysis</span>
          </div>
          <div className="login-hero-pill">
            <BsCodeSlash className="login-pill-icon" />
            <span className="login-pill-text">Live Coding Evaluation</span>
          </div>
          <div className="login-hero-pill">
            <BsBarChartFill className="login-pill-icon" />
            <span className="login-pill-text">AI Scorecard</span>
          </div>
        </div>
      </div>

      {/* ---- Form Card ---- */}
      <div className="login-form-wrapper">
        <div className="login-card glass-card">
          {/* Tab Switcher */}
          <div className="login-tabs">
            <button
              type="button"
              className={`login-tab ${!isSignUp ? 'login-tab-active' : ''}`}
              onClick={() => setIsSignUp(false)}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`login-tab ${isSignUp ? 'login-tab-active' : ''}`}
              onClick={() => setIsSignUp(true)}
            >
              Create Account
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {isSignUp && (
              <div className="login-field">
                <label htmlFor="name" className="login-label">Full Name</label>
                <input
                  id="name"
                  type="text"
                  className="login-input"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="login-field">
              <label htmlFor="email" className="login-label">Email Address</label>
              <input
                id="email"
                type="email"
                className="login-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="password" className="login-label">Password</label>
              <input
                id="password"
                type="password"
                className="login-input"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <ButtonLoader
              type="submit"
              className="login-submit-btn"
              loading={loading}
              loadingText={isSignUp ? 'Creating Account...' : 'Signing In...'}
            >
              {isSignUp ? 'Create Account' : 'Sign In'}
            </ButtonLoader>

            {!isSignUp && (
              <button
                type="button"
                className="demo-autofill-btn"
                onClick={() => {
                  setEmail('bhanu@test.com');
                  setPassword('Password123!');
                  toast.success('Loaded demo test credentials');
                }}
              >
                <span>⚡ Fill Demo Credentials</span>
              </button>
            )}
          </form>
        </div>

        {/* Trust Indicators */}
        <div className="login-trust">
          <div className="login-trust-item">
            <BsShieldCheck className="login-trust-icon" />
            <span className="login-trust-text">Encrypted & Private</span>
          </div>
          <div className="login-trust-item">
            <BsPeopleFill className="login-trust-icon" />
            <span className="login-trust-text">10,000+ Mock Sessions</span>
          </div>
          <div className="login-trust-item">
            <BsBarChartFill className="login-trust-icon" />
            <span className="login-trust-text">Instant AI Feedback</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
