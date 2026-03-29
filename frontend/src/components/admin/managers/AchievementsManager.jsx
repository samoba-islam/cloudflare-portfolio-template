import api from '../../../api/client';
import CrudManager from '../CrudManager';

export default function AchievementsManager() {
  return (
    <CrudManager
      title="Achievements"
      fetchFn={() => api.getAchievements()}
      createFn={(data) => api.createAchievement(data)}
      updateFn={(id, data) => api.updateAchievement(id, data)}
      deleteFn={(id) => api.deleteAchievement(id)}
      columns={[
        { key: 'title', label: 'Title' },
        { key: 'issuer', label: 'Issuer' },
        { key: 'date', label: 'Date' },
        { key: 'sort_order', label: 'Order' },
      ]}
      formFields={[
        { key: 'title', label: 'Achievement Title', required: true, placeholder: 'AWS Certified Developer' },
        { key: 'description', label: 'Description', type: 'textarea', rows: 3 },
        { key: 'issuer', label: 'Issuer / Organization', placeholder: 'Amazon Web Services' },
        { key: 'date', label: 'Date', placeholder: '2024' },
        { key: 'certificate_url', label: 'Certificate URL', placeholder: 'https://...' },
        { key: 'sort_order', label: 'Sort Order', type: 'number', defaultValue: 0 },
      ]}
    />
  );
}
