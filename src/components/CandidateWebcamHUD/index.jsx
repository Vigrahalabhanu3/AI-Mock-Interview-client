import { useState, useEffect, useRef } from 'react';
import {
  BsCameraVideoFill,
  BsCameraVideoOffFill,
  BsShieldCheck,
  BsMicFill,
  BsEyeFill,
} from 'react-icons/bs';
import './index.css';

export default function CandidateWebcamHUD({ isUserSpeaking = false }) {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraActive(true);
    } catch (err) {
      console.warn('Camera access unavailable:', err.message);
      setCameraError('Camera access declined or unavailable');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const toggleCamera = () => {
    if (cameraActive) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  return (
    <div className={`candidate-webcam-card ${cameraActive ? 'is-live' : 'is-standby'} ${isUserSpeaking ? 'speaking-active' : ''}`}>
      <div className="webcam-viewport">
        {cameraActive ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="candidate-video-feed"
          />
        ) : (
          <div className="webcam-placeholder">
            <div className="placeholder-avatar">
              <BsEyeFill className="eye-icon" />
            </div>
            <p className="placeholder-title">Video Telepresence</p>
            <p className="placeholder-sub">Practice eye-contact & posture</p>
          </div>
        )}

        {/* Live overlay badges */}
        <div className="webcam-top-badges">
          <div className="badge-pill privacy-pill">
            <BsShieldCheck className="shield-icon" />
            <span>Local Preview Only</span>
          </div>
          {cameraActive && (
            <div className="badge-pill live-pill">
              <span className="live-dot" />
              <span>LIVE FEED</span>
            </div>
          )}
        </div>

        {/* Mic speaking indicator on video */}
        {isUserSpeaking && (
          <div className="candidate-speaking-badge">
            <BsMicFill className="mic-pulse-icon" />
            <span>Speaking...</span>
          </div>
        )}
      </div>

      {/* Controller bar */}
      <div className="webcam-actions-bar">
        <button
          type="button"
          className={`webcam-toggle-btn ${cameraActive ? 'btn-active' : 'btn-off'}`}
          onClick={toggleCamera}
          title={cameraActive ? 'Turn Off Camera' : 'Turn On Practice Camera'}
        >
          {cameraActive ? (
            <>
              <BsCameraVideoFill className="cam-icon" />
              <span>Camera On</span>
            </>
          ) : (
            <>
              <BsCameraVideoOffFill className="cam-icon" />
              <span>Turn On Video</span>
            </>
          )}
        </button>
        {cameraError && <span className="webcam-error-hint">{cameraError}</span>}
      </div>
    </div>
  );
}
