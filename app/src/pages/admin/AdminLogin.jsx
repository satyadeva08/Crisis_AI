import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Eye, EyeOff } from 'lucide-react';
import './Admin.css';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    // Hardcoded check for superadmin as requested
    setTimeout(() => {
      if (email === 'superadmin@crisisai.com' && password === 'admin123') {
        localStorage.setItem('admin_token', 'true');
        navigate('/admin/dashboard');
      } else {
        setError('Invalid admin credentials.');
        setIsLoading(false);
      }
    }, 600);
  }

  return (
    <div className="admin-page">
      <div className="admin-card animate-fade-in-up">
        <div className="admin-brand">
          <div className="admin-brand-icon">
            <Settings size={22} />
          </div>
          <h1 className="admin-brand-title">Super Admin Portal</h1>
          <p className="admin-brand-subtitle">System configuration and access control</p>
        </div>

        <form className="admin-form" onSubmit={handleSubmit}>
          {error && <div className="admin-error">{error}</div>}

          <div className="admin-field animate-fade-in">
            <label className="admin-label" htmlFor="admin-email">Admin Email</label>
            <input
              id="admin-email"
              type="email"
              className="admin-input"
              placeholder="superadmin@crisisai.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="admin-field">
            <label className="admin-label" htmlFor="admin-password">Password</label>
            <div className="admin-password-wrapper">
              <input
                id="admin-password"
                type={showPassword ? 'text' : 'password'}
                className="admin-input"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="admin-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" className="admin-submit" disabled={isLoading}>
            {isLoading ? 'Authenticating...' : 'Log In as Admin'}
          </button>
        </form>
      </div>
    </div>
  );
}
