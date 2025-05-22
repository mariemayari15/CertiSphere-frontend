import React, { useState, useCallback, useMemo } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import {
  FiChevronLeft,
  FiX,
  FiFileText,
  FiCreditCard,
  FiHome,
  FiMessageSquare,
  FiUsers,
  FiUserPlus,
  FiSettings,
} from 'react-icons/fi';

import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBarr';
import '../styles/AdminDashboard.css';

interface TokenPayload {
  userId: number;
  clientCode: string;
  role: string;
  iat?: number;
  exp?: number;
}

const SIDEBAR_LINKS = [
  { to: 'dashboard',      label: 'Dashboard',  icon: <FiHome /> },
  { to: 'certifications', label: 'Orders',     icon: <FiFileText /> },
  { to: 'conversations',  label: 'Support Conversations',   icon: <FiMessageSquare /> },
  { to: 'users',          label: 'Users',      icon: <FiUsers /> },
  { to: 'team-chat',      label: 'Team Chat',  icon: <FiMessageSquare /> },
  { to: 'add-admin',      label: 'Add Admin',  icon: <FiUserPlus /> },
  { to: 'payments',       label: 'Payments',   icon: <FiCreditCard /> }, 
  { to: 'settings',       label: 'Settings',   icon: <FiSettings/> }, 
];

const AdminLayout: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen]     = useState(false);
  const navigate = useNavigate();

  const adminCode = useMemo(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return '';
    try {
      return jwtDecode<TokenPayload>(token).clientCode;
    } catch {
      return '';
    }
  }, []);

  const toggleSidebar = useCallback(
    () => setIsSidebarCollapsed(c => !c),
    []
  );
  const toggleMobile = useCallback(() => {
    setIsMobileMenuOpen(o => !o);
    document.body.style.overflow = !isMobileMenuOpen ? 'hidden' : '';
  }, [isMobileMenuOpen]);
  const closeMobile = useCallback(() => {
    setIsMobileMenuOpen(false);
    document.body.style.overflow = '';
  }, []);
  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    navigate('/admin-login');
  }, [navigate]);

  return (
    <div className="dashboard-container">
      {isMobileMenuOpen && (
        <div
          className="mobile-overlay"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`sidebar ${
          isSidebarCollapsed ? 'collapsed' : ''
        } ${isMobileMenuOpen ? 'mobile-open' : ''}`}
      >
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon">CS</div>
            {!isSidebarCollapsed && (
              <h2 className="logo-text">CertiSphere</h2>
            )}
          </div>
          <button
            className="sidebar-toggle desktop-only"
            onClick={toggleSidebar}
          >
            <FiChevronLeft
              className={isSidebarCollapsed ? 'rotate-180' : ''}
            />
          </button>
          <button
            className="close-mobile-menu mobile-only"
            onClick={closeMobile}
          >
            <FiX />
          </button>
        </div>

        <nav className="sidebar-navigation">
          <Sidebar
            links={SIDEBAR_LINKS}
            isSidebarCollapsed={isSidebarCollapsed}
            onMobileMenuClose={closeMobile} onSidebarToggle={function (): void {
              throw new Error('Function not implemented.');
            } }          />
        </nav>

      
      </aside>

      <main className="main-content">
        <TopBar
          pageTitle="Admin Dashboard"
          clientCode={adminCode}
          showSearch={false}
          onToggleMobile={toggleMobile}
          onLogout={logout}
          notificationsApiPath="/api/admin/notifications"
          notificationsRoutePath="/admin/notifications"
        />

        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
