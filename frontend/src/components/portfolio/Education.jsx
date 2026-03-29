import { useState, useEffect } from 'react';
import api from '../../api/client';

export default function Education() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.getEducation().then(res => setItems(res.data || [])).catch(() => {});
  }, []);

  if (items.length === 0) return null;

  const formatDate = (date) => {
    if (!date) return 'Present';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  return (
    <section className="section" id="education">
      <div className="container">
        <h2 className="section-title">Education</h2>
        <p className="section-subtitle">My academic background and qualifications</p>

        <div className="timeline">
          {items.map(edu => (
            <div key={edu.id} className={`timeline-item ${edu.is_current ? 'current' : ''}`}>
              <div className="timeline-dot" />
              <div className="glass-card timeline-card">
                <div className="timeline-header">
                  <h3 className="timeline-role">{edu.degree}</h3>
                  <span className="timeline-date">
                    {formatDate(edu.start_date)} — {edu.is_current ? 'Present' : formatDate(edu.end_date)}
                  </span>
                </div>
                <p className="timeline-company">🎓 {edu.institution}</p>
                {edu.field && <p className="timeline-description">Field: {edu.field}</p>}
                {edu.result && (
                  <p style={{ color: 'var(--accent)', fontWeight: 600, fontSize: 'var(--text-sm)', marginBottom: 'var(--space-sm)' }}>
                    📊 {edu.result}
                  </p>
                )}
                {edu.description && <p className="timeline-description">{edu.description}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
