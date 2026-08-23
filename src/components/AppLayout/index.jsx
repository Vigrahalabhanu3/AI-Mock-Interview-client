import { useState } from 'react';
import Sidebar from '../Sidebar';
import Navbar from '../Navbar';
import './index.css';

function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
      <div className="app-main-viewport">
        <Navbar onToggleSidebar={toggleSidebar} />
        <main className="app-content-area">{children}</main>
      </div>
    </div>
  );
}

export default AppLayout;
