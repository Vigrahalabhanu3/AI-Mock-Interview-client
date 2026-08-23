import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  uploadResume,
  getResume,
  startInterview,
} from '../../services/interviewService.js';
import { ButtonLoader, ContextualAILoader, ErrorState } from '../../components/common/Loading';
import INTERVIEW_ROLES from '../../constants/roles.js';
import DIFFICULTY_LEVELS from '../../constants/difficulty.js';
import {
  BsDisplay,
  BsServer,
  BsLightningFill,
  BsGraphUp,
  BsCloudFill,
  BsStarFill,
  BsStar,
  BsFileEarmarkArrowUp,
  BsCheckCircleFill,
  BsArrowRightShort,
  BsArrowLeftShort,
  BsStars,
  BsFileCheck,
  BsHourglassSplit,
} from 'react-icons/bs';
import { FaPython, FaReact, FaJava } from 'react-icons/fa';
import toast from 'react-hot-toast';
import './index.css';

const ROLE_ICONS = {
  'frontend-developer': BsDisplay,
  'backend-developer': BsServer,
  'full-stack-developer': BsLightningFill,
  'data-analyst': BsGraphUp,
  'devops-engineer': BsCloudFill,
  'python-developer': FaPython,
  'react-developer': FaReact,
  'java-developer': FaJava,
};

const DIFFICULTY_ICONS = {
  easy: (
    <div className="setup-difficulty-stars">
      <BsStarFill className="star-filled" />
      <BsStar className="star-empty" />
      <BsStar className="star-empty" />
    </div>
  ),
  medium: (
    <div className="setup-difficulty-stars">
      <BsStarFill className="star-filled" />
      <BsStarFill className="star-filled" />
      <BsStar className="star-empty" />
    </div>
  ),
  hard: (
    <div className="setup-difficulty-stars">
      <BsStarFill className="star-filled" />
      <BsStarFill className="star-filled" />
      <BsStarFill className="star-filled" />
    </div>
  ),
};

const DURATION_ESTIMATES = {
  easy: '~10 min warmup',
  medium: '~20 min standard',
  hard: '~35 min deep-dive',
};

function InterviewSetupPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const [step, setStep] = useState(1);
  const [selectedRole, setSelectedRole] = useState(location.state?.presetRole || '');
  const [selectedDifficulty, setSelectedDifficulty] = useState('medium');
  const [resumeText, setResumeText] = useState('');
  const [resumeFileName, setResumeFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [initError, setInitError] = useState(null);

  useEffect(() => {
    // If presetRole was passed from HomePage, auto-advance step or ensure it's selected
    if (location.state?.presetRole) {
      setSelectedRole(location.state.presetRole);
    }
  }, [location.state]);

  useEffect(() => {
    const loadResume = async () => {
      try {
        const data = await getResume();
        if (data) {
          setResumeText(data.text);
          setResumeFileName(data.fileName);
        }
      } catch (error) {
        // Resume not found - safe fallback
      }
    };

    loadResume();
  }, []);

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Please upload a PDF file.');
      return;
    }

    setUploadingResume(true);

    try {
      const data = await uploadResume(file);
      setResumeText(data.text);
      setResumeFileName(data.fileName);
      toast.success('Resume parsed successfully!');
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to upload resume';
      toast.error(message);
    } finally {
      setUploadingResume(false);
    }
  };

  const handleStartInterview = async () => {
    if (!selectedRole) {
      toast.error('Please select a role.');
      return;
    }
    if (!resumeText) {
      toast.error('Please upload or provide your resume.');
      return;
    }

    setLoading(true);
    setInitError(null);

    try {
      const difficultyConfig = DIFFICULTY_LEVELS.find((d) => d.id === selectedDifficulty);
      const totalQuestions = difficultyConfig ? difficultyConfig.questions : 5;
      const data = await startInterview(selectedRole, resumeText, totalQuestions);
      toast.success('Interview session initialized!');
      navigate(`/interview/${data.interviewId}`, {
        state: { audio: data.audio },
      });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to initialize session. Please check connection and try again.';
      setInitError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step === 1 && !selectedRole) {
      toast.error('Please select an interview role.');
      return;
    }
    setStep((prev) => Math.min(prev + 1, 3));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  if (loading || initError) {
    return (
      <div className="setup-page">
        <ContextualAILoader
          title="Initializing AI Interview Session"
          subtitle={`Analyzing your profile for the ${selectedRole} position...`}
          activeStep={2}
          steps={['Parsing Resume Data', 'Generating AI Technical Questions', 'Priming Speech Synthesizer']}
          error={initError}
          onRetry={handleStartInterview}
        />
      </div>
    );
  }

  return (
    <div className="setup-page">
      <div className="setup-wrapper">
        {/* Header Title */}
        <div className="setup-header">
          <h1 className="setup-title">Configure Mock Interview</h1>
          <p className="setup-subtitle">
            Customize your role, difficulty level, and resume to generate a personalized AI session.
          </p>
        </div>

        {/* Wizard Step Progress Indicator */}
        <div className="setup-wizard-nav glass-card">
          <div className={`wizard-step ${step >= 1 ? 'active' : ''}`} onClick={() => setStep(1)}>
            <div className="step-number">1</div>
            <div className="step-info">
              <span className="step-label">Target Role</span>
              <span className="step-val">{selectedRole || 'Select Role'}</span>
            </div>
          </div>

          <div className="wizard-connector" />

          <div className={`wizard-step ${step >= 2 ? 'active' : ''}`} onClick={() => selectedRole && setStep(2)}>
            <div className="step-number">2</div>
            <div className="step-info">
              <span className="step-label">Difficulty</span>
              <span className="step-val">{selectedDifficulty.toUpperCase()}</span>
            </div>
          </div>

          <div className="wizard-connector" />

          <div className={`wizard-step ${step >= 3 ? 'active' : ''}`} onClick={() => selectedRole && setStep(3)}>
            <div className="step-number">3</div>
            <div className="step-info">
              <span className="step-label">Resume Data</span>
              <span className="step-val">{resumeFileName ? 'Uploaded' : 'Pending'}</span>
            </div>
          </div>
        </div>

        {/* STEP 1: ROLE SELECTION */}
        {step === 1 && (
          <div className="setup-step-section animate-fade-in">
            <div className="section-header-box">
              <h2 className="step-heading">Step 1: Choose Your Interview Role</h2>
              <span className="step-subheading">Select the engineering discipline or specialization for your interview.</span>
            </div>

            <div className="roles-grid">
              {INTERVIEW_ROLES.map((role) => {
                const RoleIcon = ROLE_ICONS[role.id] || BsDisplay;
                const isSelected = selectedRole === role.title;
                return (
                  <div
                    key={role.id}
                    className={`role-card glass-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedRole(role.title)}
                  >
                    {isSelected && (
                      <div className="selected-badge">
                        <BsCheckCircleFill />
                      </div>
                    )}
                    <div className="role-icon-box">
                      <RoleIcon />
                    </div>
                    <h3 className="role-card-title">{role.title}</h3>
                    <p className="role-card-desc">{role.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 2: DIFFICULTY SELECTION */}
        {step === 2 && (
          <div className="setup-step-section animate-fade-in">
            <div className="section-header-box">
              <h2 className="step-heading">Step 2: Select Difficulty & Question Volume</h2>
              <span className="step-subheading">Adjust session depth based on your preparation goals.</span>
            </div>

            <div className="difficulty-grid">
              {DIFFICULTY_LEVELS.map((level) => {
                const isSelected = selectedDifficulty === level.id;
                return (
                  <div
                    key={level.id}
                    className={`difficulty-card glass-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedDifficulty(level.id)}
                  >
                    {isSelected && (
                      <div className="selected-badge">
                        <BsCheckCircleFill />
                      </div>
                    )}
                    {DIFFICULTY_ICONS[level.id]}
                    <h3 className="difficulty-title">{level.label}</h3>
                    <div className="difficulty-pills">
                      <span className="pill questions-pill">{level.questions} Questions</span>
                      <span className="pill time-pill">{DURATION_ESTIMATES[level.id]}</span>
                    </div>
                    <p className="difficulty-desc">{level.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* STEP 3: RESUME UPLOAD */}
        {step === 3 && (
          <div className="setup-step-section animate-fade-in">
            <div className="section-header-box">
              <h2 className="step-heading">Step 3: Attach Your Resume</h2>
              <span className="step-subheading">Upload your PDF resume so the AI can extract your relevant projects and tech stack.</span>
            </div>

            <div className="resume-upload-wrapper glass-card">
              {resumeText ? (
                <div className="resume-success-box">
                  <div className="resume-icon-badge">
                    <BsFileCheck className="file-check-icon" />
                  </div>
                  <div className="resume-file-details">
                    <h4 className="file-name">{resumeFileName || 'Resume Attached'}</h4>
                    <p className="file-status">PDF parsed & ready for question tailoring</p>
                  </div>

                  <label className="change-file-btn">
                    <span>Replace PDF</span>
                    <input type="file" accept=".pdf" onChange={handleResumeUpload} hidden />
                  </label>
                </div>
              ) : (
                <label className="upload-dropzone">
                  <div className="upload-icon-circle">
                    <BsFileEarmarkArrowUp />
                  </div>
                  <h4 className="upload-title">
                    {uploadingResume ? 'Parsing PDF Resume...' : 'Click or Drag & Drop PDF Resume'}
                  </h4>
                  <p className="upload-subtitle">Maximum file size: 10MB (PDF format only)</p>
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleResumeUpload}
                    disabled={uploadingResume}
                    hidden
                  />
                </label>
              )}
            </div>
          </div>
        )}

        {/* WIZARD NAVIGATION FOOTER BUTTONS */}
        <div className="setup-actions-bar">
          {step > 1 ? (
            <button className="nav-btn back-btn" onClick={handleBack}>
              <BsArrowLeftShort className="btn-arrow" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button className="nav-btn next-btn" onClick={handleNext}>
              <span>Next Step</span>
              <BsArrowRightShort className="btn-arrow" />
            </button>
          ) : (
            <ButtonLoader
              className="nav-btn start-btn"
              loading={loading}
              loadingText="Initializing AI Session..."
              onClick={handleStartInterview}
              disabled={!selectedRole || !resumeText}
            >
              <BsStars className="btn-sparkle" />
              <span>Initialize AI Session</span>
            </ButtonLoader>
          )}
        </div>
      </div>
    </div>
  );
}

export default InterviewSetupPage;
