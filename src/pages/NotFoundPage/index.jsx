import { useNavigate } from 'react-router-dom';
import { BsExclamationTriangleFill, BsHouseFill } from 'react-icons/bs';
import './index.css';

function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="not-found-page">
      <div className="not-found-content">
        <BsExclamationTriangleFill className="not-found-icon" />
        <h1 className="not-found-heading">404 - Page Not Found</h1>
        <p className="not-found-text">
          Oops! The page you are looking for doesn't exist or has been moved.
        </p>
        <button 
          className="not-found-home-btn"
          onClick={() => navigate('/')}
        >
          <BsHouseFill className="home-btn-icon" />
          Back to Home
        </button>
      </div>
    </div>
  );
}

export default NotFoundPage;
