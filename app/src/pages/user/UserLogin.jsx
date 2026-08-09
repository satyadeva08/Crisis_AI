import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './UserLogin.css';

export default function UserLogin() {
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
      
      // Auto-switch to create account if user not found or invalid credentials
      if (!success) {
        // We can check the error message in the context or just switch automatically
        // Let's just switch to signup mode
        setIsLogin(false);
      }
    } else {
      success = await signup(email, password, name, 'citizen');
    }
    
    if (success) {
      // Navigate to home page as requested
      navigate('/');
    }
  }

  return (
    <div className="user-login-page">
      <div className="user-login-card animate-fade-in-up">
        {/* Brand */}
        <div className="user-login-brand">
          <div className="user-login-brand-icon">
            <Shield size={22} />
          </div>
          <h1 className="user-login-brand-title">Citizen Portal</h1>
          <p className="user-login-brand-subtitle">
            Log in to automatically link reports to your account
          </p>
        </div>

        {/* Login form */}
        <form className="user-login-form" onSubmit={handleSubmit}>
          {error && (
            <div className="user-login-error">
              {error}
            </div>
          )}

          {!isLogin && (
            <div className="user-login-field animate-fade-in">
              <label className="user-login-label" htmlFor="user-login-name">
                Full Name
              </label>
              <input
                id="user-login-name"
                type="text"
                className="user-login-input"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required={!isLogin}
              />
            </div>
          )}

          <div className="user-login-field animate-fade-in">
            <label className="user-login-label" htmlFor="user-login-email">
              Email Address
            </label>
            <input
              id="user-login-email"
              type="email"
              className="user-login-input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="user-login-field">
            <label className="user-login-label" htmlFor="user-login-password">
              Password
            </label>
            <div className="user-login-password-wrapper">
              <input
                id="user-login-password"
                type={showPassword ? 'text' : 'password'}
                className="user-login-input"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="user-login-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="user-login-submit"
            disabled={isLoading}
          >
            {isLoading ? (isLogin ? 'Signing in…' : 'Creating account…') : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
          
          <div className="user-login-footer">
            <p className="user-login-footer-text">
              {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
              <button 
                type="button" 
                className="user-login-footer-link"
                onClick={() => {
                  setIsLogin(!isLogin);
                  clearError();
                }}
              >
                {isLogin ? "Create one" : "Sign in"}
              </button>
            </p>
          </div>
          
          <div className="user-login-divider">
            <span>or</span>
          </div>
          
          <button 
            type="button" 
            className="user-login-guest-btn"
            onClick={() => navigate('/report')}
          >
            <User size={16} /> Continue as Guest <ArrowRight size={16} style={{marginLeft: 'auto'}} />
          </button>

        </form>
      </div>
    </div>
  );
}
