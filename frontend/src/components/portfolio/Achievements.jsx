import { useState, useEffect } from 'react';
import api from '../../api/client';

export default function Achievements() {
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    api.getAchievements().then(res => setAchievements(res.data || [])).catch(() => {});
  }, []);

  if (achievements.length === 0) return null;

  const getIcon = (idx) => {
    const icons = ['🏆', '🚀', '🌟', '📦', '🎯', '💡'];
    return icons[idx % icons.length];
  };

  return (
    <section className="section" id="achievements">
      <div className="container">
        <h2 className="section-title">Achievements & Certifications</h2>
        <p className="section-subtitle">Milestones and recognitions along the way</p>

        <div className="achievements-grid">
          {achievements.map((ach, idx) => (
            <div key={ach.id} className="glass-card achievement-card">
              <div className="achievement-icon">{getIcon(idx)}</div>
              <h3 className="achievement-title">{ach.title}</h3>
              {ach.description && <p className="achievement-description">{ach.description}</p>}
              <div className="achievement-meta">
                {ach.issuer && <span>{ach.issuer}</span>}
                {ach.issuer && ach.date && <span> · </span>}
                {ach.date && <span>{ach.date}</span>}
              </div>
              {ach.certificate_url && (
                <a href={ach.certificate_url} target="_blank" rel="noopener noreferrer"
                   className="btn btn-sm btn-secondary" style={{ marginTop: 'var(--space-md)' }}>
                  View Certificate
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
