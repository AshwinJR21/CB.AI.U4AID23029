import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import AllNotifications from './pages/AllNotifications';
import PriorityNotifications from './pages/PriorityNotifications';
import Log from 'logging_middleware';

function NavBar() {
  const location = useLocation();

  const handleNavClick = (route) => {
    Log("frontend", "info", "component", `User navigated to ${route}`);
  };

  return (
    <nav className="navbar">
      <div className="nav-logo">CampusNotif</div>
      <div className="nav-links">
        <Link 
          to="/" 
          className={location.pathname === '/' ? 'active' : ''}
          onClick={() => handleNavClick('/')}
        >
          All Notifications
        </Link>
        <Link 
          to="/priority" 
          className={location.pathname === '/priority' ? 'active' : ''}
          onClick={() => handleNavClick('/priority')}
        >
          Priority Inbox
        </Link>
      </div>
    </nav>
  );
}

function App() {
  React.useEffect(() => {
    Log("frontend", "info", "page", "Application mounted");
  }, []);

  return (
    <BrowserRouter>
      <div className="app-container">
        <NavBar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<AllNotifications />} />
            <Route path="/priority" element={<PriorityNotifications />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
