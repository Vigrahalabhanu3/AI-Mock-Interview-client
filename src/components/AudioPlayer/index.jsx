import { useState, useEffect, useRef, useCallback } from 'react';
import {
  BsVolumeUpFill,
  BsVolumeMuteFill,
  BsArrowCounterclockwise,
  BsSoundwave,
  BsPlayFill,
} from 'react-icons/bs';
import './index.css';

/**
 * AudioPlayer
 * High-clarity SINGLE-VOICE speech player:
 * - Guarantees only ONE voice speaks at any time (never overlapping or dual voices).
 * - If neural base64 audio is provided, it exclusively plays that audio.
 * - If base64 is unavailable, it gracefully uses SpeechSynthesis.
 * - Completely eliminates double-voice / echoing issues.
 */
function AudioPlayer({
  audioBase64,
  text = '',
  autoPlay = true,
  onPlay,
  onEnded,
}) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1.0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [isMuted, setIsMuted] = useState(false);
  const [activeEngine, setActiveEngine] = useState('none'); // 'neural' | 'tts'
  const [needsGesture, setNeedsGesture] = useState(false);

  const audioRef = useRef(null);
  const objectUrlRef = useRef(null);
  const lastPlayedKeyRef = useRef(null);

  // Complete cleanup of all audio sources
  const stopAllAudio = useCallback(() => {
    // 1. Stop HTML Audio element
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.onplay = null;
        audioRef.current.onended = null;
        audioRef.current.onerror = null;
        audioRef.current.src = '';
      } catch (e) {
        // ignore cleanup error
      }
      audioRef.current = null;
    }

    // 2. Revoke object URL
    if (objectUrlRef.current) {
      try {
        URL.revokeObjectURL(objectUrlRef.current);
      } catch (e) {
        // ignore
      }
      objectUrlRef.current = null;
    }

    // 3. Completely silence SpeechSynthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
      } catch (e) {
        // ignore
      }
    }

    setIsPlaying(false);
    setActiveEngine('none');
  }, []);

  // Web Speech API fallback ONLY when no neural audio exists
  const playSpeechSynthesisOnly = useCallback((speechText) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !speechText) {
      if (onEnded) onEnded();
      return;
    }

    stopAllAudio();

    try {
      const utterance = new SpeechSynthesisUtterance(speechText);
      utterance.rate = playbackRate;
      utterance.pitch = 1.0;
      utterance.volume = isMuted ? 0 : volume;

      const voices = window.speechSynthesis.getVoices();
      const naturalVoice = voices.find(
        (v) =>
          (v.lang.startsWith('en') && v.name.includes('Natural')) ||
          v.name.includes('Google US English') ||
          v.name.includes('Samantha')
      ) || voices.find((v) => v.lang.startsWith('en'));

      if (naturalVoice) {
        utterance.voice = naturalVoice;
      }

      utterance.onstart = () => {
        setIsPlaying(true);
        setActiveEngine('tts');
        if (onPlay) onPlay();
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setActiveEngine('none');
        if (onEnded) onEnded();
      };

      utterance.onerror = () => {
        setIsPlaying(false);
        setActiveEngine('none');
        if (onEnded) onEnded();
      };

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      setIsPlaying(false);
      setActiveEngine('none');
      if (onEnded) onEnded();
    }
  }, [playbackRate, isMuted, volume, onPlay, onEnded, stopAllAudio]);

  // Main playback trigger: Strictly ONE engine at a time
  const playSingleVoice = useCallback(() => {
    stopAllAudio();
    setNeedsGesture(false);

    // CASE 1: Neural Base64 Audio is present -> EXCLUSIVELY play this. Never use SpeechSynthesis.
    if (audioBase64 && audioBase64.length > 50) {
      try {
        const binaryString = atob(audioBase64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const audioBlob = new Blob([bytes], { type: 'audio/mp3' });
        const url = URL.createObjectURL(audioBlob);
        objectUrlRef.current = url;

        const audio = new Audio(url);
        audio.volume = isMuted ? 0 : volume;
        audio.playbackRate = playbackRate;

        audio.onplay = () => {
          setIsPlaying(true);
          setActiveEngine('neural');
          setNeedsGesture(false);
          if (onPlay) onPlay();
        };

        audio.onended = () => {
          setIsPlaying(false);
          setActiveEngine('none');
          if (onEnded) onEnded();
        };

        audio.onerror = (e) => {
          console.warn('[AudioPlayer] Neural audio decode error:', e);
          setIsPlaying(false);
          setActiveEngine('none');
          // If neural audio literally failed to decode, we only then fall back to TTS
          if (text) {
            playSpeechSynthesisOnly(text);
          } else if (onEnded) {
            onEnded();
          }
        };

        audioRef.current = audio;

        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((err) => {
            console.warn('[AudioPlayer] Autoplay blocked, waiting for user gesture:', err.message);
            // DO NOT switch to SpeechSynthesis! That causes double voice!
            // Just prompt user to click or unlock on first click.
            setNeedsGesture(true);
            setIsPlaying(false);

            // One-time listener to start the exact neural audio on first document interaction
            const unlockOnUserClick = () => {
              if (audioRef.current) {
                audioRef.current.play().catch(() => {});
              }
              setNeedsGesture(false);
              window.removeEventListener('click', unlockOnUserClick);
              window.removeEventListener('keydown', unlockOnUserClick);
            };

            window.addEventListener('click', unlockOnUserClick, { once: true });
            window.addEventListener('keydown', unlockOnUserClick, { once: true });
          });
        }
        return;
      } catch (err) {
        console.warn('[AudioPlayer] Neural audio failed to parse:', err.message);
      }
    }

    // CASE 2: No neural audio provided -> Only then use browser TTS
    if (text) {
      playSpeechSynthesisOnly(text);
    } else if (onEnded) {
      onEnded();
    }
  }, [audioBase64, text, isMuted, volume, playbackRate, onPlay, onEnded, stopAllAudio, playSpeechSynthesisOnly]);

  // Effect: Run once when audioBase64 or text changes
  useEffect(() => {
    // Generate a unique track signature
    const trackSignature = audioBase64
      ? `audio_${audioBase64.slice(0, 30)}_${audioBase64.slice(-20)}`
      : `text_${text}`;

    // Avoid duplicate execution for the same unchanged track
    if (lastPlayedKeyRef.current === trackSignature) {
      return;
    }
    lastPlayedKeyRef.current = trackSignature;

    if (autoPlay) {
      playSingleVoice();
    }

    return () => {
      stopAllAudio();
    };
  }, [audioBase64, text, autoPlay, playSingleVoice, stopAllAudio]);

  // Volume slider handler
  const handleVolumeChange = (newVol) => {
    setVolume(newVol);
    setIsMuted(newVol === 0);
    if (audioRef.current) {
      audioRef.current.volume = newVol;
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      handleVolumeChange(0.85);
    } else {
      setIsMuted(true);
      handleVolumeChange(0);
    }
  };

  const handleManualPlayOrReplay = () => {
    playSingleVoice();
  };

  return (
    <div className="audio-player-control-dock">
      <div className="audio-status-pill">
        <BsSoundwave className={`soundwave-indicator ${isPlaying ? 'is-animating' : ''}`} />
        <span className="audio-engine-label">
          {isPlaying
            ? activeEngine === 'neural'
              ? 'Voice: AI Evaluator'
              : 'Voice: Synthesized'
            : needsGesture
            ? 'Click to Play Voice'
            : 'Voice Ready'}
        </span>
      </div>

      <div className="audio-action-buttons">
        {needsGesture ? (
          <button
            type="button"
            className="audio-ctrl-btn replay-btn"
            onClick={handleManualPlayOrReplay}
            title="Click to Listen"
            style={{ background: 'rgba(16, 185, 129, 0.25)', borderColor: '#10b981', color: '#6ee7b7' }}
          >
            <BsPlayFill className="btn-icon" style={{ fontSize: '18px' }} />
            <span>Play Voice</span>
          </button>
        ) : (
          <button
            type="button"
            className="audio-ctrl-btn replay-btn"
            onClick={handleManualPlayOrReplay}
            title="Replay Voice (Single Voice)"
          >
            <BsArrowCounterclockwise className="btn-icon" />
            <span>Replay</span>
          </button>
        )}

        <button
          type="button"
          className="audio-ctrl-btn mute-btn"
          onClick={toggleMute}
          title={isMuted ? 'Unmute' : 'Mute'}
        >
          {isMuted ? <BsVolumeMuteFill /> : <BsVolumeUpFill />}
        </button>

        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={isMuted ? 0 : volume}
          onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
          className="audio-volume-slider"
          title={`Volume: ${Math.round((isMuted ? 0 : volume) * 100)}%`}
        />

        <select
          value={playbackRate}
          onChange={(e) => {
            const r = parseFloat(e.target.value);
            setPlaybackRate(r);
            if (audioRef.current) audioRef.current.playbackRate = r;
          }}
          className="audio-speed-select"
          title="Voice Speed"
        >
          <option value="0.9">0.9x</option>
          <option value="1.0">1.0x</option>
          <option value="1.15">1.15x</option>
        </select>
      </div>
    </div>
  );
}

export default AudioPlayer;