import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Map, BarChart3, LogOut, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';
import AdminSettingsModal from './AdminSettingsModal';
import './MobileNav.css';

/**
 * Bottom navigation bar for authority pages on mobile.
 * Only visible on screens < 768px where the sidebar is hidden.
 */
export default function MobileNav() {
  const { user, logout } = useAuth();
  const [showAdminModal, setShowAdminModal] = useState(false);

  const isAdmin = user?.email === 'admin@disaster-response.gov';

  const navItems = [
    { path: '/authority/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/authority/map', label: 'Map', icon: Map },
    { path: '/authority/analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <nav className="mobile-nav" aria-label="Mobile navigation">
      {navItems.map(({ path, label, icon: Icon }) => (
        <NavLink
          key={path}
          to={path}
          className={({ isActive }) => `mobile-nav-item ${isActive ? 'active' : ''}`}
        >
          <Icon size={20} />
          <span>{label}</span>
        </NavLink>
      ))}

      {isAdmin && (
        <button className="mobile-nav-item" onClick={() => setShowAdminModal(true)}>
          <Settings size={20} />
          <span>Admin</span>
        </button>
      )}
      <button className="mobile-nav-item mobile-nav-logout" onClick={logout}>
        <LogOut size={20} />
        <span>Exit</span>
      </button>

      <AdminSettingsModal 
        isOpen={showAdminModal} 
        onClose={() => setShowAdminModal(false)} 
      />
    </nav>
  );
}
