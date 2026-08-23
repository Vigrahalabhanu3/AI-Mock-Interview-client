import { BsExclamationTriangleFill, BsArrowRepeat, BsStars, BsHourglassSplit, BsCameraVideoFill } from 'react-icons/bs';
import './index.css';

/**
 * Dots Pulse Page Loader for Route & Auth Initializing
 */
export function PageLoader({ message = 'Verifying Session...' }) {
  return (
    <div className="page-dots-loader-container" role="dialog" aria-busy="true" aria-label={message}>
      <div className="dots-loader-card">
        <div className="dots-brand-box">
          <BsCameraVideoFill className="dots-brand-icon" />
        </div>

        <div className="pulsing-dots-row">
          <span className="dot dot-1" />
          <span className="dot dot-2" />
          <span className="dot dot-3" />
        </div>

        <p className="dots-loader-message">{message}</p>
      </div>
    </div>
  );
}

/**
 * Base Shimmer Skeleton
 */
export function SkeletonLoader({ width = '100%', height = '20px', borderRadius = '8px', className = '' }) {
  return (
    <div
      className={`skeleton-shimmer ${className}`}
      style={{ width, height, borderRadius }}
      aria-hidden="true"
    />
  );
}

/**
 * Reusable Button Loader Wrapper
 */
export function ButtonLoader({
  loading,
  children,
  loadingText = 'Processing...',
  type = 'button',
  className = '',
  disabled = false,
  onClick,
  ...props
}) {
  return (
    <button
      type={type}
      className={`btn-with-loader ${className}`}
      disabled={loading || disabled}
      aria-busy={loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <span className="button-loader-content">
          <span className="spinner-border spinner-border-sm button-spinner" role="status" aria-hidden="true" />
          <span>{loadingText}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
}

/**
 * Interview Card Skeleton (Exact height/padding match for InterviewCard)
 */
export function CardSkeleton() {
  return (
    <div className="card-skeleton glass-card" aria-hidden="true">
      <div className="card-skeleton-top">
        <SkeletonLoader width="65%" height="22px" />
        <SkeletonLoader width="75px" height="24px" borderRadius="12px" />
      </div>
      <div className="card-skeleton-meta">
        <SkeletonLoader width="90px" height="16px" />
        <SkeletonLoader width="80px" height="16px" />
      </div>
      <div className="card-skeleton-score">
        <SkeletonLoader width="110px" height="36px" borderRadius="10px" />
      </div>
      <div className="card-skeleton-footer">
        <SkeletonLoader width="70px" height="28px" borderRadius="6px" />
      </div>
    </div>
  );
}

/**
 * Dashboard Skeleton (Hero + KPI Cards + Grid)
 */
export function DashboardSkeleton() {
  return (
    <div className="dashboard-skeleton-layout" aria-label="Loading dashboard" aria-busy="true">
      {/* Hero Skeleton */}
      <div className="dashboard-hero-skeleton glass-card">
        <SkeletonLoader width="180px" height="26px" borderRadius="20px" />
        <SkeletonLoader width="50%" height="38px" style={{ margin: '16px 0 12px 0' }} />
        <SkeletonLoader width="75%" height="20px" style={{ marginBottom: '24px' }} />
        <div className="skeleton-roles-row">
          <SkeletonLoader width="110px" height="32px" borderRadius="20px" />
          <SkeletonLoader width="120px" height="32px" borderRadius="20px" />
          <SkeletonLoader width="115px" height="32px" borderRadius="20px" />
        </div>
      </div>

      {/* KPI Grid Skeleton */}
      <div className="kpi-skeleton-grid">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="kpi-card-skeleton glass-card">
            <SkeletonLoader width="46px" height="46px" borderRadius="12px" />
            <SkeletonLoader width="80px" height="32px" />
            <SkeletonLoader width="130px" height="16px" />
          </div>
        ))}
      </div>

      {/* History Grid Skeleton */}
      <div className="history-skeleton-grid">
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <CardSkeleton key={n} />
        ))}
      </div>
    </div>
  );
}

/**
 * Interview Room Skeleton
 */
export function InterviewSkeleton() {
  return (
    <div className="interview-room-skeleton" aria-label="Loading interview room" aria-busy="true">
      <div className="interview-header-skeleton glass-card">
        <SkeletonLoader width="200px" height="24px" />
        <SkeletonLoader width="140px" height="32px" borderRadius="20px" />
      </div>

      <div className="interview-body-skeleton">
        <div className="interview-question-skeleton glass-card">
          <SkeletonLoader width="120px" height="20px" style={{ marginBottom: '16px' }} />
          <SkeletonLoader width="95%" height="24px" style={{ marginBottom: '10px' }} />
          <SkeletonLoader width="80%" height="24px" style={{ marginBottom: '10px' }} />
          <SkeletonLoader width="60%" height="24px" />
        </div>

        <div className="interview-editor-skeleton glass-card">
          <SkeletonLoader width="100%" height="320px" borderRadius="12px" />
        </div>
      </div>
    </div>
  );
}

/**
 * Feedback Evaluation Page Skeleton
 */
export function FeedbackSkeleton() {
  return (
    <div className="feedback-skeleton-layout" aria-label="Loading evaluation report" aria-busy="true">
      <div className="feedback-header-skeleton glass-card">
        <SkeletonLoader width="240px" height="32px" style={{ marginBottom: '12px' }} />
        <SkeletonLoader width="160px" height="20px" />
      </div>

      <div className="feedback-overall-skeleton glass-card">
        <SkeletonLoader width="120px" height="120px" borderRadius="50%" />
        <SkeletonLoader width="160px" height="24px" style={{ marginTop: '16px' }} />
      </div>

      <div className="feedback-categories-skeleton-grid">
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className="category-card-skeleton glass-card">
            <SkeletonLoader width="60%" height="20px" />
            <SkeletonLoader width="80px" height="32px" />
            <SkeletonLoader width="100%" height="40px" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Reusable Error State with Retry Trigger
 */
export function ErrorState({
  title = 'Failed to load content',
  message = 'A network error occurred while reaching the server.',
  onRetry,
  retryText = 'Try Again',
}) {
  return (
    <div className="error-state-card glass-card" role="alert" aria-live="assertive">
      <div className="error-icon-wrapper">
        <BsExclamationTriangleFill className="error-warning-icon" />
      </div>
      <h3 className="error-title">{title}</h3>
      <p className="error-message">{message}</p>
      {onRetry && (
        <button className="error-retry-btn" onClick={onRetry}>
          <BsArrowRepeat className="retry-btn-icon" />
          <span>{retryText}</span>
        </button>
      )}
    </div>
  );
}

/**
 * Contextual AI Loader Overlay for Long-Running LLM Requests
 */
export function ContextualAILoader({
  title = 'AI is Processing...',
  subtitle = 'Analyzing input data and communicating with Gemini AI model...',
  activeStep = 2,
  steps = ['Parsing Resume', 'Generating Questions', 'Initializing Voice Engine'],
  onRetry,
  error = null,
}) {
  return (
    <div className="contextual-ai-overlay glass-card" role="dialog" aria-busy="true" aria-label={title}>
      {error ? (
        <ErrorState title="Operation Failed" message={error} onRetry={onRetry} retryText="Retry Generation" />
      ) : (
        <>
          <div className="ai-loader-sparkle-box">
            <BsStars className="ai-sparkle-icon" />
          </div>

          <h3 className="ai-loader-title">{title}</h3>
          <p className="ai-loader-subtitle">{subtitle}</p>

          <div className="ai-loader-steps">
            {steps.map((stepText, idx) => {
              const stepNum = idx + 1;
              const isDone = stepNum < activeStep;
              const isActive = stepNum === activeStep;
              return (
                <div
                  key={stepText}
                  className={`ai-step-row ${isDone ? 'done' : ''} ${isActive ? 'active' : ''}`}
                >
                  {isDone ? (
                    <span className="step-badge-done">✓</span>
                  ) : isActive ? (
                    <BsHourglassSplit className="step-badge-spin" />
                  ) : (
                    <span className="step-badge-pending">{stepNum}</span>
                  )}
                  <span className="step-text">{stepText}</span>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
