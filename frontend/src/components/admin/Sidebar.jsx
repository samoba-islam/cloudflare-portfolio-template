import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: '📊' },
  { id: 'profile', label: 'Profile', icon: '👤' },
  { id: 'experience', label: 'Experience', icon: '💼' },
  { id: 'education', label: 'Education', icon: '🎓' },
  { id: 'projects', label: 'Projects', icon: '🚀' },
  { id: 'skills', label: 'Skills', icon: '🧠' },
  { id: 'achievements', label: 'Achievements', icon: '🏆' },
  { id: 'blog', label: 'Blog Posts', icon: '✍️' },
  { id: 'contacts', label: 'Messages', icon: '📬' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

export default function Sidebar({ activeSection, onSectionChange, unreadCount }) {
  const { logout } = useAuth();

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-section">
        <div className="sidebar-section-title">Main</div>
      </div>

      {menuItems.map(item => (
        <button
          key={item.id}
          className={`sidebar-link ${activeSection === item.id ? 'active' : ''}`}
          onClick={() => onSectionChange(item.id)}
        >
          <span className="sidebar-link-icon">{item.icon}</span>
          {item.label}
          {item.id === 'contacts' && unreadCount > 0 && (
            <span className="sidebar-badge">{unreadCount}</span>
          )}
        </button>
      ))}

      <div style={{ padding: 'var(--space-lg)', marginTop: 'auto' }}>
        <button className="btn btn-secondary" style={{ width: '100%' }} onClick={logout}>
          🚪 Logout
        </button>
      </div>
    </aside>
  );
}
