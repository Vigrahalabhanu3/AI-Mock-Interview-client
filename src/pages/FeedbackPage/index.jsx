import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getInterview } from '../../services/interviewService.js';
import { FeedbackSkeleton, ErrorState } from '../../components/common/Loading';
import ScoreCard from '../../components/ScoreCard';
import getScoreColor from '../../constants/scoreColors.js';
import {
  BsCheckCircleFill,
  BsArrowUpRight,
  BsJournalText,
  BsArrowRepeat,
  BsTrophyFill,
  BsAwardFill,
  BsShareFill,
  BsClipboardCheck,
  BsLightningChargeFill,
  BsChatSquareQuoteFill,
  BsStars,
  BsCheck2Circle,
} from 'react-icons/bs';
import toast from 'react-hot-toast';
import './index.css';

function FeedbackPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const loadFeedback = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getInterview(id);

      if (!data.feedback) {
        setError('No evaluation feedback is available for this session.');
        return;
      }

      setInterview(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch interview evaluation feedback.');
      toast.error('Failed to load feedback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFeedback();
  }, [id]);

  if (loading) {
    return <FeedbackSkeleton />;
  }

  if (error) {
    return (
      <div className="feedback-page">
        <ErrorState
          title="Evaluation Report Unavailable"
          message={error}
          onRetry={loadFeedback}
          retryText="Retry Loading Report"
        />
      </div>
    );
  }

  if (!interview || !interview.feedback) return null;

  const { feedback, role, overallScore, messages, questions } = interview;
  const { categoryScores, strengths, areasOfImprovement, finalAssessment } = feedback;

  const getHireabilityVerdict = (score) => {
    if (score >= 88) return { verdict: 'Strong Hire • Principal Ready', color: '#10b981', badgeClass: 'verdict-strong' };
    if (score >= 78) return { verdict: 'Recommended Hire • Senior Level', color: '#06b6d4', badgeClass: 'verdict-senior' };
    if (score >= 68) return { verdict: 'Proficient • Mid-Level Confirmed', color: '#6366f1', badgeClass: 'verdict-mid' };
    return { verdict: 'Action Plan Recommended', color: '#f59e0b', badgeClass: 'verdict-dev' };
  };

  const verdictInfo = getHireabilityVerdict(overallScore || 75);

  const handleCopySummary = () => {
    const summaryText = `🚀 AI Mock Interview Report
Role: ${role}
Overall Score: ${overallScore}/100 (${verdictInfo.verdict})
Key Strengths: ${(strengths || []).slice(0, 2).join('; ')}
Focus Areas: ${(areasOfImprovement || []).slice(0, 2).join('; ')}
Evaluated with AI Mock Interview Pro`;

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    toast.success('Performance summary copied to clipboard!');
    setTimeout(() => setCopied(false), 3000);
  };

  // Group QA pairs from messages
  const dialoguePairs = [];
  if (messages && messages.length > 0) {
    for (let i = 0; i < messages.length; i++) {
      if (messages[i].role === 'interviewer') {
        const questionText = messages[i].content;
        const nextUserMsg = messages[i + 1]?.role === 'user' ? messages[i + 1].content : null;
        dialoguePairs.push({
          question: questionText,
          answer: nextUserMsg,
        });
      }
    }
  }

  return (
    <div className="feedback-debrief-page">
      <div className="feedback-debrief-container">
        {/* Executive Scorecard Header */}
        <header className="executive-scorecard-hero glass-card">
          <div className="scorecard-left-info">
            <div className="scorecard-tag-row">
              <span className={`verdict-pill ${verdictInfo.badgeClass}`}>
                <BsStars /> {verdictInfo.verdict}
              </span>
              <span className="session-date-tag">
                {new Date(interview.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>

            <h1 className="debrief-hero-title">Executive Debrief Report</h1>
            <p className="debrief-target-role">
              Position Evaluated: <strong>{role}</strong>
            </p>

            <div className="hero-share-actions">
              <button
                type="button"
                className="copy-summary-btn"
                onClick={handleCopySummary}
              >
                {copied ? <BsClipboardCheck /> : <BsShareFill />}
                <span>{copied ? 'Copied Summary' : 'Share / Copy Summary'}</span>
              </button>

              <button
                type="button"
                className="retake-interview-btn btn-primary"
                onClick={() => navigate('/setup')}
              >
                <BsArrowRepeat /> Retake New Session
              </button>
            </div>
          </div>

          {/* Radial Big Score Ring */}
          <div className="scorecard-right-dial">
            <div className="dial-wrapper">
              <svg viewBox="0 0 140 140" className="score-ring-svg">
                <circle cx="70" cy="70" r="58" className="score-track" />
                <circle
                  cx="70"
                  cy="70"
                  r="58"
                  className="score-progress"
                  stroke={getScoreColor(overallScore)}
                  strokeDasharray={364}
                  strokeDashoffset={364 - (364 * (overallScore || 0)) / 100}
                />
              </svg>
              <div className="score-center-text">
                <span className="score-number" style={{ color: getScoreColor(overallScore) }}>
                  {overallScore}
                </span>
                <span className="score-label">/ 100 Overall</span>
              </div>
            </div>
            <span className="percentile-label">Top 15% of Candidate Cohort</span>
          </div>
        </header>

        {/* Category Breakdown Cards */}
        <section className="feedback-section">
          <div className="section-title-row">
            <BsAwardFill className="section-icon" />
            <h2 className="feedback-section-heading">Core Competency Breakdown</h2>
          </div>

          <div className="feedback-scores-grid">
            {categoryScores && (
              <>
                <ScoreCard
                  label="Communication & STAR Delivery"
                  score={categoryScores.communicationSkills?.score || 0}
                  comment={categoryScores.communicationSkills?.comment}
                />
                <ScoreCard
                  label="Technical Depth & Accuracy"
                  score={categoryScores.technicalKnowledge?.score || 0}
                  comment={categoryScores.technicalKnowledge?.comment}
                />
                <ScoreCard
                  label="Algorithmic Problem Solving"
                  score={categoryScores.problemSolving?.score || 0}
                  comment={categoryScores.problemSolving?.comment}
                />
                <ScoreCard
                  label="Code Quality & Architecture"
                  score={categoryScores.codeQuality?.score || 0}
                  comment={categoryScores.codeQuality?.comment}
                />
                <ScoreCard
                  label="Confidence & Presence"
                  score={categoryScores.confidence?.score || 0}
                  comment={categoryScores.confidence?.comment}
                />
              </>
            )}
          </div>
        </section>

        {/* Coach Rewind: Strengths & Growth Areas */}
        <section className="insights-two-column-grid">
          {strengths && strengths.length > 0 && (
            <div className="insight-card glass-card card-strengths">
              <div className="insight-header">
                <BsCheckCircleFill className="insight-icon-success" />
                <h3 className="insight-title">Demonstrated Strengths</h3>
              </div>
              <ul className="insight-list">
                {strengths.map((item, index) => (
                  <li key={index} className="insight-list-item">
                    <BsCheck2Circle className="bullet-check" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {areasOfImprovement && areasOfImprovement.length > 0 && (
            <div className="insight-card glass-card card-improvements">
              <div className="insight-header">
                <BsArrowUpRight className="insight-icon-warning" />
                <h3 className="insight-title">Targeted Growth Areas</h3>
              </div>
              <ul className="insight-list">
                {areasOfImprovement.map((item, index) => (
                  <li key={index} className="insight-list-item warning-item">
                    <BsLightningChargeFill className="bullet-bolt" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        {/* Final Executive Assessment */}
        {finalAssessment && (
          <section className="assessment-card glass-card">
            <div className="assessment-header">
              <BsJournalText className="assessment-icon" />
              <h3 className="assessment-title">Principal AI Evaluator Assessment</h3>
            </div>
            <p className="assessment-text">{finalAssessment}</p>
          </section>
        )}

        {/* Coach Rewind: Question-by-Question Highlights */}
        {dialoguePairs.length > 0 && (
          <section className="coach-rewind-section">
            <div className="section-title-row">
              <BsChatSquareQuoteFill className="section-icon" />
              <h2 className="feedback-section-heading">Coach Rewind: Question & Answer Review</h2>
            </div>

            <div className="dialogue-rewind-list">
              {dialoguePairs.map((pair, idx) => (
                <div key={idx} className="rewind-item-card glass-card">
                  <div className="rewind-question-header">
                    <span className="rewind-index-pill">Question {idx + 1}</span>
                    <p className="rewind-question-text">{pair.question}</p>
                  </div>

                  {pair.answer ? (
                    <div className="rewind-candidate-answer">
                      <span className="candidate-answer-tag">Candidate Response:</span>
                      <p className="candidate-answer-body">"{pair.answer}"</p>
                    </div>
                  ) : (
                    <div className="rewind-candidate-answer skipped">
                      <span className="candidate-answer-tag">No verbal transcript recorded for this turn.</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Bottom Navigation */}
        <div className="feedback-actions-bar">
          <button
            type="button"
            className="btn-primary-lg"
            onClick={() => navigate('/setup')}
          >
            <BsArrowRepeat /> Retake Another Interview
          </button>
          <button
            type="button"
            className="btn-outline"
            onClick={() => navigate('/')}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

export default FeedbackPage;
