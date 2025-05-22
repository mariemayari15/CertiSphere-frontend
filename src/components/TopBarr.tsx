import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FiMenu,
  FiCalendar,
  FiBell,
  FiUser,
  FiLogOut,
  FiSettings,
  FiSearch,
} from 'react-icons/fi';

interface TopBarProps {
  pageTitle: string;
  clientCode?: string;
  showSearch?: boolean;
  onToggleMobile: () => void;
  onLogout: () => void;
  /** e.g. '/api/notifications' or '/api/admin/notifications' */
  notificationsApiPath?: string;
  /** e.g. '/notifications' or '/admin/notifications' */
  notificationsRoutePath?: string;
}

const TopBar: React.FC<TopBarProps> = ({
  pageTitle,
  clientCode = '',
  showSearch = false,
  onToggleMobile,
  onLogout,
  notificationsApiPath = '/api/notifications',
  notificationsRoutePath = '/notifications',
}) => {
  const navigate = useNavigate();
  const [currentDate] = useState(
    new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    fetch(`http://localhost:5000${notificationsApiPath}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data.success && typeof data.unreadCount === 'number') {
          setUnreadCount(data.unreadCount);
        }
      })
      .catch(err => console.error('notif fetch error:', err));
  }, [notificationsApiPath]);

  const handleNotificationsClick = () => {
    navigate(notificationsRoutePath);
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="mobile-menu-toggle" onClick={onToggleMobile}>
          <FiMenu />
        </button>
        <h1 className="page-title">{pageTitle}</h1>
        <div className="date-display">
          <FiCalendar className="date-icon" />
          <span>{currentDate}</span>
        </div>
      </div>

      <div className="topbar-right">
        {showSearch && (
          <div className="search-box">
            <input
              type="text"
              placeholder="Search..."
              className="search-input"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <FiSearch className="search-icon" />
          </div>
        )}

        <div className="notification-wrapper">
          <button
            className="notification-button"
            onClick={handleNotificationsClick}
          >
            <FiBell />
            {unreadCount > 0 && (
              <span className="notification-indicator">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        <div className="profile-dropdown">
          <button className="profile-button">
            
            <span className="admin-name">{clientCode || 'Client'}</span>
          </button>
          <div className="dropdown-content">
            <button
              className="dropdown-item"
              onClick={() => navigate('profile')}
            >
              <FiUser /> <span>Profile</span>
            </button>
            <button
              className="dropdown-item"
              onClick={() => navigate('settings')}
            >
              <FiSettings /> <span>Settings</span>
            </button>
            <button
              className="dropdown-item logout"
              onClick={onLogout}
            >
              <FiLogOut /> <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default TopBar;
