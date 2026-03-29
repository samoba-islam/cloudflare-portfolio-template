import { useState, useEffect } from 'react';
import api from '../../api/client';

export default function About() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    api.getProfile().then(res => setProfile(res.data)).catch(() => {});
  }, []);

  if (!profile) return null;

  const bio = profile.bio || '';
  const paragraphs = bio.split('\n\n').filter(Boolean);

  return (
    <section className="section" id="about">
      <div className="container">
        <h2 className="section-title">About Me</h2>
        <p className="section-subtitle">Get to know the person behind the code</p>

        <div className="about-grid">
          <div className="about-image-wrapper">
            <div className="about-image-glow" />
            {profile.profile_image_url ? (
              <img src={profile.profile_image_url} alt={profile.name} className="about-image" />
            ) : (
              <div className="about-image" style={{
                background: 'linear-gradient(135deg, var(--accent), var(--accent-secondary))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '4rem', color: '#fff', fontWeight: 800
              }}>
                {profile.name?.charAt(0) || 'S'}
              </div>
            )}
          </div>

          <div className="about-text">
            <h3>
              {profile.name}
            </h3>
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            {profile.location && (
              <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {profile.location}
              </p>
            )}

            <div className="about-stats">
              <div className="about-stat">
                <div className="about-stat-number">10+</div>
                <div className="about-stat-label">Years Experience</div>
              </div>
              <div className="about-stat">
                <div className="about-stat-number">100+</div>
                <div className="about-stat-label">Apps Published</div>
              </div>
              <div className="about-stat">
                <div className="about-stat-number">3</div>
                <div className="about-stat-label">Open Source Libs</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
