import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

const initialState = {
  user: null,
  token: null, // Don't initialize with localStorage here
  isAuthenticated: false,
  loading: true,
  error: null
};

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, loading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case 'AUTH_FAIL':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };
    case 'INIT_AUTH_FAIL':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'AUTH_CHECK_COMPLETE':
      return { ...state, loading: false };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Set up axios defaults - base URL should always be set
  useEffect(() => {
    // Set base URL for all API calls - using proxy from package.json
    axios.defaults.baseURL = '';
  }, []);

  // Initialize token from localStorage and check auth on mount
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('token');
      
      if (savedToken) {
        // Set the token first
        axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
        
        try {
          // Verify the token is still valid
          const response = await axios.get('/api/auth/me');
          if (response.data.success) {
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: { user: response.data.user, token: savedToken }
            });
          } else {
            // Token is invalid, remove it
            localStorage.removeItem('token');
            delete axios.defaults.headers.common['Authorization'];
            dispatch({ type: 'INIT_AUTH_FAIL', payload: 'Token invalid' });
          }
        } catch (error) {
          // Token verification failed, remove it
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
          dispatch({ type: 'INIT_AUTH_FAIL', payload: 'Authentication failed' });
        }
      } else {
        dispatch({ type: 'INIT_AUTH_FAIL', payload: null });
      }
    };

    initializeAuth();
  }, []);

  // Set up authorization headers when token changes
  useEffect(() => {
    if (state.token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
      localStorage.setItem('token', state.token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
    }
  }, [state.token]);

  const login = async (email, password) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      if (response.data.success) {
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: response.data
        });
        return { success: true, user: response.data.user };
      } else {
        dispatch({ type: 'AUTH_FAIL', payload: response.data.message });
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed';
      dispatch({ type: 'AUTH_FAIL', payload: message });
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'AUTH_START' });
    try {
      const response = await axios.post('/api/auth/register', userData);
      if (response.data.success) {
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: response.data
        });
        return { success: true };
      } else {
        dispatch({ type: 'AUTH_FAIL', payload: response.data.message });
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      dispatch({ type: 'AUTH_FAIL', payload: message });
      return { success: false, message };
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (userData) => {
    dispatch({ type: 'UPDATE_USER', payload: userData });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
