import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

/**
 * Authority login page.
 * Clean centered form card inspired by CashSwap's auth modal.
 *
 * Demo credentials:
 *   Email: admin@disaster-response.gov
 *   Password: admin123
 */
export default function Login() {
  const navigate = useNavigate();
  const { login, signup, isLoading, error, clearError } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    clearError();

    let success;
    if (isLogin) {
      success = await login(email, password);
    } else {
      success = await signup(email, password, name);
    }
    
    if (success) {
      navigate('/authority/dashboard');
    }
  }

  return (
    <div className="login-page">
      <div className="login-card animate-fade-in-up">
        {/* Brand */}
        <div className="login-brand">
          <div className="login-brand-icon">
            <Shield size={22} />
          </div>
          <h1 className="login-brand-title">Command Center</h1>
          <p className="login-brand-subtitle">
            Authority access to the emergency response dashboard
          </p>
        </div>

        {/* Login form */}
        <form className="login-form" onSubmit={handleSubmit}>
          {/* Error message */}
          {error && (
            <div className="login-error">
              {error}
            </div>
          )}

          {/* Name - only for signup */}
          {!isLogin && (
            <div className="login-field animate-fade-in">
              <label className="login-label" htmlFor="login-name">
                Full Name
              </label>
              <input
                id="login-name"
                type="text"
                className="login-input"
                placeholder="Officer Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
              />
            </div>
          )}

          {/* Email */}
          <div className="login-field animate-fade-in">
            <label className="login-label" htmlFor="login-email">
              Email Address
            </label>
            <input
              id="login-email"
              type="email"
              className="login-input"
              placeholder="admin@disaster-response.gov"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          {/* Password */}
          <div className="login-field">
            <label className="login-label" htmlFor="login-password">
              Password
            </label>
            <div className="login-password-wrapper">
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="login-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="login-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="login-submit"
            disabled={isLoading}
          >
            {isLoading ? (isLogin ? 'Signing in…' : 'Creating account…') : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
          
          {/* Toggle Mode */}
          <div className="login-footer">
            <p className="login-footer-text">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              <button 
                type="button" 
                className="login-footer-link"
                onClick={() => {
                  setIsLogin(!isLogin);
                  clearError();
                }}
              >
                {isLogin ? "Create one" : "Sign in"}
              </button>
            </p>
          </div>

        </form>
      </div>
    </div>
  );
}
