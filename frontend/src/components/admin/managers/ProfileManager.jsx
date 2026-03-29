import { useState, useEffect } from 'react';
import api from '../../../api/client';

export default function ProfileManager() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    api.getProfile()
      .then(res => setProfile(res.data || {}))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      const res = await api.updateProfile(profile);
      setProfile(res.data);
      setMessage('Profile updated successfully!');
    } catch (err) {
      setMessage('Error: ' + (err.message || 'Failed to update'));
    }
    setSaving(false);
  };

  if (loading) return <div className="skeleton" style={{ height: 400 }} />;

  const fields = [
    { key: 'name', label: 'Full Name', required: true },
    { key: 'title', label: 'Professional Title', required: true },
    { key: 'tagline', label: 'Tagline' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'phone', label: 'Phone' },
    { key: 'location', label: 'Location' },
    { key: 'profile_image_url', label: 'Profile Image URL' },
    { key: 'cv_url', label: 'CV Download URL' },
    { key: 'github_url', label: 'GitHub URL' },
    { key: 'linkedin_url', label: 'LinkedIn URL' },
    { key: 'facebook_url', label: 'Facebook URL' },
    { key: 'twitter_url', label: 'Twitter/X URL' },
    { key: 'website_url', label: 'Website URL' },
  ];

  return (
    <div>
      <h1 className="admin-title">Profile Settings</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)' }}>
        Manage your personal information displayed on the portfolio.
      </p>

      <div className="glass-card-static" style={{ padding: 'var(--space-xl)', maxWidth: 720 }}>
        <form onSubmit={handleSave}>
          {fields.map(field => (
            <div key={field.key} className="form-group">
              <label className="form-label">{field.label}</label>
              <input
                className="form-input"
                type={field.type || 'text'}
                value={profile[field.key] || ''}
                onChange={e => setProfile({ ...profile, [field.key]: e.target.value })}
                required={field.required}
              />
            </div>
          ))}

          <div className="form-group">
            <label className="form-label">Bio</label>
            <textarea
              className="form-textarea"
              rows={8}
              value={profile.bio || ''}
              onChange={e => setProfile({ ...profile, bio: e.target.value })}
              placeholder="Write about yourself..."
            />
          </div>

          {message && (
            <div style={{
              padding: 'var(--space-md)', borderRadius: 'var(--radius-md)',
              background: message.startsWith('Error') ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)',
              border: `1px solid ${message.startsWith('Error') ? 'rgba(239,68,68,0.3)' : 'rgba(34,197,94,0.3)'}`,
              color: message.startsWith('Error') ? 'var(--error)' : 'var(--success)',
              marginBottom: 'var(--space-lg)', fontSize: 'var(--text-sm)'
            }}>
              {message}
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
