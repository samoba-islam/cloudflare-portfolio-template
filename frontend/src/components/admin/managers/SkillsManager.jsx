import api from '../../../api/client';
import CrudManager from '../CrudManager';

export default function SkillsManager() {
  return (
    <CrudManager
      title="Skills"
      fetchFn={() => api.getSkills()}
      createFn={(data) => api.createSkill(data)}
      updateFn={(id, data) => api.updateSkill(id, data)}
      deleteFn={(id) => api.deleteSkill(id)}
      columns={[
        { key: 'name', label: 'Skill' },
        { key: 'category', label: 'Category' },
        { key: 'level', label: 'Level', render: v => {
          const colors = { expert: 'var(--success)', intermediate: 'var(--accent)', beginner: 'var(--warning)' };
          return <span style={{ color: colors[v] || 'var(--text-secondary)', fontWeight: 600 }}>{v}</span>;
        }},
        { key: 'sort_order', label: 'Order' },
      ]}
      formFields={[
        { key: 'name', label: 'Skill Name', required: true, placeholder: 'React.js' },
        { key: 'category', label: 'Category', required: true, type: 'select', options: [
          'Languages', 'Frameworks', 'Databases', 'DevOps & Tools', 'Creative'
        ]},
        { key: 'level', label: 'Skill Level', type: 'select', options: [
          { value: 'beginner', label: 'Beginner' },
          { value: 'intermediate', label: 'Intermediate' },
          { value: 'expert', label: 'Expert' },
        ]},
        { key: 'icon_url', label: 'Icon URL (optional)', placeholder: 'https://...' },
        { key: 'sort_order', label: 'Sort Order', type: 'number', defaultValue: 0 },
      ]}
    />
  );
}
