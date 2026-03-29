import { useState, useEffect } from 'react';
import api from '../../api/client';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentContacts, setRecentContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDashboardStats()
      .then(res => {
        setStats(res.data?.stats || {});
        setRecentContacts(res.data?.recent_contacts || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="admin-title">Dashboard</h1>
        <div className="stats-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="glass-card-static stat-card">
              <div className="skeleton" style={{ width: 40, height: 40, marginBottom: 12 }} />
              <div className="skeleton" style={{ width: 60, height: 32, marginBottom: 8 }} />
              <div className="skeleton" style={{ width: 100, height: 16 }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const statItems = [
    { label: 'Projects', value: stats?.projects || 0, icon: '🚀', bg: 'rgba(99, 102, 241, 0.1)' },
    { label: 'Blog Posts', value: stats?.blog_posts || 0, icon: '✍️', bg: 'rgba(6, 182, 212, 0.1)' },
    { label: 'Unread Messages', value: stats?.unread_contacts || 0, icon: '📬', bg: 'rgba(245, 158, 11, 0.1)' },
    { label: 'Skills', value: stats?.skills || 0, icon: '🧠', bg: 'rgba(34, 197, 94, 0.1)' },
    { label: 'Experience', value: stats?.experience || 0, icon: '💼', bg: 'rgba(168, 85, 247, 0.1)' },
    { label: 'Education', value: stats?.education || 0, icon: '🎓', bg: 'rgba(236, 72, 153, 0.1)' },
    { label: 'Achievements', value: stats?.achievements || 0, icon: '🏆', bg: 'rgba(251, 191, 36, 0.1)' },
  ];

  return (
    <div>
      <h1 className="admin-title">Dashboard</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)' }}>
        Welcome back! Here's an overview of your portfolio.
      </p>

      <div className="stats-grid">
        {statItems.map(item => (
          <div key={item.label} className="glass-card-static stat-card">
            <div className="stat-card-icon" style={{ background: item.bg }}>{item.icon}</div>
            <div className="stat-card-value">{item.value}</div>
            <div className="stat-card-label">{item.label}</div>
          </div>
        ))}
      </div>

      {recentContacts.length > 0 && (
        <div className="glass-card-static" style={{ padding: 'var(--space-xl)' }}>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-lg)' }}>
            📬 Recent Messages
          </h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Subject</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentContacts.map(contact => (
                <tr key={contact.id}>
                  <td style={{ fontWeight: contact.is_read ? 400 : 600 }}>{contact.name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{contact.email}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{contact.subject || '—'}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: 'var(--text-sm)' }}>
                    {new Date(contact.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
