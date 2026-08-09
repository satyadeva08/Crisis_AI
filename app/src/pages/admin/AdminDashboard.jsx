import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, LogOut, Plus, Trash2, Mail, ShieldCheck } from 'lucide-react';
import { supabase } from '../../services/supabase';
import './Admin.css';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [emails, setEmails] = useState([]);
  const [newEmail, setNewEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    // Basic protection
    if (!localStorage.getItem('admin_token')) {
      navigate('/admin/login');
      return;
    }
    fetchEmails();
  }, [navigate]);

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
      // Might fail if table doesn't exist yet (e.g. they didn't run SQL)
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
      setError(err.message || 'Failed to add email. Did you run the SQL setup?');
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

  function handleLogout() {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  }

  return (
    <div className="admin-dashboard-page">
      <nav className="admin-nav">
        <div className="admin-nav-brand">
          <Settings size={20} />
          <span>Super Admin</span>
        </div>
        <button className="admin-logout-btn" onClick={handleLogout}>
          <LogOut size={16} /> Logout
        </button>
      </nav>

      <main className="admin-main container-narrow">
        <div className="admin-header">
          <h1 className="admin-title">Authority Whitelist</h1>
          <p className="admin-subtitle">
            Manage the list of emails that are permitted to create Authority Officer accounts.
          </p>
        </div>

        <div className="admin-panel">
          <form className="admin-add-form" onSubmit={handleAddEmail}>
            <div className="admin-add-input-wrapper">
              <Mail size={18} className="admin-input-icon" />
              <input 
                type="email"
                placeholder="officer@disaster-response.gov"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="admin-add-btn">
              <Plus size={16} /> Authorize Email
            </button>
          </form>
          {error && <p className="admin-error-text">{error}</p>}
        </div>

        <div className="admin-list-container">
          <h2 className="admin-list-title">
            <ShieldCheck size={18} />
            Authorized Emails ({emails.length})
          </h2>
          
          {isLoading ? (
            <p className="admin-loading-text">Loading...</p>
          ) : emails.length === 0 ? (
            <div className="admin-empty-state">
              <p>No emails authorized yet. Anyone who attempts to sign up for an Authority account will be rejected.</p>
            </div>
          ) : (
            <ul className="admin-email-list">
              {emails.map((item) => (
                <li key={item.id} className="admin-email-item">
                  <div className="admin-email-info">
                    <span className="admin-email-text">{item.email}</span>
                    <span className="admin-email-date">
                      Added {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <button 
                    className="admin-revoke-btn"
                    onClick={() => handleRevoke(item.id)}
                    title="Revoke Access"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
}
