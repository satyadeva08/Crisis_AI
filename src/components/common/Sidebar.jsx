import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Map, BarChart3, Bell, LogOut, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import './Sidebar.css';

const navItems = [
  { path: '/authority/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/authority/map', label: 'Live Map', icon: Map },
  { path: '/authority/analytics', label: 'Analytics', icon: BarChart3 },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <Shield size={20} strokeWidth={2.2} />
          </div>
          {!collapsed && (
            <div className="sidebar-brand-text">
              <span className="sidebar-title">Command Center</span>
              <span className="sidebar-badge">LIVE</span>
            </div>
          )}
        </div>
        <button
          className="sidebar-collapse-btn"
          onClick={() => setCollapsed(!collapsed)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <nav className="sidebar-nav">
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            title={collapsed ? label : undefined}
          >
            <Icon size={20} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {!collapsed && user && (
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">
              {user.name?.charAt(0) || 'A'}
            </div>
            <div className="sidebar-user-info">
              <span className="sidebar-user-name">{user.name}</span>
              <span className="sidebar-user-role">{user.department}</span>
            </div>
          </div>
        )}
        <button className="sidebar-link sidebar-logout" onClick={logout} title="Sign out">
          <LogOut size={20} />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
