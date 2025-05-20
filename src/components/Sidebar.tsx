import React, { memo } from 'react';
import { NavLink } from 'react-router-dom';

interface SidebarLink {
  to: string;
  label: string;
  icon: React.ReactNode;
}

interface SidebarNavigationProps {
  links: SidebarLink[];
  isSidebarCollapsed: boolean;
  onMobileMenuClose: () => void;
  onNavigate?: (path: string) => void;
}

const Sidebar = memo(function SidebarNavigation({
  links,
  isSidebarCollapsed,
  onMobileMenuClose,
  onNavigate,
}: SidebarNavigationProps) {
  return (
    <ul className="sidebar-nav-list">
      {links.map(({ to, label, icon }) => (
        <li key={to} className="sidebar-nav-item">
          <NavLink
            to={to}
            className={({ isActive }) => `sidebar-nav-link ${isActive ? 'active' : ''}`}
            onClick={() => {
              onMobileMenuClose();
              if (onNavigate) onNavigate(to);
            }}
          >
            <span className="sidebar-icon">{icon}</span>
            {!isSidebarCollapsed && <span className="sidebar-label">{label}</span>}
          </NavLink>
        </li>
      ))}
    </ul>
  );
});

export default Sidebar;
