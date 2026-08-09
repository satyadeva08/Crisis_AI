import { createContext, useContext, useReducer, useCallback } from 'react';
import { authService } from '../services/auth';

const AuthContext = createContext(null);

const initialState = {
  user: authService.getUser(),
  isAuthenticated: authService.isAuthenticated(),
  isLoading: false,
  error: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, isLoading: true, error: null };
    case 'LOGIN_SUCCESS':
      return { ...state, isLoading: false, user: action.payload, isAuthenticated: true, error: null };
    case 'LOGIN_ERROR':
      return { ...state, isLoading: false, error: action.payload, isAuthenticated: false };
    case 'LOGOUT':
      return { ...state, user: null, isAuthenticated: false, error: null };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = useCallback(async (email, password) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const { user } = await authService.login(email, password);
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      return true;
    } catch (err) {
      dispatch({ type: 'LOGIN_ERROR', payload: err.message });
      return false;
    }
  }, []);

  const signup = useCallback(async (email, password, name, role = 'citizen') => {
    dispatch({ type: 'LOGIN_START' });
    try {
      await authService.signup(email, password, name, role);
      // Automatically log them in after sign up
      const { user } = await authService.login(email, password);
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      return true;
    } catch (err) {
      dispatch({ type: 'LOGIN_ERROR', payload: err.message });
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    dispatch({ type: 'LOGOUT' });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, signup, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
