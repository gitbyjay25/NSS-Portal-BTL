import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

// Check localStorage immediately to prevent redirect flicker
const getInitialState = () => {
  const savedToken = localStorage.getItem('token');
  const savedUserRaw = localStorage.getItem('user');
  let savedUser = null;
  try {
    savedUser = savedUserRaw ? JSON.parse(savedUserRaw) : null;
  } catch (e) {
    localStorage.removeItem('user');
  }
  
  if (savedToken && savedUser) {
    return {
      user: savedUser,
      token: savedToken,
      isAuthenticated: true,
      loading: true, // Still loading to verify with backend
      error: null
    };
  }
  
  return {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true,
    error: null
  };
};

const initialState = getInitialState();

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
    const sleep = (ms) => new Promise(res => setTimeout(res, ms));
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('token');
      const savedUserRaw = localStorage.getItem('user');
      const savedUser = (() => { try { return savedUserRaw ? JSON.parse(savedUserRaw) : null; } catch(_) { return null; }})();
      
      if (savedToken) {
        // Setting  the token first
        axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;

        
        // Retry /me a few times before failing, to survive slow backend
        let attempt = 0;
        let success = false;
        while (attempt < 3 && !success) {
          try {
            // Verify the token is still valid
            const response = await axios.get('/api/auth/me');
            if (response.data.success) {
              const freshUser = response.data.user;
              localStorage.setItem('user', JSON.stringify(freshUser));
              dispatch({ type: 'AUTH_SUCCESS', payload: { user: freshUser, token: savedToken } });
              success = true;
              break;
            }
          } catch (error) {
            attempt += 1;
            if (attempt < 3) {
              await sleep(500 * attempt);
            }
          }
        }

        // If still not successful, mark fail
        if (!success) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
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
        // Persist token immediately to avoid losing auth on fast redirects/reloads
        const newToken = response.data.token;
        if (newToken) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
          localStorage.setItem('token', newToken);
        }
        if (response.data.user) {
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: response.data
        });
        return { success: true, user: response.data.user, token: newToken };
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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
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
