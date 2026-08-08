import { api } from './api';

const USE_MOCK = true;
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock credentials
const MOCK_CREDENTIALS = {
  email: 'admin@disaster-response.gov',
  password: 'admin123',
};

export const authService = {
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
    const response = await api.post('/auth/login', { email, password });
    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('auth_user', JSON.stringify(response.user));
    return response;
  },

  logout() {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  },

  getUser() {
    const user = localStorage.getItem('auth_user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('auth_token');
  },
};
