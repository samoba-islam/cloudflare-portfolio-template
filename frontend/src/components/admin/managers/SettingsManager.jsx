import { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/client';

export default function SettingsManager() {
  const { user, login } = useAuth();
  
  const [formData, setFormData] = useState({
    newEmail: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.newEmail) {
      setError('Email is required');
      return;
    }
    
    if (!formData.currentPassword) {
      setError('Current password is required to save changes');
      return;
    }

    if (formData.newPassword) {
      if (formData.newPassword.length < 8) {
        setError('New password must be at least 8 characters long');
        return;
      }
      if (formData.newPassword !== formData.confirmNewPassword) {
        setError('New passwords do not match');
        return;
      }
    }

    try {
      setLoading(true);
      setError('');
      
      const payload = {
        newEmail: formData.newEmail,
        currentPassword: formData.currentPassword,
      };
      
      if (formData.newPassword) {
        payload.newPassword = formData.newPassword;
      }

      await api.updateAdminSettings(payload);
      
      setSuccess('Settings updated successfully!');
      
      // Update local context user state
      if (formData.newEmail !== user?.email) {
        // We log back in basically to retrieve new JWT, or user has to logout if we didn't return a new token.
        // Easiest is to force a re-login if the email changes, but for now we simply show a message.
        // Actually, we can just let context handle the current token. The token sub is the ID, which didn't change.
        // The email in the JWT might be stale, but the ID is what matters for API authentication.
      }
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
      }));
      
    } catch (err) {
      setError(err.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="manager-container">
      <div className="manager-header">
        <h2>Admin Settings</h2>
        <p>Update your email address or password</p>
      </div>

      <div className="manager-content">
        <form className="form-container" onSubmit={handleSubmit} style={{ maxWidth: '500px' }}>
          
          {error && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="newEmail"
              className="form-input"
              value={formData.newEmail}
              onChange={handleChange}
              placeholder="admin@samoba.dev"
              required
            />
          </div>

          <div className="form-divider" style={{ margin: 'var(--space-lg) 0', borderBottom: '1px solid var(--border)', opacity: 0.5 }} />

          <div className="form-group">
            <label>Current Password <span style={{ color: 'var(--text-light)', fontSize: '0.8em' }}>(Required to make changes)</span></label>
            <input
              type="password"
              name="currentPassword"
              className="form-input"
              value={formData.currentPassword}
              onChange={handleChange}
              placeholder="Enter current password"
              required
            />
          </div>

          <div className="form-group">
            <label>New Password <span style={{ color: 'var(--text-light)', fontSize: '0.8em' }}>(Leave blank to keep current)</span></label>
            <input
              type="password"
              name="newPassword"
              className="form-input"
              value={formData.newPassword}
              onChange={handleChange}
              placeholder="Enter new password"
            />
          </div>

          {formData.newPassword && (
            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                name="confirmNewPassword"
                className="form-input"
                value={formData.confirmNewPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                required={!!formData.newPassword}
              />
            </div>
          )}

          <div className="form-actions" style={{ marginTop: 'var(--space-xl)' }}>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={loading}
              style={{ width: '100%' }}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
