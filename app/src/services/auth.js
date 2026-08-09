import { supabase } from './supabase';

/**
 * Auth service — handles authority login/logout.
 *
 * Currently uses mock credentials for the hackathon demo.
 * When Supabase Auth is configured with real users, set USE_MOCK = false
 * and it will use supabase.auth.signInWithPassword().
 */

const USE_MOCK = false;
const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms));

// Mock credentials for demo
const MOCK_CREDENTIALS = {
  email: 'admin@disaster-response.gov',
  password: 'admin123',
};

export const authService = {
  /**
   * Log in with email and password.
   */
  async login(email, password) {
    if (USE_MOCK) {
      await delay(800);

      if (email === MOCK_CREDENTIALS.email && password === MOCK_CREDENTIALS.password) {
        const mockToken = 'mock_jwt_token_' + Date.now();
        const user = {
          id: 'USR-001',
          name: 'Command Officer',
          email: MOCK_CREDENTIALS.email,
          role: 'authority',
          department: 'National Disaster Response',
        };
        localStorage.setItem('auth_token', mockToken);
        localStorage.setItem('auth_user', JSON.stringify(user));
        return { token: mockToken, user };
      }

      throw new Error('Invalid email or password');
    }

    // Real Supabase Auth (activate when users are created in Supabase Dashboard)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw new Error(error.message);

    const user = {
      id: data.user.id,
      name: data.user.user_metadata?.name || 'User',
      email: data.user.email,
      role: data.user.user_metadata?.role || 'citizen',
    };

    localStorage.setItem('auth_token', data.session.access_token);
    localStorage.setItem('auth_user', JSON.stringify(user));
    return { token: data.session.access_token, user };
  },

  /**
   * Check if an email is authorized to be an authority
   */
  async checkEmailAuthorized(email) {
    if (USE_MOCK) return true;
    try {
      const { data, error } = await supabase
        .from('authorized_emails')
        .select('id')
        .eq('email', email)
        .single();
        
      if (error || !data) return false;
      return true;
    } catch (err) {
      return false;
    }
  },

  /**
   * Sign up a new user (authority or citizen).
   */
  async signup(email, password, name, role = 'citizen') {
    if (USE_MOCK) {
      throw new Error('Signup not supported in mock mode');
    }

    if (role === 'authority') {
      const isAuthorized = await this.checkEmailAuthorized(email);
      if (!isAuthorized) {
        throw new Error('This email is not authorized to create an Authority account.');
      }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name || 'User',
          role: role,
        }
      }
    });

    if (error) throw new Error(error.message);

    // If email confirmation is off, this will log them in immediately.
    // If it's on, they'll need to confirm email first (default Supabase behavior).
    return data;
  },

  /**
   * Log out the current user.
   */
  async logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');

    if (!USE_MOCK) {
      await supabase.auth.signOut();
    }
  },

  /**
   * Get the currently stored user.
   */
  getUser() {
    const user = localStorage.getItem('auth_user');
    return user ? JSON.parse(user) : null;
  },

  /**
   * Check if a user is currently authenticated.
   */
  isAuthenticated() {
    return !!localStorage.getItem('auth_token');
  },
};
