import api from '../../../api/client';
import CrudManager from '../CrudManager';

export default function ExperienceManager() {
  return (
    <CrudManager
      title="Experience"
      fetchFn={() => api.getExperience()}
      createFn={(data) => api.createExperience(data)}
      updateFn={(id, data) => api.updateExperience(id, data)}
      deleteFn={(id) => api.deleteExperience(id)}
      columns={[
        { key: 'company', label: 'Company' },
        { key: 'role', label: 'Role' },
        { key: 'start_date', label: 'Start' },
        { key: 'end_date', label: 'End', render: (v, item) => item.is_current ? '✅ Present' : (v || '—') },
        { key: 'sort_order', label: 'Order' },
      ]}
      formFields={[
        { key: 'company', label: 'Company Name', required: true, placeholder: 'Envobyte Ltd.' },
        { key: 'role', label: 'Role / Position', required: true, placeholder: 'Software Engineer' },
        { key: 'start_date', label: 'Start Date', required: true, placeholder: '2025-01' },
        { key: 'end_date', label: 'End Date', placeholder: '2025-12 (leave empty if current)' },
        { key: 'is_current', label: 'Currently Working Here', type: 'checkbox', checkboxLabel: 'I currently work here' },
        { key: 'description', label: 'Description', type: 'textarea', rows: 4, placeholder: 'Key responsibilities and achievements...' },
        { key: 'tech_stack', label: 'Tech Stack (comma separated)', type: 'tags', placeholder: 'Android, Kotlin, Firebase' },
        { key: 'sort_order', label: 'Sort Order', type: 'number', defaultValue: 0 },
      ]}
    />
  );
}
