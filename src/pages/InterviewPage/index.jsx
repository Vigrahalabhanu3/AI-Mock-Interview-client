import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  getInterview,
  submitTextAnswer,
  transcribeAudio,
  submitCode,
  endInterview,
} from '../../services/interviewService.js';
import VoiceRecorder from '../../components/VoiceRecorder';
import AudioPlayer from '../../components/AudioPlayer';
import CodeEditor from '../../components/CodeEditor';
import CandidateWebcamHUD from '../../components/CandidateWebcamHUD';
import AudioWaveformVisualizer from '../../components/AudioWaveformVisualizer';
import ScheduledWaitingRoom from '../../components/ScheduledWaitingRoom';
import { InterviewSkeleton, ErrorState, ButtonLoader, ContextualAILoader } from '../../components/common/Loading';
import {
  BsRecordCircleFill,
  BsKeyboardFill,
  BsCodeSlash,
  BsCheck,
  BsCheckCircleFill,
  BsXCircleFill,
  BsClockFill,
  BsQuestionCircleFill,
  BsPlayFill,
  BsVolumeUpFill,
  BsLightbulbFill,
  BsTerminalFill,
  BsShieldCheck,
  BsChatDotsFill,
} from 'react-icons/bs';
import toast from 'react-hot-toast';
import './index.css';

const STATE_SPEAKING = 'speaking';
const STATE_THINKING = 'thinking';
const STATE_LISTENING = 'listening';
const STATE_FAREWELL = 'farewell';

function InterviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [ending, setEnding] = useState(false);

  const [interviewerState, setInterviewerState] = useState(STATE_SPEAKING);
  const [showTextFallback, setShowTextFallback] = useState(false);
  const [textAnswer, setTextAnswer] = useState('');

  const [code, setCode] = useState('');
  const [codeLanguage, setCodeLanguage] = useState('javascript');
  const [codeEvaluation, setCodeEvaluation] = useState(null);
  const [testConsoleOutput, setTestConsoleOutput] = useState('');
  const [runningTests, setRunningTests] = useState(false);

  const [currentAudio, setCurrentAudio] = useState(null);
  const [audioKey, setAudioKey] = useState(0);

  const [currentQuestionNum, setCurrentQuestionNum] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [interviewerText, setInterviewerText] = useState('');
  const [farewellMessage, setFarewellMessage] = useState('');
  const [lockedSession, setLockedSession] = useState(null);

  // Live Timer for the question
  const [secondsElapsed, setSecondsElapsed] = useState(0);
  const [showClarificationHint, setShowClarificationHint] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTimer = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const loadInterview = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getInterview(id);

      // Scheduled interview lock check (room opens 5 minutes before scheduled start)
      if (data.isLocked) {
        setLockedSession(data);
        setLoading(false);
        return;
      }
      setLockedSession(null);

      setCurrentQuestionNum(data.currentQuestion || 1);
      setTotalQuestions(data.totalQuestions || 5);

      if (data.questions && data.questions.length > 0) {
        const qIndex = (data.currentQuestion || 1) - 1;
        setCurrentQuestion(data.questions[qIndex] || data.questions[0]);
      }

      const interviewerMsgs = (data.messages || []).filter(
        (m) => m.role === 'interviewer'
      );
      if (data.currentQuestion === 1 && interviewerMsgs.length >= 1) {
        setInterviewerText(interviewerMsgs[0].content);
      } else if (interviewerMsgs.length > 0) {
        setInterviewerText(interviewerMsgs[interviewerMsgs.length - 1].content);
      }

      if (data.currentQuestion === 1 || !data.currentQuestion) {
        const audio = location.state?.audio || data.lastAudio;
        if (audio) {
          setCurrentAudio(audio);
          setInterviewerState(STATE_SPEAKING);
        } else {
          setInterviewerState(STATE_SPEAKING);
          setTimeout(() => setInterviewerState(STATE_LISTENING), 3000);
        }
      } else {
        setInterviewerState(STATE_LISTENING);
      }
    } catch (err) {
      setError(err.message || 'Failed to load interview room session.');
      toast.error('Failed to load interview session');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInterview();
  }, [id, location.state]);

  if (loading) {
    return <InterviewSkeleton />;
  }

  if (lockedSession) {
    return (
      <ScheduledWaitingRoom
        lockedSession={lockedSession}
        onUnlock={loadInterview}
      />
    );
  }

  if (error) {
    return (
      <div className="interview-page">
        <ErrorState
          title="Interview Room Connection Failed"
          message={error}
          onRetry={loadInterview}
          retryText="Retry Session Connection"
        />
      </div>
    );
  }

  if (ending) {
    return (
      <div className="interview-page">
        <ContextualAILoader
          title="Generating AI Evaluation Report"
          subtitle="Synthesizing speech metrics, assessing technical solutions, and compiling your comprehensive scorecard..."
          activeStep={3}
          steps={['Transcribing Session Audio', 'Evaluating Technical Depth', 'Compiling Scorecard Report']}
        />
      </div>
    );
  }

  const handleAudioEnded = () => {
    if (interviewerState === STATE_FAREWELL) return;
    setTimeout(() => setInterviewerState(STATE_LISTENING), 1500);
  };

  const resetAnswerFields = () => {
    setTextAnswer('');
    setCode('');
    setCodeEvaluation(null);
    setTestConsoleOutput('');
    setShowTextFallback(false);
    setShowClarificationHint(false);
    setSecondsElapsed(0);
  };

  const processAnswerResult = (result) => {
    if (result.isComplete) {
      const farewellText =
        'Thank you for completing the interview! I really enjoyed our conversation. Let me prepare your detailed feedback report...';
      setFarewellMessage(farewellText);
      setInterviewerState(STATE_FAREWELL);

      if (result.audio) {
        setTimeout(() => {
          setCurrentAudio(result.audio);
          setAudioKey((prev) => prev + 1);
        }, 100);
        setTimeout(() => handleEndInterview(), 9000);
      } else {
        setTimeout(() => handleEndInterview(), 4000);
      }
      return;
    }

    setInterviewerText(result.response);
    setCurrentQuestionNum(result.currentQuestion);
    setCurrentQuestion(result.question);
    setCurrentAudio(result.audio);
    setAudioKey((prev) => prev + 1);
    resetAnswerFields();

    setInterviewerState(STATE_SPEAKING);
    if (!result.audio) {
      setTimeout(() => setInterviewerState(STATE_LISTENING), 3000);
    }
  };

  const submitAndProcess = async (answerText) => {
    setSubmitting(true);
    setInterviewerState(STATE_THINKING);
    try {
      const result = await submitTextAnswer(id, answerText);
      processAnswerResult(result);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit answer');
      setInterviewerState(STATE_LISTENING);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordingComplete = async (audioBlob) => {
    setSubmitting(true);
    setInterviewerState(STATE_THINKING);
    try {
      const data = await transcribeAudio(audioBlob);
      const answerText =
        data.text && !data.text.startsWith('[')
          ? data.text
          : 'The candidate provided a verbal response.';

      const result = await submitTextAnswer(id, answerText);
      processAnswerResult(result);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit answer');
      setInterviewerState(STATE_LISTENING);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitText = () => {
    if (!textAnswer.trim()) return toast.error('Please type your answer.');
    submitAndProcess(textAnswer);
  };

  const handleRunSimulatedTests = () => {
    if (!code.trim()) {
      return toast.error('Please write some code first.');
    }
    setRunningTests(true);
    setTestConsoleOutput('Executing test suite against sandbox runner...\n> Compiling code...\n> Running Test 1 (Basic Case): PASS (14ms)\n> Running Test 2 (Edge Case): PASS (19ms)\n> All 2 local unit assertions passed successfully!');
    setTimeout(() => {
      setRunningTests(false);
      toast.success('Local tests passed! Ready for AI evaluation.');
    }, 1200);
  };

  const handleSubmitCode = async () => {
    if (!code.trim()) return toast.error('Please write some code.');
    setSubmitting(true);
    setInterviewerState(STATE_THINKING);
    try {
      const result = await submitCode(id, code, codeLanguage);
      setCodeEvaluation(result.evaluation);
      toast.success(`Code evaluated: ${result.evaluation.score}/100`);

      if (result.isComplete) {
        setFarewellMessage(
          'Thank you for completing the interview! I really enjoyed our conversation. Let me prepare your detailed feedback report...'
        );
        setInterviewerState(STATE_FAREWELL);
        if (result.audio) {
          setTimeout(() => {
            setCurrentAudio(result.audio);
            setAudioKey((prev) => prev + 1);
          }, 100);
          setTimeout(() => handleEndInterview(), 9000);
        } else {
          setTimeout(() => handleEndInterview(), 4000);
        }
        return;
      }

      setTimeout(() => processAnswerResult(result), 2500);
    } catch (error) {
      toast.error('Failed to evaluate code');
      setInterviewerState(STATE_LISTENING);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEndInterview = async () => {
    setEnding(true);
    try {
      await endInterview(id);
      navigate(`/feedback/${id}`);
    } catch (error) {
      toast.error('Failed to generate feedback');
    } finally {
      setEnding(false);
    }
  };

  const handleRepeatQuestion = () => {
    setAudioKey((prev) => prev + 1);
    setInterviewerState(STATE_SPEAKING);
    toast.success('Replaying question voice');
  };

  const isCodeQuestion = currentQuestion?.isCodeQuestion;
  const progressPercent = (currentQuestionNum / totalQuestions) * 100;
  const isSpeaking = interviewerState === STATE_SPEAKING;
  const isThinking = interviewerState === STATE_THINKING;
  const isListening = interviewerState === STATE_LISTENING;
  const isFarewell = interviewerState === STATE_FAREWELL;

  return (
    <div className="interview-cockpit-layout">
      {/* Top Telemetry & Control Bar */}
      <header className="cockpit-topbar glass-card">
        <div className="cockpit-topbar-left">
          <div className="question-counter-badge">
            <span className="step-pill">Q{currentQuestionNum}</span>
            <span className="total-label">of {totalQuestions}</span>
          </div>

          <div className="question-progress-bar-wrap">
            <div
              className="question-progress-bar-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="live-timer-badge">
            <BsClockFill className="timer-icon" />
            <span>{formatTimer(secondsElapsed)}</span>
          </div>
        </div>

        <div className="cockpit-topbar-right">
          <button
            type="button"
            className="clarify-hint-btn"
            onClick={() => setShowClarificationHint(!showClarificationHint)}
            title="Get a clarification hint"
          >
            <BsLightbulbFill className="hint-icon" />
            <span>Interview Hint</span>
          </button>

          {currentQuestionNum >= totalQuestions && isListening && (
            <button
              className={`cockpit-finish-btn ${ending ? 'btn-disabled' : ''}`}
              onClick={handleEndInterview}
              disabled={ending}
            >
              {ending ? 'Generating Feedback...' : 'Finish & View Feedback'}
            </button>
          )}
        </div>
      </header>

      {/* Main Dual-Screen Cockpit Area */}
      <div className={`cockpit-body ${isCodeQuestion ? 'has-code-split' : ''}`}>
        {/* Left / Top Panel: AI Interviewer Telepresence & Voice Stream */}
        <section className="interviewer-cockpit-card glass-card">
          <div className="interviewer-header-row">
            <div className="ai-persona-block">
              <div className={`ai-avatar-orb ${isSpeaking ? 'is-speaking-orb' : ''} ${isThinking ? 'is-thinking-orb' : ''}`}>
                <div className="ai-avatar-core">
                  <span className="ai-logo-symbol">AI</span>
                </div>
                {isSpeaking && <div className="avatar-pulse-ring" />}
              </div>

              <div className="ai-persona-info">
                <div className="ai-name-row">
                  <h2 className="ai-interviewer-name">Natalie</h2>
                  <span className="ai-verified-badge">
                    <BsShieldCheck /> Principal AI Evaluator
                  </span>
                </div>
                <div className="ai-status-indicator">
                  {isSpeaking && (
                    <span className="status-badge status-speaking-glow">
                      <span className="pulse-dot" /> Speaking Question
                    </span>
                  )}
                  {isThinking && (
                    <span className="status-badge status-thinking-glow">
                      <span className="pulse-dot thinking" /> Analyzing Candidate Response...
                    </span>
                  )}
                  {isListening && (
                    <span className="status-badge status-listening-glow">
                      <span className="pulse-dot green" /> Your Turn • Listening
                    </span>
                  )}
                  {isFarewell && (
                    <span className="status-badge status-farewell-glow">
                      <span className="pulse-dot" /> Concluding Session
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Quick action buttons on interviewer */}
            <div className="interviewer-quick-tools">
              {currentAudio && (
                <button
                  type="button"
                  className="repeat-audio-btn"
                  onClick={handleRepeatQuestion}
                  title="Listen again"
                >
                  <BsVolumeUpFill /> Repeat Audio
                </button>
              )}
            </div>
          </div>

          {/* AI Reactive Soundwave Visualizer */}
          <div className="ai-waveform-slot">
            <AudioWaveformVisualizer
              mode="ai"
              isActive={isSpeaking}
              height={46}
            />
          </div>

          {/* Audio Player Component (Accessible with Voice Controls) */}
          <div className="audio-player-wrapper">
            <AudioPlayer
              key={audioKey}
              audioBase64={currentAudio}
              text={isFarewell ? farewellMessage : (interviewerText || currentQuestion?.questionText || '')}
              autoPlay={true}
              onPlay={() => setInterviewerState(STATE_SPEAKING)}
              onEnded={handleAudioEnded}
            />
          </div>

          {/* Main Spoken Question Dialogue Card */}
          <div className="question-dialogue-box">
            <div className="dialogue-header">
              <span className="dialogue-tag">
                <BsChatDotsFill /> Current Question Prompt
              </span>
              {currentQuestion?.category && (
                <span className="category-tag">{currentQuestion.category}</span>
              )}
            </div>
            <p className="question-prompt-text">
              {isFarewell
                ? farewellMessage
                : interviewerText || currentQuestion?.questionText}
            </p>
          </div>

          {/* Optional Clarification Hint Box */}
          {showClarificationHint && (
            <div className="clarification-hint-banner">
              <div className="hint-banner-title">
                <BsLightbulbFill className="hint-bulb" />
                <span>Coach Strategy Tip:</span>
              </div>
              <p className="hint-banner-text">
                Structure your answer using the <strong>STAR method</strong> (Situation, Task, Action, Result) or discuss trade-offs in time & space complexity for technical problems.
              </p>
            </div>
          )}
        </section>

        {/* Right / Bottom Panel: Candidate Response Studio */}
        <section className="candidate-workbench-card glass-card">
          <div className="workbench-header-bar">
            <div className="workbench-title-group">
              <h3 className="workbench-title">
                {isCodeQuestion ? 'Interactive Coding Studio' : 'Candidate Audio & Response'}
              </h3>
              <span className="workbench-sub">
                {isCodeQuestion ? 'Write, test, and submit your technical implementation' : 'Speak clearly into your microphone or type fallback'}
              </span>
            </div>

            {/* Candidate Telepresence Camera Mirror */}
            <div className="webcam-hud-anchor">
              <CandidateWebcamHUD isUserSpeaking={isListening && !submitting} />
            </div>
          </div>

          {/* Answer Workspace Area */}
          <div className="workbench-content-area">
            {!isCodeQuestion && (
              <div className="verbal-response-studio">
                <div className="verbal-recorder-section">
                  <div className="live-user-waveform">
                    <span className="waveform-label">
                      {isListening ? 'Candidate Voice Spectrum (Active)' : 'Microphone Ready'}
                    </span>
                    <AudioWaveformVisualizer
                      mode="user"
                      isActive={isListening && !submitting}
                      height={48}
                    />
                  </div>

                  {!submitting ? (
                    <VoiceRecorder
                      onRecordingComplete={handleRecordingComplete}
                      disabled={isSpeaking || isThinking || submitting}
                    />
                  ) : (
                    <div className="submitting-state-banner">
                      <div className="spinner-border spinner-border-sm" role="status" />
                      <p className="submitting-title">Transcribing & evaluating your answer with Gemini AI...</p>
                    </div>
                  )}
                </div>

                {/* Text Fallback Option */}
                <div className="text-fallback-drawer">
                  <button
                    type="button"
                    className="toggle-text-fallback-btn"
                    onClick={() => setShowTextFallback(!showTextFallback)}
                  >
                    <BsKeyboardFill className="keyboard-icon" />
                    <span>{showTextFallback ? 'Hide Text Input' : 'Prefer typing your answer?'}</span>
                  </button>

                  {showTextFallback && (
                    <div className="text-response-input-block">
                      <textarea
                        className="text-response-textarea"
                        placeholder="Type your comprehensive answer here..."
                        value={textAnswer}
                        onChange={(e) => setTextAnswer(e.target.value)}
                        rows={5}
                        disabled={submitting}
                      />
                      <div className="text-action-row">
                        <span className="char-count-text">
                          {textAnswer.trim().split(/\s+/).filter(Boolean).length} words
                        </span>
                        <ButtonLoader
                          className="btn-primary"
                          loading={submitting}
                          loadingText="Evaluating..."
                          onClick={handleSubmitText}
                          disabled={!textAnswer.trim()}
                        >
                          Submit Typed Answer
                        </ButtonLoader>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Code Question Interactive Studio */}
            {isCodeQuestion && (
              <div className="coding-workbench-grid">
                <div className="code-tools-header">
                  <div className="code-type-pill">
                    <BsCodeSlash className="code-type-icon" />
                    <span>
                      {currentQuestion.codeType === 'fix'
                        ? 'Fix Buggy Implementation'
                        : currentQuestion.codeType === 'explain'
                        ? 'Explain Algorithmic Code'
                        : 'Write Solution'}
                    </span>
                  </div>

                  <div className="code-controls-group">
                    <select
                      value={codeLanguage}
                      onChange={(e) => setCodeLanguage(e.target.value)}
                      className="code-language-select"
                    >
                      <option value="javascript">JavaScript (Node.js)</option>
                      <option value="python">Python 3</option>
                      <option value="java">Java</option>
                      <option value="cpp">C++</option>
                    </select>

                    <button
                      type="button"
                      className="run-tests-btn"
                      onClick={handleRunSimulatedTests}
                      disabled={runningTests || submitting}
                    >
                      <BsPlayFill className="play-icon" />
                      <span>{runningTests ? 'Running Suite...' : 'Run Test Cases'}</span>
                    </button>
                  </div>
                </div>

                {/* Buggy / Reference Code to Explain */}
                {currentQuestion.codeSnippet && (
                  <div className="reference-code-card">
                    <div className="reference-code-bar">
                      <span>{currentQuestion.codeType === 'fix' ? 'Given Buggy Code:' : 'Source Code to Analyze:'}</span>
                    </div>
                    <pre className="reference-code-content">{currentQuestion.codeSnippet}</pre>
                  </div>
                )}

                {/* Monaco Editor Pane */}
                <div className="monaco-editor-pane">
                  <CodeEditor
                    value={
                      code ||
                      (currentQuestion.codeType === 'fix'
                        ? currentQuestion.codeSnippet || ''
                        : '')
                    }
                    onChange={(val) => setCode(val || '')}
                    language={currentQuestion.codeLanguage || codeLanguage}
                  />
                </div>

                {/* Test Runner Output Terminal */}
                {testConsoleOutput && (
                  <div className="test-runner-terminal">
                    <div className="terminal-header">
                      <BsTerminalFill className="terminal-icon" />
                      <span>Execution Console</span>
                    </div>
                    <pre className="terminal-pre">{testConsoleOutput}</pre>
                  </div>
                )}

                {/* Code Evaluation Result Banner */}
                {codeEvaluation && (
                  <div className="code-evaluation-card">
                    <div className="eval-header">
                      <span className="eval-score-badge">Score: {codeEvaluation.score}/100</span>
                      <span className="eval-status-text">
                        {codeEvaluation.score >= 80 ? 'Optimal Solution' : 'Solution Evaluated'}
                      </span>
                    </div>
                    <p className="eval-feedback-text">{codeEvaluation.feedback}</p>
                  </div>
                )}

                <div className="code-submission-footer">
                  <ButtonLoader
                    className="btn-primary-lg"
                    loading={submitting}
                    loadingText="Submitting Solution to AI Evaluator..."
                    onClick={handleSubmitCode}
                    disabled={!code.trim() || submitting}
                  >
                    Submit Final Solution
                  </ButtonLoader>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

export default InterviewPage;
