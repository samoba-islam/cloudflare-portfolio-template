import api from '../../../api/client';
import CrudManager from '../CrudManager';

export default function EducationManager() {
  return (
    <CrudManager
      title="Education"
      fetchFn={() => api.getEducation()}
      createFn={(data) => api.createEducation(data)}
      updateFn={(id, data) => api.updateEducation(id, data)}
      deleteFn={(id) => api.deleteEducation(id)}
      columns={[
        { key: 'institution', label: 'Institution' },
        { key: 'degree', label: 'Degree' },
        { key: 'field', label: 'Field' },
        { key: 'result', label: 'Result' },
        { key: 'sort_order', label: 'Order' },
      ]}
      formFields={[
        { key: 'institution', label: 'Institution', required: true, placeholder: 'University Name' },
        { key: 'degree', label: 'Degree', required: true, placeholder: 'BSc in Computer Science' },
        { key: 'field', label: 'Field of Study', placeholder: 'Computer Science' },
        { key: 'start_date', label: 'Start Date', required: true, placeholder: '2016-01' },
        { key: 'end_date', label: 'End Date', placeholder: '2020-12' },
        { key: 'is_current', label: 'Currently Studying', type: 'checkbox', checkboxLabel: 'I am currently studying here' },
        { key: 'result', label: 'Result / GPA', placeholder: 'CGPA: 3.53/4.00' },
        { key: 'description', label: 'Description', type: 'textarea', rows: 3 },
        { key: 'sort_order', label: 'Sort Order', type: 'number', defaultValue: 0 },
      ]}
    />
  );
}
