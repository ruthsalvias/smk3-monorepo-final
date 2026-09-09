import React, { createContext, useContext, useState, useEffect } from 'react';
import keycloak, { initKeycloak } from '../../../config/keycloak';

const AuthContext = createContext(null);

const extractKeycloakUser = () => {
  const parsed = keycloak.tokenParsed || {};
  const userData = {
    userId: parsed.sub || '', // Ambil UUID unik dari Keycloak
    username: parsed.preferred_username || parsed.email || parsed.sub || '',
    name: parsed.name || parsed.given_name || parsed.preferred_username || '',
    roles: Array.isArray(parsed.realm_access?.roles) ? parsed.realm_access.roles : [],
  };

  // SUNTIKKAN: Amankan data aktor ke localStorage agar bisa diakses secara global oleh Axios/API file
  if (keycloak.authenticated) {
    localStorage.setItem('userId', userData.userId);
    localStorage.setItem('username', userData.username);
    localStorage.setItem('roles', userData.roles.join(','));
  }

  return userData;
};

export const AuthProvider = ({ children }) => {
  const [isAuth, setIsAuth] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [token, setToken] = useState(null);
  const [user, setUser] = useState({ username: '', name: '', roles: [] });

  const clearAuthStorage = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    localStorage.removeItem('roles');
  };

  useEffect(() => {
    initKeycloak()
      .then((authenticated) => {
        setIsAuth(authenticated);
        setToken(keycloak.token);
        if (authenticated) {
          localStorage.setItem('token', keycloak.token);
          setUser(extractKeycloakUser());
        } else {
          clearAuthStorage();
        }
        setIsReady(true);
      })
      .catch(() => {
        clearAuthStorage();
        setIsReady(true);
      });

    keycloak.onAuthSuccess = () => {
      setIsAuth(true);
      setToken(keycloak.token);
      localStorage.setItem('token', keycloak.token);
      setUser(extractKeycloakUser());
    };

    keycloak.onAuthRefreshSuccess = () => {
      setToken(keycloak.token);
      localStorage.setItem('token', keycloak.token);
    };

    keycloak.onTokenExpired = () => {
      keycloak.updateToken(30)
        .then(() => {
          setToken(keycloak.token);
          localStorage.setItem('token', keycloak.token);
          setUser(extractKeycloakUser());
        })
        .catch(() => {
          setIsAuth(false);
          clearAuthStorage();
        });
    };
  }, []);

  const login = () => keycloak.login();
  const logout = () => {
    clearAuthStorage();
    keycloak.logout();
  };

  if (!isReady) return <div>Memuat Sistem...</div>;

  return (
    <AuthContext.Provider value={{ isAuth, login, logout, token, user, roles: user.roles }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);