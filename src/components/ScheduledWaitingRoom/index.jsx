import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BsLockFill,
  BsClockFill,
  BsMicFill,
  BsCameraVideoFill,
  BsCheckCircleFill,
  BsArrowLeftShort,
  BsArrowRepeat,
  BsCalendarCheckFill,
  BsShieldCheck,
} from 'react-icons/bs';
import './index.css';

function ScheduledWaitingRoom({ lockedSession, onUnlock }) {
  const navigate = useNavigate();

  const calculateSecondsLeft = () => {
    if (!lockedSession?.unlockTime) return 0;
    const unlockMs = new Date(lockedSession.unlockTime).getTime();
    const nowMs = Date.now();
    return Math.max(0, Math.floor((unlockMs - nowMs) / 1000));
  };

  const [secondsLeft, setSecondsLeft] = useState(calculateSecondsLeft);
  const [checking, setChecking] = useState(false);
  const [micTested, setMicTested] = useState(false);
  const [camTested, setCamTested] = useState(false);
  const [testVideoActive, setTestVideoActive] = useState(false);

  // Live countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = calculateSecondsLeft();
      setSecondsLeft(remaining);

      if (remaining <= 0) {
        clearInterval(timer);
        if (onUnlock) {
          onUnlock();
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [lockedSession?.unlockTime, onUnlock]);

  const handleManualCheck = async () => {
    setChecking(true);
    try {
      if (onUnlock) await onUnlock();
    } finally {
      setChecking(false);
    }
  };

  // Format countdown into days, hours, minutes, seconds
  const formatCountdown = (totalSecs) => {
    const days = Math.floor(totalSecs / (24 * 3600));
    const hours = Math.floor((totalSecs % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;

    return {
      days,
      hours: String(hours).padStart(2, '0'),
      minutes: String(minutes).padStart(2, '0'),
      seconds: String(seconds).padStart(2, '0'),
    };
  };

  const countdown = formatCountdown(secondsLeft);

  const formattedScheduledTime = lockedSession?.scheduledAt
    ? new Date(lockedSession.scheduledAt).toLocaleString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })
    : '';

  const formattedUnlockTime = lockedSession?.unlockTime
    ? new Date(lockedSession.unlockTime).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      })
    : '';

  const testMicStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setMicTested(true);
      setTimeout(() => {
        stream.getTracks().forEach((track) => track.stop());
      }, 2000);
    } catch {
      setMicTested(false);
    }
  };

  const toggleTestCam = async () => {
    if (testVideoActive) {
      setTestVideoActive(false);
      setCamTested(true);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setTestVideoActive(true);
        setCamTested(true);
        setTimeout(() => {
          stream.getTracks().forEach((track) => track.stop());
          setTestVideoActive(false);
        }, 3000);
      } catch {
        setCamTested(false);
      }
    }
  };

  return (
    <div className="waiting-room-overlay">
      <div className="waiting-room-card glass-card animate-fade-in">
        {/* Top Header Badge */}
        <div className="waiting-header">
          <div className="lock-icon-glow">
            <BsLockFill className="lock-icon" />
          </div>
          <div className="waiting-title-box">
            <span className="waiting-pretitle">SCHEDULED INTERVIEW WAITING ROOM</span>
            <h1 className="waiting-title">{lockedSession?.role || 'Technical Interview'}</h1>
            <span className="session-type-pill">
              {lockedSession?.interviewType || 'Technical & Behavioral Evaluation'}
            </span>
          </div>
        </div>

        {/* Live Countdown Display */}
        <div className="countdown-container glass-card">
          <span className="countdown-label">
            <BsClockFill className="countdown-icon" /> Room Unlocks 5 Minutes Prior to Start Time
          </span>

          <div className="countdown-grid">
            {countdown.days > 0 && (
              <div className="countdown-segment">
                <span className="countdown-num">{countdown.days}</span>
                <span className="countdown-unit">DAYS</span>
              </div>
            )}
            <div className="countdown-segment">
              <span className="countdown-num">{countdown.hours}</span>
              <span className="countdown-unit">HOURS</span>
            </div>
            <span className="countdown-colon">:</span>
            <div className="countdown-segment">
              <span className="countdown-num">{countdown.minutes}</span>
              <span className="countdown-unit">MINUTES</span>
            </div>
            <span className="countdown-colon">:</span>
            <div className="countdown-segment">
              <span className="countdown-num highlight">{countdown.seconds}</span>
              <span className="countdown-unit">SECONDS</span>
            </div>
          </div>

          <p className="countdown-subtext">
            Scheduled for <strong>{formattedScheduledTime}</strong> ({lockedSession?.timezone || 'Local Time'}).<br />
            The room will automatically activate at <strong>{formattedUnlockTime}</strong>.
          </p>
        </div>

        {/* Pre-Flight Readiness Station */}
        <div className="preflight-box glass-card">
          <h3 className="preflight-title">
            <BsShieldCheck className="check-icon-title" /> Candidate Pre-Flight Station
          </h3>
          <p className="preflight-subtitle">
            Prepare your setup now so you are ready when the session opens.
          </p>

          <div className="preflight-items">
            <div className="preflight-item">
              <div className="item-icon-circle">
                <BsMicFill />
              </div>
              <div className="item-info">
                <span className="item-label">Microphone Audio</span>
                <span className="item-desc">{micTested ? 'Ready & Verified' : 'Check browser permission'}</span>
              </div>
              <button
                type="button"
                className={`preflight-btn ${micTested ? 'verified' : ''}`}
                onClick={testMicStream}
              >
                {micTested ? <BsCheckCircleFill /> : 'Test Mic'}
              </button>
            </div>

            <div className="preflight-item">
              <div className="item-icon-circle">
                <BsCameraVideoFill />
              </div>
              <div className="item-info">
                <span className="item-label">Video Telepresence</span>
                <span className="item-desc">{camTested ? 'Camera Connected' : 'Optional local preview'}</span>
              </div>
              <button
                type="button"
                className={`preflight-btn ${camTested ? 'verified' : ''}`}
                onClick={toggleTestCam}
              >
                {camTested ? <BsCheckCircleFill /> : testVideoActive ? 'Testing...' : 'Test Cam'}
              </button>
            </div>

            <div className="preflight-item">
              <div className="item-icon-circle">
                <BsCalendarCheckFill />
              </div>
              <div className="item-info">
                <span className="item-label">Session Duration</span>
                <span className="item-desc">{lockedSession?.duration || 30} minutes • {lockedSession?.totalQuestions || 5} questions</span>
              </div>
              <span className="verified-pill">Synced</span>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="waiting-footer">
          <button
            type="button"
            className="waiting-btn back-btn"
            onClick={() => navigate('/dashboard')}
          >
            <BsArrowLeftShort className="btn-arrow" />
            <span>Back to Dashboard</span>
          </button>

          <button
            type="button"
            className="waiting-btn check-btn"
            onClick={handleManualCheck}
            disabled={checking}
          >
            <BsArrowRepeat className={`btn-icon ${checking ? 'is-spinning' : ''}`} />
            <span>{checking ? 'Verifying Lock...' : 'Check Room Status'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default ScheduledWaitingRoom;
