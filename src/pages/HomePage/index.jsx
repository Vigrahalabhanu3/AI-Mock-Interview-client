import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import { getHistory, deleteHistoryItem } from '../../services/historyService.js';
import InterviewCard from '../../components/InterviewCard';
import { DashboardSkeleton, ErrorState, CardSkeleton } from '../../components/common/Loading';
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
  const completionRate = allInterviews.length > 0 ? Math.round((completedCount / allInterviews.length) * 100) : 0;

  const validScores = completedInterviews.filter((i) => typeof i.overallScore === 'number');
  const avgScore = validScores.length > 0
    ? Math.round(validScores.reduce((sum, i) => sum + i.overallScore, 0) / validScores.length)
    : 0;

  const totalQuestionsAnswered = allInterviews.reduce((sum, i) => sum + (i.questions?.length || 0), 0);

  // Performance Grade Calculation
  const getGrade = (score) => {
    if (score >= 90) return { grade: 'A+', color: '#10b981', label: 'Exceptional' };
    if (score >= 80) return { grade: 'A', color: '#3b82f6', label: 'Strong' };
    if (score >= 70) return { grade: 'B', color: '#6366f1', label: 'Proficient' };
    if (score >= 60) return { grade: 'C', color: '#f59e0b', label: 'Developing' };
    if (score > 0) return { grade: 'Needs Work', color: '#ef4444', label: 'Practice Required' };
    return { grade: 'N/A', color: '#94a3b8', label: 'No Data Yet' };
  };

  const gradeInfo = getGrade(avgScore);
  const streakInfo = calculateStreak(allInterviews);

  // Filtered Interviews
  const filteredInterviews = allInterviews.filter((item) => {
    const matchesSearch = item.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.resumeText?.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (activeFilter === 'completed') return matchesSearch && item.status === 'completed';
    if (activeFilter === 'in_progress') return matchesSearch && item.status !== 'completed';
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
      {/* ---- HERO BANNER ---- */}
      <section className="dashboard-hero shadow-lg">
        <div className="hero-content">
          <div className="hero-badge">
            <BsStars className="hero-sparkle" />
            <span>AI Practice Engine • Active</span>
          </div>

          <h1 className="hero-title">
            Welcome back, <span className="hero-name-accent">{user?.name?.split(' ')[0]}</span>!
          </h1>
          <p className="hero-subtitle">
            Hone your technical skills with AI-driven voice interviews, real-time code evaluation, and actionable feedback.
          </p>

          {/* Quick Role Launch Pills */}
          <div className="hero-roles-bar">
            <span className="roles-label">Quick Launch Role:</span>
            <button className="role-pill" onClick={() => handleQuickStartRole('Frontend React Developer')}>
              <BsCodeSquare className="pill-icon" /> Frontend React
            </button>
            <button className="role-pill" onClick={() => handleQuickStartRole('Backend Node.js Developer')}>
              <BsLightningChargeFill className="pill-icon" /> Backend Node.js
            </button>
            <button className="role-pill" onClick={() => handleQuickStartRole('Fullstack Engineer')}>
              <BsStars className="pill-icon" /> Fullstack JS
            </button>
            <button className="role-pill" onClick={() => handleQuickStartRole('System Design Architect')}>
              <BsGraphUpArrow className="pill-icon" /> System Design
            </button>
          </div>
        </div>

        <div className="hero-actions">
          <button className="hero-primary-btn" onClick={() => navigate('/setup')}>
            <BsPlayCircleFill className="btn-icon" />
            <span>Start New Interview</span>
          </button>
        </div>
      </section>

      {/* ---- KPI METRICS GRID ---- */}
      <section className="kpi-grid">
        {/* Metric 1: Total Practice Sessions */}
        <div className="kpi-card glass-card">
          <div className="kpi-icon-box blue-box">
            <BsClockFill />
          </div>
          <div className="kpi-details">
            <span className="kpi-value">{allInterviews.length}</span>
            <span className="kpi-label">Total Mock Sessions</span>
          </div>
          <div className="kpi-footer-badge neutral">
            <span>{totalQuestionsAnswered} questions attempted</span>
          </div>
        </div>

        {/* Metric 2: Completion Rate */}
        <div className="kpi-card glass-card">
          <div className="kpi-icon-box green-box">
            <BsCheckCircleFill />
          </div>
          <div className="kpi-details">
            <span className="kpi-value">{completedCount}</span>
            <span className="kpi-label">Completed Interviews</span>
          </div>
          <div className="kpi-footer-badge success">
            <span>{completionRate}% Completion Rate</span>
          </div>
        </div>

        {/* Metric 3: Average Score & Grade */}
        <div className="kpi-card glass-card">
          <div className="kpi-icon-box purple-box">
            <BsTrophyFill />
          </div>
          <div className="kpi-details">
            <div className="kpi-score-wrapper">
              <span className="kpi-value">{avgScore}</span>
              <span className="kpi-max">/100</span>
            </div>
            <span className="kpi-label">Average Readiness Score</span>
          </div>
          <div className="kpi-footer-badge" style={{ backgroundColor: `${gradeInfo.color}15`, color: gradeInfo.color }}>
            <span>Grade: {gradeInfo.grade} ({gradeInfo.label})</span>
          </div>
        </div>

        {/* Metric 4: Daily Practice Streak */}
        <div className="kpi-card glass-card streak-kpi-card">
          <div className="kpi-icon-box amber-box">
            <BsFire className="kpi-flame-icon" />
          </div>
          <div className="kpi-details">
            <span className="kpi-value">{streakInfo.currentStreak} <span className="streak-unit">Days</span></span>
            <span className="kpi-label">Active Practice Streak</span>
          </div>
          <div className={`kpi-footer-badge ${streakInfo.practicedToday ? 'success' : 'warning'}`}>
            <span>{streakInfo.practicedToday ? '🔥 Practiced Today!' : '⚡ Practice today to maintain streak!'}</span>
          </div>
        </div>
      </section>

      {/* ---- PRACTICE MODES SECTION ---- */}
      <section className="practice-modes-section">
        <h2 className="section-title">
          <span>Practice Modes</span>
        </h2>

        <div className="modes-grid">
          {/* Mode 1: Full Voice & Code */}
          <div className="mode-card glass-card" onClick={() => navigate('/setup')}>
            <div className="mode-header">
              <div className="mode-icon-circle purple-gradient">
                <BsMicFill />
              </div>
              <span className="mode-tag">Most Popular</span>
            </div>
            <h3 className="mode-title">Full Voice & Code Simulation</h3>
            <p className="mode-desc">
              Experience a live interview with AI voice questions, real-time speech transcription, and interactive coding exercises.
            </p>
            <div className="mode-footer">
              <span>Start Voice Session</span>
              <BsArrowRightShort className="arrow-icon" />
            </div>
          </div>

          {/* Mode 2: Resume Tailored Session */}
          <div className="mode-card glass-card" onClick={() => navigate('/setup')}>
            <div className="mode-header">
              <div className="mode-icon-circle blue-gradient">
                <BsFileEarmarkPersonFill />
              </div>
              <span className="mode-tag blue">Custom AI</span>
            </div>
            <h3 className="mode-title">Resume-Tailored Interview</h3>
            <p className="mode-desc">
              Upload or paste your resume text to generate personalized interview questions based on your specific past experience.
            </p>
            <div className="mode-footer">
              <span>Configure Resume Setup</span>
              <BsArrowRightShort className="arrow-icon" />
            </div>
          </div>

          {/* Mode 3: Rapid Warmup */}
          <div className="mode-card glass-card" onClick={() => navigate('/setup')}>
            <div className="mode-header">
              <div className="mode-icon-circle emerald-gradient">
                <BsLightningChargeFill />
              </div>
              <span className="mode-tag green">5-Min Quiz</span>
            </div>
            <h3 className="mode-title">Quick Technical Warmup</h3>
            <p className="mode-desc">
              Short, targeted practice questions to sharpen your problem-solving skills before real-world engineering interviews.
            </p>
            <div className="mode-footer">
              <span>Launch Quick Quiz</span>
              <BsArrowRightShort className="arrow-icon" />
            </div>
          </div>
        </div>
      </section>

      {/* ---- RECENT INTERVIEWS FEED & FILTER ---- */}
      <section className="history-feed-section">
        <div className="feed-header">
          <div className="feed-title-wrapper">
            <h2 className="feed-title">Recent Interview History</h2>
            <span className="feed-count-badge">{allInterviews.length} Total</span>
          </div>

          {/* Controls: Search & Tabs */}
          <div className="feed-controls">
            <div className="search-box">
              <BsSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by role or skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <div className="filter-tabs">
              <button
                className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
                onClick={() => setActiveFilter('all')}
              >
                All
              </button>
              <button
                className={`filter-tab ${activeFilter === 'completed' ? 'active' : ''}`}
                onClick={() => setActiveFilter('completed')}
              >
                Completed ({completedCount})
              </button>
              <button
                className={`filter-tab ${activeFilter === 'in_progress' ? 'active' : ''}`}
                onClick={() => setActiveFilter('in_progress')}
              >
                In-Progress ({inProgressInterviews.length})
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="history-skeleton-grid">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <CardSkeleton key={n} />
            ))}
          </div>
        ) : recentFiltered.length === 0 ? (
          <div className="feed-empty-card glass-card">
            <div className="empty-icon-wrapper">
              <BsFilterLeft className="empty-icon" />
            </div>
            <h3 className="empty-heading">
              {searchQuery ? 'No matching interviews found' : 'No mock interviews yet'}
            </h3>
            <p className="empty-text">
              {searchQuery
                ? 'Try adjusting your search terms or filters.'
                : 'Start your first AI mock interview to build your readiness history and track progress.'}
            </p>
            <button className="empty-cta-btn" onClick={() => navigate('/setup')}>
              <BsPlayCircleFill className="btn-icon" />
              <span>Start Mock Interview</span>
            </button>
          </div>
        ) : (
          <div className="interviews-grid">
            {recentFiltered.map((interview) => (
              <InterviewCard
                key={interview._id}
                interview={interview}
                onClick={() => handleCardClick(interview)}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {allInterviews.length > 6 && (
          <div className="view-all-footer">
            <button className="view-all-btn" onClick={() => navigate('/history')}>
              <span>View All {allInterviews.length} Interviews in History</span>
              <BsArrowRightShort className="arrow-icon" />
            </button>
          </div>
        )}
      </section>
    </div>
  );
}

export default HomePage;
