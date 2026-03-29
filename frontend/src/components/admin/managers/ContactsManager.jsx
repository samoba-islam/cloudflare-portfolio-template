import { useState, useEffect } from 'react';
import api from '../../../api/client';

export default function ContactsManager() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedContact, setSelectedContact] = useState(null);

  const load = () => {
    setLoading(true);
    api.getContacts()
      .then(res => setContacts(res.data?.contacts || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleMarkRead = async (id) => {
    try {
      await api.markContactRead(id);
      load();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this message?')) return;
    try {
      await api.deleteContact(id);
      if (selectedContact?.id === id) setSelectedContact(null);
      load();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1 className="admin-title">Contact Messages</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)' }}>
        Messages from visitors via the contact form.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-xl)' }}>
        <div className="glass-card-static" style={{ overflow: 'auto', maxHeight: '70vh' }}>
          {loading ? (
            <div style={{ padding: 'var(--space-xl)' }}>
              {[1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 60, marginBottom: 8 }} />)}
            </div>
          ) : contacts.length === 0 ? (
            <div style={{ padding: 'var(--space-3xl)', textAlign: 'center', color: 'var(--text-muted)' }}>
              📭 No messages yet
            </div>
          ) : (
            contacts.map(contact => (
              <div
                key={contact.id}
                onClick={() => {
                  setSelectedContact(contact);
                  if (!contact.is_read) handleMarkRead(contact.id);
                }}
                style={{
                  padding: 'var(--space-lg)',
                  borderBottom: '1px solid var(--border-glass)',
                  cursor: 'pointer',
                  background: selectedContact?.id === contact.id ? 'var(--bg-glass-hover)' : 'transparent',
                  transition: 'background 0.15s',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontWeight: contact.is_read ? 400 : 700, fontSize: 'var(--text-sm)' }}>
                    {!contact.is_read && '🔵 '}{contact.name}
                  </span>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                    {new Date(contact.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                  {contact.subject || contact.message.slice(0, 50) + '...'}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="glass-card-static" style={{ padding: 'var(--space-xl)' }}>
          {selectedContact ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-lg)' }}>
                <div>
                  <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>{selectedContact.name}</h3>
                  <a href={`mailto:${selectedContact.email}`} style={{ fontSize: 'var(--text-sm)', color: 'var(--accent)' }}>
                    {selectedContact.email}
                  </a>
                </div>
                <button className="btn btn-sm btn-danger" onClick={() => handleDelete(selectedContact.id)}>
                  🗑️ Delete
                </button>
              </div>
              {selectedContact.subject && (
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
                  <strong>Subject:</strong> {selectedContact.subject}
                </p>
              )}
              <p style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginBottom: 'var(--space-lg)' }}>
                {new Date(selectedContact.created_at).toLocaleString()}
              </p>
              <div style={{
                padding: 'var(--space-lg)', background: 'var(--bg-glass)', borderRadius: 'var(--radius-md)',
                lineHeight: 1.8, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap'
              }}>
                {selectedContact.message}
              </div>
              <div style={{ marginTop: 'var(--space-lg)' }}>
                <a href={`mailto:${selectedContact.email}?subject=Re: ${selectedContact.subject || 'Your Message'}`}
                   className="btn btn-primary">
                  ↩️ Reply via Email
                </a>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
              Select a message to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
