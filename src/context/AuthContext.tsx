import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types/civic';
import { dataService } from '../services/dataService';

interface StoredAccount extends User {
  passwordHash: string;
}

interface AuthContextValue {
  user: User | null;
  isGuest: boolean;
  authMode: 'demo-local' | 'firebase';
  login: (
    identifier: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<{ success: boolean; error?: string; user?: User }>;
  signup: (
    name: string,
    email: string,
    phone: string,
    password: string
  ) => Promise<{ success: boolean; error?: string; user?: User }>;
  continueAsGuest: () => void;
  logout: () => void;
  updateProfile: (updates: {
    name: string;
    email: string;
    phone?: string;
  }) => Promise<{ success: boolean; error?: string }>;
}

const ACCOUNTS_KEY = 'civicguide_accounts_v1';
const SESSION_KEY = 'civicguide_active_session_v1';
const GUEST_FLAG_KEY = 'civicguide_guest_mode_v1';
const LOGGED_OUT_FLAG_KEY = 'civicguide_explicit_logout_v1';

const DEFAULT_ACCOUNTS: StoredAccount[] = [
  {
    id: 'usr-admin-demo',
    name: 'Arundhati Sen (District Civic Administrator)',
    email: 'admin@civicguide.demo',
    phone: '9999900000',
    role: 'admin',
    createdAt: '2026-01-10T09:00:00.000Z',
    passwordHash: 'Admin@123',
  },
  {
    id: 'usr-citizen-demo',
    name: 'Rajesh Sharma',
    email: 'citizen@civicguide.demo',
    phone: '9876543210',
    role: 'citizen',
    createdAt: '2026-02-15T10:30:00.000Z',
    passwordHash: 'Citizen@123',
  },
];

function getStoredAccounts(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(DEFAULT_ACCOUNTS));
      return DEFAULT_ACCOUNTS;
    }
    const parsed = JSON.parse(raw) as StoredAccount[];
    // Ensure default accounts always exist
    const existingEmails = new Set(parsed.map((a) => a.email.toLowerCase()));
    const merged = [...parsed];
    for (const def of DEFAULT_ACCOUNTS) {
      if (!existingEmails.has(def.email.toLowerCase())) {
        merged.push(def);
      }
    }
    return merged;
  } catch {
    return DEFAULT_ACCOUNTS;
  }
}

function saveStoredAccounts(accounts: StoredAccount[]): void {
  try {
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  } catch (err) {
    console.warn('Could not save accounts:', err);
  }
}

function seedInitialUserActivityIfEmpty(userId: string): void {
  const existingSaved = dataService.getSavedServices(userId);
  const existingHistory = dataService.getSearchHistory(userId);
  if (existingSaved.length === 0 && existingHistory.length === 0) {
    dataService.toggleSaveService(
      userId,
      'srv-ddo-signature',
      'Bring duplicate Form TR-22 and employee ID to Counter 4, 2nd Floor.'
    );
    dataService.toggleSaveService(
      userId,
      'srv-income-certificate',
      'For scholarship renewal application at Collectorate Counter 7.'
    );
    dataService.addSearchHistory(
      userId,
      'I need a DDO signature',
      2,
      'srv-ddo-signature',
      'DDO Signature & Bill Authorization'
    );
    dataService.addSearchHistory(
      userId,
      'Where do I apply for an income certificate?',
      2,
      'srv-income-certificate',
      'Income Certificate Issuance'
    );
  }
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved =
        localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
      if (saved) {
        return JSON.parse(saved) as User;
      }
      const explicitLogout = localStorage.getItem(LOGGED_OUT_FLAG_KEY) === 'true';
      const guestFlag = localStorage.getItem(GUEST_FLAG_KEY) === 'true';
      if (!explicitLogout && !guestFlag) {
        const defaultCitizen: User = {
          id: DEFAULT_ACCOUNTS[1].id,
          name: DEFAULT_ACCOUNTS[1].name,
          email: DEFAULT_ACCOUNTS[1].email,
          phone: DEFAULT_ACCOUNTS[1].phone,
          role: DEFAULT_ACCOUNTS[1].role,
          createdAt: DEFAULT_ACCOUNTS[1].createdAt,
        };
        localStorage.setItem(SESSION_KEY, JSON.stringify(defaultCitizen));
        return defaultCitizen;
      }
      return null;
    } catch {
      return null;
    }
  });

  const [isGuest, setIsGuest] = useState<boolean>(() => {
    try {
      return localStorage.getItem(GUEST_FLAG_KEY) === 'true';
    } catch {
      return false;
    }
  });

  const hasFirebaseConfig = Boolean(
    import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID
  );

  useEffect(() => {
    // Ensure seed accounts exist on boot
    getStoredAccounts();
  }, []);

  const login = async (
    identifier: string,
    password: string,
    rememberMe = true
  ): Promise<{ success: boolean; error?: string; user?: User }> => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPhone = identifier.replace(/\D/g, '');

    if (!cleanId) {
      return {
        success: false,
        error: 'Please enter your email address or phone number.',
      };
    }
    if (!password) {
      return {
        success: false,
        error: 'Please enter your password.',
      };
    }

    const accounts = getStoredAccounts();
    const matched = accounts.find(
      (acc) =>
        acc.email.toLowerCase() === cleanId ||
        (cleanPhone.length >= 10 &&
          acc.phone &&
          acc.phone.replace(/\D/g, '').endsWith(cleanPhone.slice(-10)))
    );

    if (!matched) {
      return {
        success: false,
        error:
          'We could not find an account matching that email or phone number. Please check your entry or use one of the demo accounts below.',
      };
    }

    // Allow exact password or friendly lowercase demo shorthand
    const validPassword =
      matched.passwordHash === password ||
      (matched.email === 'admin@civicguide.demo' &&
        (password === 'Admin@123' || password === 'admin123')) ||
      (matched.email === 'citizen@civicguide.demo' &&
        (password === 'Citizen@123' || password === 'citizen123'));

    if (!validPassword) {
      return {
        success: false,
        error:
          'Incorrect password. Please double-check your password or click "Show password" to verify.',
      };
    }

    const sessionUser: User = {
      id: matched.id,
      name: matched.name,
      email: matched.email,
      phone: matched.phone,
      role: matched.role,
      createdAt: matched.createdAt,
    };

    seedInitialUserActivityIfEmpty(sessionUser.id);

    setUser(sessionUser);
    setIsGuest(false);
    try {
      localStorage.removeItem(GUEST_FLAG_KEY);
      localStorage.removeItem(LOGGED_OUT_FLAG_KEY);
      if (rememberMe) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
      } else {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
      }
    } catch {
      // ignore storage quota errors
    }

    return { success: true, user: sessionUser };
  };

  const signup = async (
    name: string,
    email: string,
    phone: string,
    password: string
  ): Promise<{ success: boolean; error?: string; user?: User }> => {
    const cleanName = name.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim();

    if (cleanName.length < 2) {
      return { success: false, error: 'Please enter your full name (at least 2 characters).' };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }
    if (password.length < 6) {
      return {
        success: false,
        error: 'Password must be at least 6 characters long.',
      };
    }

    const accounts = getStoredAccounts();
    if (accounts.some((acc) => acc.email.toLowerCase() === cleanEmail)) {
      return {
        success: false,
        error: 'An account with this email already exists. Please sign in instead.',
      };
    }

    const newAccount: StoredAccount = {
      id: `usr-${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      phone: cleanPhone || undefined,
      role: 'citizen',
      createdAt: new Date().toISOString(),
      passwordHash: password,
    };

    saveStoredAccounts([...accounts, newAccount]);

    const sessionUser: User = {
      id: newAccount.id,
      name: newAccount.name,
      email: newAccount.email,
      phone: newAccount.phone,
      role: newAccount.role,
      createdAt: newAccount.createdAt,
    };

    setUser(sessionUser);
    setIsGuest(false);
    try {
      localStorage.removeItem(GUEST_FLAG_KEY);
      localStorage.removeItem(LOGGED_OUT_FLAG_KEY);
      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionUser));
    } catch {
      // ignore
    }

    return { success: true, user: sessionUser };
  };

  const continueAsGuest = () => {
    setUser(null);
    setIsGuest(true);
    try {
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_KEY);
      localStorage.setItem(GUEST_FLAG_KEY, 'true');
    } catch {
      // ignore
    }
  };

  const logout = () => {
    setUser(null);
    setIsGuest(false);
    try {
      localStorage.removeItem(SESSION_KEY);
      sessionStorage.removeItem(SESSION_KEY);
      localStorage.removeItem(GUEST_FLAG_KEY);
      localStorage.setItem(LOGGED_OUT_FLAG_KEY, 'true');
    } catch {
      // ignore
    }
  };

  const updateProfile = async (updates: {
    name: string;
    email: string;
    phone?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'Not signed in.' };
    const cleanName = updates.name.trim();
    const cleanEmail = updates.email.trim().toLowerCase();
    if (cleanName.length < 2) {
      return { success: false, error: 'Name must be at least 2 characters.' };
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return { success: false, error: 'Please enter a valid email address.' };
    }

    const accounts = getStoredAccounts();
    const updatedAccounts = accounts.map((acc) =>
      acc.id === user.id
        ? {
            ...acc,
            name: cleanName,
            email: cleanEmail,
            phone: updates.phone?.trim() || undefined,
          }
        : acc
    );
    saveStoredAccounts(updatedAccounts);

    const updatedUser: User = {
      ...user,
      name: cleanName,
      email: cleanEmail,
      phone: updates.phone?.trim() || undefined,
    };
    setUser(updatedUser);
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser));
    } catch {
      // ignore
    }
    return { success: true };
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isGuest,
        authMode: hasFirebaseConfig ? 'firebase' : 'demo-local',
        login,
        signup,
        continueAsGuest,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
