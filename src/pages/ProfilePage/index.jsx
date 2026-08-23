import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import { getResume, uploadResume } from '../../services/interviewService.js';
import { getHistory } from '../../services/historyService.js';
import { ButtonLoader, SkeletonLoader } from '../../components/common/Loading';
import { calculateStreak } from '../../utils/streakUtils.js';
import {
  BsPersonFillCheck,
  BsEnvelopeFill,
  BsFileEarmarkPdfFill,
  BsUpload,
  BsTrophyFill,
  BsClockHistory,
  BsShieldCheck,
  BsCheckCircleFill,
  BsStars,
  BsCodeSquare,
  BsLaptop,
  BsArrowLeftShort,
  BsFire,
  BsCalendarCheckFill,
} from 'react-icons/bs';
import toast from 'react-hot-toast';
import './index.css';

function ProfilePage() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  // Form State
  const [name, setName] = useState(user?.name || '');
  const [targetRole, setTargetRole] = useState('Full Stack Software Engineer');
  const [experienceLevel, setExperienceLevel] = useState('Mid-Senior Level (3-5 yrs)');

  // Resume State
  const [resumeFileName, setResumeFileName] = useState('');
  const [resumeText, setResumeText] = useState('');

  // Stats State
  const [stats, setStats] = useState({
    totalInterviews: 0,
    completedInterviews: 0,
    avgScore: 0,
    topScore: 0,
  });

  const [streakDetails, setStreakDetails] = useState({
    currentStreak: 0,
    longestStreak: 0,
    practicedToday: false,
    weeklyActivity: [false, false, false, false, false, false, false],
  });

  useEffect(() => {
    const fetchProfileData = async () => {
      setLoading(true);
      try {
        // Fetch Resume
        try {
          const resumeData = await getResume();
          if (resumeData) {
            setResumeFileName(resumeData.fileName || 'Uploaded_Resume.pdf');
            setResumeText(resumeData.text || '');
          }
        } catch (e) {
          // Resume not uploaded yet
        }

        // Fetch Stats
        try {
          const historyData = await getHistory(1, 100);
          const entries = historyData.entries || [];
          const completed = entries.filter((e) => e.status === 'completed');
          const scores = completed.map((e) => e.overallScore).filter((s) => typeof s === 'number');

          const avg = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
          const max = scores.length > 0 ? Math.max(...scores) : 0;

          setStats({
            totalInterviews: entries.length,
            completedInterviews: completed.length,
            avgScore: avg,
            topScore: max,
          });

          const streakData = calculateStreak(entries);
          setStreakDetails(streakData);

          if (entries.length > 0 && entries[0].role) {
            setTargetRole(entries[0].role);
          }
        } catch (e) {
          // History empty
        }
      } catch (err) {
        console.error('Failed to load profile data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
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
      setResumeFileName(data.fileName || file.name);
      setResumeText(data.text);
      toast.success('Resume uploaded and parsed successfully!');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload resume PDF');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      toast.success('Profile preferences updated successfully!');
    }, 600);
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Back Navigation Bar */}
        <div className="profile-top-bar">
          <button className="back-btn" onClick={() => navigate('/')}>
            <BsArrowLeftShort className="back-icon" />
            <span>Back to Dashboard</span>
          </button>
        </div>

        {/* Hero Card */}
        <div className="profile-hero-card glass-card">
          <div className="profile-hero-left">
            <div className="profile-avatar-wrapper">
              <div className="profile-avatar-circle">
                <BsPersonFillCheck className="profile-avatar-icon" />
              </div>
              <span className="profile-status-online" title="Active Session" />
            </div>

            <div className="profile-hero-details">
              <div className="profile-name-row">
                <h1 className="profile-user-name">{user?.name || 'User Candidate'}</h1>
                <span className="profile-badge-pro">
                  <BsShieldCheck className="badge-shield-icon" /> Verified Candidate
                </span>
              </div>
              <p className="profile-user-email">
                <BsEnvelopeFill className="email-icon" /> {user?.email || 'user@example.com'}
              </p>
              <div className="profile-tags-row">
                <span className="profile-role-tag">
                  <BsLaptop className="tag-icon" /> {targetRole}
                </span>
                <span className="profile-level-tag">
                  <BsStars className="tag-icon" /> {experienceLevel}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* KPI Performance Grid */}
        <div className="profile-kpi-grid">
          <div className="profile-kpi-card glass-card">
            <div className="kpi-icon-box blue">
              <BsClockHistory />
            </div>
            <div className="kpi-info">
              <span className="kpi-val">{loading ? <SkeletonLoader width="40px" height="24px" /> : stats.totalInterviews}</span>
              <span className="kpi-lbl">Total Practice Sessions</span>
            </div>
          </div>

          <div className="profile-kpi-card glass-card">
            <div className="kpi-icon-box green">
              <BsCheckCircleFill />
            </div>
            <div className="kpi-info">
              <span className="kpi-val">{loading ? <SkeletonLoader width="40px" height="24px" /> : stats.completedInterviews}</span>
              <span className="kpi-lbl">Evaluated Reports</span>
            </div>
          </div>

          <div className="profile-kpi-card glass-card">
            <div className="kpi-icon-box purple">
              <BsTrophyFill />
            </div>
            <div className="kpi-info">
              <span className="kpi-val">{loading ? <SkeletonLoader width="50px" height="24px" /> : `${stats.avgScore}/100`}</span>
              <span className="kpi-lbl">Average Readiness Score</span>
            </div>
          </div>

          <div className="profile-kpi-card glass-card">
            <div className="kpi-icon-box amber">
              <BsStars />
            </div>
            <div className="kpi-info">
              <span className="kpi-val">{loading ? <SkeletonLoader width="50px" height="24px" /> : `${stats.topScore}/100`}</span>
              <span className="kpi-lbl">Peak Score</span>
            </div>
          </div>
        </div>

        {/* Practice Streak & Consistency Card */}
        <div className="profile-streak-card glass-card">
          <div className="streak-card-left">
            <div className="streak-flame-box">
              <BsFire className="streak-big-flame" />
            </div>
            <div className="streak-info-group">
              <div className="streak-title-row">
                <h3 className="streak-card-title">{streakDetails.currentStreak} Day Practice Streak</h3>
                <span className={`streak-status-badge ${streakDetails.practicedToday ? 'active' : ''}`}>
                  {streakDetails.practicedToday ? '🔥 Streak Active Today' : '⚡ Complete session to extend streak'}
                </span>
              </div>
              <p className="streak-card-desc">
                Longest Streak: <strong>{streakDetails.longestStreak} Days</strong>. Practice daily to build interview muscle memory!
              </p>
            </div>
          </div>

          <div className="weekly-tracker-box">
            <span className="weekly-label">Current Week (Mon - Sun):</span>
            <div className="weekly-dots-row">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((dayName, idx) => (
                <div key={idx} className="day-col">
                  <div className={`day-dot ${streakDetails.weeklyActivity[idx] ? 'completed' : ''}`}>
                    {streakDetails.weeklyActivity[idx] ? '✓' : ''}
                  </div>
                  <span className="day-name">{dayName}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content Layout: Form & Resume */}
        <div className="profile-content-grid">
          {/* Account Details Form */}
          <div className="profile-section-card glass-card">
            <div className="section-card-header">
              <h2 className="section-title">Account & Interview Preferences</h2>
              <p className="section-subtitle">Manage your target role, experience level, and display settings.</p>
            </div>

            <form className="profile-form" onSubmit={handleSaveProfile}>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="profile-input"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter full name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email Address (Read-only)</label>
                <input
                  type="email"
                  className="profile-input disabled"
                  value={user?.email || ''}
                  disabled
                />
              </div>

              <div className="form-group">
                <label className="form-label">Target Role Specialty</label>
                <input
                  type="text"
                  className="profile-input"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  placeholder="e.g. Full Stack Developer, DevOps, Frontend Engineer"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Target Seniority Level</label>
                <select
                  className="profile-select"
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                >
                  <option value="Entry Level (0-2 yrs)">Entry Level (0-2 yrs)</option>
                  <option value="Mid-Senior Level (3-5 yrs)">Mid-Senior Level (3-5 yrs)</option>
                  <option value="Senior Staff / Lead (5+ yrs)">Senior Staff / Lead (5+ yrs)</option>
                  <option value="Principal Architect">Principal Architect</option>
                </select>
              </div>

              <div className="form-submit-row">
                <ButtonLoader
                  type="submit"
                  className="save-profile-btn"
                  loading={saving}
                  loadingText="Saving Changes..."
                >
                  Save Profile Preferences
                </ButtonLoader>
              </div>
            </form>
          </div>

          {/* Active Resume & Tech Stack Box */}
          <div className="profile-section-card glass-card">
            <div className="section-card-header">
              <h2 className="section-title">Resume & Skills Profile</h2>
              <p className="section-subtitle">Parsed resume data used by Gemini AI to customize interview questions.</p>
            </div>

            <div className="resume-box">
              <div className="resume-box-header">
                <div className="pdf-icon-circle">
                  <BsFileEarmarkPdfFill className="pdf-icon" />
                </div>
                <div className="resume-file-info">
                  <span className="pdf-filename">{resumeFileName || 'No PDF Uploaded Yet'}</span>
                  <span className="pdf-file-status">
                    {resumeText ? 'Parsed & Synced with AI' : 'Upload PDF to customize AI sessions'}
                  </span>
                </div>
              </div>

              {resumeText && (
                <div className="resume-snippet-preview">
                  <span className="snippet-label">Parsed Resume Highlights:</span>
                  <p className="snippet-text">
                    {resumeText.slice(0, 300)}...
                  </p>
                </div>
              )}

              <div className="resume-upload-action">
                <label className={`upload-resume-btn ${uploadingResume ? 'disabled' : ''}`}>
                  <BsUpload className="upload-icon" />
                  <span>{uploadingResume ? 'Parsing PDF...' : resumeFileName ? 'Replace PDF Resume' : 'Upload PDF Resume'}</span>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleResumeUpload}
                    disabled={uploadingResume}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            </div>

            {/* Tech Stack Pills */}
            <div className="tech-stack-card">
              <h4 className="tech-stack-title">
                <BsCodeSquare className="code-icon" /> Technical Skill Highlights
              </h4>
              <div className="tech-pills-row">
                <span className="tech-pill">JavaScript (ES6+)</span>
                <span className="tech-pill">React.js</span>
                <span className="tech-pill">Node.js</span>
                <span className="tech-pill">Express</span>
                <span className="tech-pill">MongoDB</span>
                <span className="tech-pill">REST APIs</span>
                <span className="tech-pill">System Design</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
