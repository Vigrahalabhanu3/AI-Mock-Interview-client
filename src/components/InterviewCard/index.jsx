import { MdDelete } from 'react-icons/md';
import { BsCalendarEventFill, BsEnvelopeCheckFill, BsCheckCircleFill, BsClockFill, BsXCircleFill } from 'react-icons/bs';
import getScoreColor from '../../constants/scoreColors.js';
import './index.css';

function InterviewCard({ interview, onClick, onDelete, onCancel }) {
  const isScheduled = interview.status === 'scheduled';
  const isCompleted = interview.status === 'completed';
  const isCancelled = interview.status === 'cancelled';

  const displayDate = interview.scheduledAt
    ? new Date(interview.scheduledAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : new Date(interview.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });

  const scheduledTime = interview.scheduledAt ? new Date(interview.scheduledAt).getTime() : 0;
  const unlockTime = scheduledTime - 5 * 60 * 1000;
  const isLocked = isScheduled && Date.now() < unlockTime;

  const getStatusBadge = () => {
    if (isScheduled) {
      return isLocked
        ? { label: '🔒 Locked Until -5m', className: 'badge-scheduled' }
        : { label: '🟢 Room Open', className: 'badge-success' };
    }
    if (isCompleted) return { label: 'Completed', className: 'badge-success' };
    if (isCancelled) return { label: 'Cancelled', className: 'badge-cancelled' };
    return { label: 'In Progress', className: 'badge-warning' };
  };

  const statusInfo = getStatusBadge();

  return (
    <div className={`interview-card glass-card ${isScheduled ? 'card-scheduled' : ''}`} onClick={onClick}>
      <div className="interview-card-top">
        <h3 className="interview-card-role">{interview.role}</h3>
        <span className={`interview-badge ${statusInfo.className}`}>
          {statusInfo.label}
        </span>
      </div>

      <div className="interview-card-meta">
        <span className="interview-card-date">
          {isScheduled ? `📅 ${displayDate}` : displayDate}
        </span>
        <span className="interview-card-questions">
          {interview.totalQuestions || 5} questions
        </span>
      </div>

      {/* Email Delivery Indicator */}
      <div className="interview-email-indicator">
        {isScheduled && (
          <span className="email-status-pill">
            <BsEnvelopeCheckFill className="email-icon" /> Confirmation Emailed
          </span>
        )}
        {isCompleted && (
          <span className="email-status-pill success">
            <BsCheckCircleFill className="email-icon" /> Results Emailed
          </span>
        )}
      </div>

      {interview.overallScore !== null && interview.overallScore !== undefined && (
        <div className="interview-card-score">
          <span
            className="score-value"
            style={{ color: getScoreColor(interview.overallScore) }}
          >
            {interview.overallScore}
          </span>
          <span className="score-label">/100</span>
        </div>
      )}

      <div className="interview-card-footer">
        <span className="card-action-hint">
          {isCompleted
            ? 'View Full Feedback →'
            : isScheduled
            ? isLocked
              ? '🔒 View Countdown & Setup →'
              : '🟢 Join Live Room Now →'
            : 'Resume Session →'}
        </span>

        <button
          type="button"
          className="interview-card-delete"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(interview._id);
          }}
          title="Delete Interview Record"
        >
          <MdDelete className="delete-icon" />
          Delete
        </button>
      </div>
    </div>
  );
}

export default InterviewCard;
