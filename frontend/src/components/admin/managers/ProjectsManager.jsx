import api from '../../../api/client';
import CrudManager from '../CrudManager';

export default function ProjectsManager() {
  return (
    <CrudManager
      title="Projects"
      fetchFn={() => api.getProjects()}
      createFn={(data) => api.createProject(data)}
      updateFn={(id, data) => api.updateProject(id, data)}
      deleteFn={(id) => api.deleteProject(id)}
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'is_featured', label: 'Featured', render: v => v ? '⭐ Yes' : 'No' },
        { key: 'github_url', label: 'GitHub', render: v => v ? '✅' : '—' },
        { key: 'live_url', label: 'Live', render: v => v ? '✅' : '—' },
        { key: 'sort_order', label: 'Order' },
      ]}
      formFields={[
        { key: 'title', label: 'Project Title', required: true, placeholder: 'My Awesome Project' },
        { key: 'description', label: 'Description', type: 'textarea', rows: 4, placeholder: 'What does this project do?' },
        { key: 'tech_stack', label: 'Tech Stack (comma separated)', type: 'tags', placeholder: 'React, Node.js, PostgreSQL' },
        { key: 'github_url', label: 'GitHub URL', placeholder: 'https://github.com/...' },
        { key: 'live_url', label: 'Live Demo URL', placeholder: 'https://myproject.com' },
        { key: 'playstore_url', label: 'Play Store URL', placeholder: 'https://play.google.com/...' },
        { key: 'is_featured', label: 'Featured Project', type: 'checkbox', checkboxLabel: 'Show as featured' },
        { key: 'sort_order', label: 'Sort Order', type: 'number', defaultValue: 0 },
      ]}
    />
  );
}
