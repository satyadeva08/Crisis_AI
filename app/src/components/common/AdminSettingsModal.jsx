import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Settings, Plus, Trash2, Mail, ShieldCheck, X } from 'lucide-react';
import { supabase } from '../../services/supabase';

export default function AdminSettingsModal({ isOpen, onClose }) {
  const [emails, setEmails] = useState([]);
  const [newEmail, setNewEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchEmails();
    }
  }, [isOpen]);

  async function fetchEmails() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('authorized_emails')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setEmails(data || []);
    } catch (err) {
      console.error("Failed to fetch emails", err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleAddEmail(e) {
    e.preventDefault();
    if (!newEmail.trim()) return;
    setError('');
    
    try {
      const { data, error: insertError } = await supabase
        .from('authorized_emails')
        .insert({ email: newEmail.trim().toLowerCase() })
        .select()
        .single();
        
      if (insertError) {
        if (insertError.code === '23505') throw new Error('Email is already authorized.');
        throw insertError;
      }
      
      setEmails([data, ...emails]);
      setNewEmail('');
    } catch (err) {
      setError(err.message || 'Failed to add email.');
    }
  }

  async function handleRevoke(id) {
    try {
      const { error } = await supabase
        .from('authorized_emails')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      setEmails(emails.filter(e => e.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
      backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', 
      alignItems: 'center', justifyContent: 'center', zIndex: 9999
    }}>
      <div className="modal-content animate-fade-in-up" style={{
        background: 'var(--color-bg-primary)', padding: 'var(--space-6)',
        borderRadius: 'var(--radius-xl)', width: '100%', maxWidth: '500px',
        position: 'relative', maxHeight: '90vh', overflowY: 'auto'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: '16px', right: '16px', 
          background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text-tertiary)'
        }}>
          <X size={20} />
        </button>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{
            width: '40px', height: '40px', background: 'var(--color-primary)', 
            borderRadius: '8px', display: 'flex', alignItems: 'center', 
            justifyContent: 'center', color: 'white'
          }}>
            <Settings size={20} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '18px' }}>Admin Settings</h2>
            <p style={{ margin: 0, fontSize: '14px', color: 'var(--color-text-secondary)' }}>Manage authority email whitelist</p>
          </div>
        </div>

        <form onSubmit={handleAddEmail} style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-tertiary)' }} />
            <input 
              type="email"
              placeholder="officer@disaster-response.gov"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '10px 12px 10px 36px', borderRadius: '8px', border: '1px solid var(--color-border-light)' }}
            />
          </div>
          <button type="submit" style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '0 16px',
            background: 'var(--color-primary)', color: 'white', border: 'none',
            borderRadius: '8px', cursor: 'pointer', fontWeight: 500
          }}>
            <Plus size={16} /> Add
          </button>
        </form>
        
        {error && <p style={{ color: '#ef4444', fontSize: '14px', marginTop: '-16px', marginBottom: '16px' }}>{error}</p>}

        <div>
          <h3 style={{ fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <ShieldCheck size={16} /> Authorized Emails ({emails.length})
          </h3>
          
          {isLoading ? (
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>Loading...</p>
          ) : emails.length === 0 ? (
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>No emails authorized yet.</p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, border: '1px solid var(--color-border-light)', borderRadius: '8px' }}>
              {emails.map((item, index) => (
                <li key={item.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '12px 16px', borderBottom: index === emails.length - 1 ? 'none' : '1px solid var(--color-border-light)'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '14px', fontWeight: 500 }}>{item.email}</span>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                      Added {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleRevoke(item.id)}
                    title="Revoke Access"
                    style={{
                      background: '#fee2e2', color: '#ef4444', border: 'none',
                      width: '32px', height: '32px', borderRadius: '6px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
