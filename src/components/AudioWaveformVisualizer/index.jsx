import { useEffect, useRef } from 'react';
import './index.css';

/**
 * AudioWaveformVisualizer
 * Mode:
 *  - 'ai': Renders smooth, pulsing cyber cyan/indigo sine waves synchronized with AI speech
 *  - 'user': Renders real-time dynamic frequency bars for the candidate's mic, or ambient idle waves
 *  - 'idle': Gentle, breathing frequency wave
 */
export default function AudioWaveformVisualizer({
  mode = 'idle', // 'ai' | 'user' | 'idle'
  isActive = false,
  stream = null, // MediaStream for real-time user audio
  height = 56,
}) {
  const canvasRef = useRef(null);
  const animFrameIdRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const sourceRef = useRef(null);

  // Set up Web Audio API when user stream is provided
  useEffect(() => {
    if (mode === 'user' && stream && isActive) {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (!AudioContext) return;

        const audioCtx = new AudioContext();
        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.8;

        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        audioContextRef.current = audioCtx;
        analyserRef.current = analyser;
        dataArrayRef.current = dataArray;
        sourceRef.current = source;
      } catch (err) {
        console.warn('AudioContext visualization initialization note:', err.message);
      }
    }

    return () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => {});
      }
      audioContextRef.current = null;
      analyserRef.current = null;
      dataArrayRef.current = null;
      sourceRef.current = null;
    };
  }, [mode, stream, isActive]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let phase = 0;

    const render = () => {
      const width = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, width, h);

      if (mode === 'ai' && isActive) {
        // AI Speaking Wave: Smooth, layered harmonic sine curves
        phase += 0.08;
        const waves = [
          { color: 'rgba(6, 182, 212, 0.7)', amp: h * 0.35, freq: 0.02, speed: phase },
          { color: 'rgba(99, 102, 241, 0.6)', amp: h * 0.25, freq: 0.03, speed: phase * 1.3 },
          { color: 'rgba(168, 85, 247, 0.5)', amp: h * 0.18, freq: 0.04, speed: phase * 0.8 },
        ];

        waves.forEach((w) => {
          ctx.beginPath();
          ctx.lineWidth = 2.5;
          ctx.strokeStyle = w.color;
          for (let x = 0; x < width; x++) {
            const y =
              h / 2 +
              Math.sin(x * w.freq + w.speed) *
                w.amp *
                Math.sin((x / width) * Math.PI);
            if (x === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        });
      } else if (mode === 'user' && isActive) {
        // Candidate Speaking: Real-time frequency bars
        let values = [];
        if (analyserRef.current && dataArrayRef.current) {
          analyserRef.current.getByteFrequencyData(dataArrayRef.current);
          values = Array.from(dataArrayRef.current);
        } else {
          // Synthetic audio bounce if mic is recording without stream analyser
          phase += 0.12;
          const barCount = 28;
          for (let i = 0; i < barCount; i++) {
            const val = Math.abs(Math.sin(phase + i * 0.4)) * 180 + 40;
            values.push(val);
          }
        }

        const barCount = Math.min(values.length, 32);
        const barWidth = (width / barCount) * 0.65;
        const gap = (width / barCount) * 0.35;

        for (let i = 0; i < barCount; i++) {
          const rawVal = values[i] || 0;
          const normalized = rawVal / 255;
          const barHeight = Math.max(4, normalized * (h * 0.85));
          const x = i * (barWidth + gap) + gap / 2;
          const y = (h - barHeight) / 2;

          const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
          grad.addColorStop(0, '#06b6d4');
          grad.addColorStop(0.5, '#3b82f6');
          grad.addColorStop(1, '#10b981');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, 3);
          ctx.fill();
        }
      } else {
        // Idle / Ambient Breathing Line
        phase += 0.03;
        ctx.beginPath();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
        for (let x = 0; x < width; x++) {
          const y =
            h / 2 +
            Math.sin(x * 0.015 + phase) * (h * 0.08) * Math.sin((x / width) * Math.PI);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      animFrameIdRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameIdRef.current) {
        cancelAnimationFrame(animFrameIdRef.current);
      }
    };
  }, [mode, isActive]);

  return (
    <div className={`audio-waveform-container waveform-${mode} ${isActive ? 'is-active' : ''}`}>
      <canvas
        ref={canvasRef}
        className="audio-waveform-canvas"
        width={360}
        height={height}
      />
    </div>
  );
}
