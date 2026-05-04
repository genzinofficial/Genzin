import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface MockUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
}

interface AuthContextType {
  user: MockUser | null;
  isAdmin: boolean;
  loading: boolean;
  login: (provider?: 'google' | 'facebook' | 'apple') => void;
  logout: () => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<MockUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('genzin_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setIsAdmin(parsedUser.email === 'genzin.official@gmail.com');
    }
    setLoading(false);
  }, []);

  const login = (provider: 'google' | 'facebook' | 'apple' = 'google') => {
    const mockUser: MockUser = {
      uid: `mock-${provider}-${Math.random().toString(36).substr(2, 9)}`,
      email: 'genzin.official@gmail.com',
      displayName: `Genzin ${provider.charAt(0).toUpperCase() + provider.slice(1)} User`,
      photoURL: `https://api.dicebear.com/7.x/avataaars/svg?seed=${provider}`,
      emailVerified: true
    };
    setUser(mockUser);
    setIsAdmin(true);
    localStorage.setItem('genzin_user', JSON.stringify(mockUser));
    setIsLoginModalOpen(false);
  };

  const logout = () => {
    setUser(null);
    setIsAdmin(false);
    localStorage.removeItem('genzin_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, logout, isLoginModalOpen, setIsLoginModalOpen }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
