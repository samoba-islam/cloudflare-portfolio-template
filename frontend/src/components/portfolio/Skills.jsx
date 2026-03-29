import { useState, useEffect } from 'react';
import api from '../../api/client';

export default function Skills() {
  const [skills, setSkills] = useState([]);

  useEffect(() => {
    api.getSkills().then(res => setSkills(res.data || [])).catch(() => {});
  }, []);

  // Group by category
  const grouped = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill);
    return acc;
  }, {});

  const categoryIcons = {
    'Languages': '💻',
    'Frameworks': '⚡',
    'Databases': '🗄️',
    'DevOps & Tools': '🛠️',
    'Creative': '🎨',
  };

  if (Object.keys(grouped).length === 0) return null;

  return (
    <section className="section" id="skills">
      <div className="container">
        <h2 className="section-title">Skills & Technologies</h2>
        <p className="section-subtitle">Technologies I work with on a daily basis</p>

        <div className="skills-categories">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category} className="glass-card skill-category">
              <h3 className="skill-category-title">
                <span style={{ marginRight: '0.5rem' }}>{categoryIcons[category] || '📌'}</span>
                {category}
              </h3>
              <div className="skill-items">
                {items.map(skill => (
                  <span key={skill.id} className="skill-item">
                    <span className={`skill-level ${skill.level}`} title={skill.level} />
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
