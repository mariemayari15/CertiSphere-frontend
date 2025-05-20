import React, { useState, useCallback, useMemo } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import {
  FiChevronLeft,
  FiX,
  FiHome,
  FiFileText,
  FiUploadCloud,
  FiActivity,
  FiCreditCard,
  FiMessageSquare,
  FiSettings,
} from 'react-icons/fi';

import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBarr';
import '../styles/UserDashboard.css'; 

interface TokenPayload {
  userId: number;
  clientCode: string;
  role: string;
  iat?: number;
  exp?: number;
}

const SIDEBAR_LINKS = [
  { to: 'dashboard',       label: 'Dashboard',      icon: <FiHome /> },
  { to: 'new-certificate', label: 'New Certificate',       icon: <FiFileText /> },
  { to: 'completed',    label: 'Certificates',       icon: <FiFileText /> },
  { to: 'documents',       label: 'Documents',      icon: <FiUploadCloud /> },
  { to: 'progress',        label: 'Progress',       icon: <FiActivity /> },
  { to: 'payments',        label: 'Payments',       icon: <FiCreditCard /> },
  { to: 'support',         label: 'Support',        icon: <FiMessageSquare /> },
  { to: 'settings',        label: 'Settings',       icon: <FiSettings /> },
  
];

const ClientLayout: React.FC = () => {
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const clientCode = useMemo(() => {
    const token = localStorage.getItem('authToken');
    if (!token) return '';
    try {
      return jwtDecode<TokenPayload>(token).clientCode;
    } catch {
      return '';
    }
  }, []);

  const toggleSidebar = useCallback(() => setCollapsed(p => !p), []);
  const toggleMobile  = useCallback(() => {
    setMobileOpen(p => !p);
    document.body.style.overflow = !mobileOpen ? 'hidden' : '';
  }, [mobileOpen]);
  const closeMobile   = useCallback(() => {
    setMobileOpen(false);
    document.body.style.overflow = '';
  }, []);
  const logout        = useCallback(() => {
    localStorage.removeItem('authToken');
    navigate('/signin');
  }, [navigate]);

  return (
    <div className="dashboard-container">
      {mobileOpen && (
        <div
          className="mobile-overlay"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`sidebar ${
          collapsed ? 'collapsed' : ''
        } ${mobileOpen ? 'mobile-open' : ''}`}
      >
        <div className="sidebar-header">
          <div className="logo-container">
            <div className="logo-icon">CS</div>
            {!collapsed && <h2 className="logo-text">CertiSphere</h2>}
          </div>
          <button
            className="sidebar-toggle desktop-only"
            onClick={toggleSidebar}
          >
            <FiChevronLeft className={collapsed ? 'rotate-180' : ''} />
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
            isSidebarCollapsed={collapsed}
            onMobileMenuClose={closeMobile}
          />
        </nav>
      </aside>

      <main className="main-content">
        <TopBar
          pageTitle="User Dashboard"
          clientCode={clientCode}
          showSearch={true}
          onToggleMobile={toggleMobile}
          onLogout={logout}
          notificationsApiPath="/api/notifications"
          notificationsRoutePath="/notifications"
        />

        <Outlet />
      </main>
    </div>
  );
};

export default ClientLayout;
