import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/admin/Sidebar';
import Dashboard from '../components/admin/Dashboard';
import ProfileManager from '../components/admin/managers/ProfileManager';
import ExperienceManager from '../components/admin/managers/ExperienceManager';
import EducationManager from '../components/admin/managers/EducationManager';
import ProjectsManager from '../components/admin/managers/ProjectsManager';
import SkillsManager from '../components/admin/managers/SkillsManager';
import AchievementsManager from '../components/admin/managers/AchievementsManager';
import BlogManager from '../components/admin/managers/BlogManager';
import ContactsManager from '../components/admin/managers/ContactsManager';
import SettingsManager from '../components/admin/managers/SettingsManager';
import api from '../api/client';

export default function AdminPage() {
  const { isAuthenticated, loading } = useAuth();
  const [activeSection, setActiveSection] = useState('dashboard');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isAuthenticated) {
      api.getContacts({ unread: 'true' })
        .then(res => setUnreadCount(res.data?.unread_count || 0))
        .catch(() => {});
    }
  }, [isAuthenticated, activeSection]);

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard': return <Dashboard />;
      case 'profile': return <ProfileManager />;
      case 'experience': return <ExperienceManager />;
      case 'education': return <EducationManager />;
      case 'projects': return <ProjectsManager />;
      case 'skills': return <SkillsManager />;
      case 'achievements': return <AchievementsManager />;
      case 'blog': return <BlogManager />;
      case 'contacts': return <ContactsManager />;
      case 'settings': return <SettingsManager />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="admin-layout">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        unreadCount={unreadCount}
      />
      <main className="admin-main">
        {renderContent()}
      </main>
    </div>
  );
}
