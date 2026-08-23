import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getHistory,
  deleteHistoryItem,
  clearHistory,
} from '../../services/historyService.js';
import InterviewCard from '../../components/InterviewCard';
import {
  BsClockHistory,
  BsSearch,
  BsTrash3Fill,
  BsCheckCircleFill,
  BsTrophyFill,
  BsChevronLeft,
  BsChevronRight,
  BsPlayCircleFill,
  BsFilterLeft,
} from 'react-icons/bs';
import { CardSkeleton, ErrorState, ButtonLoader } from '../../components/common/Loading';
import toast from 'react-hot-toast';
import './index.css';

function HistoryPage() {
  const navigate = useNavigate();

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [clearing, setClearing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEntries, setTotalEntries] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  const ITEMS_PER_PAGE = 8;

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getHistory(page, ITEMS_PER_PAGE);
      setInterviews(data.entries || []);
      setTotalPages(data.totalPages || 1);
      setTotalEntries(data.totalEntries || 0);
    } catch (err) {
      setError(err.message || 'Failed to load interview history records.');
      toast.error('Failed to load interview history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, [page]);

  const handleDelete = async (id) => {
    try {
      await deleteHistoryItem(id);
      setInterviews((prev) => prev.filter((item) => item._id !== id));
      setTotalEntries((prev) => Math.max(0, prev - 1));
      toast.success('Interview deleted');
    } catch (error) {
      toast.error('Failed to delete interview');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Are you sure you want to clear all interview history? This cannot be undone.')) {
      return;
    }

    setClearing(true);
    try {
      await clearHistory();
      setInterviews([]);
      setTotalEntries(0);
      setTotalPages(1);
      toast.success('All history cleared successfully');
    } catch (error) {
      toast.error('Failed to clear history');
    } finally {
      setClearing(false);
    }
  };

  const handleCardClick = (interview) => {
    if (interview.status === 'completed') {
      navigate(`/feedback/${interview._id}`);
    } else {
      navigate(`/interview/${interview._id}`);
    }
  };

  // Filtered List
  const filteredInterviews = interviews.filter((item) => {
    const matchesSearch = item.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.resumeText?.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeFilter === 'completed') return matchesSearch && item.status === 'completed';
    if (activeFilter === 'in_progress') return matchesSearch && item.status !== 'completed';
    return matchesSearch;
  });

  const completedCount = interviews.filter((i) => i.status === 'completed').length;
  const inProgressCount = interviews.filter((i) => i.status !== 'completed').length;
  
  const validScores = interviews.filter((i) => typeof i.overallScore === 'number');
  const avgScore = validScores.length > 0
    ? Math.round(validScores.reduce((sum, i) => sum + i.overallScore, 0) / validScores.length)
    : 0;

  return (
    <div className="history-page">
      <div className="history-wrapper">
        {/* Header Title & Top Actions */}
        <div className="history-header">
          <div className="title-group">
            <h1 className="history-title">Interview History & Archives</h1>
            <p className="history-subtitle">
              Review detailed score breakdowns, past feedback reports, and resume metrics.
            </p>
          </div>

          {interviews.length > 0 && (
            <ButtonLoader
              className="clear-all-btn"
              loading={clearing}
              loadingText="Clearing..."
              onClick={handleClearAll}
            >
              <BsTrash3Fill className="trash-icon" />
              <span>Clear History</span>
            </ButtonLoader>
          )}
        </div>

        {/* Mini KPI Summary Strip */}
        <div className="history-summary-strip glass-card">
          <div className="strip-item">
            <div className="strip-icon-box blue">
              <BsClockHistory />
            </div>
            <div className="strip-info">
              <span className="strip-val">{totalEntries}</span>
              <span className="strip-lbl">Total Practice Sessions</span>
            </div>
          </div>

          <div className="strip-divider" />

          <div className="strip-item">
            <div className="strip-icon-box green">
              <BsCheckCircleFill />
            </div>
            <div className="strip-info">
              <span className="strip-val">{completedCount}</span>
              <span className="strip-lbl">Completed Reports</span>
            </div>
          </div>

          <div className="strip-divider" />

          <div className="strip-item">
            <div className="strip-icon-box purple">
              <BsTrophyFill />
            </div>
            <div className="strip-info">
              <span className="strip-val">{avgScore}/100</span>
              <span className="strip-lbl">Average Score</span>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="history-toolbar">
          <div className="search-input-wrapper">
            <BsSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by role or tech stack..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="history-search-input"
            />
          </div>

          <div className="history-filter-tabs">
            <button
              className={`history-tab ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All ({interviews.length})
            </button>
            <button
              className={`history-tab ${activeFilter === 'completed' ? 'active' : ''}`}
              onClick={() => setActiveFilter('completed')}
            >
              Completed ({completedCount})
            </button>
            <button
              className={`history-tab ${activeFilter === 'in_progress' ? 'active' : ''}`}
              onClick={() => setActiveFilter('in_progress')}
            >
              In Progress ({inProgressCount})
            </button>
          </div>
        </div>

        {/* Grid Content */}
        {loading ? (
          <div className="history-cards-grid">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <CardSkeleton key={n} />
            ))}
          </div>
        ) : error ? (
          <ErrorState
            title="Failed to Load History"
            message={error}
            onRetry={loadHistory}
            retryText="Retry Loading"
          />
        ) : filteredInterviews.length === 0 ? (
          <div className="history-empty-card glass-card">
            <div className="empty-icon-circle">
              <BsFilterLeft />
            </div>
            <h3 className="empty-title">
              {searchQuery ? 'No matching history records' : 'No mock interviews yet'}
            </h3>
            <p className="empty-desc">
              {searchQuery
                ? 'Try broadening your search query or switching filter tabs.'
                : 'Start your first AI mock interview session to build your evaluation records.'}
            </p>
            <button className="empty-start-btn" onClick={() => navigate('/setup')}>
              <BsPlayCircleFill className="btn-icon" />
              <span>Start Mock Interview</span>
            </button>
          </div>
        ) : (
          <>
            <div className="history-cards-grid">
              {filteredInterviews.map((interview) => (
                <InterviewCard
                  key={interview._id}
                  interview={interview}
                  onClick={() => handleCardClick(interview)}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="history-pagination-bar">
                <button
                  className="page-nav-btn"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  <BsChevronLeft />
                  <span>Previous</span>
                </button>

                <span className="page-indicator">
                  Page <strong>{page}</strong> of <strong>{totalPages}</strong>
                </span>

                <button
                  className="page-nav-btn"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  <span>Next</span>
                  <BsChevronRight />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default HistoryPage;
