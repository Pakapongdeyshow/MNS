import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    const token = localStorage.getItem('mns_token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await api.getMe();
      setUser(data.user);
    } catch (err) {
      console.warn('Session expired or invalid, clearing token');
      localStorage.removeItem('mns_token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(identifier, password) {
    setError(null);
    try {
      const data = await api.login(identifier, password);
      localStorage.setItem('mns_token', data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.message || 'การเข้าสู่ระบบล้มเหลว');
      throw err;
    }
  }

  async function register(userData) {
    setError(null);
    try {
      setLoading(true);
      const data = await api.register(userData);
      localStorage.setItem('mns_token', data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.message || 'การลงทะเบียนล้มเหลว');
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function quickDemoLogin(identifier, password) {
    try {
      setLoading(true);
      const data = await api.login(identifier, password);
      localStorage.setItem('mns_token', data.token);
      setUser(data.user);
      setError(null);
      return data.user;
    } catch (err) {
      console.error('Quick demo login error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }

  async function loginWithGoogle(credentialData) {
    setError(null);
    try {
      setLoading(true);
      const data = await api.loginWithGoogle(credentialData);
      localStorage.setItem('mns_token', data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      setError(err.message || 'การเข้าสู่ระบบด้วย Google ล้มเหลว');
      throw err;
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    localStorage.removeItem('mns_token');
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, login, register, loginWithGoogle, logout, quickDemoLogin, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
