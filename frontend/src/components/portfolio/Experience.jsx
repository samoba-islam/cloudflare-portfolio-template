import { useState, useEffect } from 'react';
import api from '../../api/client';

export default function Experience() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    api.getExperience().then(res => setItems(res.data || [])).catch(() => {});
  }, []);

  if (items.length === 0) return null;

  const formatDate = (date) => {
    if (!date) return 'Present';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  const parseTechStack = (ts) => {
    if (!ts) return [];
    try { return JSON.parse(ts); } catch { return []; }
  };

  return (
    <section className="section" id="experience">
      <div className="container">
        <h2 className="section-title">Work Experience</h2>
        <p className="section-subtitle">My professional journey and career milestones</p>

        <div className="timeline">
          {items.map((exp, idx) => (
            <div key={exp.id} className={`timeline-item ${exp.is_current ? 'current' : ''}`}>
              <div className="timeline-dot" />
              <div className="glass-card timeline-card">
                <div className="timeline-header">
                  <h3 className="timeline-role">{exp.role}</h3>
                  <span className="timeline-date">
                    {formatDate(exp.start_date)} — {exp.is_current ? 'Present' : formatDate(exp.end_date)}
                  </span>
                </div>
                <p className="timeline-company">🏢 {exp.company}</p>
                {exp.description && <p className="timeline-description">{exp.description}</p>}
                <div className="timeline-tags">
                  {parseTechStack(exp.tech_stack).map((tech, i) => (
                    <span key={i} className="badge badge-accent">{tech}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
