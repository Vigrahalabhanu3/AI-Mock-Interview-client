import { Link, useLocation } from 'react-router-dom';
import {
  BsCameraVideoFill,
  BsSpeedometer2,
  BsPlayCircleFill,
  BsClockHistory,
  BsPersonCircle,
  BsFileEarmarkTextFill,
  BsStars,
  BsChevronLeft,
} from 'react-icons/bs';
import './index.css';

function Sidebar({ isOpen, onClose }) {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Dashboard', icon: BsSpeedometer2 },
    { path: '/setup', label: 'Start Interview', icon: BsPlayCircleFill },
    { path: '/history', label: 'Interview History', icon: BsClockHistory },
    { path: '/profile', label: 'My Profile', icon: BsPersonCircle },
  ];

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}

      <aside className={`sidebar-container ${isOpen ? 'sidebar-open' : ''}`}>
        {/* Sidebar Header / Brand */}
        <div className="sidebar-header">
          <Link to="/" className="sidebar-brand" onClick={onClose}>
            <div className="sidebar-brand-icon-wrapper">
              <BsCameraVideoFill className="sidebar-brand-icon" />
            </div>
            <div className="sidebar-brand-text">
              <span className="sidebar-title">AI Interview</span>
              <span className="sidebar-subtitle">Pro Platform</span>
            </div>
          </Link>
          <button className="sidebar-mobile-close" onClick={onClose} aria-label="Close Sidebar">
            <BsChevronLeft />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          <div className="sidebar-menu-label">Main Navigation</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-nav-item ${isActive ? 'sidebar-nav-active' : ''}`}
                onClick={onClose}
              >
                <Icon className="sidebar-nav-icon" />
                <span className="sidebar-nav-label">{item.label}</span>
                {isActive && <div className="sidebar-active-indicator" />}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer AI Badge */}
        <div className="sidebar-footer">
          <div className="sidebar-ai-card">
            <div className="sidebar-ai-header">
              <BsStars className="sidebar-ai-sparkle" />
              <span>Gemini AI Engine</span>
            </div>
            <p className="sidebar-ai-desc">Real-time voice & code assessment active</p>
            <div className="sidebar-ai-status">
              <span className="sidebar-status-dot" />
              <span>System Online</span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
