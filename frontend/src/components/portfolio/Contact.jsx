import { useState, useEffect } from 'react';
import api from '../../api/client';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api.getProfile().then(res => setProfile(res.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);

    try {
      await api.submitContact(form);
      setStatus('success');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="section" id="contact">
      <div className="container">
        <h2 className="section-title">Get In Touch</h2>
        <p className="section-subtitle">Have a project in mind? Let's build something amazing together.</p>

        <div className="contact-grid">
          <div className="glass-card-static contact-info-card">
            <h3 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-xl)' }}>
              Contact Information
            </h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)', lineHeight: 1.7 }}>
              Feel free to reach out for collaborations, freelance work, or just a friendly chat about technology.
            </p>

            {profile?.email && (
              <div className="contact-info-item">
                <div className="contact-info-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Email</p>
                  <a href={`mailto:${profile.email}`} style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>{profile.email}</a>
                </div>
              </div>
            )}

            {profile?.location && (
              <div className="contact-info-item">
                <div className="contact-info-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Location</p>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>{profile.location}</p>
                </div>
              </div>
            )}

            {profile?.github_url && (
              <div className="contact-info-item">
                <div className="contact-info-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>GitHub</p>
                  <a href={profile.github_url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                    @samoba-islam
                  </a>
                </div>
              </div>
            )}
          </div>

          <div className="glass-card-static contact-form-card">
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Your Name *</label>
                <input type="text" className="form-input" placeholder="John Doe" required
                  value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Email Address *</label>
                <input type="email" className="form-input" placeholder="john@example.com" required
                  value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Subject</label>
                <input type="text" className="form-input" placeholder="What's this about?"
                  value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Message *</label>
                <textarea className="form-textarea" placeholder="Tell me about your project..." required rows="5"
                  value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
              </div>

              {status === 'success' && (
                <div style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', color: 'var(--success)', marginBottom: 'var(--space-lg)', fontSize: 'var(--text-sm)' }}>
                  ✅ Message sent successfully! I'll get back to you soon.
                </div>
              )}
              {status === 'error' && (
                <div style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--error)', marginBottom: 'var(--space-lg)', fontSize: 'var(--text-sm)' }}>
                  ❌ Failed to send message. Please try again.
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                {loading ? 'Sending...' : 'Send Message'}
                {!loading && (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
