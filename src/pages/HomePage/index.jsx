import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import { getHistory, deleteHistoryItem } from '../../services/historyService.js';
import InterviewCard from '../../components/InterviewCard';
import { DashboardSkeleton, ErrorState } from '../../components/common/Loading';
import { calculateStreak } from '../../utils/streakUtils.js';
import {
  BsPlayCircleFill,
  BsTrophyFill,
  BsCheckCircleFill,
  BsClockFill,
  BsSearch,
  BsStars,
  BsLightningChargeFill,
  BsCodeSquare,
  BsMicFill,
  BsFileEarmarkPersonFill,
  BsArrowRightShort,
  BsFilterLeft,
  BsGraphUpArrow,
  BsFire,
  BsCpuFill,
  BsShieldCheck,
  BsCompassFill,
  BsAwardFill,
} from 'react-icons/bs';
import toast from 'react-hot-toast';
import './index.css';

function HomePage() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [allInterviews, setAllInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const allData = await getHistory(1, 100);
      setAllInterviews(allData.entries || []);
    } catch (err) {
      console.error('Failed to load history:', err.message);
      setError(err.message || 'Unable to connect to backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleDelete = async (id) => {
    try {
      await deleteHistoryItem(id);
      setAllInterviews((prev) => prev.filter((item) => item._id !== id));
      toast.success('Interview deleted');
    } catch (error) {
      toast.error('Failed to delete interview');
    }
  };

  const handleCardClick = (interview) => {
    if (interview.status === 'completed') {
      navigate(`/feedback/${interview._id}`);
    } else {
      navigate(`/interview/${interview._id}`);
    }
  };

  const handleQuickStartRole = (roleName) => {
    navigate('/setup', { state: { presetRole: roleName } });
  };

  // Analytics Metrics
  const completedInterviews = allInterviews.filter((i) => i.status === 'completed');
  const inProgressInterviews = allInterviews.filter((i) => i.status !== 'completed');

  const completedCount = completedInterviews.length;
  const completionRate =
    allInterviews.length > 0
      ? Math.round((completedCount / allInterviews.length) * 100)
      : 0;

  const validScores = completedInterviews.filter(
    (i) => typeof i.overallScore === 'number'
  );
  const avgScore =
    validScores.length > 0
      ? Math.round(
          validScores.reduce((sum, i) => sum + i.overallScore, 0) /
            validScores.length
        )
      : 78; // Default initial target score

  const totalQuestionsAnswered = allInterviews.reduce(
    (sum, i) => sum + (i.questions?.length || 0),
    0
  );

  const getGrade = (score) => {
    if (score >= 90) return { grade: 'A+', color: '#10b981', label: 'Top Tier Ready' };
    if (score >= 80) return { grade: 'A', color: '#06b6d4', label: 'Senior Level' };
    if (score >= 70) return { grade: 'B', color: '#6366f1', label: 'Proficient' };
    if (score >= 60) return { grade: 'C', color: '#f59e0b', label: 'Developing' };
    if (score > 0) return { grade: 'Needs Work', color: '#ef4444', label: 'Practice Required' };
    return { grade: 'Ready', color: '#06b6d4', label: 'Start Session' };
  };

  const gradeInfo = getGrade(avgScore);
  const streakInfo = calculateStreak(allInterviews);

  // Filtered Interviews
  const filteredInterviews = allInterviews.filter((item) => {
    const matchesSearch =
      item.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.resumeText?.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeFilter === 'completed')
      return matchesSearch && item.status === 'completed';
    if (activeFilter === 'in_progress')
      return matchesSearch && item.status !== 'completed';
    return matchesSearch;
  });

  const recentFiltered = filteredInterviews.slice(0, 6);

  if (loading) {
    return (
      <div className="home-dashboard">
        <DashboardSkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-dashboard">
        <ErrorState
          title="Unable to Load Dashboard Data"
          message={error}
          onRetry={loadHistory}
          retryText="Reload Dashboard"
        />
      </div>
    );
  }

  return (
    <div className="home-dashboard">
      {/* ---- HERO CAREER COMMAND CENTER ---- */}
      <section className="dashboard-hero glass-card">
        <div className="hero-content">
          <div className="hero-pill-tag">
            <BsStars className="hero-sparkle" />
            <span>AI Career Copilot • Ready</span>
          </div>

          <h1 className="hero-title">
            Welcome back, <span className="hero-name-accent">{user?.name?.split(' ')[0] || 'Engineer'}</span>
          </h1>
          <p className="hero-subtitle">
            Sharpen your technical interview instincts with simulated voice rounds, real-time code evaluation, and senior engineering benchmarks.
          </p>

          {/* Quick Role Launchpads */}
          <div className="hero-launchpads-row">
            <span className="launchpads-label">Target Role:</span>
            <button
              className="launchpad-pill"
              onClick={() => handleQuickStartRole('Frontend React Developer')}
            >
              <BsCodeSquare /> Frontend React
            </button>
            <button
              className="launchpad-pill"
              onClick={() => handleQuickStartRole('Backend Node.js Developer')}
            >
              <BsLightningChargeFill /> Backend Node
            </button>
            <button
              className="launchpad-pill"
              onClick={() => handleQuickStartRole('Fullstack Engineer')}
            >
              <BsCpuFill /> Fullstack JS
            </button>
            <button
              className="launchpad-pill"
              onClick={() => handleQuickStartRole('System Design Architect')}
            >
              <BsGraphUpArrow /> System Design
            </button>
          </div>
        </div>

        {/* Readiness Radial Dial */}
        <div className="hero-readiness-dial-card">
          <div className="dial-svg-wrapper">
            <svg viewBox="0 0 120 120" className="readiness-svg">
              <circle
                cx="60"
                cy="60"
                r="50"
                className="dial-track"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                className="dial-fill"
                strokeDasharray={314}
                strokeDashoffset={314 - (314 * (avgScore || 75)) / 100}
              />
            </svg>
            <div className="dial-score-center">
              <span className="dial-num">{avgScore}%</span>
              <span className="dial-sub">Readiness</span>
            </div>
          </div>

          <div className="dial-meta">
            <span className="dial-grade-badge" style={{ color: gradeInfo.color }}>
              {gradeInfo.label}
            </span>
            <button
              className="dial-start-btn btn-primary"
              onClick={() => navigate('/setup')}
            >
              <BsPlayCircleFill /> Launch Interview
            </button>
          </div>
        </div>
      </section>

      {/* ---- COMPETENCY & KPI GRID ---- */}
      <section className="command-metrics-grid">
        {/* Competency Breakdown Card */}
        <div className="competency-matrix-card glass-card">
          <div className="matrix-header">
            <div className="matrix-title-group">
              <BsCompassFill className="matrix-icon" />
              <h3 className="matrix-title">Skill Competency Matrix</h3>
            </div>
            <span className="matrix-status-tag">Target: Senior Level</span>
          </div>

          <div className="competency-bars-list">
            <div className="competency-bar-item">
              <div className="bar-info-row">
                <span className="skill-name">Problem Solving & Algorithms</span>
                <span className="skill-score">84%</span>
              </div>
              <div className="skill-track">
                <div className="skill-fill cyan-fill" style={{ width: '84%' }} />
              </div>
            </div>

            <div className="competency-bar-item">
              <div className="bar-info-row">
                <span className="skill-name">System Design & Scalability</span>
                <span className="skill-score">76%</span>
              </div>
              <div className="skill-track">
                <div className="skill-fill indigo-fill" style={{ width: '76%' }} />
              </div>
            </div>

            <div className="competency-bar-item">
              <div className="bar-info-row">
                <span className="skill-name">STAR Communication Clarity</span>
                <span className="skill-score">88%</span>
              </div>
              <div className="skill-track">
                <div className="skill-fill emerald-fill" style={{ width: '88%' }} />
              </div>
            </div>

            <div className="competency-bar-item">
              <div className="bar-info-row">
                <span className="skill-name">Code Optimization & Clean Syntax</span>
                <span className="skill-score">82%</span>
              </div>
              <div className="skill-track">
                <div className="skill-fill violet-fill" style={{ width: '82%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* 3 KPI Summary Cards */}
        <div className="kpi-mini-column">
          <div className="kpi-card glass-card">
            <div className="kpi-icon-box blue-box">
              <BsClockFill />
            </div>
            <div className="kpi-details">
              <span className="kpi-value">{allInterviews.length}</span>
              <span className="kpi-label">Total Mock Sessions</span>
            </div>
            <span className="kpi-meta-tag">{totalQuestionsAnswered} questions attempted</span>
          </div>

          <div className="kpi-card glass-card">
            <div className="kpi-icon-box green-box">
              <BsCheckCircleFill />
            </div>
            <div className="kpi-details">
              <span className="kpi-value">{completionRate}%</span>
              <span className="kpi-label">Completion Rate</span>
            </div>
            <span className="kpi-meta-tag success">{completedCount} full rounds finished</span>
          </div>

          <div className="kpi-card glass-card">
            <div className="kpi-icon-box amber-box">
              <BsFire className="kpi-flame-icon" />
            </div>
            <div className="kpi-details">
              <span className="kpi-value">{streakInfo.currentStreak} Days</span>
              <span className="kpi-label">Practice Streak</span>
            </div>
            <span className={`kpi-meta-tag ${streakInfo.practicedToday ? 'success' : 'warning'}`}>
              {streakInfo.practicedToday ? '🔥 Active Today!' : '⚡ Practice to hold streak!'}
            </span>
          </div>
        </div>
      </section>

      {/* ---- INTERVIEW SESSIONS LIST ---- */}
      <section className="sessions-section">
        <div className="sessions-header-bar">
          <div className="sessions-title-group">
            <h2 className="section-heading">Recent Interview Sessions</h2>
            <p className="section-sub">Click any completed session to inspect comprehensive coach feedback</p>
          </div>

          <div className="sessions-filter-controls">
            <div className="search-input-wrap">
              <BsSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-pill-group">
              <button
                className={`filter-pill ${activeFilter === 'all' ? 'active' : ''}`}
                onClick={() => setActiveFilter('all')}
              >
                All
              </button>
              <button
                className={`filter-pill ${activeFilter === 'completed' ? 'active' : ''}`}
                onClick={() => setActiveFilter('completed')}
              >
                Completed
              </button>
              <button
                className={`filter-pill ${activeFilter === 'in_progress' ? 'active' : ''}`}
                onClick={() => setActiveFilter('in_progress')}
              >
                In Progress
              </button>
            </div>
          </div>
        </div>

        {recentFiltered.length > 0 ? (
          <div className="interviews-cards-grid">
            {recentFiltered.map((interview) => (
              <InterviewCard
                key={interview._id}
                interview={interview}
                onClick={() => handleCardClick(interview)}
                onDelete={() => handleDelete(interview._id)}
              />
            ))}
          </div>
        ) : (
          <div className="empty-sessions-card glass-card">
            <BsAwardFill className="empty-icon" />
            <h4 className="empty-title">No matching interview sessions</h4>
            <p className="empty-desc">Launch your first technical practice session to build your readiness profile.</p>
            <button
              className="btn-primary"
              onClick={() => navigate('/setup')}
            >
              Start New Interview
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default HomePage;
