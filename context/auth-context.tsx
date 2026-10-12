'use client';

import React, { createContext, useContext, useState } from 'react';
import { User } from '@/types';
import { MOCK_USERS } from '@/lib/mock-data';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  users: User[];
  login: (email: string, password: string) => Promise<{ success: boolean; user?: User; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  createUserByAdmin: (user: Omit<User, 'id' | 'createdAt'>) => Promise<void>;
  deleteUserByAdmin: (userId: string) => Promise<void>;
  toggleUserStatus: (userId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>(() => {
    if (typeof window === 'undefined') return MOCK_USERS;
    try {
      const savedUsers = localStorage.getItem('hospital_7a_all_users');
      if (savedUsers) {
        const parsed = JSON.parse(savedUsers);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return MOCK_USERS;
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const savedSession = localStorage.getItem('hospital_7a_current_session');
      if (savedSession) {
        const parsedUser = JSON.parse(savedSession);
        if (parsedUser && parsedUser.id) return parsedUser;
      }
    } catch {
      // ignore
    }
    return null;
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    try {
      const savedSession = localStorage.getItem('hospital_7a_current_session');
      if (savedSession) {
        const parsedUser = JSON.parse(savedSession);
        return Boolean(parsedUser && parsedUser.id);
      }
    } catch {
      // ignore
    }
    return false;
  });

  const saveUsersList = (newUsers: User[]) => {
    setUsers(newUsers);
    localStorage.setItem('hospital_7a_all_users', JSON.stringify(newUsers));
  };

  const login = async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    const user = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (!user) {
      return { success: false, error: 'Email không tồn tại trong hệ thống.' };
    }
    if (user.password && user.password !== cleanPass) {
      return { success: false, error: 'Mật khẩu không chính xác.' };
    }
    if (user.status === 'suspended') {
      return { success: false, error: 'Tài khoản của bạn đang bị tạm khóa.' };
    }

    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('hospital_7a_current_session', JSON.stringify(user));
    return { success: true, user };
  };

  const register = async (name: string, email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanPass = password.trim();

    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'Email này đã được đăng ký tài khoản.' };
    }

    const newUser: User = {
      id: `patient-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      password: cleanPass,
      role: 'patient',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
      status: 'active',
      createdAt: new Date().toISOString(),
    };

    saveUsersList([...users, newUser]);
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    localStorage.setItem('hospital_7a_current_session', JSON.stringify(newUser));

    return { success: true };
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('hospital_7a_current_session');
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);
    localStorage.setItem('hospital_7a_current_session', JSON.stringify(updated));

    const updatedList = users.map((u) => (u.id === currentUser.id ? { ...u, ...data } : u));
    saveUsersList(updatedList);
  };

  const createUserByAdmin = async (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: 'active',
      avatar: userData.avatar || (userData.role === 'staff' 
        ? 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=200&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80'),
    };
    saveUsersList([...users, newUser]);
  };

  const deleteUserByAdmin = async (userId: string) => {
    saveUsersList(users.filter((u) => u.id !== userId));
  };

  const toggleUserStatus = async (userId: string) => {
    const target = users.find((u) => u.id === userId);
    const newStatus = target?.status === 'suspended' ? 'active' : 'suspended';
    saveUsersList(
      users.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
    );
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated,
        users,
        login,
        register,
        logout,
        updateProfile,
        createUserByAdmin,
        deleteUserByAdmin,
        toggleUserStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
