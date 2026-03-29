import { useState, useEffect } from 'react';
import api from '../../api/client';

// Generic CRUD manager component used across all admin sections
export default function CrudManager({
  title,
  fetchFn,
  createFn,
  updateFn,
  deleteFn,
  columns, // [{ key, label, render? }]
  formFields, // [{ key, label, type, required?, options?, placeholder? }]
  emptyMessage,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchFn();
      setItems(res.data || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditingItem(null);
    const initial = {};
    formFields.forEach(f => { initial[f.key] = f.defaultValue || ''; });
    setFormData(initial);
    setError('');
    setShowModal(true);
  };

  const openEdit = (item) => {
    setEditingItem(item);
    const data = {};
    formFields.forEach(f => {
      let val = item[f.key];
      // Parse JSON arrays for display
      if (f.type === 'tags' && typeof val === 'string') {
        try { val = JSON.parse(val).join(', '); } catch { val = val; }
      }
      data[f.key] = val ?? '';
    });
    setFormData(data);
    setError('');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const submitData = { ...formData };

      // Convert comma-separated tags back to JSON arrays
      formFields.forEach(f => {
        if (f.type === 'tags' && typeof submitData[f.key] === 'string') {
          submitData[f.key] = submitData[f.key]
            .split(',')
            .map(s => s.trim())
            .filter(Boolean);
        }
        if (f.type === 'number' && submitData[f.key] !== '') {
          submitData[f.key] = Number(submitData[f.key]);
        }
        if (f.type === 'checkbox') {
          submitData[f.key] = submitData[f.key] ? 1 : 0;
        }
      });

      if (editingItem) {
        await updateFn(editingItem.id, submitData);
      } else {
        await createFn(submitData);
      }

      setShowModal(false);
      load();
    } catch (err) {
      setError(err.message || 'Failed to save');
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this item?')) return;
    try {
      await deleteFn(id);
      load();
    } catch (err) {
      alert(err.message || 'Failed to delete');
    }
  };

  const renderField = (field) => {
    const value = formData[field.key] ?? '';

    switch (field.type) {
      case 'textarea':
        return (
          <textarea className="form-textarea" rows={field.rows || 4}
            value={value} onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
            placeholder={field.placeholder} required={field.required} />
        );
      case 'select':
        return (
          <select className="form-select" value={value}
            onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
            required={field.required}>
            <option value="">Select...</option>
            {(field.options || []).map(opt => (
              <option key={opt.value || opt} value={opt.value || opt}>
                {opt.label || opt}
              </option>
            ))}
          </select>
        );
      case 'checkbox':
        return (
          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', cursor: 'pointer' }}>
            <input type="checkbox" checked={!!value}
              onChange={e => setFormData({ ...formData, [field.key]: e.target.checked })} />
            {field.checkboxLabel || field.label}
          </label>
        );
      case 'tags':
        return (
          <input className="form-input" type="text" value={value}
            onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
            placeholder={field.placeholder || 'Tag1, Tag2, Tag3'} />
        );
      case 'number':
        return (
          <input className="form-input" type="number" value={value}
            onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
            placeholder={field.placeholder} required={field.required} />
        );
      default:
        return (
          <input className="form-input" type={field.type || 'text'} value={value}
            onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
            placeholder={field.placeholder} required={field.required} />
        );
    }
  };

  return (
    <div>
      <div className="admin-header">
        <h1 className="admin-title">{title}</h1>
        {createFn && (
          <button className="btn btn-primary" onClick={openCreate}>
            + Add New
          </button>
        )}
      </div>

      {loading ? (
        <div className="glass-card-static" style={{ padding: 'var(--space-xl)' }}>
          {[1, 2, 3].map(i => (
            <div key={i} className="skeleton" style={{ height: 48, marginBottom: 8, borderRadius: 8 }} />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="glass-card-static" style={{ padding: 'var(--space-3xl)', textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--text-lg)' }}>
            {emptyMessage || 'No items yet. Click "Add New" to create one.'}
          </p>
        </div>
      ) : (
        <div className="glass-card-static" style={{ overflow: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                {columns.map(col => <th key={col.key}>{col.label}</th>)}
                <th style={{ width: 120 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  {columns.map(col => (
                    <td key={col.key}>
                      {col.render ? col.render(item[col.key], item) : (item[col.key] ?? '—')}
                    </td>
                  ))}
                  <td>
                    <div style={{ display: 'flex', gap: 'var(--space-xs)' }}>
                      {updateFn && (
                        <button className="btn btn-sm btn-secondary" onClick={() => openEdit(item)}>
                          ✏️
                        </button>
                      )}
                      {deleteFn && (
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.id)}>
                          🗑️
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}>
          <div className="modal-content">
            <div className="modal-header">
              <h2>{editingItem ? 'Edit' : 'Add New'} {title.replace(/s$/, '')}</h2>
              <button className="btn btn-icon btn-secondary" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                {error && (
                  <div style={{ padding: 'var(--space-md)', borderRadius: 'var(--radius-md)', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: 'var(--error)', marginBottom: 'var(--space-lg)', fontSize: 'var(--text-sm)' }}>
                    {error}
                  </div>
                )}
                {formFields.map(field => (
                  <div key={field.key} className="form-group">
                    {field.type !== 'checkbox' && <label className="form-label">{field.label}</label>}
                    {renderField(field)}
                  </div>
                ))}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
