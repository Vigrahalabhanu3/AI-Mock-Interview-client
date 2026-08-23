import { useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import { getHistory } from '../../services/historyService.js';
import { calculateStreak } from '../../utils/streakUtils.js';
import { MdLogout, MdMenu } from 'react-icons/md';
import { FaUserCircle } from 'react-icons/fa';
import { BsFire } from 'react-icons/bs';
import './index.css';

function Navbar({ onToggleSidebar }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [streakInfo, setStreakInfo] = useState({ currentStreak: 0, practicedToday: false });

  useEffect(() => {
    if (!user) return;
    const fetchStreak = async () => {
      try {
        const historyData = await getHistory(1, 100);
        const calculated = calculateStreak(historyData.entries || []);
        setStreakInfo(calculated);
      } catch (err) {
        // Silent catch
      }
    };
    fetchStreak();
  }, [user, location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Dashboard Overview';
      case '/setup':
        return 'Configure Mock Interview';
      case '/history':
        return 'Interview Session History';
      case '/profile':
        return 'Candidate Profile & Preferences';
      default:
        if (location.pathname.startsWith('/interview/')) return 'Live Interview Room';
        if (location.pathname.startsWith('/feedback/')) return 'Performance Evaluation';
        return 'AI Mock Interview';
    }
  };

  return (
    <header className="top-navbar">
      <div className="top-navbar-left">
        <button
          className="sidebar-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle Navigation Sidebar"
        >
          <MdMenu className="toggle-icon" />
        </button>

        <div className="top-page-title-group">
          <span className="page-title">{getPageTitle()}</span>
        </div>
      </div>

      <div className="top-navbar-right">
        {user && (
          <div className="user-profile-widget">
            <div
              className={`navbar-streak-badge ${streakInfo.currentStreak > 0 ? 'active' : ''}`}
              onClick={() => navigate('/profile')}
              title={`Daily Practice Streak: ${streakInfo.currentStreak} Day(s)`}
            >
              <BsFire className="streak-flame-icon" />
              <span>{streakInfo.currentStreak}d Streak</span>
            </div>

            <div
              className="user-avatar-badge"
              onClick={() => navigate('/profile')}
              title="View Candidate Profile & Preferences"
              style={{ cursor: 'pointer' }}
            >
              <FaUserCircle className="user-avatar-icon" />
              <span className="user-display-name">{user.name}</span>
            </div>

            <button className="navbar-logout-btn" onClick={handleLogout} title="Logout">
              <MdLogout className="logout-btn-icon" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;
